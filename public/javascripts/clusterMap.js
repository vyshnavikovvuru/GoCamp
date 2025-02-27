maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
    container: 'cluster-map',
    style: maptilersdk.MapStyle.BRIGHT,
    center: [-103.59, 40.66],
    zoom: 4,
    dragPan: true,
    scrollZoom: true,
    touchZoomRotate: true,
    interactive: true ,
    attributionControl: false 
});

map.setMaxBounds(null);
map.setRenderWorldCopies(true);

document.getElementById('cluster-map').style.pointerEvents = 'auto';
document.getElementById('cluster-map').style.touchAction = 'auto';



// map.addControl(new maptilersdk.NavigationControl(), 'top-left');  // Enables zoom & pan buttons
// map.addControl(new maptilersdk.GeolocateControl({ positionOptions: { enableHighAccuracy: true } })); // Adds geolocation button
// map.addControl(new maptilersdk.FullscreenControl());

 

setTimeout(() => {
    console.log("✅ Manually enabling dragging...");
    map.dragPan.enable();
    map.scrollZoom.enable();
    map.boxZoom.enable();
map.keyboard.enable();
    map.touchZoomRotate.enable();
    map.doubleClickZoom.enable();
}, 2000); // Wait 2 seconds to ensure MapTiler loads

setTimeout(() => {
    document.querySelectorAll(".mapboxgl-ctrl-attrib, .maptiler-attribution, .mapboxgl-ctrl-logo")
        .forEach(el => el.parentNode.removeChild(el));
    console.log("✅ Forced removal of attribution.");
}, 2000);


map.on('load', function () {
    if (!campgrounds || !Array.isArray(campgrounds)) {
        console.error("❌ Error: Campgrounds data is missing or not an array.");
        return;
    }

    try {
        map.addSource('campgrounds', {
            type: 'geojson',
            data: { type: "FeatureCollection", features: campgrounds },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
        });

        map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'campgrounds',
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': [
                    'step', ['get', 'point_count'], '#00BCD4', 10, '#2196F3', 30, '#3F51B5'
                ],
                'circle-radius': [
                    'step', ['get', 'point_count'], 15, 10, 20, 30, 25
                ]
            }
        });

        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'campgrounds',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            }
        });

        map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'campgrounds',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': '#11b4da',
                'circle-radius': 4,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
            }
        });

        // Inspect a cluster on click
        map.on('click', 'clusters', async (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });

            if (!features.length) return;

            const clusterId = features[0].properties.cluster_id;

            try {
                const zoom = await map.getSource('campgrounds').getClusterExpansionZoom(clusterId);
                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom
                });
            } catch (error) {
                console.error("❌ Error expanding cluster:", error);
            }
        });

        // Open a popup on unclustered points
        map.on('click', 'unclustered-point', function (e) {
            const feature = e.features[0];
            if (!feature || !feature.properties.popUpMarkup) return;

            const coordinates = feature.geometry.coordinates.slice();
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new maptilersdk.Popup()
                .setLngLat(coordinates)
                .setHTML(feature.properties.popUpMarkup)
                .addTo(map);
        });

        map.on('mouseenter', 'clusters', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = '';
        });

        console.log("✅ Campgrounds successfully added to the map.");
    } catch (error) {
        console.error("❌ Error loading map data:", error);
    }
});
