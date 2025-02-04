import React, { useState } from 'react'
import './FileSelectionStyles.css'

function FileSelection({
  selectedFile,
  setSelectedFile,
  filePreview,
  setFilePreview,
  hasHeader,
  setHasHeader,
}) {
  const [separator, setSeparator] = useState(',')

  const handleClick = () => {
    document.getElementById('fileInput').click()
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      // Only allow .csv
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Only CSV files allowed')
        return
      }

      setSelectedFile(file)

      const reader = new FileReader()
      reader.onload = (evt) => {
        const fileContent = evt.target.result
        const lines = fileContent.split(/\r?\n/)
        // Show first 10 rows
        setFilePreview(lines.slice(0, 10))
      }
      reader.readAsText(file)
    }
  }

  const generateHeaders = (line) => {
    const columns = line.split(separator)
    return columns.map((_, index) => (index === columns.length - 1 ? 'class' : `x${index + 1}`))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      handleFileChange({ target: { files: [file] } })
      e.dataTransfer.clearData()
    }
  }

  return (
    <div className="file-selection-container">
      <div className="file-selection">
        <h2>File Selection</h2>
        <p>Select your dataset</p>

        <input
          type="file"
          accept=".csv"
          id="fileInput"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <button type="button" id="choosef" onClick={handleClick}>
          Choose File
        </button>

        <div>
          <label>
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={() => setHasHeader(!hasHeader)}
            />
            File has header
          </label>
        </div>

        <div>
          <label>
            Separator:
            <select value={separator} onChange={(e) => setSeparator(e.target.value)}>
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value=":">Colon (:)</option>
              <option value="\t">Tab</option>
              <option value=" ">Space</option>
            </select>
          </label>
        </div>

        {selectedFile && <p>Selected file: {selectedFile.name}</p>}
      </div>

      {filePreview.length > 0 && (
        <div className="file-preview">
          <h3>Preview (first 10 rows):</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {(hasHeader ? filePreview[0].split(separator) : generateHeaders(filePreview[0])).map((header, index) => (
                    <th key={index}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filePreview.slice(hasHeader ? 1 : 0).map((line, index) => (
                  <tr key={index}>
                    {line.split(separator).map((cell, cellIndex) => (
                      <td key={cellIndex}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileSelection