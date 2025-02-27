console.log("Debug - API Key in showPageMap.js:", typeof maptilerApiKey, maptilerApiKey);


maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.BRIGHT,
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
    attributionControl: false  
});

new maptilersdk.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new maptilersdk.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map)

    function removeAttribution() {
        const attributionElements = document.querySelectorAll('.maptiler-ctrl-attrib, .mapboxgl-ctrl-attrib, .mapboxgl-ctrl-bottom-right');
        
        if (attributionElements.length > 0) {
            attributionElements.forEach(el => el.remove());
            console.log("✅ Removed MapTiler attribution button.");
        } else {
            console.log("❌ Attribution button not found, retrying...");
            setTimeout(removeAttribution, 500); // Retry every 500ms
        }
    }
    
    // Wait for the map to load before trying to remove the button
    map.on('load', () => {
        console.log("🗺️ Map Loaded. Attempting to remove attribution button...");
        removeAttribution();
    });
    