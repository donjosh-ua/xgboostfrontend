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
  const url = import.meta.env.VITE_XGB_URL;

  // Restore loading state on mount
  useEffect(() => {
    if (sessionStorage.getItem("trainingLoading") === "true") {
      setIsLoading(true);
    }
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
    sessionStorage.setItem("trainingLoading", "true");
    setTrainMessage("");
    const value =
      trainingValues.trainingMethod === "split"
        ? Number(trainingValues.splitRatio)
        : Number(trainingValues.numFolds);

    const parsedDistributionParams = Object.fromEntries(
      Object.entries(trainingValues.distributionParams).map(([key, value]) => {
        // Don't convert vector/string fields to Number
        if (
          ["alpha_vector", "p_vector", "weights", "means", "sigmas"].includes(
            key
          )
        ) {
          return [key, value];
        }
        return [key, value === "" ? undefined : Number(value)];
      })
    );

    const requestData = {
      method: trainingValues.trainingMethod,
      value: value,
      rounds: Number(trainingValues.rounds),
      distribution: trainingValues.distribution,
      params: parsedDistributionParams,
    };

    fetch(`${url}/train/both`, {
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
      })
      .catch((err) => {
        console.error(err);
        setTrainMessage(
          "There was an error training the model. Please try again."
        );
      })
      .finally(() => {
        setIsLoading(false);
        sessionStorage.removeItem("trainingLoading");
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
            <option value="Beta">Beta</option>
            <option value="ChiSquared">ChiSquared</option>
            <option value="ExGaussian">ExGaussian</option>
            <option value="Gamma">Gamma</option>
            <option value="Logistic">Logistic</option>
            <option value="LogNormal">LogNormal</option>
            <option value="Uniform">Uniform</option>
            <option value="Weibull">Weibull</option>
            <option value="Bernoulli">Bernoulli</option>
            <option value="Binomial">Binomial</option>
            <option value="BetaBinomial">BetaBinomial</option>
            <option value="Categorical">Categorical</option>
            <option value="Poisson">Poisson</option>
            <option value="Dirichlet">Dirichlet</option>
            <option value="DirichletMultinomial">DirichletMultinomial</option>
            <option value="Multinomial">Multinomial</option>
            <option value="NormalMixture">NormalMixture</option>
            <option value="GaussianRandomWalk">GaussianRandomWalk</option>
            <option value="AR1">AR1</option>
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
            {trainingValues.distribution === "Beta" && (
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
            {trainingValues.distribution === "ChiSquared" && (
              <tr>
                <td>Nu:</td>
                <td>
                  <input
                    type="number"
                    name="nu"
                    value={trainingValues.distributionParams.nu}
                    onChange={handleDistributionParamChange}
                    disabled={isLoading}
                  />
                </td>
              </tr>
            )}
            {trainingValues.distribution === "ExGaussian" && (
              <>
                <tr>
                  <td>Mu:</td>
                  <td>
                    <input
                      type="number"
                      name="mu"
                      value={trainingValues.distributionParams.mu}
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
                <tr>
                  <td>Nu:</td>
                  <td>
                    <input
                      type="number"
                      name="nu"
                      value={trainingValues.distributionParams.nu}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              </>
            )}
            {trainingValues.distribution === "Gamma" && (
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
            {trainingValues.distribution === "Logistic" && (
              <>
                <tr>
                  <td>Mu:</td>
                  <td>
                    <input
                      type="number"
                      name="mu"
                      value={trainingValues.distributionParams.mu}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Scale:</td>
                  <td>
                    <input
                      type="number"
                      name="scale"
                      value={trainingValues.distributionParams.scale}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              </>
            )}
            {trainingValues.distribution === "LogNormal" && (
              <>
                <tr>
                  <td>Mu:</td>
                  <td>
                    <input
                      type="number"
                      name="mu"
                      value={trainingValues.distributionParams.mu}
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
            {trainingValues.distribution === "Uniform" && (
              <>
                <tr>
                  <td>Lower:</td>
                  <td>
                    <input
                      type="number"
                      name="lower"
                      value={trainingValues.distributionParams.lower}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Upper:</td>
                  <td>
                    <input
                      type="number"
                      name="upper"
                      value={trainingValues.distributionParams.upper}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              </>
            )}
            {trainingValues.distribution === "Weibull" && (
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
            {trainingValues.distribution === "Bernoulli" && (
              <tr>
                <td>P:</td>
                <td>
                  <input
                    type="number"
                    name="p"
                    value={trainingValues.distributionParams.p}
                    onChange={handleDistributionParamChange}
                    disabled={isLoading}
                  />
                </td>
              </tr>
            )}
            {trainingValues.distribution === "Binomial" && (
              <>
                <tr>
                  <td>N:</td>
                  <td>
                    <input
                      type="number"
                      name="n"
                      value={trainingValues.distributionParams.n}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
                <tr>
                  <td>P:</td>
                  <td>
                    <input
                      type="number"
                      name="p"
                      value={trainingValues.distributionParams.p}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              </>
            )}
            {trainingValues.distribution === "BetaBinomial" && (
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
                <tr>
                  <td>N:</td>
                  <td>
                    <input
                      type="number"
                      name="n"
                      value={trainingValues.distributionParams.n}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              </>
            )}
            {trainingValues.distribution === "Categorical" && (
              <tr>
                <td>P:</td>
                <td>
                  <input
                    type="number"
                    name="p"
                    value={trainingValues.distributionParams.p}
                    onChange={handleDistributionParamChange}
                    disabled={isLoading}
                  />
                </td>
              </tr>
            )}
            {trainingValues.distribution === "Poisson" && (
              <tr>
                <td>Mu:</td>
                <td>
                  <input
                    type="number"
                    name="mu"
                    value={trainingValues.distributionParams.mu}
                    onChange={handleDistributionParamChange}
                    disabled={isLoading}
                  />
                </td>
              </tr>
            )}
            {trainingValues.distribution === "Dirichlet" && (
              <tr>
                <td>Alpha Vector:</td>
                <td>
                  <input
                    type="string"
                    name="alpha_vector"
                    value={trainingValues.distributionParams.alpha_vector}
                    onChange={handleDistributionParamChange}
                    disabled={isLoading}
                  />
                </td>
              </tr>
            )}
            {trainingValues.distribution === "DirichletMultinomial" && (
              <>
                <tr>
                  <td>Alpha Vector:</td>
                  <td>
                    <input
                      type="string"
                      name="alpha_vector"
                      value={trainingValues.distributionParams.alpha_vector}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
                <tr>
                  <td>N:</td>
                  <td>
                    <input
                      type="number"
                      name="n"
                      value={trainingValues.distributionParams.n}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              </>
            )}
            {trainingValues.distribution === "Multinomial" && (
              <>
                <tr>
                  <td>N:</td>
                  <td>
                    <input
                      type="number"
                      name="n"
                      value={trainingValues.distributionParams.n}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
                <tr>
                  <td>P Vector:</td>
                  <td>
                    <input
                      type="string"
                      name="p_vector"
                      value={trainingValues.distributionParams.p_vector}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              </>
            )}
            {trainingValues.distribution === "NormalMixture" && (
              <>
                <tr>
                  <td>Weights:</td>
                  <td>
                    <input
                      type="string"
                      name="weights"
                      value={trainingValues.distributionParams.weights}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Means:</td>
                  <td>
                    <input
                      type="string"
                      name="means"
                      value={trainingValues.distributionParams.means}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Sigmas:</td>
                  <td>
                    <input
                      type="string"
                      name="sigmas"
                      value={trainingValues.distributionParams.sigmas}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              </>
            )}
            {trainingValues.distribution === "GaussianRandomWalk" && (
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
            {trainingValues.distribution === "AR1" && (
              <>
                <tr>
                  <td>K:</td>
                  <td>
                    <input
                      type="number"
                      name="k"
                      value={trainingValues.distributionParams.k}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Tau:</td>
                  <td>
                    <input
                      type="number"
                      name="tau"
                      value={trainingValues.distributionParams.tau}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Rho:</td>
                  <td>
                    <input
                      type="number"
                      name="rho"
                      value={trainingValues.distributionParams.rho}
                      onChange={handleDistributionParamChange}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              </>
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
