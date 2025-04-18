import React, { useState } from "react";
import {
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaTrash,
  FaEdit,
  FaExchangeAlt,
} from "react-icons/fa";
import Toast from "../toast/Toast";
import "./NNStyles.css";

function NNTunning({ selectedFile, nnParams, setNNParams }) {
  const [toastMessage, setToastMessage] = useState("");
  const [paramsLoading, setParamsLoading] = useState(false);
  const [architectureOpen, setArchitectureOpen] = useState(true);
  const [editInput, setEditInput] = useState(false);
  const [editOutput, setEditOutput] = useState(false);
  const [inputLayer, setInputLayer] = useState({
    neurons: "3",
    input_neurons: "3",
    activation: "none",
  });
  const [outputLayer, setOutputLayer] = useState({
    neurons: "1",
    activation: "sigmoid",
    input_neurons: "3",
  });
  const [showInputLayer, setShowInputLayer] = useState(true);
  const [showOutputLayer, setShowOutputLayer] = useState(true);
  const [layers, setLayers] = useState([]);
  const [currentLayer, setCurrentLayer] = useState({
    neurons: "10",
    input_neurons: "3",
    activation: "relu",
  });
  const [editingIndex, setEditingIndex] = useState(-1);
  const url = import.meta.env.VITE_BASE_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNNParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };

  const handleLayerInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentLayer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputLayerChange = (e) => {
    const { name, value } = e.target;
    setInputLayer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOutputLayerChange = (e) => {
    const { name, value } = e.target;
    setOutputLayer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addLayer = () => {
    if (!showInputLayer) {
      // First layer should be input
      setShowInputLayer(true);
      setInputLayer({
        neurons: "3",
        input_neurons: "3",
        activation: "none",
      });
    } else if (!showOutputLayer) {
      // Second layer should be output
      setShowOutputLayer(true);
      const inputNeurons =
        layers.length > 0
          ? layers[layers.length - 1].neurons
          : inputLayer.neurons;
      setOutputLayer({
        neurons: "1",
        activation: "sigmoid",
        input_neurons: inputNeurons,
      });
    } else {
      const inputNeurons =
        layers.length > 0
          ? layers[layers.length - 1].neurons
          : inputLayer.neurons;

      const newLayer = {
        ...currentLayer,
        input_neurons: inputNeurons,
      };

      const updatedLayers = [...layers, newLayer];
      setLayers(updatedLayers);

      setOutputLayer((prev) => ({
        ...prev,
        input_neurons: newLayer.neurons,
      }));

      setCurrentLayer({
        neurons: "10",
        input_neurons: newLayer.neurons,
        activation: "relu",
      });

      updateNNParams(updatedLayers);
    }
  };

  const editLayer = (index) => {
    setEditInput(false);
    setEditOutput(false);
    setCurrentLayer({ ...layers[index] });
    setEditingIndex(index);
  };

  const editInputLayer = () => {
    setEditingIndex(-1);
    setEditOutput(false);
    setEditInput(true);
    setCurrentLayer({ ...inputLayer });
  };

  const editOutputLayer = () => {
    setEditingIndex(-1);
    setEditInput(false);
    setEditOutput(true);
    setCurrentLayer({ ...outputLayer });
  };

  const saveLayerEdit = () => {
    if (editingIndex >= 0) {
      const updatedLayers = [...layers];
      updatedLayers[editingIndex] = { ...currentLayer };
      setLayers(updatedLayers);

      if (editingIndex < layers.length - 1) {
        updatedLayers[editingIndex + 1].input_neurons = currentLayer.neurons;
      } else if (showOutputLayer) {
        setOutputLayer((prev) => ({
          ...prev,
          input_neurons: currentLayer.neurons,
        }));
      }

      setEditingIndex(-1);
      setCurrentLayer({
        neurons: "10",
        input_neurons: "3",
        activation: "relu",
      });

      updateNNParams(updatedLayers);
    } else if (editInput) {
      // Update input layer configuration with all properties
      setInputLayer({ ...currentLayer });
      setEditInput(false);

      // If there are hidden layers, update the first one's input neurons
      if (layers.length > 0) {
        const updatedLayers = [...layers];
        updatedLayers[0].input_neurons = currentLayer.neurons;
        setLayers(updatedLayers);
        updateNNParams(updatedLayers);
      } else if (showOutputLayer) {
        // If no hidden layers but output exists, update output's input neurons
        setOutputLayer((prev) => ({
          ...prev,
          input_neurons: currentLayer.neurons,
        }));
      }

      setCurrentLayer({
        neurons: "10",
        input_neurons: currentLayer.neurons,
        activation: "relu",
      });
    } else if (editOutput) {
      setOutputLayer({ ...currentLayer });
      setEditOutput(false);
      setCurrentLayer({
        neurons: "10",
        input_neurons: "3",
        activation: "relu",
      });
    }
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setEditInput(false);
    setEditOutput(false);
    setCurrentLayer({
      neurons: "10",
      input_neurons: "3",
      activation: "relu",
    });
  };

  const removeLayer = (index) => {
    if (layers.length > 0) {
      const updatedLayers = layers.filter((_, i) => i !== index);

      if (index < layers.length - 1 && updatedLayers.length > index) {
        const prevLayerNeurons =
          index > 0 ? updatedLayers[index - 1].neurons : inputLayer.neurons;

        updatedLayers[index].input_neurons = prevLayerNeurons;
      } else if (showOutputLayer) {
        const prevLayerNeurons =
          updatedLayers.length > 0
            ? updatedLayers[updatedLayers.length - 1].neurons
            : inputLayer.neurons;

        setOutputLayer((prev) => ({
          ...prev,
          input_neurons: prevLayerNeurons,
        }));
      }

      setLayers(updatedLayers);

      if (editingIndex === index) {
        setEditingIndex(-1);
        setCurrentLayer({
          neurons: "10",
          input_neurons: "3",
          activation: "relu",
        });
      } else if (editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }

      updateNNParams(updatedLayers);
    }
  };

  const removeInputLayer = () => {
    if (!showOutputLayer && layers.length === 0) {
      // If only input layer exists, remove it
      setShowInputLayer(false);
    } else {
      // Can't remove input if other layers exist
      setToastMessage(
        "Remove all other layers before removing the input layer"
      );
    }
  };

  const removeOutputLayer = () => {
    if (layers.length === 0) {
      // If no hidden layers, just remove output
      setShowOutputLayer(false);
    } else {
      // Can't remove output if hidden layers exist
      setToastMessage(
        "Remove all hidden layers before removing the output layer"
      );
    }
  };

  const updateNNParams = (updatedLayers) => {
    setNNParams((prev) => {
      // Always update with current layer count
      return {
        ...prev,
        hidden_layers: updatedLayers.length.toString(),
        neurons_per_layer:
          updatedLayers.length > 0 ? updatedLayers[0].neurons : "10",
        activation:
          updatedLayers.length > 0 ? updatedLayers[0].activation : "relu",
        layers: updatedLayers,
      };
    });
  };

  const toggleArchitecture = () => {
    setArchitectureOpen(!architectureOpen);
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
      layers: layers.map((layer) => ({
        neurons: Number(layer.neurons),
        input_neurons: Number(layer.input_neurons),
        activation: layer.activation,
      })),
      input_layer: {
        neurons: Number(inputLayer.neurons),
        input_neurons: Number(inputLayer.input_neurons),
        activation: inputLayer.activation,
      },
      output_layer: {
        neurons: Number(outputLayer.neurons),
        input_neurons: Number(outputLayer.input_neurons),
        activation: outputLayer.activation,
      },
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

  // Add a function to swap a hidden layer with the output layer
  const convertToOutput = (index) => {
    // Store the hidden layer that will become output
    const newOutputConfig = { ...layers[index] };
    let updatedLayers = [];

    if (showOutputLayer) {
      // If there's already an output layer, store it
      const currentOutputConfig = { ...outputLayer };

      // Remove the hidden layer that's becoming output
      updatedLayers = layers.filter((_, i) => i !== index);

      // Add the old output layer as a hidden layer
      // Set its input_neurons to match the previous layer
      const prevLayerNeurons =
        index > 0 ? layers[index - 1].neurons : inputLayer.neurons;

      const oldOutputAsHidden = {
        ...currentOutputConfig,
        input_neurons: prevLayerNeurons,
      };

      updatedLayers.push(oldOutputAsHidden);

      // Update state
      setLayers(updatedLayers);
    } else {
      // If there's no output layer yet, just remove the hidden layer
      updatedLayers = layers.filter((_, i) => i !== index);
      setLayers(updatedLayers);

      // Show the output layer
      setShowOutputLayer(true);
    }

    // Set the selected layer as output
    setOutputLayer(newOutputConfig);

    // Reset any editing state
    setEditingIndex(-1);
    setEditInput(false);
    setEditOutput(false);

    updateNNParams(updatedLayers);
  };

  return (
    <div className="nn-tunning-container">
      <h2>Parameters</h2>
      <p>
        Configure the architecture and hyperparameters for your neural network
      </p>

      <div className="tunning-sections">
        <div className="nn-card nn-architecture-card">
          <div className="collapsible-header" onClick={toggleArchitecture}>
            <h3>Network Architecture</h3>
            {architectureOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>

          {architectureOpen && (
            <div className="architecture-content">
              <div className="architecture-layout">
                <div className="layer-visualization">
                  {showInputLayer && (
                    <div className="input-layer layer-box">
                      <div className="layer-title">Input Layer</div>
                      <div className="layer-info">
                        <span>Input: {inputLayer.input_neurons} neurons</span>
                        <span>Output: {inputLayer.neurons} neurons</span>
                        <span>{inputLayer.activation}</span>
                      </div>
                      <div className="neurons-visual">
                        {Array(
                          parseInt(inputLayer.neurons) > 10
                            ? 10
                            : parseInt(inputLayer.neurons)
                        )
                          .fill()
                          .map((_, i) => (
                            <div key={`input-${i}`} className="neuron"></div>
                          ))}
                        {parseInt(inputLayer.neurons) > 10 && (
                          <span className="neuron-dots">
                            +{parseInt(inputLayer.neurons) - 10}
                          </span>
                        )}
                      </div>
                      <div className="layer-actions">
                        <button
                          className="layer-button edit-layer"
                          onClick={(e) => {
                            e.stopPropagation();
                            editInputLayer();
                          }}
                          title="Edit Input Layer"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="layer-button remove-layer"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeInputLayer();
                          }}
                          title="Remove Input Layer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}

                  {layers.map((layer, index) => (
                    <div
                      key={`layer-${index}`}
                      className="hidden-layer layer-box"
                    >
                      <div className="layer-title">
                        Hidden Layer {index + 1}
                      </div>
                      <div className="layer-info">
                        <span>Input: {layer.input_neurons} neurons</span>
                        <span>Output: {layer.neurons} neurons</span>
                        <span>{layer.activation}</span>
                      </div>
                      <div className="neurons-visual">
                        {Array(
                          parseInt(layer.neurons) > 10
                            ? 10
                            : parseInt(layer.neurons)
                        )
                          .fill()
                          .map((_, i) => (
                            <div
                              key={`hidden-${index}-${i}`}
                              className="neuron"
                            ></div>
                          ))}
                        {parseInt(layer.neurons) > 10 && (
                          <span className="neuron-dots">
                            +{parseInt(layer.neurons) - 10}
                          </span>
                        )}
                      </div>
                      <div className="layer-actions">
                        <button
                          className="layer-button edit-layer"
                          onClick={(e) => {
                            e.stopPropagation();
                            editLayer(index);
                          }}
                          title="Edit Layer"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="layer-button remove-layer"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLayer(index);
                          }}
                          title="Remove Layer"
                        >
                          <FaTrash />
                        </button>
                        <button
                          className="layer-button convert-layer"
                          onClick={(e) => {
                            e.stopPropagation();
                            convertToOutput(index);
                          }}
                          title="Set as Output Layer"
                        >
                          <FaExchangeAlt />
                        </button>
                      </div>
                    </div>
                  ))}

                  {showOutputLayer && (
                    <div className="output-layer layer-box">
                      <div className="layer-title">Output Layer</div>
                      <div className="layer-info">
                        <span>Input: {outputLayer.input_neurons} neurons</span>
                        <span>Output: {outputLayer.neurons} neurons</span>
                        <span>{outputLayer.activation}</span>
                      </div>
                      <div className="neurons-visual">
                        {Array(
                          parseInt(outputLayer.neurons) > 10
                            ? 10
                            : parseInt(outputLayer.neurons)
                        )
                          .fill()
                          .map((_, i) => (
                            <div key={`output-${i}`} className="neuron"></div>
                          ))}
                        {parseInt(outputLayer.neurons) > 10 && (
                          <span className="neuron-dots">
                            +{parseInt(outputLayer.neurons) - 10}
                          </span>
                        )}
                      </div>
                      <div className="layer-actions">
                        <button
                          className="layer-button edit-layer"
                          onClick={(e) => {
                            e.stopPropagation();
                            editOutputLayer();
                          }}
                          title="Edit Output Layer"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="layer-button remove-layer"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOutputLayer();
                          }}
                          title="Remove Output Layer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="layer-configuration">
                  <div className="layer-title-section">
                    <h4>Layer Configuration</h4>
                    <div className="add-layer-button">
                      {editingIndex >= 0 || editInput || editOutput ? (
                        <>
                          <button
                            type="button"
                            onClick={saveLayerEdit}
                            className="save-button"
                          >
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="cancel-button"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={addLayer}>
                          <FaPlus />{" "}
                          {!showInputLayer
                            ? "Add Input Layer"
                            : !showOutputLayer
                            ? "Add Output Layer"
                            : "Add Hidden Layer"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="layer-config-form">
                    <div className="layer-header">
                      <h5>
                        {editingIndex >= 0
                          ? `Edit Layer ${editingIndex + 1}`
                          : editInput
                          ? "Edit Input Layer"
                          : editOutput
                          ? "Edit Output Layer"
                          : "New Layer"}
                      </h5>
                    </div>

                    <div className="input-group">
                      <label>Input Neurons:</label>
                      <input
                        type="number"
                        name="input_neurons"
                        value={currentLayer.input_neurons}
                        onChange={handleLayerInputChange}
                        min="1"
                      />
                    </div>
                    <div className="input-group">
                      <label>Output Neurons:</label>
                      <input
                        type="number"
                        name="neurons"
                        value={currentLayer.neurons}
                        onChange={handleLayerInputChange}
                        min="1"
                      />
                    </div>
                    <div className="input-group">
                      <label>Activation:</label>
                      <select
                        name="activation"
                        value={currentLayer.activation}
                        onChange={handleLayerInputChange}
                      >
                        <option value="relu">ReLU</option>
                        <option value="sigmoid">Sigmoid</option>
                        <option value="tanh">Tanh</option>
                        <option value="softmax">Softmax</option>
                        {editInput && <option value="none">None</option>}
                      </select>
                    </div>
                  </div>

                  <p className="layers-counter">
                    Total layers:{" "}
                    {(showInputLayer ? 1 : 0) +
                      layers.length +
                      (showOutputLayer ? 1 : 0)}
                  </p>
                </div>
              </div>

              <div className="other-architecture-params">
                <h4>Additional Parameters</h4>
                <div className="input-group">
                  <label>Dropout Rate:</label>
                  <input
                    type="number"
                    name="dropout_rate"
                    value={nnParams.dropout_rate}
                    onChange={handleInputChange}
                    min="0"
                    max="0.9"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="nn-card">
          <h3>Training Parameters</h3>
          <div className="training-params-content">
            <div className="input-group">
              <label>Learning Rate:</label>
              <input
                type="number"
                name="learning_rate"
                value={nnParams.learning_rate}
                onChange={handleInputChange}
                min="0.0001"
                max="1"
                step="0.001"
              />
            </div>
            <div className="input-group">
              <label>Batch Size:</label>
              <input
                type="number"
                name="batch_size"
                value={nnParams.batch_size}
                onChange={handleInputChange}
                min="1"
              />
            </div>
            <div className="input-group">
              <label>Epochs:</label>
              <input
                type="number"
                name="epochs"
                value={nnParams.epochs}
                onChange={handleInputChange}
                min="1"
              />
            </div>
          </div>
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
