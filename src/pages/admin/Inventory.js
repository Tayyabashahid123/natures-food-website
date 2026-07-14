import { useEffect, useState } from "react";
import StockIn from "./StockIn";
import InventoryHistory from "./InventoryHistory";
import "../../styles/admin/Inventory.css";
import API_URL from "../../config";

export default function Inventory() {
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("nameAsc");
  const token = localStorage.getItem("token");

    const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        headers: {
          "x-auth-token": token,
        },
      });

      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const filtered = products
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "nameAsc") return a.name.localeCompare(b.name);
      if (sortBy === "nameDesc") return b.name.localeCompare(a.name);
      if (sortBy === "stockAsc") return a.stockGrams - b.stockGrams;
      if (sortBy === "stockDesc") return b.stockGrams - a.stockGrams;
      return 0;
    });

  return (
    <div className="inventory-page">

      {/* HEADER */}
      <div className="inventory-header">
        <div>
          <h1>Inventory</h1>
          <p>Manage stock, products and levels</p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="inventory-controls">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="nameAsc">Name A → Z</option>
          <option value="nameDesc">Name Z → A</option>
          <option value="stockAsc">Stock Low → High</option>
          <option value="stockDesc">Stock High → Low</option>
        </select>
      </div>

      {/* TABLE CARD */}
      <div className="inventory-card">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Slabs</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(p => {
              const status =
                p.stockGrams <= 0
                  ? "out"
                  : p.stockGrams < 10
                  ? "low"
                  : "good";

              return (
                <tr key={p._id}>
                  <td className="product-name">{p.name}</td>

                  <td className="stock">
                    {p.stockGrams} g
                  </td>

                  <td>
                    <span className={`status ${status}`}>
                      {status === "out"
                        ? "Out of Stock"
                        : status === "low"
                        ? "Low Stock"
                        : "In Stock"}
                    </span>
                  </td>

                  <td className="slabs">
                    {p.slabs?.map((s, i) => (
                      <div key={i} className="slab-item">
                        {s.label} — Rs {s.salePrice}
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* STOCK IN */}
      <div className="section">
        <StockIn onStockUpdate={() => { 
            setRefreshHistory(prev => prev + 1); 
            fetchProducts();
          }}/>
      </div>

      {/* HISTORY */}
      <div className="section">
        <InventoryHistory refreshTrigger={refreshHistory}/>
      </div>
    </div>
  );
}