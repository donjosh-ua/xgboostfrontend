import React, { useState } from 'react'
import './TunningStyles.css'

function Tunning({ selectedFile, params, setParams, gridParams, setGridParams, mode, setMode }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }))
  }

  const handleGridInputChange = (e) => {
    const { name, value } = e.target
    setGridParams((prevGridParams) => ({
      ...prevGridParams,
      [name]: value,
    }))
  }

  const handleGridSearch = () => {
    // Call the API for performing grid search
    // Example: fetch('/api/grid-search', { method: 'POST', body: JSON.stringify(gridParams) })
    // .then(response => response.json())
    // .then(data => console.log(data))
    console.log('Grid search parameters:', gridParams)
  }

  return (
    <div className="tunning-container">
      <h2>Tunning</h2>
      <p>Tune hyperparameters manually or by grid search</p>

      <div className="radio-group">
        <button
          className={`mode-button ${mode === 'manual' ? 'selected' : ''}`}
          onClick={() => setMode('manual')}
        >
          Manual
        </button>
        <button
          className={`mode-button ${mode === 'grid' ? 'selected' : ''}`}
          onClick={() => setMode('grid')}
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
                <td>Seed:</td>
                <td>
                  <input
                    type="number"
                    name="seed"
                    value={params.seed}
                    onChange={handleInputChange}
                  />
                </td>
              </tr>
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
                <td>Seed:</td>
                <td>
                  <input
                    type="number"
                    name="seed"
                    value={gridParams.seed}
                    onChange={handleGridInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>Eta:</td>
                <td>
                  <input
                    type="number"
                    name="eta"
                    value={gridParams.eta}
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
                    value={gridParams.max_depth}
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
                    value={gridParams.gamma}
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
                    value={gridParams.learning_rate}
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
                    value={gridParams.min_child_weight}
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
                    value={gridParams.subsample}
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
                    value={gridParams.colsample_bytree}
                    onChange={handleGridInputChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <button onClick={handleGridSearch}>Perform Grid Search</button>
        </div>
      </div>
    </div>
  )
}

export default Tunning