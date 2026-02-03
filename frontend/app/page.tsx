'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Animated space background */}
      <div className={styles.stars}></div>
      <div className={styles.stars2}></div>
      <div className={styles.stars3}></div>

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>
            <span className={styles.icon}>♔</span>
            Chess Arena
            <span className={styles.icon}>♚</span>
          </h1>
          
          <p className={styles.subtitle}>
            Challenge your friends in the ultimate chess battle
          </p>

          <div className={styles.modes}>
            <Link href="/offline" className={`${styles.modeButton} ${styles.offline}`}>
              <div className={styles.modeIcon}>🖥️</div>
              <div className={styles.modeContent}>
                <h2>Play Offline</h2>
                <p>Local hotseat on same device</p>
              </div>
            </Link>

            <Link href="/online" className={`${styles.modeButton} ${styles.online}`}>
              <div className={styles.modeIcon}>🌐</div>
              <div className={styles.modeContent}>
                <h2>Play Online</h2>
                <p>Real-time multiplayer chess</p>
              </div>
            </Link>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>✓ Full chess rules</div>
            <div className={styles.feature}>✓ Undo & takeback</div>
            <div className={styles.feature}>✓ Rematch support</div>
          </div>
        </div>
      </main>
    </div>
  );
}
