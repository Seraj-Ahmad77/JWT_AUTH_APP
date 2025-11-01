import React from "react";
import "../styles/Footer.css";
import { Link } from "react-router-dom";

import ins from "../assets/instagram.jpg";
import git from "../assets/git.png";
import linkedin from "../assets/linkedin.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>MERN Authentication</h2>
          <p>Your aspiring full-stack developer and internship candidate in the MERN stack.</p>
        </div>
        <div className="footer-social">
          <h3>My Social Media Account</h3>
          <div className="social-icons">
  
            <Link
              to="https://www.instagram.com/serajkamal7"
              target="_blank"
              className="social-link"
            >
              <img src={ins} alt="Twitter" />
            </Link>
            <Link
              to="https://www.linkedin.com/in/seraj-ahmad-77ansari"
              target="_blank"
              className="social-link"
            >
              <img src={linkedin} alt="LinkedIn" />
            </Link>
            <Link
              to="https://github.com/Seraj-Ahmad77"
              target="_blank"
              className="social-link"
            >
              <img src={git} alt="GitHub" />
            </Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 MERN Authentication. All Rights Reserved.</p>
        <p>Designed by Seraj Ahmad</p>
      </div>
    </footer>
  );
};

export default Footer;
