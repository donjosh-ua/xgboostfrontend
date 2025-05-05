import React, { useState, useEffect } from "react";
import { FaSpinner, FaChevronDown, FaChevronUp } from "react-icons/fa";
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
  // Add state to track which sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    overall: true,
    image: true,
    folds: true,
    foldAccuracies: true,
  });
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

        // Create a sanitized version of the metrics without nested objects
        const basicMetrics = {};
        const fullMetrics = data.raw_results || data;

        // Extract only the primitive values (numbers, strings) for MetricsCard
        Object.entries(fullMetrics).forEach(([key, value]) => {
          if (typeof value !== "object" || value === null) {
            basicMetrics[key] = value;
          }
        });

        // Set the full metrics object for our component
        setMetrics({
          ...basicMetrics,
          overall_class_frequency: fullMetrics.overall_class_frequency || {},
          image_class_frequency: fullMetrics.image_class_frequency || {},
          class_frequency: fullMetrics.class_frequency || {},
          fold_accuracies: fullMetrics.fold_accuracies || {},
        });

        localStorage.setItem(
          "nnResultsMetrics",
          JSON.stringify({
            ...basicMetrics,
            overall_class_frequency: fullMetrics.overall_class_frequency || {},
            image_class_frequency: fullMetrics.image_class_frequency || {},
            class_frequency: fullMetrics.class_frequency || {},
            fold_accuracies: fullMetrics.fold_accuracies || {},
          })
        );

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
        console.error("Data that caused error:", metrics);
        setToastMessage("Error during test run. Please try again.");
      })
      .finally(() => {
        setIsTesting(false);
        sessionStorage.removeItem("nnResultsTesting");
      });
  };

  // Safely check if an object exists and has keys
  const hasEntries = (obj) => {
    return obj && typeof obj === "object" && Object.keys(obj).length > 0;
  };

  // Toggle expanded state for a specific section
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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

      {Object.keys(metrics).length > 0 && (
        <>
          {/* Pass only primitive values to MetricsCard, not nested objects */}
          <MetricsCard
            metrics={Object.fromEntries(
              Object.entries(metrics).filter(
                ([key, value]) => typeof value !== "object" || value === null
              )
            )}
          />

          {/* Display frequency data separately */}
          <div className="frequency-section">
            {/* Fold Accuracies Section */}
            {hasEntries(metrics.fold_accuracies) && (
              <div className="accuracy-section collapsible-section">
                <div
                  className="section-header"
                  onClick={() => toggleSection("foldAccuracies")}
                >
                  <h3>CV Fold Accuracies</h3>
                  {expandedSections.foldAccuracies ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </div>
                {expandedSections.foldAccuracies && (
                  <div className="fold-accuracies">
                    {(() => {
                      // Find the highest accuracy
                      const accuracies = Object.values(metrics.fold_accuracies);
                      const highestAccuracy = Math.max(...accuracies);

                      return Object.entries(metrics.fold_accuracies).map(
                        ([foldName, accuracy]) => (
                          <div key={foldName} className="fold-accuracy-item">
                            <span className="fold-name">
                              {foldName.replace("fold_", "Fold ")}:
                            </span>
                            <span
                              className="fold-value"
                              style={{
                                color:
                                  accuracy === highestAccuracy
                                    ? "#4caf50"
                                    : "#333",
                              }}
                            >
                              <strong>{accuracy.toFixed(2)}%</strong>
                            </span>
                            <div
                              className="accuracy-bar"
                              style={{
                                width: `${accuracy}%`,
                                backgroundColor: `hsl(${Math.min(
                                  120,
                                  accuracy
                                )}deg, 70%, 50%)`,
                              }}
                            />
                          </div>
                        )
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {hasEntries(metrics.overall_class_frequency) && (
              <div className="frequency-text collapsible-section">
                <div
                  className="section-header"
                  onClick={() => toggleSection("overall")}
                >
                  <h3>Overall Class Distribution</h3>
                  {expandedSections.overall ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </div>
                {expandedSections.overall && (
                  <ul>
                    {Object.entries(metrics.overall_class_frequency).map(
                      ([className, count]) => (
                        <li key={className}>
                          {className.replace("class_", "Class ")}:{" "}
                          <strong>{count}</strong>
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>
            )}

            {hasEntries(metrics.image_class_frequency) && (
              <div className="frequency-text collapsible-section">
                <div
                  className="section-header"
                  onClick={() => toggleSection("image")}
                >
                  <h3>Image Class Distribution</h3>
                  {expandedSections.image ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {expandedSections.image && (
                  <ul>
                    {Object.entries(metrics.image_class_frequency).map(
                      ([className, count]) => (
                        <li key={className}>
                          {className.replace("class_", "Class ")}:{" "}
                          <strong>{count}</strong>
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>
            )}

            {/* Display cross-validation fold data */}
            {hasEntries(metrics.class_frequency) && (
              <div className="frequency-text cv-folds collapsible-section">
                <div
                  className="section-header"
                  onClick={() => toggleSection("folds")}
                >
                  <h3>CV Fold Distribution</h3>
                  {expandedSections.folds ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {expandedSections.folds && (
                  <>
                    {Object.entries(metrics.class_frequency).map(
                      ([foldName, classDistribution]) => (
                        <div key={foldName} className="fold-distribution">
                          <h4>{foldName.replace("cv_fold_", "Fold ")}</h4>
                          <ul>
                            {Object.entries(classDistribution).map(
                              ([className, count]) => (
                                <li key={`${foldName}-${className}`}>
                                  {className.replace("class_", "Class ")}:{" "}
                                  <strong>{count}</strong>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

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
