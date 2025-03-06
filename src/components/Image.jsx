import React from "react";
import { Logic } from "./Logic";
import timesLogo from '../assets/pictures/timesLogo.png'
// import { useLocation } from "react-router-dom";
import '../assets/css/berwick.css'

export const Image = () => {

    return (
        <>
        <div className="header">
            <h1>Times Berwick</h1>
        </div>
        <Logic
            type="Image"
            logo={timesLogo}
            defaultText="TIMES BERWICK"
        />
        </>
    );
}



