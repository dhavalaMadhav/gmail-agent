import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../App';
import { 
  Brain, 
  Zap, 
  Search, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  Inbox, 
  MessageSquare, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  Shield, 
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import styles from './Landing.module.css';

// Mockup Data
const mockEmails = [
  {
    id: 1,
    sender: 'Google Workspace Team',
    subject: 'Secure your Gmail Developer App',
    preview: 'Important notice: please ensure your OAuth client is configured with correct credentials...',
    time: '10m ago',
    tag: 'Security',
    tagStyle: styles.mStatusBadge,
    summaryTitle: 'Security Verification Update',
    bullets: [
      'Google OAuth developer credentials successfully verified and active.',
      'Production access approved for up to 10,000 active client users.',
      'Action recommended: Configure redirect URIs for your Render backend server.'
    ],
    actions: ['Configure redirect URI', 'Dismiss security alert']
  },
  {
    id: 2,
    sender: 'Sarah Jenkins',
    subject: 'Review requested: Landing Page UI',
    preview: 'Hey team! I uploaded the new glassmorphism mockups for the landing page today...',
    time: '1h ago',
    tag: 'Design',
    tagStyle: styles.mStatusBadgePurple,
    summaryTitle: 'Design Review: MailMind UI',
    bullets: [
      'Sarah uploaded new dark-theme mockups inspired by Perplexity & Linear.',
      'Aesthetics feature premium glassmorphism, radial glow lighting, and glowing badges.',
      'Action recommended: Approve and sign-off on Q3 landing page asset list.'
    ],
    actions: ['Approve design assets', 'Reply with feedback']
  },
  {
    id: 3,
    sender: 'Alex Rivera (Dev)',
    subject: 'API token integration complete',
    preview: 'We finished plugging in the Groq LLM agent to the Gmail pipeline, latency looks awesome...',
    time: '3h ago',
    tag: 'Engineering',
    tagStyle: styles.mStatusBadge,
    summaryTitle: 'Engineering Pipeline Sync',
    bullets: [
      'Groq LLM integration successful (model Llama 3.3 70B Versatile).',
      'Response latency reduced by 40% using optimized query pipelines.',
      'Action recommended: Run verification test on email auto-classification tags.'
    ],
    actions: ['View pipeline logs', 'Reply: Good job!']
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeEmail, setActiveEmail] = useState(mockEmails[1]); // Default to Sarah

  // Smooth scroll helper
  const scrollToFeatures = () => {
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className={styles.container}>
      {/* ─── Background Elements ─── */}
      <div className={styles.background}>
        <div className={styles.grid} />
        <div className={styles.glowTop} />
        <div className={styles.glowRight} />
        <div className={styles.glowBottom} />
      </div>

      {/* ─── Sticky Navbar ─── */}
      <nav className={styles.navbar}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          <Brain className={styles.logoIcon} size={24} />
          <span>Mail<span className={styles.gradientText}>Mind</span></span>
        </div>
        

        <div className={styles.navActions}>
          {user ? (
            <button className={styles.getStartedNav} onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          ) : (
            <>
              <button className={styles.signInBtn} onClick={() => navigate('/login')}>
                Sign In
              </button>
              <button className={styles.getStartedNav} onClick={() => navigate('/login')}>
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <motion.section 
        className={styles.hero}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className={styles.badgeContainer} variants={itemVariants}>
          <div className={styles.badge}>
            <Sparkles size={14} className={styles.badgeIcon} />
            <span>AI-Powered Email Intelligence</span>
          </div>
        </motion.div>

        <motion.h1 className={styles.headline} variants={itemVariants}>
          Smarter Emails.<br />
          <span className={styles.gradientText}>Faster Decisions.</span>
        </motion.h1>

        <motion.p className={styles.subtitle} variants={itemVariants}>
          MailMind helps you summarize, organize, search, and manage emails using AI-powered intelligence. Say goodbye to inbox clutter and hello to zero-stress email management.
        </motion.p>

        <motion.div className={styles.ctaGroup} variants={itemVariants}>
          <button className={styles.btnPrimary} onClick={() => navigate(user ? '/dashboard' : '/login')}>
            {user ? 'Go to Dashboard' : 'Get Started Free'}
            <ArrowRight size={18} />
          </button>
          <button className={styles.btnSecondary} onClick={scrollToFeatures}>
            Learn More
          </button>
        </motion.div>
      </motion.section>

      {/* ─── Dashboard Preview Section ─── */}
      <section className={styles.previewSection}>
        <motion.div 
          className={styles.previewWrapper}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className={styles.previewGlow} />
          <div className={styles.mockup}>
            {/* Sidebar Mockup */}
            <div className={styles.mSidebar}>
              <div className={styles.mLogo}>
                <Brain size={18} className={styles.logoIcon} />
                <span>MailMind</span>
              </div>
              <div className={styles.mNav}>
                <div className={`${styles.mNavItem} ${styles.mNavItemActive}`}>
                  <Inbox size={16} />
                  <span>Inbox</span>
                </div>
                <div className={styles.mNavItem}>
                  <Star size={16} />
                  <span>Starred</span>
                </div>
                <div className={styles.mNavItem}>
                  <Shield size={16} />
                  <span>Security</span>
                </div>
              </div>
            </div>

            {/* Inbox Mockup */}
            <div className={styles.mInbox}>
              <div className={styles.mHeader}>
                <div className={styles.mSearchBar}>
                  <Search size={14} />
                  <span>Ask AI or search mail...</span>
                </div>
                <Filter size={16} style={{ color: '#4b5563' }} />
              </div>
              
              <div className={styles.mInboxList}>
                {mockEmails.map((email) => (
                  <div 
                    key={email.id}
                    className={`${styles.mEmail} ${activeEmail.id === email.id ? styles.mEmailActive : ''}`}
                    onClick={() => setActiveEmail(email)}
                  >
                    <div className={styles.mEmailMeta}>
                      <span className={styles.mSender}>{email.sender}</span>
                      <span className={styles.mTime}>{email.time}</span>
                    </div>
                    <div className={styles.mSubject}>{email.subject}</div>
                    <div className={styles.mPreviewText}>{email.preview}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <span className={email.tagStyle}>{email.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Panel Mockup */}
            <div className={styles.mAiPanel}>
              <div className={styles.mAiHeader}>
                <Brain size={16} />
                <span>MailMind Intelligence</span>
              </div>
              <div className={styles.mAiContent}>
                <div className={styles.mSummaryBox}>
                  <div className={styles.mSummaryTitle}>
                    <Sparkles size={12} />
                    <span>{activeEmail.summaryTitle}</span>
                  </div>
                  <ul className={styles.mSummaryBullets}>
                    {activeEmail.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.mActionBox}>
                  <div className={styles.mActionLabel}>Recommended Actions</div>
                  <div className={styles.mActionButtons}>
                    {activeEmail.actions.map((act, i) => (
                      <button key={i} className={styles.mActionBtn}>
                        <span>{act}</span>
                        <ChevronRight size={14} style={{ color: '#3b82f6' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Feature Highlights Section ─── */}
      <section id="features-section" className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything you need to master your inbox</h2>
          <p className={styles.sectionSubtitle}>
            Engineered with deep learning model pipelines to streamline communication, automate sorting, and reply at the speed of thought.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <Brain size={24} />
            </div>
            <h3 className={styles.cardTitle}>Smart Summaries</h3>
            <p className={styles.cardDesc}>
              Get short, context-rich summaries of lengthy threads instantly. Extract priorities, tasks, and sentiment without reading pages of copy.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <MessageSquare size={24} />
            </div>
            <h3 className={styles.cardTitle}>AI Reply Suggestions</h3>
            <p className={styles.cardDesc}>
              Draft precise, context-aware email responses with single-click actions powered by state-of-the-art Groq LLM pipelines.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <Search size={24} />
            </div>
            <h3 className={styles.cardTitle}>Semantic Email Search</h3>
            <p className={styles.cardDesc}>
              Query your inbox using natural language like "Find Sarah's design pitch from last quarter" instead of building complex search syntax.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <Mail size={24} />
            </div>
            <h3 className={styles.cardTitle}>Priority Inbox Automation</h3>
            <p className={styles.cardDesc}>
              Let our background scheduler organize, catalog, and flag critical threads, filtering noise and promotional junk automatically.
            </p>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div className={styles.ctaGlow} />
          <h2 className={styles.ctaTitle}>Ready to experience the future of email?</h2>
          <p className={styles.ctaDesc}>
            Join thousands of professionals who save up to 10 hours every week by delegating their email processing to MailMind's advanced AI.
          </p>
          <button className={styles.btnPrimary} onClick={() => navigate(user ? '/dashboard' : '/login')}>
            {user ? 'Go to Dashboard' : 'Get Started Now'}
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <Brain className={styles.logoIcon} size={20} />
              <span>MailMind</span>
            </div>
            <p className={styles.footerDesc}>
              Building the intelligence layer for global corporate and personal email communications. Powered by Groq & Google Cloud.
            </p>
          </div>

          <div className={styles.footerCol}>
            <h4 className={styles.footerTitle}>Product</h4>
            <ul className={styles.footerLinks}>
              <li className={styles.footerLink}>Features</li>
              <li className={styles.footerLink}>Security Policy</li>
              <li className={styles.footerLink}>Pricing Plans</li>
              <li className={styles.footerLink}>Release Notes</li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4 className={styles.footerTitle}>Company</h4>
            <ul className={styles.footerLinks}>
              <li className={styles.footerLink}>About Us</li>
              <li className={styles.footerLink}>Careers</li>
              <li className={styles.footerLink}>Contact Sales</li>
              <li className={styles.footerLink}>Privacy Policy</li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4 className={styles.footerTitle}>Technology</h4>
            <ul className={styles.footerLinks}>
              <li className={styles.footerLink}>Groq LLAMA 3.3</li>
              <li className={styles.footerLink}>Gmail API integration</li>
              <li className={styles.footerLink}>Vercel Edge Network</li>
              <li className={styles.footerLink}>Render Web Service</li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© 2026 MailMind Inc. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Cookie Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
