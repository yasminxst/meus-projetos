import { useState, useCallback, useMemo } from "react";
import { ToastContext } from "./toastContextBase";

/**
 * Provider do Sistema de Confirmação de Salvamento e Notificações (Toast)
 * 
 * Implementa o requisito de feedback visual padronizado em todas as áreas
 * com formulários e persistência no sistema Lumina:
 * - Durante o processamento: "Salvando alterações..."
 * - Sucesso: "Alterações salvas com sucesso!"
 * - Erro: "Não foi possível salvar as alterações. Tente novamente."
 * - Campos obrigatórios: "Preencha todos os campos obrigatórios."
 */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback(({ type = "info", message = "", duration = 3500 }) => {
    setToast({ type, message, id: Date.now() });

    if (duration > 0 && type !== "saving") {
      setTimeout(() => {
        setToast((current) => (current && current.type === type ? null : current));
      }, duration);
    }
  }, []);

  // Atalhos padronizados pelas diretrizes do Lumina
  const toastHelpers = useMemo(() => ({
    saving: () => showToast({ type: "saving", message: "Salvando alterações...", duration: 0 }),
    success: (message = "Alterações salvas com sucesso!") =>
      showToast({ type: "success", message, duration: 3500 }),
    error: (message = "Não foi possível salvar as alterações. Tente novamente.") =>
      showToast({ type: "error", message, duration: 4000 }),
    required: (message = "Preencha todos os campos obrigatórios.") =>
      showToast({ type: "warning", message, duration: 3500 }),
    hide: hideToast,
  }), [showToast, hideToast]);

  return (
    <ToastContext.Provider value={toastHelpers}>
      {children}
      {toast && (
        <aside
          role="status"
          aria-live="polite"
          className={`lumina-toast lumina-toast-${toast.type}`}
        >
          <div className="lumina-toast-icon">
            {toast.type === "saving" && (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            )}
            {toast.type === "success" && <i className="bi bi-check-circle-fill" />}
            {toast.type === "error" && <i className="bi bi-x-circle-fill" />}
            {toast.type === "warning" && <i className="bi bi-exclamation-triangle-fill" />}
          </div>
          <div className="lumina-toast-message">
            <strong>{toast.message}</strong>
          </div>
          <button
            type="button"
            className="lumina-toast-close"
            onClick={hideToast}
            aria-label="Fechar notificação"
          >
            <i className="bi bi-x" />
          </button>
        </aside>
      )}
    </ToastContext.Provider>
  );
}
