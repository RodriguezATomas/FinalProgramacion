<?php
header('Content-Type: application/json; charset=utf-8');
require 'conexion.php';

$sql = "SELECT id, descripcion, precio, imagen, stock FROM ropa";
$res = $conn->query($sql);

if (!$res) {
    echo json_encode(['error' => 'Error en la consulta: ' . $conn->error]);
    exit;
}

$productos = [];

while ($fila = $res->fetch_assoc()) {
    $productos[] = $fila;
}

echo json_encode($productos);
$conn->close();
?>