import React, { useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Polygon, 
  CircleMarker, 
  useMapEvents, 
  Popup,
  AttributionControl // Импортируем контрол атрибуции
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Modal from '../Modal/Modal';
import './MapComponent.css';

// НАСТРОЙКИ
const ZOOM_THRESHOLD = 15; // Зум, на котором дома превращаются в точки
const MARKER_RADIUS = 8;   // Размер точки

// Вспомогательная функция: Найти центр полигона
const getPolygonCenter = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return [0, 0];
  let latSum = 0;
  let lngSum = 0;
  coordinates.forEach(coord => {
    latSum += coord[0];
    lngSum += coord[1];
  });
  return [latSum / coordinates.length, lngSum / coordinates.length];
};

// Контроллер событий карты
const MapController = ({ onMapClick, onZoomChange }) => {
  useMapEvents({
    click: (e) => onMapClick(e.latlng),
    zoomend: (e) => onZoomChange(e.target.getZoom())
  });
  return null;
};

const MapComponent = () => {
  const [mapObjects, setMapObjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempObjectData, setTempObjectData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(17);

  const center = [55.751574, 37.573856];

  const getColorByRating = (rating) => {
    switch (String(rating)) {
      case '5': return '#2ecc71'; // Зеленый
      case '4': return '#a6e22e';
      case '3': return '#f1c40f';
      case '2': return '#e67e22';
      case '1': return '#e74c3c'; // Красный
      default: return '#3498db';
    }
  };

  const fetchBuildingContour = async (lat, lon) => {
    const query = `
      [out:json];
      is_in(${lat},${lon})->.a;
      way(pivot.a)["building"];
      out geom;
    `;
    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.elements && data.elements.length > 0) {
        const element = data.elements[0];
        return element.geometry.map(p => [p.lat, p.lon]);
      }
      return null;
    } catch (error) {
      console.error("Ошибка поиска здания:", error);
      return null;
    }
  };

  const handleMapClick = async (latlng) => {
    if (isLoading) return;
    setIsLoading(true);

    let address = "Координаты: " + latlng.lat.toFixed(4) + ", " + latlng.lng.toFixed(4);
    try {
      const addrResp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
      const addrData = await addrResp.json();
      if (addrData.display_name) {
        address = addrData.display_name.split(',').slice(0, 2).join(','); 
      }
    } catch (e) { console.log(e); }

    const polygonCoords = await fetchBuildingContour(latlng.lat, latlng.lng);
    setIsLoading(false);

    if (polygonCoords) {
      setTempObjectData({ type: 'polygon', geometry: polygonCoords, address });
    } else {
      setTempObjectData({ type: 'point', geometry: [latlng.lat, latlng.lng], address });
    }
    setIsModalOpen(true);
  };

  const handleSaveObject = (formData) => {
    if (!tempObjectData) return;
    const newObject = {
      id: Date.now(),
      type: tempObjectData.type,
      geometry: tempObjectData.geometry,
      rating: formData.rating,
      name: formData.name,
      description: formData.description
    };
    setMapObjects((prev) => [...prev, newObject]);
    setTempObjectData(null);
  };

  return (
    <>
      <div className="map-container" style={{ height: '600px', width: '100%', position: 'relative' }}>
        {isLoading && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, background: 'white', padding: '5px 10px', borderRadius: '4px' }}>
            Поиск объекта...
          </div>
        )}

        <MapContainer 
          center={center} 
          zoom={currentZoom} 
          style={{ height: '100%', width: '100%' }}
          attributionControl={false} // 1. Отключаем стандартный контрол с флагом
        >
          {/* 2. Добавляем контрол БЕЗ префикса (флага) */}
          <AttributionControl position="bottomright" prefix={false} />

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController onMapClick={handleMapClick} onZoomChange={setCurrentZoom} />

          {mapObjects.map((obj) => {
            // Логика отображения (Точка или Полигон)
            const showAsPoint = obj.type === 'point' || (obj.type === 'polygon' && currentZoom < ZOOM_THRESHOLD);

            if (showAsPoint) {
              const center = obj.type === 'point' ? obj.geometry : getPolygonCenter(obj.geometry);
              
              return (
                <CircleMarker
                  key={obj.id}
                  center={center}
                  radius={MARKER_RADIUS}
                  pathOptions={{
                    color: 'white',
                    weight: 1,
                    fillColor: getColorByRating(obj.rating),
                    fillOpacity: 1
                  }}
                >
                  <Popup>
                    <strong>{obj.name}</strong><br />Оценка: {obj.rating}/5<br />{obj.description}
                  </Popup>
                </CircleMarker>
              );
            } else {
              return (
                <Polygon
                  key={obj.id}
                  positions={obj.geometry}
                  pathOptions={{
                    color: getColorByRating(obj.rating),
                    fillColor: getColorByRating(obj.rating),
                    fillOpacity: 0.6,
                    weight: 2
                  }}
                >
                  <Popup>
                    <strong>{obj.name}</strong><br />Оценка: {obj.rating}/5<br />{obj.description}
                  </Popup>
                </Polygon>
              );
            }
          })}

          {/* Предпросмотр текущего создания */}
          {isModalOpen && tempObjectData && (
             tempObjectData.type === 'polygon' ? (
               <Polygon positions={tempObjectData.geometry} pathOptions={{ color: 'blue', fillOpacity: 0.3, dashArray: '5, 5' }} />
             ) : (
               <CircleMarker center={tempObjectData.geometry} radius={MARKER_RADIUS} pathOptions={{ color: 'blue', fillOpacity: 0.5 }} />
             )
          )}
        </MapContainer>
      </div>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setTempObjectData(null); }}
        type="add-marker"
        title="Оценить объект"
        data={tempObjectData}
        onSubmit={handleSaveObject}
      />
    </>
  );
};

export default MapComponent;