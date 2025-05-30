import { useState, useEffect } from "react";
import FileSelection from "./components/fileSelection/FileSelection";
import Tunning from "./components/tunning/Tunning";
import Training from "./components/training/Training";
import Results from "./components/results/Results";
import NNTunning from "./components/neuralNetwork/NNTunning";
import NNTraining from "./components/neuralNetwork/NNTraining";
import NNResults from "./components/neuralNetwork/NNResults";
import ModelToggle from "./components/ModelToggle";
import LogoBar from "./components/logobar/LogoBar";
import "./App.css";

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [wasTrainedWithCV, setWasTrainedWithCV] = useState(false);
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
    epochs: "20",
    alpha: "0.001",
    criteria: "cross_entropy",
    optimizer: "SGD",
    image_size: null,
    verbose: true,
    decay: "0.0",
    momentum: "0.9",
    image: false,
    FA_ext: null,
    pred_hot: true,
    test_size: "0.2",
    cv: true,
    layers: [{ neurons: "10", input_neurons: "3", activation: "relu" }],
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
    numFolds: 5,
    useCrossValidation: false,
    epochs: 50,
    batchSize: 64,
    modelName: "ModiR",
    optimizer: "adam",
    // Bayesian optimization parameters
    useBayesian: false,
    distribution: "normal",
    distributionParams: {
      mean: "0",
      sigma: "1",
      alpha: "0",
      beta: "1",
      lambda: "1",
    },
  });

  // Track model changes
  useEffect(() => {
    console.log("Active model changed to:", activeModel);
  }, [activeModel]);

  // Load saved neural network parameters from session storage if available
  useEffect(() => {
    const savedNNParams = sessionStorage.getItem("savedNNParams");
    if (savedNNParams) {
      try {
        const parsedParams = JSON.parse(savedNNParams);
        setNNParams(parsedParams);
        console.log("Loaded saved NN parameters from session storage");
      } catch (error) {
        console.error("Error parsing saved NN parameters:", error);
      }
    }
  }, []);

  const toggleModel = () => {
    console.log("Toggling model from", activeModel);
    const newModel = activeModel === "xgboost" ? "neuralnetwork" : "xgboost";
    setActiveModel(newModel);
    console.log("New model should be:", newModel);
  };

  return (
    <div className="app-container">
      {/* Main Content */}
      <div className="main-content">
        <header>
          <ModelToggle activeModel={activeModel} toggleModel={toggleModel} />

          <nav>
            <ul>
              <button
                type="button"
                className={activeStep === 0 ? "active-step" : ""}
                onClick={() => setActiveStep(0)}
              >
                Dataset
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

        <LogoBar />

        <main>
          {activeStep === 0 && (
            <FileSelection
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              filePreview={filePreview}
              setFilePreview={setFilePreview}
              hasHeader={hasHeader}
              setHasHeader={setHasHeader}
              activeModel={activeModel}
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
                  activeModel={activeModel}
                  setWasTrainedWithCV={setWasTrainedWithCV}
                />
              )}
              {activeStep === 3 && (
                <NNResults
                  selectedFile={selectedFile}
                  modelType="neuralnetwork"
                  wasTrainedWithCV={wasTrainedWithCV}
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
