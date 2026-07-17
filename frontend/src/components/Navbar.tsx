import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Logo } from "./Logo";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <Logo size={26} />
        ReviewLenzAI
      </Link>
      <div className="navbar-links">
        {user && <span>{user.email}</span>}
        <button className="secondary" onClick={logout}>
          Log out
        </button>
      </div>
    </nav>
  );
}
