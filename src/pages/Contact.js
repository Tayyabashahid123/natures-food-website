import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Contact.css";

export default function Contact() {
  return (
    <>
      <Navbar />

      {/* 🌿 Hero Section */}
      <section className="contact-hero">
        <div className="contact-header">
          <h1 className="contact-title">Get In Touch</h1>
          <p className="contact-subtitle">
            We’re here to answer your questions about our spices, sourcing, or wholesale partnerships.
          </p>
        </div>
      </section>

      {/* ✉️ Contact Section */}
      <section className="contact">
        <h2 className="contact-msg">Send Us a Message</h2>

        <div className="contact-body">
          {/* 📝 Form Section */}
          <div className="contact-inputs">
            <label>
              Full Name
              <input name="name" placeholder="Enter your full name" />
            </label>

            <label>
              Email Address
              <input name="email" placeholder="Enter your email" />
            </label>

            <label>
                Subject
                <select name="subject" required defaultValue="">
                    <option value="" disabled>Choose an option</option>
                    <option value="order">Product/Order Question</option>
                    <option value="Wholesale">Wholesale & Partnership inquiry</option>
                    <option value="Feedback">Sourcing & Quality Feedback</option>
                    <option value="General">General inquiry</option>
                </select>
            </label>

            <label>
              Your Message
              <textarea name="message" placeholder="Write your message here..." />
            </label>

            <button className="contact-btn">Send Message</button>
          </div>

          {/* 📞 Contact Details Section */}
          <div className="contact-detail">
            <h2>Contact Details</h2>

            { <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:naturesfood@gmail.com">naturesfood@gmail.com</a>
            </p>}

            <p>
              <strong>Phone:</strong> 03219488975
            </p>

            <p>
              <strong>Support Hours:</strong> 11 AM – 7 PM PKT, Mon–Sat
            </p>

            <div className="contact-socials">
              {/* <a href="#">🌿 Facebook</a> */}
              {/* <a href="#">📸 Instagram</a> */}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
