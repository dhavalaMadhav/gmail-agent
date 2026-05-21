import { Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './EmailList.module.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function extractName(from) {
  const match = from?.match(/^(.+?)\s*</);
  return match ? match[1].trim() : from || 'Unknown';
}

function SkeletonRow() {
  return (
    <div className={styles.skeletonRow}>
      <div className={styles.skeletonAvatar + ' skeleton'} />
      <div className={styles.skeletonLines}>
        <div className={styles.skeletonLine + ' skeleton'} style={{ width: '60%' }} />
        <div className={styles.skeletonLine + ' skeleton'} style={{ width: '80%' }} />
        <div className={styles.skeletonLine + ' skeleton'} style={{ width: '40%' }} />
      </div>
    </div>
  );
}

const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

export default function EmailList({ emails, loading, selectedId, onSelect }) {
  if (loading) {
    return (
      <div className={styles.list}>
        {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (!emails.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <Inbox size={32} />
        </div>
        <p className={styles.emptyText}>No emails found</p>
      </div>
    );
  }

  return (
    <motion.div 
      className={styles.list}
      variants={listContainerVariants}
      initial="hidden"
      animate="show"
    >
      {emails.map((email) => {
        const isUnread = email.labelIds?.includes('UNREAD');
        const isSelected = email.id === selectedId;
        return (
          <motion.button
            key={email.id}
            id={`email-item-${email.id}`}
            variants={itemVariants}
            className={
              styles.item +
              (isSelected ? ' ' + styles.selected : '') +
              (isUnread ? ' ' + styles.unread : '')
            }
            onClick={() => onSelect(email)}
          >
            {/* Status Indicator (Unread Dot Column) */}
            <div className={styles.statusIndicator}>
              {isUnread && <div className={styles.unreadDot} />}
            </div>

            {/* Avatar */}
            <div className={styles.avatar}>
              {extractName(email.from)?.[0]?.toUpperCase() || '?'}
            </div>

            <div className={styles.content}>
              <div className={styles.top}>
                <span className={styles.sender}>{extractName(email.from)}</span>
                <span className={styles.date}>{formatDate(email.date)}</span>
              </div>
              <p className={styles.subject}>{email.subject || '(no subject)'}</p>
              <p className={styles.snippet}>{email.snippet}</p>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
