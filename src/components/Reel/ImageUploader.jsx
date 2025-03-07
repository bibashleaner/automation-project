// import React from "react";
// import '../../assets/css/imageuploader.css'

// export const ImageUploader = ({onFileSelect}) =>{
//     const handleFileChange = (e) =>{

//         const files = Array.from(e.target.files); //convert file list to array

//         const imageURL = files.map((file) => ({
//             url: URL.createObjectURL(file),
//             caption: file.name,
//         }));
//         onFileSelect(imageURL); //pass the selected image to parent

//     };

//     return (
//         <>
//         <div className="add-image-container">
//             <h1>Add Image</h1>
//             <button onClick={() => document.getElementById("image").click()}>
//                 Select files
//             </button>
//             <input
//                 id="image"
//                 type="file"
//                 style={{display: "none"}}
//                 multiple
//                 onChange={handleFileChange}
//             />    
//         </div>
//         </>
//     );
// }




import React, { useState } from "react";
import { CropImage } from "../Crop"; // Import Crop Component
import { Slideshow } from "./SlideShow"; // Import Slideshow Component
import 'react-easy-crop/react-easy-crop.css';
import '../../assets/css/crop.css'
import '../../assets/css/imageuploader.css'


export const ImageUploader = ({ onFileSelect, onCroppingChange }) => {
    const [selectedImages, setSelectedImages] = useState([]); // Store selected images before cropping
    const [croppedImages, setCroppedImages] = useState([]); // Store cropped images
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // Track cropping position
    const [isCropping, setIsCropping] = useState(false); // Control cropper visibility

    // Handle file selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Convert files to URLs for cropping
        const fileReaders = files.map((file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        // Wait for all images to be read
        Promise.all(fileReaders)
            .then((imageUrls) => {
                setSelectedImages(imageUrls);
                setCurrentImageIndex(0); // Start cropping from first image
                setIsCropping(true); // Hide everything else
                if (onCroppingChange) onCroppingChange(true);
            })
            .catch((error) => console.error("Error reading files:", error));
    };

    // Handle cropped image and move to the next one
    const handleCropDone = (croppedImage) => {
        setCroppedImages((prev) => [...prev, { url: croppedImage, caption: "Cropped Image" }]);

        if (currentImageIndex < selectedImages.length - 1) {
            setCurrentImageIndex((prevIndex) => prevIndex + 1); // Move to next image
        } else {
            // Once cropping is done, pass cropped images back to parent
            onFileSelect([...croppedImages, { url: croppedImage, caption: "Cropped Image" }]);
            setIsCropping(false); // Show other components
            if (onCroppingChange) onCroppingChange(false);
        }
    };

    return (
        <div className="page-container">
            {/* Only show Cropper when cropping is active */}
            {isCropping ? (
                <CropImage
                    type = "reelCrop"
                    imageSrc={selectedImages[currentImageIndex]}
                    onCropDone={handleCropDone}
                />
            ) : (
                <>
                    {/* Image Upload UI (visible when cropping is not active) */}
                    <div className="add-image-container">
                        <h1>Add Images</h1>
                        <button onClick={() => document.getElementById("image").click()} className="reelSelectFiles">
                            Select files
                        </button>
                        <input
                            id="image"
                            type="file"
                            style={{ display: "none" }}
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                        />
                    </div>
                    
                    {/* Show Slideshow only if there are cropped images */}
                    {/* {croppedImages.length > 0 && <Slideshow slideImages={croppedImages} />} */}
                </>
            )}
        </div>
    );
};
