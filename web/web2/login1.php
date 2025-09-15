<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $serverName = "localhost";
  $connectionInfo = array(
    "Database" => "QLSV",
    "UID" => "admin123",
    "PWD" => "123456Aa@",
    "CharacterSet" => "UTF-8"
  );

  $conn = sqlsrv_connect($serverName, $connectionInfo);
  if (!$conn) {
    die("❌ Không thể kết nối cơ sở dữ liệu.");
  }

  $maso = strtoupper(trim($_POST["mssv"])); // xử lý MSSV chuẩn
  $sql = "SELECT * FROM DATA_SV WHERE MASO = ?";
  $params = array($maso);
  $query = sqlsrv_query($conn, $sql, $params);

  if ($query && sqlsrv_has_rows($query)) {
    $_SESSION['maso'] = $maso;
    echo "<script>window.location.href='sinhvien.php';</script>";
  } else {
    echo "<script>alert('❌ Sai MSSV hoặc không tồn tại');</script>";
  }

  sqlsrv_close($conn);
}
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trang Login</title>
  <style>
    body {
      background-image: url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80');
      background-size: cover;
      background-position: center;
      color: brown;
      font-family: Arial, sans-serif;
    }

    .nutlogin {
      height: 40px;
      width: 100px;
      padding: 10px;
      background-color: blue;
      color: aliceblue;
      text-align: center;
      border-radius: 12px;
      border: none;
      cursor: pointer;
    }

    .nutlogin:hover {
      background-color: green;
    }

    .nutdangky {
      text-align: center;
      color: yellow;
      cursor: pointer;
    }

    .nutdangky:hover {
      color: blue;
    }

    .nutbyanhtu {
      text-align: center;
      background-color: yellow;
      color: green;
      border-radius: 20px;
      border: none;
      padding: 10px 20px;
      cursor: pointer;
    }

    .nutbyanhtu:hover {
      background-color: turquoise;
      color: blue;
    }

    .login-box {
      width: 250px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      margin: auto;
      text-align: center;
      margin-top: 30px;
    }

    .box-ip {
      margin: auto;
      background-color: white;
      color: green;
      text-align: center;
      width: 250px;
      border-radius: 40px;
      padding: 10px;
    }

    input[type="text"] {
      width: 90%;
      padding: 8px;
      border-radius: 8px;
      border: 1px solid gray;
    }
  </style>
</head>

<body>
  <img src="https://anhtx1u11.github.io/admintuupt.github.io/A-Main/logotu-fotor-20250509173456.png" width="80px" height="80px" onclick="window.location.href='login.php'">
  
  <h1 style="text-align: center; color: green;">Chào Các Bạn Đến Với Trang Login</h1>

  <h4 style="text-align: center;">
    <span style="color: blue;">Bạn Chưa Có Tài Khoản? ==> </span>
    <span class="nutdangky" onclick="dangky()">Đăng Ký</span>
  </h4>

  <form method="POST" action="">
    <div class="login-box">
      <h2 style="color: green;">Login</h2>
      <br>
      <input type="text" name="mssv" id="mssv" placeholder="------ Nhập MSSV ------" required><br><br>
      <label><input type="checkbox" name="remember"> Ghi nhớ?</label><br><br>
      <input id="nut-login" class="nutlogin" type="submit" value="Login">
    </div>
  </form>

  <br><br>

  <div class="box-ip">
    <h3>🌐 IP Hiện Tại: <span id="user-ip">Đang kiểm tra...</span></h3>
  </div>

  <div style="text-align: center; margin-top: 20px;">
    <button id="nutbyanhtu" class="nutbyanhtu" onclick="nutbyanhtu()">© Design By --> Anh Tú K16THO0070</button>
  </div>

  <script>
    let userIP = "";

    fetch("https://api.ipify.org?format=json")
      .then(response => response.json())
      .then(data => {
        userIP = data.ip;
        if (userIP === "14.234.99.138") {
          document.getElementById("user-ip").innerText = "IP UPT";
        } else {
          document.getElementById("user-ip").innerText = "IP Ngoài";
        }
      })
      .catch(error => {
        console.error("Không thể lấy địa chỉ IP:", error);
        document.getElementById("user-ip").innerText = "Không xác định";
      });

    function dangky() {
      window.location.href = "dangky.html";
    }

    function nutbyanhtu() {
      window.location.href = "https://bom.so/fbtu";
    }

    document.getElementById("nut-login").addEventListener("click", function (event) {
      const ipcung = "14.234.99.138";
      if (userIP !== ipcung) {
        event.preventDefault(); // chặn submit nếu IP không đúng
        window.location.href = "block.html";
      }
    });
  </script>
</body>
</html>
