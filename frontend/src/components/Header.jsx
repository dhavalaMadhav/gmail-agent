import { MessageSquare, MessageSquareOff, LogOut } from 'lucide-react';
import { useAuth, API } from '../App';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import styles from './Header.module.css';

export default function Header({ onToggleChat, chatOpen }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.get('/auth/logout');
      setUser(null);
      navigate('/login');
      toast.success('Logged out');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <motion.header 
      className={styles.header}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Mobile Chat Button (Left on Mobile, hidden on Desktop) */}
      <button
        id="toggle-chat-btn-mobile"
        className={`${styles.iconBtn} ${styles.mobileChatBtn} ${chatOpen ? styles.active : ''}`}
        onClick={onToggleChat}
        title={chatOpen ? 'Close AI Chat' : 'Open AI Chat'}
      >
        {chatOpen ? <MessageSquareOff size={18} /> : <MessageSquare size={18} />}
      </button>

      {/* Brand */}
      <div className={styles.brand}>
        <span className={styles.brandName}>
          Mail<span className="gradient-text">Mind</span>
        </span>
        <span className={styles.badge + ' badge badge-purple'}>AI</span>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {/* Online indicator */}
        <div className={styles.onlineRow}>
          <div className="pulse-dot" />
          <span className={styles.onlineText}>AI Ready</span>
        </div>

        {/* Toggle agent chat (Desktop only, hidden on Mobile) */}
        <button
          id="toggle-chat-btn"
          className={`${styles.iconBtn} ${styles.desktopChatBtn} ${chatOpen ? styles.active : ''}`}
          onClick={onToggleChat}
          title={chatOpen ? 'Close AI Chat' : 'Open AI Chat'}
        >
          {chatOpen
            ? <MessageSquareOff size={18} />
            : <MessageSquare size={18} />}
        </button>

        {/* User avatar + logout */}
        {user && (
          <div className={styles.userMenu}>
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className={styles.avatar}
              />
            )}
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user.name}</p>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
            <button
              id="logout-btn"
              className={`${styles.iconBtn} ${styles.logoutBtn}`}
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </motion.header>
  );
}
