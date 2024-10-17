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

// create our array of mouse points
const mousePoints:point[][] = [];      // array of all lines so far
const redoLines:point[][] = [];        // array used for redoing
let currentLine:point[];               // array of points on current line
// create an interface so we can pass points to the arrays
interface point{
    x: number,
    y: number
}

// -------------- add event listeners to the canvas --------------------
canvas.addEventListener("mousedown", (event)=>{         // if mousedown happens, activate the cursor
    cursor.active = true;
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;

    currentLine = [];
    mousePoints.push(currentLine);
    redoLines.splice(0, redoLines.length);
    currentLine.push({x: cursor.x, y: cursor.y});
    draw(); 

});

canvas.addEventListener("mousemove", (event)=>{
    if(cursor.active && context){
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
        currentLine.push({x: cursor.x, y: cursor.y});

        draw();
    }
});

canvas.addEventListener("mouseup", ()=>{ 
    cursor.active = false; 
    currentLine = [];

    draw();
});

canvas.addEventListener("drawing changed", ()=>{
    redraw();
})

// --------------------------------------------------------------------

function draw(){
    const drawingChanged = new CustomEvent<{empty: boolean}>('drawing changed', {
        detail: {
            empty: mousePoints.length === 0
        }
    });
    canvas.dispatchEvent(drawingChanged);
}

// our redraw function
function redraw(){
    if(context){
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (const line of mousePoints){
            if(line.length > 1){
                context.beginPath();
                const {x, y} = line[0];
                context.moveTo(x, y);
                for(const {x, y} of line){
                    context.lineTo(x, y);
                }
                context.stroke();
            }
        }
    }
}

// add a break in between our canvas and buttons
document.body.append(document.createElement("br"));

// add a button for clearing the page
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
app.append(clearButton);
clearButton.addEventListener("click", ()=>{
    if(context){
        mousePoints.splice(0, mousePoints.length);
        redraw();
    }
});
