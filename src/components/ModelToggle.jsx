import React from "react";
import { FaNetworkWired, FaTree } from "react-icons/fa";

function ModelToggle({ activeModel, toggleModel }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleModel();
  };

  return (
    <button className="model-toggle-button" onClick={handleClick} type="button">
      {activeModel === "xgboost" ? (
        <>
          <FaTree className="model-icon" /> XGBoost
        </>
      ) : (
        <>
          <FaNetworkWired className="model-icon" /> BNN
        </>
      )}
    </button>
  );
}

export default ModelToggle;
