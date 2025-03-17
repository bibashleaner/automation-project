import React, { useState } from "react";
import { CropImage } from "../Crop"; 
import "react-easy-crop/react-easy-crop.css";
import "../../assets/css/crop.css";
import "../../assets/css/imageuploader.css"; 

export const ImageUploaderWithTemplate = ({
  onFileSelect,
  onCroppingChange,
  template,
  setTemplate,
}) => {
  const [selectedImages, setSelectedImages] = useState([]); // Store selected images before cropping
  const [croppedImages, setCroppedImages] = useState([]); // Store cropped images
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Track cropping position
  const [isCropping, setIsCropping] = useState(false); // Control cropper visibility

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Convert files to URLs for preview and cropping, preserving order
    const fileReaders = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ url: reader.result, name: file.name });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    // Wait for all images to be read and append in order
    Promise.all(fileReaders)
      .then((imageData) => {
        setSelectedImages((prev) => {
          const updatedImages = [...prev, ...imageData];
          return updatedImages;
        }); // Maintains selection order
      })
      .catch((error) => console.error("Error reading files:", error));
  };

  // Remove a selected image
  const handleRemoveImage = (indexToRemove) => {
    setSelectedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Start cropping process in selected order
  const handleOkClick = () => {
    if (selectedImages.length === 0) {
      alert("Please select at least one image!");
      return;
    }
    setCurrentImageIndex(0); // Start cropping from the first selected image
    setIsCropping(true); // Show cropper
    if (onCroppingChange) onCroppingChange(true);
  };

  // Handle cropped image and move to the next one in order
  const handleCropDone = (croppedImage) => {
    const updatedCroppedImages = [...croppedImages, { url: croppedImage, caption: "Cropped Image" }];
    setCroppedImages(updatedCroppedImages); // Update state with the new image

    if (currentImageIndex < selectedImages.length - 1) {
      setCurrentImageIndex((prevIndex) => prevIndex + 1); // Move to the next image in order
    } else {
      // Use the updatedCroppedImages directly to ensure the last image is included
      console.log("All images cropped. Final count:", updatedCroppedImages.length); // Debug log
      onFileSelect(updatedCroppedImages); // Pass the ordered cropped images
      setCroppedImages([]); // Reset croppedImages for next use
      setIsCropping(false); // Hide cropper
      if (onCroppingChange) onCroppingChange(false);
    }
  };

  return (
    <div className="page-container">
      {isCropping ? (
        <CropImage
          type="reelCrop"
          imageSrc={selectedImages[currentImageIndex].url} // Crop in the selected order
          onCropDone={handleCropDone}
        />
      ) : (
        <div className="add-image-container">
          <h1>Add Images</h1>

          {/* Combined Template Selector and File Input */}
          <div className="input-row">
            {/* Template Selector */}
            <div className="template-selector">
              <h3>Select Template</h3>
              <select
                value={template} // Use parent template state
                onChange={(e) => setTemplate(e.target.value)} // Update parent template state
              >
                <option value="slide">Slide</option>
                <option value="fade">Fade</option>
                <option value="zoom">Zoom</option>
              </select>
            </div>

            {/* File Input Button */}
            <button
              onClick={() => document.getElementById("image").click()}
              className="reelSelectFiles"
            >
              Select Files
            </button>
            <input
              id="image"
              type="file"
              className="file-input"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </div>

          {/* Selected Files List with Thumbnails */}
          {selectedImages.length > 0 && (
            <div className="selected-files-list">
              <h3>Selected Images ({selectedImages.length})</h3>
              <ul className="image-list">
                {selectedImages.map((image, index) => (
                  <li key={index} className="image-item">
                    <img src={image.url} alt={image.name} className="thumbnail" />
                    <span className="file-name">{image.name}</span>
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="remove-button"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>

              {/* OK Button to proceed with cropping */}
              <button onClick={handleOkClick} className="ok-button">
                OK
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};