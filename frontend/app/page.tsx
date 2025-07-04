"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle, Circle } from "lucide-react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
type Todo = { id: number; title: string; completed: boolean };

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
  const load = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    setLoading(true);
    try {
      const data = await fetchTodos(token);
      setTodos(data);
    } catch {
      localStorage.removeItem("token");
      return router.push("/login");
    } finally {
      setLoading(false);
      setChecked(true);
    }
  };
  load();
}, []);


  const fetchTodos = async (token: string) => {
    const res = await fetch(`${BASE_URL}/todos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Token inválido o expirado");
    return res.json();
  };

  const apiCall = async (path: string, method = "GET", body?: any) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error("Error en la API");
    return res.json();
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const newTodo = await apiCall("/todos", "POST", {
        title,
        completed: false,
      });
      setTodos((prev) => [...prev, newTodo]);
      setTitle("");
    } catch (err) {
      console.error("Error al agregar tarea:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      const updated = await apiCall(`/todos/${id}`, "PUT", {
        title: todo.title,
        completed: !todo.completed,
      });
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
      );
    } catch (err) {
      console.error("Error al actualizar tarea:", err);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await apiCall(`/todos/${id}`, "DELETE");
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setTodoToDelete(null);
    } catch (err) {
      console.error("Error al eliminar tarea:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!checked) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-700">
        <p className="text-white text-lg font-semibold">Cargando...</p>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-700">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 bg-[length:200%_200%] animate-gradient-x"
          style={{ animationDuration: "10s" }}
        ></div>

        <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-white/20">
          <header className="mb-10 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                To-Do List ✅
              </h1>
              <p className="mt-2 text-cyan-200 font-light text-sm">
                Keep your tasks organized with style
              </p>
            </div>
          </header>

          <form onSubmit={addTodo} className="flex items-center gap-4 mb-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to do today?"
              className="flex-grow px-4 py-3 sm:px-5 sm:py-4 rounded-3xl bg-white/90 text-gray-900 font-medium placeholder-gray-500 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-400 transition text-sm sm:text-base"
            />

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white p-4 rounded-3xl shadow-lg transition active:scale-95 flex items-center justify-center"
              aria-label="Add task"
            >
              <Plus className="w-6 h-6" />
            </button>
          </form>

          <ul className="space-y-5 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-transparent">
            <AnimatePresence>
              {todos.map((todo) => (
                <motion.li
                  key={todo.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 25 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`flex items-center justify-between px-6 py-4 rounded-3xl bg-white/70 shadow-md transition select-none ${
                      todo.completed ? "opacity-70" : ""
                    }`}
                  >
                    <div
                      className="flex items-center gap-4 cursor-pointer"
                      onClick={() => toggleComplete(todo.id)}
                    >
                      {todo.completed ? (
                        <CheckCircle className="text-teal-600 w-6 h-6" />
                      ) : (
                        <Circle className="text-gray-500 w-6 h-6" />
                      )}
                      <span
                        className={`text-gray-900 font-semibold text-lg transition ${
                          todo.completed
                            ? "line-through italic text-gray-500"
                            : ""
                        }`}
                      >
                        {todo.title}
                      </span>
                    </div>
                    <button
                      onClick={() => setTodoToDelete(todo.id)}
                      className="text-red-600 hover:text-red-700 transition"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-6 h-6 hover:scale-110" />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>

        <AnimatePresence>
          {todoToDelete !== null && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl p-6 max-w-sm mx-4 text-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <p className="mb-6 text-gray-900 font-semibold text-lg">
                  Are you sure you want to delete this task?
                </p>
                <div className="flex justify-center gap-6">
                  <button
                    onClick={() => {
                      if (todoToDelete !== null) deleteTodo(todoToDelete);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setTodoToDelete(null)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg shadow"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <button
        onClick={logout}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-red-700 transition active:scale-95 z-50"
      >
        Log out
      </button>
    </>
  );
}
