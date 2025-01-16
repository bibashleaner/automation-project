export const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });
  
  export async function getCroppedImg(
    imageSrc,
    pixelCrop,
    flip = { horizontal: false, vertical: false }
  ) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    if (!ctx) {
      return null;
    }
  
    // Set canvas size to match the cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
  
    // Apply flip transformations if needed
    ctx.translate(
      flip.horizontal ? canvas.width : 0,
      flip.vertical ? canvas.height : 0
    );
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  
    // Draw the image within the crop area
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
  
    return new Promise((resolve, reject) => {
      canvas.toBlob((file) => {
        if(file){
            resolve(URL.createObjectURL(file));
            console.log(file);
        }else{
            reject(new Error("canvas is empty"));
            console.log(Error);
        }
      }, "image/jpeg", 0.5); //image format and image quality
    });
  }
  