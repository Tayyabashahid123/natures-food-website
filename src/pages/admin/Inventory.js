import { useEffect, useState } from "react";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("nameAsc"); // default sort

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  // Filtered and sorted products
  let filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy === "nameAsc") filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "nameDesc") filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
  else if (sortBy === "stockAsc") filteredProducts.sort((a, b) => a.stock - b.stock);
  else if (sortBy === "stockDesc") filteredProducts.sort((a, b) => b.stock - a.stock);
  else if (sortBy === "priceAsc") filteredProducts.sort((a, b) => a.price - b.price);
  else if (sortBy === "priceDesc") filteredProducts.sort((a, b) => b.price - a.price);

  return (
    <div className="page">
      <h2>Inventory</h2>

      {/* Search and Sort */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginRight: "10px"
          }}
        />

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="nameAsc">Name: A → Z</option>
          <option value="nameDesc">Name: Z → A</option>
          <option value="stockAsc">Stock: Low → High</option>
          <option value="stockDesc">Stock: High → Low</option>
          <option value="priceAsc">Price: Low → High</option>
          <option value="priceDesc">Price: High → Low</option>
        </select>
      </div>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Price</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(p => {
              let status =
                p.stock === 0 ? "Out of Stock" :
                p.stock < 10 ? "Low Stock" :
                "In Stock";

              return (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.stock}</td>
                  <td>{status}</td>
                  <td>Rs {p.price}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", color: "#888" }}>
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
