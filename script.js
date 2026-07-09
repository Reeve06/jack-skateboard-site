// --- 3D SKATEBOARD CONTINUOUS FLIP ---
let currentRotation = 0;
window.flipSkateboard = function() {
    currentRotation += 180;
    document.getElementById('skateboard-nav').style.transform = `rotateX(${currentRotation}deg)`;
}

// --- FIREBASE MOCK (Awaiting User Config) ---
/* 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  // YOUR CONFIG HERE
};

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
*/

// --- LEAFLET MAP (Only runs on map.html) ---
if (document.getElementById('map')) {
  const map = L.map('map', { zoomControl: false }).setView([55.9533, -3.1883], 12);
  L.control.zoom({ position: 'topright' }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(map);

  const colours = {
    "Skatepark": "#FF007A",
    "Street": "#00F0FF",
    "Bowl": "#FF8A00",
    "DIY": "#8B5CF6",
    "Hidden Gem": "#DFFF00",
    "Mega Ramp": "#ff3333",
    "Stair Set": "#33ff33",
    "Handrail": "#ffff33"
  };

  // Replace this with Firebase fetch later!
  let allSpots = [
    { _id: '1', title: 'Concrete Wave', category: 'Skatepark', description: 'Smooth transitions and deep bowls.', latitude: 55.9533, longitude: -3.1883, averageRating: 4.8, ratingCount: 12 },
    { _id: '2', title: 'City Ledges', category: 'Street', description: 'Perfect wax, minimal security.', latitude: 55.9450, longitude: -3.2000, averageRating: 4.5, ratingCount: 8 },
    { _id: '3', title: 'Underbridge DIY', category: 'DIY', description: 'Rough but fun, bring a broom.', latitude: 55.9600, longitude: -3.1700, averageRating: 4.2, ratingCount: 5 }
  ];
  let markers = [];
  let tempMarker = null;
  let selectedLatLng = null;
  let addMode = false;
  let currentFilter = "All";

  function iconFor(category) {
    const colour = colours[category] || "#FFFFFF";
    return L.divIcon({
      className: "skate-marker-icon",
      html: `<div class="wheel-marker" style="--marker-color: ${colour}"><div class="wheel-core"></div></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  }

  function drawSpots() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    const visibleSpots = currentFilter === "All"
      ? allSpots
      : allSpots.filter(spot => spot.category === currentFilter);

    visibleSpots.forEach(spot => {
      const marker = L.marker([spot.latitude, spot.longitude], { icon: iconFor(spot.category) })
        .addTo(map)
        .bindPopup(`
          <div class="custom-popup" style="font-family: 'Inter', sans-serif; min-width: 200px;">
            <h3 style="font-family: 'Outfit', sans-serif; margin: 0 0 8px 0; color: ${colours[spot.category]}">${spot.title}</h3>
            <div style="font-size: 12px; margin-bottom: 8px;">🛹 ${spot.category}</div>
            <div style="color: #ccc; font-size: 14px; margin-bottom: 12px;">${spot.description}</div>
            <div>⭐ ${spot.averageRating} / 5</div>
          </div>
        `, { closeButton: true });
      markers.push(marker);
    });
  }

  // Map Filters
  document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.getAttribute('data-filter');
      drawSpots();
    });
  });

  // Add Spot Mode
  document.getElementById('addModeBtn').addEventListener('click', () => {
    addMode = true;
    document.getElementById("hint").classList.remove('hidden');
    map.getContainer().style.cursor = "crosshair";
  });

  map.on("click", function(e) {
    if (!addMode) return;
    selectedLatLng = e.latlng;
    addMode = false;
    map.getContainer().style.cursor = "";

    if (tempMarker) map.removeLayer(tempMarker);
    tempMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    
    document.getElementById("add-spot-modal").classList.remove('hidden');
    document.getElementById("hint").classList.add('hidden');
  });

  window.submitSpot = function() {
    const title = document.getElementById("spotTitle").value;
    const category = document.getElementById("spotCategory").value;
    const description = document.getElementById("spotDescription").value;

    if (!title || !selectedLatLng) return alert("Spot name is required.");

    // MOCK: In the future, this will be addDoc(collection(db, "spots"), {...})
    allSpots.push({
      _id: Date.now().toString(),
      title, category, description,
      latitude: selectedLatLng.lat, longitude: selectedLatLng.lng,
      averageRating: 0, ratingCount: 0
    });

    drawSpots();
    cancelSpot();
  }

  window.cancelSpot = function() {
    document.getElementById("add-spot-modal").classList.add('hidden');
    document.getElementById("spotTitle").value = "";
    document.getElementById("spotDescription").value = "";
    if (tempMarker) { map.removeLayer(tempMarker); tempMarker = null; }
    selectedLatLng = null;
    addMode = false;
    map.getContainer().style.cursor = "";
  }

  // Initial draw
  setTimeout(drawSpots, 500);
}
