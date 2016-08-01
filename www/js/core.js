
// ------------- camera ---------------
function takePicture()
{
	navigator.camera.getPicture(function (imageURI) {
		var image = document.getElementById('my_photo');
		image.src = imageURI;
	},
	function (message) {
		$("#app-status-ul").append('<li class="red">Picture failed: ' + message + '</li>');
	},
	{
		quality: 50,
		destinationType: Camera.DestinationType.FILE_URI,
		allowEdit : true
	});
}
// ------------- file transfer ---------------
function fileUpload()
{
	fileURL = '';
	var uri = encodeURI($app_server_url + "/upload.php");

	var headers={'headerParam':'headerValue'};

	var options = new FileUploadOptions();
		options.fileKey="file";
		options.fileName=fileURL.substr(fileURL.lastIndexOf('/')+1);
		options.mimeType="text/plain";
		options.headers = headers;

	var ft = new FileTransfer();

	ft.onprogress = function(progressEvent) {
			if (progressEvent.lengthComputable) {
			  loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
			} else {
			  loadingStatus.increment();
			}
		};

	ft.upload(fileURL, uri, function (r)
		{
			$("#app-status-ul").append('<li class="green">Success = ' + r.responseCode + '</li>');
			$("#app-status-ul").append('<li>Response = ' + r.response + '</li>');
			$("#app-status-ul").append('<li>Sent = ' + r.bytesSent + '</li>');
		},
		function (error) {
			$("#app-status-ul").append('<li class="red">An error has occurred: Code = ' + error.code + '</li>');
			$("#app-status-ul").append('<li>upload error source ' + error.source + '</li>');
			$("#app-status-ul").append('<li>upload error target ' + error.target + '</li>');
		},
		options
	);
}

// ------------- compass ---------------

function compassStart()
{
	if (navigator.compass)
	{
		var options = {
			frequency: 3000
		}; // Update every 3 seconds

		var watchID = navigator.compass.watchHeading(
			function (heading) {
			   $('#compass').html(Math.round(heading.magneticHeading));
			},
			function (compassError) {
			   $('#compass_error').html('Compass error: ' + compassError.code);
			},
			{
				frequency: 3000
			}
		);
	}
}

// ------------- barcode ---------------
// <gap:plugin name="com.phonegap.plugins.barcodescanner" version="2.2.0" />
function qrScan()
{
	cordova.plugins.barcodeScanner.scan(
		function (result) {
			$("#app-status-ul").append('<li>We got a barcode\n' +
				"Result: " + result.text + "\n" +
				"Format: " + result.format + "\n" +
				"Cancelled: " + result.cancelled + '</li>');
		},
		function (error) {
			$("#app-status-ul").append('<li>Scanning failed: ' + error + '</li>');
		}
	);
}

function qrMake()
{
	cordova.plugins.barcodeScanner.encode(cordova.plugins.barcodeScanner.Encode.TEXT_TYPE, "http://www.nytimes.com",
		function(success) {
			$("#app-status-ul").append('<li>encode success: ' + success + '</li>');
		}, function(fail) {
			$("#app-status-ul").append('<li>encoding failed: ' + fail + '</li>');
		}
	);
}

// ------------- zip ---------------
// <gap:plugin name="org.chromium.zip" version="2.1.0" />
function zipSource($source, $dest)
{
	zip.unzip($source, $dest,
	function(status) {
			$("#app-status-ul").append('<li>zip status = ' + status + '</li>');
	},
		function(progressEvent) {
			$( "#progressbar" ).progressbar("value", Math.round((progressEvent.loaded / progressEvent.total) * 100));
		}
	);
}

function mapGoogle()
{
	if(navigator.geolocation) {
		if (map == '')
		{
			var mapOptions = {
				zoom: 15,
				mapTypeControl: true,
				navigationControlOptions: {
					style: google.maps.NavigationControlStyle.SMALL
				},
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		}

		if (pos == '')
		{
			pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		}

		map.setCenter(pos);

		if (infowindow == undefined)
		{
			var infowindow = new google.maps.InfoWindow({
				map: map,
				position: pos,
				content: 'you started here'
			});
		}
	}

}

function localNotify($title, $text)
{
	cordova.plugins.notification.local.schedule({
		id: 10,
		title: $title,
		text: $text,
		// at: tomorrow_at_8_45_am,
		data: { meetingId:"#123FG8" }
	});
}
// ------------- location ---------------
// <gap:plugin name="com.phonegap.plugins.barcodescanner" version="2.2.0" />

function startupLocation()
{
	if(navigator.geolocation) {
		var geolocation = navigator.geolocation.watchPosition(	// NOTE getCurrentPosition or watchPosition
			function(position1) {
				position = position1;

				$('span#accuracy').html(Math.round(position.coords.accuracy));
				$('span#altitude').html(Math.round(position.coords.altitude));
				$('span#latitude').html(position.coords.latitude.toFixed(4));
				$('span#longitude').html(position.coords.longitude.toFixed(4));
				$('span#altitudeAccuracy').html(Math.round(position.coords.altitudeAccuracy));
				$('span#heading').html(Math.round(position.coords.heading));
				$('span#speed').html(Math.round(position.coords.speed));
				date = new Date(position.timestamp);
				$('span#timestamp').html(date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds());

				if (position != '')
				{
					if (bShowMap)
					{
						mapGoogle();
					}

					if (bFindNearbyStores)
					{
						if (! bGotStores)
						{
							$stores = getStores(position.coords.latitude, position.coords.longitude, 100);
							bGotStores = true;
						}
						else
						{
							findNearbyStores();
						}
					}
				}
			}, function(error) {
				switch(error.code) {
					case error.PERMISSION_DENIED:
						$("#app-status-ul").append('<li>User denied the request for Geolocation.</li>');
						break;
					case error.POSITION_UNAVAILABLE:
						$("#app-status-ul").append('<li>Location information is unavailable.</li>');
						break;
					case error.TIMEOUT:
						$("#app-status-ul").append('<li>The request to get user location timed out.</li>');
						break;
					case error.UNKNOWN_ERROR:
						$("#app-status-ul").append('<li>An unknown error occurred.</li>');
						break;
				}
			},
			{
				 enableHighAccuracy: true,
				 maximumAge: 1000
			}
		);

		window.setTimeout( function () {
				navigator.geolocation.clearWatch( geolocation )
			},
			5000
		);
	} else {
		$("#app-status-ul").append('<li>Browser does not support Geolocation</li>');
	}
}

function getStores(lat, lng, distance) {
	data = JSON.parse('{"success":1,"stores":[{"name":"Orange County Fairgrounds","lat":"33.668063","lng":"-117.894997"},{"name":"John Wayne Airport","lat":"33.668063","lng":"-117.862210"},{"name":"Jason Home","lat":"33.615847","lng":"-117.691042"},{"name":"Laguna Hills HS","lat":"33.593311","lng":"-117.703101"},{"name":"Mall","lat":"33.611755","lng":"-117.707521"},{"name":"Marina","lat":"32.628443","lng":"-117.103117"},{"name":"Boat","lat":"32.621070","lng":"-117.096251"},{"name":"Taco Time","lat":"32.627431","lng":"-117.088097"}]}');

	return data.stores;

	$.ajax({
		type:"POST",
		dataType: 'jsonp',
		url	: $url_storefinder,
		data	:"ajax=1&action=get_nearby_stores&distance="+distance+"&lat="+lat+"&lng="+lng+"&products=undefined",
		success:function(data) {
			return data.stores;
		},
		error	: function() {
			$("#app-status-ul").append('<li class="red">failed to get stores</li>');
			// data = JSON.parse('{"success":1,"stores":[{"name":"Organic OC Delivery","address":"Mission Viejo, CA","telephone":"949-705-6853","email":"","website":"","description":"Delivery Only","lat":"33.6","lng":"-117.672","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""},{"name":"GoDoodle Delivery","address":"Irvine, CA","telephone":"949-478-1441","email":"","website":"","description":"Delivery Only","lat":"33.6839","lng":"-117.795","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""},{"name":"Orange County Patients Care","address":"1921 Carnegie Ave, Suite H, 92707","telephone":"","email":"","website":"","description":"","lat":"33.7107","lng":"-117.842","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""},{"name":"Emerald Care Collective","address":"1820 E. Garry Ave #204, 92707","telephone":"","email":"","website":"","description":"","lat":"33.7065","lng":"-117.867","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""},{"name":"Live to Love","address":"1651 E. Edinger Ave #209, 92705","telephone":"","email":"","website":"","description":"","lat":"33.727","lng":"-117.845","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""},{"name":"SAPA - Santa Ana Patients Alliance","address":"E. Edinger Ave #104, 92705","telephone":"","email":"","website":"","description":"","lat":"33.7271","lng":"-117.868","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""},{"name":"Kush Kingdom","address":"24643 Alessandro Blvd., 92553","telephone":"","email":"","website":"","description":"","lat":"33.9159","lng":"-117.233","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""},{"name":"HGH","address":"13490 Magnolia Ave 92879","telephone":"","email":"","website":"","description":"","lat":"33.8779","lng":"-117.52","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""},{"name":"Costa Mesa Collective","address":" 2800 Main St. #202, 92701","telephone":"","email":"","website":"","description":"","lat":"33.7463","lng":"-117.868","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""},{"name":"Surf City Collective","address":"19142 Beach Blvd. Unit Y, 92648","telephone":"","email":"","website":"","description":"","lat":"33.6845","lng":"-117.988","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""},{"name":"Cannabis Cures Co","address":"13211 Brookhurst St. Unit B, 92843","telephone":"","email":"","website":"","description":"","lat":"33.771","lng":"-117.956","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""},{"name":"Bikini Beach BOGO House","address":"1210 S. State College Blvd., CA 92805","telephone":"","email":"","website":"","description":"","lat":"33.8172","lng":"-117.889","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""},{"name":"Anaheim Patient Care","address":"1671 W. Katella Ave. Suite #135, 92802","telephone":"","email":"","website":"","description":"","lat":"33.8037","lng":"-117.94","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""},{"name":"The Crown Collective","address":"6102 Etiwanda Ave, 91752","telephone":"","email":"","website":"","description":"","lat":"33.9771","lng":"-117.522","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""},{"name":"Downtown Patient Center","address":" 9106 Mission Blvd, 92509","telephone":"","email":"","website":"","description":"","lat":"34.0118","lng":"-117.482","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""},{"name":"San Pedro Canna Clinic","address":"655 W. 7th St, 90731","telephone":"","email":"","website":"","description":"","lat":"33.7379","lng":"-118.292","titlewebsite":"Website","titleemail":"Email","titletel":"Telephone","titlecontactstore":"Contact this store","titlekm":"km","titlemiles":"miles","cat_name":"","cat_img":"","img":""}]}');

			return data.stores;
		}
	});
}

function getLBS(lat, lng, distance) {
	$.ajax({
		type:"POST",
		dataType: 'jsonp',
		url	: $url_lbs,
		data	: "store_id=1",
		success:function(store) {
			localNotify(store.name, store.msg);
		},
		error	: function() {
			$("#app-status-ul").append('<li class="red">failed to get stores</li>');
		}
	});
}

function distanceFromCoords(coords1, coords2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(coords2.lat-coords1.lat);  // deg2rad below
  var dLon = deg2rad(coords2.lng-coords1.lng);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(coords1.lat)) * Math.cos(deg2rad(coords2.lat)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  // d = d * 0.621371; // for miles
  d = d * 1000; // for m
  return d;
}

function deg2rad(Value)
{
    return Value * Math.PI / 180;
}

function findNearbyStores()
{
	lat = position.coords.latitude;
	lng = position.coords.longitude;

	$.each($stores, function(inc, store) {
		distance = distanceFromCoords(store , {'lat' : lat, 'lng' : lng});
		// console.log(distance + 'lat1 = ' + store.lat + 'lat2 = ' + lat + 'lng1 = ' + store.lng + 'lng2 = ' + lng);

		radius_distance = 500;	// this is in meters
		if (distance < radius_distance)
		{
			if ($store_active != store.name)
			{
				$("#last_store").html(store.name);
				$store_active = store.name;
				localNotify("Guess who you're near?", "You are near " + store.name);
			}

			return false;
		}
		else
		{
			// $("#last_store").html('');
		}
	});
}

$(function() {
	compassStart();

	startupLocation();

	window.setInterval( function () {
			startupLocation();
		},
		15000 //check every 15 seconds
	);
});
