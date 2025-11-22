import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import "../styles/Cart.css";

export default function Cart() {
  const { cart, addToCart, decreaseFromCart, removeFromCart } = useCart();

  // Empty cart view
  if (!cart || cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="cart-container">
          <div className="cart-page empty">
            <h2>Your Cart is Empty 🛒</h2>
            <p>Start shopping and fill it with nature’s best spices!</p>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  // helper for total price (handles price as string or number)
  const totalPrice = cart.reduce((total, item) => {
    const price = Number(String(item.price || 0).replace(/[^0-9.-]+/g, "")) || 0;
    return total + price * (item.quantity || 0);
  }, 0);

  return (
    <>
      <Navbar />
      <div className="cart-container">
        <div className="cart-page">
          <h2>Your Cart</h2>

          <div className="cart-items">
            {cart.sort((a, b) => b.id - a.id).map((item) => (
              <div className="cart-item" key={item.id}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-img"
                />

                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  {item.price && <p>Rs {item.price * item.quantity}</p>}

                  <div className="cart-item-controls">
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>

                    <div className="quantity-controls">
                      <button
                        className="decrease-btn"
                        onClick={() => decreaseFromCart(item.id)}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        −
                      </button>

                      <span className="quantity">{item.quantity}</span>

                      <button
                        className="add-btn"
                        onClick={() => addToCart(item, item.quantity)}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Total Items: {cart.reduce((t, i) => t + i.quantity, 0)}</h3>
            <h3>Total Price: Rs {totalPrice.toFixed(0)}</h3>

            <button className="checkout-btn">Proceed to Checkout</button>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
