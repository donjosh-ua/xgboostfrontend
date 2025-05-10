import React, { useState, useEffect } from "react";
import { FaSpinner, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Toast from "../toast/Toast";
import MetricsCard from "../metricsCard/MetricsCard";
import ResultsImagesGrid from "./ResultsImagesGrid";
import "./NNStyles.css";

function NNResults({ selectedFile, modelType, wasTrainedWithCV }) {
  const [toastMessage, setToastMessage] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [resultsImages, setResultsImages] = useState({});
  const [metrics, setMetrics] = useState({});
  const [modalImage, setModalImage] = useState(null);
  const [localWasTrainedWithCV, setLocalWasTrainedWithCV] = useState(
    // Initialize from localStorage or prop (localStorage takes precedence)
    localStorage.getItem("wasTrainedWithCV") === "true" || wasTrainedWithCV
  );
  const [expandedSections, setExpandedSections] = useState({
    overall: false,
    image: false,
    folds: false,
    foldAccuracies: true,
  });
  const url = import.meta.env.VITE_BNN_URL;

  // Use useEffect to update localStorage when localWasTrainedWithCV changes
  useEffect(() => {
    localStorage.setItem("wasTrainedWithCV", localWasTrainedWithCV.toString());
  }, [localWasTrainedWithCV]);

  useEffect(() => {
    const cachedImages = localStorage.getItem("nnResultsImages");
    const cachedMetrics = localStorage.getItem("nnResultsMetrics");
    const storedWasTrainedWithCV = localStorage.getItem("wasTrainedWithCV");

    if (storedWasTrainedWithCV !== null) {
      setLocalWasTrainedWithCV(storedWasTrainedWithCV === "true");
    }

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

  // Only update localWasTrainedWithCV from props when there's an explicit change
  // and when this is a new training session
  useEffect(() => {
    if (
      wasTrainedWithCV !== undefined &&
      localStorage.getItem("wasTrainedWithCV") !== wasTrainedWithCV.toString()
    ) {
      setLocalWasTrainedWithCV(wasTrainedWithCV);
      localStorage.setItem("wasTrainedWithCV", wasTrainedWithCV.toString());
    }
  }, [wasTrainedWithCV]);

  // Persist metrics to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("nnResultsMetrics", JSON.stringify(metrics));
  }, [metrics]);

  // Persist resultsImages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("nnResultsImages", JSON.stringify(resultsImages));
  }, [resultsImages]);

  const handleTestRun = () => {
    localStorage.setItem("wasTrainedWithCV", wasTrainedWithCV.toString());
    setLocalWasTrainedWithCV(wasTrainedWithCV);
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

        localStorage.setItem("wasTrainedWithCV", wasTrainedWithCV.toString());

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

  // Filter images to only show those relevant to current training mode
  const filterCurrentFoldImages = (images, metrics) => {
    // If not trained with CV, exclude all fold-related images
    if (!localWasTrainedWithCV) {
      const filteredImages = {};
      Object.entries(images).forEach(([key, value]) => {
        // Only include images that don't have fold-related names
        if (!key.match(/fold[_-]?(\d+)/i) && !key.includes("cv_")) {
          filteredImages[key] = value;
        }
      });
      return filteredImages;
    }

    // If we're using CV but don't have fold data, return all images
    if (!hasEntries(metrics.fold_accuracies)) {
      return images;
    }

    // Get current fold numbers from the fold_accuracies object
    const currentFolds = Object.keys(metrics.fold_accuracies)
      .map((key) => key.replace("fold_", ""))
      .map(Number);

    // Maximum fold number in current run
    const maxCurrentFold = Math.max(...currentFolds);

    // Filter images to only include those from current folds
    const filteredImages = {};
    Object.entries(images).forEach(([key, value]) => {
      // Extract fold number from the image key (assuming keys contain "fold_X" or similar pattern)
      const foldMatch = key.match(/fold[_-]?(\d+)/i);
      if (foldMatch) {
        const foldNum = parseInt(foldMatch[1], 10);
        // Only include images from folds that are part of current run
        if (foldNum <= maxCurrentFold) {
          filteredImages[key] = value;
        }
      } else {
        // If no fold number in key, include it (might be a summary image)
        filteredImages[key] = value;
      }
    });

    return filteredImages;
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
            {localWasTrainedWithCV && hasEntries(metrics.fold_accuracies) && (
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
            {localWasTrainedWithCV && hasEntries(metrics.class_frequency) && (
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

      {metrics && Object.keys(metrics).length > 0 && (
        <div className="nn-training-method-info">
          <span className="training-method-badge">
            Trained with cv: {wasTrainedWithCV ? "Yes" : "No"}
          </span>
        </div>
      )}

      {Object.keys(resultsImages).length > 0 && (
        <ResultsImagesGrid
          resultsImages={filterCurrentFoldImages(resultsImages, metrics)}
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
