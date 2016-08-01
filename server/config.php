<?

$API_key_google = 'AIzaSyDkdcagL9mIJmFBcbOyJMgDy2VhN-r_1v0';	// (Android)API access key from Google API's Console.
$API_key_iphone = 'Th3B3atl35';					// (iOS) Private key's passphrase.
$API_key_wp	= "";						// (Windows Phone 8) name of this app's push channel.

$iphone_pem	= '2c_apple_created_aps_production.p12';			// this file needs to be uploaded to server
$use_prod	= true;

// $app_key_google = '605310976500';

$db_host	= "localhost";
$db_user	= "admin_admin";
$db_pass	= "vEKoPHpnuB";
$db_db		= "admin_pos";

try {
	$pdo = new PDO("mysql:host=" . $db_host . ";dbname=" . $db_db, $db_user, $db_pass);
}
catch(PDOException $e) {
	die("can't connect to database $e");
}
