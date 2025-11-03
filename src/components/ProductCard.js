import "../styles/Product.css";
import { useCart } from "../context/CartContext";


export default function Product({ SpiceImg, SpiceName, SpicePrice }) {
  const { addToCart } = useCart();

  const product = {
    id: SpiceName, // use a unique ID (you can replace with real product ID later)
    name: SpiceName,
    price: SpicePrice,
    image: SpiceImg,
  };

  return (
    <div className="product">
      <img src={SpiceImg} alt={SpiceName} className="product-img" />
      <h4 className="product-name">{SpiceName}</h4>
      <h5 className="product-price">{SpicePrice}</h5>
      <button onClick={() => addToCart(product)} className = "add-to-cart-btn">Add to Cart</button>

    </div>
  );
}

