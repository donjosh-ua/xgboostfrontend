import React, { useState } from 'react'
import './TrainingStyles.css'

function Training({ selectedFile, params, gridParams, mode }) {
  const [trainingMethod, setTrainingMethod] = useState('split')
  const [splitRatio, setSplitRatio] = useState(80)
  const [numFolds, setNumFolds] = useState(5)
  const [distribution, setDistribution] = useState('Normal')
  const [distributionParams, setDistributionParams] = useState({
    mean: '',
    stddev: '',
  })

  const handleTrainingMethodChange = (method) => {
    setTrainingMethod(method)
  }

  const handleSplitRatioChange = (e) => {
    setSplitRatio(e.target.value)
  }

  const handleNumFoldsChange = (e) => {
    setNumFolds(e.target.value)
  }

  const handleDistributionChange = (e) => {
    setDistribution(e.target.value)
  }

  const handleDistributionParamChange = (e) => {
    const { name, value } = e.target
    setDistributionParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }))
  }

  const handleTrainModel = () => {
    // Implement the logic for training the model
    console.log('Training model with method:', trainingMethod)
    console.log('Using parameters:', mode === 'manual' ? params : gridParams)
    console.log('Distribution:', distribution)
    console.log('Distribution parameters:', distributionParams)
    if (trainingMethod === 'split') {
      console.log('Split ratio:', splitRatio)
    } else {
      console.log('Number of folds:', numFolds)
    }
  }

  return (
    <div className="training-container">
      <h2>Training</h2>
      <p>Train model by splitting data or cross-validation</p>

      <div className="selected-params">
        <h3>Using {mode === 'manual' ? 'Manual' : 'Grid Search'} Parameters</h3>
      </div>

      <div className="training-methods">
        <button
          className={`method-button ${trainingMethod === 'split' ? 'selected' : ''}`}
          onClick={() => handleTrainingMethodChange('split')}
        >
          Split Data
        </button>
        <button
          className={`method-button ${trainingMethod === 'cross-validation' ? 'selected' : ''}`}
          onClick={() => handleTrainingMethodChange('cross-validation')}
        >
          Cross Validation
        </button>
      </div>

      {trainingMethod === 'split' && (
        <div className="split-ratio">
          <label>
            Split Ratio (Train/Test):
            <input
              type="number"
              value={splitRatio}
              onChange={handleSplitRatioChange}
              min="1"
              max="99"
            />
          </label>
          <p>
            Training: {splitRatio}%, Testing: {100 - splitRatio}%
          </p>
        </div>
      )}

      {trainingMethod === 'cross-validation' && (
        <div className="num-folds">
          <label>
            Number of Folds:
            <input
              type="number"
              value={numFolds}
              onChange={handleNumFoldsChange}
              min="2"
              max="20"
            />
          </label>
        </div>
      )}

      <div className="distribution-config">
        <label>
          Distribution:
          <select value={distribution} onChange={handleDistributionChange}>
            <option value="Normal">Normal</option>
            <option value="HalfNormal">HalfNormal</option>
            <option value="Cauchy">Cauchy</option>
            <option value="Exponential">Exponential</option>
          </select>
        </label>

        <table>
          <tbody>
            {distribution === 'Normal' && (
              <>
                <tr>
                  <td>Mean:</td>
                  <td>
                    <input
                      type="number"
                      name="mean"
                      value={distributionParams.mean}
                      onChange={handleDistributionParamChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Sigma:</td>
                  <td>
                    <input
                      type="number"
                      name="sigma"
                      value={distributionParams.sigma}
                      onChange={handleDistributionParamChange}
                    />
                  </td>
                </tr>
              </>
            )}
            {distribution === 'HalfNormal' && (
              <>
                <tr>
                  <td>Sigma:</td>
                  <td>
                    <input
                      type="number"
                      name="sigma"
                      value={distributionParams.sigma}
                      onChange={handleDistributionParamChange}
                    />
                  </td>
                </tr>
              </>
            )}
            {distribution === 'Cauchy' && (
              <>
                <tr>
                  <td>Alpha:</td>
                  <td>
                    <input
                      type="number"
                      name="alpha"
                      value={distributionParams.alpha}
                      onChange={handleDistributionParamChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Beta:</td>
                  <td>
                    <input
                      type="number"
                      name="beta"
                      value={distributionParams.beta}
                      onChange={handleDistributionParamChange}
                    />
                  </td>
                </tr>
              </>
            )}
            {distribution === 'Exponential' && (
              <>
                <tr>
                  <td>Lambda:</td>
                  <td>
                    <input
                      type="number"
                      name="lambda"
                      value={distributionParams.lambda}
                      onChange={handleDistributionParamChange}
                    />
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <button className="train-button" onClick={handleTrainModel}>
        Train Model
      </button>
    </div>
  )
}

export default Training