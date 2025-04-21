import React from "react";

function ResultsImagesGrid({ resultsImages, setModalImage }) {
  return (
    <div className="nn-results-images">
      <h3>Visualizations</h3>
      <div className="images-grid">
        {Object.entries(resultsImages).map(([key, base64String]) => (
          <div
            key={key}
            className="result-image"
            onClick={() =>
              setModalImage(`data:image/png;base64,${base64String}`)
            }
          >
            <h4>{key.replace(/_/g, " ")}</h4>
            <img
              src={`data:image/png;base64,${base64String}`}
              alt={`Neural Network test result for ${key}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultsImagesGrid;
