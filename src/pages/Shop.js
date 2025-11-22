import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import "../styles/Shop.css";

export default function Shop() {

  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.log(err));

    }, []);


  return (
    <>
      <Navbar />

      <section className="shop-container">
        <div className="shop-header">
          <h1 className="shop-title">The Full Collection</h1>
          <p className="shop-subtitle">
            Explore our full range of 100% natural, cold-ground spices.<br />
            Purity and potency in every single jar.
          </p>
        </div>

        <div className="shop-grid">
          {products.length === 0 ? (
            <p className="loading">Loading products...</p>
          ) : (
            products.map(product => (
               <Link to={`/product/${product._id}`} key={product._id}>
              <div className="shop-item" >
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <p>Rs {product.price}</p>
                {/* <button onClick={() => addToCart(product)}>Add to Cart</button>  */}
                <button>View</button>

              </div>
                </Link> 
            ))
          )}
        </div>



      </section>

      <Footer />
    </>
  );
}
