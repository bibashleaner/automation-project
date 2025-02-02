import React, { useState } from "react";
import { Slideshow } from "./SlideShow";
import { ImageUploader } from "./ImageUploader";
import {TemplateSelector} from "./Templates"

export const Slide = () =>{
    const [slideImage, setSlideImage] = useState([]);
    const [template, setTemplate] = useState("slide");

    return (
        <>
        <div className="container">
            <div className="column">
                <ImageUploader onFileSelect={setSlideImage} />
            </div>
            <div className="column">
                <TemplateSelector selectedTemplate={template} setTemplate={setTemplate} />
            </div>

        </div>
            <Slideshow slideImages={slideImage} template={template}/>
        </>
    );
}