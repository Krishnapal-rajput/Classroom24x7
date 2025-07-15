import React, { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import "./Home.css";

const faqs = [
  {
    question: "What is Classroom 24x7 and how does it work?",
    answer:
      "Classroom 24x7 is an online education platform offering high-quality courses, demo lectures, study materials, and tests. You can learn anytime, anywhere with our smooth, interactive classes taught in both Hindi and English.",
  },
  {
    question: "Can anyone enroll in Classroom 24x7 courses?",
    answer:
      "Yes! Classroom 24x7 courses are designed for everyone. Our programs are not tied to any individual student, so anyone can enroll and start learning immediately.",
  },
  {
    question: "Does Classroom 24x7 offer demo lectures before purchasing?",
    answer:
      "Absolutely. We provide free demo lectures so you can experience the quality of our teaching and content before you decide to buy.",
  },
  {
    question: "What payment methods are accepted on Classroom 24x7?",
    answer:
      "We accept all major UPI apps, credit/debit cards, and popular payment gateways. This makes it easy and secure to pay for our courses.",
  },
  {
    question: "Does Classroom 24x7 have a pay-for-use model?",
    answer:
      "Yes! At Classroom 24x7, you only pay for what you use. Whether you subscribe monthly or purchase specific courses occasionally, it’s completely flexible.",
  },
  {
    question: "Are there coupon codes or discounts on Classroom 24x7?",
    answer:
      "Definitely. Classroom 24x7 regularly offers promotional coupon codes and special discounts to make learning even more affordable.",
  },
  {
    question: "What subjects does Classroom 24x7 cover?",
    answer:
      "Classroom 24x7 offers courses across English, Mathematics, and various competitive exams. Our expert teachers make sure concepts are clear with real-world examples.",
  },
  {
    question: "How qualified are the teachers on Classroom 24x7?",
    answer:
      "Classroom 24x7 has highly experienced educators who use student-friendly methods. They teach in a mix of Hindi and English, making learning smooth and engaging.",
  },
  {
    question: "Can I access Classroom 24x7 from my mobile?",
    answer:
      "Yes! You can learn on the go. Download the Classroom 24x7 app from the Google Play Store and start studying anytime, anywhere.",
  },
  {
    question: "Does Classroom 24x7 provide study materials and tests?",
    answer:
      "Absolutely. Each course on Classroom 24x7 includes comprehensive study materials and regular tests to track your progress.",
  },
  {
    question: "Is there a free trial available on Classroom 24x7?",
    answer:
      "Instead of a generic trial, Classroom 24x7 provides free demo lectures so you can see the teaching quality firsthand.",
  },
  {
    question: "How often does Classroom 24x7 update its courses?",
    answer:
      "Classroom 24x7 regularly updates content and adds new features, so you always have access to the latest materials and teaching methods.",
  },
  {
    question: "Can I study at my own pace with Classroom 24x7?",
    answer:
      "Yes! Classroom 24x7 is designed for flexible learning. You can watch lectures, revisit topics, and learn at your convenience.",
  },
  {
    question: "Are Classroom 24x7 lectures bilingual?",
    answer:
      "Yes. Our courses are typically delivered in Hindi plus English, so students get the benefit of native explanations along with English terminology.",
  },
  {
    question: "What makes Classroom 24x7 different from other platforms?",
    answer:
      "Classroom 24x7 stands out with its pay-for-use flexibility, free demo lectures, bilingual classes, and expert teachers. Plus, we make learning truly accessible by accepting all UPI payments.",
  },
  {
    question: "How secure is my payment and data on Classroom 24x7?",
    answer:
      "Your security is a top priority at Classroom 24x7. We use secure payment gateways and encrypt your data to keep it safe.",
  },
  {
    question: "Does Classroom 24x7 support competitive exam preparation?",
    answer:
      "Yes! Classroom 24x7 has tailored courses and tests for competitive exams, helping you build a strong foundation and practice effectively.",
  },
  {
    question: "Can I use Classroom 24x7 for last-minute exam prep?",
    answer:
      "Definitely. Classroom 24x7 courses are designed to be clear and concise, perfect for brushing up on concepts even at the last minute.",
  },
  {
    question:
      "Will I get a certificate after completing a course on Classroom 24x7?",
    answer:
      "Some Classroom 24x7 courses come with certificates of completion, which you can use to showcase your skills.",
  },
  {
    question: "Who can I contact if I have questions about Classroom 24x7?",
    answer:
      "You can reach out to us anytime at office.classroom24x7@gmail.com. We're happy to assist you with any queries.",
  },
];

const testimonials = [
  {
    quote:
      "Classroom 24x7 transformed my preparation. I cracked the SSC exam on the first attempt.",
    name: "Ravi Sharma",
    role: "SSC Aspirant",
    image: "hhttps://i.pravatar.cc/100",
  },
  {
    quote:
      "The demo lectures convinced me. I enrolled and my son topped the school exams.",
    name: "Sunita Patel",
    role: "Parent",
    image: "https://i.pravatar.cc/100",
  },
  {
    quote: "Clear concepts and bilingual teaching made Maths so easy to grasp.",
    name: "Aman Verma",
    role: "Student",
    image: "https://i.pravatar.cc/100",
  },
  {
    quote: "Affordable, flexible and top-notch quality. Highly recommend it.",
    name: "Priya Joshi",
    role: "Graduate Student",
    image: "https://i.pravatar.cc/100",
  },
  {
    quote:
      "My son loves the way concepts are explained. Thank you Classroom 24x7!",
    name: "Manoj Mehta",
    role: "Parent",
    image: "https://i.pravatar.cc/100",
  },
  {
    quote: "I cleared my banking prelims thanks to their mock tests.",
    name: "Shreya Singh",
    role: "Banking Aspirant",
    image: "https://i.pravatar.cc/100",
  },
  {
    quote:
      "No unnecessary jargon, only clear teaching. Helped boost my confidence.",
    name: "Vikas Patel",
    role: "Engineering Prep",
    image: "https://i.pravatar.cc/100",
  },
  {
    quote: "Best part? Demo lectures before paying. Rare these days.",
    name: "Neha Kumari",
    role: "Commerce Student",
    image: "https://i.pravatar.cc/100",
  },
  {
    quote: "Quick customer support and easy-to-use app. Love it.",
    name: "Rahul Jain",
    role: "CA Aspirant",
    image: "https://i.pravatar.cc/100",
  },
  {
    quote: "I improved my English grammar in weeks. Superb teaching style.",
    name: "Kiran Das",
    role: "High School Student",
    image: "https://i.pravatar.cc/100",
  },
];

const achievements = [
  { title: "5000+ App Downloads", image: "https://picsum.photos/id/1/150/100" },
  {
    title: "5.0 Star Play Store Rating",
    image: "https://picsum.photos/id/2/150/100",
  },
  { title: "200+ Hours Content", image: "https://picsum.photos/id/3/150/100" },
  { title: "10+ Subjects Taught", image: "https://picsum.photos/id/4/150/100" },
  {
    title: "95% Positive Feedback",
    image: "https://picsum.photos/id/5/150/100",
  },
  {
    title: "24x7 Learning Access",
    image: "https://picsum.photos/id/6/150/100",
  },
  {
    title: "100+ Success Stories",
    image: "https://picsum.photos/id/7/150/100",
  },
  { title: "Live Doubt Clearing", image: "https://picsum.photos/id/8/150/100" },
  {
    title: "Regularly Updated Courses",
    image: "https://picsum.photos/id/9/150/100",
  },
  {
    title: "Secure UPI Payments",
    image: "https://picsum.photos/id/10/150/100",
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
  const [galleryTab, setGalleryTab] = useState("stories");
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

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
    const lines = [
      "Go to Play Store →",
      "Download the App →",
      "Click on Demo →",
      "Take Demo →",
      "Purchase Course!",
    ];
    let i = 0;
    const el = document.getElementById("typewriter");
    if (!el) return;
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

  const goToTestimonial = (index) => {
    setCurrentTestimonialIndex(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change testimonial every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
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

      <section id="gallery" className="section">
        <h2>Gallery</h2>
        <div className="tabs">
          <button
            className={galleryTab === "stories" ? "active" : ""}
            onClick={() => setGalleryTab("stories")}
          >
            Success Stories
          </button>
          <button
            className={galleryTab === "achievements" ? "active" : ""}
            onClick={() => setGalleryTab("achievements")}
          >
            Achievements
          </button>
        </div>

        {galleryTab === "stories" && (
          <div className="testimonials-wrapper">
            <div className="testimonials-slider">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className={`testimonial-card frame ${
                    idx === currentTestimonialIndex ? "active" : ""
                  }`}
                >
                  <img src={t.image} alt={t.name} />
                  <blockquote>"{t.quote}"</blockquote>
                  <p>
                    <strong>{t.name}</strong> - {t.role}
                  </p>
                </div>
              ))}
            </div>
            <div className="dot-nav">
              {testimonials.map((_, idx) => (
                <span
                  key={idx}
                  className={`dot ${
                    idx === currentTestimonialIndex ? "active" : ""
                  }`}
                  onClick={() => goToTestimonial(idx)}
                ></span>
              ))}
            </div>
          </div>
        )}

        {galleryTab === "achievements" && (
          <div className="achievements-wrapper">
            <div className="achievements-slider">
              {achievements.map((a, idx) => (
                <div key={idx} className="achievement-card frame">
                  <img src={a.image} alt={a.title} />
                  <p>{a.title}</p>
                </div>
              ))}
            </div>
            <div className="dot-nav">
              {achievements.map((_, idx) => (
                <span
                  key={idx}
                  className={`dot ${
                    idx === currentTestimonialIndex ? "active" : ""
                  }`}
                  onClick={() => goToTestimonial(idx)}
                ></span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ABOUT US - Updated to your detailed teacher profile */}
      <section id="aboutus" className="section gray-bg">
        <h2>About the Author</h2>
        <div className="profile-container">
          <div className="profile-left">
            <img
              src="https://i.pravatar.cc/250?img=59"
              alt="Mr. Jitendra Kumar Makwana"
              className="avatar large"
            />
            <ul className="profile-details">
              <li>
                <strong>Name:</strong> Mr. Jitendra Kumar Makwana
              </li>
              <li>
                <strong>Specialization:</strong> English & Mathematics
              </li>
              <li>
                <strong>Teaching Since:</strong> 2010
              </li>
              <li>
                <strong>Experience:</strong> 15+ years
              </li>
              <li>
                <strong>Location:</strong> Indore, India
              </li>
            </ul>
          </div>
          <div className="profile-right">
            <h3>Professional Summary</h3>
            <p>
              Mr. Jitendra is an accomplished educator with over 15 years of
              experience teaching English, Mathematics and Physics. His
              student-centric approach combines rigorous academic standards with
              engaging methodologies that make complex concepts accessible.
              Recognized for fostering critical thinking, many of his students
              have advanced to top colleges, universities and STEM careers.
            </p>

            <h3>Education Qualifications</h3>
            <ul>
              <li>M.A. English</li>
              <li>B.Ed., Indore College (2009), Indore</li>
            </ul>

            <h3>Teaching Philosophy</h3>
            <p>
              Believes in conceptual understanding before procedure, applying
              real-world scenarios, and fostering a growth mindset. Uses flipped
              classrooms, gamification, and peer teaching to make learning
              dynamic and effective.
            </p>
          </div>
        </div>
      </section>

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

      <footer className="footer">
        <p>&copy; 2025 Classroom 24x7</p>
        <div className="socials">
          <a
            href="https://youtube.com/classroom24x7"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-youtube"></i>
          </a>
          <a
            href="https://facebook.com/classroom24x7"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-facebook"></i>
          </a>
          {/* <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
    <i className="fab fa-twitter"></i>
  </a> */}
          <a
            href="https://instagram.com/classroom24x7"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a href="mailto:office.classroom24x7@gmail.com">
            <i className="fab fa-at"></i>
          </a>
        </div>
        <p>Contact: office.classroom24x7@gmail.com | Address: Indore, India</p>
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
