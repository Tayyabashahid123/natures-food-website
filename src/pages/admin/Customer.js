import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/admin.css";

// Simple icons using Unicode
const PhoneIcon = () => <span className="icon">📞</span>;
const AddressIcon = () => <span className="icon">🏠</span>;

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
          headers: { "x-auth-token": token }
        });
        if (!res.ok) throw new Error("Failed to fetch order");
        const order = await res.json();
        setCustomer({
          name: order.customerName || "Walk-in",
          phone: order.customerPhone || "-",
          address: order.customerAddress || "-"
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Unable to load customer details.");
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id, token]);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading customer details...</p>;
  if (error)
    return <p style={{ color: "red", textAlign: "center", marginTop: "50px" }}>{error}</p>;

  const isWalkIn = customer.name === "Walk-in";

  return (
    <div className="customer-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back to Sales</button>
      <h2 className="customer-header">Customer Details</h2>

      <div className="customer-card">
        <div className="customer-field">
          <strong>Name:</strong>
          <span>{customer.name}</span>
          <span className={`badge ${isWalkIn ? "walkin" : "regular"}`}>
            {isWalkIn ? "Walk-in" : "Regular"}
          </span>
        </div>

        <div className="customer-field">
          <PhoneIcon />
          <span>{customer.phone}</span>
        </div>

        <div className="customer-field">
          <AddressIcon />
          <span>{customer.address}</span>
        </div>

        <button className="receipt-btn" onClick={() => navigate(`/admin/sales/${id}`)}>
          View Receipt
        </button>
      </div>
    </div>
  );
}