import React, { useState, useEffect, useRef } from 'react';

interface PasswordModalProps {
  onSubmit: (password: string) => void;
  onClose: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ onSubmit, onClose }) => {
  const [password, setPassword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the input field when the modal opens
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl shadow-black/30 w-full max-w-xs"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-bold text-slate-200 text-center mb-2">Unrestricted Mode</h2>
          <p className="text-xs text-slate-400 text-center mb-4">Enter password to disable content filter.</p>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 text-cyan-400 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder:text-gray-500 mb-4"
            placeholder="Password"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-slate-700/80 border border-slate-600 text-slate-300 rounded-full px-4 py-2 text-sm font-bold transition-colors hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-cyan-600 text-white rounded-full px-4 py-2 text-sm font-bold transition-all hover:bg-cyan-500"
            >
              Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};