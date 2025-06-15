import React, { useState, useEffect } from "react";
import { auth } from "./firebaseConfig";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const navigate = useNavigate();

  // ✅ Initialize reCAPTCHA once
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved - allow sendOtp to continue
        },
        "expired-callback": () => {
          alert("reCAPTCHA expired. Please refresh.");
        },
      });

      window.recaptchaVerifier.render().catch((err) => {
        console.error("reCAPTCHA render failed", err.code, err.message);
      });
    }
  }, []);

  const sendOtp = async () => {
    if (!phone.startsWith("+")) {
      alert("Please use international format, e.g., +91XXXXXXXXXX");
      return;
    }

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmation(confirmationResult);
      alert("OTP has been sent.");
    } catch (err) {
      console.error("OTP send failed", err.code, err.message);
      alert("Failed to send OTP. Check console for details or use a test number.");
    }
  };

  const verifyOtp = async () => {
    try {
      await confirmation.confirm(otp);
      alert("Admin verified successfully.");
      navigate("/admin");
    } catch (err) {
      console.error("OTP verification failed", err.code, err.message);
      alert("Invalid OTP or expired session.");
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>

      <input
        type="text"
        placeholder="Phone Number (+91XXXXXXXXXX)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button onClick={sendOtp}>Send OTP</button>

      {confirmation && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}

      <div id="recaptcha-container"></div>
    </div>
  );
};

export default AdminLogin;
