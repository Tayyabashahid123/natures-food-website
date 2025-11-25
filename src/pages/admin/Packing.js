import React, { useEffect, useState } from "react";
import "../../styles/admin.css";

export default function Packing() {
  const [packingList, setPackingList] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("az");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/packing", {
      headers: { "x-auth-token": token }
    })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error("Backend did not return an array", data);
          setPackingList([]);
        } else {
          setPackingList(data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch packing list", err);
        setPackingList([]);
      });
  }, []);

  // search & sort
  const filteredList = packingList
    .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "az") return a.name.localeCompare(b.name);
      if (sortBy === "qty") return b.totalQuantity - a.totalQuantity;
      return 0;
    });

  return (
    <div className="packing-container">
      <h1 className="heading">Packing List</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="az">Sort: A - Z</option>
          <option value="qty">Sort: Highest Quantity</option>
        </select>
      </div>

      <table className="packing-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Total Quantity</th>
            <th>Customers</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.totalQuantity}</td>
              <td>{item.customers.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
