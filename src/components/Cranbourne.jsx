import React from "react";
import { Logic } from "./Logic";
import cranbourneLogo from '../assets/pictures/cranbourneLogo.png'

export const Cranbourne = () => {
    return (
        <>
        <h1>Welcome to Times Cranbourne</h1>
        <Logic
            type="Cranbourne"
            logo={cranbourneLogo}
            defaultText="TIMES CRANBOURNE"
        />
        </>
    );
}