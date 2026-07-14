import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin/orders.css";
import API_URL from "../../config";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/api/orders`, {
      headers: { "x-auth-token": token }
    })
      .then(res => res.json())
      .then(setOrders);
  }, [token]);

  return (
    <div className="orders-page">
      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h1>Orders</h1>
          <p>Manage all customer orders</p>
        </div>

        <button
          className="create-btn"
          onClick={() => navigate("/admin/orders/new")}
        >
          + Create Order
        </button>
      </div>

      {/* TABLE WRAPPER */}
      <div className="table-card">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Profit</th>
              <th>Discount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.filter(order => order.status != "completed" && order.status != "returned").map(order => (
              <tr key={order._id}>
                <td>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

                <td>
                  <div className="customer-name">
                    {order.customerName || "Walk-in"}
                  </div>
                </td>

                <td className="bold">
                  Rs {order.totalAmount?.toFixed(2)}
                </td>

                <td className={order.profitAmount < 0 ? "loss" : "profit"}>
                  Rs {order.profitAmount?.toFixed(2)}{" "}
                  <small>
                    ({order.profitPercentage}%)
                  </small>
                </td>

                <td>
                  Rs {order.discountAmount?.toFixed(2)}{" "}
                  <small>({order.discount}%)</small>
                </td>

                <td>
                  <span className={`status ${order.status}`}>
                    {order.status}
                  </span>
                </td>

                <td>
                  <button
                    className="view-btn"
                    onClick={() =>
                      navigate(`/admin/orders/${order._id}`)
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}