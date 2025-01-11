import React from "react";
import times from '../assets/pictures/times.png';

export const OverlayLogic = ({files, onSingleDownload, onDownloadAll}) => {
    const downloadImageWithOverlay = (file, fileName) => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const image = new Image();
        
        image.src = file.preview;  //use the image preview from file
        
        image.onload = () => {
            //set canvas size to match the image
            canvas.width = image.width;
            canvas.height = image.height;
            
            //draw the image onto the canvas
            context.drawImage(image, 0, 0);
            
            //add the logo to the canvas
            const logoSize = Math.min(image.width * 0.1, 100); //scale logo size(10% of image width, max 100px) 
            const logoX = 10;  //position from the left
            const logoY = 10; //position from the top
            
            const logoImage = new Image();
            logoImage.src = times;
            logoImage.onload = () => {
                context.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

                //Add the text caption
                if (file.caption && file.caption.trim() !== ""){
                    context.font = "20px Arial"; //set font size and style
                    context.fillStyle = "white"; //set text color
                    context.textAlign = "center"; //center-align the text
                    context.fillText(
                        file.caption,
                        canvas.width / 2, //position in the center horizontally
                        canvas.height - 2 //postion near the bottom of the image
                    );
                }

                //Trigger download
                const link = document.createElement("a");
                link.download = fileName || "image-with-overlay.png";
                link.href = canvas.toDataURL("image/png");
                link.click();
            }
        }
    }

    const handleSingleDownload = (file) =>{
        downloadImageWithOverlay(file, `${file.name}-with-overlay.png`);
    };

    const handleDownloadAll = () =>{
        files.forEach((file, index) => {
            downloadImageWithOverlay(file, `image-${index + 1}-with-overlay.png`);
        });
    };

    //callbacks to pass the function back to the berwick components
    onSingleDownload(handleSingleDownload);
    onDownloadAll(handleDownloadAll);

    return null; //no UI for this component
}