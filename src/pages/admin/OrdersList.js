import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/admin.css"; // Make sure your CSS has table and form styling

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showAddOrder, setShowAddOrder] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch orders
  const fetchOrders = () => {
    if (!token) return;
    fetch("http://localhost:5000/api/orders", { headers: { "x-auth-token": token } })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          console.error("Server Error:", text);
          return [];
        }
        return res.json();
      })
      .then(data => setOrders(data.filter(o => o.status !== "completed")))
      .catch(err => console.error(err));
  };

  // Fetch products for adding order
  const fetchProducts = () => {
    if (!token) return;
    fetch("http://localhost:5000/api/products", { headers: { "x-auth-token": token } })
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [token]);

  // Add product to cart
  const addToCart = (product) => {
    if (cart.find(item => item.productId === product._id)) {
      alert("Already in cart");
      return;
    }
    setCart([...cart, { 
      productId: product._id, 
      name: product.name, 
      price: product.price, 
      quantity: 1, 
      total: product.price 
    }]);
  };

  // Update quantity
  const updateQty = (productId, qty) => {
    setCart(cart.map(item =>
      item.productId === productId 
        ? { ...item, quantity: qty, total: item.price * qty }
        : item
    ));
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0;
  const totalAmount = subtotal + tax;

  // Submit new order
  const submitOrder = () => {
    if (cart.length === 0) return alert("Add products to the order");
    fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token
      },
      body: JSON.stringify({
        customerName,
        items: cart,
        subtotal,
        discount: 0,
        tax,
        totalAmount,
        paymentMethod
      })
    })
      .then(res => res.json())
      .then(data => {
        alert("Order created successfully!");
        setCart([]);
        setCustomerName("");
        setShowAddOrder(false);
        fetchOrders();
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="page">
      <h2>All Orders</h2>

      {/* ORDERS TABLE */}
      <table className="table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Total</th>
            <th>Method</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id}>
              <td>{o.customerName || "Walk-in"}</td>
              <td>Rs {o.totalAmount}</td>
              <td>{o.paymentMethod}</td>
              <td>{o.status}</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
              <td>
                <Link to={`/admin/orders/${o._id}`}>
                  <button className="view-btn">View</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      {/* COLLAPSIBLE ADD ORDER SECTION */}
      <button 
        className="toggle-btn" 
        onClick={() => setShowAddOrder(prev => !prev)}
      >
        {showAddOrder ? "Hide Add Order" : "Add New Order"}
      </button>

      {showAddOrder && (
        <div className="add-order-form">
          <div className="form-row">
            <label>Customer Name:</label>
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} />
          </div>

          <div className="form-row">
            <label>Payment Method:</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="online">Online</option>
            </select>
          </div>

          <h4>Products</h4>

          {/* Search input */}
          <input
            type="text"
            placeholder="Search products..."
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              marginBottom: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              outline: "none"
            }}
          />

          {/* Scrollable product list */}
          <div 
            className="product-list" 
            style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "6px", padding: "10px" }}
          >
            {products
              .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
              .map(p => (
                <div key={p._id} className="product-item">
                  <span>{p.name} - Rs {p.price}</span>
                  <button onClick={() => addToCart(p)}>Add</button>
                </div>
              ))
            }
            {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
              <p style={{ textAlign: "center", color: "#888" }}>No products found</p>
            )}
          </div>

          {cart.length > 0 && (
            <>
              <h4>Cart</h4>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.productId} className="cart-item">
                    <span>{item.name}</span>
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      onChange={e => updateQty(item.productId, Number(e.target.value))}
                    />
                    <span>Rs {item.total}</span>
                    <button onClick={() => removeFromCart(item.productId)}>Remove</button>
                  </div>
                ))}
              </div>

              <p>Subtotal: Rs {subtotal}</p>
              <h4>Total: Rs {totalAmount}</h4>

              <button className="submit-btn" onClick={submitOrder}>Submit Order</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
