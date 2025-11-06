
import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
    const baseClasses = "p-4 rounded-md text-sm";
    const variantClasses = {
        success: "bg-green-900/50 text-green-300 border border-green-700",
        error: "bg-red-900/50 text-red-300 border border-red-700",
        info: "bg-blue-900/50 text-blue-300 border border-blue-700",
    };

    if (!message) return null;

    return (
        <div className={`${baseClasses} ${variantClasses[type]}`} role="alert">
            <p>{message}</p>
        </div>
    );
};
