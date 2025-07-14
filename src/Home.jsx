import React, { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import "./Home.css";

const faqs = [
  {
    question: "How do I create an account on your platform?",
    answer:
      "Click 'Sign Up' on the homepage, fill in your details, verify your email, and you're done!",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept Visa, MasterCard, PayPal, Apple Pay, Google Pay, and more.",
  },
  {
    question: "How can I reset my password?",
    answer:
      "Click 'Forgot Password' on the login page to receive a reset link.",
  },
  {
    question: "Is there a mobile app available?",
    answer: "Yes! Download it from the Play Store or Apple App Store.",
  },
  {
    question: "How secure is my personal data?",
    answer:
      "We use SSL/TLS encryption and comply with GDPR. Your data is safe.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Absolutely. Cancel from your account settings anytime.",
  },
  {
    question: "Do you offer discounts for non-profits?",
    answer: "Yes, 25% off for registered non-profits. Contact our sales team.",
  },
  {
    question: "How often do you release new features?",
    answer: "Minor updates weekly, major features monthly.",
  },
  {
    question: "What browsers are supported?",
    answer: "Chrome, Firefox, Safari, Edge, Opera on their latest versions.",
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, a 14-day free trial. No credit card required.",
  },
];

const Home = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    gender: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [faqVisibleCount, setFaqVisibleCount] = useState(5);

  useEffect(() => {
    // Menu toggle
    const toggleMenu = () => {
      document.getElementById("nav-menu")?.classList.toggle("hidden");
    };
    window.toggleMenu = toggleMenu;

    // Scroll active links
    const handleScroll = () => {
      const navLinks = document.querySelectorAll("nav a");
      const fromTop = window.scrollY;
      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (!href?.startsWith("#")) return;
        const section = document.querySelector(href);
        if (!section) return;
        if (
          section.offsetTop <= fromTop + 60 &&
          section.offsetTop + section.offsetHeight > fromTop + 60
        ) {
          navLinks.forEach((l) => l.classList.remove("active-link"));
          link.classList.add("active-link");
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Typewriter text rotation
    const lines = [
      "Go to Play Store →",
      "Download the App →",
      "Click on Demo →",
      "Take Demo →",
      "Purchase Course!",
    ];
    let i = 0;
    const el = document.getElementById("typewriter");
    el.textContent = lines[i];
    const interval = setInterval(() => {
      i = (i + 1) % lines.length;
      el.textContent = lines[i];
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "contact") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 10) return;
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    if (!/^\d{0,10}$/.test(paste)) {
      e.preventDefault();
      alert("Only numeric values up to 10 digits are allowed.");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(formData.contact)) {
      alert("Contact number must be exactly 10 digits.");
      return;
    }
    try {
      await addDoc(collection(db, "userData"), {
        name: formData.name.trim(),
        contact: formData.contact.trim(),
        gender: formData.gender,
        createdAt: Timestamp.now(),
      });
      setSubmitted(true);
      setFormData({ name: "", contact: "", gender: "" });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error("🔥 Error submitting inquiry:", err.message);
      alert(
        "Something went wrong while submitting the form. Please try again."
      );
    }
  };

  const toggleFaq = (idx) => {
    const el = document.getElementById(`faq-${idx}`);
    const icon = document.getElementById(`icon-${idx}`);
    el.classList.toggle("active");
    icon.classList.toggle("fa-plus");
    icon.classList.toggle("fa-minus");
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="nav-header">
        <img
          src="https://github.com/Krishnapal-rajput/Classroom24x7-index/blob/main/logo/App%20icon%20Log%20512x512.jpg?raw=true"
          alt="Classroom 24x7 Logo"
          className="logo-image"
        />
        <div className="menu-toggle" onClick={() => window.toggleMenu()}>
          ☰
        </div>
        <nav id="nav-menu" className="nav-menu hidden">
          <a href="#home" className="active-link">
            Home
          </a>
          <a href="#courses">Courses</a>
          <a href="#gallery">Gallery</a>
          <a href="#aboutus">About Us</a>
          <a href="#inquiry">Inquiry</a>
          <a href="#faq">FAQ</a>
        </nav>
      </header>

      {/* Hero */}
      <section id="home" className="hero">
        <span className="hero-animation" id="typewriter"></span>
        <div className="playstore-hero-btn">
          <a
            href="https://play.google.com/store/apps/details?id=co.lenord.yfpfv"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
              alt="Get it on Google Play"
              style={{ height: "60px", marginTop: "20px" }}
            />
          </a>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="section gray-bg">
        <h2>Our Courses</h2>
        <div className="card-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card">
              <img
                src={`https://placehold.co/250x150?text=Course+${i + 1}`}
                alt={`Course ${i + 1}`}
              />
              <button
                onClick={() =>
                  window.open(
                    "https://play.google.com/store/apps/details?id=co.lenord.yfpfv",
                    "_blank"
                  )
                }
              >
                Explore
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="section">
        <h2>Gallery</h2>
        <div className="gallery-grid">
          {[...Array(3)].map((_, i) => (
            <img
              key={i}
              src="https://img.freepik.com/free-photo/happy-business-man_23-2148018673.jpg"
              alt={`Gallery ${i + 1}`}
              className="gallery-img"
            />
          ))}
          <iframe
            src="https://www.youtube.com/embed/WyB8tZD5ieI"
            allowFullScreen
            title="Gallery Video"
            className="gallery-video"
          ></iframe>
        </div>
      </section>

      {/* About Us */}
      <section id="aboutus" className="section gray-bg">
        <h2>About Us</h2>
        <p>
          <strong>Author:</strong> Jitendra Kumar Makvana
        </p>
        <p>
          <strong>Our Teachers:</strong> Experienced professionals in IT,
          business, and creative fields.
        </p>
        <div className="card-grid">
          {[
            {
              name: "Yash R.",
              role: "M.Sc. Computer Science",
              exp: "7 years",
              gender: "boy",
            },
            {
              name: "Deepak Kapoor",
              role: "MBA, Marketing",
              exp: "10 years",
              gender: "boy",
            },
            {
              name: "Seema Joshi",
              role: "B.Ed., English",
              exp: "5 years",
              gender: "girl",
            },
            {
              name: "Nihit Rao",
              role: "B.Tech, Computer Science",
              exp: "6 years",
              gender: "boy",
            },
            {
              name: "Vaani Desai",
              role: "M.Sc., Data Science",
              exp: "4 years",
              gender: "girl",
            },
            {
              name: "Aanshu Bansal",
              role: "MCA, AI Specialist",
              exp: "8 years",
              gender: "girl",
            },
          ].map((member, idx) => (
            <div key={idx} className="card">
              <img
                src={`https://avatar.iran.liara.run/public/${member.gender}`}
                alt={`${member.name} avatar`}
                className="avatar"
              />
              <h4>{member.name}</h4>
              <p>{member.role}</p>
              <p>{member.exp} of experience</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inquiry */}
      <section id="inquiry" className="section">
        <h2>Inquiry Form</h2>
        <form className="form" autoComplete="off" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="contact"
            placeholder="Contact"
            value={formData.contact}
            onChange={handleChange}
            onPaste={handlePaste}
            inputMode="numeric"
            maxLength={10}
            required
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <button type="submit">Request Callback</button>
          {submitted && (
            <p className="success-msg">Inquiry submitted successfully!</p>
          )}
        </form>
      </section>

      {/* FAQ */}
      <section id="faq" className="section gray-bg">
        <div className="faq-container">
          <div className="faq-header">
            <h1>Frequently Asked Questions</h1>
            <p>
              Find answers to common questions about our products and services
            </p>
          </div>
          <div className="faq-list">
            {faqs.slice(0, faqVisibleCount).map((faq, idx) => (
              <div key={idx} className="faq-item">
                <div className="faq-question" onClick={() => toggleFaq(idx)}>
                  <span>{faq.question}</span>
                  <i className="fas fa-plus toggle-icon" id={`icon-${idx}`}></i>
                </div>
                <div className="faq-answer" id={`faq-${idx}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="faq-load-more">
            <button
              className="load-more-btn"
              onClick={() =>
                setFaqVisibleCount(faqVisibleCount === 5 ? faqs.length : 5)
              }
            >
              {faqVisibleCount === 5
                ? "Show All Questions"
                : "Show Less Questions"}
            </button>
          </div>
        </div>
      </section>

      {/* Floating Playstore */}
      <div className="floating-playstore-btn">
        <a
          href="https://play.google.com/store/apps/details?id=co.lenord.yfpfv"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
            alt="Get it on Google Play"
            style={{ height: "50px" }}
          />
        </a>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 Classroom 24x7</p>
        <div className="socials">
          <i className="fab fa-facebook"></i>
          <i className="fab fa-twitter"></i>
          <i className="fab fa-instagram"></i>
        </div>
        <p>Contact: +91-1234567890 | Address: New Delhi, India</p>
        <div className="footer-play-btn">
          <a
            href="https://play.google.com/store/apps/details?id=co.lenord.yfpfv"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
              alt="Get it on Google Play"
              style={{ height: "50px", marginTop: "10px" }}
            />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
