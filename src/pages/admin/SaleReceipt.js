import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function SaleReceipt() {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    // ENABLE PRINT MODE
    document.body.classList.add("print-receipt");

    fetch(`http://localhost:5000/api/orders/${id}`, {
      headers: { "x-auth-token": token }
    })
      .then(async (res) => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          throw new Error("Invalid JSON: " + text);
        }
      })
      .then((data) => {
        if (data.status !== "completed") {
          setError("This order is not a completed sale.");
          return;
        }
        setSale(data);
      })
      .catch(() => setError("Failed to fetch sale"));

    return () => {
      // DISABLE PRINT MODE WHEN LEAVING THE PAGE
      document.body.classList.remove("print-receipt");
    };
  }, [id, token]);

  const printReceipt = () => window.print();

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!sale) return <p>Loading receipt...</p>;

  return (
    <div className="receipt-container">
      <h2>Sale Receipt</h2>

      <p><strong>Customer:</strong> {sale.customerName || "Walk-in"}</p>
      <p><strong>Payment Method:</strong> {sale.paymentMethod}</p>
      <p><strong>Date:</strong> {new Date(sale.createdAt).toLocaleString()}</p>

      <h3>Items</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {sale.items.map(item => (
            <tr key={item.productId}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>Rs {item.price}</td>
              <td>Rs {item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      {/* <h3>Subtotal: Rs {sale.subtotal}</h3>
      <h3>Tax: Rs {sale.tax}</h3> */}
      <h2>Total Paid: Rs {sale.totalAmount}</h2>

      <button className="print-btn" onClick={printReceipt}>Print Receipt</button>
    </div>
  );
}
