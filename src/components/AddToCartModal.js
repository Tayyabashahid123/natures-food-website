import "../styles/AddToCartModal.css";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function AddToCartModal({ product, quantity, onClose }) {
    const { cart, addToCart, products } = useCart();

    const totalItems = cart.reduce((t, i) => t + (i.quantity || 0), 0);
    const totalPrice = cart.reduce((t, i) => t + (Number(i.price) || 0) * (i.quantity || 0), 0);
    console.log("product details here", product)
    const qty = quantity ?? 1;

    const recommendedProducts = products
    .filter(p => p.id !== product.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);



    return (
        <div className="cart-modal-overlay" role="dialog" aria-modal="true" aria-label="Item added to cart">
        <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>

            <div className="cart-modal-inner">
            <div className="left">
                <div className="status">
                <svg className="check" viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                    <rect x="0" y="0" width="24" height="24" rx="4" fill="#eafaf0"/>
                    <path d="M6.5 12.5l3 3 8-8" stroke="#13803d" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h2>SUCCESSFULLY ADDED TO CART!</h2>
                </div>

                <div className="product-row">
                <img src={product.image} alt={product.name} className="modal-img" />
                <div className="modal-details">
                    <h3>{product.name}</h3>
                    <p className="muted">Price: <strong>Rs {product.price * qty}</strong></p>
                    <p className="muted">Quantity: <strong>{qty}</strong></p>
                </div>
                </div>
            </div>

            <aside className="summary">
                <div className="summary-card">
                <p className="summary-line"><span className="label">Items in Cart:</span> <span className="value">{totalItems}</span></p>
                <p className="summary-line"><span className="label">Total:</span> <span className="value">Rs {totalPrice.toFixed(0)}</span></p>

                <Link to="/cart" onClick={onClose} className="block-link">
                    <button className="view-cart-btn">View Cart</button>
                </Link>

                <button className="continue-btn" onClick={onClose}>Continue Shopping</button>
                </div>
            </aside>

            </div>

            {recommendedProducts.length > 0 && (
            <div className="recommended">
                <h3>You May Also Like</h3>
                <div className="recommended-list">
                {recommendedProducts.map(item => (
                    <div key={item.id} className="rec-card">
                    <img src={item.image} alt={item.name} />
                    <p>{item.name}</p>
                    <span>Rs {item.price}</span>
                    <button onClick={() => addToCart(item)}>Add</button>
                    </div>
                ))}
                </div>
            </div>
            )}
        </div>
        </div>
    );
}
