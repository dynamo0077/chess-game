'use client';

import React, { useEffect, useRef } from 'react';
import styles from './MoveList.module.css';

interface MoveListProps {
  moves: string[];
}

export const MoveList: React.FC<MoveListProps> = ({ moves }) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [moves]);

  const movePairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1] || ''
    });
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Move History</h3>
      <div className={styles.list} ref={listRef}>
        {movePairs.length === 0 ? (
          <div className={styles.empty}>No moves yet</div>
        ) : (
          movePairs.map((pair, index) => (
            <div key={index} className={styles.moveRow}>
              <span className={styles.moveNumber}>{pair.number}.</span>
              <span className={styles.move}>{pair.white}</span>
              {pair.black && <span className={styles.move}>{pair.black}</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
