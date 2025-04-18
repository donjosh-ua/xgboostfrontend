import React, { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import Toast from "../toast/Toast";
import "./NNStyles.css";

function NNTraining({
  selectedFile,
  nnParams,
  nnTrainingValues,
  setNNTrainingValues,
}) {
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

  const handleMetricsChange = (metric, isChecked) => {
    if (isChecked) {
      setNNTrainingValues((prev) => ({
        ...prev,
        metrics: [...prev.metrics, metric],
      }));
    } else {
      setNNTrainingValues((prev) => ({
        ...prev,
        metrics: prev.metrics.filter((m) => m !== metric),
      }));
    }
  };

  const handleTrainModel = () => {
    setIsLoading(true);
    sessionStorage.setItem("nnTrainingLoading", "true");
    setTrainMessage("");

    const value =
      nnTrainingValues.trainingMethod === "split"
        ? Number(nnTrainingValues.splitRatio)
        : Number(nnTrainingValues.numFolds);

    const requestData = {
      method: nnTrainingValues.trainingMethod,
      value: value,
      epochs: Number(nnTrainingValues.epochs),
      batch_size: Number(nnTrainingValues.batchSize),
      optimizer: nnTrainingValues.optimizer,
      metrics: nnTrainingValues.metrics,
    };

    fetch(`${url}/train/nn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Neural Network training failed with status " + res.status
          );
        }
        return res.json();
      })
      .then((data) => {
        console.log("Train response:", data);
        setTrainMessage("Neural Network trained successfully!");
      })
      .catch((err) => {
        console.error(err);
        setTrainMessage(
          "There was an error training the neural network. Please try again."
        );
      })
      .finally(() => {
        setIsLoading(false);
        sessionStorage.removeItem("nnTrainingLoading");
      });
  };

  return (
    <div className="nn-training-container">
      <h2>Neural Network Training</h2>
      <p>
        Train your neural network by splitting data or using cross-validation
      </p>

      <div className="nn-selected-params">
        <h3>Current Neural Network Configuration</h3>
        <div className="nn-params-summary">
          <p>
            <strong>Architecture:</strong> {nnParams.hidden_layers} hidden
            layers with {nnParams.neurons_per_layer} neurons each
          </p>
          <p>
            <strong>Activation:</strong> {nnParams.activation}
          </p>
          <p>
            <strong>Learning Rate:</strong> {nnParams.learning_rate}
          </p>
        </div>
      </div>

      <div className="training-methods">
        <button
          className={`method-button ${
            nnTrainingValues.trainingMethod === "split" ? "selected" : ""
          }`}
          onClick={() => handleChange("trainingMethod", "split")}
          disabled={isLoading}
        >
          Split Data
        </button>
        <button
          className={`method-button ${
            nnTrainingValues.trainingMethod === "cv" ? "selected" : ""
          }`}
          onClick={() => handleChange("trainingMethod", "cv")}
          disabled={isLoading}
        >
          Cross Validation
        </button>
      </div>

      {nnTrainingValues.trainingMethod === "split" && (
        <div className="split-ratio">
          <label>
            Split Ratio (Train/Test):
            <input
              type="number"
              value={nnTrainingValues.splitRatio}
              onChange={(e) => handleChange("splitRatio", e.target.value)}
              min="1"
              max="99"
              disabled={isLoading}
            />
          </label>
          <p>
            Training: {nnTrainingValues.splitRatio}%, Testing:{" "}
            {100 - nnTrainingValues.splitRatio}%
          </p>
        </div>
      )}

      {nnTrainingValues.trainingMethod === "cv" && (
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

      <div className="nn-training-options">
        <div className="options-group">
          <h3>Training Options</h3>

          <div className="option-row">
            <label>
              Batch Size:
              <input
                type="number"
                value={nnTrainingValues.batchSize}
                onChange={(e) => handleChange("batchSize", e.target.value)}
                min="1"
                disabled={isLoading}
              />
            </label>
          </div>

          <div className="option-row">
            <label>
              Epochs:
              <input
                type="number"
                value={nnTrainingValues.epochs}
                onChange={(e) => handleChange("epochs", e.target.value)}
                min="1"
                disabled={isLoading}
              />
            </label>
          </div>

          <div className="option-row">
            <label>
              Optimizer:
              <select
                value={nnTrainingValues.optimizer}
                onChange={(e) => handleChange("optimizer", e.target.value)}
                disabled={isLoading}
              >
                <option value="adam">Adam</option>
                <option value="sgd">SGD</option>
                <option value="rmsprop">RMSprop</option>
                <option value="adagrad">Adagrad</option>
              </select>
            </label>
          </div>
        </div>

        <div className="options-group">
          <h3>Metrics</h3>
          <div className="metrics-checkboxes">
            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={nnTrainingValues.metrics.includes("accuracy")}
                  onChange={(e) =>
                    handleMetricsChange("accuracy", e.target.checked)
                  }
                  disabled={isLoading}
                />
                Accuracy
              </label>
            </div>
            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={nnTrainingValues.metrics.includes("precision")}
                  onChange={(e) =>
                    handleMetricsChange("precision", e.target.checked)
                  }
                  disabled={isLoading}
                />
                Precision
              </label>
            </div>
            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={nnTrainingValues.metrics.includes("recall")}
                  onChange={(e) =>
                    handleMetricsChange("recall", e.target.checked)
                  }
                  disabled={isLoading}
                />
                Recall
              </label>
            </div>
            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={nnTrainingValues.metrics.includes("f1")}
                  onChange={(e) => handleMetricsChange("f1", e.target.checked)}
                  disabled={isLoading}
                />
                F1 Score
              </label>
            </div>
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
