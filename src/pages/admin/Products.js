import { useState, useEffect } from "react";
import "../../styles/admin/Products.css";
import API_URL from "../../config";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [stockGrams, setStockGrams] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Slab inputs
  const [slabs, setSlabs] = useState([]);
  const [slabLabel, setSlabLabel] = useState("");
  const [slabType, setSlabType] = useState("GRAM");
  const [slabGramsUsed, setSlabGramsUsed] = useState("");
  const [slabSalePrice, setSlabSalePrice] = useState("");
  const [slabPurchaseCost, setSlabPurchaseCost] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("nameAsc");

  const token = localStorage.getItem("token");

  // ------------------ Fetch Products ------------------
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/api/products`, {
          headers: { "x-auth-token": token },
        });
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProducts();
  }, [token]);

  // ------------------ Add / Update Slab ------------------
  const handleAddSlab = () => {
    // validation
    if (
      slabLabel.trim() === "" ||
      slabGramsUsed === "" ||
      isNaN(slabGramsUsed) ||
      slabSalePrice === "" ||
      isNaN(slabSalePrice) ||
      slabPurchaseCost === "" ||
      isNaN(slabPurchaseCost)
    ) {
      return alert("Fill all slab fields (0 is allowed)");
    }

    const slabObj = {
      label: slabLabel,
      type: slabType,
      gramsUsed: parseFloat(slabGramsUsed),
      salePrice: parseFloat(slabSalePrice),
      purchaseCost: parseFloat(slabPurchaseCost),
    };

    setSlabs([...slabs, slabObj]);

    // reset slab inputs
    setSlabLabel("");
    setSlabType("GRAM");
    setSlabGramsUsed("");
    setSlabSalePrice("");
    setSlabPurchaseCost("");
  };

  const handleDeleteSlab = (index) => {
    setSlabs(slabs.filter((_, i) => i !== index));
  };

  // ------------------ Add / Update Product ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (name.trim() === "" || stockGrams === "" || isNaN(stockGrams)) {
      return alert("Product name and stock are required");
    }
    if (slabs.length === 0) return alert("Add at least one slab");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("stockGrams", stockGrams);
    formData.append("category", category);
    formData.append("slabs", JSON.stringify(slabs));
    if (image) formData.append("image", image);

    let url = `${API_URL}/api/product`;
    let method = "POST";
    if (editingId) {
      url += `/${editingId}`;
      method = "PUT";
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "x-auth-token": token },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        // Reset
        setName("");
        setStockGrams("");
        setCategory("");
        setSlabs([]);
        setImage(null);
        setEditingId(null);

        // Refresh list
        const res2 = await fetch(`${API_URL}/api/products`, {
          headers: { "x-auth-token": token },
        });
        const data2 = await res2.json();
        setProducts(data2);
      } else {
        alert(data.message || "Error adding/updating product");
      }
    } catch (err) {
      console.error(err);
      alert("Request failed");
    }
  };

  // ------------------ Edit Product ------------------
  const handleEditProduct = (p) => {
    setName(p.name);
    setStockGrams(p.stockGrams);
    setCategory(p.category || "");
    setSlabs(p.slabs || []);
    setImage(null);
    setEditingId(p._id);
  };

  // ------------------ Delete Product ------------------
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      if (res.ok) setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // ------------------ Filter & Sort ------------------
  let filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy === "nameAsc")
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "nameDesc")
    filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
  else if (sortBy === "stockAsc") filteredProducts.sort((a, b) => a.stockGrams - b.stockGrams);
  else if (sortBy === "stockDesc") filteredProducts.sort((a, b) => b.stockGrams - a.stockGrams);

return (
  <div className="products-page">
    <div className="products-container">

      <div className="page-header">
        <h2>Products</h2>
        <p>Manage inventory, pricing slabs & stock levels</p>
      </div>

      {/* Product Form */}
      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Product" : "Add Product"}</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Stock (grams) *</label>
            <input type="number" value={stockGrams} onChange={(e) => setStockGrams(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>

          {/* <div className="form-group">
            <label>Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          </div> */}
        </div>

        <h4>Slabs</h4>
        <div className="slab-inputs">
          <input placeholder="Label (e.g., 20g)" value={slabLabel} onChange={(e) => setSlabLabel(e.target.value)} />
          <select value={slabType} onChange={(e) => setSlabType(e.target.value)}>
            <option value="GRAM">GRAM</option>
            <option value="AMOUNT">AMOUNT</option>
          </select>
          <input type="number" placeholder="Grams used" value={slabGramsUsed} onChange={(e) => setSlabGramsUsed(e.target.value)} />
          <input type="number" placeholder="Purchase Cost" value={slabPurchaseCost} onChange={(e) => setSlabPurchaseCost(e.target.value)} />
          <input type="number" placeholder="Sale Price" value={slabSalePrice} onChange={(e) => setSlabSalePrice(e.target.value)} />
          <button type="button" onClick={handleAddSlab}>Add Slab</button>
        </div>

        {slabs.length > 0 && (
          <ul className="slab-list">
            {slabs.map((s, i) => (
              <li key={i}>
                {s.label} · {s.gramsUsed}g · Sale Rs {s.salePrice} · Cost Rs {s.purchaseCost}
                <button type="button" onClick={() => handleDeleteSlab(i)}>✕</button>
              </li>
            ))}
          </ul>
        )}

        <button type="submit">{editingId ? "Update Product" : "Add Product"}</button>
      </form>

      {/* Table */}
      <div className="table-card">

        <div className="table-toolbar">
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="nameAsc">Name A→Z</option>
            <option value="nameDesc">Name Z→A</option>
            <option value="stockAsc">Stock Low→High</option>
            <option value="stockDesc">Stock High→Low</option>
          </select>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Stock</th>
              <th>Category</th>
              {/* <th>Image</th> */}
              <th>Slabs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <tr key={p._id}>
                  <td data-label="Name">{p.name}</td>
                  <td data-label="Stock">{p.stockGrams} g</td>
                  <td data-label="Category">{p.category || "-"}</td>
                  {/* <td data-label="Image">
                    {p.image ? (
                      <img src={`${API_URL}/${p.image}`} alt={p.name} />
                    ) : "-"}
                  </td>
                  */}
                  <td data-label="Slabs">
                    {p.slabs?.map((s, i) => (
                      <div key={i}>{s.label} — Rs {s.salePrice}</div>
                    ))}
                  </td> 
                  <td data-label="Actions">
                    <button className="edit-btn" onClick={() => handleEditProduct(p)}>Edit</button>
                    <button className="delete-button" onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>No products found</td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
    </div>
  </div>
);
}
