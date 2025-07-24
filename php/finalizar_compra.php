<?php
// Habilitar depuración (quitar en producción)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Asegurar que siempre se devuelva JSON
header('Content-Type: application/json; charset=utf-8');

require 'conexion.php';

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos: ' . $conn->connect_error]);
    exit;
}

// Obtener datos del carrito
$input = file_get_contents('php://input');
$carrito = json_decode($input, true);

// Validar datos recibidos
if (!$carrito || !is_array($carrito)) {
    echo json_encode(['success' => false, 'message' => 'Datos del carrito inválidos o vacíos']);
    exit;
}

// Iniciar transacción
$conn->begin_transaction();

try {
    // Insertar pedido
    $sql_pedido = "INSERT INTO pedidos (fecha) VALUES (NOW())";
    if (!$conn->query($sql_pedido)) {
        throw new Exception('Error al crear el pedido: ' . $conn->error);
    }
    $pedido_id = $conn->insert_id;

    // Preparar consulta para detalles del pedido
    $sql_detalle = "INSERT INTO pedidos_detalle (pedido_id, producto_id, cantidad, precio, imagen) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql_detalle);
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta de detalles: ' . $conn->error);
    }

    // Procesar cada producto
    foreach ($carrito as $producto) {
        if (!isset($producto['id'], $producto['cantidad'], $producto['precio'], $producto['imagen'])) {
            throw new Exception('Datos incompletos para el producto: ' . json_encode($producto));
        }

        $id = (int)$producto['id'];
        $cantidad = (int)$producto['cantidad'];
        $precio = floatval($producto['precio']);
        $imagen = $producto['imagen'];

        // Verificar y bloquear stock
        $sql_stock = "SELECT stock FROM ropa WHERE id = ? FOR UPDATE";
        $stmt_stock = $conn->prepare($sql_stock);
        if (!$stmt_stock) {
            throw new Exception('Error al preparar la consulta de stock: ' . $conn->error);
        }
        $stmt_stock->bind_param('i', $id);
        $stmt_stock->execute();
        $result = $stmt_stock->get_result();
        $row = $result->fetch_assoc();
        if (!$row || $row['stock'] < $cantidad) {
            throw new Exception('Stock insuficiente para el producto ID: ' . $id);
        }

        // Insertar detalle del pedido
        $stmt->bind_param('iiids', $pedido_id, $id, $cantidad, $precio, $imagen);
        if (!$stmt->execute()) {
            throw new Exception('Error al guardar detalle del pedido: ' . $conn->error);
        }

        // Actualizar stock
        $sql_update_stock = "UPDATE ropa SET stock = stock - ? WHERE id = ?";
        $stmt_update = $conn->prepare($sql_update_stock);
        if (!$stmt_update) {
            throw new Exception('Error al preparar la actualización de stock: ' . $conn->error);
        }
        $stmt_update->bind_param('ii', $cantidad, $id);
        if (!$stmt_update->execute()) {
            throw new Exception('Error al actualizar el stock: ' . $conn->error);
        }
    }

    // Confirmar transacción
    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Compra finalizada con éxito']);
} catch (Exception $e) {
    // Revertir transacción
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>