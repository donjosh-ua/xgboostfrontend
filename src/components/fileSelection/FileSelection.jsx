import React, { useState, useEffect } from "react";
import { FaUpload, FaSpinner } from "react-icons/fa";
import Toast from "../toast/Toast";
import "./FileSelectionStyles.css";

function FileSelection({
  selectedFile,
  setSelectedFile,
  filePreview,
  setFilePreview,
  hasHeader,
  setHasHeader,
}) {
  const [separator, setSeparator] = useState(",");
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const url = import.meta.env.VITE_BASE_URL;

  const fetchFiles = () => {
    fetch(`${url}/data/files`)
      .then((res) => res.json())
      .then((data) => {
        setAvailableFiles(data.files);
        sessionStorage.setItem("availableFiles", JSON.stringify(data.files));
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchFiles();
    const storedSelected = sessionStorage.getItem("selectedFileName");
    if (storedSelected) {
      setSelectedFileName(storedSelected);
    }
    // On mount, persist loading state if it was set
    if (sessionStorage.getItem("fileLoading") === "true") {
      setIsLoading(true);
    }
  }, []);

  const handleComboChange = (e) => {
    const filename = e.target.value;
    setSelectedFileName(filename);
    sessionStorage.setItem("selectedFileName", filename);

    if (!filename) {
      setFilePreview([]);
      setSelectedFile(null);
      return;
    }

    fetch(`${url}/data/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    })
      .then((res) => res.json())
      .then((data) => {
        setFilePreview(data.preview);
        setSelectedFile({ name: filename });
      })
      .catch((err) => console.error(err));
  };

  const handleClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith(".csv")) {
        alert("Only CSV files allowed");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const fileContent = evt.target.result;
        const lines = fileContent.split(/\r?\n/);
        setFilePreview(lines.slice(0, 10));
      };
      reader.readAsText(file);
    }
  };

  const handleLoadFile = () => {
    if (!selectedFile) {
      alert("No file selected");
      return;
    }
    setIsLoading(true);
    sessionStorage.setItem("fileLoading", "true");
    fetch(`${url}/data/load`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: selectedFile.name,
        has_header: hasHeader,
        separator,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Load file response:", data);
        setToastMessage("File loaded successfully!");
      })
      .catch((err) => {
        console.error(err);
        setToastMessage("Error loading file. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
        sessionStorage.removeItem("fileLoading");
      });
  };

  const generateHeaders = (line) => {
    const columns = line.split(separator);
    return columns.map((_, index) =>
      index === columns.length - 1 ? "class" : `x${index + 1}`
    );
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileChange({ target: { files: [file] } });
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="file-selection-container">
      <div className="file-selection">
        <h2>File Selection</h2>
        <p>Select your dataset</p>
        <input
          type="file"
          accept=".csv"
          id="fileInput"
          style={{ display: "none" }}
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
          // <button type="button" className="upload-button" onClick={handleClick}>
          //   <FaUpload />
          // </button>
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
        <div style={{ marginTop: "15px" }}>
          <button type="button" onClick={handleLoadFile} disabled={isLoading}>
            {isLoading ? (
              <>
                <FaSpinner className="loadingIcon" /> Loading...
              </>
            ) : (
              "Load File"
            )}
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

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
}

export default FileSelection;
