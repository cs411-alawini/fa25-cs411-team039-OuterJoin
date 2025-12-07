import "./CarCard.css";

export default function CarCard({ car }) {
  return (
    <div className="carcard">
      <h2 className="carcard-title">
        {car.year} {car.make} {car.model}
      </h2>

      <img
        src={car.image_url}
        alt=""
        className="carcard-image"
      />

      <p className="carcard-price">
        Price:{" "}
        {car.price
          ? `$${Number(car.price).toLocaleString()}`
          : "Price N/A"}
      </p>
      
      <p className="carcard-mpg">
        MPG:{" "}
        {car.mpg
          ? `${Number(car.mpg).toLocaleString()}`
          : "MPG N/A"}
      </p>
    </div>
  );
}
