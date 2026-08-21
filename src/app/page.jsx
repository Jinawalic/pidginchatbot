'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Home from '@/components/Home';

export default function Page() {
  const [user, setUser] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is already saved in storage
    try {
      const savedUser = localStorage.getItem('agricBot_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Error reading user from localStorage:', e);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!nameInput.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const userId = nameInput.toLowerCase().trim().replace(/\s+/g, '_');
    const userData = { name: nameInput.trim(), userId };

    // Spin loading state for 1.5 seconds before taking user to chat interface
    setTimeout(() => {
      try {
        localStorage.setItem('agricBot_user', JSON.stringify(userData));
      } catch (e) {
        console.error('Error saving user to localStorage:', e);
      }
      setUser(userData);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('agricBot_user');
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    setUser(null);
    setNameInput('');
  };

  if (isLoading) return null;

  if (!user) {
    return (
      <div className="login-screen-container">
        <div className="login-card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img
              src="/images/logo.JPG"
              alt="AgricBot Logo"
              style={{ width: '90px', height: '90px', marginBottom: '12px', objectFit: 'contain' }}
            />
            <h2 style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 700 }}>Welcome to AgricBot</h2>
            <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '4px' }}>
              Abeg enter your name make we start to yarn about farming.
            </p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Enter your name here..."
              className="login-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              disabled={isSubmitting}
              required
              autoFocus
            />
            <button
              type="submit"
              className="login-button"
              disabled={isSubmitting || !nameInput.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="spin-animation" />
                  <span>Connecting to AgricBot...</span>
                </>
              ) : (
                <span>Continue to Chat</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <Home user={user} onLogout={handleLogout} />;
}
