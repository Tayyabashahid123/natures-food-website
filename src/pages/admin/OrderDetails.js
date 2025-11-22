import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const token = localStorage.getItem("token");

  // Fetch order
  useEffect(() => {
    if (!token) return setError("You are not authorized");

    setLoading(true);
    fetch(`http://localhost:5000/api/orders/${id}`, {
      headers: { "x-auth-token": token },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to fetch order");
        }
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setSelectedStatus(data.status); // default dropdown value
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to fetch order");
        setLoading(false);
      });
  }, [id, token]);

  // Update order status
  const handleUpdateStatus = () => {
    if (!selectedStatus) return;

    setUpdating(true);
    setUpdateMessage("");
    fetch(`http://localhost:5000/api/orders/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({ status: selectedStatus }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to update status");
        }
        return res.json();
      })
      .then((data) => {
        console.log("from frontend",data)
        setOrder(data);
        setUpdateMessage("Status updated successfully!");
        setUpdating(false);
      })
      .catch((err) => {
        console.error(err);
        setUpdateMessage("Failed to update status");
        setUpdating(false);
      });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="page">
      <h2>Order Details</h2>

      <p><strong>Customer:</strong> {order.customerName || "Walk-in"}</p>
      <p><strong>Payment:</strong> {order.paymentMethod}</p>
      <p>
        <strong>Status:</strong>{" "}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={handleUpdateStatus}
          disabled={updating || selectedStatus === order.status}
          style={{ marginLeft: "10px" }}
        >
          {updating ? "Updating..." : "Update Status"}
        </button>
      </p>
      {updateMessage && <p style={{ color: "green" }}>{updateMessage}</p>}

      <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

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
          {order.items.map((item) => (
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
      <h3>Total Amount: Rs {order.totalAmount}</h3>
    </div>
  );
}
