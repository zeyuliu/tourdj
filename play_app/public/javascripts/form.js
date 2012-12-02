var myDataRef = new Firebase('https://timur.firebaseio.com/');

function submit() {
    var tName = document.getElementById('tour-name').value ? document.getElementById('tour-name').value : "";
    var tStartTime = document.getElementById('tour-start-time').value ? document.getElementById('tour-start-time').value : "";
    var tDesc = document.getElementById('tour-description').value ? document.getElementById('tour-description').value : "";
    var tAudio = document.getElementById('tour-audio').value ? document.getElementById('tour-audio').value : "";
    var tVideo = document.getElementById('tour-video').value ? document.getElementById('tour-video').value : "";
    var params = window.location.search.split('&');
    var tLatitude = params[0].substring(params[0].indexOf('=') + 1);
    var tLongitude = params[1].substring(params[1].indexOf('=') + 1);
    var tGuideName = params[2].substring(params[2].indexOf('=') + 1);
    var tGuidePic = params[3].substring(params[3].indexOf('=') + 1);
    var totalDesc = "<table border='0'><tr><td><img src='" + tGuidePic + "' width='75px'></img></td><td><b>Guide:</b> " + tGuideName.replace('%20', ' ') + "<br><b>Description:</b> " + tDesc + "<br><b>Price:</b> " + "</td></tr></table>";
    var tour = {name:tName, startTime:tStartTime, description: tDesc, totalDescription:totalDesc, audioURL:tAudio, videoURL:tVideo, latitude:tLatitude, longitude:tLongitude, tourGuideName:tGuideName, };
    addTourToFirebase(tour);
    window.location = "/drop"
}

function initializePic() {
    var params = window.location.search.split('&');
    var tLatitude = params[0].substring(params[0].indexOf('=') + 1);
    var tLongitude = params[1].substring(params[1].indexOf('=') + 1);
    var tGuideName = params[2].substring(params[2].indexOf('=') + 1);
    var tGuidePic = params[3].substring(params[3].indexOf('=') + 1);

    var picture = document.getElementById('tour-image').src = tGuidePic;
}
