import "./style.css";

let drinkCounter: number = 0;
let playerMoney: number = 0;
let brewRate: number = 0;
let sellPrice: number = 1;
const COST_MULTIPLIER = 1.15;

interface Upgrade {
  label: string;
  type: string;
  cost: number;
  amount: number;
  description: string;
  amountBought: number;
  callback: () => void;
}

const shop = document.querySelector<HTMLDivElement>("#shop")!;

const upgrades: Upgrade[] = [
  {
    label: "French Roast Coffee",
    type: "increase",
    cost: 25,
    amount: 0.10,
    description:
      "Higher quality coffee beans. Drinks now sell for an extra $0.10.",
    amountBought: 0,
    callback: () => {
      ActivateUpgrade(upgradeButtons[0], upgrades[0]);
    },
  },
  {
    label: "Cashier",
    type: "auto",
    cost: 100,
    amount: 0.25,
    description:
      "Hire a cashier to help with some of your responsibilities. Automatically brews a cup of coffee every 4 seconds.",
    amountBought: 0,
    callback: () => {
      ActivateUpgrade(upgradeButtons[1], upgrades[1]);
    },
  },
  {
    label: "Tea",
    type: "increase",
    cost: 200,
    amount: 0.75,
    description:
      "Offer complementary tea to your customers. Drinks now sell for an extra $0.75.",
    amountBought: 0,
    callback: () => {
      ActivateUpgrade(upgradeButtons[2], upgrades[2]);
    },
  },
  {
    label: "Barista",
    type: "auto",
    cost: 500,
    amount: 1.5,
    description:
      "Hire a trained barista to brew coffee. Brews 1.5 cups of coffee every second.",
    amountBought: 0,
    callback: () => {
      ActivateUpgrade(upgradeButtons[3], upgrades[3]);
    },
  },
];

function createInventoryUI(): HTMLDivElement {
  const inventory = document.createElement("div");
  inventory.innerHTML = "Drinks Brewed: 0";
  app.append(inventory);
  const wallet = document.createElement("div");
  inventory.appendChild(wallet);
  wallet.innerHTML = `Money: $${playerMoney.toFixed(2)}`;
  app.append(document.createElement("br"));
  return inventory;
}

function UpdateToolTip(
  button: HTMLButtonElement,
  tooltip: HTMLDivElement,
) {
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
}

function MakeToolTip(button: HTMLButtonElement, buttonInfo: Upgrade) {
  const tooltip = document.createElement("div");
  const upgradeCost = buttonInfo.cost.toFixed(1);
  const tooltipText = buttonInfo.description +
    ` (Times bought: ${buttonInfo.amountBought})`;

  tooltip.textContent = buttonInfo.type === "auto"
    ? `$${upgradeCost}. Rate: ${buttonInfo.amount.toFixed(2)}. ` + tooltipText
    : `$${upgradeCost}. ` + tooltipText;

  tooltip.style.position = "absolute";
  tooltip.style.backgroundColor = "black";
  tooltip.style.padding = "5px";
  tooltip.style.borderRadius = "4px";
  tooltip.style.display = "none"; // tooltip will be hidden initially
  app.append(tooltip);
  UpdateToolTip(button, tooltip);

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
  inventory.innerHTML = `Drinks Brewed: ` + drinkCounter.toFixed(1);
  wallet.innerHTML = `Money: $` + playerMoney.toFixed(2);
  inventory.append(wallet);
}

function IncreaseDrinkCount() {
  drinkCounter++;
  UpdateInventory();
}

function ActivateUpgrade(button: HTMLButtonElement, buttonInfo: Upgrade): void {
  if (CheckFunds(button, buttonInfo)) {
    buttonInfo.amountBought += 1;
    playerMoney -= buttonInfo.cost;
    buttonInfo.cost *= COST_MULTIPLIER;

    switch (buttonInfo.type) {
      // use switch statement in case we add other types of upgrades in the future
      case "auto":
        brewRate += buttonInfo.amount;
        if (buttonInfo.amountBought >= 1) {
          requestAnimationFrame(function (timestamp: number) {
            step(timestamp, buttonInfo);
          });
        }
        break;

      case "increase":
        sellPrice += buttonInfo.amount;
        break;

      default:
        break;
    }

    MakeToolTip(button, buttonInfo);
    UpdateInventory();
  }
}

function CheckFunds(button: HTMLButtonElement, buttonInfo: Upgrade): boolean {
  const cost = buttonInfo.cost;
  if (playerMoney >= cost) {
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
  const increment = (elapsed / 1000) * brewRate; // multiply the increment by this item's growth amount and the number of that item
  drinkCounter += increment;
  UpdateInventory();

  requestAnimationFrame(function (timestamp: number) {
    // recursive call to requestAnimationFrame
    step(timestamp, buttonInfo); // use anonymous function call to allow step to take parameters
  });
}

function CreateMainButtons(div: HTMLDivElement) {
  const mainButton = document.createElement("button");
  mainButton.innerHTML = "☕️";
  div.append(mainButton);
  mainButton.style.width = "200px";
  mainButton.style.height = "200px";
  mainButton.style.fontSize = "60px";
  mainButton.style.borderRadius = "50%";
  mainButton.style.boxShadow = "5px 5px 15px rgba(0, 0, 0, 0.3)";
  mainButton.addEventListener("click", IncreaseDrinkCount);

  const sellButton = document.createElement("button");
  sellButton.innerHTML = "Sell";
  div.append(sellButton);
  sellButton.style.borderRadius = "50%";
  sellButton.style.width = "75px";
  sellButton.style.height = "75px";
  sellButton.addEventListener("click", () => {
    playerMoney += drinkCounter * sellPrice;
    drinkCounter = 0;
    UpdateInventory();
  });

  const shopButton = document.createElement("button");
  shopButton.innerHTML = "Shop";
  div.append(shopButton);
  shopButton.style.borderRadius = "50%";
  shopButton.style.width = "75px";
  shopButton.style.height = "75px";
  shopButton.addEventListener("click", () => {
    shop.style.display = shop.style.display === "grid" ? "none" : "grid";
  });
}

function StartGame() {
  CreateUpgrades(upgrades);
  setInterval(CheckAllUpgradePrices, 0);
  CreateMainButtons(uiDiv);
}

const GAME_NAME = "Coffee Co.";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = GAME_NAME;

const header = document.createElement("h3");
header.innerHTML = GAME_NAME;
app.append(header);

const inventory = createInventoryUI();
const wallet = inventory.querySelector<HTMLDivElement>("div")!;

const uiDiv = document.createElement("div");
app.append(uiDiv);

app.append(document.createElement("br"));

StartGame();
