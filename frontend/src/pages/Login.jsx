import { Mail, Zap, Shield, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Login.module.css';

const features = [
  { icon: Brain, label: 'AI Planner', desc: 'Groq LLM understands your intent' },
  { icon: Zap, label: 'Instant Actions', desc: 'Send, reply, search in seconds' },
  { icon: Shield, label: 'Secure OAuth', desc: 'Google sign-in, no passwords' },
  { icon: Mail, label: 'Gmail Native', desc: 'Works with your real inbox' },
];

export default function Login() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className={styles.logo}>
          <h1 className={styles.logoText}>
            Mail<span className="gradient-text">Mind</span>
          </h1>
        </div>

        {/* Headline */}
        <div className={styles.hero}>
          <h2 className={styles.headline}>
            Your inbox,<br />
            <span className="gradient-text">supercharged by AI</span>
          </h2>
          <p className={styles.subheadline}>
            Manage emails with natural language. Powered by Groq's blazing-fast LLM.
          </p>
        </div>

        {/* Features */}
        <div className={styles.features}>
          {features.map(({ icon: Icon, label, desc }) => (
            <div 
              key={label} 
              className={styles.featureItem}
            >
              <div className={styles.featureIcon}>
                <Icon size={16} strokeWidth={2} />
              </div>
              <div>
                <p className={styles.featureLabel}>{label}</p>
                <p className={styles.featureDesc}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button 
          id="google-signin-btn" 
          className={styles.googleBtn} 
          onClick={handleLogin}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className={styles.disclaimer}>
          By signing in, you grant MailMind read/write access to your Gmail.
          Your credentials are never stored.
        </p>
      </motion.div>
    </div>
  );
}
