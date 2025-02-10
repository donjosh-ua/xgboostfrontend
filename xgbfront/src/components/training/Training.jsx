import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import Toast from "../toast/Toast";
import "./TrainingStyles.css";

function Training({
  selectedFile,
  params,
  gridParams,
  mode,
  trainingValues,
  setTrainingValues,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [trainMessage, setTrainMessage] = useState("");

  // Persist distributionParams in sessionStorage
  useEffect(() => {
    sessionStorage.setItem(
      "distributionParams",
      JSON.stringify(trainingValues.distributionParams)
    );
  }, [trainingValues.distributionParams]);

  const handleChange = (key, value) => {
    setTrainingValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDistributionParamChange = (e) => {
    const { name, value } = e.target;
    setTrainingValues((prev) => ({
      ...prev,
      distributionParams: {
        ...prev.distributionParams,
        [name]: value,
      },
    }));
  };

  const handleTrainModel = () => {
    setIsLoading(true);
    setTrainMessage("");
    const value =
      trainingValues.trainingMethod === "split"
        ? Number(trainingValues.splitRatio)
        : Number(trainingValues.numFolds);
    const requestData = {
      method: trainingValues.trainingMethod,
      value: value,
      rounds: Number(trainingValues.rounds),
      distribution: trainingValues.distribution,
      params: trainingValues.distributionParams,
    };
    fetch("http://127.0.0.0:8000/train/both", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Training failed with status " + res.status);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Train response:", data);
        setTrainMessage("Model trained successfully!");
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setTrainMessage(
          "There was an error training the model. Please try again."
        );
        setIsLoading(false);
      });
  };

  return (
    <div className="training-container">
      <h2>Training</h2>
      <p>Train model by splitting data or cross-validation</p>

      <div className="selected-params">
        <h3>Using {mode === "manual" ? "Manual" : "Grid Search"} Parameters</h3>
      </div>

      <div className="training-methods">
        <button
          className={`method-button ${
            trainingValues.trainingMethod === "split" ? "selected" : ""
          }`}
          onClick={() => handleChange("trainingMethod", "split")}
          disabled={isLoading}
        >
          Split Data
        </button>
        <button
          className={`method-button ${
            trainingValues.trainingMethod === "cv" ? "selected" : ""
          }`}
          onClick={() => handleChange("trainingMethod", "cv")}
          disabled={isLoading}
        >
          Cross Validation
        </button>
      </div>

      {trainingValues.trainingMethod === "split" && (
        <div className="split-ratio">
          <label>
            Split Ratio (Train/Test):
            <input
              type="number"
              value={trainingValues.splitRatio}
              onChange={(e) => handleChange("splitRatio", e.target.value)}
              min="1"
              max="99"
              disabled={isLoading}
            />
          </label>
          <p>
            Training: {trainingValues.splitRatio}%, Testing:{" "}
            {100 - trainingValues.splitRatio}%
          </p>
        </div>
      )}

      {trainingValues.trainingMethod === "cv" && (
        <div className="num-folds">
          <label>
            Number of Folds:
            <input
              type="number"
              value={trainingValues.numFolds}
              onChange={(e) => handleChange("numFolds", e.target.value)}
              min="2"
              max="20"
              disabled={isLoading}
            />
          </label>
        </div>
      )}

      <div className="rounds-input">
        <label>
          Rounds:
          <input
            type="number"
            value={trainingValues.rounds}
            onChange={(e) => handleChange("rounds", e.target.value)}
            min="1"
            disabled={isLoading}
          />
        </label>
      </div>

      <div className="distribution-config">
        <label>
          Distribution:
          <select
            value={trainingValues.distribution}
            onChange={(e) => handleChange("distribution", e.target.value)}
            disabled={isLoading}
          >
            <option value="Normal">Normal</option>
            <option value="HalfNormal">HalfNormal</option>
            <option value="Cauchy">Cauchy</option>
            <option value="Exponential">Exponential</option>
          </select>
        </label>

        <table>
          <tbody>
            {trainingValues.distribution === "Normal" && (
              <>
                <tr>
                  <td>Mean:</td>
                  <td>
                    <input
                      type="number"
                      name="mean"
                      value={trainingValues.distributionParams.mean}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Sigma:</td>
                  <td>
                    <input
                      type="number"
                      name="sigma"
                      value={trainingValues.distributionParams.sigma}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              </>
            )}
            {trainingValues.distribution === "HalfNormal" && (
              <tr>
                <td>Sigma:</td>
                <td>
                  <input
                    type="number"
                    name="sigma"
                    value={trainingValues.distributionParams.sigma}
                    onChange={handleDistributionParamChange}
                    disabled={isLoading}
                  />
                </td>
              </tr>
            )}
            {trainingValues.distribution === "Cauchy" && (
              <>
                <tr>
                  <td>Alpha:</td>
                  <td>
                    <input
                      type="number"
                      name="alpha"
                      value={trainingValues.distributionParams.alpha}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Beta:</td>
                  <td>
                    <input
                      type="number"
                      name="beta"
                      value={trainingValues.distributionParams.beta}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              </>
            )}
            {trainingValues.distribution === "Exponential" && (
              <tr>
                <td>Lambda:</td>
                <td>
                  <input
                    type="number"
                    name="lambda"
                    value={trainingValues.distributionParams.lambda}
                    onChange={handleDistributionParamChange}
                    disabled={isLoading}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        className="train-button"
        onClick={handleTrainModel}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <FaSpinner className="loadingIcon" /> Training...
          </>
        ) : (
          "Train Model"
        )}
      </button>

      {trainMessage && (
        <Toast message={trainMessage} onClose={() => setTrainMessage("")} />
      )}
    </div>
  );
}

export default Training;
