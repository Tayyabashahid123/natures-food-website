import React, { useEffect, useState } from "react";
import "../../styles/admin/Packing.css";

export default function Packing() {
  const [packingList, setPackingList] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("az");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/api/packing", {
      headers: { "x-auth-token": token }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPackingList(data);
        } else {
          console.error("Packing API did not return array:", data);
          setPackingList([]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch packing list", err);
        setPackingList([]);
      });
  }, [token]);

  // 🔍 Search + Sort (SAFE)
  const filteredList = packingList
    .filter(item =>
      (item.productName ?? "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "az") {
        return (a.productName ?? "").localeCompare(b.productName ?? "");
      }

      if (sortBy === "qty") {
        return (b.packets ?? 0) - (a.packets ?? 0);
      }

      return 0;
    });

return (
  <div className="packing-container">
    <div className="packing-header">
      <h1>Packing List</h1>
      <p>Track packed quantities and customer orders</p>
    </div>

    <div className="packing-card">
      <div className="controls">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="az">Sort: A - Z</option>
          <option value="qty">Sort: Highest Packets</option>
        </select>
      </div>

      <table className="packing-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Slab</th>
            <th>Packets</th>
            <th>Total Grams</th>
            <th>Customers</th>
          </tr>
        </thead>

        <tbody>
          {filteredList.length > 0 ? (
            filteredList.map(item => (
              <tr key={`${item.productName}-${item.slabLabel}`}>
                <td className="product-name">{item.productName}</td>
                <td>{item.slabLabel}</td>
                <td>
                  <span className="packets-pill">{item.packets ?? 0}</span>
                </td>
                <td>{item.totalGrams ?? 0} g</td>
                <td>
                  {Array.isArray(item.customers) && item.customers.length > 0
                    ? item.customers.join(", ")
                    : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="empty-row">No pending packing items</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
}
