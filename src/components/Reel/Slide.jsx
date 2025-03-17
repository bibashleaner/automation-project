import React, { useState } from "react";
import { Slideshow } from "./SlideShow";
import { ImageUploaderWithTemplate } from "../../components/Reel/ImageUploader"; 
// import "../../assets/css/slide.css";

export const Slide = () => {
  const [slideImage, setSlideImage] = useState([]); // Store cropped images
  const [template, setTemplate] = useState("slide"); // Store selected template
  const [isCroppingActive, setIsCroppingActive] = useState(false); // Track cropping status

  // Callback from ImageUploaderWithTemplate to update cropping status
  const handleCroppingChange = (status) => {
    setIsCroppingActive(status);
  };

  // Conditional rendering based on cropping status
  if (slideImage.length > 0 && !isCroppingActive) {
    return <Slideshow slideImages={slideImage} template={template} />;
  }

  return (
    <>
      <div className="slidess-container">
        <div className="column">
          <ImageUploaderWithTemplate
            onFileSelect={setSlideImage} // Pass callback to update slideImage
            onCroppingChange={handleCroppingChange} // Pass callback to update isCroppingActive
            template={template} //pass current template state
            setTemplate={setTemplate} //pass setTemplate function to update the parent state
          />
        </div>
        </div>
      {/* Render Slideshow only when there are images and cropping is not active */}
      {!isCroppingActive && slideImage.length > 0 && (
        <Slideshow slideImages={slideImage} template={template} />
      )}
    </>
  );
};