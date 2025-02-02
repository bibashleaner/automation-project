import React, { useRef, useState, useEffect } from "react";
import { Slide, Fade, Zoom } from "react-slideshow-image";
import 'react-slideshow-image/dist/styles.css';
import '../../assets/css/slideshow.css'

const slideSize = {
  width: "500px",
  height: "500px",
};

const divStyle = {
  ...slideSize,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "400px",
  height: "500px",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

export const Slideshow = ({ slideImages, template }) => {
  const canvasRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState("slideshow");

  // Improved easing function for smoother transitions
  const easeInOutCubic = (t) => {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const AnimationComponent =
    template === "zoom"
      ? Zoom
      : template === "fade"
      ? Fade
      : Slide;

  // Enhanced image loading with error handling and caching
  const imageCache = new Map();
  const loadImage = (imageUrl) => {
    if (imageCache.has(imageUrl)) {
      return Promise.resolve(imageCache.get(imageUrl));
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Handle CORS issues
      img.src = imageUrl;
      img.onload = () => {
        imageCache.set(imageUrl, img);
        resolve(img);
      };
      img.onerror = (err) => reject(new Error(`Failed to load image: ${imageUrl}`));
    });
  };

  // Preload all images
  const preloadImages = async () => {
    try {
      await Promise.all(slideImages.map(image => loadImage(image.url)));
    } catch (error) {
      console.error("Error preloading images:", error);
    }
  };

  // Improved render function with better transition handling
  const renderToCanvas = async (ctx, currentImage, nextImage, progress) => {
    if (!currentImage || !nextImage) return;

    const easedProgress = easeInOutCubic(progress);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    try {
      const [currentImg, nextImg] = await Promise.all([
        loadImage(currentImage.url),
        loadImage(nextImage.url)
      ]);

      const drawImage = (img, alpha = 1, scale = 1, offsetX = 0) => {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        
        const imgRatio = img.width / img.height;
        const canvasRatio = canvasWidth / canvasHeight;
        
        let drawWidth = canvasWidth;
        let drawHeight = canvasHeight;
        
        if (imgRatio > canvasRatio) {
          drawHeight = canvasWidth / imgRatio;
        } else {
          drawWidth = canvasHeight * imgRatio;
        }

        const x = (canvasWidth - drawWidth) / 2 + offsetX;
        const y = (canvasHeight - drawHeight) / 2;

        ctx.globalAlpha = alpha;
        if (template === "zoom") {
          const zoomScale = scale;
          const scaledWidth = drawWidth * zoomScale;
          const scaledHeight = drawHeight * zoomScale;
          const zoomX = x - (scaledWidth - drawWidth) / 2;
          const zoomY = y - (scaledHeight - drawHeight) / 2;
          ctx.drawImage(img, zoomX, zoomY, scaledWidth, scaledHeight);
        } else {
          ctx.drawImage(img, x, y, drawWidth, drawHeight);
        }
      };

      if (template === "fade") {
        drawImage(currentImg, 1 - easedProgress);
        drawImage(nextImg, easedProgress);
      } else if (template === "slide") {
        drawImage(currentImg, 1, 1, -easedProgress * ctx.canvas.width);
        drawImage(nextImg, 1, 1, (1 - easedProgress) * ctx.canvas.width);
      } else if (template === "zoom") {
        drawImage(currentImg, 1 - easedProgress, 1 + easedProgress * 0.2);
        drawImage(nextImg, easedProgress, 1 + (1 - easedProgress) * 0.2);
      }

      ctx.globalAlpha = 1;
    } catch (error) {
      console.error("Error rendering frame:", error);
    }
  };

  // Improved video generation with better quality settings
  const generateVideo = async () => {
    if (!slideImages || slideImages.length < 2) {
      alert("Please add at least 2 images for the slideshow.");
      return;
    }

    setIsRecording(true);
    setProgress(0);
    
    // Preload images before starting
    await preloadImages();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Higher quality video settings
    const stream = canvas.captureStream(60);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 8000000 // 8 Mbps for better quality
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setVideoUrl(URL.createObjectURL(blob));
      setIsRecording(false);
      setProgress(100);
      setMode("video");
    };

    mediaRecorder.start();

    const fps = 60;
    const secondsPerTransition = 2;
    const framesPerTransition = fps * secondsPerTransition;
    let currentFrame = 0;
    const totalFrames = (slideImages.length - 1) * framesPerTransition;

    const renderFrame = async () => {
      const transitionIndex = Math.floor(currentFrame / framesPerTransition);
      const transitionProgress = (currentFrame % framesPerTransition) / framesPerTransition;
      
      const currentImage = slideImages[transitionIndex];
      const nextImage = slideImages[transitionIndex + 1];

      await renderToCanvas(ctx, currentImage, nextImage, transitionProgress);
      
      currentFrame++;
      setProgress((currentFrame / totalFrames) * 100);

      if (currentFrame < totalFrames) {
        requestAnimationFrame(renderFrame);
      } else {
        mediaRecorder.stop();
      }
    };

    requestAnimationFrame(renderFrame);
  };

  return (
   
    <div className="slide-container">
    {/* Slideshow mode */}
    {mode === "slideshow" && (
      <>
        {slideImages.length > 0 && (
          <AnimationComponent autoplay={true} transitionDuration={500} duration={2000}>
            {slideImages.map((image, index) => (
              <div key={index} style={{ ...divStyle, backgroundImage: `url(${image.url})` }}></div>
            ))}
          </AnimationComponent>
        )}

        <canvas ref={canvasRef} width={1280} height={720} style={{ display: "none" }} />

        <div className="controls">
          <button
            onClick={generateVideo}
            disabled={isRecording}
            className={`generate-btn ${isRecording ? "disable" : ""}`}
          >
            {isRecording ? `Processing... ${Math.round(progress)}%` : "Generate Video"}
          </button>
        </div>
      </>
    )}

    {/* Video mode */}
    {mode === "video" && videoUrl && (
      <div className="video-container">
        <video controls src={videoUrl} className="video-preview" />
        <a href={videoUrl} download="slideshow.webm" className="download-btn">
          Download Video
        </a>
      </div>
    )}
  </div>

  );
};



// import React, { useRef, useState, useEffect } from "react";
// import { Slide, Fade, Zoom } from "react-slideshow-image";
// import 'react-slideshow-image/dist/styles.css';

// const divStyle = {
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   height: "400px",
//   backgroundSize: "cover",
//   backgroundPosition: "center",
// };

// export const Slideshow = ({ slideImages, template }) => {
//   const canvasRef = useRef(null);
//   const [videoUrl, setVideoUrl] = useState(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [progress, setProgress] = useState(0);

//   // Improved easing function for smoother transitions
//   const easeInOutCubic = (t) => {
//     return t < 0.5 
//       ? 4 * t * t * t 
//       : 1 - Math.pow(-2 * t + 2, 3) / 2;
//   };

//   const AnimationComponent =
//     template === "zoom"
//       ? Zoom
//       : template === "fade"
//       ? Fade
//       : Slide;

//   // Enhanced image loading with error handling and caching
//   const imageCache = new Map();
//   const loadImage = (imageUrl) => {
//     if (imageCache.has(imageUrl)) {
//       return Promise.resolve(imageCache.get(imageUrl));
//     }

//     return new Promise((resolve, reject) => {
//       const img = new Image();
//       img.crossOrigin = "anonymous"; // Handle CORS issues
//       img.src = imageUrl;
//       img.onload = () => {
//         imageCache.set(imageUrl, img);
//         resolve(img);
//       };
//       img.onerror = (err) => reject(new Error(`Failed to load image: ${imageUrl}`));
//     });
//   };

//   // Preload all images
//   const preloadImages = async () => {
//     try {
//       await Promise.all(slideImages.map(image => loadImage(image.url)));
//     } catch (error) {
//       console.error("Error preloading images:", error);
//     }
//   };

//   // Improved render function with better transition handling
//   const renderToCanvas = async (ctx, currentImage, nextImage, progress) => {
//     if (!currentImage || !nextImage) return;

//     const easedProgress = easeInOutCubic(progress);
//     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

//     try {
//       const [currentImg, nextImg] = await Promise.all([
//         loadImage(currentImage.url),
//         loadImage(nextImage.url)
//       ]);

//       const drawImage = (img, alpha = 1, scale = 1, offsetX = 0) => {
//         const canvasWidth = ctx.canvas.width;
//         const canvasHeight = ctx.canvas.height;
        
//         const imgRatio = img.width / img.height;
//         const canvasRatio = canvasWidth / canvasHeight;
        
//         let drawWidth = canvasWidth;
//         let drawHeight = canvasHeight;
        
//         if (imgRatio > canvasRatio) {
//           drawHeight = canvasWidth / imgRatio;
//         } else {
//           drawWidth = canvasHeight * imgRatio;
//         }

//         const x = (canvasWidth - drawWidth) / 2 + offsetX;
//         const y = (canvasHeight - drawHeight) / 2;

//         ctx.globalAlpha = alpha;
//         if (template === "zoom") {
//           const zoomScale = scale;
//           const scaledWidth = drawWidth * zoomScale;
//           const scaledHeight = drawHeight * zoomScale;
//           const zoomX = x - (scaledWidth - drawWidth) / 2;
//           const zoomY = y - (scaledHeight - drawHeight) / 2;
//           ctx.drawImage(img, zoomX, zoomY, scaledWidth, scaledHeight);
//         } else {
//           ctx.drawImage(img, x, y, drawWidth, drawHeight);
//         }
//       };

//       if (template === "fade") {
//         drawImage(currentImg, 1 - easedProgress);
//         drawImage(nextImg, easedProgress);
//       } else if (template === "slide") {
//         drawImage(currentImg, 1, 1, -easedProgress * ctx.canvas.width);
//         drawImage(nextImg, 1, 1, (1 - easedProgress) * ctx.canvas.width);
//       } else if (template === "zoom") {
//         drawImage(currentImg, 1 - easedProgress, 1 + easedProgress * 0.2);
//         drawImage(nextImg, easedProgress, 1 + (1 - easedProgress) * 0.2);
//       }

//       ctx.globalAlpha = 1;
//     } catch (error) {
//       console.error("Error rendering frame:", error);
//     }
//   };

//   // Improved video generation with better quality settings
//   const generateVideo = async () => {
//     if (!slideImages || slideImages.length < 2) {
//       alert("Please add at least 2 images for the slideshow.");
//       return;
//     }

//     setIsRecording(true);
//     setProgress(0);
    
//     // Preload images before starting
//     await preloadImages();

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
    
//     // Higher quality video settings
//     const stream = canvas.captureStream(60);
//     const mediaRecorder = new MediaRecorder(stream, {
//       mimeType: 'video/webm;codecs=vp9',
//       videoBitsPerSecond: 8000000 // 8 Mbps for better quality
//     });

//     const chunks = [];
//     mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
//     mediaRecorder.onstop = () => {
//       const blob = new Blob(chunks, { type: "video/webm" });
//       setVideoUrl(URL.createObjectURL(blob));
//       setIsRecording(false);
//       setProgress(100);
//     };

//     mediaRecorder.start();

//     const fps = 60;
//     const secondsPerTransition = 2;
//     const framesPerTransition = fps * secondsPerTransition;
//     let currentFrame = 0;
//     const totalFrames = (slideImages.length - 1) * framesPerTransition;

//     const renderFrame = async () => {
//       const transitionIndex = Math.floor(currentFrame / framesPerTransition);
//       const transitionProgress = (currentFrame % framesPerTransition) / framesPerTransition;
      
//       const currentImage = slideImages[transitionIndex];
//       const nextImage = slideImages[transitionIndex + 1];

//       await renderToCanvas(ctx, currentImage, nextImage, transitionProgress);
      
//       currentFrame++;
//       setProgress((currentFrame / totalFrames) * 100);

//       if (currentFrame < totalFrames) {
//         requestAnimationFrame(renderFrame);
//       } else {
//         mediaRecorder.stop();
//       }
//     };

//     requestAnimationFrame(renderFrame);
//   };

//   return (
//     <div className="slide-container">
//       {slideImages.length > 0 && (
//         <AnimationComponent autoplay={true} transitionDuration={500} duration={2000}>
//           {slideImages.map((image, index) => (
//             <div key={index} style={{ ...divStyle, backgroundImage: `url(${image.url})` }}></div>
//           ))}
//         </AnimationComponent>
//       )}

//       <canvas 
//         ref={canvasRef} 
//         width={1280} 
//         height={720} 
//         style={{ display: "none" }} 
//       />

//       {slideImages.length > 0 && (
//         <div className="mt-4 space-y-4">
//           <button
//             onClick={generateVideo}
//             disabled={isRecording}
//             className={`w-full px-4 py-2 rounded-md ${
//               isRecording ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
//             }`}
//           >
//             {isRecording ? `Processing... ${Math.round(progress)}%` : "Generate Video"}
//           </button>

//           {videoUrl && (
//             <div className="space-y-2">
//               <video controls src={videoUrl} className="w-full max-w-md mx-auto rounded-lg shadow-lg" />
//               <a 
//                 href={videoUrl} 
//                 download="slideshow.webm" 
//                 className="block w-full text-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
//               >
//                 Download Video
//               </a>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };




