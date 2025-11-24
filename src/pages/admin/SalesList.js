import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function SalesList() {
  const [sales, setSales] = useState([]);
  const token = localStorage.getItem("token");

  const fetchSales = () => {
    fetch("http://localhost:5000/api/orders", {
      headers: { "x-auth-token": token }
    })
      .then(res => res.json())
      .then(data => {
        setSales(data.filter(o => o.status === "completed"));
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <div className="page">
      <h2>Sales History</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Customer</th>
            <th> Subtotal</th>
            <th>Discount</th>
            <th>Total Amount</th>
            <th>Method</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {sales.map(s => (
            <tr key={s._id}>
              <td>{s.customerName || "Walk-in"}</td>
              <td> {s.subtotal} </td>
              <td>Rs {s.subtotal * s.discount/100} ({s.discount}%)</td>
              <td>Rs {s.totalAmount}</td>
              <td>{s.paymentMethod}</td>
              <td>{new Date(s.createdAt).toLocaleString()}</td>
              <td>
                <Link to={`/admin/sales/${s._id}`}>
                  <button className="view-btn">Receipt</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
