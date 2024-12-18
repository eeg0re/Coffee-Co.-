import "./style.css";

const GAME_NAME = "Coffee Co.";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = GAME_NAME;

const header = document.createElement("h3");
header.innerHTML = GAME_NAME;
app.append(header);

const mainClicker = document.createElement("button");
mainClicker.innerHTML = "Click me!";
app.append(mainClicker);

// Add some sauce to it
mainClicker.style.width = "200px";
mainClicker.style.height = "200px";
mainClicker.style.fontSize = "60px";
mainClicker.style.borderRadius = "50%";
mainClicker.style.boxShadow = "5px 5px 15px rgba(0, 0, 0, 0.3)";
mainClicker.addEventListener("click", IncreaseClickCounter);

let drinkCounter: number = 0;

function IncreaseClickCounter() {
  drinkCounter++;
  mainClicker.innerHTML = `☕️ ${drinkCounter}`;
}
