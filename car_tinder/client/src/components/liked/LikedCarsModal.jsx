import CarCard from "../swipe/carcard/CarCard";
import "./LikedCarsModal.css";

export default function LikedCarsModal({ open, onClose, cars, onUnlike, onDelete }) {
  if (!open) return null;

  return (
    <div className="likes-overlay">
      <div className="likes-modal">
        <button className="likes-close" onClick={onClose}>✖</button>
        <h2 className="likes-title">Liked Cars</h2>

        <div className="likes-scroll">
          <div className="likes-grid">
            {cars && cars.length > 0 ? (
              cars.map((car) => (
                <div key={car.listing_id} className="liked-car-wrapper">
                  <CarCard car={car} />

                  <div className="liked-actions">
                    <button className="unlike-button" onClick={() => onUnlike(car.listing_id)}>
                      Unlike
                    </button>
                    <button className="delete-button" onClick={() => onDelete(car.listing_id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No liked cars yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
