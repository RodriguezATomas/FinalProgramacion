<?php
$conn = mysqli_connect("localhost", "root", "", "productos");
if (!$conn) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . mysqli_connect_error()]);
    exit;
}
mysqli_set_charset($conn, 'utf8');
?>