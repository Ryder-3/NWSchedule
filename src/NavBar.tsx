import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import "./NavBar.css";

function NavBar() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  const handleSaveSettings = () => {
    // saving logic
    setSettingsOpen(false);
  };

  return (
    <div className="navbar navbar-expand-xl">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          NWSchedule
        </a>

        <button onClick={handleOpenSettings} className="settings-button">
          <img
            src="public\settings-svgrepo-com (1).svg"
            alt="settings"
            className="settings-icon"
          />
        </button>

        <Modal show={settingsOpen} onHide={handleCloseSettings}>
          <Modal.Header closeButton>
            <Modal.Title>Settings</Modal.Title>
          </Modal.Header>
        </Modal>
      </div>
    </div>
  );
}

export default NavBar;
