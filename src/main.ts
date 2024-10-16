import "./style.css";

const APP_NAME = "My Art App";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;


// add an app header
const header = document.createElement("h1");
header.innerHTML = "Digital Doodler";
app.append(header);

// add a canvas
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.append(canvas);

const context = canvas.getContext("2d");// get canvas context so we can draw
const cursor = {
    active: false, 
    x: 0,
    y: 0,
};

// -------------- add event listeners to the canvas --------------------
canvas.addEventListener("mousedown", (event)=>{         // if mousedown happens, activate the cursor
    cursor.active = true;
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
});

canvas.addEventListener("mousemove", (event)=>{
    if(cursor.active && context){
        context.beginPath();
        context.moveTo(cursor.x, cursor.y);
        context.lineTo(event.offsetX, event.offsetY);
        context.stroke();
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
    }
});

canvas.addEventListener("mouseup", ()=>{ cursor.active = false; });
// --------------------------------------------------------------------

// add a button for clearing the page
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
app.append(clearButton);
clearButton.addEventListener("click", ()=>{
    if(context){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
});