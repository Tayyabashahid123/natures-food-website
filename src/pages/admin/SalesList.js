import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function SalesList() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("dateDesc"); // default: newest first
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const token = localStorage.getItem("token");

  const fetchSales = () => {
    fetch("http://localhost:5000/api/orders", {
      headers: { "x-auth-token": token }
    })
      .then(res => res.json())
      .then(data => {
        setSales(data.filter(o => o.status === "completed"));
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Filter and sort sales
  let filteredSales = sales
    .filter(s => (s.customerName || "Walk-in").toLowerCase().includes(search.toLowerCase()));

  // Date range filter
  if (startDate) filteredSales = filteredSales.filter(s => new Date(s.createdAt) >= new Date(startDate));
  if (endDate) filteredSales = filteredSales.filter(s => new Date(s.createdAt) <= new Date(endDate));

  // Sorting
  if (sortBy === "dateAsc") filteredSales.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else if (sortBy === "dateDesc") filteredSales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sortBy === "totalAsc") filteredSales.sort((a, b) => a.totalAmount - b.totalAmount);
  else if (sortBy === "totalDesc") filteredSales.sort((a, b) => b.totalAmount - a.totalAmount);

  return (
    <div className="page">
      <h2>Sales History</h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search by customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />

        {/* Date Range */}
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="dateDesc">Date: Newest → Oldest</option>
          <option value="dateAsc">Date: Oldest → Newest</option>
          <option value="totalDesc">Total: High → Low</option>
          <option value="totalAsc">Total: Low → High</option>
        </select>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Subtotal</th>
            <th>Discount</th>
            <th>Total Amount</th>
            <th>Method</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filteredSales.length > 0 ? filteredSales.map(s => (
            <tr key={s._id}>
              <td>{s.customerName || "Walk-in"}</td>
              <td>Rs {s.subtotal}</td>
              <td>Rs {(s.subtotal * s.discount/100).toFixed(2)} ({s.discount}%)</td>
              <td>Rs {s.totalAmount}</td>
              <td>{s.paymentMethod}</td>
              <td>{new Date(s.createdAt).toLocaleString()}</td>
              <td>
                <Link to={`/admin/sales/${s._id}`}>
                  <button className="view-btn">Receipt</button>
                </Link>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", color: "#888" }}>No sales found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
