<?php
session_start();
if (!isset($_SESSION['maso'])) {
  header("Location: login1.php");
  exit();
}

$serverName = "localhost";
$connectionInfo = array(
  "Database" => "QLSV",
  "UID" => "admin123",
  "PWD" => "123456Aa@",
  "CharacterSet" => "UTF-8"
);
$conn = sqlsrv_connect($serverName, $connectionInfo);
if (!$conn) {
  die("Kết nối thất bại.");
}

$maso = $_SESSION['maso'];
$sql = "SELECT TEN, MONHOC, DD FROM DATA_SV WHERE MASO = ?";
$params = array($maso);
$query = sqlsrv_query($conn, $sql, $params);
$data = sqlsrv_fetch_array($query, SQLSRV_FETCH_ASSOC);

$ten = $data['TEN'];
$monhoc = $data['MONHOC'];
$dd = $data['DD'];

sqlsrv_close($conn);
?>

<!DOCTYPE html>
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
<html>
<head>
  <meta charset="UTF-8">
  <title>Điểm Danh</title>
  <style>
    .foote {
      margin: auto;
      width: 400px;
      text-align: center;
      background-color: aqua;
      color: black;
      border-radius: 30px;
      font-weight: bold;
    }
    table {
      width: 50%;
      margin: auto;
    }
    th, td {
      padding: 20px;
      text-align: center;
    }
    th {
      background-color: burlywood;
    }
    .diemdanh {
      background-color: cadetblue;
      border-radius: 35px;
    }
    .diemdanh:hover {
      background-color: green;
    }
    .box-noti {
      background-color: aqua;
      color: black;
      border-radius: 30px;
      width: 400px;
      margin: auto;
      display: none;
      text-align: center;
    }
  </style>
</head>

<body>
  <div class="foote">
    <h3>Quản Lí Điểm Danh</h3>
  </div>

  <div style="text-align: center;">
    <h2>👋 Chào Sinh Viên: <span style="color:blue;"><?php echo $ten; ?></span></h2>
    <p>Môn học hôm nay: <strong><?php echo $monhoc; ?></strong></p>
  </div>

  <table border="2">
    <tr>
      <th>Môn Học</th>
      <th>Điểm Danh</th>
      <th>Số Lần Điểm Danh</th>
    </tr>
    <tr>
      <td><?php echo $monhoc; ?></td>
      <td><button class="diemdanh" onclick="diemdanh()">Điểm Danh Ngay</button></td>
      <td id="sodiemdanh"><?php echo $dd; ?></td>
    </tr>
  </table>

  <div class="box-noti" id="noti"></div>

  <script>
    let diemdanh_1 = false;

    fetch("https://api.ipify.org/?format=json")
      .then(res => res.json())
      .then(data => {
        if (data.ip === "14.234.99.138") {
          diemdanh_1 = true;
        }
      });

    function diemdanh() {
      const noti = document.getElementById("noti");
      noti.style.display = "block";

      if (diemdanh_1) {
        fetch("diemdanh.php")
          .then(res => res.text())
          .then(data => {
            if (data.includes("/")) {
              document.getElementById("sodiemdanh").innerText = data;
              noti.innerText = "✅ Điểm danh thành công!";
            } else {
              noti.innerText = "⚠ " + data;
            }
          })
          .catch(err => {
            noti.innerText = "Lỗi hệ thống!";
            console.error(err);
          });
      } else {
        noti.innerText = "❌ Bạn không có quyền điểm danh từ IP này.";
      }
    }
  </script>
</body>
</html>
