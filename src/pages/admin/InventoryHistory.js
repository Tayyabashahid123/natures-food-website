import { useEffect, useState } from "react";
import "../../styles/admin/InventoryHistory.css";
import API_URL from "../../config";

export default function InventoryHistory({ refreshTrigger }) {
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/api/inventory/history`, {
      headers: { "x-auth-token": token }
    })
      .then(res => res.json())
      .then(setHistory);
  }, [token, refreshTrigger ]);

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>Inventory History</h1>
        <p>Track all stock changes in your system</p>
      </div>

      <div className="history-card">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Change</th>
              <th>Reason</th>
              <th>Before</th>
              <th>After</th>
            </tr>
          </thead>

          <tbody>
            {history.map(h => (
              <tr key={h._id}>
                <td>
                  {new Date(h.createdAt).toLocaleString()}
                </td>

                <td className="product-name">
                  {h.product?.name}
                </td>

                <td className={h.changeGrams > 0 ? "change" : "minus"}>
                  {h.changeGrams} g
                </td>

                <td>
                  <span className="reason-badge">
                    {h.reason}
                  </span>
                </td>

                <td>{h.stockBefore}</td>
                <td>{h.stockAfter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}