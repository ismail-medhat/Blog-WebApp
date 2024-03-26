import "./header.css";
const Navbar = ({ toggle, setToggle }) => {
  return (
    <nav
      style={{
        clipPath: toggle && "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      }}
      className="navbar"
    >
      <ul className="nav-links">
        <li onClick={() => setToggle(false)} className="nav-link">
          <i className="bi bi-house"></i> Home
        </li>
        <li onClick={() => setToggle(false)} className="nav-link">
          <i className="bi bi-stickies"></i> Posts
        </li>
        <li onClick={() => setToggle(false)} className="nav-link">
          <i className="bi bi-journal-plus"></i> Create
        </li>
        <li onClick={() => setToggle(false)} className="nav-link">
          <i className="bi bi-person-check"></i> Admin Dashboard
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
