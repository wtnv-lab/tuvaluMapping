<?php
$db = mysql_connect("localhost", "root", "");
if(!$db){ exit('MySQLに接続できません．');}
if(!mysql_select_db("tuvalu")){ exit('データベースを選択できません．');}

$query = "SELECT DISTINCT date,name,message,country,longitude,latitude,target_la,target_lo FROM message";
//$query = "SELECT distinct name,message from `message`";
//echo $query;
$result = mysql_query($query);
if(!$result){exit('クエリの実行が失敗しました: ');}

$jsonArray = array();

$documentArray = array(
    "id"=>"document",
    "name"=>"lineJson",
    "version"=>"1.0",
);

//array_push($jsonArray, $documentArray);

$lineId = 0;
while($row = mysql_fetch_array($result)){
	$lineId = $lineId;
	$date = substr($row['date'],0,10);
	$description = '<div class="lineMessage">' . $row['message'] . ' from ' . $row['country'] . '</div>';
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

	$polylinePoint = array(
			$longitude,
			$latitude,
			0,
			$target_lo,
			$target_la,
			0
	);
	$polylinePosition = array(
		"cartographicDegrees" => $polylinePoint,
	);

	$polylineRgba = array(
		48,48,255,32
	);

	$polylineColor = array(
		"rgba" => $polylineRgba,
	);

	$polylineSolidColor = array(
		"color" => $polylineColor,
	);

	$polylineGlowRgba = array(
		0,0,255,255
	);

	$polylineGlowColor = array(
		"rgba" => $polylineGlowRgba,
	);

	$polylineGlow = array(
		"color" => $polylineGlowColor,
		"glowPower" => 1.0,
	);

	$polyLineMaterial = array(
		"solidColor" => $polylineSolidColor,
		"polylineGlow" => $polylineGlow,
	);

	$polyline = array(
		"width" => 2,
		"positions" => $polylinePosition,
		"material" => $polyLineMaterial,
		"positions" => $polylinePosition,
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
var_dump ($json);
file_put_contents('line.json', $json);
?>