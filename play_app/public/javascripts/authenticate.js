// Checks if already logged in by checking if valid session cookie exists.
function isLoggedIn() {
	if ($.cookie('account') != null) {
		return true;
	}
	else {
		return false;
	}
}


// If not already logged in, attempts to parse access_token from website url.
function login() {
	if (isLoggedIn()) {
		access_token = $.cookie('account');
	}

	else {
		urlname = document.location.href.toString();
		if (urlname.search("&access_token") != -1) {
			suburl = urlname.split("&access_token=")[1];
			access_token = suburl.split("&refresh_token=")[0];
		}
		else {
			return;
		}
	}

	return access_token;
}


// Accesses database from Singly and imports to Firebase.
function importToFirebase() {
	ACCESS_TOKEN = login();
	request_url = "https://api.singly.com/profile?access_token=" + ACCESS_TOKEN

	if (ACCESS_TOKEN) {
		$.ajax({

		    url: request_url,
		    
		    dataType: "json",
		    
		    success: function (d) {
		    
		      addUserToFirebase(d);
		        
		    },

		    error: function () {
		        console.log("ERROR: Unable to fetch user data.");
		    }

		});
	}

	if (isLoggedIn()) {
		return;
	}
	else {
		$.cookie('account', ACCESS_TOKEN, { path: '/' });
	}

}

function addUserToFirebase(user) {
	myDataRef.child('users').child(user.id).set(user);
}

function initializelogin() {
	isLoggedIn();
	login();
	importToFirebase();
	if (isLoggedIn()) {
		if (window.location.href == "http://localhost:9000/" || window.location.href == "http://localhost:9000/Home") {
			window.location.href = '/drop';
		};
		
	}
	else {
		if (window.location.href != "http://localhost:9000/") {
			window.location.href = "http://localhost:9000/";
		};
	}
}

function logout() {
	access_token = $.cookie('account');
	logouturl = "https://api.singly.com/logout?access_token=" + access_token;
	var popup = window.open(logouturl,"Logout","menubar=1,resizable=1,width=200,height=100");
	setTimeout(popup.close(), 5000);
	$.removeCookie('account', { path: '/' });
	window.location.href = "http://localhost:9000/";
}