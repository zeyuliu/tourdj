/* 
A file with javascript functions handling the map-related stuff
*/

// GLOBAL VARIABLES

// Parse Javascript SDK
var APPLICATION_ID = "IvhmmcSzZqySg27Bh50pEVn8aqUSvUNww09d0xkA";
var JAVASCRIPT_KEY = "er7Hxr16oNQnK2PBYOaaW6k5k8alGxdCMrBnulAp";

var UPDATE_ON_MAP_ZOOM = false;
var sanFranciscoLatitude = 37.77456;
var sanFranciscoLongitude = -122.433523;
var sanFrancisco = new google.maps.LatLng(sanFranciscoLatitude, sanFranciscoLongitude);
var DEF_ANIMATION = google.maps.Animation.DROP;

var myDataRef = new Firebase('https://timur.firebaseio.com/');

var heatmap;
/*
var testPointsData = toMapPts([
                    {location: {longitude: 37.774546, latitude: -122.433523}},
                    {location: {longitude: 37.777546, latitude: -122.437523}}
                    ]);
*/
// already loaded points in google maps
var loaded_points=[];
// already loaded points in google maps format + raw data from the server
var all_points=[];


/*********************
 JS Functons
 *********************/

  function initialize() {

    console.log("in initialize");
    // put Berkeley as a first viewed city on the map
    var center = sanFrancisco;

    // set up map options
    var mapOptions = {
        zoom: 12,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

    // Requests hadnling-related times, map center location
    var nowTime, lastTime = 0, newCenter;
     // Min Time between update requests on map change events (zoom, drag etc)
    var MIN_INTERVAL_MLSEC = 1800; 
    // initial zoom
    var current_zoom = 12;
    
    var markerArray = setSampleMarkers();
    for (i = 0; i < markerArray.getLength(); i++){
        markerArray.getAt(i).setMap(map);
        
    }

    // Ask browser for it's location
    //ExecuteParse();
    
    


    // listener to map zoom events, updates the heatmap (calls CallParse) if the flag UPDATE_ON_MAP_ZOOM is true
    google.maps.event.addListener(map, 'zoom_changed', function() {
        nowTime = new Date().getTime();
        //console.log("zoom_changed fired: new lat lon are ", map.getCenter().lat(), map.getCenter().lng());
        if (nowTime - lastTime > MIN_INTERVAL_MLSEC) {

            newCenter = {coords: {latitude: map.getCenter().lat(), longitude: map.getCenter().lng()}};

            current_zoom = map.getZoom();

            //updateWithinMaps();

            if (UPDATE_ON_MAP_ZOOM){
                if ((current_zoom - previous_zoom_level) > 0 ) {
                    //CallParse(newCenter,false, MapSize(map).width);
                }

            }
            
            previous_zoom_level = current_zoom;
            console.log("Google Maps zoomed. heigth is", current_zoom, MapSize(map).height,"width", MapSize(map).width);
        }

        // Update the time when we last asked for the heapmap updates through CallParse
        lastTime = new Date().getTime();        

    });
}

function setSampleMarkers(map) {
	
    var sampleNumber = 11;
    var sampleDistance = .001;
    var markerArray = new Array();
	for (var i = 0; i < sampleNumber; i++) {
        var offset = sampleDistance * (i - (sampleNumber / 2));
        var sampleLocation = new google.maps.LatLng(sanFranciscoLatitude + offset, sanFranciscoLongitude + offset);
	    var markerOptions = {
	        visible: true,
            position: sampleLocation,
            animation: google.maps.Animation.DROP
        };
        markerArray[i] = new google.maps.Marker(markerOptions);
	}
    return new google.maps.MVCArray(markerArray);
}

function ptsToMarkers(pts) {
    markers = []
    for (var i = 0; i < pts.length(); i++) {
        var markerOptions = {
            visible: true,
            position: pts[i].location,
            animation: DEF_ANIMATION
        };
        markers[i] = new google.maps.Marker(markerOptions);
    }
    return markers
}
// Loads the heatmap
function loadHeatMap(maparray, clear) {
    
    console.log("in loadHeatMap");

    var pointArray = new google.maps.MVCArray(maparray);
        //console.log(sampleLocation.lat());
        //myDataRef.push({id: i, latitude: sampleLocation.lat(), longitude: sampleLocation.lng()});
        //myDataRef.on('value', function(snapshot){ 
            //console.log("AA" + snapshot.val().latitude);
        //});


    return new google.maps.MVCArray(markerArray);
}


// Creates google maps "edible" points from a list of raw points.
function toMapPts(points) {

    console.log("toMapPts. points = ", points);
    var mapPts = [];

    for (var i = 0; i < points.length; ++i) {

          if(loaded_points.indexOf(points[i].id) == -1) 
          // first check if the point was already loaded into google maps
          { 
            // create the point and push it to the google map points array
              //console.log("points[" + i + "] =", points[i].attributes);
              var _lat = points[i].attributes.location.latitude;
              var _lon = points[i].attributes.location.longitude;
              var pt = {

                location: new google.maps.LatLng(_lat, _lon),
                weight: points[i].attributes.jam
              } 
            mapPts.push(pt);

              // update the global variables
            loaded_points.push(points[i].id);
            all_points.push([pt, points[i]]);
          }
    }

    return mapPts;
}

// Function that sends queries to Parse.com
function ExecuteFirebase(){

    console.log("ExecuteFirebase");

    var half_an_hour = 1800;
    var TimeShift = 3.5*3600;
    var e = document.getElementById('select_time');
    var future = e.options[e.selectedIndex].value;
    var delta_time = (e.options[e.selectedIndex].value -1) * half_an_hour;
    console.log("delta_time= " + delta_time);

    var current_time = new Date().getTime() / 1000 - TimeShift;

    var lessThan = current_time - delta_time + 2*half_an_hour ;
    var greaterThan = current_time - delta_time;

    console.log("timeinterval", greaterThan, lessThan);

    

    if (future == -1) {
            var Jams = Parse.Object.extend("Jams_Predictions");
            var query = new Parse.Query(Jams);
    }

    query.limit(1000);

    query.find({
        success: function(results) {
        
          console.log("Successfully retrieved " + results.length + " jams.");

          loadHeatMap(toMapPts(results))//, position.coords.latitude, position.coords.longitude);
        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
    }
});
}

function ReloadMaps() {
    loaded_points=[];
    all_points = [];
    initialize();
    //loadHeatMap(null,true);
}