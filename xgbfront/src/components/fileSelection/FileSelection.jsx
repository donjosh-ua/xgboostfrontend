import React, { useState, useEffect } from 'react'
import { FaUpload } from 'react-icons/fa'
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
  const [availableFiles, setAvailableFiles] = useState([])
  const [selectedFileName, setSelectedFileName] = useState('')

  const fetchFiles = () => {
    fetch('http://127.0.0.0:8000/data/files')
      .then((res) => res.json())
      .then((data) => {
        setAvailableFiles(data.files)
        sessionStorage.setItem('availableFiles', JSON.stringify(data.files))
      })
      .catch((err) => console.error(err))
  }

  // On mount, load availableFiles and persist selectedFileName from sessionStorage.
  useEffect(() => {
    const storedFiles = sessionStorage.getItem('availableFiles')
    if (storedFiles) {
      setAvailableFiles(JSON.parse(storedFiles))
    } else {
      fetchFiles()
    }
    const storedSelected = sessionStorage.getItem('selectedFileName')
    if (storedSelected) {
      setSelectedFileName(storedSelected)
    }
  }, [])

  const handleComboChange = (e) => {
    const filename = e.target.value
    setSelectedFileName(filename)
    // Persist the selected file in sessionStorage.
    sessionStorage.setItem('selectedFileName', filename)
    // Send a POST request with the filename.
    fetch('http://127.0.0.0:8000/data/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename }),
    })
      .then((res) => res.json())
      .then((data) => {
        setFilePreview(data.preview)
        setSelectedFile({ name: filename })
      })
      .catch((err) => console.error(err))
  }

  const handleClick = () => {
    document.getElementById('fileInput').click()
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Only CSV files allowed')
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (evt) => {
        const fileContent = evt.target.result
        const lines = fileContent.split(/\r?\n/)
        setFilePreview(lines.slice(0, 10))
      }
      reader.readAsText(file)
    }
  }

  const handleLoadFile = () => {
    if (!selectedFile) {
      alert('No file selected')
      return
    }
    fetch('http://127.0.0.0:8000/data/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: selectedFile.name,
        has_header: hasHeader,
        separator,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Load file response:', data)
      })
      .catch((err) => console.error(err))
  }

  const generateHeaders = (line) => {
    const columns = line.split(separator)
    return columns.map((_, index) =>
      index === columns.length - 1 ? 'class' : `x${index + 1}`
    )
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
        <div className="file-selection-controls">
          <select value={selectedFileName} onChange={handleComboChange}>
            <option value="">Select a file</option>
            {availableFiles.map((file) => (
              <option key={file} value={file}>
                {file}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="upload-button"
            onClick={handleClick}
          >
            <FaUpload />
          </button>
        </div>
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
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value=":">Colon (:)</option>
              <option value="\t">Tab</option>
              <option value=" ">Space</option>
            </select>
          </label>
        </div>
        {selectedFile && <p>Selected file: {selectedFile.name}</p>}
        <div style={{ marginTop: '15px' }}>
          <button type="button" onClick={handleLoadFile}>
            Load File
          </button>
        </div>
      </div>
      {selectedFile && filePreview.length > 0 && (
        <div className="file-preview">
          <h3>Preview (first 10 rows):</h3>
          <div className="table-container">
            <table onDrop={handleDrop}>
              <thead>
                <tr>
                  {(hasHeader
                    ? filePreview[0].split(separator)
                    : generateHeaders(filePreview[0])
                  ).map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filePreview.slice(hasHeader ? 1 : 0).map((line, index) => (
                  <tr key={index}>
                    {line.split(separator).map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
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