import { useState } from "react";
import CarCard from "../carcard/CarCard.jsx";
import "./SwipeDeck.css";

export default function SwipeDeck({ cars, onLike, onPass }) {
  const [index, setIndex] = useState(0);

  // Safeguards
  if (!cars || cars.length === 0) {
    return <p>No cars loaded.</p>;
  }
  if (index >= cars.length) {
    return <p>No more cars available. Try another search!</p>;
  }

  const car = cars[index];

  function handleLike() {
    onLike(car.listing_id);
    setIndex((prev) => prev + 1);
  }

  function handlePass() {
    onPass?.(car.listing_id);
    setIndex((prev) => prev + 1);
  }

  return (
    <div className="swipedeck-container">
      {/* This displays the car details correctly */}
      <CarCard car={car} />

      <div className="swipedeck-buttons">
        <button className="pass-btn" onClick={handlePass}>👎 Pass</button>
        <button className="like-btn" onClick={handleLike}>❤️ Like</button>
      </div>
    </div>
  );
}
