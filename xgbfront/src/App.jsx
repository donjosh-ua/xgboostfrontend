import { useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import FileSelection from "./components/fileSelection/FileSelection";
import Tunning from "./components/tunning/Tunning";
import Training from "./components/training/Training";
import Results from "./components/results/Results";
import "./App.css";

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState([]);
  const [hasHeader, setHasHeader] = useState(false);
  const [theme, setTheme] = useState("light");
  const [mode, setMode] = useState("manual");
  const [params, setParams] = useState({
    learningRate: "",
    nEstimators: "",
    maxDepth: "",
    // Add more parameters as needed
  });
  const [gridParams, setGridParams] = useState({
    seed: "",
    eta: "",
    max_depth: "",
    gamma: "",
    learning_rate: "",
    min_child_weight: "",
    subsample: "",
    colsample_bytree: "",
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

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <>
      <header>
        <img src="/xgb_logo.png" alt="XGBoost Logo" />
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
        <button className="theme-toggle-button" onClick={toggleTheme}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
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
        {activeStep === 3 && <Results selectedFile={selectedFile} />}
      </main>
    </>
  );
}

export default App;
