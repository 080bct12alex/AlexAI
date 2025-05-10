import { Link } from "react-router-dom";
import "./homepage.css";
import { TypeAnimation } from "react-type-animation";
import { useState } from "react";

const Homepage = () => {
  const [typingStatus, setTypingStatus] = useState("human1");

  return (
    <div className="homepage">
      <img src="/orbital.png" alt="" className="orbital" />
      <div className="left">
        <h1>AlexAI</h1>
        <h2>Supercharge your creativity and productivity</h2>
        <h3>
          Experience seamless conversations with our AI chat app. 
        </h3>
        <Link to="/dashboard">Get Started</Link>
      </div>
      <div className="right">
        <div className="imgContainer">
          <div className="bgContainer">
            <div className="bg"></div>
          </div>
          <img src="/bot.png" alt="" className="bot" />
          <div className="chat">
            <img
              src={
                typingStatus === "human1"
                  ? "/human1.jpeg"
                  : typingStatus === "human2"
                  ? "/human2.jpeg"
                  : "bot.png"
              }
              alt=""
            />
            <TypeAnimation
  sequence={[
    "Human:What do we use to structure web pages?",
    2000,
    () => {
      setTypingStatus("bot");
    },
    "Bot:use HTML to define the structure.",
    2000,
    () => {
      setTypingStatus("human2");
    },
    "Human:How do we style our websites?",
    2000,
    () => {
      setTypingStatus("bot");
    },
    "Bot:apply CSS for styling and layout.",
    2000,
    () => {
      setTypingStatus("human3");
    },
    "Human:How can we make websites interactive?",
    2000,
    () => {
      setTypingStatus("bot");
    },
    "Bot:JavaScript brings interactivity to the frontend.",
    2000,
    () => {
      setTypingStatus("human4");
    },
    "Human:How do we handle backend logic?",
    2000,
    () => {
      setTypingStatus("bot");
    },
    "Bot:use server-side languages like Node.js or Python.",
    2000,
    () => {
      setTypingStatus("human1");
    },
  ]}
  wrapper="span"
  repeat={Infinity}
  cursor={true}
  omitDeletionAnimation={true}
/>

          </div>
        </div>
      </div>
      <div className="terms">
        <img src="/logo.png" alt="" />
        <div className="links">
          <Link to="/">Terms of Service</Link>
          <span>|</span>
          <Link to="/">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
