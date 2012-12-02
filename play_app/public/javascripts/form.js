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

    
    var tour = {name:tName, startTime:tStartTime, description:tDesc, audioURL:tAudio, videoURL:tVideo, latitude:tLatitude, longitude:tLongitude, tourGuideName:tGuideName};
    addTourToFirebase(tour);
    window.location = "/drop"
}
