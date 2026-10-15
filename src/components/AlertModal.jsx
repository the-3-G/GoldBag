// src/components/AlertModal.jsx
import React, { useEffect } from 'react';
import './AlertModal.css';

export default function AlertModal({ isOpen, onClose, message, type = 'error' }) {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'error':
                return '⚠️';
            case 'success':
                return '✅';
            case 'info':
                return 'ℹ️';
            case 'warning':
                return '⚡';
            default:
                return '⚠️';
        }
    };

    return (
        <div className={`toast-notification ${type}`} onClick={onClose}>
            <span className="toast-icon">{getIcon()}</span>
            <span className="toast-message">{message}</span>
            <button className="toast-close-btn" onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}>&times;</button>
        </div>
    );
}
