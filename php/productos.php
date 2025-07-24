<?php
// Establece el tipo de contenido como JSON y codificación UTF-8
header('Content-Type: application/json; charset=utf-8');

// Incluye el archivo de conexión a la base de datos
require 'conexion.php';

// Verifica si hubo error al conectar a la base de datos
if ($conn->connect_error) {
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $conn->connect_error]);
    exit;
}

// Consulta SQL para obtener los productos de la tabla 'ropa'
$sql = "SELECT id, descripcion, precio, imagen, stock FROM ropa";
$result = $conn->query($sql);

// Verifica si la consulta falló
if (!$result) {
    echo json_encode(['error' => 'Error en la consulta: ' . $conn->error]);
    exit;
}

// Crea un array vacío para guardar los productos
$productos = [];

// Recorre los resultados y convierte cada fila en un array asociativo
while ($fila = $result->fetch_assoc()) {
    $productos[] = [
        'id' => (int)$fila['id'],                 // ID del producto (entero)
        'descripcion' => $fila['descripcion'],   // Descripción del producto
        'precio' => (float)$fila['precio'],      // Precio (convertido a float)
        'imagen' => $fila['imagen'],             // Ruta o URL de imagen
        'stock' => (int)$fila['stock']           // Cantidad en stock (entero)
    ];
}

// Devuelve el array de productos en formato JSON
echo json_encode($productos);

// Cierra la conexión con la base de datos
$conn->close();
?>
