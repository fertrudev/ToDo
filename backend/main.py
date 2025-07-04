from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from database import database, todos, users
from contextlib import asynccontextmanager
from auth_utils import hash_password, verify_password, create_access_token
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import os

origins = [
    "http://localhost:3000",
    os.getenv("FRONTEND_URL")                 
]

print(f"DEBUG: FRONTEND_URL configurada para CORS: {os.getenv('FRONTEND_URL')}")  

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()

app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class TodoBase(BaseModel):
    title: str
    completed: bool = False

class Todo(TodoBase):
    id: int

class User(BaseModel):
    username: str
    password: str

def get_current_user(token: str = Depends(oauth2_scheme)):
    from auth_utils import SECRET_KEY, ALGORITHM
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid auth")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid auth")

@app.post("/register")
async def register(user: User):
    query = users.select().where(users.c.username == user.username)
    if await database.fetch_one(query):
        raise HTTPException(400, "Username already exists")
    hashed_pw = hash_password(user.password)
    query = users.insert().values(username=user.username, password=hashed_pw)
    user_id = await database.execute(query)
    return {"id": user_id, "username": user.username}

@app.post("/login")
async def login(user: User):
    query = users.select().where(users.c.username == user.username)
    user_row = await database.fetch_one(query)
    if not user_row or not verify_password(user.password, user_row["password"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/todos", response_model=List[Todo])
async def get_todos(current_user: str = Depends(get_current_user)):
    query = users.select().where(users.c.username == current_user)
    user = await database.fetch_one(query)
    return await database.fetch_all(todos.select().where(todos.c.user_id == user["id"]))


@app.post("/todos", response_model=Todo)
async def create_todo(todo: TodoBase, current_user: str = Depends(get_current_user)):
    query = users.select().where(users.c.username == current_user)
    user = await database.fetch_one(query)

    new = await database.execute(
        todos.insert().values(
            title=todo.title,
            completed=todo.completed,
            user_id=user["id"]  
        )
    )
    return {**todo.model_dump(), "id": new}


@app.put("/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: int, todo: TodoBase, current_user: str = Depends(get_current_user)):
    user = await database.fetch_one(users.select().where(users.c.username == current_user))
    existing = await database.fetch_one(todos.select().where(todos.c.id == todo_id, todos.c.user_id == user["id"]))
    if not existing:
        raise HTTPException(404, "Not found")
    await database.execute(todos.update().where(todos.c.id == todo_id).values(**todo.model_dump()))
    return {**todo.model_dump(), "id": todo_id}

@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: int, current_user: str = Depends(get_current_user)):
    user = await database.fetch_one(users.select().where(users.c.username == current_user))
    existing = await database.fetch_one(todos.select().where(todos.c.id == todo_id, todos.c.user_id == user["id"]))
    if not existing:
        raise HTTPException(404, "Not found")
    await database.execute(todos.delete().where(todos.c.id == todo_id))
    return {"detail": "Todo deleted"}


