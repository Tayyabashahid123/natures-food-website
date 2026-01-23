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

  const [discount, setDiscount] = useState(0); // % discount
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [productSearch, setProductSearch] = useState("");
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [sortBy, setSortBy] = useState("dateDesc");

  const token = localStorage.getItem("token");

  // ------------------ FETCH ORDERS ------------------
  const fetchOrders = () => {
    if (!token) return;
    fetch("http://localhost:5000/api/orders", {
      headers: { "x-auth-token": token },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data.filter((o) => o.status !== "completed")))
      .catch((err) => console.error(err));
  };

  // ------------------ FETCH PRODUCTS ------------------
  const fetchProducts = () => {
    if (!token) return;
    fetch("http://localhost:5000/api/products", {
      headers: { "x-auth-token": token },
    })
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [token]);

  // ------------------ CART FUNCTIONS ------------------
  const addToCart = (product) => {
    if (cart.find((item) => item.productId === product._id)) {
      alert("Already in cart");
      return;
    }

    setCart([
      ...cart,
      {
        productId: product._id,
        name: product.name,
        salePrice: product.price,
        purchasePrice: product.purchasePrice ?? 0,
        quantity: 1,
      },
    ]);
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) qty = 1;
    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  // ------------------ CALCULATE TOTALS ------------------
  const calculateCartTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalProfit = 0;

    cart.forEach((item) => {
      const quantity = Number(item.quantity);
      const salePrice = Number(item.salePrice);
      const purchasePrice = Number(item.purchasePrice);
      debugger

      const itemSubtotal = salePrice * quantity;
      const itemDiscount = parseFloat(((salePrice * discount) / 100).toFixed(2)) * quantity;
      const itemProfit = parseFloat((salePrice - purchasePrice - itemDiscount / quantity).toFixed(2)) * quantity;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
      totalProfit += itemProfit;
    });

    const totalAmount = parseFloat((subtotal - totalDiscount).toFixed(2));
    return { subtotal, totalDiscount, totalProfit, totalAmount };
  };

  const totals = calculateCartTotals();

  // ------------------ SUBMIT ORDER ------------------
  const submitOrder = () => {
    if (cart.length === 0) return alert("Add products to the order");

    fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({
        customerName,
        customerPhone,
        customerAddress,
        items: cart,
        discount,
        subtotal: totals.subtotal,
        discountAmount: totals.totalDiscount,
        profitAmount: totals.totalProfit,
        totalAmount: totals.totalAmount,
        paymentMethod,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Order created successfully!");
        setCart([]);
        setCustomerName("");
        setCustomerPhone("");
        setCustomerAddress("");
        setDiscount(0);
        setShowAddOrder(false);
        fetchOrders();
      })
      .catch((err) => console.error(err));
  };

  // ------------------ SEARCH + SORT ------------------
  let filteredOrders = orders.filter((o) =>
    o.customerName?.toLowerCase().includes(orderSearch.toLowerCase())
  );

  if (sortBy === "dateAsc") filteredOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (sortBy === "dateDesc") filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sortBy === "totalAsc") filteredOrders.sort((a, b) => a.totalAmount - b.totalAmount);
  if (sortBy === "totalDesc") filteredOrders.sort((a, b) => b.totalAmount - a.totalAmount);

  return (
    <div className="page">
      <h2>All Orders</h2>

      {/* SEARCH & SORT */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search orders by customer..."
          value={orderSearch}
          onChange={(e) => setOrderSearch(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", flex: 1 }}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="dateDesc">Newest → Oldest</option>
          <option value="dateAsc">Oldest → Newest</option>
          <option value="totalDesc">Highest Total</option>
          <option value="totalAsc">Lowest Total</option>
        </select>
      </div>

      {/* ORDERS TABLE */}
      <table className="table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Subtotal</th>
            <th>Profit</th>
            <th>Discount</th>
            <th>Total</th>
            <th>Method</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((o) => (
            <tr key={o._id}>
              <td>{o.customerName || "Walk-in"}</td>
              <td>Rs {o.subtotal}</td>
              <td>Rs {o.profitAmount}</td>
              <td>Rs {o.discountAmount}</td>
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

      {/* ADD ORDER BUTTON */}
      <button onClick={() => setShowAddOrder((prev) => !prev)}>
        {showAddOrder ? "Hide Add Order" : "Add New Order"}
      </button>

      {/* ADD ORDER FORM */}
      {showAddOrder && (
        <div className="add-order-form">
          <div className="form-row">
            <label>Customer Name:</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Customer Phone:</label>
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Customer Address:</label>
            <input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Payment Method:</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div className="form-row">
            <label>Discount (%):</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>

          <h4>Products</h4>
          <input
            type="text"
            placeholder="Search products..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {products
              .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
              .map((p) => (
                <div key={p._id}>
                  {p.name} - Rs {p.price}{" "}
                  <button onClick={() => addToCart(p)}>Add</button>
                </div>
              ))}
          </div>

          {cart.length > 0 && (
            <>
              <h4>Cart</h4>
              {cart.map((item) => {
                const itemDiscount = parseFloat(((item.salePrice * discount) / 100).toFixed(2));
                const itemProfit = item.salePrice - item.purchasePrice - itemDiscount;
                const itemTotal = item.salePrice - itemDiscount;

                return (
                  <div key={item.productId} className="cart-item">
                    <span>{item.name}</span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQty(item.productId, Number(e.target.value))}
                    />
                    <span>
                      Rs {item.salePrice} - Rs {itemDiscount} = Rs {itemTotal}
                    </span>
                    <button onClick={() => removeFromCart(item.productId)}>Remove</button>
                  </div>
                );
              })}

              <p>Subtotal: Rs {totals.subtotal}</p>
              <p>Total Discount: Rs {totals.totalDiscount}</p>
              <p>Total Profit: Rs {totals.totalProfit}</p>
              <h3>Grand Total: Rs {totals.totalAmount}</h3>

              <button className="submit-btn" onClick={submitOrder}>
                Submit Order
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
