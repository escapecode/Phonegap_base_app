<?
include 'config.php';

if (isset($_REQUEST['store_id']) && is_numeric($_REQUEST['store_id']))
{
	try {
		$sth = $pdo->prepare("SELECT * FROM stores where store_id = :store_id LIMIT 1");

		$vars = array (
			':store_id'		=> $_REQUEST['store_id']
		);

		$sth->execute($vars);

		$x = $sth->fetchAll();
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
