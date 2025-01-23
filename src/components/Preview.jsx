import React from "react";
import '../assets/css/preview.css'

export const PreviewModel = ({imageSrc, onClose}) =>{
    if(!imageSrc) return null;

    return (
        <div className="preview-modal">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}> &times; </button>
                <img src={imageSrc} alt="preview" className="preview-image"/>
            </div>
        </div>
    )
}