import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Shop.css";
import Spices from "../assets/spices.jpeg";
import cumin from "../assets/cumin.jpeg";
import turmeric from "../assets/turmeric.jpeg";
import chilliPowder from "../assets/chilli-powder.jpeg";
import blackPepper from "../assets/blackpepper.jpeg";
import cloves from "../assets/cloves.jpeg";

export default function Shop() {
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
          <div className="shop-item">
            <img src={turmeric} alt="Turmeric" />
            <h3>Turmeric Powder</h3>
            <p>Pure, golden, and aromatic — the essence of health.</p>
            <button>View</button>
          </div>

          <div className="shop-item">
            <img src={chilliPowder} alt="Chili Powder" />
            <h3>Kashmiri Chili</h3>
            <p>Bold, fiery flavor that awakens every dish.</p>
            <button>View</button>
          </div>

          <div className="shop-item">
            <img src={cumin} alt="Cumin Seeds" />
            <h3>Cumin Seeds</h3>
            <p>Earthy aroma with a hint of warmth and tradition.</p>
            <button>View</button>
          </div>

          <div className="shop-item">
            <img src={blackPepper} alt="Black Pepper" />
            <h3>Black Pepper</h3>
            <p>Strong and bold — freshly ground perfection.</p>
            <button>View</button>
          </div>

          <div className="shop-item">
            <img src={cloves} alt="Cloves" />
            <h3>Cloves</h3>
            <p>Sweet and spicy warmth, perfect for rich meals.</p>
            <button>View</button>
          </div>

          <div className="shop-item">
            <img src={Spices} alt="Garam Masala" />
            <h3>Garam Masala</h3>
            <p>A perfect balance of aroma, heat, and flavor.</p>
            <button>View</button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
