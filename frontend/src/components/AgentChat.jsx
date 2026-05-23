import { useState, useRef, useEffect } from 'react';
import { API } from '../App';
import { Send, Bot, User, Zap, RotateCcw, Sparkles, Inbox, Check, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import styles from './AgentChat.module.css';

const QUICK_PROMPTS = [
  'Show my 5 latest emails',
  'Find unread emails',
  'Search emails from this week',
  'List starred emails',
];

function ToolResult({ result }) {
  if (!result) return null;

  // Email list result
  if (result.emails) {
    return (
      <div className={styles.toolResult}>
        <p className={styles.toolLabel}>
          <Inbox size={12} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
          <span>Found {result.count} emails</span>
        </p>
        <div className={styles.emailCards}>
          {result.emails.map((e) => (
            <div key={e.id} className={styles.emailCard}>
              <p className={styles.emailCardSubject}>{e.subject || '(no subject)'}</p>
              <p className={styles.emailCardFrom}>{e.from}</p>
              <p className={styles.emailCardSnippet}>{e.snippet}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Send/reply success
  if (result.success) {
    return (
      <div className={styles.toolResult}>
        <p className={styles.successMsg}>
          <Check size={12} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
          <span>{result.tool === 'sendEmail' ? 'Email sent!' : 'Replied!'}</span>
        </p>
        {result.to && <p className={styles.toolLabel}>To: {result.to}</p>}
      </div>
    );
  }

  // Full email body
  if (result.body) {
    return (
      <div className={styles.toolResult}>
        <p className={styles.toolLabel}>
          <Mail size={12} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
          <span>{result.subject}</span>
        </p>
        <pre className={styles.emailBody}>{result.body.slice(0, 400)}{result.body.length > 400 ? '...' : ''}</pre>
      </div>
    );
  }

  // Fallback
  if (result.message) {
    return <div className={styles.toolResult}><p>{result.message}</p></div>;
  }

  return null;
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div 
      className={styles.message + ' ' + (isUser ? styles.userMsg : styles.agentMsg)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.msgAvatar}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className={styles.msgContent}>
        <p className={styles.msgText}>{msg.content}</p>
        {msg.results && msg.results.map((r, i) => (
          <ToolResult key={i} result={r.error ? { message: `Error: ${r.error}` } : r.result} />
        ))}
        {msg.plan && (
          <div className={styles.planChips}>
            {msg.plan.map((step, i) => (
              step.tool !== 'none' && (
                <span key={i} className={styles.planChip}>
                  <Zap size={10} /> {step.tool}
                </span>
              )
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AgentChat({ context, onActionComplete, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      content: "Hi! I'm your AI email assistant. Tell me what you'd like to do with your inbox.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (instruction = input) => {
    if (!instruction.trim() || loading) return;
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = '42px';
    }
    setLoading(true);

    setMessages((prev) => [...prev, { role: 'user', content: instruction }]);

    try {
      const res = await API.post('/agent/run', { instruction, context });
      const { plan, results } = res.data;

      // Build a human-readable summary
      const summary = results
        .map((r) => {
          if (r.error) return `Failed: ${r.error}`;
          if (r.result?.emails) return `Found ${r.result.count} emails.`;
          if (r.result?.success) return 'Done!';
          if (r.result?.body) return `Read email: "${r.result.subject}"`;
          if (r.result?.message) return r.result.message;
          return 'Completed.';
        })
        .join(' ');

      setMessages((prev) => [
        ...prev,
        { role: 'agent', content: summary, plan, results },
      ]);

      // Notify parent to refresh email list
      if (results.some(r => r.tool === 'sendEmail' || r.tool === 'replyEmail')) {
        onActionComplete?.();
        toast.success('Email action completed!');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'agent', content: `Error: ${err.response?.data?.error || err.message}` },
      ]);
      toast.error('Agent failed. Check your API keys.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'agent',
      content: "Chat cleared! How can I help with your inbox?",
    }]);
  };

  return (
    <div className={styles.panel}>
      {/* Panel header */}
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>
          <div className={styles.botIcon}>
            <Sparkles size={14} />
          </div>
          <span>AI Agent</span>
          <span className="badge badge-purple">Core v2</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button id="clear-chat-btn" className={styles.clearBtn} onClick={clearChat} title="Clear chat">
            <RotateCcw size={14} />
          </button>
          {onClose && (
            <button className={styles.closeBtn} onClick={onClose} title="Close AI Agent">
              <span style={{ fontSize: '20px', fontWeight: 'normal', lineHeight: '14px', display: 'block' }}>&times;</span>
            </button>
          )}
        </div>
      </div>

      {/* Sleek flat monochromatic System Status segment */}
      <div className={styles.systemStatusCard}>
        <div className={styles.systemStatusHeader}>
          <div className={styles.statusDotRow}>
            <span className={styles.statusIndicatorDot + (loading ? ' ' + styles.statusThinking : '')} />
            <span className={styles.statusLabel}>{loading ? 'SYSTEM THINKING...' : 'SYSTEM ONLINE'}</span>
          </div>
          <span className={styles.statusValue}>100% operational</span>
        </div>
        <div className={styles.statusMetrics}>
          <div className={styles.metricRow}>
            <span className={styles.metricKey}>Core LLM:</span>
            <span className={styles.metricVal}>llama3-70b</span>
          </div>
          <div className={styles.metricRow}>
            <span className={styles.metricKey}>Latency:</span>
            <span className={styles.metricVal}>blazing-fast</span>
          </div>
        </div>
      </div>

      {/* Context indicator */}
      {context?.subject && (
        <div className={styles.contextBar}>
          <Mail size={12} />
          <span className={styles.contextText}>Context: <em>{context.subject}</em></span>
        </div>
      )}

      {/* Messages */}
      <div className={styles.messages}>
        <AnimatePresence>
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        </AnimatePresence>
        {loading && (
          <div className={styles.message + ' ' + styles.agentMsg}>
            <div className={styles.msgAvatar}><Bot size={14} /></div>
            <div className={styles.thinking}>
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className={styles.quickPrompts}>
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              id={`quick-prompt-${p.replace(/\s+/g, '-').toLowerCase()}`}
              className={styles.quickPrompt}
              onClick={() => sendMessage(p)}
              disabled={loading}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={styles.inputArea}>
        <textarea
          id="agent-chat-input"
          ref={inputRef}
          className={styles.textarea}
          placeholder="Ask me anything about your emails..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (inputRef.current) {
              inputRef.current.style.height = 'auto';
              inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
            }
          }}
          onKeyDown={handleKey}
          rows={1}
          disabled={loading}
        />
        <button
          id="agent-send-btn"
          className={styles.sendBtn}
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          {loading ? <div className="spinner" /> : <Send size={15} />}
        </button>
      </div>
    </div>
  );
}
