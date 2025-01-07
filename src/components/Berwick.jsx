import React, { useState } from "react";
import '../assets/css/berwick.css';

export const Berwick = () =>{
    const [file, setFile] = useState();
    function handleChange(e){
        setFile(URL.createObjectURL(e.targe.files[0]));
    }
    

    return (
        <>
        <h2>Add Image</h2>
        <input type="file" onChange={handleChange} />
        <img src={file} />
        </>
    );
}