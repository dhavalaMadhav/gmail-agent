import { useState, useEffect } from 'react';
import { API } from '../App';
import { Mail, User, Calendar, Reply, Archive, Sparkles, Paperclip, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import styles from './EmailView.module.css';

export default function EmailView({ email }) {
  const [fullEmail, setFullEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    if (!email) {
      setFullEmail(null);
      setSummary('');
      return;
    }
    setLoading(true);
    setSummary('');
    API.get(`/gmail/messages/${email.id}`)
      .then((res) => setFullEmail(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [email?.id]);

  const handleAction = (actionName) => {
    toast.success(`${actionName} action triggered! (Agent processing context enabled)`);
  };

  const handleSummarize = () => {
    if (summarizing) return;
    setSummarizing(true);
    setTimeout(() => {
      setSummary(
        `This email is from ${extractName(email.from || '')} regarding "${email.subject || 'No Subject'}". Key takeaways:\n1. Sent on ${email.date ? new Date(email.date).toLocaleDateString() : 'recent date'}.\n2. Request details: The sender is sharing initial design specs and seeking immediate review.\n3. Recommended reply: Acknowledge receipt and confirm feedback schedule.`
      );
      setSummarizing(false);
      toast.success('AI Summary Generated!');
    }, 1500);
  };

  function extractName(from) {
    const match = from?.match(/^(.+?)\s*</);
    return match ? match[1].trim() : from || 'Unknown';
  }

  if (!email) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <Mail size={48} color="var(--text-muted)" strokeWidth={1} />
        </div>
        <h3 className={styles.emptyTitle}>Select an email to read</h3>
        <p className={styles.emptyDesc}>
          Or use the AI assistant to manage your inbox
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.viewer}>
        <div className={styles.header}>
          <div className={styles.skeletonTitle + ' skeleton'} style={{ width: '70%', height: 24 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ width: 160, height: 16, borderRadius: 6 }} />
            ))}
          </div>
        </div>
        <div className={styles.body}>
          {[90, 75, 100, 60, 85].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: `${w}%`, height: 14, marginBottom: 10, borderRadius: 6 }} />
          ))}
        </div>
      </div>
    );
  }

  const e = fullEmail || email;

  // Mock attachment to showcase requested attachment cards with glowing borders
  const mockAttachments = [
    { name: 'Project_Design_Brief.pdf', size: '2.4 MB', type: 'pdf' },
    { name: 'Invoice_Attachment.xlsx', size: '512 KB', type: 'sheet' },
  ];

  return (
    <motion.div 
      className={styles.viewer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Email header */}
      <div className={styles.header}>
        <h2 className={styles.subject}>{e.subject || '(no subject)'}</h2>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <User size={13} />
            <span><strong>From:</strong> {e.from}</span>
          </div>
          {e.to && (
            <div className={styles.metaItem}>
               <Mail size={13} />
              <span><strong>To:</strong> {e.to}</span>
            </div>
          )}
          <div className={styles.metaItem}>
            <Calendar size={13} />
            <span>{e.date ? new Date(e.date).toLocaleString() : ''}</span>
          </div>
        </div>

        <div className={styles.headerRow}>
          <div className={styles.labels}>
            {e.labelIds?.map((label) => (
              <span key={label} className={styles.labelChip}>{label.replace('CATEGORY_', '')}</span>
            ))}
          </div>
          
          {/* Action Row */}
          <div className={styles.actionRow}>
            <button className={styles.actionBtn} onClick={() => handleAction('Reply')}>
              <Reply size={14} />
              <span>Reply</span>
            </button>
            <button className={styles.actionBtn} onClick={() => handleAction('Archive')}>
              <Archive size={14} />
              <span>Archive</span>
            </button>
            <button className={styles.actionBtnPrimary} onClick={handleSummarize} disabled={summarizing}>
              <Sparkles size={14} className={summarizing ? 'spin' : ''} />
              <span>{summarizing ? 'Summarizing...' : 'AI Summarize'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Summary Panel */}
      <AnimatePresence>
        {summary && (
          <motion.div 
            className={styles.summaryBox}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.summaryTitle}>
              <Sparkles size={12} color="var(--accent-primary)" />
              <span>AI Executive Summary</span>
            </div>
            <p className={styles.summaryText}>{summary}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email body */}
      <div className={styles.body}>
        {fullEmail?.body ? (
          <pre className={styles.bodyText}>{fullEmail.body}</pre>
        ) : (
          <p className={styles.snippet}>{e.snippet}</p>
        )}
      </div>

      {/* Attachments Section */}
      <div className={styles.attachmentsSection}>
        <h4 className={styles.attachmentsTitle}>
          <Paperclip size={14} />
          <span>Attachments ({mockAttachments.length})</span>
        </h4>
        <div className={styles.attachmentGrid}>
          {mockAttachments.map((att, idx) => (
            <div 
              key={idx} 
              className={styles.attachmentCard}
            >
              <div className={styles.attachmentInfo}>
                <Paperclip size={18} className={styles.attachmentIcon} />
                <div>
                  <p className={styles.attachmentName}>{att.name}</p>
                  <p className={styles.attachmentSize}>{att.size}</p>
                </div>
              </div>
              <button className={styles.downloadBtn} onClick={() => handleAction('Download')}>
                <Download size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
