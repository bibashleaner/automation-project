
import React, { useState, useRef, useEffect } from "react";
import "../assets/css/logic.css";
import { CropImage } from "./Crop";
import { wrapText } from "./TextHelper"
import upload from '../icons/upload.png'
import croped from '../icons/croped.png'
import uploaded from '../icons/uploaded.png'
import download from '../icons/download.png'
import view from '../icons/view.png'
import { PreviewModel } from './Preview'
import { useLocation } from "react-router-dom";

export const Logic = ({type, logo, secondLogo, defaultText}) => {
    const [uploadFiles, setUploadFiles] = useState([]);
    const [currentImage, setCurrentImage] = useState(null);
    const [overlayOpacity, setOverlayOpacity] = useState(0.5);
    const [previewImage, setPreviewImage] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [cranImageOption, setCranImageOption] = useState('default');
    const location = useLocation();

    const captionFontLoaded = new FontFace("CaptionFont", "url('/src/fonts/DMSerifText.ttf')");
    const defaulFontLoaded = new FontFace("DefaultFont", "url('/src/fonts/Kanit-Regular.ttf')");

    const handleDragEnter = (e) =>{
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }

    const handleDragOver = (e) =>{
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }

    const handleDragLeave = (e) =>{
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }

    const handleDrop = (e) =>{
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        handleUploadFiles(files);
    }

    useEffect(() => {
        const preventDefault = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
    
        window.addEventListener("dragover", preventDefault);
        window.addEventListener("drop", preventDefault);
    
        return () => {
            window.removeEventListener("dragover", preventDefault);
            window.removeEventListener("drop", preventDefault);
        };
    }, []);    

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
        const updatedFile = { ...uploadFiles[fileIndex], overlayOpacity: newOpacity};
        
        // Generate the updated preview with the new opacity
        const previewWithOverlay = await createImageWithOverlay(updatedFile, newOpacity);
        updatedFile.previewWithOverlay = previewWithOverlay;

        // Update the specific file in the state
        const updatedFiles = [...uploadFiles];
        updatedFiles[fileIndex] = updatedFile;

        setUploadFiles(updatedFiles);
    }

    const handleCranImageOptionChange = (e) =>{
        setCranImageOption(e.target.value);
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
                context.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                context.fillRect(0, 0, canvas.width, canvas.height);
    
                if(type === 'cranimage'){
                    
                    if(cranImageOption === 'alternative'){
                        // Alternative overlay: Draw a left-hand side rectangle with opacity.
                        const rectWidth = canvas.width * 0.2; // 30% of the canvas width
                        // context.fillStyle = "rgba(0, 0, 0, 0.5)"; 
                        context.fillStyle = "rgba(162, 68, 30, 0.5)"; 
                        context.fillRect(0, 0, rectWidth, canvas.height);
                    }else{
                        context.fillStyle = '#bc5125'; // Orange color
    
                        const baseFontSize = Math.max(16, Math.floor(canvas.width * 0.015)); // Approximate base font size
    
                        //Top rectangle 
                        const topLeftHeight = baseFontSize * 9;  
                        const topRightHeight = baseFontSize * 6; 
    
                        context.beginPath();
                        context.moveTo(0, 0); // Start at the top-left corner
                        context.lineTo(canvas.width, 0); // Extend to the top-right corner
                        context.lineTo(canvas.width, topRightHeight); // Move downward (right side height)
                        context.lineTo(0, topLeftHeight); // Move downward (left side height)
                        context.closePath();
                        context.fill();
    
                        //Bottom rectangle 
                        const bottomLeftHeight = baseFontSize * 6; 
                        const bottomRightHeight = baseFontSize * 9; 
                        const bottomY = canvas.height;
    
                        context.beginPath();
                        context.moveTo(0, bottomY); // Start at the bottom-left corner
                        context.lineTo(canvas.width, bottomY); // Extend to the bottom-right corner
                        context.lineTo(canvas.width, bottomY - bottomRightHeight); // Move upward (right side height)
                        context.lineTo(0, bottomY - bottomLeftHeight); // Move upward (left side height)
                        context.closePath();
                        context.fill();
                    }
                }
    
                const logoImage = new Image();
                logoImage.src = logo;
    
                // Add a second logo for cranimage alternative mode
                const secondLogoImage = new Image();
                secondLogoImage.src = secondLogo; // You need to define/import secondLogo
    
                logoImage.onload = () => {
                    let logoX, logoY, logoHeight, logoWidth;
                    let computedLogoX;
    
                    if (type === "cranimage") {
                        if (cranImageOption === 'alternative'){
                            logoWidth = canvas.width * 0.35; 
                            logoHeight = canvas.height * 0.35;
    
                            const topRectHeight = canvas.height * 0.10; // Adjust based on your design
                            logoY = topRectHeight - (logoHeight / 2);
                            logoX = 3;
                        }else{
                            logoWidth = canvas.width * 0.35; 
                            logoHeight = canvas.height * 0.35;
                        
                            const topRectHeight = canvas.height * 0.10; // Adjust based on your design
                            logoX = (canvas.width - logoWidth) / 2; // Center logo horizontally
                            logoY = topRectHeight - (logoHeight / 2);
                            computedLogoX = logoX;
                        }   
                    } else {
                        logoWidth = 200;
                        logoHeight = 220;
                        
                        logoX = 430; // Default left margin
                        logoY = 40;  // Default top margin
                        computedLogoX = logoX;
                    }
                    context.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
                    
                    // Only load and draw the second logo for cranimage alternative
                    if (type === "cranimage" && cranImageOption === "alternative") {
                        secondLogoImage.onload = () => {
                            // Define dimensions for the second logo
                            const secondLogoWidth = canvas.width * 0.40; // Slightly smaller than first logo
                            const secondLogoHeight = canvas.height * 0.40;
                            
                            // Position at top right
                            const secondLogoX = canvas.width - secondLogoWidth - 0; // 20px margin from right
                            const secondLogoY = 0; // 20px margin from top
                            
                            // Draw the second logo
                            context.drawImage(secondLogoImage, secondLogoX, secondLogoY, secondLogoWidth, secondLogoHeight);
                            
                            // Continue with the rest of the rendering after second logo is drawn
                            renderTextAndComplete();
                        };
                        
                        secondLogoImage.onerror = () => {
                            // If second logo fails to load, continue with the rest of the rendering
                            renderTextAndComplete();
                        };
                    } else {
                        // For other modes, just continue with the rendering
                        renderTextAndComplete();
                    }
                    
                    // Function to handle the rest of the rendering after logos
                    function renderTextAndComplete() {
                        if (type === 'cranimage' && cranImageOption === 'default'){
                            //add default text for berwick
                            const defaultFontSize = Math.max(18, Math.floor(canvas.width * 0.032)); //scale with the image width
                            context.font = `${defaultFontSize}px DefaultFont`;
                            context.fillStyle = "white";
                            context.textAlign = "center";
    
                            const defaultTextY = canvas.height - defaultFontSize - 10; // 10px margin from bottom
                            context.fillText(defaultText, canvas.width / 2, defaultTextY);
                        }else if (type === "Image"){
                            // add default text for cranbroune
                            const defaultFontSize = Math.max(18, Math.floor(canvas.width * 0.022)); //scale with the image width
                            context.font = `${defaultFontSize}px DefaultFont`;
                            context.fillStyle = "white";
                            context.textAlign = "center";
    
                            const defaultTextY = canvas.height - defaultFontSize - 10; // 10px margin from bottom
                            context.fillText(defaultText, canvas.width / 2, defaultTextY);
                        }
                        
                        //add the caption
                        if (file.caption && file.caption.trim() !== "") {
                            const captionFontSize = Math.max(20, Math.floor(canvas.width * 0.070)); //scale with image size
                            context.font = `${captionFontSize}px CaptionFont`;
                            context.fillStyle = "white";
                            
                            let captionX;
                            // If we're in cranimage alternative mode, align caption to left using computedLogoX.
                            if (type === "cranimage" && cranImageOption === "alternative") {
                                context.textAlign = "left";
                                captionX = 50; // Align the caption with the logo's left position.
                            } else {
                                context.textAlign = "center";
                                captionX = canvas.width / 2;
                            }
    
                            const captionY = canvas.height - (captionFontSize * 2); // Position above default text
                            
                            // **Wrap text logic**
                            const maxWidth = type === "cranimage" && cranImageOption === "alternative" ? canvas.width - captionX - 10 : canvas.width * 0.8;
                            const wrappedLines = wrapText(context, file.caption, maxWidth, captionFontSize);
    
                            // Draw each line of the wrapped text
                            let currentY;
                            if (type === "cranimage" && cranImageOption === "alternative"){
                                currentY = captionY - (wrappedLines.length - 2.2) * (captionFontSize + 5);
                            }else{
                                currentY = captionY - (wrappedLines.length - 1) * (captionFontSize + 5);
                            }
    
                            const lineIndent = 30; // How many extra pixels you want to shift subsequent lines
    
                            wrappedLines.forEach((line, i) => {
                                // For the first line, no extra indent. For subsequent lines, add an offset.
                                const lineX = i === 0 ? captionX : captionX + lineIndent;
                                context.fillText(line, lineX, currentY);
                                currentY += captionFontSize + 5; // Move down for the next line
                            });
    
                            resolve(canvas.toDataURL("image/png"));
                        } else {
                            resolve(canvas.toDataURL("image/png"));
                        }
                    }
                };
                
                logoImage.onerror = () => resolve(file.preview);
            };
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

    //function to download single image
    const handleSingleDownload = async (file) => {

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
                <div className="image-upload-container">
                    <div 
                        className="drop-area"
                        onDragEnter={(e) => handleDragEnter(e)}
                        onDragOver={(e) => handleDragOver(e)}
                        onDragLeave={(e) => handleDragLeave(e)}
                        onDrop={(e) => handleDrop(e)}
                    >
                    <div className="uploadArea">
                        <img src={upload} alt="upload" />
                        <h3>Drag and Drop here</h3>
                        <h3>or</h3>
                        <button onClick={() => document.getElementById("fileuploaded").click()}>
                            select files
                        </button>
                        <input id="fileuploaded" type="file" style={{display: "none"}} multiple onChange={handleFileEvent} />
                    </div>

                </div>
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
                                <label htmlFor={`opacity-${index}`}>Set Opacity: <span>{((uploadFiles[index]?.overlayOpacity || 0) * 100).toFixed(0)}%</span>{/*<span>{(uploadFiles[index].overlayOpacity * 100).toFixed(0)}%</span>*/}</label>
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

                            {type === "cranimage" && (
                                <div className="cranimage-dropdown">
                                <label htmlFor={`cranimage-dropdown-${index}`}>
                                    Template
                                </label>
                                <select
                                    id={`cranimage-dropdown-${index}`}
                                    value={cranImageOption}
                                    onChange={handleCranImageOptionChange}
                                >
                                    <option value="default">Default</option>
                                    <option value="alternative">Alternative</option>
                                </select>
                                </div>
                            )}

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
