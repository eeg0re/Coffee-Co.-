import "./style.css";

let drinkCounter: number = 0;
let brewRate: number = 1;
const _sellPrice: number = 1;
const COST_MULTIPLIER = 1.15;

interface Upgrade {
  name: string;
  label: string;
  type: string;
  cost: number;
  rate: number;
  description: string;
  amountBought: number;
  callback: () => void;
}

const shop = document.querySelector<HTMLDivElement>("#shop")!;
//const shop = document.createElement("div");

const upgrades: Upgrade[] = [
  {
    name: "Upgrade 1",
    label: "Upgrade 1",
    type: "auto",
    cost: 10,
    rate: 1,
    description: "Automatically brews 1 drink per second",
    amountBought: 0,
    callback: () => {
      ActivateUpgrade(upgradeButtons[0], upgrades[0]);
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
    amountBought: 0,
    callback: () => {
      ActivateUpgrade(upgradeButtons[1], upgrades[1]);
    },
  },
  {
    name: "Upgrade 3",
    label: "Upgrade 3",
    type: "auto",
    cost: 30,
    rate: 3,
    description: "Automatically brews 3 drinks per second",
    amountBought: 0,
    callback: () => {
      ActivateUpgrade(upgradeButtons[2], upgrades[2]);
    },
  },
];

function MakeToolTip(button: HTMLButtonElement, buttonInfo: Upgrade) {
  const tooltip = document.createElement("div");
  tooltip.textContent =
    `Cost: ${buttonInfo.cost.toFixed(1)}. Rate: ${
      buttonInfo.rate.toFixed(1)
    }. ` +
    buttonInfo.description;
  tooltip.style.position = "absolute";
  tooltip.style.backgroundColor = "black";
  tooltip.style.padding = "5px";
  tooltip.style.borderRadius = "4px";
  tooltip.style.display = "none"; // tooltip will be hidden initially
  app.append(tooltip);

  // add event listeners to the existing button so we can display this tooltip
  button.addEventListener("mouseenter", () => {
    tooltip.style.display = "block";
  }); // show on hover
  button.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
  }); // hide when we leave
  button.addEventListener("mousemove", (event) => {
    // position the tooltip next to the cursor
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;
  });

  return tooltip;
}

const upgradeButtons: HTMLButtonElement[] = [];

function CreateUpradeButton(upgrade: Upgrade) {
  const button = document.createElement("button");
  button.innerHTML = upgrade.label;
  MakeToolTip(button, upgrade);

  button.addEventListener("click", () => {
    upgrade.callback();
  });
  return button;
}

function CreateUpgrades(upgradeList: Upgrade[]) {
  upgradeList.forEach((upgrade) => {
    const button = CreateUpradeButton(upgrade);
    upgradeButtons.push(button);
    shop.append(button);
  });
}

function UpdateInventory() {
  const drinkStr: string = drinkCounter.toFixed(1);
  inventory.innerHTML = `Drinks Brewed: ` + drinkStr;
}

function IncreaseClickCounter() {
  drinkCounter++;
  UpdateInventory();
}

function ActivateUpgrade(button: HTMLButtonElement, buttonInfo: Upgrade) {
  if (CheckFunds(button, buttonInfo)) {
    console.log(buttonInfo.label + " purchased");
    drinkCounter -= buttonInfo.cost;
    buttonInfo.amountBought += 1;
    buttonInfo.cost *= COST_MULTIPLIER; // increase the cost by a little bit
    brewRate += buttonInfo.rate;
    MakeToolTip(button, buttonInfo);
  }
  if (buttonInfo.amountBought >= 1) {
    requestAnimationFrame(function (timestamp: number) {
      step(timestamp, buttonInfo);
    });
  }
}

function CheckFunds(button: HTMLButtonElement, buttonInfo: Upgrade): boolean {
  const cost = buttonInfo.cost;
  if (drinkCounter >= cost) {
    button.disabled = false;
    return true;
  } else {
    button.disabled = true;
    return false;
  }
}
function CheckAllUpgradePrices() {
  for (let i = 0; i < upgradeButtons.length; i++) {
    CheckFunds(upgradeButtons[i], upgrades[i]);
  }
}

// step is the recursive function called by requestAnimationFrame, allows us to do our time math
let startTime: number; // time program starts
let prevTime: number = 0; // used to record previous timestamps (for math)
function step(timestamp: number, buttonInfo: Upgrade) {
  if (startTime === undefined) {
    startTime = timestamp;
    prevTime = startTime;
  }
  const elapsed = timestamp - prevTime;
  prevTime = timestamp;

  // time is in milliseconds, so we divide elapsed by 1000 to get the correct unit
  const increment = (elapsed / 1000) * brewRate; // multiply the increment by this item's growth rate and the number of that item
  drinkCounter += increment;
  UpdateInventory();

  requestAnimationFrame(function (timestamp: number) {
    // recursive call to requestAnimationFrame
    step(timestamp, buttonInfo); // use anonymous function call to allow step to take parameters
  });
}

const GAME_NAME = "Coffee Co.";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = GAME_NAME;

const header = document.createElement("h3");
header.innerHTML = GAME_NAME;
app.append(header);

// portion of the UI that displays the inventory
//const inventory = document.querySelector<HTMLDivElement>("#inventory")!;
const inventory = document.createElement("div");
inventory.innerHTML = "Drinks Brewed: 0";
app.append(inventory);
app.append(document.createElement("br"));

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

const sellButton = document.createElement("button");
sellButton.innerHTML = "Sell Drinks";
app.append(sellButton);
sellButton.style.borderRadius = "50%";
sellButton.style.width = "100px";
sellButton.style.height = "100px";

app.append(document.createElement("br"));
//app.append(shop);

function StartGame() {
  CreateUpgrades(upgrades);
  setInterval(CheckAllUpgradePrices, 0);
}

StartGame();
