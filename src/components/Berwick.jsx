import React from "react";
import { Logic } from "./Logic";
import timesLogo from '../assets/pictures/timesLogo.png'

export const Berwick = () => {
    return (
        <>
        <h1>Welcome to Times Berwick</h1>
        <Logic
            type="Berwick"
            logo={timesLogo}
            defaultText="TIMES BERWICK"
            // defaultText="The quick"
        />
        </>
    );
}