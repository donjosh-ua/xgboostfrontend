import { useState } from "react";
import { FaNetworkWired, FaTree } from "react-icons/fa";
import FileSelection from "./components/fileSelection/FileSelection";
import Tunning from "./components/tunning/Tunning";
import Training from "./components/training/Training";
import Results from "./components/results/Results";
import NNTunning from "./components/neuralNetwork/NNTunning";
import NNTraining from "./components/neuralNetwork/NNTraining";
import NNResults from "./components/neuralNetwork/NNResults";
import "./App.css";

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState([]);
  const [hasHeader, setHasHeader] = useState(false);
  const [mode, setMode] = useState("manual");
  const [activeModel, setActiveModel] = useState("xgboost");
  const [params, setParams] = useState({
    eta: "",
    max_depth: "",
    gamma: "",
    learning_rate: "",
    min_child_weight: "",
    subsample: "",
    colsample_bytree: "",
  });
  const [gridParams, setGridParams] = useState({
    eta: "",
    max_depth: "",
    gamma: "",
    learning_rate: "",
    min_child_weight: "",
    subsample: "",
    colsample_bytree: "",
  });
  const [nnParams, setNNParams] = useState({
    hidden_layers: "1",
    neurons_per_layer: "10",
    activation: "relu",
    learning_rate: "0.01",
    batch_size: "32",
    epochs: "10",
    dropout_rate: "0.2",
  });
  const [trainingValues, setTrainingValues] = useState({
    trainingMethod: "split",
    splitRatio: 70,
    numFolds: 5,
    rounds: 30,
    distribution: "Normal",
    distributionParams: {
      mean: "",
      sigma: "",
      alpha: "",
      beta: "",
      lambda: "",
    },
  });
  const [nnTrainingValues, setNNTrainingValues] = useState({
    trainingMethod: "split",
    splitRatio: 70,
    numFolds: 5,
    epochs: 10,
    batchSize: 32,
    optimizer: "adam",
    metrics: ["accuracy"],
  });

  const toggleModel = () => {
    setActiveModel(activeModel === "xgboost" ? "neuralnetwork" : "xgboost");
  };

  return (
    <div className="app-container">
      {/* Main Content */}
      <div className="main-content">
        <header>
          <button className="model-toggle-button" onClick={toggleModel}>
            {activeModel === "xgboost" ? (
              <>
                <FaTree className="model-icon" /> XGBoost
              </>
            ) : (
              <>
                <FaNetworkWired className="model-icon" /> Neural Network
              </>
            )}
          </button>

          <nav>
            <ul>
              <button
                type="button"
                className={activeStep === 0 ? "active-step" : ""}
                onClick={() => setActiveStep(0)}
              >
                File Selection
              </button>
              <button
                type="button"
                className={activeStep === 1 ? "active-step" : ""}
                onClick={() => setActiveStep(1)}
              >
                Tunning
              </button>
              <button
                type="button"
                className={activeStep === 2 ? "active-step" : ""}
                onClick={() => setActiveStep(2)}
              >
                Training
              </button>
              <button
                type="button"
                className={activeStep === 3 ? "active-step" : ""}
                onClick={() => setActiveStep(3)}
              >
                Testing
              </button>
            </ul>
          </nav>
        </header>

        <main>
          {activeStep === 0 && (
            <FileSelection
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              filePreview={filePreview}
              setFilePreview={setFilePreview}
              hasHeader={hasHeader}
              setHasHeader={setHasHeader}
            />
          )}

          {activeModel === "xgboost" ? (
            <>
              {activeStep === 1 && (
                <Tunning
                  selectedFile={selectedFile}
                  params={params}
                  setParams={setParams}
                  gridParams={gridParams}
                  setGridParams={setGridParams}
                  mode={mode}
                  setMode={setMode}
                />
              )}
              {activeStep === 2 && (
                <Training
                  selectedFile={selectedFile}
                  params={params}
                  gridParams={gridParams}
                  mode={mode}
                  trainingValues={trainingValues}
                  setTrainingValues={setTrainingValues}
                />
              )}
              {activeStep === 3 && (
                <Results selectedFile={selectedFile} modelType="xgboost" />
              )}
            </>
          ) : (
            <>
              {activeStep === 1 && (
                <NNTunning
                  selectedFile={selectedFile}
                  nnParams={nnParams}
                  setNNParams={setNNParams}
                />
              )}
              {activeStep === 2 && (
                <NNTraining
                  selectedFile={selectedFile}
                  nnParams={nnParams}
                  nnTrainingValues={nnTrainingValues}
                  setNNTrainingValues={setNNTrainingValues}
                />
              )}
              {activeStep === 3 && (
                <NNResults
                  selectedFile={selectedFile}
                  modelType="neuralnetwork"
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
