import React, { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Toast from "../toast/Toast";
import "./NNStyles.css";

function NNTraining({
  nnParams,
  nnTrainingValues,
  setNNTrainingValues,
  activeModel,
  setWasTrainedWithCV,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [trainMessage, setTrainMessage] = useState("");
  const [configExpanded, setConfigExpanded] = useState(false);
  const url = import.meta.env.VITE_BNN_URL;

  // Toggle config card expanded state
  const toggleConfigCard = () => {
    setConfigExpanded(!configExpanded);
  };

  // Restore loading state on mount
  useEffect(() => {
    if (sessionStorage.getItem("nnTrainingLoading") === "true") {
      setIsLoading(true);
    }
  }, []);

  // Ensure numeric values are properly parsed
  const ensureNumericValue = (value) => {
    if (value === "" || isNaN(Number(value))) {
      return "0";
    }
    return value.toString();
  };

  const handleChange = (key, value) => {
    // For numeric fields, ensure they're properly formatted
    if (["numFolds", "epochs", "batchSize"].includes(key)) {
      value = ensureNumericValue(value);
    }

    setNNTrainingValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleCrossValidation = () => {
    const useCrossValidation = !nnTrainingValues.useCrossValidation;
    setNNTrainingValues((prev) => ({
      ...prev,
      useCrossValidation,
    }));
  };

  const handleTrainModel = async () => {
    setIsLoading(true);
    sessionStorage.setItem("nnTrainingLoading", "true");
    setTrainMessage("");

    setWasTrainedWithCV(nnTrainingValues.useCrossValidation);

    try {
      // Ensure activeModel comparison is case-insensitive
      const mode = activeModel.toLowerCase();
      if (mode === "neuralnetwork") {
        // BNN mode payload
        const bnnParams = {
          alpha: Number(nnParams.alpha || 0.001),
          epoch: Number(nnTrainingValues.epochs) || 20,
          criteria: nnParams.criteria || "cross_entropy",
          optimizer: nnTrainingValues.optimizer || "SGD",
          image_size: Number(nnParams.image_size || 0),
          verbose: Boolean(nnParams.verbose),
          decay: Number(nnParams.decay || 0),
          momentum: Number(nnParams.momentum || 0.9),
          image: Boolean(nnParams.image),
          FA_ext: nnParams.FA_ext || "string",
          useBayesian: Boolean(nnTrainingValues.useBayesian),
          save_mod: nnTrainingValues.modelName || "ModiR",
          pred_hot: Boolean(nnParams.pred_hot),
          test_size: Number(nnParams.test_size || 0.2),
          batch_size: Number(nnTrainingValues.batchSize) || 64,
          cv: nnTrainingValues.useCrossValidation,
          numFolds: nnTrainingValues.useCrossValidation
            ? parseInt(nnTrainingValues.numFolds) || 5
            : 0,
          layers: nnParams.layers || [],
        };

        // Handle Bayesian parameters as a separate object for clarity
        if (nnTrainingValues.useBayesian) {
          // Create a dedicated bayesian config object
          bnnParams.bayesian_config = {
            distribution_type: nnTrainingValues.distribution || "normal",
          };

          // Add specific parameters based on distribution type
          switch (nnTrainingValues.distribution) {
            case "normal":
              bnnParams.bayesian_config.mean = Number(
                nnTrainingValues.distributionParams?.mean || 0
              );
              bnnParams.bayesian_config.sigma = Number(
                nnTrainingValues.distributionParams?.sigma || 1
              );
              break;
            case "halfnormal":
              bnnParams.bayesian_config.sigma = Number(
                nnTrainingValues.distributionParams?.sigma || 1
              );
              break;
            case "cauchy":
              bnnParams.bayesian_config.alpha = Number(
                nnTrainingValues.distributionParams?.alpha || 0
              );
              bnnParams.bayesian_config.beta = Number(
                nnTrainingValues.distributionParams?.beta || 1
              );
              break;
            case "exponential":
              bnnParams.bayesian_config.lambda = Number(
                nnTrainingValues.distributionParams?.lambda || 1
              );
              break;
            default:
              // Default to normal with standard parameters
              bnnParams.bayesian_config.distribution_type = "normal";
              bnnParams.bayesian_config.mean = 0;
              bnnParams.bayesian_config.sigma = 1;
          }
        }

        console.log("Sending BNN training parameters:", bnnParams);

        const res = await fetch(`${url}/train/normal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bnnParams),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Training failed with status ${res.status}`);
        }

        const data = await res.json();
        console.log("Train response (BNN):", data);
        setTrainMessage("Neural network trained successfully!");
      } else {
        // Fallback for non-BNN mode (currently not implemented)
        console.log("Non-neuralnetwork training triggered");
        setTrainMessage(
          "Training for non-neuralnetwork mode is not implemented yet."
        );
      }
    } catch (err) {
      console.error("Training error:", err);
      setTrainMessage(
        `Error: ${
          err.message ||
          "There was an error training the model. Please try again."
        }`
      );
    } finally {
      setIsLoading(false);
      sessionStorage.removeItem("nnTrainingLoading");
    }
  };

  return (
    <div className="nn-training-container">
      <h2>Training</h2>
      <p>Train your neural network with the current configuration</p>

      <div className="nn-config-card">
        <div className="nn-config-header" onClick={toggleConfigCard}>
          <h3>Current Configuration</h3>
          {configExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <div
          className={`nn-config-content ${configExpanded ? "expanded" : ""}`}
        >
          <div className="nn-config-summary">
            <div className="config-item">
              <strong>Architecture:</strong>
              {nnParams.layers?.length || "0"} hidden layers
            </div>
            <div className="config-item">
              <strong>Loss Function:</strong>
              {nnParams.criteria || "cross_entropy"}
            </div>
            <div className="config-item">
              <strong>Optimizer:</strong>
              {nnTrainingValues.optimizer || "SGD"}
            </div>
          </div>
        </div>
      </div>

      <div className="cv-toggle-container">
        <label className="toggle-switch">
          <span>Cross Validation</span>
          <div className="switch">
            <input
              type="checkbox"
              checked={nnTrainingValues.useCrossValidation}
              onChange={toggleCrossValidation}
              disabled={isLoading}
            />
            <span className="slider round"></span>
          </div>
        </label>
      </div>

      {nnTrainingValues.useCrossValidation && (
        <div className="num-folds">
          <label>
            Number of Folds:
            <input
              type="number"
              value={nnTrainingValues.numFolds}
              onChange={(e) => handleChange("numFolds", e.target.value)}
              min="2"
              max="20"
              disabled={isLoading}
            />
          </label>
        </div>
      )}

      {/* Training Options Cards */}
      <div className="options-cards">
        {/* Training Options Card */}
        <div className="options-card">
          <h3>Training Options</h3>
          <div className="table-container">
            <table>
              <tbody>
                <tr>
                  <td>Batch Size:</td>
                  <td>
                    <input
                      type="number"
                      value={nnTrainingValues.batchSize}
                      onChange={(e) =>
                        handleChange("batchSize", e.target.value)
                      }
                      min="1"
                      disabled={isLoading}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Epochs:</td>
                  <td>
                    <input
                      type="number"
                      value={nnTrainingValues.epochs}
                      onChange={(e) => handleChange("epochs", e.target.value)}
                      min="1"
                      disabled={isLoading}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Optimizer:</td>
                  <td>
                    <select
                      value={nnTrainingValues.optimizer}
                      onChange={(e) =>
                        handleChange("optimizer", e.target.value)
                      }
                      disabled={isLoading}
                    >
                      <option value="adam">Adam</option>
                      <option value="sgd">SGD</option>
                      <option value="rmsprop">RMSprop</option>
                      <option value="adagrad">Adagrad</option>
                      <option value="nesterov">Nesterov</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Save Model Name:</td>
                  <td>
                    <input
                      type="text"
                      value={nnTrainingValues.modelName || "ModiR"}
                      onChange={(e) =>
                        handleChange("modelName", e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bayesian Configuration Card */}
        <div className="options-card">
          <h3>Bayesian Configuration</h3>
          <div className="table-container">
            <table>
              <tbody>
                <tr>
                  <td>Use Bayesian:</td>
                  <td>
                    <select
                      value={nnTrainingValues.useBayesian ? "true" : "false"}
                      onChange={(e) =>
                        handleChange("useBayesian", e.target.value === "true")
                      }
                      disabled={isLoading}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Distribution:</td>
                  <td>
                    <select
                      value={nnTrainingValues.distribution || "normal"}
                      onChange={(e) =>
                        handleChange("distribution", e.target.value)
                      }
                      disabled={isLoading || !nnTrainingValues.useBayesian}
                    >
                      <option value="normal">Normal</option>
                      <option value="halfnormal">Half Normal</option>
                      <option value="cauchy">Cauchy</option>
                      <option value="exponential">Exponential</option>
                    </select>
                  </td>
                </tr>

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "normal" && (
                    <>
                      <tr>
                        <td>Mean:</td>
                        <td>
                          <input
                            type="number"
                            value={
                              nnTrainingValues.distributionParams?.mean || "0"
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                mean: e.target.value,
                              })
                            }
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Sigma:</td>
                        <td>
                          <input
                            type="number"
                            value={
                              nnTrainingValues.distributionParams?.sigma || "1"
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                sigma: e.target.value,
                              })
                            }
                            min="0.01"
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "halfnormal" && (
                    <tr>
                      <td>Sigma:</td>
                      <td>
                        <input
                          type="number"
                          value={
                            nnTrainingValues.distributionParams?.sigma || "1"
                          }
                          onChange={(e) =>
                            handleChange("distributionParams", {
                              ...nnTrainingValues.distributionParams,
                              sigma: e.target.value,
                            })
                          }
                          min="0.01"
                          step="0.1"
                          disabled={isLoading}
                        />
                      </td>
                    </tr>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "cauchy" && (
                    <>
                      <tr>
                        <td>Alpha:</td>
                        <td>
                          <input
                            type="number"
                            value={
                              nnTrainingValues.distributionParams?.alpha || "0"
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                alpha: e.target.value,
                              })
                            }
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Beta:</td>
                        <td>
                          <input
                            type="number"
                            value={
                              nnTrainingValues.distributionParams?.beta || "1"
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                beta: e.target.value,
                              })
                            }
                            min="0.01"
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "exponential" && (
                    <tr>
                      <td>Lambda:</td>
                      <td>
                        <input
                          type="number"
                          value={
                            nnTrainingValues.distributionParams?.lambda || "1"
                          }
                          onChange={(e) =>
                            handleChange("distributionParams", {
                              ...nnTrainingValues.distributionParams,
                              lambda: e.target.value,
                            })
                          }
                          min="0.01"
                          step="0.1"
                          disabled={isLoading}
                        />
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="button-container">
        <button onClick={handleTrainModel} disabled={isLoading}>
          {isLoading ? (
            <>
              <FaSpinner className="loadingIcon" /> Training...
            </>
          ) : (
            "Train Model"
          )}
        </button>
      </div>

      {trainMessage && (
        <Toast message={trainMessage} onClose={() => setTrainMessage("")} />
      )}
    </div>
  );
}

export default NNTraining;
