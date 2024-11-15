interface Tool {
  preview(context: CanvasRenderingContext2D): void;
}

interface Marker extends Tool {
  lineWidth: number;
}

interface Sticker extends Tool {
  sticker: string;
}

// create an interface so we can pass points to the arrays
interface point {
  x: number;
  y: number;
}

// make an interface with commands display/drag methods
interface drawableCMD {
  points: point[];
  sticker: string;
  display(context: CanvasRenderingContext2D): void;
  drag(x: number, y: number): void;
  lineWidth: number;
  sliderVal: string | number;
}

interface button {
  label: string;
  color: string;
  type: string;
  callback: () => void;
}
