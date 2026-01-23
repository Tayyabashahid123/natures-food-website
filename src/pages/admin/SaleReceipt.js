import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/admin/SaleReceipt.css";

export default function SaleReceipt() {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    document.body.classList.add("print-receipt");

    fetch(`http://localhost:5000/api/orders/${id}`, {
      headers: { "x-auth-token": token }
    })
      .then(res => res.json())
      .then(data => {
        if (!["completed", "returned"].includes(data.status)) {
          setError("This order cannot be printed.");
          return;
        }
        setSale(data);
      })
      .catch(() => setError("Failed to fetch receipt"));

    return () => {
      document.body.classList.remove("print-receipt");
    };
  }, [id, token]);

  const printReceipt = () => window.print();

  const returnSale = async () => {
    if (!window.confirm("Are you sure you want to return this sale?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/${id}/return`,
        {
          method: "PATCH",
          headers: {
            "x-auth-token": token
          }
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSale(data.order);
      alert("Sale returned successfully");
    } catch (err) {
      alert(err.message || "Return failed");
    }
  };


  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!sale) return <p>Loading receipt...</p>;

  const isReturn = sale.status === "returned";

  const profitPercent = Number(sale.profit || 0);
  const discountPercent = Number(sale.discount || 0);

  const items = sale.items.map(item => {
    const baseTotal = item.price * item.quantity;
    const profitAmount = baseTotal * (profitPercent / 100);
    const totalWithProfit = baseTotal + profitAmount;
    const discountAmount = totalWithProfit * (discountPercent / 100);

    return {
      ...item,
      finalTotal: totalWithProfit - discountAmount
    };
  });

  const subtotal = items.reduce((s, i) => s + i.finalTotal, 0);

  return (
    <>
      <div style={{ marginBottom: "10px" }}>
        <button className="print-btn" onClick={printReceipt}>
          Print {isReturn ? "Return Receipt" : "Receipt"}
        </button>

        {!isReturn && (
          <button
            className="return-btn"
            onClick={returnSale}
            style={{ marginLeft: "10px", background: "red", color: "white" }}
          >
            Return Sale
          </button>
        )}
      </div>


      <div className="receipt-container">

        {/* HEADER */}
        <div className={`company-detail ${isReturn ? "return" : ""}`}>
          <h1>Nature's Food</h1>
          <p>Commercial Canal City, Lahore</p>
          <p>📞 0321-9488975</p>

          <h2>{isReturn ? "SALE RETURN" : "INVOICE"}</h2>
        </div>

        <hr />

        {/* INFO */}
        <div className="sale-detail">
          <div>
            <p><strong>Customer:</strong> {sale.customerName || "Walk-in"}</p>
            <p><strong>Payment:</strong> {sale.paymentMethod}</p>
          </div>
          <div>
            <p><strong>Cashier:</strong> Admin</p>
            <p><strong>Date:</strong> {new Date(sale.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* TABLE */}
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.productId}>
                <td>{i + 1}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>
                  Rs {isReturn ? `-${item.finalTotal.toFixed(2)}` : item.finalTotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* TOTAL */}
        <div className="payment-detail">
          <p className="grand-total">
            <span>{isReturn ? "Refunded Amount" : "Final Paid"}</span>
            <span>
              Rs {isReturn ? `-${subtotal.toFixed(2)}` : subtotal.toFixed(2)}
            </span>
          </p>
        </div>

        <hr />

        {/* FOOTER */}
        <div className="thankyou-note">
          {isReturn ? (
            <p><strong>Sale Returned Successfully</strong></p>
          ) : (
            <p>Thank you for shopping with us ❤️</p>
          )}
        </div>

      </div>
    </>
  );
}
