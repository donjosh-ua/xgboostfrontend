import React, { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import Toast from "../toast/Toast";
import "./NNStyles.css";

function NNTraining({ nnParams, nnTrainingValues, setNNTrainingValues }) {
  const [isLoading, setIsLoading] = useState(false);
  const [trainMessage, setTrainMessage] = useState("");
  const url = import.meta.env.VITE_BASE_URL;

  // Restore loading state on mount
  useEffect(() => {
    if (sessionStorage.getItem("nnTrainingLoading") === "true") {
      setIsLoading(true);
    }
  }, []);

  const handleChange = (key, value) => {
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
      trainingMethod: useCrossValidation ? "cv" : "standard",
    }));
  };

  const handleTrainModel = () => {
    setIsLoading(true);
    sessionStorage.setItem("nnTrainingLoading", "true");
    setTrainMessage("");

    // If using cross-validation, send numFolds, otherwise just standard training
    const requestData = {
      method: nnTrainingValues.useCrossValidation ? "cv" : "standard",
      value: nnTrainingValues.useCrossValidation
        ? Number(nnTrainingValues.numFolds)
        : 0,
      epochs: Number(nnTrainingValues.epochs),
      batch_size: Number(nnTrainingValues.batchSize),
      optimizer: nnTrainingValues.optimizer,
      metrics: nnTrainingValues.metrics,
      model_name: nnTrainingValues.modelName || "nn_model",
      // Add distribution parameters if using Bayesian
      ...(nnTrainingValues.useBayesian && {
        useBayesian: true,
        distribution: nnTrainingValues.distribution || "normal",
        distributionParams: nnTrainingValues.distributionParams || {},
      }),
    };

    fetch(`${url}/train/nn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(
              text || `Neural Network training failed with status ${res.status}`
            );
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log("Train response:", data);
        setTrainMessage("Neural Network trained successfully!");
      })
      .catch((err) => {
        console.error("Training error:", err);
        setTrainMessage(
          `Error: ${
            err.message ||
            "There was an error training the neural network. Please try again."
          }`
        );
      })
      .finally(() => {
        setIsLoading(false);
        sessionStorage.removeItem("nnTrainingLoading");
      });
  };

  return (
    <div className="nn-training-container">
      <h2>Training</h2>
      <p>Train your neural network with the current configuration</p>

      <div className="nn-selected-params">
        <h3>Current Configuration</h3>
        <div className="nn-config-summary">
          <div className="config-item">
            <strong>Architecture:</strong> {nnParams.hidden_layers || "1"}{" "}
            hidden layers
          </div>
          <div className="config-item">
            <strong>Loss Function:</strong>{" "}
            {nnParams.criteria || "cross_entropy"}
          </div>
          <div className="config-item">
            <strong>Optimizer:</strong> {nnParams.optimizer || "SGD"}
          </div>
        </div>
      </div>

      <div className="cv-toggle-container">
        <label className="toggle-switch">
          <span>Use Cross Validation</span>
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
            "Train Neural Network"
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
