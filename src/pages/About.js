import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FeatureCard from "../components/FeatureCard";
import "../styles/About.css";
import heritage from "../assets/heritage.jpeg";

export default function About() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-header">
          <h1 className="about-title">Our Story</h1>
          <p className="about-subtitle">
            Generations of spice wisdom — blended with modern purity.
          </p>
        </div>
      </section>

      {/* Heritage Section */}
      <section className="about">
        <div className="about-content">
          <h4>Our Roots</h4>
          <h1>A Standard Built on Generations of Knowledge</h1>
          <p>
            At <strong>Nature’s Food</strong>, we believe authentic flavor begins with{" "}
            <strong>absolute purity</strong>. Our foundation is built upon a heritage of
            family expertise, sourcing directly from regenerative farms across South Asia.
          </p>

          <span>
            In a world driven by speed and shortcuts, we stand for{" "}
            <strong>tradition and patience</strong>. Every jar reflects our mission to bring
            you the true <strong>Masalon Ka Zaiqa</strong> — the aroma and taste of untainted,
            natural spice.
          </span>
        </div>

        <div className="about-image">
          <img src={heritage} alt="heritage" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h1 className="features-heading">The Cold-Ground Difference</h1>

        <div className="feature-grid">
          <FeatureCard
            icon="🌾"
            title="Direct Sourcing"
            description="We partner with trusted local farmers to grow each spice in mineral-rich soil, harvested at the peak of flavor."
          />

          <FeatureCard
            icon="❄️"
            title="Cold-Ground Milling"
            description="Our gentle, low-temperature grinding retains the essential oils that define freshness and aroma."
          />

          <FeatureCard
            icon="📦"
            title="Airtight Packaging"
            description="Each batch is sealed in eco-friendly, airtight jars — keeping nature’s goodness intact till it reaches your table."
          />
        </div>
      </section>

      <Footer />
    </>
  );
}
