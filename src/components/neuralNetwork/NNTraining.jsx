import { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Toast from "../toast/Toast";
import DistributionInputGroup from "./DistributionInputGroup";

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

        if (nnTrainingValues.useBayesian) {
          const distParams = nnTrainingValues.distributionParams || {};
          const vectorKeys = [
            "alpha_vector",
            "p_vector",
            "weights",
            "means",
            "sigmas",
          ];

          const parsedParams = Object.fromEntries(
            Object.entries(distParams)
              .filter(([key, value]) => {
                if (vectorKeys.includes(key)) {
                  return value !== undefined && value !== "";
                }
                return (
                  value !== undefined && value !== "" && !isNaN(Number(value))
                );
              })
              .map(([key, value]) => {
                if (vectorKeys.includes(key)) {
                  return [key, value];
                }
                return [key, Number(value)];
              })
          );

          bnnParams.bayesian_config = {
            distribution_type: nnTrainingValues.distribution || "normal",
            ...parsedParams,
          };
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
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                </tr>
              </thead>
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
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                </tr>
              </thead>
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
                      <option value="beta">Beta</option>
                      <option value="chisquared">Chi Squared</option>
                      <option value="exgaussian">ExGaussian</option>
                      <option value="gamma">Gamma</option>
                      <option value="uniform">Uniform</option>
                      <option value="dirichlet">Dirichlet</option>
                      <option value="multinomial">Multinomial</option>
                      <option value="binomial">Binomial</option>
                      <option value="logistic">Logistic</option>
                      <option value="lognormal">LogNormal</option>
                      <option value="weibull">Weibull</option>
                      <option value="bernoulli">Bernoulli</option>
                      <option value="poisson">Poisson</option>
                      <option value="dirichletmultinomial">
                        Dirichlet Multinomial
                      </option>
                      <option value="betabinomial">Beta Binomial</option>
                      <option value="categorical">Categorical</option>
                      <option value="normalmixture">Normal Mixture</option>
                      <option value="gaussianrandomwalk">
                        Gaussian Random Walk
                      </option>
                      <option value="ar1">AR1</option>
                    </select>
                  </td>
                </tr>

                <DistributionInputGroup
                  distributionName="normal"
                  currentDistribution={nnTrainingValues.distribution}
                  paramDefs={[
                    { key: "mu", label: "Mean", defaultValue: "0" },
                    { key: "sigma", label: "Sigma", defaultValue: "1" },
                  ]}
                  values={nnTrainingValues.distributionParams}
                  onChange={(updatedParams) =>
                    handleChange("distributionParams", updatedParams)
                  }
                  isLoading={isLoading}
                />

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "halfnormal" && (
                    <tr>
                      <td>Sigma:</td>
                      <td>
                        <input
                          type="number"
                          value={
                            nnTrainingValues.distributionParams?.sigma || 1
                          }
                          onChange={(e) =>
                            handleChange("distributionParams", {
                              ...nnTrainingValues.distributionParams,
                              sigma: e.target.value,
                            })
                          }
                          step="0.1"
                          disabled={isLoading}
                        />
                      </td>
                    </tr>
                  )}

                {/* Cauchy */}
                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "cauchy" && (
                    <>
                      <tr>
                        <td>Alpha:</td>
                        <td>
                          <input
                            type="number"
                            value={
                              nnTrainingValues.distributionParams?.alpha || 0
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
                              nnTrainingValues.distributionParams?.beta || 0
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                beta: e.target.value,
                              })
                            }
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
                            nnTrainingValues.distributionParams?.lambda || 0
                          }
                          onChange={(e) =>
                            handleChange("distributionParams", {
                              ...nnTrainingValues.distributionParams,
                              lambda: e.target.value,
                            })
                          }
                          step="0.1"
                          disabled={isLoading}
                        />
                      </td>
                    </tr>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "beta" && (
                    <>
                      <tr>
                        <td>Alpha:</td>
                        <td>
                          <input
                            type="number"
                            value={
                              nnTrainingValues.distributionParams?.alpha || 0
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
                              nnTrainingValues.distributionParams?.beta || 0
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                beta: e.target.value,
                              })
                            }
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "chisquared" && (
                    <tr>
                      <td>k:</td>
                      <td>
                        <input
                          type="number"
                          value={nnTrainingValues.distributionParams?.k || ""}
                          onChange={(e) =>
                            handleChange("distributionParams", {
                              ...nnTrainingValues.distributionParams,
                              k: e.target.value,
                            })
                          }
                          step="1"
                          disabled={isLoading}
                        />
                      </td>
                    </tr>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "exgaussian" && (
                    <>
                      <tr>
                        <td>Mu:</td>
                        <td>
                          <input
                            type="number"
                            value={nnTrainingValues.distributionParams?.mu || 0}
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                mu: e.target.value,
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
                              nnTrainingValues.distributionParams?.sigma || 1
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                sigma: e.target.value,
                              })
                            }
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Tau:</td>
                        <td>
                          <input
                            type="number"
                            value={
                              nnTrainingValues.distributionParams?.tau || 0
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                tau: e.target.value,
                              })
                            }
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "gamma" && (
                    <>
                      <tr>
                        <td>Alpha:</td>
                        <td>
                          <input
                            type="number"
                            value={
                              nnTrainingValues.distributionParams?.alpha || 0
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
                              nnTrainingValues.distributionParams?.beta || 1
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                beta: e.target.value,
                              })
                            }
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                {/* Uniform */}
                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "uniform" && (
                    <>
                      <tr>
                        <td>Lower:</td>
                        <td>
                          <input
                            type="number"
                            value={nnTrainingValues.distributionParams?.a || 0}
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                a: e.target.value,
                              })
                            }
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Upper:</td>
                        <td>
                          <input
                            type="number"
                            value={nnTrainingValues.distributionParams?.b || 1}
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                b: e.target.value,
                              })
                            }
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                {/* Dirichlet */}
                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "dirichlet" && (
                    <tr>
                      <td>Alpha:</td>
                      <td>
                        <input
                          type="text"
                          placeholder="1, 1, 1"
                          value={
                            nnTrainingValues.distributionParams?.alpha_vector ||
                            ""
                          }
                          onChange={(e) =>
                            handleChange("distributionParams", {
                              ...nnTrainingValues.distributionParams,
                              alpha_vector: e.target.value,
                            })
                          }
                          disabled={isLoading}
                        />
                      </td>
                    </tr>
                  )}

                {/* Multinomial */}
                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "multinomial" && (
                    <>
                      <tr>
                        <td>n:</td>
                        <td>
                          <input
                            type="number"
                            value={nnTrainingValues.distributionParams?.n || 0}
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                n: e.target.value,
                              })
                            }
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>P Vector:</td>
                        <td>
                          <input
                            type="text"
                            placeholder="0.2, 0.5, 0.3"
                            value={nnTrainingValues.distributionParams?.p || ""}
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                p_vector: e.target.value,
                              })
                            }
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                {/* Binomial */}
                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "binomial" && (
                    <>
                      <tr>
                        <td>n:</td>
                        <td>
                          <input
                            type="number"
                            value={nnTrainingValues.distributionParams?.n || 1}
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                n: e.target.value,
                              })
                            }
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>p:</td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            value={
                              nnTrainingValues.distributionParams?.p || 0.5
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                p: e.target.value,
                              })
                            }
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                {/* Logistic */}
                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "logistic" && (
                    <>
                      <tr>
                        <td>Mu:</td>
                        <td>
                          <input
                            type="number"
                            value={
                              nnTrainingValues.distributionParams?.location || 0
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                location: e.target.value,
                              })
                            }
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Scale:</td>
                        <td>
                          <input
                            type="number"
                            value={
                              nnTrainingValues.distributionParams?.scale || 1
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                scale: e.target.value,
                              })
                            }
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "lognormal" && (
                    <>
                      <tr>
                        <td>Mu:</td>
                        <td>
                          <input
                            type="number"
                            value={nnTrainingValues.distributionParams?.mu || 0}
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                mu: e.target.value,
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
                              nnTrainingValues.distributionParams?.sigma || 1
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                sigma: e.target.value,
                              })
                            }
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "weibull" && (
                    <>
                      <tr>
                        <td>Alpha:</td>
                        <td>
                          <input
                            type="number"
                            value={
                              nnTrainingValues.distributionParams?.alpha || 0
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
                              nnTrainingValues.distributionParams?.beta || 1
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                beta: e.target.value,
                              })
                            }
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "bernoulli" && (
                    <tr>
                      <td>p:</td>
                      <td>
                        <input
                          type="number"
                          value={nnTrainingValues.distributionParams?.p || 0.5}
                          onChange={(e) =>
                            handleChange("distributionParams", {
                              ...nnTrainingValues.distributionParams,
                              p: e.target.value,
                            })
                          }
                          step="0.01"
                          disabled={isLoading}
                        />
                      </td>
                    </tr>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "poisson" && (
                    <tr>
                      <td>Lambda:</td>
                      <td>
                        <input
                          type="number"
                          value={
                            nnTrainingValues.distributionParams?.lambda || 1
                          }
                          onChange={(e) =>
                            handleChange("distributionParams", {
                              ...nnTrainingValues.distributionParams,
                              lambda: e.target.value,
                            })
                          }
                          step="0.1"
                          disabled={isLoading}
                        />
                      </td>
                    </tr>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "dirichletmultinomial" && (
                    <>
                      <tr>
                        <td>Alpha:</td>
                        <td>
                          <input
                            type="text"
                            placeholder="Comma-separated values"
                            value={
                              nnTrainingValues.distributionParams?.alpha || 0
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                alpha: e.target.value,
                              })
                            }
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>n:</td>
                        <td>
                          <input
                            type="number"
                            value={nnTrainingValues.distributionParams?.n || 1}
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                n: e.target.value,
                              })
                            }
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "betabinomial" && (
                    <>
                      <tr>
                        <td>Alpha:</td>
                        <td>
                          <input
                            type="number"
                            value={
                              nnTrainingValues.distributionParams?.alpha || 0
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
                              nnTrainingValues.distributionParams?.beta || 1
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                beta: e.target.value,
                              })
                            }
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>n:</td>
                        <td>
                          <input
                            type="number"
                            value={nnTrainingValues.distributionParams?.n || 1}
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                n: e.target.value,
                              })
                            }
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "categorical" && (
                    <tr>
                      <td>P:</td>
                      <td>
                        <input
                          type="text"
                          value={nnTrainingValues.distributionParams?.p || 0.5}
                          onChange={(e) =>
                            handleChange("distributionParams", {
                              ...nnTrainingValues.distributionParams,
                              p: e.target.value,
                            })
                          }
                          placeholder="e.g., 0.3,0.4,0.3"
                          disabled={isLoading}
                        />
                      </td>
                    </tr>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "normalmixture" && (
                    <>
                      <tr>
                        <td>Weights:</td>
                        <td>
                          <input
                            type="text"
                            placeholder="0.2, 0.5"
                            value={
                              nnTrainingValues.distributionParams?.weights || ""
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                weights: e.target.value,
                              })
                            }
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Means:</td>
                        <td>
                          <input
                            type="text"
                            placeholder="0.2, 0.5"
                            value={
                              nnTrainingValues.distributionParams?.means || ""
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                means: e.target.value,
                              })
                            }
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Sigmas:</td>
                        <td>
                          <input
                            type="text"
                            placeholder="0.2, 0.5"
                            value={
                              nnTrainingValues.distributionParams?.sigmas || ""
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                sigmas: e.target.value,
                              })
                            }
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "gaussianrandomwalk" && (
                    <>
                      <tr>
                        <td>Mu:</td>
                        <td>
                          <input
                            type="number"
                            value={nnTrainingValues.distributionParams?.mu || 0}
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                mu: e.target.value,
                              })
                            }
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
                              nnTrainingValues.distributionParams?.sigma || 1
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                sigma: e.target.value,
                              })
                            }
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                {nnTrainingValues.useBayesian &&
                  nnTrainingValues.distribution === "ar1" && (
                    <>
                      <tr>
                        <td>Rho:</td>
                        <td>
                          <input
                            type="number"
                            value={
                              nnTrainingValues.distributionParams?.rho || 0
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                rho: e.target.value,
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
                              nnTrainingValues.distributionParams?.sigma || 1
                            }
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                sigma: e.target.value,
                              })
                            }
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Mu:</td>
                        <td>
                          <input
                            type="number"
                            value={nnTrainingValues.distributionParams?.mu || 0}
                            onChange={(e) =>
                              handleChange("distributionParams", {
                                ...nnTrainingValues.distributionParams,
                                mu: e.target.value,
                              })
                            }
                            step="0.1"
                            disabled={isLoading}
                          />
                        </td>
                      </tr>
                    </>
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
