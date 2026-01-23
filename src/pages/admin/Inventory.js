import { useEffect, useState } from "react";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("nameAsc");
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState("");
  const token = localStorage.getItem("token");

  // Fetch products
  useEffect(() => {
    fetch("http://localhost:5000/api/products", {
      headers: { "x-auth-token": token }
    })
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, [token]);

  // Filter + Sort
  let filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy === "nameAsc") filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "nameDesc") filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
  else if (sortBy === "stockAsc") filteredProducts.sort((a, b) => a.stock - b.stock);
  else if (sortBy === "stockDesc") filteredProducts.sort((a, b) => b.stock - a.stock);
  else if (sortBy === "priceAsc") filteredProducts.sort((a, b) => a.price - b.price);
  else if (sortBy === "priceDesc") filteredProducts.sort((a, b) => b.price - a.price);

  // Save stock to backend
  const handleSaveStock = async (id) => {
    if (editStock === "" || editStock < 0) {
      alert("Please enter valid stock");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify({ stock: Number(editStock) }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to update stock");
      }

      setProducts(prev =>
        prev.map(p => p._id === id ? { ...p, stock: Number(editStock) } : p)
      );

      setEditingId(null);
      setEditStock("");
    } catch (err) {
      console.error(err);
      alert("Could not update stock: " + err.message);
    }
  };

  // Key handlers for Enter and Escape
  const handleKeyDown = (e, id) => {
    if (e.key === "Enter") handleSaveStock(id);
    if (e.key === "Escape") {
      setEditingId(null);
      setEditStock("");
    }
  };

  return (
    <div className="page">
      <h2>Inventory</h2>
      <br />

      {/* Search + Sort */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: 4,
            border: "1px solid #ccc",
            marginRight: 10
          }}
        />

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
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
            <th>Purchase Price</th>
            <th>Sale Price</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(p => {
              const status =
                p.stock <= 0 ? "Out of Stock" :
                p.stock < 10 ? "Low Stock" :
                "In Stock";

              return (
                <tr key={p._id}>
                  <td>{p.name}</td>

                  <td>
                    {editingId === p._id ? (
                      <input
                        type="number"
                        value={editStock}
                        autoFocus
                        onChange={(e) =>
                          setEditStock(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        onKeyDown={(e) => handleKeyDown(e, p._id)}
                        style={{ width: 80 }}
                      /> 
                    ) : (
                      `${p.stock}g`
                    )}
                  </td>

                  <td>{status}</td>
                  <td>{p.purchasePrice}</td>
                  <td>Rs {p.price}</td>

                  <td>
                    {editingId === p._id ? (
                      <button onClick={() => handleSaveStock(p._id)}>Save</button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(p._id);
                          setEditStock(p.stock);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", color: "#888" }}>
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
