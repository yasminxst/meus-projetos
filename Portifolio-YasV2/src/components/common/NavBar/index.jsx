
import { Link, NavLink } from "react-router";

const NavBar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-yasmin">
      <div className="container">

        {/* Logo / Nome */}
        <Link className="navbar-brand logo-yasmin" to="/">
          Yasmin <span>Teixeira</span>
        </Link>

        {/* Menu mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Abrir menu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav ms-auto">

            <NavLink className="nav-link nav-link-yasmin" to="/" end>
              Home
            </NavLink>

            <NavLink className="nav-link nav-link-yasmin" to="/lumina">
              Lumina
            </NavLink>

            <a
              className="nav-button"
              href="https://wa.me/5531997234448?text=Ol%C3%A1%2C%20me%20fale%20mais%20sobre%20o%20seu%20trabalho"
              target="_blank"
              rel="noreferrer"
            >
              Vamos conversar
            </a>

          </div>
        </div>

      </div>
    </nav>
  );
};

export default NavBar;

