<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Demo: Get started with the Isochrone API</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- Mapbox GL JS -->
    <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v2.9.2/mapbox-gl.js"></script>
    <link
      href="https://api.tiles.mapbox.com/mapbox-gl-js/v2.9.2/mapbox-gl.css"
      rel="stylesheet"
    />
    <!-- Mapbox Assembly -->
    <link
      href="https://api.mapbox.com/mapbox-assembly/v1.3.0/assembly.min.css"
      rel="stylesheet"
    />
    <script src="https://api.mapbox.com/mapbox-assembly/v1.3.0/assembly.js"></script>
    <style>
      body {
        margin: 0;
        padding: 0;
      }

      #map {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100%;
      }
    </style>
  </head>

  <body>
    <div id="map"></div>

    <div class="absolute fl my24 mx24 py24 px24 bg-gray-faint round">
      <form id="params">
        <h4 class="txt-m txt-bold mb6">Choose a travel mode:</h4>
        <div class="mb12 mr12 toggle-group align-center">
          <label class="toggle-container">
            <input name="profile" type="radio" value="walking" />
            <div class="toggle toggle--active-null toggle--null">Walking</div>
          </label>
          <label class="toggle-container">
            <input name="profile" type="radio" value="cycling" checked />
            <div class="toggle toggle--active-null toggle--null">Cycling</div>
          </label>
          <label class="toggle-container">
            <input name="profile" type="radio" value="driving" />
            <div class="toggle toggle--active-null toggle--null">Driving</div>
          </label>
        </div>
        <h4 class="txt-m txt-bold mb6">Choose a maximum duration:</h4>
        <div class="mb12 mr12 toggle-group align-center">
          <label class="toggle-container">
            <input name="duration" type="radio" value="10" checked />
            <div class="toggle toggle--active-null toggle--null">10 min</div>
          </label>
          <label class="toggle-container">
            <input name="duration" type="radio" value="20" />
            <div class="toggle toggle--active-null toggle--null">20 min</div>
          </label>
          <label class="toggle-container">
            <input name="duration" type="radio" value="30" />
            <div class="toggle toggle--active-null toggle--null">30 min</div>
          </label>
        </div>
      </form>
    </div>

    <script>
      mapboxgl.accessToken = 'pk.eyJ1IjoiZHJpc3NkcmRveGkiLCJhIjoiY2xhbGVudjByMDFpeTN2a2R1N3o4ejFieCJ9.fScK3YiEEJcw0Dyuoscnew';

      const map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v12', // stylesheet
        center: [-6.841970, 34.021089], // starting position [lng, lat]
        zoom: 11.5 // starting zoom
      });

      // Target the params form in the HTML
      const params = document.getElementById('params');

      // Correcting for arabic text direction for street names
      mapboxgl.setRTLTextPlugin(
	    'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
	    null,
	    true // Lazy load the plugin
      );

      // Create variables to use in getIso()
      const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
      const lon = -6.841970;
      const lat = 34.021089;
      let profile = 'cycling';
      let minutes = 10;

      // Set up a marker that you can use to show the query's coordinates
      const marker = new mapboxgl.Marker({
        'color': '#314ccd'
      });

      // Create a LngLat object to use in the marker initialization
      // https://docs.mapbox.com/mapbox-gl-js/api/#lnglat
      const lngLat = {
        lon: lon,
        lat: lat
      };

      // Create a function that sets up the Isochrone API query then makes a fetch call
      async function getIso() {
        const query = await fetch(
          `${urlBase}${profile}/${lon},${lat}?contours_minutes=${minutes}&polygons=true&access_token=${mapboxgl.accessToken}`,
          { method: 'GET' }
        );
        const data = await query.json();
        // Set the 'iso' source's data to what's returned by the API query
        map.getSource('iso').setData(data);
      }

      // When a user changes the value of profile or duration by clicking a button, change the parameter's value and make the API query again
      params.addEventListener('change', (event) => {
        if (event.target.name === 'profile') {
          profile = event.target.value;
        } else if (event.target.name === 'duration') {
          minutes = event.target.value;
        }
        getIso();
      });

      map.on('load', () => {
        // When the map loads, add the source and layer
        map.addSource('iso', {
          type: 'geojson',
          data: {
            'type': 'FeatureCollection',
            'features': []
          }
        });

        map.addLayer(
          {
            'id': 'isoLayer',
            'type': 'fill',
            'source': 'iso',
            'layout': {},
            'paint': {
              'fill-color': '#5a3fc0',
              'fill-opacity': 0.3
            }
          },
          'poi-label'
        );

        // Initialize the marker at the query coordinates
        marker.setLngLat(lngLat).addTo(map);

        // Make the API call
        getIso();
      });
    </script>
  </body>
</html>