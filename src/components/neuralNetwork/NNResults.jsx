import React, { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import Toast from "../toast/Toast";
import "./NNStyles.css";

function NNResults({ selectedFile, modelType }) {
  const [toastMessage, setToastMessage] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [resultsImages, setResultsImages] = useState({});
  const [metrics, setMetrics] = useState({});
  const [modalImage, setModalImage] = useState(null);
  const url = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const cachedImages = localStorage.getItem("nnResultsImages");
    const cachedMetrics = localStorage.getItem("nnResultsMetrics");
    if (cachedImages) {
      setResultsImages(JSON.parse(cachedImages));
    }
    if (cachedMetrics) {
      setMetrics(JSON.parse(cachedMetrics));
    }
    if (sessionStorage.getItem("nnResultsTesting") === "true") {
      setIsTesting(true);
    }
  }, []);

  const handleTestRun = () => {
    setIsTesting(true);
    sessionStorage.setItem("nnResultsTesting", "true");
    setToastMessage("");
    fetch(`${url}/test/nn/run`, {
      method: "POST",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Neural Network test run failed with status " + res.status
          );
        }
        return res.json();
      })
      .then((data) => {
        console.log("Test run response:", data);
        if (data.images && typeof data.images === "object") {
          setResultsImages(data.images);
          localStorage.setItem("nnResultsImages", JSON.stringify(data.images));
        } else {
          setResultsImages({});
          localStorage.removeItem("nnResultsImages");
        }

        if (data.metrics && typeof data.metrics === "object") {
          setMetrics(data.metrics);
          localStorage.setItem(
            "nnResultsMetrics",
            JSON.stringify(data.metrics)
          );
        } else {
          setMetrics({});
          localStorage.removeItem("nnResultsMetrics");
        }

        setToastMessage(
          data.message || "Neural Network test run completed successfully!"
        );
      })
      .catch((err) => {
        console.error(err);
        setToastMessage("Error during test run. Please try again.");
      })
      .finally(() => {
        setIsTesting(false);
        sessionStorage.removeItem("nnResultsTesting");
      });
  };

  return (
    <div className="nn-results-container">
      <h2>Testing</h2>
      <p>Test your neural network model against the dataset</p>

      <button
        onClick={handleTestRun}
        disabled={isTesting}
        className="test-button"
      >
        {isTesting ? (
          <>
            <FaSpinner className="loadingIcon" /> Testing...
          </>
        ) : (
          "Test Neural Network"
        )}
      </button>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      {Object.keys(metrics).length > 0 && (
        <div className="nn-metrics-results">
          <h3>Performance Metrics</h3>
          <div className="metrics-grid">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="metric-card">
                <h4>{key.replace(/_/g, " ").toUpperCase()}</h4>
                <div className="metric-value">
                  {typeof value === "number" ? value.toFixed(4) : value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(resultsImages).length > 0 && (
        <div className="nn-results-images">
          <h3>Visualizations</h3>
          <div className="images-grid">
            {Object.entries(resultsImages).map(([key, base64String]) => (
              <div
                key={key}
                className="result-image"
                onClick={() =>
                  setModalImage(`data:image/png;base64,${base64String}`)
                }
              >
                <h4>{key.replace(/_/g, " ")}</h4>
                <img
                  src={`data:image/png;base64,${base64String}`}
                  alt={`Neural Network test result for ${key}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {modalImage && (
        <div className="modal" onClick={() => setModalImage(null)}>
          <img src={modalImage} alt="Maximized view" className="modal-image" />
        </div>
      )}
    </div>
  );
}

export default NNResults;
