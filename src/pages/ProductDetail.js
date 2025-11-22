import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import "../styles/ProductDetail.css";
import AddToCartModal from "../components/AddToCartModal";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, cart } = useCart();     // ✅ added cart here
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log("Fetching product with ID:", id);
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.log(err));

    fetch(`http://localhost:5000/api/products`)
      .then(res => res.json())
      .then(data =>
        setRecommended(data.filter(p => p._id !== id).slice(0, 5))
      );
  }, [id]);

  if (!product)
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading product...</p>;

  return (
    <>
      <Navbar />

      <div className="product-details-section">
        <div className="product-details-container">
          <img src={product.image} alt={product.name} className="product-image" />

          <div className="product-info">
            <h1>{product.name}</h1>
            <p className="product-price">Rs {product.price}</p>
            <p className="product-description">{product.description}</p>

            <div className="quantity-box">
              <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>

            <button
              className="add-to-cart-btn"
              onClick={() => {
                addToCart({ ...product, quantity });
                setShowModal(true);
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <div className="recommended-section">
        <h2>You May Also Like</h2>
        <div className="recommended-grid">
          {recommended.map(item => (
            <div className="rec-card" key={item._id}>
              <img src={item.image} alt={item.name} />
              <h3>{item.name}</h3>
              <p>Rs {item.price}</p>
              <Link to={`/product/${item._id}`} className="view-details-btn">
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>

    {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>

            <AddToCartModal
            product={product}
            quantity={quantity}
            onClose={() => setShowModal(false)}
            />


            </div>
        </div>
    )}

      <Footer />
    </>
  );
}
