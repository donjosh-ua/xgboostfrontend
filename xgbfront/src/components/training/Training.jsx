import React, { useState } from 'react'
import './TrainingStyles.css'

function Training({ selectedFile, params, gridParams, mode }) {
  const [trainingMethod, setTrainingMethod] = useState('split')
  const [splitRatio, setSplitRatio] = useState(80)
  const [numFolds, setNumFolds] = useState(5)

  const handleTrainingMethodChange = (method) => {
    setTrainingMethod(method)
  }

  const handleSplitRatioChange = (e) => {
    setSplitRatio(e.target.value)
  }

  const handleNumFoldsChange = (e) => {
    setNumFolds(e.target.value)
  }

  const handleTrainModel = () => {
    // Implement the logic for training the model
    console.log('Training model with method:', trainingMethod)
    console.log('Using parameters:', mode === 'manual' ? params : gridParams)
    if (trainingMethod === 'split') {
      console.log('Split ratio:', splitRatio)
    } else {
      console.log('Number of folds:', numFolds)
    }
  }

  return (
    <div className="training-container">
      <h2>Training</h2>
      <p>Train model by spliting data or cross validation</p>

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
            %
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

      <button className="train-button" onClick={handleTrainModel}>
        Train Model
      </button>
    </div>
  )
}

export default Training