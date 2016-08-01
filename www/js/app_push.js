//~
//~ var google_app_number		= '123412341234';
//~ var pushwoosh_app_id		= 'A1234-A1234';
//~ var url_redirect						= 'http://dmsapp.net/herb-e/herbsmith/';
//~ var $app_server_url				= 'http://img-oc.com/herb-e';

var pushNotification;

function onDeviceReady() {
	$("#app-status-ul").append('<li>deviceready event received</li>');

	document.addEventListener("backbutton", function(e)
	{
		$("#app-status-ul").append('<li>backbutton event received</li>');

		if( $("#home").length > 0)
		{
			// call this to get a new token each time. don't call it to reuse existing token.
			//pushNotification.unregister(handlerSuccess, handlerError);
			e.preventDefault();
			navigator.app.exitApp();
		}
		else
		{
			navigator.app.backHistory();
		}
	}, false);
}


function deviceRegister()
{
	try
	{
		pushNotification = window.plugins.pushNotification;
		$("#app-status-ul").append('<li>registering ' + device.platform + '</li>');

		if (device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos' ) {
			pushNotification.register(
				function(result) {
					handlerSuccess (result);
				},
				function(result) {
					handlerError (result);
				},
				{
					"senderID": google_app_number,	//  via registered app at https://console.developers.google.com/start
					"ecb":"onNotificationGCM"				// required!
				}
			);
		} else {
			pushNotification.register(
				function(result)	{
					handlerSuccess (result);
					updateRegistrationWebServer('register', result);
				},
				function(result)	{
					handlerError (result);
				},
				{
					"badge":"true",
					"sound":"true",
					"alert":"true",
					"ecb":"onNotificationAPN"
				}
			);
		}
	}
	catch(err)
	{
		handlerError("Error registering: " + err.message);
	}
}

function deviceUnregister()
{
	try
	{
		pushNotification = window.plugins.pushNotification;
		$("#app-status-ul").append('<li>unregistering ' + device.platform + '</li>');

		if (device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos' ) {
			pushNotification.unregister(
				function(result, code)
				{
					$("#app-status-ul").append('<li>unregistering code ' + code + '</li>');

					handlerSuccess (result);
					updateRegistrationWebServer('unregister', result);
				},
				function(result) {
					handlerError (result);
				},
				{
					"senderID":google_app_number,	// replace_with_sender_id (app registration code) via registered app at https://console.developers.google.com/start
					"ecb":"onNotificationGCM"			// required!
				}
			);
		} else {
			pushNotification.unregister(
				function(result) {
					handlerSuccess (result);
					updateRegistrationWebServer('unregister', result);
				},
				function(result)	{
					handlerError (result) ;
				},
				{
					"badge":"true",
					"sound":"true",
					"alert":"true",
					"ecb":"onNotificationAPN"	// required!
				}
			);
		}
	}
	catch(err)
	{
		handlerError("Error unregistering: " + err.message);
	}
}

function updateRegistrationWebServer($reg_type, regid)
{
	$server = $app_server_url + "/" + $reg_type + "_device.php";

	$.ajax({
			type: "GET",
			url: $server,
			dataType: "json",
			data: "type=" + device.platform + "&deviceID=" + encodeURIComponent(regid)
		}).done(function(data) {
			$("#app-status-ul").append('<li>updateRegistrationWebServer ' + $reg_type + ' success with '+ data.msg +'</li>');
			$("#app-status-ul").append('<li>' + regid + '</li>');
		}).fail(function(jqXHR, textStatus, msg){
			console.log(jqXHR);
			$("#app-status-ul").append('<li class="red">qXHR=' + jqXHR + '<br />status=' + textStatus + '<br />msg=' + msg + '</li>');
	});
}

// handle APNS notifications for iOS
function onNotificationAPN(e) {
	$("#app-status-ul").append('<li>onnotification</li>');
	if (e.alert) {
		 $("#app-status-ul").append('<li>push-notification: ' + e.alert + '</li>');
		 // showing an alert also requires the org.apache.cordova.dialogs plugin
		 navigator.notification.$("#app-status-ul").append('<li>' + e.alert + '</li>');
	}

	if (e.sound) {
		// playing a sound also requires the org.apache.cordova.media plugin
		var snd = new Media(e.sound);
		snd.play();
	}

	if (e.badge) {
		pushNotification.setApplicationIconBadgeNumber(function (result) {
				$("#app-status-ul").append('<li>badge =  ' + result + '</li>');
			},
			handlerError,
			e.badge);
	}
}

// handle GCM notifications for Android
function onNotificationGCM(e) {
	$("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');

	switch( e.event )
	{
		case 'registered':
		if ( e.regid.length > 0 )
		{
			$("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
			// Your GCM push server needs to know the regID before it can push to this device
			// here is where you might want to send it the regID for later use.
			updateRegistrationWebServer('register', e.regid)
		}
		break;

		case 'message':
			// if this flag is set, this notification happened while we were in the foreground.
			// you might want to play a sound to get the user's attention, throw up a dialog, etc.
			if (e.foreground)
			{
				$("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');

					// on Android soundname is outside the payload.
						// On Amazon FireOS all custom attributes are contained within payload
						var soundfile = e.soundname || e.payload.sound;
						// if the notification contains a soundname, play it.
						// playing a sound also requires the org.apache.cordova.media plugin
						var my_media = new Media("/android_asset/www/"+ soundfile);

				my_media.play();
			}
			else
			{	// otherwise we were launched because the user touched a notification in the notification tray.
				if (e.coldstart)
					$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
				else
				$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
			}

			$("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
			//android only
			$("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
			//amazon-fireos only
			$("#app-status-ul").append('<li>MESSAGE -> TIMESTAMP: ' + e.payload.timeStamp + '</li>');
		break;

		case 'error':
			$("#app-status-ul").append('<li style="color:red;">ERROR -> MSG:' + e.msg + '</li>');
		break;

		default:
			$("#app-status-ul").append('<li style="color:red;">EVENT -> Unknown, an event was received and we do not know what it is</li>');
		break;
	}
}

function handlerSuccess (result) {
	$("#app-status-ul").append('<li>handlerSuccess ' + result + '</li>');
}

function handlerError (error) {
	$("#app-status-ul").append('<li style="color:red;">error:'+ error +'</li>');
}

document.addEventListener('deviceready', onDeviceReady, true);
