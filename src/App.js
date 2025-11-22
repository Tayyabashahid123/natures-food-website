import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetail";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Settings from "./pages/admin/Settings";
import AdminLogin from "./pages/admin/adminLogin";
import Inventory from "./pages/admin/Inventory";
import OrdersList from "./pages/admin/OrdersList";
import OrderDetails from "./pages/admin/OrderDetails";
import SalesList from "./pages/admin/SalesList";
import SaleReceipt from "./pages/admin/SaleReceipt";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<OrdersList />} /> 
          <Route path="orders/:id" element={<OrderDetails />} /> 
          <Route path="/admin/sales" element={<SalesList />} />
          <Route path="/admin/sales/:id" element={<SaleReceipt />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
