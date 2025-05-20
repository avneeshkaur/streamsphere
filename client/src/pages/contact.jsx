import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/contact.css';

const Contact = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          email: currentUser.email || ''
        }));
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Only allow digits in contact field
    if (name === 'contact') {
      if (!/^\d*$/.test(value)) return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');

    if (!formData.name || !formData.email || !formData.contact || !formData.message) {
      setFeedback('❌ Please fill all fields.');
      return;
    }

    // ✅ Validate Contact number format
    if (!/^\d{10}$/.test(formData.contact)) {
      setFeedback('❌ Enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...formData,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      setFeedback('✅ Message sent successfully!');
      setFormData({ name: '', email: user.email || '', contact: '', message: '' });
    } catch {
      setFeedback('❌ Failed to send message.');
    }
    setLoading(false);
  };

  return (
    <div className="ask-container">
      <form onSubmit={handleSubmit} className="ask-card">
        <h2 className="ask-title">ASK A QUESTION <span className="ask-icon">❓</span></h2>
        {feedback && <p className="ask-feedback">{feedback}</p>}

        <div className="ask-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="ask-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
          />
        </div>

        <div className="ask-group">
          <label>Contact</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Enter your contact number"
            maxLength="10"
            required
          />
        </div>

        <div className="ask-group">
          <label>Message</label>
          <textarea
            name="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            placeholder="Type your message..."
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default Contact;
