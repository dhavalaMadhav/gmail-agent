import { Inbox, Send, Star, Trash2, Tag, Search, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { id: 'INBOX', label: 'Inbox', icon: Inbox },
  { id: 'SENT', label: 'Sent', icon: Send },
  { id: 'STARRED', label: 'Starred', icon: Star },
  { id: 'CATEGORY_PROMOTIONS', label: 'Promotions', icon: Tag },
  { id: 'TRASH', label: 'Trash', icon: Trash2 },
];

export default function Sidebar({ activeLabel, onLabelChange, onSearch }) {
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchVal);
  };

  return (
    <motion.aside 
      className={styles.sidebar}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search */}
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <Search size={14} className={styles.searchIcon} />
        <input
          id="email-search-input"
          type="text"
          placeholder="Search emails..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className={styles.searchInput}
        />
      </form>

      {/* Nav */}
      <nav className={styles.nav}>
        <p className={styles.navLabel}>Mailbox</p>
        <div className={styles.navList}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`nav-${id.toLowerCase()}`}
              className={styles.navItem + (activeLabel === id ? ' ' + styles.active : '')}
              onClick={() => onLabelChange(id)}
            >
              <Icon size={16} strokeWidth={activeLabel === id ? 2 : 1.5} />
              <span>{label}</span>
              {activeLabel === id && (
                <motion.div 
                  className={styles.glowIndicator} 
                  layoutId="sidebar-active"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom tip */}
      <div className={styles.tip}>
        <div className={styles.tipIcon}>
          <Lightbulb size={16} />
        </div>
        <p className={styles.tipText}>
          Try asking the AI: <em>"Summarize my last 5 emails"</em>
        </p>
      </div>
    </motion.aside>
  );
}
