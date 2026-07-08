import { useState, useEffect } from "react";
import "../../styles/admin/AddOrders.css";

export default function AddOrders() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("credit");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/api/products", {
      headers: { "x-auth-token": token }
    })
      .then(res => res.json())
      .then(setProducts);
  }, []);

  const addToCart = (product, slab) => {
    const exists = cart.find(
      c => c.productId === product._id && c.slabLabel === slab.label
    );
    if (exists) return alert("Already added");

    setCart([
      ...cart,
      {
        productId: product._id,
        productName: product.name,
        slabLabel: slab.label,
        gramsUsed: slab.gramsUsed,
        salePrice: slab.salePrice,
        purchaseCost: slab.purchaseCost,
        quantity: 1
      }
    ]);
  };

  const updateQty = (i, qty) => {
    if (qty < 1) return;
    const updated = [...cart];
    updated[i].quantity = qty;
    setCart(updated);
  };

  const removeItem = i => {
    setCart(cart.filter((_, idx) => idx !== i));
  };

  const subtotal = cart.reduce(
    (t, i) => t + i.salePrice * i.quantity,
    0
  );
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const submitOrder = async () => {
    if (!cart.length) return alert("Cart is empty");

    const res = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token
      },
      body: JSON.stringify({
        customerName,
        items: cart,
        discount,
        paymentMethod
      })
    });

    if (res.ok) {
      alert("Order created");
      setCart([]);
      setCustomerName("");
      setDiscount(0);
    } else {
      alert("Failed to create order");
    }
  };

  return (
    <div className="orders-container">
      <h2>Create Order</h2>

      <input
        className="input"
        placeholder="Customer Name"
        value={customerName}
        onChange={e => setCustomerName(e.target.value)}
      />

      {/* PRODUCTS */}
      <div className="products">
        {products.map(p => (
          <div className="product-card" key={p._id}>
            <h4>{p.name}</h4>
            <div className="slabs">
              {p.slabs.map(s => (
                <button
                  key={s._id}
                  onClick={() => addToCart(p, s)}
                >
                  {s.label} – Rs {s.salePrice}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CART */}
      <h3>Cart</h3>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map((c, i) => (
            <tr key={i}>
              <td>{c.productName} ({c.slabLabel})</td>
              <td>
                <input
                  type="number"
                  value={c.quantity}
                  onChange={e => updateQty(i, +e.target.value)}
                />
              </td>
              <td>Rs {c.salePrice}</td>
              <td>Rs {c.salePrice * c.quantity}</td>
              <td>
                <button className="danger" onClick={() => removeItem(i)}>✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALS */}
      <div className="summary">
        <p>Subtotal: <strong>Rs {subtotal}</strong></p>
        <p>
          Discount %
          <input
            type="number"
            value={discount}
            onChange={e => setDiscount(+e.target.value)}
          />
        </p>
        <p>Total: <strong>Rs {total}</strong></p>

        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
          <option value="paid">Paid</option>
          <option value="credit">Credit</option>
        </select>

        <button className="submit" onClick={submitOrder}>
          Create Order
        </button>
      </div>
    </div>
  );
}
