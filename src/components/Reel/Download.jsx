import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import coreURL from "@ffmpeg/core?url";
import wasmURL from "@ffmpeg/core/wasm?url";

export const VideoDownloader = ({slideRef, slideImages}) => {

    const [isProcessing, setIsProcessing] =useState(false);
    const [loaded, setLoaded] = useState(false);
    const ffmpegRef = useRef(new FFmpeg());

    const handleDownloadVideo = async () =>{
        setIsProcessing(true);

        try{
          const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
          const ffmpeg = ffmpegRef.current;
        //  const ffmpeg = new FFmpeg();
        await ffmpeg.load({
          // coreURL: `${baseURL}/ffmpeg-core.js`,
          // wasmURL: `${baseURL}/ffmpeg-core.wasm`,
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            workerURL: await toBlobURL(
              `${baseURL}/ffmpeg-core.worker.js`,
              "text/javascript"
            ),
        });

        setLoaded(true);

        onMount(() =>{
          loadFFmpeg();
        })

        if(!ffmpeg.loaded()){
            await ffmpeg.load();
        }

        console.log("ffmpeg loaded successfully....");

        const frames = [];

        // capture frames of the slideshow
        for( let i=0; i<slideImages.length; i++){
            const slideElement = slideRef.current;

            if(slideElement){
                const canvas = await html2canvas(slideElement);
                const dataURL = canvas.toDataURL("image/png");
                frames.push({dataURL, fileName: `image${i}.png`});
            }
        }

        // Save frames as files in FFmpeg
        for (const frame of frames) {
            // ffmpeg.FS("writeFile", frame.fileName, await fetchFile(frame.dataURL));
            const fileData = dataURLToUint8Array(frame.dataURL);
            ffmpeg.FS("writeFile", frame.fileName, fileData);
        }

        console.log("frames: ", frames);

        // Stitch frames into a video
        await ffmpeg.run(
            "-framerate",
            "1", // 1 frame per second
            "-i",
            "frame%d.png",
            "-c:v",
            "libx264",
            // "mpeg4",
            "-pix_fmt",
            "yuv420p",
            "output.mp4"
        );

        // Read the output video file
        const outputFile = await ffmpeg.FS("readFile","output.mp4");
        const videoURL = URL.createObjectURL(
            new Blob([outputFile.buffer], {type: "video/mp4"})
        );

    // console.log("output: ",outputFile);

    // Create a downloadable blob URL
    // const videoURL = await toBlobURL("video/mp4", outputFile);

        // const data = ffmpeg.FS("readFile", "output.mp4");
        // const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));

        // Download the video
        const a = document.createElement("a");
        a.href = videoURL;
        a.download = "slideshow.mp4";
        a.click();
        }
        catch(error){
            console.error("error occure", error);
        }finally{
            setIsProcessing(false);
        }
    }

    // Helper to convert dataURL to Uint8Array
  function dataURLToUint8Array(dataURL) {
    const binaryString = atob(dataURL.split(",")[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

    // return <button onClick={handleDownloadVideo}>Download video</button>;
    return (
        <>
        <button onClick={handleDownloadVideo} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Download Video"}
        </button>
        </>
    );
}

