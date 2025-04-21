import React, { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import Toast from "../toast/Toast";
import MetricsCard from "../metricsCard/MetricsCard";
import ResultsImagesGrid from "./ResultsImagesGrid";
import "./NNStyles.css";

function NNResults({ selectedFile, modelType }) {
  const [toastMessage, setToastMessage] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [resultsImages, setResultsImages] = useState({});
  const [metrics, setMetrics] = useState({});
  const [modalImage, setModalImage] = useState(null);
  const url = import.meta.env.VITE_BNN_URL;

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

  // Persist metrics to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("nnResultsMetrics", JSON.stringify(metrics));
  }, [metrics]);

  // Persist resultsImages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("nnResultsImages", JSON.stringify(resultsImages));
  }, [resultsImages]);

  const handleTestRun = () => {
    setIsTesting(true);
    sessionStorage.setItem("nnResultsTesting", "true");
    setToastMessage("");
    fetch(`${url}/train/results`, {
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Test run failed with status " + res.status);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Train results response:", data);
        if (data.results && typeof data.results === "object") {
          setMetrics(data.results);
          localStorage.setItem(
            "nnResultsMetrics",
            JSON.stringify(data.results)
          );
        } else {
          setMetrics({});
          localStorage.removeItem("nnResultsMetrics");
        }
        if (data.images && typeof data.images === "object") {
          setResultsImages(data.images);
          localStorage.setItem("nnResultsImages", JSON.stringify(data.images));
        } else {
          setResultsImages({});
          localStorage.removeItem("nnResultsImages");
        }
        setToastMessage(data.message || "Test run completed successfully!");
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
          "Test Model"
        )}
      </button>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      {Object.keys(metrics).length > 0 && <MetricsCard metrics={metrics} />}

      {Object.keys(resultsImages).length > 0 && (
        <ResultsImagesGrid
          resultsImages={resultsImages}
          setModalImage={setModalImage}
        />
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
