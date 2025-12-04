import "./CarCard.css";

export default function CarCard({ car }) {
  return (
    <div className="carcard">
      <img
        src={car.image_url}
        alt=""
        className="carcard-image"
      />

      <h2 className="carcard-title">
        {car.year} {car.make} {car.model}
      </h2>

      <p className="carcard-price">
        {car.price
          ? `$${Number(car.price).toLocaleString()}`
          : "Price N/A"}
      </p>
    </div>
  );
}
