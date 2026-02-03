'use client';

import React from 'react';
import styles from './TakebackDialog.module.css';

interface TakebackDialogProps {
  requesterColor: 'w' | 'b';
  onAccept: () => void;
  onDecline: () => void;
}

export const TakebackDialog: React.FC<TakebackDialogProps> = ({
  requesterColor,
  onAccept,
  onDecline
}) => {
  const colorName = requesterColor === 'w' ? 'White' : 'Black';

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h3 className={styles.title}>Takeback Request</h3>
        <p className={styles.message}>
          {colorName} wants to undo their last move.
        </p>
        <div className={styles.buttons}>
          <button className={styles.accept} onClick={onAccept}>
            Accept
          </button>
          <button className={styles.decline} onClick={onDecline}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};
