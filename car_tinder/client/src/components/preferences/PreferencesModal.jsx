import { useState, useEffect } from "react";
import "./PreferencesModal.css";

export default function PreferencesModal({ userId, onClose, onSave, initialPreferences }) {
  const [preferences, setPreferences] = useState({
    min_price: "",
    max_price: "",
    min_year: "",
  });

  useEffect(() => {
    if (initialPreferences) {
      setPreferences({
        min_price: initialPreferences.min_price || "",
        max_price: initialPreferences.max_price || "",
        min_year: initialPreferences.min_year || "",
      });
    }
  }, [initialPreferences]);

  function handleChange(e) {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...preferences, user_id: userId });
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Set Preferences</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Min Price:</label>
            <input
              type="number"
              name="min_price"
              value={preferences.min_price}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Max Price:</label>
            <input
              type="number"
              name="max_price"
              value={preferences.max_price}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Min Year:</label>
            <input
              type="number"
              name="min_year"
              value={preferences.min_year}
              onChange={handleChange}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
