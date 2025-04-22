import React, { useState, useEffect } from "react";
import { FaUpload, FaSpinner, FaFileAlt, FaImage } from "react-icons/fa";
import Toast from "../toast/Toast";
import "./FileSelectionStyles.css";

function FileSelection({
  selectedFile,
  setSelectedFile,
  filePreview,
  setFilePreview,
  hasHeader,
  setHasHeader,
  activeModel,
}) {
  const [separator, setSeparator] = useState(",");
  const [availableFiles, setAvailableFiles] = useState([]);
  const [csvFiles, setCsvFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  // Separate loading states for load/upload and delete operations
  const [isLoadFileLoading, setIsLoadFileLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  // fileSource indicates whether the file was chosen from the combo ("combo")
  // or from the file system ("system")
  const [fileSource, setFileSource] = useState("");
  // Toggle between CSV and image mode
  const [fileType, setFileType] = useState("csv");
  // For preview of image data
  const [imagePreview, setImagePreview] = useState(null);
  const url = import.meta.env.VITE_XGB_URL;

  const fetchFiles = () => {
    if (activeModel === "neuralnetwork") {
      fetch(`${import.meta.env.VITE_BNN_URL}/files/list`)
        .then((res) => res.json())
        .then((data) => {
          // For neuralnetwork, use the "csv" key for CSV files
          // and load the special dataset names for image mode
          const csvFilesArray = data.csv || [];
          const specialFilesArray = (data.special || []).map(
            (item) => item.name
          );

          setCsvFiles(csvFilesArray);
          setImageFiles(specialFilesArray);

          // Set available files based on current file type selection
          setAvailableFiles(
            fileType === "csv" ? csvFilesArray : specialFilesArray
          );

          sessionStorage.setItem("availableFiles", JSON.stringify(data));
          sessionStorage.setItem("csvFiles", JSON.stringify(csvFilesArray));
          sessionStorage.setItem(
            "imageFiles",
            JSON.stringify(specialFilesArray)
          );
        })
        .catch((err) => console.error(err));
    } else {
      // For xgboost (existing behavior)
      fetch(`${url}/data/files`)
        .then((res) => res.json())
        .then((data) => {
          const allFiles = data.files || [];
          const csvFilesArray = allFiles.filter((file) =>
            file.toLowerCase().endsWith(".csv")
          );
          const imageFilesArray = allFiles.filter(
            (file) => !file.toLowerCase().endsWith(".csv")
          );

          setCsvFiles(csvFilesArray);
          setImageFiles(imageFilesArray);

          setAvailableFiles(
            fileType === "csv" ? csvFilesArray : imageFilesArray
          );

          sessionStorage.setItem("availableFiles", JSON.stringify(data.files));
          sessionStorage.setItem("csvFiles", JSON.stringify(csvFilesArray));
          sessionStorage.setItem("imageFiles", JSON.stringify(imageFilesArray));
        })
        .catch((err) => console.error(err));
    }
  };

  useEffect(() => {
    if (selectedFileName && !selectedFile) {
      setSelectedFile({ name: selectedFileName });
    }
  }, [selectedFileName]);

  useEffect(() => {
    const storedFileType = sessionStorage.getItem("fileType");
    if (storedFileType) {
      setFileType(storedFileType);
    }
    fetchFiles();
    const storedSelected = sessionStorage.getItem("selectedFileName");
    if (storedSelected) {
      setSelectedFileName(storedSelected);
      setFileSource("combo");
    }
  }, []);

  // Re-fetch files when activeModel changes (update the combo box)
  useEffect(() => {
    fetchFiles();
  }, [activeModel]);

  // Update available files when file type changes
  useEffect(() => {
    // Set the appropriate files based on current mode
    setAvailableFiles(fileType === "csv" ? csvFiles : imageFiles);
    sessionStorage.setItem("fileType", fileType);
  }, [fileType, csvFiles, imageFiles]);

  // In your initial useEffect, load the fileType's selection based on the stored file type:
  useEffect(() => {
    const storedFileType = sessionStorage.getItem("fileType");
    if (storedFileType) {
      setFileType(storedFileType);
      const storedSelected = sessionStorage.getItem(
        `selectedFileName_${storedFileType}`
      );
      if (storedSelected) {
        setSelectedFileName(storedSelected);
        setFileSource("combo");
      }
    }
    fetchFiles();
  }, []);

  // When the user changes file selection from the combo box:
  const handleComboChange = (e) => {
    const filename = e.target.value;
    setSelectedFileName(filename);
    // Save the selection keyed by the current file type
    sessionStorage.setItem(`selectedFileName_${fileType}`, filename);
    setFileSource("combo");

    if (!filename) {
      setFilePreview([]);
      setSelectedFile(null);
      setImagePreview(null);
      return;
    }

    if (activeModel === "neuralnetwork") {
      // Call your backend preview endpoint
      fetch(
        `${import.meta.env.VITE_BNN_URL}/files/preview?file_path=${filename}`
      )
        .then((res) => res.json())
        .then((data) => {
          // Assumes the response contains a "preview" property that's an array of lines
          if (data.preview) {
            setFilePreview(data.preview);
            setImagePreview(null);
          }
          setSelectedFile({ name: filename });
        })
        .catch((err) => console.error(err));
      return;
    }
    // For non-BNN mode, use the existing data/select endpoint
    fetch(`${url}/data/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, type: fileType }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (fileType === "csv") {
          setFilePreview(data.preview);
          setImagePreview(null);
        } else if (fileType === "image" && data.image) {
          setImagePreview(data.image);
          setFilePreview([]);
        }
        setSelectedFile({ name: filename });
      })
      .catch((err) => console.error(err));
  };

  // When a file is selected from the system:
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (fileType === "csv" && !file.name.toLowerCase().endsWith(".csv")) {
        alert("Only CSV files allowed in CSV mode");
        return;
      }

      if (fileType === "image" && !file.type.startsWith("image/")) {
        alert("Only image files allowed in Image mode");
        return;
      }

      // Save file name keyed by fileType so it can be restored later
      setSelectedFileName(file.name);
      sessionStorage.setItem(`selectedFileName_${fileType}`, file.name);
      setFilePreview([]);
      setImagePreview(null);
      setFileSource("system");
      setSelectedFile(file);

      if (fileType === "csv") {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const fileContent = evt.target.result;
          const lines = fileContent.split(/\r?\n/);
          setFilePreview(lines.slice(0, 10));
        };
        reader.readAsText(file);
      } else {
        const reader = new FileReader();
        reader.onload = (evt) => {
          setImagePreview(evt.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // When toggling between CSV and image modes, save the existing selection and load the new one:
  const toggleFileType = (type) => {
    // Save current selection under current fileType key
    sessionStorage.setItem(`selectedFileName_${fileType}`, selectedFileName);

    // Switch file type
    setFileType(type);
    // Clear current selection so the combo box resets
    setSelectedFileName("");
    setSelectedFile(null);
    setFilePreview([]);
    setImagePreview(null);

    // Load selection for new file type if it exists
    const storedSelected = sessionStorage.getItem(`selectedFileName_${type}`);
    if (storedSelected) {
      setSelectedFileName(storedSelected);
      setFileSource("combo");
    }
  };

  const handleClick = () => {
    const fileInput = document.getElementById("fileInput");
    fileInput.accept = fileType === "csv" ? ".csv" : "image/*";
    fileInput.click();
  };

  // The button now conditionally uploads the file if selected from system,
  // or loads the file if selected from combo.
  const handleLoadFile = () => {
    if (!selectedFileName) {
      alert("No file selected");
      return;
    }
    setIsLoadFileLoading(true);

    if (activeModel === "neuralnetwork") {
      // If the file came from the system, upload via the new endpoint
      if (fileSource === "system") {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("type", fileType);
        formData.append("separator", separator);

        fetch(`${import.meta.env.VITE_BNN_URL}/files/upload`, {
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
        // Otherwise, load the file via the preview/select endpoint
        fetch(`${import.meta.env.VITE_BNN_URL}/files/select`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_path: selectedFileName,
            has_header: hasHeader,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("BNN select response:", data);
            setToastMessage("File loaded successfully!");
            setSelectedFile({ name: selectedFileName });
            // Do not show any preview in NN mode if using select
          })
          .catch((err) => {
            console.error(err);
            setToastMessage("Error loading file. Please try again.");
          })
          .finally(() => {
            setIsLoadFileLoading(false);
          });
      }
      return;
    }

    // Existing behavior for xgboost mode:
    if (fileSource === "system") {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", fileType);
      formData.append("separator", separator);

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
          type: fileType,
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
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedFileName}?`
    );
    if (!confirmDelete) return;

    setIsDeleteLoading(true);

    fetch(`${url}/data/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: selectedFileName, type: fileType }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Delete response:", data);
        setToastMessage(data.message);
        setSelectedFileName("");
        setSelectedFile(null);
        setFilePreview([]);
        setImagePreview(null);
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

        {/* Toggle between CSV and Image */}
        <div className="file-type-toggle">
          <button
            className={`toggle-btn ${fileType === "csv" ? "active" : ""}`}
            onClick={() => toggleFileType("csv")}
          >
            <FaFileAlt /> CSV
          </button>
          <button
            className={`toggle-btn ${fileType === "image" ? "active" : ""}`}
            onClick={() => toggleFileType("image")}
          >
            <FaImage /> Images
          </button>
        </div>

        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <div className="file-selection-controls">
          <select value={selectedFileName} onChange={handleComboChange}>
            <option value="">Select a file</option>
            {availableFiles.map((file) => (
              <option key={file} value={file}>
                {file.replace(/^data\//, "")}
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

        {/* Show header and separator options for CSV, now even in neuralnetwork mode */}
        {fileType === "csv" && (
          <>
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
          </>
        )}

        {selectedFileName && <p>Selected file: {selectedFileName}</p>}
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
            ) : fileSource === "system" ? (
              "Upload File"
            ) : (
              "Load File"
            )}
          </button>
          <button
            type="button"
            onClick={handleDeleteFile}
            disabled={
              isDeleteLoading ||
              isLoadFileLoading ||
              !selectedFileName ||
              selectedFileName === "mnist"
            }
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

      {selectedFile && filePreview.length > 0 && fileType === "csv" && (
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

      {/* Only show image preview for non-BNN mode */}
      {activeModel !== "neuralnetwork" &&
        imagePreview &&
        fileType === "image" && (
          <div className="image-preview">
            <h3>Image Preview:</h3>
            <div className="image-container">
              <img src={imagePreview} alt="Dataset preview" />
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
