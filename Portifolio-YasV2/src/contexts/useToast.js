import { useContext } from "react";
import { ToastContext } from "./toastContextBase";

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser utilizado dentro de um ToastProvider");
  }
  return context;
}
