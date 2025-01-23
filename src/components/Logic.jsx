import React, { useState, useRef, useEffect } from "react";
import "../assets/css/logic.css";
import { CropImage } from "./Crop";
// import timesLogo from "../assets/pictures/timesLogo.png";
import { wrapText } from "./TextHelper"
import upload from '../icons/upload.png'
import croped from '../icons/croped.png'
import uploaded from '../icons/uploaded.png'
import download from '../icons/download.png'
import view from '../icons/view.png'
import { PreviewModel } from './Preview'

export const Logic = ({type, logo, defaultText}) => {
    const [uploadFiles, setUploadFiles] = useState([]);
    const [currentImage, setCurrentImage] = useState(null);
    const [overlayedFiles, setOverlayedFiles] = useState([]);
    const [overlayOpacity, setOverlayOpacity] = useState(0.5);
    const [previewImage, setPreviewImage] = useState(null);
    // const debounceTimeouts = useRef({});
    // const captionRenderedRef = useRef({});

    const captionFontLoaded = new FontFace("CaptionFont", "url('/src/fonts/DMSerifText.ttf')");
    const defaulFontLoaded = new FontFace("DefaultFont", "url('/src/fonts/Kanit-Regular.ttf')")

    const handleUploadFiles = (files) => {
        const uploaded = [...uploadFiles];
        files.forEach((file) => {
            // if (uploaded.findIndex((f) => f.name === file.name) === -1) {
            if(!uploaded.some((f) => f.name === file.name)){
                const reader = new FileReader();
                reader.onloadend = () => {
                    uploaded.push({
                        name: file.name,
                        preview: reader.result,
                        caption: " ",
                        captionRendered: false,
                        previewWithOverlay: null,
                        rendering: false,
                    });
                    setUploadFiles([...uploaded]);
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const handleFileEvent = (e) => {
        const choosenFile = Array.prototype.slice.call(e.target.files);
        handleUploadFiles(choosenFile);
    };

    const handleCaptionChange = async(index, caption) => {
        const updatedFiles = [...uploadFiles];
        const file = updatedFiles[index];
    
        file.caption = caption;
        file.rendering = true; // Mark as rendering
        setUploadFiles(updatedFiles);

        const overlayedImage = await createImageWithOverlay(file);
        file.previewWithOverlay = overlayedImage;
        file.captionRendered = true;
        file.rendering = false; // Mark as rendering complete

        setUploadFiles([...updatedFiles]); // Update state
    };

    const handleCropClick = (file) => {
        setCurrentImage(file);
    };

    const handleCropDone = (croppedImage) => {
        const updatedFiles = uploadFiles.map((file) =>
            file.name === currentImage.name
                ? { ...file, preview: croppedImage }
                : file
        );
        setUploadFiles(updatedFiles);
        setCurrentImage(null);
    };

    //function to handle the opacity
    const handleOverlayOpacityChange = async(e, fileIndex) =>{
        const newOpacity = parseFloat(e.target.value);
        setOverlayOpacity(newOpacity);

        // const updatedFiles = await Promise.all(
        //     uploadFiles.map(async (file) => {
        //         const previewWithOverlay = await createImageWithOverlay(file, newOpacity);
        //         return { ...file, previewWithOverlay };
        //     })
        // );

        // Clone the current file
    const updatedFile = { ...uploadFiles[fileIndex], overlayOpacity: newOpacity};
    
    // Generate the updated preview with the new opacity
    const previewWithOverlay = await createImageWithOverlay(updatedFile, newOpacity);
    updatedFile.previewWithOverlay = previewWithOverlay;

    // Update the specific file in the state
    const updatedFiles = [...uploadFiles];
    updatedFiles[fileIndex] = updatedFile;

        setUploadFiles(updatedFiles);
    }

    const createImageWithOverlay = (file, opacity = overlayOpacity) => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const image = new Image();
        image.src = file.preview;

        canvas.width = 1080;
        canvas.height = 1080;

        return new Promise((resolve) => {
            image.onload = () => {
                //set canvas dimension to match the image
                // canvas.width = image.width;
                // canvas.height = image.height;
                
                const aspectRatio = image.width / image.height;
                let drawWidth, drawHeight, offsetX, offsetY;

                if (aspectRatio > 1) {
                    // Landscape orientation
                    drawWidth = canvas.width;
                    drawHeight = canvas.width / aspectRatio;
                    offsetX = 0;
                    offsetY = (canvas.height - drawHeight) / 2;
                } else {
                    // Portrait orientation or square
                    drawWidth = canvas.height * aspectRatio;
                    drawHeight = canvas.height;
                    offsetX = (canvas.width - drawWidth) / 2;
                    offsetY = 0;
                }

                context.clearRect(0, 0, canvas.width, canvas.height); //clear canvas

                //Draw the main image
                context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

                //add black overlay with 50% opacity
                context.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                context.fillRect(0, 0, canvas.width, canvas.height);

                //calculate dynamic logo size and position
                // const logoWidth = Math.min(image.width * 0.3, 1000); // 10% of image width
                // const logoHeight = Math.min(image.height * 0.3, 1000); 
                // const logoMargin = image.width * 0.02;
                // const logoX = (canvas.width - logoWidth) / 2; //center logo
                // const logoY = logoMargin;

                // const logoWidth = 134;
                // const logoHeight = 182;

                // const logoMarginTop = 40;
                // // const logoMarginLeft = 474.87;
                // const logoY = logoMarginTop;
                // const logoX = (canvas.width - image.width) / 2;

                const logoImage = new Image();
                logoImage.src = logo;

                logoImage.onload = () => {
                    //draw the logo
                    const logoWidth = 250;  //134
                    const logoHeight = 220;
                    // const logoWidth = Math.min(image.width * 0.3, 1000); // 10% of image width
                    // const logoHeight = Math.min(image.height * 0.3, 1000); 
                    const logoY = 40; //logoMarginTop
                    const logoX = 430; //logoMarginLeft 474.87
                    context.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
                    // console.log(logoWidth, logoHeight);
                    
                    //add default text
                    const defaultFontSize = Math.max(18, Math.floor(canvas.width * 0.022)); //scale with the image width
                    context.font = `${defaultFontSize}px DefaultFont`;
                    context.fillStyle = "white";
                    context.textAlign = "center";

                    const defaultTextY = canvas.height - defaultFontSize - 10; // 10px margin from bottom
                    context.fillText(defaultText, canvas.width / 2, defaultTextY);

                    //add the caption
                    if (file.caption && file.caption.trim() !== "") {

                        const captionFontSize = Math.max(20, Math.floor(canvas.width * 0.070)); //scale with image size
                        context.font = `${captionFontSize}px CaptionFont`;
                        context.fillStyle = "white";
                        context.textAlign = "center";

                        const captionY = canvas.height - (captionFontSize * 2); // Position above default text
                        // context.fillText(file.caption, canvas.width / 2, captionY);

                        // **Wrap text logic**
                        const maxWidth = canvas.width * 0.8; // 80% of canvas width
                        const wrappedLines = wrapText(context, file.caption, maxWidth, captionFontSize);

                        // Draw each line of the wrapped text
                        let currentY = captionY - (wrappedLines.length - 1) * (captionFontSize + 5);
                        for (const line of wrappedLines) {
                            context.fillText(line, canvas.width / 2, currentY); 
                            currentY += captionFontSize + 5; // Line height
                        }
                        resolve(canvas.toDataURL("image/png"));
                        console.log(wrappedLines);
                    }
                    logoImage.onerror = () => resolve(canvas.toDataURL("image/png"));
                }
            }
            image.onerror = () => resolve(file.preview);
        });
    };

    const handleKeyPress = async (e, index) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();

            if(!uploadFiles[index].captionRendered){
                const updatedFiles = [...uploadFiles];
                updatedFiles[index].captionRendered = true;
    
                const overlayedImage = await createImageWithOverlay(updatedFiles[index]);
                updatedFiles[index].previewWithOverlay = overlayedImage;
                setUploadFiles(updatedFiles);
            }
        }
    };

    // useEffect(() => {
    //     const updateOverlaidPreviews = async () => {
    //             const updatedFiles = await Promise.all(
    //                 uploadFiles.map(async (file) => {
    //                     if(!file.captionRendered) {
    //                         const previewWithOverlay = await createImageWithOverlay(file);
    //                         return { ...file, previewWithOverlay };
    //                     }
    //                     return file;
    //                 })
    //             );
    //             setOverlayedFiles(updatedFiles);
    //     };

    //     if (uploadFiles.length > 0) {
    //         updateOverlaidPreviews();
    //     }
    // }, [uploadFiles]);

    //function to download single image
    const handleSingleDownload = async (file) => {
        // const overlayedImage = await createImageWithOverlay(file);
        // const link = document.createElement("a");
        // link.download = `${file.name}`;
        // link.href = overlayedImage;
        // link.click();

        const updatedFiles = uploadFiles.map((f) =>
            f.name === file.name ? { ...f, rendering: true } : f
        );
        setUploadFiles(updatedFiles);
    
        const overlayedImage = await createImageWithOverlay(file);
    
        const link = document.createElement("a");
        link.download = `${file.name}`;
        link.href = overlayedImage;
        link.click();
    
        const updatedFilesComplete = updatedFiles.map((f) =>
            f.name === file.name ? { ...f, rendering: false } : f
        );
        setUploadFiles(updatedFilesComplete);
    };

    //function to download all image at once
    const handleDownloadAll = async () => {
        for (const file of uploadFiles) {
            const overlayedImage = await createImageWithOverlay(file);
            const link = document.createElement("a");
            link.download = `${file.name}`;
            link.href = overlayedImage;
            link.click();
        }
    };

    if (currentImage) {
        return (
            <CropImage
                imageSrc={currentImage.preview}
                onCropDone={handleCropDone}
            />
        );
    }  

    const handlePreviewClick = (imageSrc) =>{
        setPreviewImage(imageSrc);
    }

    const closePreview = () => {
        setPreviewImage(null);
    }

    return (
        <>
            {uploadFiles.length === 0 ? (
            <>
                <h2 className="upload-text">Upload Files</h2>
                <div className="uploadArea">
                    <img src={upload} alt="upload" />
                    <h3>Drag and Drop here</h3>
                    <h3>or</h3>
                    <button onClick={() => document.getElementById("fileuploaded").click()}>
                        select files
                    </button>
                    <input id="fileuploaded" type="file" style={{display: "none"}} multiple onChange={handleFileEvent} />
                </div>
            </>

            ) : (
            
            <div className="uploaded-file-list">
                <div className="sub-header">
                    <h2>Add Image</h2>
                    <button
                        className="download-double-button"
                        onClick={handleDownloadAll}
                    >
                        <img src={download} alt="donwload icon" className="download-double-button-icon"/>
                        Download All
                    </button>
                </div>
                {uploadFiles.map((file, index) => (
                    <div key={index} className="file-preview">

                        <div className="preview-image-container">
                            <img
                                src={file.previewWithOverlay || file.preview}
                                alt={file.name}
                                className={file.rendering ? "rendering" : ""}
                            />
                        </div>

                        <div className="image-container">
                            <h1>Caption:</h1>
                            <textarea
                                placeholder="Enter the caption"
                                defaultValue={file.caption}
                                onChange={(e) => handleCaptionChange(index, e.target.value)}
                                // rows="15"
                                // cols="100"
                                onKeyDown={(e) => handleKeyPress(e, index)}    
                            />
                        <div className="buttons">

                            <button className="preview-btn" onClick={() => handlePreviewClick(file.previewWithOverlay || file.preview)}>
                                <img src={view} className="preview-icon"/>
                                Preview</button>

                            <button onClick={() => handleCropClick(file)} className="crop-btn">
                                <img src={croped} className="croped-icon"/>   
                                Crop</button>

                            <button
                                className="download-single-button"
                                onClick={() => handleSingleDownload(file)}
                                >
                                <img src={download} className="download-icon"/>
                                Download
                            </button>

                            <div className="opacity-slider">
                                <label htmlFor={`opacity-${index}`}>Set Opacity: {/*<span>{(uploadFiles[index].overlayOpacity * 100).toFixed(0)}%</span>*/}</label>
                                <input
                                    id={`opacity-${index}`}
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={uploadFiles[index].overlayOpacity}
                                    onChange={(e) => handleOverlayOpacityChange(e, index)}
                                />
                                
                            </div>

                        </div>
                        </div>
                    </div>
                ))}
            </div>
            )}
            {previewImage && (
                <PreviewModel imageSrc={previewImage} onClose={closePreview} />
            )}
        </>
    );
};
