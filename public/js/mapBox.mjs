const locations = JSON.parse(document.getElementById('map').dataset.locations);
mapboxgl.accessToken =
    'pk.eyJ1Ijoia2hvYWRhbmciLCJhIjoiY2xncXF0MWtvMTQ5eDNlcDl0YW9qYWdvdSJ9.WbMvnU51FN6MAi4gAmUqtw';
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
    })
        .setLngLat(loc.coordinates)
        .addTo(map);
    new mapboxgl.Popup({
        offset: 30,
    })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description} </p>`)
        .addTo(map);
    bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
    padding: {
        top: 200,
        bottom: 200,
        left: 100,
        right: 100,
    },
});
