import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "../../styles/admin/Dashboard.css";
import API_URL from "../../config.js";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    if (!token) {
      setError("Not authorized");
      setLoading(false);
      return;
    }

    const fetchOrders = fetch(`${API_URL}/api/orders`, {
      headers: { "x-auth-token": token },
    }).then((res) => res.json());

    const fetchProducts = fetch(`${API_URL}/api/products`, {
      headers: { "x-auth-token": token },
    }).then((res) => res.json());

    const fetchAdmin = fetch(`${API_URL}/api/admin/me`, {
      headers: { "x-auth-token": token },
    }).then((res) => res.json());

    Promise.all([fetchOrders, fetchProducts, fetchAdmin])
      .then(([ordersData, productsData, adminData]) => {
        setOrders(ordersData || []);
        setProducts(productsData || []);
        setAdminEmail(adminData?.email || "");
      })
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, [token]);

  // ---------------- LOADING / ERROR ----------------
  if (loading) {
    return <div className="dashboard-state">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-state error">{error}</div>;
  }

  // ---------------- SAFE CALCULATIONS ----------------
  const totalSales = orders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );

  const totalOrders = orders.length;

  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const avgOrderValue =
    totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;

  const totalProductsSold = orders
    .filter((o) => o.status === "completed")
    .reduce(
      (sum, o) =>
        sum +
        (o.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0),
      0
    );

  const recentOrders = orders.slice(0, 5);

  // ---------------- SALES CHART ----------------
  const today = new Date();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toDateString();
  }).reverse();

  const salesTrend = last7Days.map((date) => {
    const dailyTotal = orders
      .filter(
        (o) => new Date(o.createdAt).toDateString() === date
      )
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      total: dailyTotal,
    };
  });

  // ---------------- LOW STOCK ----------------
  const lowStockProducts = products.filter((p) => (p.stockGrams || 0) <= 5);

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h2>Sales Dashboard</h2>
          <p>
            Welcome back, <strong>{adminEmail || "Admin"}</strong>
          </p>
        </div>
      </div>

      {/* METRICS */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h4>Total Sales</h4>
          <p>Rs {totalSales.toFixed(2)}</p>
        </div>

        <div className="metric-card">
          <h4>Total Orders</h4>
          <p>{totalOrders}</p>
        </div>

        <div className="metric-card">
          <h4>Pending Orders</h4>
          <p>{pendingOrders}</p>
        </div>

        <div className="metric-card">
          <h4>Avg Order Value</h4>
          <p>Rs {avgOrderValue}</p>
        </div>

        <div className="metric-card highlight">
          <h4>Products Sold</h4>
          <p>{totalProductsSold}</p>
        </div>
      </div>

      {/* CHART */}
      <div className="chart-box">
        <h3>Sales Trend (Last 7 Days)</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#4c4cff"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* RECENT ORDERS */}
      <div className="section">
        <h3>Recent Orders</h3>

        {recentOrders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((o) => (
                <tr key={o._id}>
                  <td>{o.customerName || "Walk-in"}</td>
                  <td>Rs {o.totalAmount}</td>
                  <td>{o.paymentMethod}</td>
                  <td>{o.status}</td>
                  <td>
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <Link to={`/admin/orders/${o._id}`}>
                      <button className="view-btn">View</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* LOW STOCK */}
      {lowStockProducts.length > 0 && (
        <div className="section warning-box">
          <h3>⚠ Low Stock Products</h3>
          <ul>
            {lowStockProducts.map((p) => (
              <li key={p._id}>
                {p.name} — Stock: {p.stockGrams}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}