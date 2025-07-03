import React, { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import "./Home.css";

const Home = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    gender: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const toggleMenu = () => {
      document.getElementById("nav-menu")?.classList.toggle("hidden");
    };
    window.toggleMenu = toggleMenu;

    const handleScroll = () => {
      const navLinks = document.querySelectorAll("nav a");
      const fromTop = window.scrollY;

      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
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
    if (e.clipboardData) {
      const paste = e.clipboardData.getData("text");
      if (!/^\d{0,10}$/.test(paste)) {
        e.preventDefault();
        alert("Only numeric values up to 10 digits are allowed.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(formData.contact)) {
      alert("Contact number must be exactly 10 digits.");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        contact: formData.contact.trim(),
        gender: formData.gender,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "userData"), payload);

      setSubmitted(true);
      setFormData({ name: "", contact: "", gender: "" });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error("🔥 Error submitting inquiry:", err.message);
      alert("Something went wrong while submitting the form. Please try again.");
    }
  };

  return (
    <div className="home-container">
      {/* Header & Navigation */}
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
          <a href="#home" className="active-link">Home</a>
          <a href="#courses">Courses</a>
          <a href="#gallery">Gallery</a>
          <a href="#aboutus">About Us</a>
          <a href="#inquiry">Inquiry</a>
        </nav>
      </header>

      {/* Hero */}
      <section id="home" className="hero">
        <div className="hero-animation">
          <span>Download the app from Play Store</span>
          <span>→ Click on Demo</span>
          <span>→ Take Demo</span>
          <span>→ Purchase Course!</span>
        </div>
      </section>

      {/* About */}
      <section className="section">
        <h2>Classroom 24x7</h2>
        <p className="subtitle">Learn Anytime, Anywhere</p>
        <h3>Our Vision</h3>
        <p>
          To revolutionize education by making high-quality, accessible, and
          flexible learning available to everyone, everywhere—anytime they need it.
        </p>
        <h3>Our Mission</h3>
        <p>
          We are dedicated to nurturing potential, promoting lifelong learning,
          and creating a sustainable future through inclusive education solutions.
        </p>
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
        <p><strong>Author:</strong> Krishna Rajput</p>
        <p><strong>Our Teachers:</strong> Experienced professionals in IT, business, and creative fields.</p>
        <p><strong>Partner Companies:</strong> TechEd Pvt Ltd, LearnPro, EduForce</p>

        <div className="card-grid">
          {[
            { name: "Yash R.", role: "M.Sc. Computer Science", exp: "7 years", gender: "boy" },
            { name: "Deepak Kapoor", role: "MBA, Marketing", exp: "10 years", gender: "boy" },
            { name: "Seema Joshi", role: "B.Ed., English", exp: "5 years", gender: "girl" },
            { name: "Nihit Rao", role: "B.Tech, Computer Science", exp: "6 years", gender: "boy" },
            { name: "Vaani Desai", role: "M.Sc., Data Science", exp: "4 years", gender: "girl" },
            { name: "Aanshu Bansal", role: "MCA, AI Specialist", exp: "8 years", gender: "girl" },
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

      {/* Inquiry Form */}
      <section id="inquiry" className="section">
        <h2>Inquiry Form</h2>
        <form className="form" autoComplete="off" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            autoComplete="off"
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
            <option value="" disabled>Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <button type="submit">Request Callback</button>
          {submitted && <p className="success-msg">Inquiry submitted successfully!</p>}
        </form>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 Classroom 24x7</p>
        <div className="socials">
          <i className="fab fa-facebook"></i>
          <i className="fab fa-twitter"></i>
          <i className="fab fa-instagram"></i>
        </div>
        <p>Contact: +91-1234567890 | Address: New Delhi, India</p>
      </footer>
    </div>
  );
};

export default Home;
