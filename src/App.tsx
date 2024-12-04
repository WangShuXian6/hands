import { useState } from "react";
import { HandGestureRecognition } from "./components/HandGestureRecognition";
import { Slider } from "./components/Slider";
import { useHands } from "./hooks/useHands";
import "./App.css";
import Image1 from "./assets/1.jpg";
import Image2 from "./assets/2.jpg";
import Image3 from "./assets/3.jpg";
import Image4 from "./assets/4.jpg";
//import Image5 from "./assets/5.png";

const images = [Image1, Image2, Image3, Image4];

function App() {
  const {
    onPrevious: handlePrevious,
    onNext: handleNext,
    selectedIndex,
  } = useHands({
    selectedItem: 0,
    totalItems: images.length,
  });

  return (
    <div className="wrapper">
      <HandGestureRecognition onPrevious={handlePrevious} onNext={handleNext} />
      <div className="slider-wrapper">
        <Slider selectedItem={selectedIndex} images={images} />
      </div>
    </div>
  );
}

export default App;
