import { useEffect, useState } from "react";
import MapSection from "../components/MapSection";

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  latitude: number;
  longitude: number;
}

const MapPages: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/properties/")
      .then(res => res.json())
      .then(data => setProperties(data))
      .catch(err => console.error("Error fetching properties:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        🏠 Available Homes on Map
      </h2>
      <MapSection properties={properties} />
    </div>
  );
};

export default MapPages;
