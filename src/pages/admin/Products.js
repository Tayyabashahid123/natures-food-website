import { useState, useEffect } from "react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");             // Sale Price
  const [purchasePrice, setPurchasePrice] = useState(""); // Purchase Price
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("nameAsc");

  const token = localStorage.getItem("token");

  // ---------------- Fetch Products ----------------
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        headers: { "x-auth-token": token },
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

  // ---------------- Add / Update Product ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !purchasePrice || !stock) {
      return alert("Please fill all required fields");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("purchasePrice", purchasePrice);
    formData.append("stock", stock);
    formData.append("description", description);
    formData.append("category", category);
    if (image) formData.append("image", image);

    let url = "http://localhost:5000/api/products";
    let method = "POST";
    if (editingId) {
      url += `/${editingId}`;
      method = "PUT";
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "x-auth-token": token },
        body: formData, // Do NOT set content-type manually for FormData
      });

      const data = await res.json();

      if (res.ok) {
        fetchProducts();
        // Reset form
        setName("");
        setDescription("");
        setPrice("");
        setPurchasePrice("");
        setStock("");
        setCategory("");
        setImage(null);
        setEditingId(null);
      } else {
        alert(data.message || "Error adding/updating product");
      }
    } catch (err) {
      console.error(err);
      alert("Request failed");
    }
  };

  // ---------------- Edit Product ----------------
  const handleEdit = (p) => {
    setName(p.name);
    setDescription(p.description || "");
    setPrice(p.price);
    setPurchasePrice(p.purchasePrice || "");
    setStock(p.stock);
    setCategory(p.category || "");
    setImage(null);
    setEditingId(p._id);
  };

  // ---------------- Delete Product ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      if (res.ok) fetchProducts();
      else alert("Delete failed");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // ---------------- Filter & Sort ----------------
  let filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy === "nameAsc") filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "nameDesc") filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
  else if (sortBy === "stockAsc") filteredProducts.sort((a, b) => a.stock - b.stock);
  else if (sortBy === "stockDesc") filteredProducts.sort((a, b) => b.stock - a.stock);
  else if (sortBy === "priceAsc") filteredProducts.sort((a, b) => a.price - b.price);
  else if (sortBy === "priceDesc") filteredProducts.sort((a, b) => b.price - a.price);

  return (
    <div>
      <h2>Products</h2>

      {/* Add / Edit Form */}
      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Product" : "Add Product"}</h3>

        <div className="form-group">
          <label>Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Sale Price *</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Purchase Price *</label>
          <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Stock *</label>
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        </div>

        <button type="submit">{editingId ? "Update Product" : "Add Product"}</button>
      </form>

      <br />

      {/* Search & Sort */}
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
      />
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="nameAsc">Name: A → Z</option>
        <option value="nameDesc">Name: Z → A</option>
        <option value="stockAsc">Stock: Low → High</option>
        <option value="stockDesc">Stock: High → Low</option>
        <option value="priceAsc">Price: Low → High</option>
        <option value="priceDesc">Price: High → Low</option>
      </select>

      {/* Products Table */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Sale Price</th>
            <th>Purchase Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? filteredProducts.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>Rs {p.price}</td>
              <td>Rs {p.purchasePrice}</td>
              <td>{p.stock}</td>
              <td>{p.category}</td>
              <td>{p.image ? <img src={`http://localhost:5000/${p.image}`} alt={p.name} width="50" /> : "-"}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>{" "}
                <button onClick={() => handleDelete(p._id)}>Delete</button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", color: "#888" }}>No products found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
