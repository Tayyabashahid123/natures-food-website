import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/admin/ReturnedSales.css";

export default function ReturnedSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch returned sales
  useEffect(() => {
    const fetchReturned = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders/returned", {
          headers: { "x-auth-token": token },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            navigate("/admin/login");
          }
          return;
        }

        const data = await res.json();
        setSales(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReturned();
  }, [navigate, token]);

  // Filter + Search + Sort
  const filteredSales = useMemo(() => {
    let result = [...sales];
    const now = new Date();

    // Search
    if (search.trim()) {
      result = result.filter((s) =>
        (s.customerName || "walk-in")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Date filters
    if (filter === "today") {
      result = result.filter(
        (s) =>
          new Date(s.returnedAt).toDateString() === now.toDateString()
      );
    }

    if (filter === "week") {
      const start = new Date();
      start.setDate(now.getDate() - now.getDay());
      result = result.filter((s) => new Date(s.returnedAt) >= start);
    }

    if (filter === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      result = result.filter((s) => new Date(s.returnedAt) >= start);
    }

    if (filter === "custom" && customRange.start && customRange.end) {
      const start = new Date(customRange.start);
      const end = new Date(customRange.end);
      end.setHours(23, 59, 59, 999);

      result = result.filter(
        (s) =>
          new Date(s.returnedAt) >= start &&
          new Date(s.returnedAt) <= end
      );
    }

    // Sorting
    result.sort((a, b) => {
      const totalA = a.items.reduce((s, i) => s + i.price * i.quantity, 0);
      const totalB = b.items.reduce((s, i) => s + i.price * i.quantity, 0);

      if (sortBy === "latest") return new Date(b.returnedAt) - new Date(a.returnedAt);
      if (sortBy === "oldest") return new Date(a.returnedAt) - new Date(b.returnedAt);
      if (sortBy === "amount-high") return totalB - totalA;
      if (sortBy === "amount-low") return totalA - totalB;

      return 0;
    });

    return result;
  }, [sales, search, filter, sortBy, customRange]);

  // Summary
  const totalAmount = filteredSales.reduce(
    (sum, sale) =>
      sum +
      sale.items.reduce((s, i) => s + i.price * i.quantity, 0),
    0
  );

  return (
    <div className="returned-sales-page">
      <h2>Returned Sales</h2>

      {/* Filters */}
      <div className="top-bar">
        <input
          type="text"
          placeholder="Search by customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Range</option>
        </select>

        {filter === "custom" && (
          <>
            <input
              type="date"
              value={customRange.start}
              onChange={(e) =>
                setCustomRange({ ...customRange, start: e.target.value })
              }
            />
            <input
              type="date"
              value={customRange.end}
              onChange={(e) =>
                setCustomRange({ ...customRange, end: e.target.value })
              }
            />
          </>
        )}

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="latest">Date: Newest → Oldest</option>
          <option value="oldest">Date: Oldest → Newest</option>
          <option value="amount-high">Amount: High → Low</option>
          <option value="amount-low">Amount: Low → High</option>
        </select>
      </div>

      {/* Summary */}
      <div className="summary-bar">
        <span>Total Returned Sales: {filteredSales.length}</span>
        <span>Total Refund: Rs {totalAmount.toFixed(2)}</span>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Returned At</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="no-data">Loading...</td>
              </tr>
            ) : filteredSales.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No returned sales found</td>
              </tr>
            ) : (
              filteredSales.map((sale, index) => {
                const total = sale.items.reduce(
                  (s, i) => s + i.price * i.quantity,
                  0
                );

                return (
                  <tr key={sale._id}>
                    <td>{index + 1}</td>
                    <td>{sale.customerName || "Walk-in"}</td>
                    <td>{sale.items.length}</td>
                    <td>Rs {total.toFixed(2)}</td>
                    <td>{new Date(sale.returnedAt).toLocaleString()}</td>
                    <td>
                      <Link to={`/admin/sales/${sale._id}`} className="view-btn">
                        Receipt
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
