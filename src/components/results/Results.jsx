import { useState, useEffect } from "react";
import { FaSpinner, FaDownload } from "react-icons/fa";
import Toast from "../toast/Toast";
import "./ResultsStyles.css";

function Results() {
  const [toastMessage, setToastMessage] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [resultsImages, setResultsImages] = useState({});
  const [modalImage, setModalImage] = useState(null);
  const url = import.meta.env.VITE_XGB_URL;

  useEffect(() => {
    const cachedImages = localStorage.getItem("resultsImages");
    if (cachedImages) {
      setResultsImages(JSON.parse(cachedImages));
    }
    if (sessionStorage.getItem("resultsTesting") === "true") {
      setIsTesting(true);
    }
  }, []);

  const handleTestRun = () => {
    setIsTesting(true);
    sessionStorage.setItem("resultsTesting", "true");
    setToastMessage("");
    fetch(`${url}/test/run`, {
      method: "POST",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Test run failed with status " + res.status);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Test run response:", data);
        if (data.images && typeof data.images === "object") {
          setResultsImages(data.images);
          localStorage.setItem("resultsImages", JSON.stringify(data.images));
          setToastMessage(data.message || "Test run completed successfully!");
        } else {
          setResultsImages({});
          localStorage.removeItem("resultsImages");
          setToastMessage("Test run completed, but no images were returned.");
        }
      })
      .catch((err) => {
        console.error(err);
        setToastMessage("Error during test run. Please try again.");
      })
      .finally(() => {
        setIsTesting(false);
        sessionStorage.removeItem("resultsTesting");
      });
  };

  const handleDownload = (modelType) => {
    setIsDownloading(true);

    fetch(`${url}/test/download/${modelType}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Download failed: ${response.statusText}`);
        }
        return response.blob();
      })
      .then((blob) => {
        // Create a URL for the blob
        const downloadUrl = window.URL.createObjectURL(blob);

        // Create a temporary link element
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `xgboost_${modelType}_model.xgb`;

        // Append to the document, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        window.URL.revokeObjectURL(downloadUrl);

        setToastMessage(
          `${
            modelType.charAt(0).toUpperCase() + modelType.slice(1)
          } model downloaded successfully!`
        );
      })
      .catch((error) => {
        console.error("Download error:", error);
        setToastMessage(
          `Error downloading ${modelType} model. It may not exist yet.`
        );
      })
      .finally(() => {
        setIsDownloading(false);
      });
  };

  return (
    <div className="results-container">
      <h2>Testing</h2>
      <p>Test normal and custom xgboost against selected dataset</p>
      <button onClick={handleTestRun} disabled={isTesting}>
        {isTesting ? (
          <>
            <FaSpinner className="loadingIcon" /> Testing...
          </>
        ) : (
          "Test Model"
        )}
      </button>

      <div className="download-section">
        <h3>Download Models</h3>
        <div className="download-buttons">
          <button
            onClick={() => handleDownload("normal")}
            disabled={isDownloading}
            className="download-button"
          >
            <FaDownload /> Normal Model
          </button>
          <button
            onClick={() => handleDownload("custom")}
            disabled={isDownloading}
            className="download-button"
          >
            <FaDownload /> Custom Model
          </button>
        </div>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
      {Object.keys(resultsImages).length > 0 && (
        <div className="results-images">
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
                alt={`Test result for ${key}`}
              />
            </div>
          ))}
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

export default Results;
