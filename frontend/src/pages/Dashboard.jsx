import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import EmailList from '../components/EmailList';
import EmailView from '../components/EmailView';
import AgentChat from '../components/AgentChat';
import { API } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [activeLabel, setActiveLabel] = useState('INBOX');
  const [chatOpen, setChatOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchEmails = async (label = 'INBOX', q = '') => {
    setLoadingEmails(true);
    setSelectedEmail(null);
    try {
      const res = await API.get('/gmail/messages', {
        params: { labelIds: label, maxResults: 20, q },
      });
      setEmails(res.data.messages || []);
    } catch (err) {
      console.error('Failed to fetch emails:', err);
    } finally {
      setLoadingEmails(false);
    }
  };

  useEffect(() => {
    fetchEmails(activeLabel);
  }, [activeLabel]);

  // Refresh inbox after agent actions
  const handleAgentAction = () => {
    fetchEmails(activeLabel);
  };

  const handleSelectEmail = async (email) => {
    setSelectedEmail(email);
    if (email.labelIds?.includes('UNREAD')) {
      // Instantly remove UNREAD label locally so dot disappears
      setEmails((prev) =>
        prev.map((e) =>
          e.id === email.id
            ? { ...e, labelIds: e.labelIds.filter((l) => l !== 'UNREAD') }
            : e
        )
      );
      try {
        await API.post(`/gmail/messages/${email.id}/read`);
      } catch (err) {
        console.error('Failed to mark email as read:', err);
      }
    }
  };

  return (
    <motion.div 
      className={styles.layout}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Header onToggleChat={() => setChatOpen((o) => !o)} chatOpen={chatOpen} />

      <div className={styles.body}>
        {/* Sidebar Toggle Button (Mobile only) */}
        <button
          className={`${styles.sidebarToggleBtn} ${sidebarOpen ? styles.sidebarOpen : ''}`}
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Sidebar Container */}
        <div className={`${styles.sidebarContainer} ${sidebarOpen ? styles.sidebarVisible : ''}`}>
          <Sidebar
            activeLabel={activeLabel}
            onLabelChange={(label) => {
              setActiveLabel(label);
              setSidebarOpen(false); // auto-close on mobile
            }}
            onSearch={(q) => {
              fetchEmails(activeLabel, q);
              setSidebarOpen(false); // auto-close on mobile
            }}
          />
        </div>

        {/* Email list container */}
        <div className={`${styles.listContainer} ${selectedEmail ? styles.listHiddenMobile : ''}`}>
          <EmailList
            emails={emails}
            loading={loadingEmails}
            selectedId={selectedEmail?.id}
            onSelect={handleSelectEmail}
          />
        </div>

        {/* Email viewer container */}
        <div className={`${styles.viewer} ${!selectedEmail ? styles.viewerHiddenMobile : ''}`}>
          {/* Back Button on Mobile */}
          {selectedEmail && (
            <button className={styles.backBtnMobile} onClick={() => setSelectedEmail(null)}>
              ← Back to Inbox
            </button>
          )}
          <EmailView email={selectedEmail} />
        </div>

        {/* AI Agent chat panel (Animate Open/Close) */}
        <AnimatePresence mode="wait">
          {chatOpen && (
            <motion.div
              className={styles.chatWrapper}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'var(--chat-w)', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <AgentChat
                context={selectedEmail ? {
                  messageId: selectedEmail.id,
                  threadId: selectedEmail.threadId,
                  subject: selectedEmail.subject,
                  from: selectedEmail.from,
                } : {}}
                onActionComplete={handleAgentAction}
                onClose={() => setChatOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Agent Toggle Button (Mobile only when chat is closed) */}
        {!chatOpen && (
          <button
            className={styles.floatingChatBtn}
            onClick={() => setChatOpen(true)}
            title="Open AI Agent"
          >
            <Sparkles size={20} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
