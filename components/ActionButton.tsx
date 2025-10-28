import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const baseClasses = "group w-full flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";

const variantClasses = {
  primary: "bg-cyan-600 text-white hover:enabled:bg-cyan-500 focus:ring-cyan-500 disabled:bg-slate-700 disabled:text-slate-400",
  secondary: "bg-slate-700/80 text-slate-300 border border-slate-600 hover:enabled:bg-slate-700 focus:ring-slate-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700",
};


export const ActionButton: React.FC<ActionButtonProps> = ({ onClick, children, disabled = false, icon, variant = 'primary' }) => {
  const classes = `${baseClasses} ${variantClasses[variant]}`;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {icon && <span className="group-disabled:opacity-50">{icon}</span>}
      {children}
    </button>
  );
};