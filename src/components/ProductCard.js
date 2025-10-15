import "../styles/Product.css";

export default function Product({ SpiceImg, SpiceName, SpicePrice }) {
  return (
    <div className="product">
      <img src={SpiceImg} alt={SpiceName} className="product-img" />
      <h4 className="product-name">{SpiceName}</h4>
      <h5 className="product-price">{SpicePrice}</h5>
    </div>
  );
}
