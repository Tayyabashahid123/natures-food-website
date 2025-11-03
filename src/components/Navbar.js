import "../styles/Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { getCartCount } = useCart(); // ✅ enable context
  const itemCount = getCartCount();

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
        <Link to="/cart" className="nav-link cart">
          <FontAwesomeIcon icon={faCartShopping} />
          {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
        </Link>
      </nav>
    </header>
  );
}
