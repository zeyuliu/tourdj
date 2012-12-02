/* 
A file with javascript functions handling the map-related stuff
*/

// GLOBAL VARIABLES

var map;

var UPDATE_ON_MAP_ZOOM = false;
var sanFranciscoLatitude = 37.77456;
var sanFranciscoLongitude = -122.433523;
var sanFrancisco = new google.maps.LatLng(sanFranciscoLatitude, sanFranciscoLongitude);
var DEF_ANIMATION = google.maps.Animation.DROP;

var myDataRef = new Firebase('https://timur.firebaseio.com/');
var userInfo;
var heatmap;
var map;
var userMarker;
var allTours = [];
var allMarkers = [];
var listeners = [];
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

    // Initializes session-login via cookies
    initializelogin();

    console.log("in initialize");
    // put Berkeley as a first viewed city on the map
    var center = sanFrancisco;

    getLocation();


    var styles = [
      {
        stylers: [
          { hue: "#00E2FF" },
          { saturation: -5 }
        ]
      },{
        featureType: "road",
        elementType: "geometry",
        stylers: [
          { lightness: 100 },
          { visibility: "simplified" }
        ]
      },{
        featureType: "road",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      }
    ];

    // set up map options
    var mapOptions = {
        zoom: 12,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        mapTypeControl: false,
                        streetViewControl: false,
                        panControl: false,
                        zoomControl: false,
                        styles: styles
    };

    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

    // Requests hadnling-related times, map center location
    var nowTime, lastTime = 0, newCenter;
     // Min Time between update requests on map change events (zoom, drag etc)
    var MIN_INTERVAL_MLSEC = 1800; 
    // initial zoom
    var current_zoom = 12;
    /*
    var markerArray = setSampleMarkers();
    for (i = 0; i < markerArray.getLength(); i++){
        markerArray.getAt(i).setMap(map);
        
    }
    */
    // Ask browser for it's location
    //ExecuteParse();
    markTours();
    unmarkTours();
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


// Fetches raw data containing points info. Gets user's browser location.
function getLocation() {

    console.log("in getLocation");

    if (navigator.geolocation) {
        watchRef = navigator.geolocation.watchPosition(geolocate, null, {enableHighAccuracy: true});
        console.log("in geoLocation");
    } else {
        alert("Oops. Looks like your location can't be fetched.");
    }
}

function geolocate(position) {
    console.log("in geolocation");
    map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
    if (position.coords.accuracy < 100) {
        navigator.geolocation.clearWatch(watchRef);
    }
}


function addToFirebase(key, value) {
    myDataRef.child(key).set(value)
}

function centerMarker() {
    var markerOptions = {
        visible: true,
        draggable: true,
        position: map.getCenter(),
        animation: google.maps.Animation.DROP,
        title: 'Where do you want to tour?',
        map: map
    };
    return new google.maps.Marker(markerOptions);
}

function transition() {
    userMarker = centerMarker();
    document.getElementById('chooseLocation').onclick = commitLocation;
    document.getElementById('chooseLocation').innerHTML = 'Make a tour!';
}

function addTourToFirebase(tour) {
    myDataRef.child('tours').child(tour['name']).set(tour)
}

function removeTourFromFirebase(tour_id) {
    myDataRef.child('tours').child(tour_id).remove()
}

function markTours() {
    myDataRef.child('tours').on('value', function(shot) {
        for (var tour in shot.val()){
            if (allTours.indexOf(tour) == -1){
                marker = markTour(shot.val()[tour]);
                console.log(tour)
                console.log("Well, one");
                
                allTours.push(tour);
            }
        }
    });
}

function unmarkTours() {
    myDataRef.child('tours').on('child_removed', function(shot) {
        for (var i = 0; i < allTours.length; i++) {
            if (allTours[i] == shot.val()['name']) {
                allMarkers[i].setVisible(false);
                allMarkers[i].setMap(null);
                allTours.splice(i, 1);
                allMarkers.splice(i, 1);
                break;
            }
        }
    });
}

function aggregateData(pos) {
    ACCESS_TOKEN = login();
    request_url = "https://api.singly.com/profile?access_token=" + ACCESS_TOKEN
    var info;
    if (ACCESS_TOKEN) {
        $.ajax({

            url: request_url,
            
            dataType: "json",
            
            success: function (d) {
                
                getJSONInfo(d, pos);
            },

            error: function () {
                console.log("ERROR: Unable to fetch user data.");
            }

        });
    }

}


function getJSONInfo(user, pos) {
    var r = myDataRef.child('users').child(user.id);
    console.log(r.toString());
    r.once('value', function(snapshot) { 
        
        userInfo = snapshot.val();
        var name = userInfo['name'];
        params = "latitude=" + pos.lat() + "&longitude=" + pos.lng() + "&name=" + name;
        console.log(snapshot.val());
        
        window.location = "/gettour?" + params;
    });

}

function markTour(tour) {
    var markerOptions = {
        visible: true,
        position: new google.maps.LatLng(tour['latitude'], tour['longitude']),
        animation: DEF_ANIMATION,
        title: tour['desc'],
        map: map
    };
    var newMarker = new google.maps.Marker(markerOptions);
    allMarkers.push(newMarker);
    
    google.maps.event.addListener(newMarker, 'click', function(mouseEvent) {
                    infoWindowOptions = {
                        content: tour['description']
                    };
                    console.log(tour);
                    infoWindow = new google.maps.InfoWindow(infoWindowOptions);
                    infoWindow.open(map, newMarker);
    });
    return newMarker;
}

function addUserToTour(user_id, tour_id, loc) {
    myDataRef.child('tours').child(loc).child(tour_id).once('value', function(shot) {var tour = shot.val()});
    tour['signed_up'] = (parseInt(tour['signed_up']) + 1).toString();
    myDataRef.child('tours').child(loc).child(tour_id).set(tour);
}

function placeMarkersOnMap(markers, map) {
    for (var i = 0; i < markers.length(); i++) {
        markers[i].setMap(map);
    }
}

function commitLocation() {
    pos = userMarker['position'];
    aggregateData(pos);
    
}
