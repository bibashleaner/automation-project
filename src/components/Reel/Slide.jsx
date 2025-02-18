// import React, { useState } from "react";
// import { Slideshow } from "./SlideShow";
// import { ImageUploader } from "./ImageUploader";
// import {TemplateSelector} from "./Templates"
// import '../../assets/css/slide.css'

// export const Slide = () =>{
//     const [slideImage, setSlideImage] = useState([]);
//     const [template, setTemplate] = useState("slide");

//     return (
//         <>
//         <div className="container">
//             <div className="column">
//                 <ImageUploader onFileSelect={setSlideImage} />
//             </div>
//             <div className="column">
//                 <TemplateSelector selectedTemplate={template} setTemplate={setTemplate} />
//             </div>

//         </div>
//             <Slideshow slideImages={slideImage} template={template}/>
//         </>
//     );
// }


import React, { useState } from "react";
import { Slideshow } from "./SlideShow";
import { ImageUploader } from "./ImageUploader";
import { TemplateSelector } from "./Templates";
import "../../assets/css/slide.css";

export const Slide = () => {
    const [slideImage, setSlideImage] = useState([]);
    const [template, setTemplate] = useState("slide");
    const [isCroppingActive, setIsCroppingActive] = useState(false);

    // Callback from ImageUploader to update cropping status
    const handleCroppingChange = (status) => {
        setIsCroppingActive(status);
    };

    if (slideImage.length > 0 && !isCroppingActive) {
        return <Slideshow slideImages={slideImage} template={template} />;
    }

    return (
        <>
            <div className="container">
                <div className="column">
                    {/* Pass the cropping status callback */}
                    <ImageUploader onFileSelect={setSlideImage} onCroppingChange={handleCroppingChange} />
                </div>
                {/* Only render TemplateSelector if cropping is NOT active */}
                {!isCroppingActive && (
                    <div className="column">
                        <TemplateSelector selectedTemplate={template} setTemplate={setTemplate} />
                    </div>
                )}
            </div>
            {/* Only render Slideshow if cropping is NOT active */}
            {!isCroppingActive && (
                <Slideshow slideImages={slideImage} template={template} />
            )}
        </>
    );
};
