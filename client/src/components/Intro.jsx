import React from "react";
import "../styles/Instructor.css";
import myimage from "../assets/myimage.jpg"

const Instructor = () => {
  return (
    <div className="instructor-page">
      <div className="instructor-card">
        <div className="instructor-image">
          <img src={myimage} alt="Instructor" />
        </div>
        <div className="instructor-info">
          <h1>Seraj Ahmad</h1>
          <h4>Your Intern(Candidate)</h4>
          <p>
            Hello! I'm <b>Seraj Ahmad</b>, a passionate Full Stack Developer
            with a strong focus on <b>MERN stack</b>. I enjoy building efficient,
            scalable, and user-friendly web applications. I'm eager to
            contribute my skills and grow through hands-on experience during an
            internship opportunity.
          </p>

          <div className="social-links">
            <a
              href="https://github.com/Seraj-Ahmad77"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/seraj-ahmad-77ansari"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://www.instagram.com/serajkamal7"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructor;
