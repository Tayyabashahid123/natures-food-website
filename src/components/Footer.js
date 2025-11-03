import "../styles/Footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
        <div className="footer-row">
            <h3 className="footer-logo">Nature’s Food</h3>
            <p className="footer-tagline">
            Masalon Ka Zaiqa: Purity, Potency, and Heritage in every pinch. <br />
            Your trusted source for authentic flavor.
            </p>
        </div>

        <div className="footer-row">
            <h4>Quick Links</h4>
            <Link to="/shop">
                <button className="footer-link">Shop Spices</button>
            </Link>

            <Link to="/about">
                <button className="footer-link">Our Quality Promise</button>
            </Link>

            <Link to="/contact">
                <button className="footer-link">Wholesale Inquiries</button>
            </Link>
        </div>

        <div className="footer-row">
            <h4>Contact Us</h4>
            <p>
            Email:{" "}
            <a href="mailto:naturesfood@gmail.com">naturesfood@gmail.com</a>
            </p>
            <p>Phone: 03219488975</p>
            <p>Support: 11 AM – 7 PM PKT, Mon–Sat</p>
        </div>

        <div className="footer-row">
            <h4>Connect</h4>
            <div className="social-links">
            <a href="#">Facebook</a> 
            <a href="#">Instagram</a>
            </div>
        </div>

        <div className="footer-bottom">
            © {new Date().getFullYear()} Nature’s Food. All rights reserved.
        </div>
    </footer>

  );
}
