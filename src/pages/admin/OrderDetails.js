import "../../styles/admin/OrderDetails.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [editData, setEditData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    paymentMethod: "cash",
    discount: 0,
    tax: 0,
  });

  const token = localStorage.getItem("token");

  const trim = (num) => Math.round(num * 100) / 100;

  useEffect(() => {
    if (!token) return setError("You are not authorized");

    const fetchData = async () => {
      try {
        const [prodRes, orderRes] = await Promise.all([
          fetch("http://localhost:5000/api/products", {
            headers: { "x-auth-token": token },
          }),
          fetch(`http://localhost:5000/api/orders/${id}`, {
            headers: { "x-auth-token": token },
          }),
        ]);

        const productsData = await prodRes.json();
        setProducts(productsData);

        if (!orderRes.ok) throw new Error(await orderRes.text());
        const orderData = await orderRes.json();
        setOrder(orderData);

        setEditData({
          customerName: orderData.customerName || "",
          customerPhone: orderData.customerPhone || "",
          customerAddress: orderData.customerAddress || "",
          paymentMethod: orderData.paymentMethod || "cash",
          discount: orderData.discount || 0,
          tax: orderData.tax || 0,
        });

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  // ------------------ CALCULATE TOTALS ------------------
  const calculateTotals = () => {
    if (!order) return { subtotal: 0, totalDiscount: 0, totalProfit: 0, totalAmount: 0 };

    let subtotal = 0;
    let totalDiscount = 0;
    let totalProfit = 0;

    order.items.forEach((item) => {
      const salePrice = Number(item.salePrice ?? item.price); // use backend price
      const purchasePrice = Number(item.purchasePrice ?? item.purchasePrice ?? 0);
      const quantity = Number(item.quantity);

      const itemSubtotal = salePrice * quantity;
      const itemDiscount = trim((salePrice * editData.discount) / 100) * quantity;
      const itemProfit = trim(salePrice - purchasePrice - itemDiscount / quantity) * quantity;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
      totalProfit += itemProfit;
    });

    const totalAmount = trim(subtotal - totalDiscount);

    return { subtotal, totalDiscount, totalProfit, totalAmount };
  };

  const totals = calculateTotals();

  // ------------------ CART FUNCTIONS ------------------
  const updateQuantity = (productId, qty) => {
    if (qty <= 0) qty = 1;
    setOrder((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.productId === productId ? { ...i, quantity: qty } : i
      ),
    }));
  };

  const addToCart = (product) => {
    setOrder((prev) => {
      if (prev.items.find((i) => i.productId === product._id)) return prev;

      const newItem = {
        productId: product._id,
        name: product.name,
        salePrice: product.price,
        purchasePrice: product.purchasePrice ?? 0,
        quantity: 1,
      };

      return { ...prev, items: [...prev.items, newItem] };
    });
  };

  const removeItem = (productId) => {
    setOrder((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.productId !== productId),
    }));
  };

  // ------------------ UPDATE ORDER ------------------
  const handleSaveOrder = async () => {
    try {
      const updatedOrder = {
        ...editData,
        items: order.items,
        status: order.status,
      };

      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-auth-token": token },
        body: JSON.stringify(updatedOrder),
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        throw new Error(errorResponse.msg || "Failed to update order");
      }

      const data = await res.json();
      setOrder(data.order);
      setIsEditing(false);
      setUpdateMessage("Order updated successfully!");
      setTimeout(() => setUpdateMessage(""), 2000);
    } catch (err) {
      console.error(err);
      setUpdateMessage("Failed to update order");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!order) return <p>Order not found</p>;

  const updateOrderField = (field, value) =>
    setEditData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="order-container">
      <div className="order-page">
        <h2>Order Details</h2>
        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel Editing" : "Edit Order"}
        </button>

        <div className="customer-info">
          <div>
            <strong>Name:</strong>{" "}
            {isEditing ? (
              <input
                value={editData.customerName}
                onChange={(e) => updateOrderField("customerName", e.target.value)}
              />
            ) : (
              order.customerName || "Walk-in"
            )}
          </div>

          <div>
            <strong>Phone:</strong>{" "}
            {isEditing ? (
              <input
                value={editData.customerPhone}
                onChange={(e) => updateOrderField("customerPhone", e.target.value)}
              />
            ) : (
              order.customerPhone || "N/A"
            )}
          </div>

          <div>
            <strong>Address:</strong>{" "}
            {isEditing ? (
              <input
                value={editData.customerAddress}
                onChange={(e) => updateOrderField("customerAddress", e.target.value)}
              />
            ) : (
              order.customerAddress || "-"
            )}
          </div>

          <div>
            <strong>Payment:</strong>{" "}
            {isEditing ? (
              <select
                value={editData.paymentMethod}
                onChange={(e) => updateOrderField("paymentMethod", e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </select>
            ) : (
              order.paymentMethod
            )}
          </div>

          <div>
            <strong>Discount (%):</strong>{" "}
            {isEditing ? (
              <input
                type="number"
                value={editData.discount}
                onChange={(e) => updateOrderField("discount", Number(e.target.value))}
                style={{ width: 80 }}
              />
            ) : (
              order.discount + "%"
            )}
          </div>

          <div>
            <strong>Status:</strong>{" "}
            <select
              value={order.status || order.status}
              disabled={isEditing}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          {isEditing && (
            <button
              onClick={handleSaveOrder}
              style={{ background: "green", color: "white", padding: "6px 15px", marginTop: 10 }}
            >
              Save Changes
            </button>
          )}
        </div>

        {updateMessage && <p style={{ color: "green" }}>{updateMessage}</p>}

        {isEditing && (
          <>
            <h3>Add Products</h3>
            <input
              type="text"
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {products
                .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                .map((p) => (
                  <div key={p._id}>
                    {p.name} - Rs {p.price}{" "}
                    <button onClick={() => addToCart(p)}>Add</button>
                  </div>
                ))}
            </div>
          </>
        )}

        <h3>Items</h3>
        <table className="order-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Qty</th>
              <th>Sale Price</th>
              <th>Purchase Price</th>
              <th>Discount</th>
              <th>Profit</th>
              <th>Total</th>
              {isEditing && <th>Remove</th>}
            </tr>
          </thead>

          <tbody>
            {order.items.map((item) => {
              const salePrice = Number(item.salePrice ?? item.price);
              const purchasePrice = Number(item.purchasePrice ?? 0);
              const quantity = Number(item.quantity);
              const itemDiscount = trim((salePrice * editData.discount) / 100) * quantity;
              const itemProfit = trim(salePrice - purchasePrice - itemDiscount / quantity) * quantity;
              const itemTotal = trim(salePrice * quantity - itemDiscount);

              return (
                <tr key={item.productId}>
                  <td>{item.name}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      disabled={!isEditing}
                      onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                      style={{ width: 60 }}
                    />
                  </td>
                  <td>Rs {salePrice}</td>
                  <td>Rs {purchasePrice}</td>
                  <td>Rs {itemDiscount}</td>
                  <td>Rs {itemProfit}</td>
                  <td>Rs {itemTotal}</td>
                  {isEditing && <td><button onClick={() => removeItem(item.productId)}>X</button></td>}
                </tr>
              );
            })}
          </tbody>
        </table>

        <hr />

        <div className="order-summary">
          <h3>Subtotal: Rs {totals.subtotal}</h3>
          <h3>Total Discount: Rs {totals.totalDiscount}</h3>
          <h3>Total Profit: Rs {totals.totalProfit}</h3>
          <h3>Total Amount: Rs {totals.totalAmount}</h3>
        </div>
      </div>
    </div>
  );
}
