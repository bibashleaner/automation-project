import React from "react";
import { Link } from "react-router-dom";
import { Logic } from "./Logic";
import cranbourneLogo from '../assets/pictures/cranbourneLogo.png'
import '../assets/css/subberwick.css'

export const Subcranbourne = () =>{
    return (
        <>
        <Logic
            type="cranimage"
            logo={cranbourneLogo}
        />
        </>
    );
}
