import { useState, useEffect } from "react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null); // will store the file
  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch all products
  const fetchProducts = () => {
    fetch("http://localhost:5000/api/products", { headers: { "x-auth-token": token } })
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
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
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        fetchProducts();  // refresh list
        setName(""); setDescription(""); setPrice(""); setStock(""); setCategory(""); setImage(null); setEditingId(null);
      } else {
        alert(data.msg || JSON.stringify(data) || "Error");
      }
    } catch (err) {
      console.error(err);
      alert("Request failed");
    }
  };

  // Edit product
  const handleEdit = (p) => {
    setName(p.name);
    setDescription(p.description || "");
    setPrice(p.price);
    setStock(p.stock);
    setCategory(p.category || "");
    setImage(null); // user can upload a new image
    setEditingId(p._id);
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token }
      });
      if (res.ok) fetchProducts();
      else alert("Delete failed");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div>
      <h2>Products</h2>
      <br/>
      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Product" : "Add Product"}</h3>
        <br/>

        <div className="form-group">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Stock</label>
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

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th><th>Description</th><th>Price</th><th>Stock</th><th>Category</th><th>Image</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>Rs{p.price}</td>
              <td>{p.stock}</td>
              <td>{p.category}</td>
              <td>{p.image ? <img src={`http://localhost:5000/${p.image}`} alt={p.name} width="50" /> : "-"}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>{" "}
                <button onClick={() => handleDelete(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
