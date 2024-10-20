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
    display(context: CanvasRenderingContext2D): void,
    drag(x:number, y:number): void,
    lineWidth: number,
};

// factory function for making drawableLines
function createDrawableLine(initX: number, initY: number, lineWidth: number): drawableLine{
    const points: point[] = [{x: initX, y: initY}];

    return {
        points, 
        lineWidth, 
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
                context.lineWidth = this.lineWidth; 
                context.stroke();
            }
            
        }
    }
}

let currentLineWidth = 1; 

// -------------- add event listeners to the canvas --------------------
canvas.addEventListener("mousedown", (event)=>{         
    // if mousedown happens, activate the cursor
    cursor.active = true;
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;

    currentLine = createDrawableLine(cursor.x, cursor.y, currentLineWidth);

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

        ctx.beginPath();
        if(currentLine.points.length > 1){
            const len = currentLine.points.length;
            ctx.moveTo(currentLine.points[len-2].x, currentLine.points[len - 2].y);
            ctx.lineTo(cursor.x, cursor.y);
            ctx.stroke();
        }
    }
});

canvas.addEventListener("mouseup", ()=>{ 
    cursor.active = false; 
    draw();
});

canvas.addEventListener("drawing changed", ()=>{
    DisplayLines();
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

// function that calls the display method
function DisplayLines(){
    if(ctx){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const line of lines){
            line.display(ctx);
        }
    }
}

interface button{
    label: string,
    color: string,
    type: string, 
    callback: Function,
};

const buttons:button[] = [
    {
        label: "Thin marker",
        color: "#29415c",
        type: "tool",
        callback: () => {
            currentLineWidth = 1;
        },
    },
    {
        label: "Thick marker",
        color: '',
        type: "tool",
        callback: () => {
            currentLineWidth = 3;
        }
    },
    {
        label: "Clear",
        color: '',
        type: "functional",
        callback: () => {
            if(ctx){
                lines.splice(0, lines.length);
                draw();
            }
        }
    },
    {
        label: "Undo",
        color: '',
        type: "functional",
        callback: () => {
            if(lines && lines.length > 0){  // check if there's actually anything to undo
                const newestLine: drawableLine | undefined = lines.pop();  
                if(newestLine){                         // make sure we have a line to undo
                    redoLines.push(newestLine);
                    draw();
                }
            }
        }
    },
    {
        label: "Redo",
        color: '',
        type: "functional",
        callback: () => {
            if(redoLines && redoLines.length > 0){
                const newRedoLine: drawableLine | undefined = redoLines.pop();
                if(newRedoLine){
                    lines.push(newRedoLine);
                    draw();
                }
            }
        }
    }
];

function MakeButtonsFromList(buttons: button[]){
    let lastButtonType: string = '';
    for (let i = 0; i < buttons.length; i++){
        if(buttons[i].type != lastButtonType){
            app.append(document.createElement("br"));
        }
        lastButtonType = buttons[i].type;
        MakeButton(buttons[i]);
    }
}

function MakeButton(buttn: button){
    const thisButton = document.createElement("button");
    thisButton.innerHTML = buttn.label;
    app.append(thisButton);
    thisButton.style.backgroundColor = buttn.color;
    thisButton.addEventListener('click', () => { buttn.callback() } );
}

MakeButtonsFromList(buttons);
