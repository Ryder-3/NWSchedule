import "./NavBar.css";

function NavBar() {
  return (
    <div className="navbar navbar-expand-xl">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          NWSchedule
        </a>

        <a className="navbar-nav" href="./LoginPage.tsx">
          Login
        </a>
      </div>
    </div>
  );
}

export default NavBar;
