<?php

// test connection and validity of api key with
// curl -k --header "Authorization: key=AIzaSyDkdcagL9mIJmFBcbOyJMgDy2VhN-r_1v0" --header Content-Type:"application/json" https://gcm-http.googleapis.com/gcm/send -d "{\"registration_ids\":[\"ABC\"]}"

class PushNotifications {
	public $API_key_google = '';
	public $API_key_iphone = '';
	public $API_key_wp = '';

	public function __construct() {
		include 'config.php';	// FIXME

		$this->API_key_google = $API_key_google;
		$this->API_key_iphone = $API_key_iphone;
		$this->API_key_wp = $API_key_wp;
		$this->iphone_pem = $iphone_pem;
		$this->use_prod = $use_prod;
	}

	// Sends Push notification for Android users
	public function android($data, $reg_id) {
			// $url = 'https://android.googleapis.com/gcm/send';
			$url = 'https://gcm-http.googleapis.com/gcm/send';
			$message = array(
				'title' => $data['mtitle'],
				'message' => $data['mdesc'],
				'subtitle' => '',
				'tickerText' => '',
				'msgcnt' => 1,
				'vibrate' => 1
			);

			$headers = array(
				'Authorization: key=' . $this->API_key_google,
				'Content-Type: application/json'
			);

			$fields = array(
				'to' 							=> $reg_id,
				'data' 						=> $message,
			);

			return $this->useCurl($url, $headers, json_encode($fields));
		}

	// Sends Push's toast notification for Windows Phone 8 users
	public function WP($data, $uri) {
		$delay = 2;
		$msg =  "<?xml version=\"1.0\" encoding=\"utf-8\"?>" .
				"<wp:Notification xmlns:wp=\"WPNotification\">" .
					"<wp:Toast>" .
						"<wp:Text1>".htmlspecialchars($data['mtitle'])."</wp:Text1>" .
						"<wp:Text2>".htmlspecialchars($data['mdesc'])."</wp:Text2>" .
					"</wp:Toast>" .
				"</wp:Notification>";

		$sendedheaders =  array(
			'Content-Type: text/xml',
			'Accept: application/*',
			'X-WindowsPhone-Target: toast',
			"X-NotificationClass: $delay"
		);

		$response = $this->useCurl($uri, $sendedheaders, $msg);

		$result = array();
		foreach(explode("\n", $response) as $line) {
			$tab = explode(":", $line, 2);
			if (count($tab) == 2)
				$result[$tab[0]] = trim($tab[1]);
		}

		return $result;
	}

		// Sends Push notification for iOS users
	public function iOS($data, $devicetoken) {

		$deviceToken = $devicetoken;

		$ctx = stream_context_create();
		// ck.pem is your certificate file
		stream_context_set_option($ctx, 'ssl', 'local_cert', $this->iphone_pem);
		stream_context_set_option($ctx, 'ssl', 'API_key_iphone', $this->API_key_iphone);

		// Open a connection to the APNS server
		$gateway = ($this->use_prod === true) ? 'ssl://gateway.push.apple.com:2195' : 'ssl://gateway.sandbox.push.apple.com:2195';

		$fp = stream_socket_client(
			$gateway, $err,
			$errstr, 60, STREAM_CLIENT_CONNECT|STREAM_CLIENT_PERSISTENT, $ctx);

		if (!$fp)
			exit("iOS failed to connect: $err $errstr with $gateway " . PHP_EOL . "\n" . print_r($data, true) . " \n $devicetoken");

		// Create the payload body
		$body['aps'] = array(
			'alert' => array(
				'title'		=>$data['mtitle'],
				'body'	=>$data['mdesc']
			 ),
			'sound' => 'default'
		);

		// Encode the payload as JSON
		$payload = json_encode($body);

		// Build the binary notification
		$msg = chr(0) . pack('n', 32) . pack('H*', $deviceToken) . pack('n', strlen($payload)) . $payload;

		// Send it to the server
		$result = fwrite($fp, $msg, strlen($msg));

		// Close the connection to the server
		fclose($fp);

		if (!$result)
			return 'Message not delivered' . PHP_EOL;
		else
			return 'Message successfully delivered' . PHP_EOL;

	}

	// Curl
	private function useCurl($url, $headers, $fields = null) {
		//~ echo "url = $url\n";
		//~ echo "headers = " . print_r($headers, TRUE) . "\n";
		//~ echo "fields\n";
		//~ print_r($fields);
		//~ return;

		// Open connection
		$ch = curl_init();
		if ($url) {
			// Set the url, number of POST vars, POST data
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_POST, true);
			curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

			// Disabling SSL Certificate support temporarly
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
			if ($fields) {
				curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
			}

			// Execute post
			$result = curl_exec($ch);
			if ($result === FALSE) {
				die('Curl failed: ' . curl_error($ch));
			}

			// Close connection
			curl_close($ch);

			return $result;
		}
	}
}
