import React from "react";
import { Logic } from "./Logic";
import { SubBerwick } from "./SubBerwick";
import timesLogo from '../assets/pictures/timesLogo.png'
import '../assets/css/berwick.css'

export const Berwick = () => {
    return (
        <>
        <div className="header">
            <h1>Times Berwick</h1>
        </div>
        <SubBerwick />
        </>
    );
}