"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  return (
    <div className="landing-root">

      {/* Background Glow */}
      <div className="landing-glow"></div>

      {/* NAV */}
      <div className="landing-nav">
        <h2>⚡ FreelanceOS</h2>
        <button onClick={() => router.push("/login")}>
          Login
        </button>
      </div>

      {/* HERO */}
      <div className="landing-hero">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Freelance Intelligence System
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Manage clients, track payments, and detect financial risks —
          all in one powerful dashboard.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/login")}
        >
          Get Started
        </motion.button>
      </div>

      {/* FEATURES */}
      <div className="landing-features">

        <div className="feature-card">
          <h3>📊 Smart Insights</h3>
          <p>Detect overdue projects and payment risks automatically.</p>
        </div>

        <div className="feature-card">
          <h3>💰 Payment Tracking</h3>
          <p>Track paid, pending, and remaining amounts in real-time.</p>
        </div>

        <div className="feature-card">
          <h3>👥 Client Management</h3>
          <p>Organize clients, projects, and history in one place.</p>
        </div>

      </div>

      {/* FOOTER */}
      <div className="landing-footer">
        <a
          href="https://abbas-vajwana-portfolio.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Abbas Wajvana
        </a>

        <span className="footer-sep">•</span>

        <a
          href="https://github.com/Artyvisual"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          GitHub
        </a>

        <span className="footer-sep">•</span>

        <a
          href="https://www.linkedin.com/in/abbas-wajvana/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          LinkedIn
        </a>
      </div>

    </div>
  );
}