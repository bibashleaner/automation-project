import React from "react";
import '../../assets/css/Imageuploader.css'

export const ImageUploader = ({onFileSelect}) =>{
    const handleFileChange = (e) =>{

        const files = Array.from(e.target.files); //convert file list to array

        const imageURL = files.map((file) => ({
            url: URL.createObjectURL(file),
            caption: file.name,
        }));
        onFileSelect(imageURL); //pass the selected image to parent

    };

    return (
        <>
        <div className="add-image-container">
            <h1>Add Image</h1>
            <button onClick={() => document.getElementById("image").click()}>
                Select files
            </button>
            <input
                id="image"
                type="file"
                style={{display: "none"}}
                multiple
                onChange={handleFileChange}
            />    
        </div>
        </>
    );
}