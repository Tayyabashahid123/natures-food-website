import { Outlet, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import "../../styles/admin.css";

export default function AdminLayout() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { pathname } = useLocation();

   if (!token) return <Navigate to="/admin/login" />;

    const handleLogout = () => {
      localStorage.removeItem("token");
      navigate("/admin/login");
  };

  const isActive = (path) => pathname === path ? "admin-link active" : "admin-link";
  // Auth check


  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h1 className="admin-logo">Admin</h1>
        <nav className="admin-nav">
          <Link to="/admin" className={isActive("/admin")}>Dashboard</Link>
          <Link to="/admin/products" className={isActive("/admin/products")}>Products</Link>
          <Link to="/admin/inventory" className={isActive("/admin/inventory")}>Inventory</Link>
          <Link to="/admin/orders" className={isActive("/admin/orders")}>Orders</Link>
          <Link to="/admin/packing" className={isActive("/admin/packing")}>Packing</Link>
          <Link to="/admin/sales" className={isActive("/admin/sales")}>Sales</Link>
          <Link to="/admin/returned-sales" className={isActive("/admin/returned-sales")}>Returned Sales</Link>
          <Link to="/admin/settings" className={isActive("/admin/settings")}>Settings</Link>

          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
