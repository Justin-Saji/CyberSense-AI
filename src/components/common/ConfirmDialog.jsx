import React from 'react';
import { Modal } from './Modal';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start space-x-3 text-slate-300">
          <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${type === 'danger' ? 'text-rose-500' : 'text-amber-500'}`} />
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <SecondaryButton onClick={onClose} disabled={loading}>
            {cancelText}
          </SecondaryButton>
          <PrimaryButton
            onClick={onConfirm}
            loading={loading}
            className={type === 'danger' ? 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400' : ''}
          >
            {confirmText}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
};
