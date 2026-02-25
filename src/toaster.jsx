import React, { createContext, useContext, useState, useEffect, useRef, useCallback, memo } from 'react';
import './toast_css.css';
import checkIcon from "./assets/check_sign.svg"
import crossIcon from "./assets/error_sign.svg"
import loadIcon from "./V2Form/toastLoading.svg"
const ToastContext = createContext();

let idCounter = 0;

export const useToast = () => useContext(ToastContext);

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = idCounter++;
    setToasts((prev) => [...prev, { id, ...toast }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const Toast = memo(function Toast({ title, description, type = 'neutral', duration = 3000, onClose }) {
  const [progress, setProgress] = useState(100);
  const [hovered, setHovered] = useState(false);
  const progressRef = useRef(progress);
  const idRef = useRef(null);

  // Store the initial duration start time
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    let interval;
    
    // Reset start time when component mounts (not on re-render)
    if (!idRef.current) {
      idRef.current = true;
      startTimeRef.current = Date.now();
    }

    const tick = () => {
      if (hovered) return;
      const elapsed = Date.now() - startTimeRef.current;
      const percent = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(percent);
      progressRef.current = percent;
      if (percent <= 0) onClose();
    };

    interval = setInterval(tick, 60);
    return () => clearInterval(interval);
  }, [duration, onClose]);

  return (
    <div
      className={`toast toast-${type}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="toast-icon">
        {type == "error" ? (
          <img src={crossIcon} alt="" />
        ) : type == "loading" ?
          (<img className='loadIcon' src={loadIcon} alt="" />)
          :
          (<img src={checkIcon} alt="" />)
        }
      </div>
      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        {description && <div className="toast-description">{description}</div>}
        <div className="toast-progress">
          <div
            className={`toast-progress-bar-${type}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <button className="toast-close" onClick={onClose}>✖</button>
    </div>
  );
});