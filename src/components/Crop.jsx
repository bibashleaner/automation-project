import React, {useState, useCallback} from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "./CropImg";
// import { getCroppedImg } from "./CropUtils";
import '../assets/css/crop.css'

// const img = "https://img.huffingtonpost.com/asset/5ab4d4ac2000007d06eb2c56.jpeg?cache=sih0jwle4e&ops=1910_1000";

export const CropImage = ({imageSrc, onCropDone}) =>{
    const [crop, setCrop] = useState({x:0, y:0});
    const [zoom, setZoom] = useState(1);
    const [croppedImage, setCroppedImage] = useState(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) =>{
        setCroppedAreaPixels(croppedAreaPixels);
    },[]);

    // const showCroppedImage = useCallback(async () =>{
    //     try{
    //         const croppedImage = await getCroppedImg ( //gets the cropped image
    //             img,
    //             croppedAreaPixels
    //         )
    //         console.log('done', {croppedImage})
    //         setCroppedImage(croppedImage)
    //     }catch(e){
    //         console.error(e);
    //     }

    // },[croppedAreaPixels, img]);

    const handleCropSave = useCallback(async() =>{
        try{
            console.log(imageSrc);
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            // setCroppedImage(croppedImage);
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
        <button
            style={{display: imageSrc === null || croppedImage !== null ? "none" : "block",}}
            onClick={handleCropSave}
        >Crop-Done</button>

        <div className="container" style={{display: imageSrc === null || croppedImage !== null ? "none" : "block",}}>  
            <div className="crop-container">
                <Cropper
                    image = {imageSrc}
                    crop = {crop}
                    zoom = {zoom}
                    aspect={4/3}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                />
            </div>
        </div>

        <div className="cropped-image-container">
            {croppedImage && (
                <img className="cropped-image" src={croppedImage} alt="cropped" />
            )}
            {croppedImage && <button onClick={onClose}>close</button>}
        </div>

        </>
    );
}