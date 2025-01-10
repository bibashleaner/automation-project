import React, { useState } from "react";
// import times from '../assets/pictures/times.png';
import '../assets/css/berwick.css';
import { CropImage } from "./Crop";

export const Berwick = () =>{
    const [uploadFiles, setUploadFiles] = useState([]);
    const [currentImage, setCurrentImage] = useState(null);
    
    const handleUploadFiles = (files) => {
        const uploaded = [...uploadFiles];
        files.forEach((file) => {
        //avoid duplicates
        if(uploaded.findIndex((f) => f.name === file.name) === -1){
            const reader = new FileReader();

            //read file as data url to preview image
            reader.onloadend = () => {
                uploaded.push({
                    name: file.name,
                    preview: reader.result, // store the preview
                    defaultText: "Berwick",
                    caption: " ",
                });
                setUploadFiles([...uploaded]);
            };
            reader.readAsDataURL(file); //read file as data url
        }
    });
    }
    
    const handleFileEvent = (e) => {
        const choosenFile = Array.prototype.slice.call(e.target.files);
        handleUploadFiles(choosenFile);
    }

    const handleCaptionChange = (index, caption) => {
        const updatedFiles = uploadFiles.map((file, i) =>
          i === index ? { ...file, caption } : file
        );
        setUploadFiles(updatedFiles);
    };

    const handleCropClick = (file) =>{
        setCurrentImage(file);  //set the selected image for cropping
    }

    const handleCropDone = (croppedImage) => {
        const updatedFiles = uploadFiles.map((file) =>
          file.name === currentImage.name
            ? { ...file, preview: croppedImage }
            : file
        );
        setUploadFiles(updatedFiles); // Update the cropped image in the list
        setCurrentImage(null); // Reset currentImage after cropping
      };

      if(currentImage){
        return (
            <CropImage 
                imageSrc={currentImage.preview}
                onCropDone={handleCropDone}
            />
        );
      }

    return (
        <>
        <h2>Add Image</h2>

        <input 
            id="fileuploaded"
            type="file" 
            multiple
            onChange={handleFileEvent} 
        />

        <button className="download-double-button">Download All</button>

        {/* preview */}
        <div className="uploaded-file-list">
            {uploadFiles.map((file, index) => (
                <div key={index} className="file-preview">
                    <p>{file.name}</p>
                    <div className="image-container">
                        <img
                            src={file.preview}
                            alt={file.name}
                        />
                        <textarea
                            placeholder="Enter the caption"
                            value={file.caption}
                            onChange={(e) => handleCaptionChange(index, e.target.value)}
                            rows="5"
                            cols="30"
                        />

                        <button className="download-single-button">Download</button>


                        {/* <div className="captionText">
                            {file.caption}
                        </div> */}

                    </div>

                    {/* <div className="overlay">
                        <img
                            src={times}
                            alt="logo"
                            className="overlay-timelogo"
                        ></img>
                        <div className="overlay-text">{file.defaultText}</div>
                    </div> */}

                    {/* <ImageWithOverlay imageSrc={file.preview} caption={file.caption} /> */}
                    <div className="buttons">
                        <button>Preview</button>      {/*if click in the image it will show the image */}
                        <button onClick={() => handleCropClick(file)}>Crop</button>
                    </div>
                </div>
            ))}
        </div>
        </>
    );
}