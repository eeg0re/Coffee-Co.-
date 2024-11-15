import "./style.css";

const APP_NAME = "My Art App";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

// add an app header
const header = document.createElement("h1");
header.innerHTML = "Digital Doodler";
app.append(header);

// add color/rotation slider
const valueSlider = document.createElement("input");
valueSlider.type = "range";
valueSlider.min = "0";
valueSlider.max = "360";
valueSlider.value = "0";
valueSlider.step = "1";
app.append(valueSlider);
valueSlider.addEventListener("input", (event) => {
  const value = (event.target as HTMLInputElement).value;
  if (stickerMode) {
    currentRotation = Number(value);
  } else {
    currentColor = `hsl(${value}, 100%, 50%)`;
    valueSlider.style.background = currentColor;
  }
});
app.append(document.createElement("br"));

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

const bttnColor: string = "#29415c";

let currentColor: string = `hsl(${valueSlider.value}, 100%, 0%)`;
let currentRotation: number = 0;

let currentTool: Tool | Marker | Sticker | null = null;
const toolList: Tool[] = [];

const commands: drawableCMD[] = []; // array of all commands so far
const redoCommands: drawableCMD[] = []; // array used for redoing
let currentLine: drawableCMD; // array of points on current line

//marker widths and stickerEmojis
const MARKERLINEWIDTHS = [2, 5];
const STICKEREMOJIS = ["🐵", "🖐️", "🌳", "💥"];

function createMarker(lineWidth: number): Marker {
  return {
    preview(context: CanvasRenderingContext2D) {
      if (context) {
        DisplayCommands(context);
        context.beginPath();
        context.strokeStyle = "rgba(0,0,0,0.5)";
        context.strokeStyle = currentColor;
        context.arc(cursor.x, cursor.y, currentLineWidth / 2, 0, Math.PI * 2);
        context.lineWidth = currentLineWidth;
        context.stroke();
      }
    },
    lineWidth: lineWidth,
  };
}

function createSticker(sticker: string): Sticker {
  return {
    preview(context: CanvasRenderingContext2D) {
      DisplayCommands(context);
      context.globalAlpha = 0.2;
      context.fillStyle = "#000000";
      context.translate(cursor.x, cursor.y);
      context.rotate(currentRotation * Math.PI / 180);
      context.font = `${currentLineWidth * 4}px monospace`;
      context.fillText(sticker, -currentLineWidth / 1.1, currentLineWidth);
      context.globalAlpha = 1;
      context.resetTransform();
    },
    sticker: sticker,
  };
}

// Loop through the parameters and push tools to the toolList
MARKERLINEWIDTHS.forEach((lineWidth) => {
  toolList.push(createMarker(lineWidth));
});

STICKEREMOJIS.forEach((emoji) => {
  toolList.push(createSticker(emoji));
});

// factory function for making drawableLines
function createDrawableCMD(
  initX: number,
  initY: number,
  lineWidth: number,
  sticker: string,
  slide: string | number,
): drawableCMD {
  if (!stickerMode) {
    const points: point[] = [{ x: initX, y: initY }];
    return {
      points,
      lineWidth,
      sticker: "",
      sliderVal: slide,
      drag(x: number, y: number) {
        points.push({ x, y });
        if (ctx) {
          ctx.beginPath();
          ctx.strokeStyle = String(this.sliderVal);
          if (currentLine.points.length > 1) {
            const len = currentLine.points.length;
            ctx.moveTo(
              currentLine.points[len - 2].x,
              currentLine.points[len - 2].y,
            );
            ctx.lineTo(cursor.x, cursor.y);
            ctx.stroke();
          }
        }
      },
      display(context: CanvasRenderingContext2D) {
        if (this.points.length > 1) {
          context.beginPath();
          context.strokeStyle = String(this.sliderVal);
          const firstPoint: point = this.points[0];
          context.moveTo(firstPoint.x, firstPoint.y);
          for (const point of this.points) {
            context.lineTo(point.x, point.y);
          }
          context.lineWidth = this.lineWidth;
          context.stroke();
        }
      },
    };
  } else {
    const points = [{ x: initX, y: initY }];
    return {
      points,
      lineWidth,
      sticker,
      sliderVal: slide,
      drag(x: number, y: number) {
        if (ctx && currentTool) { // we dont want to check current tool
          points[0].x = x;
          points[0].y = y;
          DisplayCommands(ctx);
          drawSticker(
            ctx,
            this.sticker,
            points[0].x,
            points[0].y,
            this.lineWidth,
            Number(this.sliderVal),
          );
        }
      },
      display(context: CanvasRenderingContext2D) {
        drawSticker(
          context,
          this.sticker,
          points[0].x,
          points[0].y,
          this.lineWidth,
          Number(this.sliderVal),
        );
      },
    };
  }
}

function drawSticker(
  ctx: CanvasRenderingContext2D,
  sticker: string,
  x: number,
  y: number,
  lineWidth: number,
  rotation: number,
) {
  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.translate(x, y);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.font = `${lineWidth * 4}px monospace`;
  ctx.fillText(sticker, 0, 0);
  ctx.restore();
}

let currentLineWidth = MARKERLINEWIDTHS[0];
currentTool = toolList[0];

// -------------- add event listeners to the canvas --------------------
canvas.addEventListener("mousedown", (event) => {
  // if mousedown happens, activate the cursor
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;

  if (currentTool && "sticker" in currentTool) {
    currentLine = createDrawableCMD(
      cursor.x,
      cursor.y,
      currentLineWidth,
      currentTool.sticker,
      currentRotation,
    );
  } else {
    currentLine = createDrawableCMD(
      cursor.x,
      cursor.y,
      currentLineWidth,
      "",
      currentColor,
    );
  }

  commands.push(currentLine);
  redoCommands.splice(0, redoCommands.length);
  currentLine.points.push({ x: cursor.x, y: cursor.y });
  NotifyChange();
});

canvas.addEventListener("mousemove", (event) => {
  if (cursor.active) {
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
    currentLine.drag(cursor.x, cursor.y);
  } else {
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;

    const toolMovedEvent = new CustomEvent("tool moved", {
      detail: {
        x: cursor.x,
        y: cursor.y,
      },
    });
    canvas.dispatchEvent(toolMovedEvent);
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  NotifyChange();
});

canvas.addEventListener("mouseout", () => {
  [cursor.x, cursor.y, cursor.active] = [NaN, NaN, false];
  canvas.dispatchEvent(new Event("tool moved"));
});

canvas.addEventListener("drawing changed", () => {
  if (ctx) {
    DisplayCommands(ctx);
  }
});

canvas.addEventListener("tool moved", () => {
  if (ctx && currentTool) {
    currentTool.preview(ctx);
  }
});
// --------------------------------------------------------------------

function NotifyChange() {
  const drawingChanged = new CustomEvent<{ empty: boolean }>(
    "drawing changed",
    {
      detail: {
        empty: commands.length === 0, // ensure there are new commands to be drawn
      },
    },
  );
  canvas.dispatchEvent(drawingChanged);
}

// function that calls the display method
function DisplayCommands(context: CanvasRenderingContext2D) {
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (const command of commands) {
      command.display(context);
    }
  }
}

//for the tool markers and sets them up with the buttons
function createToolCallback(
  lineWidth: number,
  tool: Tool,
  mode: boolean,
  displayText: string,
): () => void {
  return () => {
    currentLineWidth = lineWidth;
    currentTool = tool;
    checkText(htmlButtons, displayText);
    stickerMode = mode;
  };
}

let htmlButtons: HTMLButtonElement[] = [];

const buttons: button[] = [
  {
    label: "o",
    color: bttnColor,
    type: "tool",
    callback: createToolCallback(
      MARKERLINEWIDTHS[0],
      toolList[0],
      false,
      "Thin marker",
    ),
  },
  {
    label: "O",
    color: "",
    type: "tool",
    callback: createToolCallback(
      MARKERLINEWIDTHS[1],
      toolList[1],
      false,
      "Thick marker",
    ),
  },
  {
    label: "Clear",
    color: "",
    type: "functional",
    callback: () => {
      if (ctx) {
        commands.splice(0, commands.length);
        NotifyChange();
      }
    },
  },
  {
    label: "Undo",
    color: "",
    type: "functional",
    callback: () => {
      if (commands && commands.length > 0) { // check if there's actually anything to undo
        const newestLine: drawableCMD | undefined = commands.pop();
        if (newestLine) { // make sure we have a line to undo
          redoCommands.push(newestLine);
          NotifyChange();
        }
      }
    },
  },
  {
    label: "Redo",
    color: "",
    type: "functional",
    callback: () => {
      if (redoCommands && redoCommands.length > 0) {
        const newRedoLine: drawableCMD | undefined = redoCommands.pop();
        if (newRedoLine) {
          commands.push(newRedoLine);
          NotifyChange();
        }
      }
    },
  },
  {
    label: "🐵",
    color: "",
    type: "tool",
    callback: createToolCallback(7, toolList[2], true, "🐵"),
  },
  {
    label: "🖐️",
    color: "",
    type: "tool",
    callback: createToolCallback(7, toolList[3], true, "🖐️"),
  },
  {
    label: "🌳",
    color: "",
    type: "tool",
    callback: createToolCallback(7, toolList[4], true, "🌳"),
  },
  {
    label: "💥",
    color: "",
    type: "tool",
    callback: createToolCallback(7, toolList[5], true, "💥"),
  },
  {
    label: "Add your own sticker",
    color: "",
    type: "functional",
    callback: () => {
      const newSticker = prompt("type an emoji here: ");
      if (newSticker && newSticker != "") {
        const toolNum: number = toolList.length;
        toolList.push(createSticker(newSticker));
        MakeButton({
          label: newSticker,
          color: "",
          type: "tool",
          callback: createToolCallback(5, toolList[toolNum], true, ""),
        });
      }
    },
  },
  {
    label: "export",
    color: "",
    type: "functional",
    callback: () => {
      const anchor = document.createElement("a");
      const tempCanvas = document.createElement("canvas");
      anchor.append(tempCanvas);
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCanvas.width = 1024;
        tempCanvas.height = 1024;
        tempCtx.scale(4, 4);
        DisplayCommands(tempCtx);
        anchor.href = tempCanvas.toDataURL("image/png");
        anchor.download = "sketchpad.png";
        anchor.click();
      }
    },
  },
];

// use this function to turn buttons from one color to another
function checkText(buttons: HTMLButtonElement[], text: string) {
  for (let i = 0; i < htmlButtons.length; i++) {
    if (buttons[i].innerHTML == text) {
      buttons[i].style.backgroundColor = bttnColor;
    } else {
      buttons[i].style.backgroundColor = "";
    }
  }
}

function MakeButtonsFromList(buttons: button[]): HTMLButtonElement[] {
  let lastButtonType: string = "";
  const buttonsList: HTMLButtonElement[] = [];
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].type != lastButtonType) {
      app.append(document.createElement("br"));
    }
    lastButtonType = buttons[i].type;
    buttonsList.push(MakeButton(buttons[i]));
  }
  return buttonsList;
}

function MakeButton(buttn: button): HTMLButtonElement {
  const thisButton = document.createElement("button");
  thisButton.innerHTML = buttn.label;
  app.append(thisButton);
  thisButton.style.backgroundColor = buttn.color;
  thisButton.addEventListener("click", () => {
    buttn.callback();
  });
  return thisButton;
}

htmlButtons = MakeButtonsFromList(buttons);
