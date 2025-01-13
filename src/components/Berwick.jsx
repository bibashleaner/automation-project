import React, { useState, useRef, useEffect } from "react";
import "../assets/css/berwick.css";
import { CropImage } from "./Crop";
import times from "../assets/pictures/times.png";

export const Berwick = () => {
    const [uploadFiles, setUploadFiles] = useState([]);
    const [currentImage, setCurrentImage] = useState(null);
    const [overlayedFiles, setOverlayedFiles] = useState([]);

    const fontLoaded = new FontFace("CustomFont", "url('/src/fonts/DMSerifText.ttf')");

    const handleUploadFiles = (files) => {
        const uploaded = [...uploadFiles];
        files.forEach((file) => {
            if (uploaded.findIndex((f) => f.name === file.name) === -1) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    uploaded.push({
                        name: file.name,
                        preview: reader.result,
                        caption: " ",
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

    const handleCaptionChange = (index, caption) => {
        const updatedFiles = uploadFiles.map((file, i) =>
            i === index ? { ...file, caption } : file
        );
        setUploadFiles(updatedFiles);
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

    const createImageWithOverlay = (file) => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const image = new Image();
        image.src = file.preview;

        return new Promise((resolve) => {
            image.onload = () => {
                //set canvas dimension to match the image
                canvas.width = image.width;
                canvas.height = image.height;

                //Draw the main image
                context.drawImage(image, 0, 0);

                //add black overlay with 50% opacity
                context.fillStyle = `rgba(0, 0, 0, 0.5)`;
                context.fillRect(0, 0, canvas.width, canvas.height);

                //calculate dynamic logo size and position
                const logoWidth = Math.min(image.width * 0.3, 1000); // 10% of image width
                const logoHeight = Math.min(image.height * 0.25, 1000); 
                const logoMargin = image.width * 0.02;
                const logoX = (canvas.width - logoWidth) / 2; //center logo
                const logoY = logoMargin;

                const logoImage = new Image();
                logoImage.src = times;
                logoImage.onload = () => {
                    //draw the logo
                    context.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);

                    //add the caption
                    if (file.caption && file.caption.trim() !== "") {
                        const captionFontSize = Math.max(20, Math.floor(image.width * 0.070)); //scale with image size
                        context.font = `bold ${captionFontSize}px CustomFont`;
                        context.fillStyle = "white";
                        context.textAlign = "center";

                        const captionY = canvas.height - (captionFontSize * 2); // Position above default text
                        context.fillText(file.caption, canvas.width / 2, captionY);
                    }

                    //add default text
                    const defaultText = "TIMES BERWICK";
                    const defaultFontSize = Math.max(18, Math.floor(image.width * 0.022)); //scale with the image width
                    context.font = `${defaultFontSize}px CustomFont`;
                    context.fillStyle = "white";
                    context.textAlign = "center";

                    const defaultTextY = canvas.height - defaultFontSize - 10; // 10px margin from bottom
                    context.fillText(defaultText, canvas.width / 2, defaultTextY);

                    resolve(canvas.toDataURL("image/png"));
                };

                logoImage.onerror = () => resolve(file.preview);
            };

            image.onerror = () => resolve(file.preview);
        });
    };

    useEffect(() => {
        const updateOverlaidPreviews = async () => {
            const updatedFiles = await Promise.all(
                uploadFiles.map(async (file) => {
                    const previewWithOverlay = await createImageWithOverlay(file);
                    return { ...file, previewWithOverlay };
                })
            );
            setOverlayedFiles(updatedFiles);
        };

        if (uploadFiles.length > 0) {
            updateOverlaidPreviews();
        }
    }, [uploadFiles]);

    const handleSingleDownload = async (file) => {
        const overlayedImage = await createImageWithOverlay(file);
        const link = document.createElement("a");
        link.download = `${file.name}-with-overlay.png`;
        link.href = overlayedImage;
        link.click();
    };

    const handleDownloadAll = async () => {
        for (const file of uploadFiles) {
            const overlayedImage = await createImageWithOverlay(file);
            const link = document.createElement("a");
            link.download = `${file.name}-with-overlay.png`;
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

    return (
        <>
            <h2>Add Image</h2>
            <input id="fileuploaded" type="file" multiple onChange={handleFileEvent} />
            <button
                className="download-double-button"
                onClick={handleDownloadAll}
            >
                Download All
            </button>
            <div className="uploaded-file-list">
                {uploadFiles.map((file, index) => (
                    <div key={index} className="file-preview">
                        <p>{file.name}</p>
                        <div className="image-container">
                            <img
                                src={overlayedFiles[index]?.previewWithOverlay || file.preview}
                                alt={file.name}
                            />
                            <textarea
                                placeholder="Enter the caption"
                                value={file.caption}
                                onChange={(e) => handleCaptionChange(index, e.target.value)}
                                rows="5"
                                cols="30"
                            />
                            <button
                                className="download-single-button"
                                onClick={() => handleSingleDownload(file)}
                            >
                                Download
                            </button>
                        </div>
                        <div className="buttons">
                            <button>Show Image</button>
                            <button onClick={() => handleCropClick(file)}>Crop</button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};
