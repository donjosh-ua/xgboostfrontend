import React, { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import Toast from "../toast/Toast";
import "./NNStyles.css";

function NNTunning({ selectedFile, nnParams, setNNParams }) {
  const [toastMessage, setToastMessage] = useState("");
  const [paramsLoading, setParamsLoading] = useState(false);
  const url = import.meta.env.VITE_BASE_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNNParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };

  const handleLoadParameters = () => {
    // Convert all parameter values to appropriate types
    const parsedParams = {
      ...nnParams,
      hidden_layers: Number(nnParams.hidden_layers),
      neurons_per_layer: Number(nnParams.neurons_per_layer),
      learning_rate: Number(nnParams.learning_rate),
      batch_size: Number(nnParams.batch_size),
      epochs: Number(nnParams.epochs),
      dropout_rate: Number(nnParams.dropout_rate),
    };

    setParamsLoading(true);
    sessionStorage.setItem("nnParamsLoading", "true");

    fetch(`${url}/parameters/nn/setparams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parameters: parsedParams }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Parameters loaded:", data);
        setToastMessage("Neural Network parameters loaded successfully!");
      })
      .catch((err) => {
        console.error(err);
        setToastMessage("Error loading parameters. Please try again.");
      })
      .finally(() => {
        setParamsLoading(false);
        sessionStorage.removeItem("nnParamsLoading");
      });
  };

  return (
    <div className="nn-tunning-container">
      <h2>Neural Network Parameters</h2>
      <p>
        Configure the architecture and hyperparameters for your neural network
      </p>

      <div className="tunning-sections">
        <div className="nn-card">
          <h3>Network Architecture</h3>
          <table>
            <tbody>
              <tr>
                <td>Hidden Layers:</td>
                <td>
                  <input
                    type="number"
                    name="hidden_layers"
                    value={nnParams.hidden_layers}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                  />
                </td>
              </tr>
              <tr>
                <td>Neurons per Layer:</td>
                <td>
                  <input
                    type="number"
                    name="neurons_per_layer"
                    value={nnParams.neurons_per_layer}
                    onChange={handleInputChange}
                    min="1"
                  />
                </td>
              </tr>
              <tr>
                <td>Activation Function:</td>
                <td>
                  <select
                    name="activation"
                    value={nnParams.activation}
                    onChange={handleInputChange}
                  >
                    <option value="relu">ReLU</option>
                    <option value="sigmoid">Sigmoid</option>
                    <option value="tanh">Tanh</option>
                    <option value="softmax">Softmax</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>Dropout Rate:</td>
                <td>
                  <input
                    type="number"
                    name="dropout_rate"
                    value={nnParams.dropout_rate}
                    onChange={handleInputChange}
                    min="0"
                    max="0.9"
                    step="0.1"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="nn-card">
          <h3>Training Parameters</h3>
          <table>
            <tbody>
              <tr>
                <td>Learning Rate:</td>
                <td>
                  <input
                    type="number"
                    name="learning_rate"
                    value={nnParams.learning_rate}
                    onChange={handleInputChange}
                    min="0.0001"
                    max="1"
                    step="0.001"
                  />
                </td>
              </tr>
              <tr>
                <td>Batch Size:</td>
                <td>
                  <input
                    type="number"
                    name="batch_size"
                    value={nnParams.batch_size}
                    onChange={handleInputChange}
                    min="1"
                  />
                </td>
              </tr>
              <tr>
                <td>Epochs:</td>
                <td>
                  <input
                    type="number"
                    name="epochs"
                    value={nnParams.epochs}
                    onChange={handleInputChange}
                    min="1"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="button-container">
        <button onClick={handleLoadParameters} disabled={paramsLoading}>
          {paramsLoading ? (
            <>
              <FaSpinner className="loadingIcon" /> Saving Parameters...
            </>
          ) : (
            "Save Parameters"
          )}
        </button>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
}

export default NNTunning;
