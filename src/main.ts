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

const ctx = canvas.getContext("2d");// get canvas ctx so we can draw
const cursor = {
    active: false, 
    x: 0,
    y: 0,
};

const lines: drawableLine[] = [];      // array of all lines so far
const redoLines: drawableLine[] = [];        // array used for redoing
let currentLine: drawableLine;               // array of points on current line

// create an interface so we can pass points to the arrays
interface point{
    x: number,
    y: number
}

// make an interface with lines display/drag methods
interface drawableLine{
    points: point[],
    display(context: CanvasRenderingContext2D): void;
    drag(x:number, y:number): void;
}

// factory function for making drawableLines
function createDrawableLine(initX: number, initY: number): drawableLine{
    const points: point[] = [{x: initX, y: initY}];

    return {
        points, 

        drag(x:number, y:number){
            points.push({x, y});
        },
        
        display(context: CanvasRenderingContext2D){
            if(this.points.length > 1){
                context.beginPath();
                const firstPoint:point = this.points[0];
                context.moveTo(firstPoint.x, firstPoint.y);
                for (const point of this.points){
                    context.lineTo(point.x, point.y);
                }
                context.stroke();
            }
            
        }
    }
}

// -------------- add event listeners to the canvas --------------------
canvas.addEventListener("mousedown", (event)=>{         // if mousedown happens, activate the cursor
    cursor.active = true;
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
    
    currentLine = createDrawableLine(cursor.x, cursor.y);

    lines.push(currentLine);
    redoLines.splice(0, redoLines.length);
    currentLine.points.push({x: cursor.x, y: cursor.y});
    draw(); 

});

canvas.addEventListener("mousemove", (event)=>{
    if(cursor.active && ctx){
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
        currentLine.points.push({x: cursor.x, y: cursor.y});

        draw();
    }
});

canvas.addEventListener("mouseup", ()=>{ 
    cursor.active = false; 
    draw();
});

canvas.addEventListener("drawing changed", ()=>{
    redraw();
})

// --------------------------------------------------------------------

// our function that dispatches the listener for new drawings
function draw(){
    const drawingChanged = new CustomEvent<{empty: boolean}>('drawing changed', {
        detail: {
            empty: lines.length === 0 // ensure there are new lines to be drawn
        }
    });
    canvas.dispatchEvent(drawingChanged);
}

// our redraw function
function redraw(){
    if(ctx){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const line of lines){
            line.display(ctx);
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
    if(ctx){
        lines.splice(0, lines.length);
        draw();
    }
});

// add a button for undoing 
const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
app.append(undoButton);

undoButton.addEventListener("click", ()=> {
    if(lines && lines.length > 0){  // check if there's actually anything to undo
        const newestLine: drawableLine | undefined = lines.pop();  
        if(newestLine){                         // make sure we have a line to undo
            redoLines.push(newestLine);
            draw();
        }
    }
});

// add a button for redoing 
const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
app.append(redoButton);

redoButton.addEventListener("click", ()=> {
    if(redoLines && redoLines.length > 0){
        const newRedoLine: drawableLine | undefined = redoLines.pop();
        if(newRedoLine){
            lines.push(newRedoLine);
            draw();
        }
    }
});
