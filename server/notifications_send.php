<?php

include 'config.php';
require_once('lib/PushNotifications.php');

// Message payload
$msg_payload = array (
	'mtitle' => $_REQUEST['title'],
	'mdesc' => $_REQUEST['msg'],
);

if (isset($_REQUEST['device_id']) && ! empty($_REQUEST['device_id']) && isset($_REQUEST['type']) && ! empty($_REQUEST['type']))
{
	$registered_devices = Array(
		'deviceID'	=> $_REQUEST['device_id'],
		'type'			=> $_REQUEST['type']
	);
}
else
{
	try {
		$sth = $pdo->prepare("SELECT type, deviceID from registered_devices");

		$sth->execute();
		$registered_devices = $sth->fetchAll();
	}
	catch(PDOException $e) {
		die("lookup error: $e");
	}
}

$oPushNotifications = new PushNotifications;

foreach ($registered_devices as $device)
{
	switch (strtolower($device['type']))
	{
		case 'android':
			echo "<br />Android:<hr />" . $oPushNotifications->android($msg_payload, $device['deviceID']) . "<hr />";
			break;
		case 'wp' :
			$oPushNotifications->WP8($msg_payload, $device['deviceID']);
			break;
		case 'ios':
			echo "<br />iOS:<hr /> " . $oPushNotifications->iOS($msg_payload, $device['deviceID']) . "<hr />";
			break;
	}
}
