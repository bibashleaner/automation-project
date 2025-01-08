import React, { useState } from "react";
import times from '../assets/pictures/times.png';
// import ImageWithOverlay from "./ImageWithOverlay";
import '../assets/css/berwick.css';
// import { preview } from "vite";

export const Berwick = () =>{
    const [uploadFiles, setUploadFiles] = useState([]);
    
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
    

    return (
        <>
        <h2>Add Image</h2>
        <input 
            id="fileuploaded"
            type="file" 
            multiple
            onChange={handleFileEvent} 
        />

        {/* preview */}
        <div className="uploaded-file-list">
            {uploadFiles.map((file, index) => (
                <div key={index} className="file-preview">
                    <p>{file.name}</p>
                    <div className="image-container">
                        <img
                            src={file.preview}
                            alt={file.name}
                            className="preview-image"
                        />
                        <div className="captionText">
                            {file.caption}
                        </div>
                    </div>
                    <div className="overlay">
                        <img
                            src={times}
                            alt="logo"
                            className="overlay-timelogo"
                        ></img>
                        <div className="overlay-text">{file.defaultText}</div>
                    </div>

                    {/* <ImageWithOverlay imageSrc={file.preview} caption={file.caption} /> */}
                    <textarea
                        placeholder="Enter caption here"
                        value={file.caption}
                        onChange={(e) => handleCaptionChange(index, e.target.value)}
                    />
                    <button>Preview</button>
                </div>
            ))}
        </div>

        {/* <h2>Add Caption</h2>
        <textarea
            rows={5}
            cols={30}
        ></textarea> */}


        </>
    );
}