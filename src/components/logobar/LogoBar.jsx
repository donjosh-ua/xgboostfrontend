import "./LogoBar.css";

function LogoBar() {
  return (
    <div className="logo-bar">
      <div className="logo-container">
        <img
          src="/bios_logo.png"
          alt="BIOS Logo"
          className="organization-logo"
        />
        <img src="/upc_logo.png" alt="UPC Logo" className="organization-logo" />
      </div>
    </div>
  );
}

export default LogoBar;
