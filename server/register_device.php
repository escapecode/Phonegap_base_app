<?
include 'config.php';

if (isset($_REQUEST['deviceID']))
{
	try {
		$sth = $pdo->prepare("INSERT into registered_devices (type, deviceID, date_created) values (:type, :deviceID, NOW())");

		$vars = array (
			':type'				=> $_REQUEST['type'],
			':deviceID'		=> $_REQUEST['deviceID']
		);

		$sth->execute($vars);
		$x = array (
			'msg'		=> "saved registration " . $_REQUEST['deviceID']
		);
	}
	catch(PDOException $e) {
		$x = array (
			'msg'		=> "problem $e"
		);
	}
}
else
{
		$x = array (
			msg		=> "no device"
		);
}

echo json_encode($x);
