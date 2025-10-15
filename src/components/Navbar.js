import "../styles/Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        Nature’s Food
      </Link>

      <nav className="nav-links">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/shop" className="nav-link">
          Shop
        </Link>
        <Link to="/about" className="nav-link">
          About
        </Link>
        <Link to="/contact" className="nav-link">
          Contact
        </Link>
        <button className="nav-link cart">
          <FontAwesomeIcon icon={faCartShopping} />
        </button>
      </nav>
    </header>
  );
}
