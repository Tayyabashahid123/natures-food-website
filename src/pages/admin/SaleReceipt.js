import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/admin/SaleReceipt.css";
import API_URL from "../../config";


export default function SaleReceipt() {
  const { id } = useParams();
   const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    document.body.classList.add("print-receipt");

    fetch(`${API_URL}/api/orders/${id}`, {
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
        `${API_URL}/api/orders/${id}/return`,
        {
          method: "PATCH",
          headers: {
            "x-auth-token": token
          }
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSale(data);
      alert("Sale returned successfully");
      navigate(`/admin/sales/${id}`)

    } catch (err) {
      alert(err.message || "Return failed");
    }
  };



  const paymentDone = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/orders/${id}/pay`,
        {
          method: "PATCH",
          headers: {
            "x-auth-token": token,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSale(data);

      alert("Payment marked as paid.");
    } catch (err) {
      alert(err.message || "Failed to update payment.");
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!sale) return <p>Loading receipt...</p>;

  const isReturn = sale.status === "returned";
  const isPaid = sale.paymentMethod == "paid"

  const items = sale.items;
  const subtotal = sale.subtotal;
  const totalAmount = sale.totalAmount;

  
  return (
    <>
      <div style={{ marginBottom: "10px" }}>
        <button className="print-btn" onClick={printReceipt}>
          Print {isReturn ? "Return Receipt" : "Receipt"}
        </button>

        {!isReturn && (
          <>
          <button
            className="return-btn"
            onClick={returnSale}
            style={{ marginLeft: "10px", background: "red", color: "white" }}
          >
            Return Sale
          </button>

          {!isPaid && (
          <button
            className="paid-btn"
            onClick={paymentDone}
            style={{ marginLeft: "10px", background: "green", color: "white" }}
            >
              Paid
          </button>
          )}
          </>
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
            <p>
              <strong>Sale Date:</strong>{" "}
              {sale.saledAt &&
                new Date(sale.saledAt).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
            </p>

            {sale.paidAt && (
              <p>
                <strong>Paid Date:</strong>{" "}
                {new Date(sale.paidAt).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            )}

          </div>
        </div>

        {/* TABLE */}
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              return (
              <tr key={item.productId}>
                <td>{i + 1}</td>
                <td>{item.productName} ({item.slabLabel})</td>
                <td>Rs {item.salePrice.toFixed(2)}</td> 
                <td>{item.quantity}</td>
                <td>  Rs {isReturn ? `-${(item.salePrice * item.quantity).toFixed(2)}` : (item.salePrice * item.quantity).toFixed(2)}
                </td>
              </tr>
              );
})}
          </tbody>
        </table>

        <hr />



      <div className="payment-detail">
        <p>
          <span>Subtotal</span>
          <span>Rs {sale.subtotal.toFixed(2)}</span>
        </p>

        <p>
          <span>Discount</span>
          <span>Rs {sale.discountAmount.toFixed(2)}</span>
        </p>

        <p className="grand-total">
          <span>{isReturn ? "Refunded Amount" : "Final Paid"}</span>
          <span>
            Rs {isReturn
              ? `-${sale.totalAmount.toFixed(2)}`
              : sale.totalAmount.toFixed(2)}
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
