import type { ToastState } from "../types";

interface ToastProps {
  toast: ToastState | null;
}

export default function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  }[toast.type];

  return (
    <div
      className={`fixed top-16 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg animate-pulse z-40`}
    >
      {toast.message}
    </div>
  );
}
