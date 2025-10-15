import "../styles/Footer.css";

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
            <button className="footer-link">Shop Spices</button>
            <button className="footer-link">Our Quality Promise</button>
            <button className="footer-link">Wholesale Inquiries</button>
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
