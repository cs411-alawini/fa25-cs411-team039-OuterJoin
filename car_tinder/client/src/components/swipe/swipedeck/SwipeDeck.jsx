import { useState, useEffect } from "react";
import CarCard from "../carcard/CarCard.jsx";
import "./SwipeDeck.css";

export default function SwipeDeck({ cars, onLike, onPass, onDeckEmpty }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [cars]);

  if (!cars || cars.length === 0) {
    return <p>No cars loaded.</p>;
  }

  if (index >= cars.length) {
    if (onDeckEmpty) {
      onDeckEmpty();    
    }
    return <p>Loading more cars...</p>;
  }

  const car = cars[index];

  function goNext() {
    const next = index + 1;

    if (next >= cars.length) {
      if (onDeckEmpty) {
        onDeckEmpty();   
      }
    } else {
      setIndex(next);
    }
  }

  function handleLike() {
    onLike(car.listing_id);
    goNext();
  }

  function handlePass() {
    onPass?.(car.listing_id);
    goNext();
  }

  return (
    <div className="swipedeck-container">
      <CarCard car={car} />

      <div className="swipedeck-buttons">
        <button className="pass-btn" onClick={handlePass}>👎 Pass</button>
        <button className="like-btn" onClick={handleLike}>❤️ Like</button>
      </div>
    </div>
  );
}
