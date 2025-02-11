import React, { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import Toast from "../toast/Toast";
import "./TunningStyles.css";

function Tunning({
  params,
  setParams,
  gridParams,
  setGridParams,
  mode,
  setMode,
}) {
  const [toastMessage, setToastMessage] = useState("");
  const [gridSearchLoading, setGridSearchLoading] = useState(false);
  const url = import.meta.env.VITE_BASE_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };

  const handleGridInputChange = (e) => {
    const { name, value } = e.target;
    setGridParams((prevGridParams) => ({
      ...prevGridParams,
      [name]: value,
    }));
  };

  const handleGridSearch = () => {
    setGridSearchLoading(true);
    fetch(`${url}/parameters/grid_search`, {
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Grid search failed with status " + res.status);
        }
        return res.json();
      })
      .then((data) => {
        if (data.best_parameters) {
          setGridParams(data.best_parameters);
          setToastMessage("Grid search completed successfully!");
        } else {
          setToastMessage("No best parameters were returned.");
        }
      })
      .catch((err) => {
        console.error(err);
        setToastMessage("Error during grid search. Please try again.");
      })
      .finally(() => {
        setGridSearchLoading(false);
      });
  };

  const handleLoadParameters = () => {
    const selectedParams = mode === "manual" ? params : gridParams;
    fetch(`${url}/parameters/setparams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parameters: selectedParams }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Parameters loaded:", data);
        setToastMessage("Parameters loaded successfully!");
      })
      .catch((err) => {
        console.error(err);
        setToastMessage("Error loading parameters. Please try again.");
      });
  };

  return (
    <div className="tunning-container">
      <h2>Tunning</h2>
      <p>Tune hyperparameters manually or by grid search</p>

      <div className="radio-group">
        <button
          className={`mode-button ${mode === "manual" ? "selected" : ""}`}
          onClick={() => setMode("manual")}
        >
          Manual
        </button>
        <button
          className={`mode-button ${mode === "grid" ? "selected" : ""}`}
          onClick={() => setMode("grid")}
        >
          Grid Search
        </button>
      </div>

      <div className="tunning-sections">
        <div className="card">
          <h3>Manual Parameters</h3>
          <table>
            <tbody>
              <tr>
                <td>Eta:</td>
                <td>
                  <input
                    type="number"
                    name="eta"
                    value={params.eta}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>Max Depth:</td>
                <td>
                  <input
                    type="number"
                    name="maxDepth"
                    value={params.maxDepth}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>Gamma:</td>
                <td>
                  <input
                    type="number"
                    name="gamma"
                    value={params.gamma}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>Learning Rate:</td>
                <td>
                  <input
                    type="number"
                    name="learningRate"
                    value={params.learningRate}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>Min Child Weight:</td>
                <td>
                  <input
                    type="number"
                    name="minChildWeight"
                    value={params.minChildWeight}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>Subsample:</td>
                <td>
                  <input
                    type="number"
                    name="subsample"
                    value={params.subsample}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>Colsample Bytree:</td>
                <td>
                  <input
                    type="number"
                    name="colsampleBytree"
                    value={params.colsampleBytree}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Grid Search Parameters</h3>
          <table>
            <tbody>
              <tr>
                <td>Eta:</td>
                <td>
                  <input
                    type="number"
                    name="eta"
                    value={gridParams.eta || ""}
                    onChange={handleGridInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>Max Depth:</td>
                <td>
                  <input
                    type="number"
                    name="max_depth"
                    value={gridParams.max_depth || ""}
                    onChange={handleGridInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>Gamma:</td>
                <td>
                  <input
                    type="number"
                    name="gamma"
                    value={gridParams.gamma || ""}
                    onChange={handleGridInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>Learning Rate:</td>
                <td>
                  <input
                    type="number"
                    name="learning_rate"
                    value={gridParams.learning_rate || ""}
                    onChange={handleGridInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>Min Child Weight:</td>
                <td>
                  <input
                    type="number"
                    name="min_child_weight"
                    value={gridParams.min_child_weight || ""}
                    onChange={handleGridInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>Subsample:</td>
                <td>
                  <input
                    type="number"
                    name="subsample"
                    value={gridParams.subsample || ""}
                    onChange={handleGridInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>Colsample Bytree:</td>
                <td>
                  <input
                    type="number"
                    name="colsample_bytree"
                    value={gridParams.colsample_bytree || ""}
                    onChange={handleGridInputChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <button onClick={handleGridSearch} disabled={gridSearchLoading}>
            {gridSearchLoading ? (
              <>
                <FaSpinner className="loadingIcon" /> Searching...
              </>
            ) : (
              "Perform Grid Search"
            )}
          </button>
        </div>
      </div>

      <div style={{ marginTop: "15px" }}>
        <button onClick={handleLoadParameters}>Load Parameters</button>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
}

export default Tunning;