import { useEffect } from "react";
import { useMap } from "react-leaflet";


function MapMover({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (zoom?.animated) {
        map.flyTo(center, zoom.level, { duration: 1.5 });
    }
  }, [center, zoom, map]);

  return null;
}

export default MapMover;