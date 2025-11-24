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

  console.log(sale)
  return (
    <>
      <button className="print-btn" onClick={printReceipt}>Print Receipt</button>
    <div className="receipt-container">


      <div className="company-detail">
        <h2> Nature's Food</h2>
        <span> <em> Commercial Canal City, Lahore, Punjab </em></span>
        <br/>
        <span> <em>03219488975 </em></span>

        <br/>
        <h2> Invoice</h2>
      </div>

      <div className="sale-detail">
      <p><strong>Customer:</strong> {sale.customerName || "Walk-in"}</p>
      <p><strong>Payment Method:</strong> {sale.paymentMethod}</p>
      <p><strong>Cashier:</strong> Admin</p>
      <p><strong>Date:</strong> {new Date(sale.createdAt).toLocaleString()}</p>
      <br/>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Sr#</th>
            <th>Item Name</th>
            <th>Price</th>
            <th>Qty</th>
            <th> Discount</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {sale.items.map((item, index) => (
            <tr key={item.productId}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>Rs {item.price}</td>
              <td>{item.quantity}</td>
              <td>Rs {item.total * sale.discount/100}</td>
              <td>Rs {item.total -(item.total * sale.discount/100)}</td>
            </tr>
          ))}
        </tbody>

        <tbody>
          {sale.items.map((item, index) => (
            <tr key={item.productId}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>Rs {item.price}</td>
              <td>{item.quantity}</td>
              <td>Rs {item.total * sale.discount/100}</td>
              <td>Rs {item.total -(item.total * sale.discount/100)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />

    <div className="payment-detail">
      <p><strong>Total:</strong> <span>Rs {sale.subtotal}</span></p>
      <p><strong>Discount:</strong> <span>Rs {sale.subtotal * sale.discount / 100}</span></p>
      <p><strong>Paid:</strong> <span>Rs {sale.totalAmount}</span></p>
    </div>


        <div className="thankyou-note">
          <p> <em> Thank you for shopping with us. </em> </p>
          <p>  <em>Discounted Items cannot be returned or refunded. Please bring orignal invoice for returns.</em></p>
        </div>
    </div>
    </>
  );
}
