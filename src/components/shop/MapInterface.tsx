import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Loader2, MapPin } from "lucide-react";

// Modern Marker Fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  pos: [number, number];
  setPos: (pos: [number, number]) => void;
  onAddressSelect: (data: any) => void;
}

export default function MapInterface({ pos, setPos, onAddressSelect }: MapProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper: Detailed address parsing optimized for Indian addresses (Sectors, Blocks)
  const formatDetailedAddress = (addr: any) => {
    const building = addr.building || addr.house_number || addr.amenity || addr.office || "";
    const street = addr.road || addr.pedestrian || addr.path || "";
    // Priority for "suburb" which usually contains Sector/Block info in Noida/Delhi
    const sector = addr.suburb || addr.neighbourhood || addr.city_district || "";
    const city = addr.city || addr.town || addr.village || "";

    const parts = [building, street, sector, city].filter(Boolean);
    return parts.join(", ");
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in`
          );
          const data: any = await res.json();
          setSuggestions(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const selectLocation = (item: any) => {
    const newPos: [number, number] = [parseFloat(item.lat), parseFloat(item.lon)];
    setPos(newPos);
    setSuggestions([]);
    setQuery("");
    onAddressSelect({
      address: formatDetailedAddress(item.address),
      city: item.address?.city || item.address?.town || item.address?.village || "",
      postalCode: item.address?.postcode || ""
    });
  };

  function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => { map.setView(center, 17); }, [center, map]); // Increased zoom for detail
    return null;
  }

  function MapEvents() {
    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;
        setPos([lat, lng]);
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`);
        const data: any = await res.json();
        onAddressSelect({
          address: formatDetailedAddress(data.address),
          city: data.address?.city || data.address?.town || "",
          postalCode: data.address?.postcode || ""
        });
      },
    });
    return <Marker position={pos} />;
  }

  return (
    <div className="relative h-full w-full">
      {/* Dark Theme Search UI */}
      <div className="absolute left-4 right-4 top-4 z-[1000]">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#1a1a1a]/90 p-3 shadow-2xl backdrop-blur-xl transition-all focus-within:border-gold/50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-gold" /> : <Search className="h-4 w-4 text-gray-400" />}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location (e.g. Sector 49, Noida)..."
            className="flex-1 bg-transparent text-sm outline-none text-white placeholder:text-gray-500"
          />
        </div>
        {suggestions.length > 0 && (
          <div className="mt-2 rounded-2xl border border-white/10 bg-[#1a1a1a]/95 shadow-2xl overflow-hidden backdrop-blur-xl">
            {suggestions.map((item, i) => (
              <button key={i} type="button" onClick={() => selectLocation(item)} className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs hover:bg-gold/20 transition-colors border-b border-white/5 last:border-0 text-gray-200">
                <MapPin className="h-3 w-3 shrink-0 text-gold" />
                <span className="truncate">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <MapContainer center={pos} zoom={13} style={{ height: "100%", width: "100%", background: "#242424" }} zoomControl={false}>
        {/* Google Maps Dark Mode Style Tiles */}
        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapUpdater center={pos} />
        <MapEvents />
      </MapContainer>
    </div>
  );
}