import { useCart } from "../context/CartContext";

export default function ProductCard({ SpiceImg, SpiceName, SpicePrice }) {
  const { addToCart } = useCart();

  const product = {
    id: SpiceName, // use a unique ID (you can replace with real product ID later)
    name: SpiceName,
    price: SpicePrice,
    image: SpiceImg,
  };

  return (
    <div className="product-card">
      <img src={SpiceImg} alt={SpiceName} />
      <h3>{SpiceName}</h3>
      <p>{SpicePrice}</p>
      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
}
