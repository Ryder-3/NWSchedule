import "./App.css";
import NavBar from "./NavBar";
import SideBar from "./SideBar";

function App() {
  return (
    <div className="App">
      <NavBar />
      <div className="container text-center">
        <div className="row">
          <div className="col-1">
            <h1>idk what goes here</h1>
          </div>
          <div className="col-9">
            <h1>Calendar here</h1>
          </div>
          <div className="col-2">
            <h1>Sidebar here</h1>
            <SideBar />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
