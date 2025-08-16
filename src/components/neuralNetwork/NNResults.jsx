import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
} from "react-icons/fa";
import Toast from "../toast/Toast";
import MetricsCard from "../metricsCard/MetricsCard";
import "./NNStyles.css";

function NNResults({ wasTrainedWithCV, nnParams, nnTrainingValues }) {
  const [toastMessage, setToastMessage] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [trainResults, setTrainResults] = useState({});
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
    const cachedMetrics = localStorage.getItem("nnResultsMetrics");
    const cachedTestResults = localStorage.getItem("nnTestResults");
    const cachedTrainResults = localStorage.getItem("nnTrainResults");
    const storedWasTrainedWithCV = localStorage.getItem("wasTrainedWithCV");

    if (storedWasTrainedWithCV !== null) {
      setLocalWasTrainedWithCV(storedWasTrainedWithCV === "true");
    }

    if (cachedMetrics) {
      setMetrics(JSON.parse(cachedMetrics));
    }
    if (cachedTestResults) {
      setTestResults(JSON.parse(cachedTestResults));
    }
    if (cachedTrainResults) {
      setTrainResults(JSON.parse(cachedTrainResults));
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

  // Persist testResults to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("nnTestResults", JSON.stringify(testResults));
  }, [testResults]);

  // Persist trainResults to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("nnTrainResults", JSON.stringify(trainResults));
  }, [trainResults]);

  const handleDownload = () => {
    setIsDownloading(true);

    fetch(`${url}/train/download`)
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
        link.download = "best_neural_network_model.pth";

        // Append to the document, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        window.URL.revokeObjectURL(downloadUrl);

        setToastMessage("Best model downloaded successfully!");
      })
      .catch((error) => {
        console.error("Download error:", error);
        setToastMessage("Error downloading model. It may not exist yet.");
      })
      .finally(() => {
        setIsDownloading(false);
      });
  };

  const handleUnifiedTest = async () => {
    setIsTesting(true);
    setToastMessage("");

    try {
      // First, get training results
      const trainResponse = await fetch(`${url}/train/results`, {
        method: "GET",
      });

      if (!trainResponse.ok) {
        throw new Error("Failed to get training results");
      }

      const trainData = await trainResponse.json();
      console.log("Train results response:", trainData);

      // Process training metrics
      const basicMetrics = {};
      const fullMetrics = trainData.raw_results || trainData;

      Object.entries(fullMetrics).forEach(([key, value]) => {
        if (typeof value !== "object" || value === null) {
          basicMetrics[key] = value;
        }
      });

      setMetrics({
        ...basicMetrics,
        overall_class_frequency: fullMetrics.overall_class_frequency || {},
        image_class_frequency: fullMetrics.image_class_frequency || {},
        class_frequency: fullMetrics.class_frequency || {},
        fold_accuracies: fullMetrics.fold_accuracies || {},
      });

      // Store training results
      setTrainResults({
        metrics: fullMetrics,
        images: trainData.images || {},
      });

      // Determine the best model name based on CV training and fold accuracies
      let bestModelName;
      if (
        localWasTrainedWithCV &&
        fullMetrics.fold_accuracies &&
        Object.keys(fullMetrics.fold_accuracies).length > 0
      ) {
        // Find the fold with highest accuracy
        let bestFold = null;
        let highestAccuracy = -1;

        Object.entries(fullMetrics.fold_accuracies).forEach(
          ([foldName, accuracy]) => {
            if (accuracy > highestAccuracy) {
              highestAccuracy = accuracy;
              bestFold = foldName;
            }
          }
        );

        if (bestFold) {
          // Extract fold number from fold name (e.g., "fold_1" -> "1")
          const foldNumber = bestFold.replace(/fold[_-]?/i, "");
          bestModelName = `best_${
            nnTrainingValues?.modelName || "ModiR"
          }_K${foldNumber}`;
        } else {
          bestModelName = `best_${nnTrainingValues?.modelName || "ModiR"}`;
        }
      } else {
        bestModelName = `best_${nnTrainingValues?.modelName || "ModiR"}`;
      }

      console.log(
        "Selected best model:",
        bestModelName,
        localWasTrainedWithCV ? "with CV" : "without CV"
      );

      // Second, run the test endpoint
      const testRequestData = {
        model_name: bestModelName,
        test_size: Number(nnParams?.test_size || 0.2),
        generate_plots: true,
      };

      console.log("Sending test request:", testRequestData);

      const testResponse = await fetch(`${url}/train/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testRequestData),
      });

      if (!testResponse.ok) {
        const errorData = await testResponse.json().catch(() => ({}));
        throw new Error(
          errorData.error_message || `Test failed: ${testResponse.statusText}`
        );
      }

      const testData = await testResponse.json();
      console.log("Test results:", testData);

      if (testData.success === false) {
        throw new Error(testData.error_message || "Test failed");
      }

      setTestResults(testData);
      localStorage.setItem("nnTestResults", JSON.stringify(testData));
      localStorage.setItem(
        "nnTrainResults",
        JSON.stringify({
          metrics: fullMetrics,
          images: trainData.images || {},
        })
      );
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

      setToastMessage(
        `Test completed successfully! Training and test results updated.`
      );
    } catch (error) {
      console.error("Test error:", error);
      const errorMsg = error.message;
      if (
        errorMsg.includes("Model validation failed") ||
        errorMsg.includes("Error reading configuration")
      ) {
        setToastMessage(
          "No trained model found. Please train a model first before testing."
        );
      } else {
        setToastMessage(`Error: ${errorMsg}`);
      }
    } finally {
      setIsTesting(false);
    }
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
      <h2>Model Testing & Results</h2>
      <p>Test your neural network model and view training results</p>

      <button
        onClick={handleUnifiedTest}
        disabled={isTesting}
        className="test-button"
      >
        {isTesting ? (
          <>
            <FaSpinner className="loadingIcon" /> Running Tests...
          </>
        ) : (
          "Run Complete Test"
        )}
      </button>

      <div className="download-section">
        <h3>Download Best Model</h3>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="download-button"
        >
          {isDownloading ? (
            <>
              <FaSpinner className="loadingIcon" /> Downloading...
            </>
          ) : (
            <>
              <FaDownload /> Download Model
            </>
          )}
        </button>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      {/* Display Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="test-results-section">
          <h3>Test Results</h3>
          <p>
            Model validation results from testing on unseen data (
            {nnParams?.test_size || 0.2} split ratio)
          </p>
          <div className="test-metrics">
            <div className="test-metric-item">
              <span className="metric-label">Test Accuracy:</span>
              <span className="test-metric-value">{testResults.accuracy}%</span>
            </div>
            <div className="test-metric-item">
              <span className="metric-label">Test Samples:</span>
              <span className="test-metric-value">
                {testResults.test_samples}
              </span>
            </div>
            <div className="test-metric-item">
              <span className="metric-label">Model Used:</span>
              <span className="test-metric-value">
                {testResults.model_name}
              </span>
            </div>
          </div>

          {/* Display confusion matrices from training results */}
          {trainResults.images &&
            Object.keys(trainResults.images).length > 0 && (
              <div className="test-plots">
                <h4>Confusion Matrices</h4>
                <div className="test-images-grid">
                  {Object.entries(trainResults.images)
                    .filter(([imageName]) => {
                      const name = imageName.toLowerCase();

                      // First, must be a confusion matrix
                      if (
                        !(name.includes("confusion") || name.includes("matrix"))
                      ) {
                        return false;
                      }

                      // If model was NOT trained with CV, exclude CV-related confusion matrices
                      if (!localWasTrainedWithCV) {
                        return !name.includes("fold") && !name.includes("cv_");
                      }

                      // If trained with CV, show all confusion matrices
                      return true;
                    })
                    .map(([imageName, imageData]) => (
                      <div key={imageName} className="test-image-container">
                        <h5>{imageName.replace(/\.(png|jpg|jpeg)$/i, "")}</h5>
                        <img
                          src={`data:image/png;base64,${imageData}`}
                          alt={imageName}
                          className="test-image"
                          onClick={() =>
                            setModalImage(`data:image/png;base64,${imageData}`)
                          }
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Display Training Results */}
      {Object.keys(metrics).length > 0 && (
        <div className="training-results-section">
          <h3>Training Results</h3>
          <p>
            Performance metrics and visualizations from the training process
          </p>

          {/* Display training metrics */}
          <MetricsCard
            metrics={Object.fromEntries(
              Object.entries(metrics).filter(
                ([key, value]) => typeof value !== "object" || value === null
              )
            )}
          />

          {/* Display training images from train/results endpoint */}
          {trainResults.images &&
            Object.keys(trainResults.images).length > 0 && (
              <div className="training-plots">
                <h4>Training Visualizations</h4>
                <div className="training-images-grid">
                  {Object.entries(trainResults.images)
                    .filter(([imageName]) => {
                      const name = imageName.toLowerCase();

                      // Exclude confusion matrices (they go to test section)
                      if (
                        name.includes("confusion") ||
                        name.includes("matrix")
                      ) {
                        return false;
                      }

                      // If model was NOT trained with CV, exclude CV-related images
                      if (!localWasTrainedWithCV) {
                        return !name.includes("fold") && !name.includes("cv_");
                      }
                      // If trained with CV, show all non-confusion images
                      return true;
                    })
                    .map(([imageName, imageData]) => (
                      <div key={imageName} className="training-image-container">
                        <h5>{imageName.replace(/\.(png|jpg|jpeg)$/i, "")}</h5>
                        <img
                          src={`data:image/png;base64,${imageData}`}
                          alt={imageName}
                          className="training-image"
                          onClick={() =>
                            setModalImage(`data:image/png;base64,${imageData}`)
                          }
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

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
        </div>
      )}

      {metrics && Object.keys(metrics).length > 0 && (
        <div className="nn-training-method-info">
          <span className="training-method-badge">
            Trained with CV: {wasTrainedWithCV ? "Yes" : "No"}
          </span>
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

NNResults.propTypes = {
  wasTrainedWithCV: PropTypes.bool.isRequired,
  nnParams: PropTypes.shape({
    test_size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  nnTrainingValues: PropTypes.shape({
    modelName: PropTypes.string,
  }),
};

export default NNResults;
