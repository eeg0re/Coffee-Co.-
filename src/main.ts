import "./style.css";

let drinkCounter: number = 0;

interface Upgrade {
  name: string;
  label: string;
  type: string;
  cost: number;
  rate: number;
  description: string;
  callback: () => void;
}

const shop = document.querySelector<HTMLDivElement>("#shop")!;

const upgrades: Upgrade[] = [
  {
    name: "Upgrade 1",
    label: "Upgrade 1",
    type: "auto",
    cost: 10,
    rate: 1,
    description: "Automatically brews 1 drink per second",
    callback: () => {
      console.log("Upgrade 1 purchased");
    },
  },
  {
    name: "Upgrade 2",
    label: "Upgrade 2",
    type: "increase",
    cost: 20,
    rate: -1,
    description:
      "Increases the value of each drink you brew. Drinks now sell for an extra $0.10",
    callback: () => {
      console.log("Upgrade 2 purchased");
    },
  },
  {
    name: "Upgrade 3",
    label: "Upgrade 3",
    type: "auto",
    cost: 30,
    rate: 3,
    description: "Automatically brews 3 drinks per second",
    callback: () => {
      console.log("Upgrade 3 purchased");
    },
  },
];

function CreateUpgrades(upgradeList: Upgrade[]) {
  upgradeList.forEach((upgrade) => {
    const button = CreateUpradeButton(upgrade);
    shop.append(button);
  });
}

function CreateUpradeButton(upgrade: Upgrade) {
  const button = document.createElement("button");
  button.innerHTML = upgrade.label;
  button.addEventListener("click", () => {
    upgrade.callback();
  });
  return button;
}

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
app.append(mainClicker);
// Add some sauce to it
mainClicker.style.width = "200px";
mainClicker.style.height = "200px";
mainClicker.style.fontSize = "60px";
mainClicker.style.borderRadius = "50%";
mainClicker.style.boxShadow = "5px 5px 15px rgba(0, 0, 0, 0.3)";
mainClicker.addEventListener("click", IncreaseClickCounter);

function main() {
  CreateUpgrades(upgrades);
}

main();
