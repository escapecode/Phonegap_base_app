<?
include 'config.php';

if (isset($_REQUEST['deviceID']))
{
	try {
		$sth = $pdo->prepare("DELETE FROM registered_devices WHERE deviceID =  :deviceID");

		$vars = array (
			':deviceID'		=> $_REQUEST['deviceID']
		);

		$sth->execute($vars);
		$x = array (
			'msg'		=> "Unregistered " . $_REQUEST['deviceID']
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
			msg		=> "no device ID supplied"
		);
}

echo json_encode($x);
