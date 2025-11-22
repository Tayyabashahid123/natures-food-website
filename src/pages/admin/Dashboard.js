import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "../../styles/admin.css";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return setError("Not authorized");

    // Fetch orders
    const fetchOrders = fetch("http://localhost:5000/api/orders", { headers: { "x-auth-token": token } })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      });

    // Fetch products
    const fetchProducts = fetch("http://localhost:5000/api/products", { headers: { "x-auth-token": token } })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      });

    // Fetch admin info
    const fetchAdmin = fetch("http://localhost:5000/api/admin/me", { headers: { "x-auth-token": token } })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      });

    Promise.all([fetchOrders, fetchProducts, fetchAdmin])
      .then(([ordersData, productsData, adminData]) => {
        setOrders(ordersData);
        setProducts(productsData);
        setAdminEmail(adminData.email);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to fetch data");
        setLoading(false);
      });
  }, [token]);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // Metrics
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const avgOrderValue = totalOrders ? (totalSales / totalOrders).toFixed(2) : 0;
  const totalProductsSold = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  // Recent orders (latest 5)
  const recentOrders = orders.slice(0, 5);

  // Sales trend for last 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString();
  }).reverse();

  const salesTrend = last7Days.map(date => {
    const dailyTotal = orders
      .filter(o => new Date(o.createdAt).toLocaleDateString() === date)
      .reduce((sum, o) => sum + o.totalAmount, 0);
    return { date, total: dailyTotal };
  });

  // Low stock products
  const lowStockProducts = products.filter(p => p.stock <= 5);

  return (
    <div className="page dashboard">
      {/* Admin Info */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Sales Dashboard</h2>
        <p>Welcome, <strong>{adminEmail}</strong></p>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-cards" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div className="card">Total Sales: Rs {totalSales}</div>
        <div className="card">Total Orders: {totalOrders}</div>
        <div className="card">Pending Orders: {pendingOrders}</div>
        <div className="card">Average Order Value: Rs {avgOrderValue}</div>
        <div className="card">Products Sold: {totalProductsSold}</div>
      </div>

      {/* Sales Trend Chart */}
      <div style={{ marginTop: "30px" }}>
        <h3>Sales Trend (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesTrend}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div style={{ marginTop: "30px" }}>
        <h3>Recent Orders</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(o => (
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
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>Low Stock Products (≤5)</h3>
          <ul>
            {lowStockProducts.map(p => (
              <li key={p._id}>{p.name} - Stock: {p.stock}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
