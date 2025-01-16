export const wrapText = (context, text, maxWidth, lineHeight) =>{
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for(let i=1; i<words.length; i++){
        const word = words[i];
        const testLine = `${currentLine} ${word}`;
        const testWidth = context.measureText(testLine).width;

        if(testWidth > maxWidth){
            lines.push(currentLine);
            currentLine = word;
        }else{
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    return lines;
}