<?php
$serverName = "localhost";  // hoặc tên SQL Server
$connectionInfo = array(
    "Database" => "DATA_USER",
    "UID" => "admin123",       // tài khoản SQL Server
    "PWD" => "123456Aa@",      // mật khẩu
    "CharacterSet" => "UTF-8"
);

$conn = sqlsrv_connect($serverName, $connectionInfo);
if (!$conn) {
    die("❌ Kết nối thất bại: " . print_r(sqlsrv_errors(), true));
}

$tk = $_POST['tk'];
$mk = $_POST['mk'];

$sql = "SELECT * FROM User_reg WHERE TK = ? AND MK = ?";
$params = array($tk, $mk);
$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt && sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $thanhcong = true;
    
} else {
   $thanhcong = false;
}

sqlsrv_close($conn);
?>
<!DOCTYPE html>
<html>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta charset="UTF-8" />
    <title>Login Sucssec</title>
    <style>
        body{
            background-image: url("https://images.unsplash.com/photo-1542281286-9e0a16bb7366");
            background-size: cover;
        }
        .popou{
            background-color: blueviolet;
            color: white;
            margin: auto;
            text-align: center;
            width: 330px;
            height: 250px;
            border-radius: 30px;
        }
    </style>
    <body>
        <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br>
        
        
        <div class = "popou">
            <?php if($thanhcong): ?>
                        <div style="text-align: center; color: yellow;">
                            <br>
                            <h1>Login Thành Công</h1>
                            </div>
                      <br><h3 style ="color: rgb(78, 199, 218)">Click Ok Để Vào<br><br>
                     <button style="color: green; background-color: white;" onclick="nutok_thanhcong()">👉 OK👈</button>
                    <?php else: ?> 
                        <div style="text-align: center; color: yellow;">
                            <br>
                            <h1>Login Thất Bại</h1>
                            </div>
                      <br><p style ="color:rgb(78, 199, 218)">Click Ok Để Vào<br><br>
                       <button style="color: red; background-color: white;" onclick="nutok_thatbai()">👉 OK 👈</button>
                       <?php endif; ?>
                
        </div>
        <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br>
    </body>
    <script>
        function nutok_thanhcong(){
          fetch("https://api.ipify.org?format=json")
    .then(response => response.json())
    .then(data => { userIP = data.ip;})
    .catch(error => {
      console.error("Không thể lấy địa chỉ IP:", error);
      document.getElementById("user-ip").innerText = "Không xác định";
    });

     document.getElementById("nut-login").addEventListener("click", function () {
      const ipcung = "14.234.99.137";

      if (userIP === ipcung) {
        window.location.href = "sanpham.html";
      } else {
        window.location.href = "block.html";
      }
    });
        }
    </script>
    <script>
        function nutok_thatbai(){
            window.location.href = "dangky.html";
        }
    </script>
</html>
