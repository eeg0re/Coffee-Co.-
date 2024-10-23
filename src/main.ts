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

canvas.style.cursor = "none";

const ctx = canvas.getContext("2d"); // get canvas ctx so we can NotifyChange
const cursor = {
    active: false, 
    x: 0,
    y: 0,
};

let stickerMode: boolean = false;

interface Tool{
    preview(context: CanvasRenderingContext2D): void,
}

interface Marker extends Tool {
    lineWidth: number,
}

interface Sticker extends Tool {
    sticker: string,
}

let currentTool:Tool | Marker | Sticker | null = null;
const toolList:Tool[] = [];

const commands: drawableCMD[] = [];      // array of all commands so far
const redoCommands: drawableCMD[] = [];        // array used for redoing
let currentLine: drawableCMD;               // array of points on current line

function createMarker(lineWidth:number): Marker{
    return {
        preview(context: CanvasRenderingContext2D){
            if(context){
                DisplayCommands();
        
                context.beginPath();
                context.strokeStyle = 'rgba(0,0,0,0.5)';
                context.arc(cursor.x, cursor.y, currentLineWidth/2, 0, Math.PI * 2);
                context.lineWidth = currentLineWidth;
                context.stroke();
            }
        },
        lineWidth: lineWidth,
    }
}

function createSticker(sticker:string): Sticker{
    return{
        preview(context: CanvasRenderingContext2D){
            DisplayCommands();
            context.globalAlpha = 0.2;
            context.fillStyle = "#000000";
            context.translate(cursor.x,cursor.y);
            context.rotate(0);
            context.font = `${currentLineWidth * 4}px monospace`;
            context.fillText(sticker, - currentLineWidth / 1.1, currentLineWidth);
            context.globalAlpha = 1;
            context.resetTransform();
        },
        sticker: sticker,
    }
}

toolList.push(createMarker(1));
toolList.push(createMarker(3));
toolList.push(createSticker('🐵'));
toolList.push(createSticker('🖐️'));
toolList.push(createSticker('🌳'));
toolList.push(createSticker('💥'));

// create an interface so we can pass points to the arrays
interface point{
    x: number,
    y: number
}

// make an interface with commands display/drag methods
interface drawableCMD{
    points: point[],
    sticker: string,
    display(context: CanvasRenderingContext2D): void,
    drag(x:number, y:number): void,
    lineWidth: number,
};

// factory function for making drawableLines
function createDrawableLine(initX: number, initY: number, lineWidth: number, sticker: string): drawableCMD{
    if(!stickerMode){
        const points: point[] = [{x: initX, y: initY}];
        return {
            points, 
            lineWidth,
            sticker: '', 
            drag(x:number, y:number){
                points.push({x, y});
                if(ctx){
                    ctx.beginPath();
                    if(currentLine.points.length > 1){
                        const len = currentLine.points.length;
                        ctx.moveTo(currentLine.points[len-2].x, currentLine.points[len - 2].y);
                        ctx.lineTo(cursor.x, cursor.y);
                        ctx.stroke();
                    }
                }
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
    else{
        const points = [{x: initX, y: initY}];
        return {
            points,
            lineWidth, 
            sticker, 
            drag(x: number, y: number){
                if(ctx && currentTool){ // we dont want to check current tool
                    points[0].x = x;
                    points[0].y = y;
                    DisplayCommands();
                    drawSticker(ctx, this.sticker, points[0].x, points[0].y, this.lineWidth);
                }
            },
            display(context: CanvasRenderingContext2D){
                drawSticker(context, this.sticker, points[0].x, points[0].y, this.lineWidth);
            }
        }
    }
}

function drawSticker(ctx: CanvasRenderingContext2D, sticker: string, x: number, y: number, lineWidth: number){
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.font = `${lineWidth * 4}px monospace`;
    ctx.fillText(sticker, x, y);
    ctx.restore();
}

let currentLineWidth = 1; 

// -------------- add event listeners to the canvas --------------------
canvas.addEventListener("mousedown", (event)=>{         
    // if mousedown happens, activate the cursor
    cursor.active = true;
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;

    if(currentTool && "sticker" in currentTool){
        currentLine = createDrawableLine(cursor.x, cursor.y, currentLineWidth, currentTool.sticker);
    }
    else{
        currentLine = createDrawableLine(cursor.x, cursor.y, currentLineWidth, '');
    }

    commands.push(currentLine);
    redoCommands.splice(0, redoCommands.length);
    currentLine.points.push({x: cursor.x, y: cursor.y});
    NotifyChange(); 

});

canvas.addEventListener("mousemove", (event)=>{
    if(cursor.active){
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;
        currentLine.drag(cursor.x, cursor.y);
    }
    else{
        cursor.x = event.offsetX;
        cursor.y = event.offsetY;

        const toolMovedEvent = new CustomEvent("tool moved", {
            detail: {
                x: cursor.x,
                y: cursor.y,
            }
        });
        canvas.dispatchEvent(toolMovedEvent);
    }
});

canvas.addEventListener("mouseup", ()=>{ 
    cursor.active = false; 
    NotifyChange();
});

canvas.addEventListener("drawing changed", ()=>{
    DisplayCommands();
})

canvas.addEventListener("tool moved", ()=>{
    if(ctx && currentTool){
        currentTool.preview(ctx);
    }
});
// --------------------------------------------------------------------

function NotifyChange(){
    const drawingChanged = new CustomEvent<{empty: boolean}>('drawing changed', {
        detail: {
            empty: commands.length === 0 // ensure there are new commands to be drawn
        }
    });
    canvas.dispatchEvent(drawingChanged);
}

// function that calls the display method
function DisplayCommands(){
    if(ctx){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const command of commands){
            command.display(ctx);
        }
    }
}

interface button{
    label: string,
    color: string,
    type: string, 
    callback: Function,
};

let htmlButtons:HTMLButtonElement[] = [];

const buttons:button[] = [
    {
        label: "Thin marker",
        color: "#29415c",
        type: "tool",
        callback: () => {
            currentLineWidth = 1;
            currentTool = toolList[0];
            checkText(htmlButtons, "Thin marker");
            stickerMode = false;
        },
    },
    {
        label: "Thick marker",
        color: '',
        type: "tool",
        callback: () => {
            currentLineWidth = 3;
            currentTool = toolList[1];
            checkText(htmlButtons, "Thick marker");
            stickerMode = false;
        }
    },
    {
        label: "Clear",
        color: '',
        type: "functional",
        callback: () => {
            if(ctx){
                commands.splice(0, commands.length);
                NotifyChange();
            }
        }
    },
    {
        label: "Undo",
        color: '',
        type: "functional",
        callback: () => {
            if(commands && commands.length > 0){  // check if there's actually anything to undo
                const newestLine: drawableCMD | undefined = commands.pop();  
                if(newestLine){                         // make sure we have a line to undo
                    redoCommands.push(newestLine);
                    NotifyChange();
                }
            }
        }
    },
    {
        label: "Redo",
        color: '',
        type: "functional",
        callback: () => {
            if(redoCommands && redoCommands.length > 0){
                const newRedoLine: drawableCMD | undefined = redoCommands.pop();
                if(newRedoLine){
                    commands.push(newRedoLine);
                    NotifyChange();
                }
            }
        }
    },
    {
        label: "🐵",
        color: "",
        type: "tool",
        callback: () => {
            currentLineWidth = 5;
            currentTool = toolList[2];
            checkText(htmlButtons, "🐵");
            stickerMode = true;
        },
    },
    {
        label: "🖐️",
        color: "",
        type: "tool",
        callback: () => {
            currentLineWidth = 5;
            currentTool = toolList[3];
            checkText(htmlButtons, "🖐️");
            stickerMode = true;
        },
    },
    {
        label: "🌳",
        color: "",
        type: "tool",
        callback: () => {
            currentLineWidth = 5;
            currentTool = toolList[4];
            checkText(htmlButtons, "🌳");
            stickerMode = true;
        },
    },
    {
        label: "💥",
        color: "",
        type: "tool",
        callback: () => {
            currentLineWidth = 5;
            currentTool = toolList[5];
            checkText(htmlButtons, "💥");
            stickerMode = true;
        },
    },
];

// use this function to turn buttons from one color to another
function checkText(buttons: HTMLButtonElement[], text: string){
    for(let i = 0; i < htmlButtons.length; i++){
        if(buttons[i].innerHTML == text){
            buttons[i].style.backgroundColor = "#29415c"
        }
        else{
           buttons[i].style.backgroundColor = '';
        }
    }
}

function MakeButtonsFromList(buttons: button[]): HTMLButtonElement[]{
    let lastButtonType: string = '';
    const buttonsList: HTMLButtonElement[] = [];
    for (let i = 0; i < buttons.length; i++){
        if(buttons[i].type != lastButtonType){
            app.append(document.createElement("br"));
        }
        lastButtonType = buttons[i].type;
        buttonsList.push(MakeButton(buttons[i]));
    }
    return buttonsList;
}

function MakeButton(buttn: button): HTMLButtonElement{
    const thisButton = document.createElement("button");
    thisButton.innerHTML = buttn.label;
    app.append(thisButton);
    thisButton.style.backgroundColor = buttn.color;
    thisButton.addEventListener('click', () => { buttn.callback() } );
    return thisButton;
}

htmlButtons = MakeButtonsFromList(buttons);
app.append(document.createElement("br"));

const addMore = document.createElement("button");
addMore.innerHTML = "Add your own sticker";
app.append(addMore);

