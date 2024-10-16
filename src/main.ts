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
