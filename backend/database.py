from databases import Database
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Boolean, Text
from sqlalchemy import ForeignKey

DATABASE_URL = "sqlite:///./todos.db"

database = Database(DATABASE_URL)
metadata = MetaData()

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

todos = Table(
    "todos",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("title", String, index=True),
    Column("completed", Boolean, default=False),
    Column("user_id", Integer, ForeignKey("users.id"))  
)

users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String, unique=True, index=True),
    Column("password", Text),
)

metadata.create_all(engine)

