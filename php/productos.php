<?php
header('Content-Type: application/json; charset=utf-8');
require 'conexion.php';

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $conn->connect_error]);
    exit;
}

$sql = "SELECT id, descripcion, precio, imagen, stock FROM ropa";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode(['error' => 'Error en la consulta: ' . $conn->error]);
    exit;
}

$productos = [];
while ($fila = $result->fetch_assoc()) {
    $productos[] = [
        'id' => (int)$fila['id'],
        'descripcion' => $fila['descripcion'],
        'precio' => (float)$fila['precio'],
        'imagen' => $fila['imagen'],
        'stock' => (int)$fila['stock']
    ];
}

echo json_encode($productos);
$conn->close();
?>