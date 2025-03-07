import React from "react";
import { Link } from "react-router-dom";
import { Logic } from "./Logic";
import cranbourneLogo from '../assets/pictures/cranbourneLogo.png'
import cranOpenTime from '../assets/pictures/cranOpenTime.png'
import '../assets/css/subberwick.css'

export const Subcranbourne = () =>{
    return (
        <>
        <Logic
            type="cranimage"
            logo={cranbourneLogo}
            secondLogo={cranOpenTime}
            defaultText="OPENING HOUR - 7:30 AM"
        />
        </>
    );
}
