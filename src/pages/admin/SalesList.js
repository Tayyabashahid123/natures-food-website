import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function SalesList() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("dateDesc");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const token = localStorage.getItem("token");

  const fetchSales = () => {
    fetch("http://localhost:5000/api/orders", {
      headers: { "x-auth-token": token }
    })
      .then(res => res.json())
      .then(data => {
        setSales(data.filter(o => (o.status === "completed")));
      })
      .catch(err => console.error(err));
  };
  

  useEffect(() => {
    fetchSales();
  }, []);

  // Apply customer search filter
  let filteredSales = sales.filter(s =>
    (s.customerName || "Walk-in").toLowerCase().includes(search.toLowerCase())
  );

    // Payment filter
  if (paymentFilter !== "all") {
    filteredSales = filteredSales.filter(
      s => s.paymentMethod === paymentFilter
    );
  }

  // Date filters
  if (startDate)
    filteredSales = filteredSales.filter(
      s => new Date(s.createdAt) >= new Date(startDate)
    );

  if (endDate)
    filteredSales = filteredSales.filter(
      s => new Date(s.createdAt) <= new Date(endDate)
    );


  // Compute profit and discount
  filteredSales = filteredSales.map(s => {
    const profitAmount = (s.subtotal * (s.profit || 0)) / 100;
    const discountAmount = (s.subtotal * (s.discount || 0)) / 100;

    return {
      ...s,
      computedProfit: profitAmount,
      computedDiscount: discountAmount
    };
  });

  // Sorting
  if (sortBy === "dateAsc")
    filteredSales.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else if (sortBy === "dateDesc")
    filteredSales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sortBy === "totalAsc")
    filteredSales.sort((a, b) => a.totalAmount - b.totalAmount);
  else if (sortBy === "totalDesc")
    filteredSales.sort((a, b) => b.totalAmount - a.totalAmount);
  else if (sortBy === "profitAsc")
    filteredSales.sort((a, b) => a.computedProfit - b.computedProfit);
  else if (sortBy === "profitDesc")
    filteredSales.sort((a, b) => b.computedProfit - a.computedProfit);
  else if (sortBy === "discountAsc")
    filteredSales.sort((a, b) => a.computedDiscount - b.computedDiscount);
  else if (sortBy === "discountDesc")
    filteredSales.sort((a, b) => b.computedDiscount - a.computedDiscount);

  return (
    <div className="page">
      <h2>Sales History</h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />

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

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="dateDesc">Date: Newest → Oldest</option>
          <option value="dateAsc">Date: Oldest → Newest</option>
          <option value="totalDesc">Total: High → Low</option>
          <option value="totalAsc">Total: Low → High</option>
          <option value="profitDesc">Profit: High → Low</option>
          <option value="profitAsc">Profit: Low → High</option>
          <option value="discountDesc">Discount: High → Low</option>
          <option value="discountAsc">Discount: Low → High</option>
        </select>
      </div>


      <select
        value={paymentFilter}
        onChange={e => setPaymentFilter(e.target.value)}
        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
      >
        <option value="all">All Payments</option>
        <option value="credit">Credit</option>
        <option value="paid">Paid</option>
      </select>

      <table className="table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Subtotal</th>
            <th>Profit</th>
            <th>Discount</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Payment</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filteredSales.length > 0 ? (
            filteredSales.map(s => (
              <tr key={s._id}>
                <td>{s.customerName || "Walk-in"}</td>
                <td>Rs {s.subtotal}</td>
                <td>Rs {s.computedProfit.toFixed(2)} ({s.profit || 0}%)</td>
                <td>Rs {s.computedDiscount.toFixed(2)} ({s.discount || 0}%)</td>
                <td>Rs {s.totalAmount}</td>
                <td>{s.status}</td>
                <td>{new Date(s.saledAt).toLocaleString()}</td>
                <td>{s.paymentMethod}</td>
                <td>
                  {/* Customer Detail button using order ID */}
                  <Link to={`/admin/customers/${s._id}`}>
                    <button className="view-btn">Customer Detail</button>
                  </Link>

                  {/* Receipt button */}
                  <Link to={`/admin/sales/${s._id}`}>
                    <button className="view-btn">Receipt</button>
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", color: "#888" }}>
                No sales found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
