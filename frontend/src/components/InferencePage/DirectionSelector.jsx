import { useState } from "react";

const directions = [
  { label: "UP_LEFT", symbol: "↖" },
  { label: "UP", symbol: "↑" },
  { label: "UP_RIGHT", symbol: "↗" },
  { label: "LEFT", symbol: "←" },
  { label: "CENTER", symbol: "" }, // empty center
  { label: "RIGHT", symbol: "→" },
  { label: "DOWN_LEFT", symbol: "↙" },
  { label: "DOWN", symbol: "↓" },
  { label: "DOWN_RIGHT", symbol: "↘" },
];

export default function DirectionSelector({selectedDirection, onSelect }) {

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 60px)", gap: "10px" }}>
      {directions.map((dir) => (
        <button
          key={dir.label}
          onClick={() => {onSelect(dir.label); console.log(dir.label)}}
          style={{
            fontSize: "24px",
            padding: "10px",
            backgroundColor: selectedDirection === dir.label ? "lightblue" : "white",
            border: "1px solid gray",
            visibility: dir.label === "CENTER" ? "hidden" : "visible",
          }}
        >
          {dir.symbol}
        </button>
      ))}
    </div>
  );
}
