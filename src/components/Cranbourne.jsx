import React from "react";
import { Logic } from "./Logic";
import cranbourneLogo from '../assets/pictures/cranbourneLogo.png'

export const Cranbourne = () => {
    return (
        <>
        <div className="header">
            <h1>Times Cranbourne</h1>
        </div>
        <Logic
            type="Cranbourne"
            logo={cranbourneLogo}
            defaultText="TIMES CRANBOURNE"
        />
        </>
    );
}