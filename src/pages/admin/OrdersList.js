import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/admin.css";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [discount, setDiscount] = useState(0);
  const [productSearch, setProductSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [sortBy, setSortBy] = useState("dateDesc"); // default sorting

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

  // Fetch products
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

  const updateQty = (productId, qty) => {
    setCart(cart.map(item =>
      item.productId === productId 
        ? { ...item, quantity: qty, total: item.price * qty }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0;
  let totalAmount = subtotal + tax;
  totalAmount = totalAmount - (totalAmount * discount / 100);

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
        customerPhone,
        customerAddress,
        items: cart,
        subtotal,
        discount: discount,
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
        setCustomerPhone("");
        setCustomerAddress("");
        setShowAddOrder(false);
        fetchOrders();
      })
      .catch(err => console.error(err));
  };

  // Filter orders by search
  let filteredOrders = orders.filter(o =>
    o.customerName?.toLowerCase().includes(orderSearch.toLowerCase())
  );

  // Sort orders
  if (sortBy === "dateAsc") {
    filteredOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortBy === "dateDesc") {
    filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === "totalAsc") {
    filteredOrders.sort((a, b) => a.totalAmount - b.totalAmount);
  } else if (sortBy === "totalDesc") {
    filteredOrders.sort((a, b) => b.totalAmount - a.totalAmount);
  }

  return (
    <div className="page">
      <h2>All Orders</h2>

      {/* SEARCH AND SORT */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search orders by customer..."
          value={orderSearch}
          onChange={e => setOrderSearch(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", flex: 1, marginRight: "10px" }}
        />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
          <option value="dateDesc">Date: Newest → Oldest</option>
          <option value="dateAsc">Date: Oldest → Newest</option>
          <option value="totalDesc">Total: Highest → Lowest</option>
          <option value="totalAsc">Total: Lowest → Highest</option>
        </select>
      </div>

      {/* ORDERS TABLE */}
      <table className="table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Total</th>
            <th>Method</th>
            <th>Discount</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(o => (
            <tr key={o._id}>
              <td>{o.customerName || "Walk-in"}</td>
              <td>Rs {o.totalAmount}</td>
              <td>{o.paymentMethod}</td>
              <td>{o.discount}%</td>
              <td>{o.status}</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
              <td>
                <Link to={`/admin/orders/${o._id}`}>
                  <button className="view-btn">View</button>
                </Link>
              </td>
            </tr>
          ))}
          {filteredOrders.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", color: "#888" }}>No orders found</td>
            </tr>
          )}
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
            <label>Customer Phone:</label>
            <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
          </div>

          <div className="form-row">
            <label>Customer Address:</label>
            <input value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} />
          </div>

          <div className="form-row">
            <label>Payment Method:</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div className="form-row">
            <label>Discount:</label>
            <input value={discount} onChange={e => setDiscount(e.target.value)} />
          </div>

          <h4>Products</h4>

          {/* Product search */}
          <input
            type="text"
            placeholder="Search products..."
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
          />

          <div className="product-list" style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "6px", padding: "10px" }}>
            {products
              .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
              .map(p => (
                <div key={p._id} className="product-item">
                  <span>{p.name} - Rs {p.price}</span>
                  <button onClick={() => addToCart(p)}>Add</button>
                </div>
              ))}
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
              <p>Discount: {discount}% ({subtotal * discount/100})</p>
              <h4>Total: Rs {totalAmount}</h4>

              <button className="submit-btn" onClick={submitOrder}>Submit Order</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
