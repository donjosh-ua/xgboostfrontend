import React, { useState, useCallback, useEffect } from "react";
import {
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import Toast from "../toast/Toast";
import "./NNStyles.css";

// Constants for default layer configurations
const DEFAULT_INPUT_LAYER = {
  neurons: "3",
  input_neurons: "3",
  activation: "ReLU",
};

const DEFAULT_OUTPUT_LAYER = {
  neurons: "1",
  input_neurons: "3",
  activation: "Softmax",
};

const DEFAULT_HIDDEN_LAYER = {
  neurons: "10",
  input_neurons: "3",
  activation: "ReLU",
};

// Layer card component for visualization
function LayerCard({ type, layer, index = null, onEdit, onRemove }) {
  const maxNeurons = 10;
  const displayNeurons =
    parseInt(layer.neurons) > maxNeurons ? maxNeurons : parseInt(layer.neurons);

  return (
    <div className={`${type}-layer layer-box`}>
      <div className="layer-title">
        {type === "hidden"
          ? `Hidden Layer ${index + 1}`
          : `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`}
      </div>
      <div className="layer-info">
        <span>Input: {layer.input_neurons} neurons</span>
        <span>Output: {layer.neurons} neurons</span>
        <span>{layer.activation}</span>
      </div>
      <div className="neurons-visual">
        {Array(displayNeurons)
          .fill()
          .map((_, i) => (
            <div
              key={`${type}-${index !== null ? index : ""}-${i}`}
              className="neuron"
            ></div>
          ))}
        {parseInt(layer.neurons) > maxNeurons && (
          <span className="neuron-dots">
            +{parseInt(layer.neurons) - maxNeurons}
          </span>
        )}
      </div>
      <div className="layer-actions">
        <button
          className="layer-button edit-layer"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title={`Edit ${type.charAt(0).toUpperCase() + type.slice(1)} Layer`}
        >
          <FaEdit />
        </button>
        <button
          className="layer-button remove-layer"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title={`Remove ${type.charAt(0).toUpperCase() + type.slice(1)} Layer`}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

// Layer configuration form component
function LayerConfigForm({
  currentLayer,
  onChange,
  editState,
  onSave,
  onCancel,
  showLayers,
}) {
  return (
    <div className="layer-configuration">
      <div className="layer-title-section">
        <h4>Layer Configuration</h4>
        <div className="add-layer-button">
          {editState.editing ? (
            <>
              <button type="button" onClick={onSave} className="save-button">
                Save Changes
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="cancel-button"
              >
                Cancel
              </button>
            </>
          ) : (
            <button type="button" onClick={onSave}>
              <FaPlus />{" "}
              {!showLayers.input
                ? "Input Layer"
                : !showLayers.output
                ? "Output Layer"
                : "Hidden Layer"}
            </button>
          )}
        </div>
      </div>

      <div className="layer-config-form">
        <div className="layer-header">
          <h5>
            {editState.editingIndex >= 0
              ? `Edit Layer ${editState.editingIndex + 1}`
              : editState.editInput
              ? "Edit Input Layer"
              : editState.editOutput
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
            onChange={onChange}
            min="1"
          />
        </div>
        <div className="input-group">
          <label>Output Neurons:</label>
          <input
            type="number"
            name="neurons"
            value={currentLayer.neurons}
            onChange={onChange}
            min="1"
          />
        </div>
        <div className="input-group">
          <label>Activation:</label>
          <select
            name="activation"
            value={currentLayer.activation}
            onChange={onChange}
          >
            <option value="Tanh">Tanh</option>
            <option value="Softmax">Softmax</option>
            <option value="SoftmaxBay">SoftmaxBay</option>
            <option value="Sigmoid">Sigmoid</option>
            <option value="ReLU">ReLU</option>
            <option value="LeakyReLU">LeakyReLU</option>
            <option value="LogSoftMax">LogSoftMax</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Hyperparameters table component
function HyperparametersTable({ nnParams, onInputChange }) {
  return (
    <div className="nn-card">
      <h3>Hyperparameters</h3>
      <div className="table-container">
        <table>
          <tbody>
            <tr>
              <td>Alpha:</td>
              <td>
                <input
                  type="number"
                  name="alpha"
                  value={nnParams.alpha || "0.001"}
                  onChange={onInputChange}
                  min="0"
                  step="0.001"
                />
              </td>
            </tr>
            <tr>
              <td>Loss Function:</td>
              <td>
                <select
                  name="criteria"
                  value={nnParams.criteria || "cross_entropy"}
                  onChange={onInputChange}
                >
                  <option value="cross_entropy">Cross Entropy</option>
                  <option value="sse">SSE</option>
                  <option value="logneg">NLLLoss</option>
                  <option value="entropybin">BCELoss</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Weight Decay:</td>
              <td>
                <input
                  type="number"
                  name="decay"
                  value={nnParams.decay || "0.0"}
                  onChange={onInputChange}
                  min="0"
                  step="0.001"
                />
              </td>
            </tr>
            <tr>
              <td>Momentum:</td>
              <td>
                <input
                  type="number"
                  name="momentum"
                  value={nnParams.momentum || "0.9"}
                  onChange={onInputChange}
                  min="0"
                  max="1"
                  step="0.1"
                />
              </td>
            </tr>
            <tr>
              <td>Test Split Size:</td>
              <td>
                <input
                  type="number"
                  name="test_size"
                  value={nnParams.test_size || "0.2"}
                  onChange={onInputChange}
                  min="0.1"
                  max="0.5"
                  step="0.1"
                />
              </td>
            </tr>
            <tr>
              <td>One-Hot Prediction:</td>
              <td>
                <select
                  name="pred_hot"
                  value={nnParams.pred_hot ? "true" : "false"}
                  onChange={(e) =>
                    onInputChange({
                      target: {
                        name: "pred_hot",
                        value: e.target.value === "true",
                      },
                    })
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Process Images:</td>
              <td>
                <select
                  name="image"
                  value={nnParams.image ? "true" : "false"}
                  onChange={(e) =>
                    onInputChange({
                      target: {
                        name: "image",
                        value: e.target.value === "true",
                      },
                    })
                  }
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Feature Architect Extension:</td>
              <td>
                <input
                  type="text"
                  name="FA_ext"
                  value={nnParams.FA_ext || ""}
                  onChange={onInputChange}
                  placeholder="Optional extension"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NNTunning({ nnParams, setNNParams }) {
  // UI state
  const [toastMessage, setToastMessage] = useState("");
  const [paramsLoading, setParamsLoading] = useState(false);
  const [architectureOpen, setArchitectureOpen] = useState(true);

  // Layer state
  const [inputLayer, setInputLayer] = useState(DEFAULT_INPUT_LAYER);
  const [outputLayer, setOutputLayer] = useState(DEFAULT_OUTPUT_LAYER);
  const [showInputLayer, setShowInputLayer] = useState(true);
  const [showOutputLayer, setShowOutputLayer] = useState(true);
  const [layers, setLayers] = useState([]);
  const [currentLayer, setCurrentLayer] = useState(DEFAULT_HIDDEN_LAYER);

  // Edit state
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editInput, setEditInput] = useState(false);
  const [editOutput, setEditOutput] = useState(false);

  // Define updateNNParams first since it's used by other functions
  const updateNNParams = useCallback(
    (updatedLayers) => {
      setNNParams((prev) => {
        // Create a complete representation of the network architecture
        return {
          ...prev,
          // Basic layer info
          hidden_layers: updatedLayers.length.toString(),
          neurons_per_layer:
            updatedLayers.length > 0 ? updatedLayers[0].neurons : "10",
          activation:
            updatedLayers.length > 0 ? updatedLayers[0].activation : "ReLU",
          // Store full layer configuration
          architecture: {
            inputLayer: showInputLayer ? { ...inputLayer } : null,
            hiddenLayers: updatedLayers.map((layer) => ({ ...layer })),
            outputLayer: showOutputLayer ? { ...outputLayer } : null,
          },
          // Keep original layers array for backward compatibility
          layers: updatedLayers,
        };
      });
    },
    [setNNParams, inputLayer, outputLayer, showInputLayer, showOutputLayer]
  );

  // Load saved configuration on mount (if available)
  useEffect(() => {
    const saved = sessionStorage.getItem("savedNNParams");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.architecture) {
          if (parsed.architecture.inputLayer) {
            setInputLayer(parsed.architecture.inputLayer);
            setShowInputLayer(true);
          }
          if (parsed.architecture.outputLayer) {
            setOutputLayer(parsed.architecture.outputLayer);
            setShowOutputLayer(true);
          }
          if (parsed.architecture.hiddenLayers) {
            setLayers(parsed.architecture.hiddenLayers);
          }
        }
      } catch (error) {
        console.error("Error parsing saved configuration:", error);
      }
    }
  }, []);

  // Load unsaved form inputs on mount, if available
  useEffect(() => {
    const savedForm = sessionStorage.getItem("nnTunningForm");
    if (savedForm) {
      try {
        const { currentLayer: savedCurrentLayer, nnParams: savedNNParams } =
          JSON.parse(savedForm);
        if (savedCurrentLayer) {
          setCurrentLayer(savedCurrentLayer);
        }
        if (savedNNParams) {
          setNNParams(savedNNParams);
        }
      } catch (error) {
        console.error("Error parsing saved form inputs:", error);
      }
    }
  }, []);

  // Persist currentLayer and nnParams changes on every update
  useEffect(() => {
    sessionStorage.setItem(
      "nnTunningForm",
      JSON.stringify({ currentLayer, nnParams })
    );
  }, [currentLayer, nnParams]);

  // Initialize parent component state with full architecture on mount
  useEffect(() => {
    // Initialize the parent state with the complete architecture information
    setNNParams((prev) => ({
      ...prev,
      architecture: {
        inputLayer: showInputLayer ? { ...inputLayer } : null,
        hiddenLayers: layers.map((layer) => ({ ...layer })),
        outputLayer: showOutputLayer ? { ...outputLayer } : null,
      },
      hidden_layers: layers.length.toString(),
      neurons_per_layer:
        layers.length > 0 ? layers[0].neurons : inputLayer.neurons,
      activation:
        layers.length > 0 ? layers[0].activation : inputLayer.activation,
    }));
  }, [
    setNNParams,
    showInputLayer,
    showOutputLayer,
    inputLayer,
    outputLayer,
    layers,
  ]);

  // Helper function to reset editing state
  const resetEditingState = useCallback((inputNeurons = "3") => {
    setEditingIndex(-1);
    setEditInput(false);
    setEditOutput(false);
    setCurrentLayer({
      neurons: "10",
      input_neurons: inputNeurons,
      activation: "ReLU",
    });
  }, []);

  // Create a unified function for layer removal operations
  const ensureNetworkConsistency = useCallback(
    (updatedLayers) => {
      // If there are no hidden layers, connect input directly to output
      if (updatedLayers.length === 0) {
        if (showInputLayer && showOutputLayer) {
          setOutputLayer((prev) => ({
            ...prev,
            input_neurons: inputLayer.neurons,
          }));
        }
        return;
      }

      // Connect first hidden layer to input layer
      if (showInputLayer && updatedLayers.length > 0) {
        updatedLayers[0].input_neurons = inputLayer.neurons;
      }

      // Connect layers to each other
      for (let i = 1; i < updatedLayers.length; i++) {
        updatedLayers[i].input_neurons = updatedLayers[i - 1].neurons;
      }

      // Connect last hidden layer to output layer
      if (showOutputLayer && updatedLayers.length > 0) {
        setOutputLayer((prev) => ({
          ...prev,
          input_neurons: updatedLayers[updatedLayers.length - 1].neurons,
        }));
      }

      return updatedLayers;
    },
    [showInputLayer, showOutputLayer, inputLayer.neurons]
  );

  // Helper function to properly update a layer and maintain network connections
  const updateLayerAndConnections = useCallback(
    (index, updatedLayerData) => {
      const updatedLayers = [...layers];

      // Update the layer with new data
      if (index >= 0 && index < updatedLayers.length) {
        const oldLayer = updatedLayers[index];
        updatedLayers[index] = { ...oldLayer, ...updatedLayerData };

        // If output neurons changed, update the next layer's input
        if (
          updatedLayerData.neurons &&
          updatedLayerData.neurons !== oldLayer.neurons
        ) {
          // Update next hidden layer if exists
          if (index < updatedLayers.length - 1) {
            updatedLayers[index + 1].input_neurons = updatedLayerData.neurons;
          }
          // Otherwise update output layer if it exists
          else if (showOutputLayer) {
            setOutputLayer((prev) => ({
              ...prev,
              input_neurons: updatedLayerData.neurons,
            }));
          }
        }

        // If input neurons changed, update the previous layer's output
        if (
          updatedLayerData.input_neurons &&
          updatedLayerData.input_neurons !== oldLayer.input_neurons
        ) {
          // Update previous hidden layer if exists
          if (index > 0) {
            updatedLayers[index - 1].neurons = updatedLayerData.input_neurons;
          }
          // Otherwise update input layer if it exists
          else if (showInputLayer) {
            setInputLayer((prev) => ({
              ...prev,
              neurons: updatedLayerData.input_neurons,
            }));
          }
        }
      }

      setLayers(updatedLayers);
      updateNNParams(updatedLayers);
      return updatedLayers;
    },
    [layers, showInputLayer, showOutputLayer, updateNNParams]
  );

  // Input handlers with useCallback
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setNNParams((prevParams) => ({
        ...prevParams,
        [name]: value,
      }));
    },
    [setNNParams]
  );

  const handleLayerInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setCurrentLayer((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const addLayer = useCallback(() => {
    if (!showInputLayer) {
      // First layer should be input
      setShowInputLayer(true);
      // Use the current layer values instead of hardcoded values
      setInputLayer({
        neurons: currentLayer.neurons,
        input_neurons: currentLayer.input_neurons,
        activation: currentLayer.activation,
      });

      // Update the currentLayer for the next layer to use input layer's output
      resetEditingState(currentLayer.neurons);

      // Sync state after adding input layer
      updateNNParams([]);
    } else if (!showOutputLayer) {
      // Second layer should be output
      setShowOutputLayer(true);
      const inputNeurons =
        layers.length > 0
          ? layers[layers.length - 1].neurons
          : inputLayer.neurons;

      // Use the current layer values instead of hardcoded values, but keep the inputNeurons
      setOutputLayer({
        neurons: currentLayer.neurons,
        activation: currentLayer.activation,
        input_neurons: inputNeurons,
      });

      // Reset currentLayer for future layers
      resetEditingState(currentLayer.neurons);

      // Sync state after adding output layer
      updateNNParams([]);
    } else {
      // Adding a hidden layer
      const inputNeurons =
        layers.length > 0
          ? layers[layers.length - 1].neurons
          : inputLayer.neurons;

      const newLayer = {
        ...currentLayer,
        input_neurons: inputNeurons,
      };

      // Insert the new layer before the output layer
      const updatedLayers = [...layers, newLayer];

      // Ensure network connections are consistent
      ensureNetworkConsistency(updatedLayers);

      setLayers(updatedLayers);

      // Reset currentLayer for next addition
      resetEditingState(newLayer.neurons);

      updateNNParams(updatedLayers);
    }
  }, [
    showInputLayer,
    showOutputLayer,
    currentLayer,
    layers,
    inputLayer,
    resetEditingState,
    updateNNParams,
    ensureNetworkConsistency,
    setLayers,
    setInputLayer,
    setOutputLayer,
    setShowInputLayer,
    setShowOutputLayer,
  ]);

  // Update the editLayer function to use the new helper
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

  const cancelEdit = () => {
    resetEditingState();
  };

  const saveLayerEdit = () => {
    // Validate the currentLayer values before saving
    const validatedCurrentLayer = {
      ...currentLayer,
      neurons:
        currentLayer.neurons === "" || parseInt(currentLayer.neurons) < 1
          ? "1"
          : currentLayer.neurons,
      input_neurons:
        currentLayer.input_neurons === "" ||
        parseInt(currentLayer.input_neurons) < 1
          ? "1"
          : currentLayer.input_neurons,
    };

    if (editingIndex >= 0) {
      // Editing a hidden layer
      updateLayerAndConnections(editingIndex, validatedCurrentLayer);
      resetEditingState(validatedCurrentLayer.neurons);
    } else if (editInput) {
      // Editing input layer
      const oldNeurons = inputLayer.neurons;
      setInputLayer({ ...validatedCurrentLayer });

      // If output neurons changed, update the next layer's input neurons
      if (oldNeurons !== validatedCurrentLayer.neurons) {
        // If there are hidden layers, update the first one's input neurons
        if (layers.length > 0) {
          const updatedLayers = [...layers];
          updatedLayers[0].input_neurons = validatedCurrentLayer.neurons;
          setLayers(updatedLayers);
          updateNNParams(updatedLayers);
        } else if (showOutputLayer) {
          // If no hidden layers but output exists, update output's input neurons
          setOutputLayer((prev) => ({
            ...prev,
            input_neurons: validatedCurrentLayer.neurons,
          }));
        }
      }

      resetEditingState(validatedCurrentLayer.neurons);
      updateNNParams(layers);
    } else if (editOutput) {
      // Editing output layer
      const oldInputNeurons = outputLayer.input_neurons;
      setOutputLayer({ ...validatedCurrentLayer });

      // If input neurons changed, update the previous layer's output neurons
      if (oldInputNeurons !== validatedCurrentLayer.input_neurons) {
        if (layers.length > 0) {
          // Update the last hidden layer's output neurons
          const updatedLayers = [...layers];
          updatedLayers[layers.length - 1].neurons =
            validatedCurrentLayer.input_neurons;
          setLayers(updatedLayers);
          updateNNParams(updatedLayers);
        } else if (showInputLayer) {
          // If no hidden layers, update input layer's output neurons
          setInputLayer((prev) => ({
            ...prev,
            neurons: validatedCurrentLayer.input_neurons,
          }));
        }
      }

      resetEditingState(validatedCurrentLayer.neurons);
      updateNNParams(layers);
    }
  };

  const removeLayer = (index) => {
    if (layers.length > 0) {
      // Remove the layer
      const updatedLayers = layers.filter((_, i) => i !== index);

      // Ensure network connections are consistent
      ensureNetworkConsistency(updatedLayers);

      setLayers(updatedLayers);

      // Reset editing state if needed
      if (updatedLayers.length === 0 || editingIndex === index) {
        resetEditingState();
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
      resetEditingState();
      updateNNParams([]);
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
      resetEditingState();
      updateNNParams([]);
    } else {
      // Can't remove output if hidden layers exist
      setToastMessage(
        "Remove all hidden layers before removing the output layer"
      );
    }
  };

  const toggleArchitecture = useCallback(() => {
    setArchitectureOpen((prev) => !prev);
  }, []);

  const handleLoadParameters = () => {
    setParamsLoading(true);

    // Format the layers in the required format: activation(input_neurons, output_neurons)
    const formatLayer = (layer) => {
      // Capitalize first letter of activation function
      const activation =
        layer.activation.charAt(0).toUpperCase() + layer.activation.slice(1);
      return `${activation}(${layer.input_neurons}, ${layer.neurons})`;
    };

    // Create the array of formatted layers
    const formattedLayers = [];

    // Add input layer if it exists
    if (showInputLayer) {
      formattedLayers.push(formatLayer(inputLayer));
    }

    // Add hidden layers
    layers.forEach((layer) => {
      formattedLayers.push(formatLayer(layer));
    });

    // Add output layer if it exists
    if (showOutputLayer) {
      formattedLayers.push(formatLayer(outputLayer));
    }

    // Convert all parameter values to appropriate types
    const parsedParams = {
      ...nnParams,
      alpha: Number(nnParams.alpha || 0.001),
      decay: Number(nnParams.decay || 0.0),
      momentum: Number(nnParams.momentum || 0.9),
      test_size: Number(nnParams.test_size || 0.2),
      pred_hot: Boolean(
        nnParams.pred_hot === undefined ? true : nnParams.pred_hot
      ),
      verbose: Boolean(
        nnParams.verbose === undefined ? true : nnParams.verbose
      ),
      criteria: nnParams.criteria || "cross_entropy",
      image: Boolean(nnParams.image),
      FA_ext: nnParams.FA_ext,
      image_size: nnParams.image_size,
      // Replace the objects with the formatted strings
      layers: formattedLayers,
    };

    // Update the state with the parsed parameters
    setNNParams(parsedParams);

    // Store parameters in session storage as backup
    sessionStorage.setItem("savedNNParams", JSON.stringify(parsedParams));

    console.log("Parameters saved to state:", parsedParams);
    setToastMessage("Neural Network configuration saved successfully!");

    // Turn off loading state
    setParamsLoading(false);
  };

  // Main component render
  return (
    <div className="nn-tunning-container">
      <h2>Tunning</h2>
      <p className="tunning-description">
        Configure the architecture and hyperparameters for your neural network
      </p>

      <div className="tunning-sections">
        <div className="nn-card nn-architecture-card">
          <div className="collapsible-header" onClick={toggleArchitecture}>
            <h3>Architecture</h3>
            {architectureOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>

          {architectureOpen && (
            <div className="architecture-content">
              <div className="architecture-layout">
                <div className="layer-visualization">
                  {/* Input Layer */}
                  {showInputLayer && (
                    <LayerCard
                      type="input"
                      layer={inputLayer}
                      onEdit={editInputLayer}
                      onRemove={removeInputLayer}
                    />
                  )}

                  {/* Hidden Layers */}
                  {layers.map((layer, index) => (
                    <LayerCard
                      key={`layer-${index}`}
                      type="hidden"
                      layer={layer}
                      index={index}
                      onEdit={() => editLayer(index)}
                      onRemove={() => removeLayer(index)}
                    />
                  ))}

                  {/* Output Layer */}
                  {showOutputLayer && (
                    <LayerCard
                      type="output"
                      layer={outputLayer}
                      onEdit={editOutputLayer}
                      onRemove={removeOutputLayer}
                    />
                  )}
                </div>

                {/* Layer Configuration Form */}
                <LayerConfigForm
                  currentLayer={currentLayer}
                  onChange={handleLayerInputChange}
                  editState={{
                    editing: editingIndex >= 0 || editInput || editOutput,
                    editingIndex,
                    editInput,
                    editOutput,
                  }}
                  onSave={
                    editingIndex >= 0 || editInput || editOutput
                      ? saveLayerEdit
                      : addLayer
                  }
                  onCancel={cancelEdit}
                  showLayers={{
                    input: showInputLayer,
                    output: showOutputLayer,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Hyperparameters Table */}
        <HyperparametersTable
          nnParams={nnParams}
          onInputChange={handleInputChange}
        />
      </div>

      <div className="button-container">
        <button onClick={handleLoadParameters} disabled={paramsLoading}>
          {paramsLoading ? (
            <>
              <FaSpinner className="loadingIcon" /> Saving...
            </>
          ) : (
            "Save Configuration"
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
