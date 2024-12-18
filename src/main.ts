import "./style.css";

let drinkCounter: number = 0;

function UpdateInventory() {
  inventory.innerHTML = `Drinks Brewed: ${drinkCounter}`;
}

function IncreaseClickCounter() {
  drinkCounter++;
  UpdateInventory();
}

const GAME_NAME = "Coffee Co.";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = GAME_NAME;

const header = document.createElement("h3");
header.innerHTML = GAME_NAME;
app.append(header);

// portion of the UI that displays the inventory
const inventory = document.querySelector<HTMLDivElement>("#inventory")!;
inventory.innerHTML = "Drinks Brewed: 0";

// our main button for brewing coffee
const mainClicker = document.createElement("button");
mainClicker.innerHTML = "☕️";
app.appendChild(mainClicker);
// Add some sauce to it
mainClicker.style.width = "200px";
mainClicker.style.height = "200px";
mainClicker.style.fontSize = "60px";
mainClicker.style.borderRadius = "50%";
mainClicker.style.boxShadow = "5px 5px 15px rgba(0, 0, 0, 0.3)";
mainClicker.addEventListener("click", IncreaseClickCounter);
