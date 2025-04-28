import React, { useRef, useState, useEffect } from "react";

const FrameLineDrawer = ({ frameURL, onLineDrawn }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!frameURL) return;

    const img = new Image();
    img.src = frameURL;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
    };

    imageRef.current = img;
  }, [frameURL]);

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x, y, canvas };
};

const drawFancyLine = (ctx, start, end) => {
  // --- Draw black border line ---
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 6; // Border thickness
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  // --- Draw white inner line ---
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2; // Inner line thickness
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  // --- Draw start point with black border ---
  // Outer black circle (border)
  ctx.beginPath();
  ctx.arc(start.x, start.y, 7, 0, 2 * Math.PI);
  ctx.fillStyle = "black";
  ctx.fill();

  // Inner red circle
  ctx.beginPath();
  ctx.arc(start.x, start.y, 5, 0, 2 * Math.PI);
  ctx.fillStyle = "red";
  ctx.fill();

  // --- Draw end point with black border ---
  // Outer black circle (border)
  ctx.beginPath();
  ctx.arc(end.x, end.y, 7, 0, 2 * Math.PI);
  ctx.fillStyle = "black";
  ctx.fill();

  // Inner blue circle
  ctx.beginPath();
  ctx.arc(end.x, end.y, 5, 0, 2 * Math.PI);
  ctx.fillStyle = "blue";
  ctx.fill();
};


  const handleCanvasClick = (e) => {
    const { x, y, canvas } = getCanvasCoordinates(e);

    if (!startPoint) {
      // 1st click
      setStartPoint({ x, y });
      setEndPoint(null);
      setIsDrawing(true);
    } else if (!endPoint) {
      // 2nd click
      setEndPoint({ x, y });
      setIsDrawing(false);

      const normalizedStart = {
        x: startPoint.x / canvas.width,
        y: startPoint.y / canvas.height,
      };
      const normalizedEnd = {
        x: x / canvas.width,
        y: y / canvas.height,
      };

      console.log("Normalized Start:", normalizedStart);
      console.log("Normalized End:", normalizedEnd);

      onLineDrawn(normalizedStart, normalizedEnd);

      redrawCanvas();
      const ctx = canvas.getContext("2d");

      // Now you can use your fancy draw here
      drawFancyLine(ctx, startPoint, { x, y });
    } else {
      // 3rd click → reset and start new line
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0);

      setStartPoint({ x, y });
      setEndPoint(null);
      setIsDrawing(true);
    }
  }; 


  const handleMouseMove = (e) => {
    if (!isDrawing || !startPoint) return;

    const { x, y, canvas } = getCanvasCoordinates(e);
    const ctx = canvas.getContext("2d");

    // const rect = canvas.getBoundingClientRect();
    // const scaleX = canvas.width / rect.width;
    // const scaleY = canvas.height / rect.height;
    // const x = (e.clientX - rect.left) * scaleX;
    // const y = (e.clientY - rect.top) * scaleY; 

    // Redraw image
    redrawCanvas();

    // Draw dynamic line
    drawFancyLine(ctx, startPoint, {x, y})
    // ctx.beginPath();
    // ctx.moveTo(startPoint.x, startPoint.y);
    // ctx.lineTo(x, y);
    // ctx.strokeStyle = "red";
    // ctx.lineWidth = 2;
    // ctx.stroke();
  };

  const redrawCanvas = () => {
    if (!imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);
  };

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        style={{ border: "2px solid black", cursor: "crosshair", width: "100%", height: "auto" }}
      />
    </div>
  );
};

export default FrameLineDrawer;
