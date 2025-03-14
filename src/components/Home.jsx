import React from "react";
import { Link } from "react-router-dom";
import '../assets/css/home.css';

export const Home = () =>{

    return (
        <>
            <div className="home-button">
            <h3 className="head">Choose Restaurant</h3>
                <Link className="berwick-button" to='/berwick'>Berwick</Link>
                <Link className="cranbourne-button" to='/cranbourne'>Cranbourne</Link>
            </div>
        </>
    );
}
