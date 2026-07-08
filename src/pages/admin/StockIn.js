import { useEffect, useState, useRef } from "react";
import "../../styles/admin/StockIn.css";

export default function StockIn({ onStockUpdate = () => {} }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const token = localStorage.getItem("token");
  const listRef = useRef(null);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    fetch("http://localhost:5000/api/products", {
      headers: { "x-auth-token": token },
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
      });
  }, [token]);

  /* ================= FILTER ================= */
  useEffect(() => {
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProducts(filtered);
    setHighlightIndex(-1);
  }, [searchTerm, products]);

  /* ================= KEYBOARD NAV ================= */
  const handleKeyDown = (e) => {
    if (!filteredProducts.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex(prev => (prev + 1) % filteredProducts.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex(prev =>
        prev <= 0 ? filteredProducts.length - 1 : prev - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0) {
        const product = filteredProducts[highlightIndex];
        setSelectedProduct(product);
        setSearchTerm(product.name);
        setHighlightIndex(-1);
      }
    }
  };

  /* ================= SUBMIT STOCK ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct || quantity <= 0) {
      return alert("Select a product and enter valid quantity");
    }

    const productId = selectedProduct._id; // IMPORTANT FIX

    const res = await fetch(
      "http://localhost:5000/api/inventory/stock-in",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          productId,
          quantity,
          reason,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      alert("Stock added successfully");

      // reset UI
      setQuantity("");
      setReason("");
      setSelectedProduct(null);
      setSearchTerm("");

      // update parent safely
      if (onStockUpdate) {
        onStockUpdate(productId, data.newStock);
      }
    } else {
      alert(data.message || "Failed to add stock");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="stock-in-container">
      <h4>Add Stock</h4>

      <input
        type="text"
        placeholder="Search product..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        className="stock-search"
      />

      {/* PRODUCT LIST */}
      <div className="product-listed" ref={listRef}>
        {filteredProducts.length ? (
          filteredProducts.map((p, idx) => (
            <div
              key={p._id}
              className={`product-item
                ${selectedProduct?._id === p._id ? "selected" : ""}
                ${highlightIndex === idx ? "highlighted" : ""}
              `}
              onClick={() => {
                setSelectedProduct(p);
                setSearchTerm(p.name);
              }}
            >
              {p.name} | Stock: {p.stockGrams}g
            </div>
          ))
        ) : (
          <div className="no-products">No products found</div>
        )}
      </div>

      {/* INPUTS */}
      <input
        type="number"
        placeholder="Quantity (g)"
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
      />

      <input
        type="text"
        placeholder="Reason (optional)"
        value={reason}
        onChange={e => setReason(e.target.value)}
      />

      <button onClick={handleSubmit}>Add Stock</button>
    </div>
  );
}