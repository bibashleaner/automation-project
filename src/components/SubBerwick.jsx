import React from "react";
import { Link } from "react-router-dom";
import timesLogo from '../assets/pictures/timesLogo.png'
import '../assets/css/subberwick.css'

export const SubBerwick = () =>{
    return (
        <>
        <div className="subberwick-container">
            <h1>Choose </h1>
            <div className="button-container">
                <Link className="image-button" to='/image'>Image</Link>
                <Link className="reels-button" to='/reels'>Reels</Link>
            </div>               
        </div>
        </>
    );
}