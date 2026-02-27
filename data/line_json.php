<?php
$db = mysqli_connect("localhost", "root", "a7kJ8xzEqUFfiVm");
if (!$db) {
    exit('MySQLに接続できません．');
}
mysqli_set_charset($db, 'utf8');
if (!mysqli_select_db($db, 'tuvalu')) {
    exit('データベースを選択できません．');
}

$query = "SELECT DISTINCT date,name,message,country,longitude,latitude,target_la,target_lo FROM message";
$result = mysqli_query($db, $query);
if (!$result) {
    exit('クエリの実行が失敗しました: ');
}

$jsonArray = array();
$jsonArray[] = array(
    "id" => "document",
    "name" => "lineJson",
    "version" => "1.0",
);

$lineId = 0;
while ($row = mysqli_fetch_array($result)) {
    $date = substr($row['date'], 0, 10);
    $message = htmlspecialchars((string)$row['message'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $country = htmlspecialchars((string)$row['country'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $description = '<div class="lineMessage">' . $message . ' from ' . $country . '</div>';

    $longitude = (float)$row['longitude'];
    $latitude = (float)$row['latitude'];
    $target_lo = (float)$row['target_lo'];
    $target_la = (float)$row['target_la'];

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

    $polyline = array(
        "width" => 2,
        "positions" => $polylinePosition,
        "material" => array(
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
        ),
    );

    $jsonArray[] = array(
        "id" => $lineId,
        "name" => $date,
        "followSurface" => true,
        "description" => $description,
        "polyline" => $polyline,
    );
    $lineId++;
}

$json = json_encode($jsonArray, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
header('Content-Type: application/json; charset=UTF-8');
echo $json;
file_put_contents('line.czml', $json);

mysqli_free_result($result);
mysqli_close($db);
?>
