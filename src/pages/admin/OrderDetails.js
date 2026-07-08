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
    paymentMethod: "credit",
    status: "pending",
    discount: 0,
    tax: 0,
  });

  const token = localStorage.getItem("token");

  const trim = (num) => Math.round(num * 100) / 100;

  // ================= FETCH =================
  useEffect(() => {
    if (!token) {
      setError("You are not authorized");
      return;
    }

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

        if (!orderRes.ok) {
          throw new Error("Failed to load order");
        }

        const orderData = await orderRes.json();
        setOrder(orderData);

        setEditData({
          customerName: orderData.customerName || "",
          customerPhone: orderData.customerPhone || "",
          customerAddress: orderData.customerAddress || "",
          paymentMethod: orderData.paymentMethod || "credit",
          status: orderData.status || "pending",
          discount: orderData.discount || 0,
          tax: orderData.tax || 0,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  // ================= HELPERS =================
  const updateOrderField = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ================= FILTER =================
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ================= TOTALS =================
  const calculateTotals = () => {
    if (!order) {
      return {
        subtotal: 0,
        totalDiscount: 0,
        totalProfit: 0,
        profitperc: 0,
        totalAmount: 0,
      };
    }

    let subtotal = 0;
    let totalDiscount = 0;
    let totalProfit = 0;

    order.items.forEach((item) => {
      const salePrice = Number(item.salePrice || 0);
      const purchasePrice = Number(item.purchaseCost || 0);
      const quantity = Number(item.quantity || 1);

      const itemSubtotal = salePrice * quantity;
      const itemDiscount =
        trim((salePrice * Number(editData.discount || 0)) / 100) * quantity;

      const itemProfit =
        trim(
          salePrice -
            purchasePrice -
            (quantity ? itemDiscount / quantity : 0)
        ) * quantity;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
      totalProfit += itemProfit;
    });

    const totalAmount = trim(subtotal - totalDiscount);

    const profitperc =
      subtotal > 0 ? trim((totalProfit / subtotal) * 100) : 0;

    return {
      subtotal,
      totalDiscount,
      totalProfit,
      totalAmount,
      profitperc,
    };
  };

  const totals = calculateTotals();

  // ================= CART FUNCTIONS =================

  const addToCart = (product, slab) => {
    setOrder((prev) => {
      const exists = prev.items.find(
        (item) =>
          item.productId === product._id &&
          item.slabLabel === slab.label
      );

      if (exists) {
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.productId === product._id &&
            item.slabLabel === slab.label
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        ...prev,
        items: [
          ...prev.items,
          {
            productId: product._id,
            productName: product.name,
            slabLabel: slab.label,
            gramsUsed: slab.gramsUsed,
            quantity: 1,
            salePrice: slab.salePrice,
            purchaseCost: slab.purchaseCost,
          },
        ],
      };
    });
  };

  const updateQty = (index, qty) => {
    if (qty < 1) qty = 1;

    setOrder((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, quantity: qty } : item
      ),
    }));
  };

  const removeFromCart = (index) => {
    setOrder((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // ================= SAVE ORDER =================
    const handleSaveOrder = async () => {
      try {
        const updatedOrder = {
          ...editData,
          items: order.items,
        };

        const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify(updatedOrder),
        });

        const text = await res.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(text);
        }

        if (!res.ok) {
          throw new Error(data.message || "Failed to update order");
        }

        setOrder(data);
        setIsEditing(false);
        setUpdateMessage("Order updated successfully!");

        setTimeout(() => setUpdateMessage(""), 2000);

      } catch (err) {
        console.error(err);
        setUpdateMessage(err.message);
      }
    };
  // ================= UI =================
  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="order-container">
      <div className="order-page">
        <h2>Order Details</h2>

        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel Editing" : "Edit Order"}
        </button>

        {/* CUSTOMER INFO */}
        <div className="customer-info">
          <div className="info-item">
            <label>Name</label>
            {isEditing ? (
              <input
                value={editData.customerName}
                onChange={(e) =>
                  updateOrderField("customerName", e.target.value)
                }
              />
            ) : (
              <span>{order.customerName || "Walk-in"}</span>
            )}
          </div>

          <div className="info-item">
            <label>Phone</label>
            {isEditing ? (
              <input
                value={editData.customerPhone}
                onChange={(e) =>
                  updateOrderField("customerPhone", e.target.value)
                }
              />
            ) : (
              <span>{order.customerPhone || "N/A"}</span>
            )}
          </div>

          <div className="info-item">
            <label>Address</label>
            {isEditing ? (
              <input
                value={editData.customerAddress}
                onChange={(e) =>
                  updateOrderField("customerAddress", e.target.value)
                }
              />
            ) : (
              <span>{order.customerAddress || "-"}</span>
            )}
          </div>

          <div className="info-item">
            <label>Payment</label>
            {isEditing ? (
              <select
                value={editData.paymentMethod}
                onChange={(e) =>
                  updateOrderField("paymentMethod", e.target.value)
                }
              >
                <option value="paid">Paid</option>
                <option value="credit">Credit</option>
              </select>
            ) : (
              <span>{order.paymentMethod}</span>
            )}
          </div>

          <div className="info-item">
            <label>Discount</label>
            {isEditing ? (
              <input
                type="number"
                value={editData.discount}
                onChange={(e) =>
                  updateOrderField("discount", Number(e.target.value))
                }
              />
            ) : (
              <span>{order.discount || 0}%</span>
            )}
          </div>

          <div className="info-item">
            <label>Status</label>

            {isEditing ? (
              <select
                value={editData.status}
                onChange={(e) =>
                  updateOrderField("status", e.target.value)
                }
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                {/* <option value="returned">Returned</option> */}
              </select>
            ) : (
              <span className={`status ${order.status}`}>
                {order.status}
              </span>
            )}
          </div>

          {isEditing && (
            <button
              onClick={handleSaveOrder}
              style={{
                background: "green",
                color: "white",
                padding: "6px 15px",
                marginTop: 10,
              }}
            >
              Save Changes
            </button>
          )}
        </div>

        {updateMessage && (
          <p style={{ color: "green" }}>{updateMessage}</p>
        )}

       
        {isEditing && (
          <div className="product-picker">

            <div className="picker-header">
              <h3>Add Products</h3>

              <input
                type="text"
                placeholder="🔍 Search product..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            <div className="product-list">

              {filteredProducts.map((p) => (

                <div className="product-item" key={p._id}>

                  <div className="product-info">
                    <h4>{p.name}</h4>

                    <span>
                      {p.category || "General"}
                    </span>

                    <small>
                      Stock : {p.stockGrams} g
                    </small>
                  </div>

                  <div className="slabs-list">

                    {p.slabs?.map((s, index) => (

                      <button
                        key={index}
                        className="slab-btn"
                        onClick={() => addToCart(p, s)}
                      >
                        <div>
                          <strong>{s.label}</strong>
                          <span>Rs {s.salePrice}</span>
                        </div>

                        <span className="plus">+</span>

                      </button>

                    ))}

                  </div>

                </div>

              ))}

            </div>

          </div>
        )}

        {/* CART */}
        <h3>Cart</h3>

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
            {order.items.map((item, index) => {
              const salePrice = Number(item.salePrice || 0);
              const purchasePrice = Number(
                item.purchaseCost || 0
              );
              const quantity = Number(item.quantity || 1);

              const itemDiscount =
                trim(
                  (salePrice *
                    Number(editData.discount || 0)) /
                    100
                ) * quantity;

              const itemProfit =
                trim(
                  salePrice -
                    purchasePrice -
                    itemDiscount / quantity
                ) * quantity;

              const itemTotal = trim(
                salePrice * quantity - itemDiscount
              );

              return (
                <tr key={index}>
                  <td>
                    {item.productName}
                    {item.slabLabel
                      ? ` (${item.slabLabel})`
                      : ""}
                  </td>

                  <td>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      disabled={!isEditing}
                      onChange={(e) =>
                        updateQty(
                          index,
                          Number(e.target.value)
                        )
                      }
                      style={{ width: 60 }}
                    />
                  </td>

                  <td>Rs {salePrice}</td>
                  <td>Rs {purchasePrice}</td>
                  <td>Rs {itemDiscount}</td>
                  <td>Rs {itemProfit}</td>
                  <td>Rs {itemTotal}</td>

                  {isEditing && (
                    <td>
                      <button
                        onClick={() =>
                          removeFromCart(index)
                        }
                      >
                        X
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        <hr />

        {/* SUMMARY */}
        <div className="order-summary">
          <h3>Subtotal: Rs {totals.subtotal}</h3>
          <h3>Total Discount: Rs {totals.totalDiscount}</h3>
          <h3>
            Total Profit: Rs {totals.totalProfit} (
            {totals.profitperc}%)
          </h3>
          <h3>Total Amount: Rs {totals.totalAmount}</h3>
        </div>
      </div>
    </div>
  );
}