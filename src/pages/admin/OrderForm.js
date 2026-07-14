import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/admin/orderForm.css";
import API_URL from "../../config";

export default function OrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: ""
  });

  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API_URL}/api/products`, {
        headers: { "x-auth-token": token }
      });
      setProducts(await res.json());

      if (id) {
        const orderRes = await fetch(
          `${API_URL}/api/orders/${id}`,
          { headers: { "x-auth-token": token } }
        );
        const order = await orderRes.json();

        setCustomer({
          name: order.customerName || "",
          phone: order.customerPhone || "",
          address: order.customerAddress || ""
        });

        setDiscount(order.discount || 0);
        setPaymentMethod(order.paymentMethod || "credit");
        setCart(order.items || []);
      }
    };

    load();
  }, [id, token]);

  /* ================= CART ================= */
  const addToCart = (product, slab) => {
    setCart(prev => {
      const exists = prev.find(
        i => i.productId === product._id && i.slabLabel === slab.label
      );

      if (exists) {
        return prev.map(i =>
          i.productId === product._id && i.slabLabel === slab.label
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [
        
        {
          productId: product._id,
          productName: product.name,
          slabLabel: slab.label,
          gramsUsed: slab.gramsUsed,
          quantity: 1,
          salePrice: slab.salePrice,
          purchaseCost: slab.purchaseCost,
          finalTotal: total
        },
        ...prev
      ];
    });
  };

  const updateQty = (index, qty) => {
    setCart(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, qty) }
          : item
      )
    );
  };

  const removeItem = index => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  /* ================= CALCULATIONS ================= */
  const subtotal = cart.reduce(
    (sum, i) => sum + i.salePrice * i.quantity,
    0
  );

  const discountAmount = (subtotal * discount) / 100;

  const profit = cart.reduce(
    (sum, i) =>
      sum + (i.salePrice - i.purchaseCost) * i.quantity,
    0
  );

  const netProfit = profit - discountAmount;

  const total = Math.max( subtotal-discountAmount, 0);
  const profitPercent = subtotal>0 ? (netProfit/subtotal)*100 : 0;

    

  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (!cart.length) return alert("Cart is empty");

    setLoading(true);

    try {
      const res = await fetch(
        id
          ? `${API_URL}/api/orders/${id}`
          : `${API_URL}/api/orders`,
        {
          method: id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token
          },
          body: JSON.stringify({
            customerName: customer.name,
            customerPhone: customer.phone,
            customerAddress: customer.address,
            items: cart,
            discount,
            paymentMethod,
            netProfit,
            profitPercentage: profitPercent
          })
        }
      );

      if (!res.ok) throw new Error("Failed to save order");

      navigate("/admin/orders");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(product => {

  const text = search.toLowerCase();

  return (

  product.name.toLowerCase().includes(text) ||

  (product.category || "")
  .toLowerCase()
  .includes(text)

  );

  });

  return (
    <div className="order-wrapper">
    <h1 className="title">
      {id ? "Edit Order" : "Create Order"}
    </h1>

   <div className="order-grid">

  {/* CUSTOMER DETAILS */}
  <div className="left-column">

    <div className="customer-card">

      <div className="card-header">
        <div>
          <h2>Customer Details</h2>
          <p>Enter customer information for this order.</p>
        </div>
      </div>

      <div className="customer-grid">

        <div className="input-group">
          <label>Customer Name</label>
          <input
            type="text"
            placeholder="Enter customer name"
            value={customer.name}
            onChange={(e) =>
              setCustomer({
                ...customer,
                name: e.target.value,
              })
            }
          />
        </div>

        <div className="input-group">
          <label>Phone Number</label>
          <input
            type="text"
            placeholder="03XX XXXXXXX"
            value={customer.phone}
            onChange={(e) =>
              setCustomer({
                ...customer,
                phone: e.target.value,
              })
            }
          />
        </div>

      </div>

      <div className="input-group full-width">
        <label>Address</label>
        <textarea
          rows="2"
          placeholder="Enter customer Address"
          value={customer.address}
          onChange={(e) =>
            setCustomer({
              ...customer,
              address: e.target.value,
            })
          }
        />
      </div>


    </div>

        {/* ================= PRODUCTS ================= */}

      <div className="product-picker">

          <div className="picker-header">

              <div>
                  <h2>Product Catalog</h2>
                  <p>Select products to add into the cart.</p>
              </div>

              <input
                  className="search"
                  placeholder="🔍 Search products..."
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
              />

          </div>

        <div className="product-list">



          {filtered.length === 0 ? (

            <div className="empty-cart">
              <h3>No Products Found</h3>
            </div>

          ) : (

            filtered.map(product => (

              <div
                className="product-item"
                key={product._id}
              >

                <div className="product-info">

                  <h3>{product.name}</h3>

                  <div className="product-tags">

                    <span className="category-badge">
                      {product.category || "General"}
                    </span>

                    <span className="stock-pill">
                      {product.stockGrams} g
                    </span>

                  </div>

                </div>

                <div className="slabs-list">

                  {product.slabs?.map((slab,index)=>(

                    <button
                      key={index}
                      className="slab-btn"
                      onClick={() => addToCart(product, slab)}
                    >

                      <div className="slab-left">
                        <strong>{slab.label}</strong>
                        <small>Cost Rs {slab.purchaseCost}</small>
                      </div>

                      <div className="slab-right">
                        <span>Rs {slab.salePrice}</span>
                        <div className="plus">+</div>
                      </div>

                    </button>

                  ))}

                </div>

              </div>

            ))

          )}

        </div>

      </div>

  </div>


  {/* ORDER SUMMARY */}
  <div className="right-column">

  <div className="summary-card sticky">

    <div className="card-header">
      <div>
        <h2>Order Summary</h2>
        <p>
        {cart.reduce(
        (sum,item)=>sum+item.quantity,
        0
        )}

        Items

        </p>
      </div>
    </div>

    <div className="summary-list">

      <div className="summary-row">
        <span>Subtotal</span>
        <strong>Rs {subtotal.toFixed(2)}</strong>
      </div>

      <div className="summary-row">

        <span>Discount %</span>

        <input
          type="number"
          min="0"
          max="100"
          value={discount}
          onChange={(e)=>{

          let value = Number(e.target.value);

          if(value<0) value=0;
          if(value>100) value=100;

          setDiscount(value);

          }}
        />

      </div>

      <div className="summary-row">
        <span>Discount</span>
        <strong>- Rs {discountAmount.toFixed(2)}</strong>
      </div>

      <div className="summary-row">
        <span>Profit</span>
        <strong>Rs {netProfit.toFixed(2)}</strong>
      </div>

      <div className="summary-row">
        <span>Profit %</span>
        <strong>{profitPercent.toFixed(1)}%</strong>
      </div>

      <div className="summary-row total-row">
        <span>Total</span>
        <strong>Rs {total.toFixed(2)}</strong>
      </div>

    </div>

    <div className="payment-box">

      <label>Payment Method</label>

      <select
        value={paymentMethod}
        onChange={(e) =>
          setPaymentMethod(e.target.value)
        }
      >
        <option value="paid">Paid</option>
        <option value="credit">Credit</option>
      </select>

    </div>

    <button
      className="submit-order-btn"
      onClick={submit}
      disabled={loading}
    >
      {loading
        ? "Saving..."
        : id
        ? "Update Order"
        : "Create Order"}
    </button>

  </div>

</div>
    <div className="bottom-layout">

    {/* PRODUCTS */}




    {/* CART */}

<div className="cart-card">

    <div className="cart-header">
        <div>
            <h2>Cart</h2>
            <p>
                {cart.reduce((sum,item)=>sum+item.quantity,0)} item(s)
            </p>
        </div>
    </div>

    {cart.length===0 ? (

        <div className="empty-cart">

            <div style={{fontSize:"46px"}}>🛒</div>

            <h3>No Products Added</h3>

            <p>Select products from the left panel.</p>

        </div>

    ) : (


        <table className="cart-table">

            <thead>

                <tr>

                <th>Product</th>
                <th>Qty</th>
                <th>Sale Price</th>
                <th>Purchase Price</th>
                <th>Discount</th>
                <th>Profit</th>
                <th>Total</th>

                <th></th>

                </tr>

            </thead>

            <tbody>

              {cart.map((item, index) => {

                  const itemDiscount =
                    ((item.salePrice * Number(discount || 0)) / 100) *
                    item.quantity;

                  const itemProfit =
                    ((item.salePrice - item.purchaseCost) * item.quantity) -
                    itemDiscount;

                  return (

                    <tr key={index}>


                      <td>

                      <div className="cart-product">

                          <strong>{item.productName}</strong>

                          <span>{item.slabLabel}</span>

                      </div>

                      </td>

                        <td>

                            <div className="qty-box">

                                <button
                                    onClick={()=>updateQty(index,item.quantity-1)}
                                >
                                    −
                                </button>

                                <span>
                                    {item.quantity}
                                </span>

                                <button
                                    onClick={()=>updateQty(index,item.quantity+1)}
                                >
                                    +
                                </button>

                            </div>

                        </td>

                        <td>

                            Rs {item.salePrice}

                        </td>

                        <td>
                          Rs {item.purchaseCost}
                        </td>

                        <td> Rs {itemDiscount.toFixed(2)}</td>

                        <td>

                            Rs {itemProfit.toFixed(2)}

                        </td>


                        <td>
                            Rs {(
                                item.salePrice * item.quantity -
                                itemDiscount
                            ).toFixed(2)}
                        </td>

                        <td>

                            <button
                                className="delete-btn"
                                onClick={()=>removeItem(index)}
                            >

                                ✕

                            </button>

                        </td>

                    </tr>
                  );
                  })}

            </tbody>

        </table>
)}

    </div>
    </div>
    </div>
    </div>
  )}