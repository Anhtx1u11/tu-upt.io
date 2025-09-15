<?php
session_start();
if (!isset($_SESSION['maso'])) {
  echo "Chưa đăng nhập";
  exit();
}

$maso = $_SESSION['maso'];
$serverName = "localhost";
$connectionInfo = array(
  "Database" => "QLSV",
  "UID" => "admin123",
  "PWD" => "123456Aa@",
  "CharacterSet" => "UTF-8"
);
$conn = sqlsrv_connect($serverName, $connectionInfo);
if (!$conn) {
  echo "Lỗi kết nối";
  exit();
}

$sql = "SELECT DD FROM DATA_SV WHERE MASO = ?";
$params = array($maso);
$stmt = sqlsrv_query($conn, $sql, $params);
$row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

if (!$row) {
  echo "Không tìm thấy dữ liệu";
  exit();
}

list($dadiemdanh, $tong) = explode("/", $row["DD"]);
$dadiemdanh = intval($dadiemdanh);
$tong = intval($tong);

if ($dadiemdanh < $tong) {
  $dadiemdanh++;
  $newDD = "$dadiemdanh/$tong";

  $update = "UPDATE DATA_SV SET DD = ? WHERE MASO = ?";
  sqlsrv_query($conn, $update, array($newDD, $maso));

  echo $newDD;
} else {
  echo "Đã điểm danh đủ";
}

sqlsrv_close($conn);
?>
