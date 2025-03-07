import React, { useRef, useState, useEffect } from "react";
import { Slide, Fade, Zoom } from "react-slideshow-image";
import { CropImage } from "../Crop";
import 'react-slideshow-image/dist/styles.css';
import '../../assets/css/slideshow.css'

// Define pixel values, not strings with units
const slideSize = {
  width: 360,
  height: 640,
};

const divStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "360px",
  height: "640px",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

export const Slideshow = ({ slideImages, template }) => {
  const canvasRef = useRef(null);
  const [slideImage, setSlideImage] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState("slideshow");
  const [transitionDuration, setTransitionDuration] = useState(2);

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

  // Ensure canvas is sized correctly when the component mounts
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = slideSize.width;
      canvas.height = slideSize.height;
    }
  }, []);

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
    
    // Ensure canvas dimensions match slideshow dimensions
    canvas.width = slideSize.width;
    canvas.height = slideSize.height;
    
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
    const secondsPerTransition = transitionDuration;
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

  // Handle transition duration change
  const handleDurationChange = (e) => {
    setTransitionDuration(parseFloat(e.target.value));
  };

  return (
      <div className="slideshow-wrapper">
        {/* Slideshow container - for display only */}
        <div 
          className="slide-container"
          style={{
            width: "360px", 
            height: "640px",
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Slideshow mode */}
          {mode === "slideshow" && (
            <>
              {slideImages.length > 0 && (
                <AnimationComponent 
                  key={transitionDuration}
                  autoplay={true} 
                  transitionDuration={500} 
                  duration={transitionDuration * 1000} 
                  arrows={true}
                >
                  {slideImages.map((image, index) => (
                    <div key={index} style={{...divStyle, backgroundImage: `url(${image.url})` }}></div>
                  ))}
                </AnimationComponent>
              )}
            </>
          )}
    
          {/* Video preview mode */}
          {mode === "video" && videoUrl && (
            <div className="video-container" style={{ width: '100%', height: '100%' }}>
              <video controls src={videoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          )}
        </div>
        
        {/* Hidden canvas for video generation */}
        <canvas 
          ref={canvasRef} 
          width={360} 
          height={640} 
          style={{ display: "none" }} 
        />
        
        {/* Controls section */}
        {/* <div className="controls" style={{ marginTop: '15px', textAlign: 'center' }}>
          {slideImages.length > 1 && mode === "slideshow" && (
            <button
              onClick={generateVideo}
              disabled={isRecording}
              className={`generate-btn ${isRecording ? "disable" : ""}`}
            >
              {isRecording ? `Processing... ${Math.round(progress)}%` : "Generate Video"}
            </button>
          )} */}

        <div className="controls" style={{ marginTop: '15px', textAlign: 'center' }}>
          {/* Setting controls - only shown in slideshow mode with enough images */}
          {slideImages.length > 1 && mode === "slideshow" && (
            <div className="settings-container" style={{ marginBottom: '15px' }}>
              <div className="duration-control">
                <label htmlFor="transition-duration">Duration:</label>
                <select 
                  id="transition-duration" 
                  value={transitionDuration} 
                  onChange={handleDurationChange}
                  style={{ padding: '5px', borderRadius: '4px' }}
                  disabled={isRecording}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              
              <button
                onClick={generateVideo}
                disabled={isRecording}
                className={`generate-btn ${isRecording ? "disable" : ""}`}
                style={{ padding: '8px 16px', borderRadius: '4px', cursor: isRecording ? 'not-allowed' : 'pointer' }}
              >
                {isRecording ? `Processing... ${Math.round(progress)}%` : "Generate Video"}
              </button>
            </div>
          )}
          
          {/* Download Video button - only shown in video mode when video URL exists */}
          {mode === "video" && videoUrl && (
            <a href={videoUrl} download="slideshow.webm" className="download-btn">
              Download Video
            </a>
          )}
        </div>
      </div>
  );
};