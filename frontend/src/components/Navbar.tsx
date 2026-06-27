import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/projects" className="navbar-brand">
        AI Code Review
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
