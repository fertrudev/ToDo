import { CheckCircle, Circle, Trash2 } from "lucide-react";

type Props = {
  todo: {
    id: number;
    title: string;
    completed: boolean;
  };
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <div
      className={`flex items-center justify-between px-6 py-4 rounded-2xl bg-white/80 shadow-md transition ${
        todo.completed ? "opacity-60" : ""
      }`}
    >
      <div
        className="flex items-center gap-4 cursor-pointer select-none"
        onClick={() => onToggle(todo.id)}
      >
        {todo.completed ? (
          <CheckCircle className="text-teal-500 w-6 h-6" />
        ) : (
          <Circle className="text-gray-400 w-6 h-6" />
        )}
        <span
          className={`text-gray-900 font-semibold text-lg transition ${
            todo.completed ? "line-through" : ""
          }`}
        >
          {todo.title}
        </span>
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-red-500 hover:text-red-600 transition"
        aria-label="Eliminar tarea"
      >
        <Trash2 className="w-6 h-6 hover:scale-110" />
      </button>
    </div>
  );
}
