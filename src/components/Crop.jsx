import React, {useState, useCallback} from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./CropImg";
import 'react-easy-crop/react-easy-crop.css';
import '../assets/css/crop.css'

export const CropImage = ({imageSrc, onCropDone, type}) =>{
    const [crop, setCrop] = useState({x:0, y:0});
    const [zoom, setZoom] = useState(1);
    const [croppedImage, setCroppedImage] = useState(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const aspectRatio = type === "reelCrop" ? 9 / 16 : 1;

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) =>{
        setCroppedAreaPixels(croppedAreaPixels);
    },[]);

    const handleCropSave = useCallback(async() =>{
        try{
            console.log(imageSrc);
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropDone(croppedImage); //pass cropped image back to berwick
        }catch(e){
            console.error(e);
        }
    }, [imageSrc, croppedAreaPixels, onCropDone]);

    const onClose = useCallback(() => {
        setCroppedImage(null);
    })

    return (
        <>
        <div className="cropper-container" style={{display: imageSrc === null || croppedImage !== null ? "none" : "block",}}>  
            <div className="crop-container">
                <Cropper
                    image = {imageSrc}
                    crop = {crop}
                    zoom = {zoom}
                    aspect={aspectRatio}  //1:1 ratio
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                />
            </div>
        </div>
            <button className="done-btn"
                style={{display: imageSrc === null || croppedImage !== null ? "none" : "block",}}
                onClick={handleCropSave}
            >Done</button>


        <div className="cropped-image-container">
            {croppedImage && (
                <img className="cropped-image" src={croppedImage} alt="cropped" />
            )}
        </div>

        </>
    );
}