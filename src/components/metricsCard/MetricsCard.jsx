import React from "react";
import "./MetricsCard.css";

function MetricsCard({ metrics }) {
  return (
    <div className="nn-metrics-results">
      <h3>Best Performance Metrics</h3>
      <div className="metrics-grid">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="metric-card">
            <h4>{key.replace(/_/g, " ").toUpperCase()}</h4>
            <div className="metric-value">
              {key === "epoch"
                ? parseInt(value)
                : typeof value === "number"
                ? value.toFixed(4)
                : value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MetricsCard;
