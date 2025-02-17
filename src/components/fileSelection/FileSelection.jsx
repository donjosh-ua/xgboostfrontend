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
  // Separate loading states for load/upload and delete operations
  const [isLoadFileLoading, setIsLoadFileLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  // fileSource indicates whether the file was chosen from the combo ("combo")
  // or from the file system ("system")
  const [fileSource, setFileSource] = useState("");
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
      setFileSource("combo");
    }
  }, []);

  const handleComboChange = (e) => {
    const filename = e.target.value;
    setSelectedFileName(filename);
    sessionStorage.setItem("selectedFileName", filename);
    setFileSource("combo");

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

  // When a file is selected from the system
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith(".csv")) {
        alert("Only CSV files allowed");
        return;
      }
      // Clear previous combo selection
      setSelectedFileName("");
      sessionStorage.removeItem("selectedFileName");
      setFilePreview([]);
      setSelectedFile(null);
      // Mark file source as system
      setFileSource("system");

      // Set preview locally without uploading yet
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

  // The button now conditionally uploads the file if selected from system,
  // or loads the file if selected from combo.
  const handleLoadFile = () => {
    if (!selectedFile) {
      alert("No file selected");
      return;
    }
    setIsLoadFileLoading(true);

    if (fileSource === "system") {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      fetch(`${url}/data/upload`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Upload response:", data);
          setToastMessage(data.message);
          fetchFiles();
          setSelectedFileName(selectedFile.name);
        })
        .catch((err) => {
          console.error(err);
          setToastMessage("Error uploading file. Please try again.");
        })
        .finally(() => {
          setIsLoadFileLoading(false);
        });
    } else {
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
          setIsLoadFileLoading(false);
        });
    }
  };

  const handleDeleteFile = () => {
    if (!selectedFileName) {
      alert("No file selected");
      return;
    }
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedFileName}?`);
    if (!confirmDelete) return;
  
    setIsDeleteLoading(true);
  
    fetch(`${url}/data/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: selectedFileName }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Delete response:", data);
        setToastMessage(data.message);
        setSelectedFileName("");
        setSelectedFile(null);
        setFilePreview([]);
        fetchFiles();
      })
      .catch((err) => {
        console.error(err);
        setToastMessage("Error deleting file. Please try again.");
      })
      .finally(() => {
        setIsDeleteLoading(false);
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
          <button
            type="button"
            className="upload-button"
            onClick={handleClick}
            disabled={isLoadFileLoading || isDeleteLoading}
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
        <div className="file-selection-actions">
          <button
            type="button"
            onClick={handleLoadFile}
            disabled={isLoadFileLoading || isDeleteLoading}
          >
            {isLoadFileLoading ? (
              <>
                <FaSpinner className="loadingIcon" />{" "}
                {fileSource === "system" ? "Uploading..." : "Loading..."}
              </>
            ) : (
              fileSource === "system" ? "Upload File" : "Load File"
            )}
          </button>
          <button
            type="button"
            onClick={handleDeleteFile}
            disabled={isDeleteLoading || isLoadFileLoading || !selectedFileName}
          >
            {isDeleteLoading ? (
              <>
                <FaSpinner className="loadingIcon" /> Deleting...
              </>
            ) : (
              "Delete File"
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