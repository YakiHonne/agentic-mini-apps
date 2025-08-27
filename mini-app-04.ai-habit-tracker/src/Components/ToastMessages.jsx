import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { removeToast } from "../Store/toastSlice";

export default function ToastMessages() {
  const dispatch = useDispatch();
  const { toasts } = useSelector((state) => state.toast);

  useEffect(() => {
    // Auto-remove toasts after 5 seconds
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, 5000)
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [toasts, dispatch]);

  const getToastIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <AlertCircle size={20} />;
      case "info":
      default:
        return <Info size={20} />;
    }
  };

  const getToastClass = (type) => {
    switch (type) {
      case "success":
        return "toast-success";
      case "error":
        return "toast-error";
      case "info":
      default:
        return "toast-info";
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${getToastClass(toast.type)}`}>
          <div className="toast-icon">{getToastIcon(toast.type)}</div>
          <div className="toast-content">
            <div className="toast-message">{toast.message}</div>
            {toast.details && (
              <div className="toast-details">{toast.details}</div>
            )}
          </div>
          <button
            className="toast-close"
            onClick={() => dispatch(removeToast(toast.id))}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
