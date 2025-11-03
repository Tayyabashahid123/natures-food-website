import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Product from "../components/ProductCard";
import FeatureCard from "../components/FeatureCard";
import Spices from "../assets/spices.jpeg";
import cumin from "../assets/cumin.jpeg"
import turmeric from "../assets/turmeric.jpeg"
import chilliPowder from "../assets/chilli-powder.jpeg"
import BlackPepper from "../assets/blackpepper.jpeg"
import Cloves from "../assets/cloves.jpeg"
import heritage from "../assets/heritage.jpeg"
import "../styles/Home.css"; 



export default function Home() {
  return (
    <>
      <Navbar />

      <section className="hero">
            <div className="hero-content">
            <h1>The Best Spices Nature Has To Offer</h1>
            <p>
                Discover authentic, pure, and aromatic spices that bring real flavor
                to every meal.
            </p>
            <Link to="/shop">
                <button className="shop-btn">Shop Now</button>
            </Link>
            </div>

            <div className="hero-image">
            <img src={Spices} alt="spices" />
            </div>
        </section>


        <section className="products-section">
            <h1>Shop Our Spices</h1>
            <div className="products-grid">
                <Product SpiceImg={cumin} SpiceName="Cumin" SpicePrice="100" />
                <Product SpiceImg={Spices} SpiceName="Mixed Spices" SpicePrice="250" />
                <Product SpiceImg={turmeric} SpiceName="Turmeric" SpicePrice="200" />
                <Product SpiceImg={chilliPowder} SpiceName="Chilli Powder" SpicePrice="150" />
                <Product SpiceImg={BlackPepper} SpiceName="Black Pepper" SpicePrice="180" />
                <Product SpiceImg={Cloves} SpiceName="Cloves" SpicePrice="300" />
            </div>
            <Link to="/shop">
                <button className="shop-btn">Shop More</button>
            </Link>
        </section>



        <section className="features">
            <h1>Why Choose Nature’s Food</h1>

            <div className="feature-grid">
            <FeatureCard
                icon="🌱"
                title="100% Natural"
                description="No preservatives, no additives — just pure, organic ingredients from nature."
            />
            <FeatureCard
                icon="🍃"
                title="Fresh & Organic"
                description="Every product is freshly packed to preserve its aroma and nutritional value."
            />
            <FeatureCard
                icon="⭐"
                title="Quality Guaranteed"
                description="We handpick and test every spice to ensure you get nothing but the best."
            />
            </div>
        </section>

        <section className="heritage">

            <div className="heritage-image">
                <img src={heritage} alt="heritage" />
            </div>
            <div className="heritage-content">
                <h4>Our Heritage</h4>
                <h1>Rooted in Purity, Grown for Flavor.</h1>
                <p>
                We believe authentic taste requires <strong>uncompromising quality</strong>. 
                That’s why every grain, every seed, and every finished blend meets our 
                strict, traditional standards.
                </p>

                <div className="quality-points">
                    <div className="quality">
                        <p>
                        <strong>Adulteration Free:</strong> Absolutely no starch, rice powder, or artificial color.
                        </p>

                        <p>
                        <strong>Cold-Ground Technique:</strong> We preserve 100% of the volatile oils for maximum potency.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <Footer />
    </>
    );
}
