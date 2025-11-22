import { useEffect, useState } from "react";

export default function Inventory() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <div className="page">
      <h2>Inventory</h2>

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
          {products.map(p => {
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
          })}
        </tbody>

      </table>
    </div>
  );
}
