<?php
$db = mysqli_connect("localhost", "tuvaluServer", "UQVBV5MJvGLN1SVx1hPdLcztusjim55f");
if (!$db) { exit('MySQLに接続できません．'); }
mysqli_set_charset($db, 'utf8');
mysqli_select_db($db, 'tuvalu');
$query = "SELECT DISTINCT date,name,message,country,longitude,latitude,target_la,target_lo FROM message";
//$query = "SELECT distinct name,message from `message`";
//echo $query;
$result = mysqli_query($db, $query);
if (!$result) { exit('クエリの実行が失敗しました: '); }

$jsonArray = array();

$documentArray = array(
    "id"=>"document",
    "name"=>"lineJson",
    "version"=>"1.0",
);

//array_push($jsonArray, $documentArray);

$lineId = 0;
while ($row = mysqli_fetch_array($result)) {
	$date = substr($row['date'], 0, 10);
	$message = htmlspecialchars((string)$row['message'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
	$country = htmlspecialchars((string)$row['country'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
	$description = '<div class="lineMessage">' . $message . ' from ' . $country . '</div>';
/*
	$description = $row['message'];
	$date = $row['date'];
	if ($date == "2015-11-10 13:52:55") {
		$date = "2011-01-01 00:00:00";
	}

	$dateOnly = substr($date,0,10);
	$availability = (string)($dateOnly . "T00:00:00+09:00/2015-11-10T00:00:00+09:00");
	
	if ($row['longitude'] < 0) {
		$longitude = 180 - $row['longitude'];
	} else {
		$longitude = (float)$row['longitude'];		
	};

*/

	$longitude = (float)$row['longitude'];
	$latitude = (float)$row['latitude'];
	$target_lo = (float)$row['target_lo'];	
	$target_la = (float)$row['target_la'];

/*	
	$dLon = $longitude - $row['target_lo'];
	$dLat = $row['latitude'] - $row['target_la'];
	
	$lonRad = deg2rad($dLon);
	$latRad = deg2rad($dLat);
	
	$distanceNS =  6400 * $latRad;
	$distanceWE =  cos(deg2rad($row['target_la'])) * 6400 * $lonRad;
	$distance = sqrt(pow($distanceWE,2) + pow($distanceNS,2));

	$points = array();
	$count = 0;	
	while ($count < 3){
		$newLon = $longitude - 0.5 * $dLon * $count;
		$newLat = $row['latitude'] - 0.5 * $dLat * $count;
		if ($count == 1){
				$point = array($newLon,$newLat,50 * $distance);
			} else {
				$point = array($newLon,$newLat,0);	
			}
		array_push($points, $point);
		$count++;
	}
*/

	$polylinePosition = array(
		"cartographicDegrees" => array(
			$longitude,
			$latitude,
			0,
			$target_lo,
			$target_la,
			0
		),
	);

	$polyLineMaterial = array(
		"solidColor" => array(
			"color" => array(
				"rgba" => array(48, 48, 255, 32),
			),
		),
		"polylineGlow" => array(
			"color" => array(
				"rgba" => array(0, 0, 255, 255),
			),
			"glowPower" => 1.0,
		),
	);

	$polyline = array(
		"width" => 2,
		"positions" => $polylinePosition,
		"material" => $polyLineMaterial,
	);

	$placemarkArray = array(
		"id" => $lineId,
		"name" => $date,
		"followSurface" => true,
//		"availability" => $availability,
//		"name" => $billboardName,
		"description" => $description,
//		"billboard" => $billboard,
//		"position" => $position,
		"polyline" => $polyline,
	);
	array_push($jsonArray, $placemarkArray);
	$lineId++;
}
$json = json_encode($jsonArray,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
echo $json;
file_put_contents('line.json', $json);
mysqli_free_result($result);
mysqli_close($db);
?>
