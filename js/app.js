// === Selección de elementos del DOM ===
const carrito = document.querySelector('#img-carrito'); // Icono o imagen del carrito
const listaProductos = document.querySelector('#lista-productos .row'); // Contenedor de productos
const contenedorCarrito = document.querySelector('#lista-carrito tbody'); // Contenedor donde se mostrarán los productos en el carrito
const vaciarCarritoBtn = document.querySelector('#vaciar-carrito'); // Botón para vaciar todo el carrito
const finalizarCompraBtn = document.querySelector('#finalizar-compra'); // Botón para finalizar la compra
const formBuscador = document.querySelector('#form-buscador'); // Formulario de búsqueda

let articulosCarrito = []; // Lista de productos agregados al carrito
let productosOriginales = []; // Lista original de productos traídos desde la base de datos (para filtrado)

// === Inicialización ===
cargarEventListeners(); // Carga los listeners de eventos

// Cuando se termina de cargar el DOM, se cargan los productos desde PHP
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando carga de productos');
    cargarProductos(); // Trae productos desde productos.php
});

// === Función para cargar todos los eventos ===
function cargarEventListeners() {
    // Si el contenedor de productos no está, se lanza error
    if (!listaProductos) {
        console.error('Error: #lista-productos .row no encontrado en el DOM');
        return;
    }

    // Evento para agregar productos al carrito
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('agregar-carrito')) {
            e.preventDefault();
            const productoSeleccionado = e.target.closest('.card');
            if (!productoSeleccionado) {
                console.error('Error: No se encontró el elemento .card padre');
                return;
            }
            console.log('Producto seleccionado:', productoSeleccionado.innerHTML);
            leerDatosProducto(productoSeleccionado); // Extrae datos del producto y lo agrega al carrito
        }
    });

    // Evento para eliminar productos desde el carrito
    if (contenedorCarrito) {
        contenedorCarrito.addEventListener('click', eliminarProducto);
    } else {
        console.error('Error: #lista-carrito tbody no encontrado en el DOM');
    }

    // Evento para vaciar el carrito
    if (vaciarCarritoBtn) {
        vaciarCarritoBtn.addEventListener('click', () => {
            articulosCarrito = []; // Vacía el array
            limpiarHTML(); // Limpia la tabla del carrito
        });
    }

    // Evento para finalizar la compra
    if (finalizarCompraBtn) {
        finalizarCompraBtn.addEventListener('click', finalizarCompra);
    }

    // Eventos para búsqueda (submit y mientras se escribe)
    if (formBuscador) {
        formBuscador.addEventListener('submit', (e) => {
            e.preventDefault();
            filtrarProductos();
        });
        formBuscador.querySelector('#buscador').addEventListener('input', filtrarProductos);
    }
}

// === Elimina un producto del carrito ===
function eliminarProducto(e) {
    e.preventDefault();
    if (e.target.classList.contains('borrar-producto')) {
        const productoId = e.target.getAttribute('data-id');
        console.log('Eliminando producto con ID:', productoId);
        // Se filtra para mantener solo los productos distintos al eliminado
        articulosCarrito = articulosCarrito.filter(producto => producto.id !== productoId);
        carritoHTML(); // Vuelve a renderizar el carrito
    }
}

// === Lee los datos del producto y lo agrega al carrito ===
function leerDatosProducto(producto) {
    // Extrae los datos de la tarjeta del producto
    const img = producto.querySelector('img');
    const h4 = producto.querySelector('h4');
    const precioSpan = producto.querySelector('.precio span');
    const link = producto.querySelector('a[data-id]');
    const stockSpan = producto.querySelector('.stock');

    // Verifica que todos los elementos existan
    if (!img || !h4 || !precioSpan || !link || !stockSpan) {
        console.error('Error: No se encontraron todos los elementos necesarios en la card', {
            img: !!img,
            h4: !!h4,
            precioSpan: !!precioSpan,
            link: !!link,
            stockSpan: !!stockSpan
        });
        return;
    }

    // Crea un objeto con la información del producto
    const infoProducto = {
        imagen: img.src,
        titulo: h4.textContent,
        precio: precioSpan.textContent,
        id: link.getAttribute('data-id'),
        cantidad: 1,
        stock: parseInt(stockSpan.textContent)
    };

    // Verifica que no se exceda el stock al agregarlo
    const enCarrito = articulosCarrito.reduce((total, p) => p.id === infoProducto.id ? total + p.cantidad : total, 0);
    if (enCarrito + 1 > infoProducto.stock) {
        alert(`No hay suficiente stock para ${infoProducto.titulo}. Stock disponible: ${infoProducto.stock}`);
        return;
    }

    // Si ya existe el producto, incrementa su cantidad
    const existe = articulosCarrito.some(producto => producto.id === infoProducto.id);
    if (existe) {
        articulosCarrito = articulosCarrito.map(producto => {
            if (producto.id === infoProducto.id) {
                if (producto.cantidad + 1 > infoProducto.stock) {
                    alert(`No hay suficiente stock para ${infoProducto.titulo}. Stock disponible: ${infoProducto.stock}`);
                    return producto;
                }
                producto.cantidad++;
                return producto;
            }
            return producto;
        });
    } else {
        // Si no existe, lo agrega al array
        articulosCarrito = [...articulosCarrito, infoProducto];
    }

    carritoHTML(); // Muestra el carrito en el HTML
}

// === Muestra los productos del carrito en el HTML ===
function carritoHTML() {
    limpiarHTML(); // Limpia antes de renderizar

    articulosCarrito.forEach(producto => {
        const { imagen, titulo, precio, cantidad, id } = producto;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${imagen}" width="100" onerror="this.src='https://via.placeholder.com/150'"></td>
            <td>${titulo}</td>
            <td>${precio}</td>
            <td>${cantidad}</td>
            <td><a href="#" class="borrar-producto" data-id="${id}"> X </a></td>
        `;
        contenedorCarrito.appendChild(row); // Lo agrega a la tabla
    });
}

// === Limpia el contenido del carrito en la vista HTML ===
function limpiarHTML() {
    while (contenedorCarrito.firstChild) {
        contenedorCarrito.removeChild(contenedorCarrito.firstChild);
    }
}

// === Carga los productos desde PHP ===
function cargarProductos() {
    fetch('php/productos.php')
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error en la solicitud: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then(productos => {
            if (productos.length === 0) {
                listaProductos.innerHTML = '<p>No hay productos disponibles.</p>';
            } else {
                productosOriginales = productos; // Guarda todos los productos para búsquedas
                mostrarProductos(productos); // Los muestra en pantalla
            }
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
            listaProductos.innerHTML = '<p>Error al cargar los productos. Por favor, intenta de nuevo.</p>';
        });
}

// === Muestra los productos en el HTML como tarjetas ===
function mostrarProductos(productos) {
    listaProductos.innerHTML = '';
    productos.forEach(producto => {
        const { id, descripcion, precio, imagen, stock } = producto;
        const imgSrc = imagen && imagen !== '' ? imagen : 'https://via.placeholder.com/150';

        const card = document.createElement('div');
        card.classList.add('four', 'columns');
        card.innerHTML = `
            <div class="card">
                <img src="${imgSrc}" class="imagen-curso u-full-width" onerror="this.src='https://via.placeholder.com/150'">
                <div class="info-card">
                    <h4>${descripcion}</h4>
                    <p class="precio">$<span>${precio}</span></p>
                    <p class="stock">Stock: ${stock}</p>
                    <a href="#" class="u-full-width button-primary button input agregar-carrito" data-id="${id}">Agregar al carrito</a>
                </div>
            </div>
        `;
        listaProductos.appendChild(card); // Agrega la tarjeta al contenedor
    });
}

// === Filtra los productos según el texto ingresado ===
function filtrarProductos() {
    const textoBusqueda = document.querySelector('#buscador').value.toLowerCase().trim();

    if (!productosOriginales.length) return;

    const productosFiltrados = productosOriginales.filter(producto =>
        producto.descripcion.toLowerCase().includes(textoBusqueda)
    );

    if (productosFiltrados.length === 0) {
        listaProductos.innerHTML = '<p>No se encontraron productos</p>';
    } else {
        mostrarProductos(productosFiltrados); // Muestra resultados filtrados
    }
}

// === Envía la compra al servidor y vacía el carrito ===
async function finalizarCompra() {
    if (articulosCarrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    try {
        const res = await fetch('php/finalizar_compra.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(articulosCarrito) // Envío como JSON
        });

        if (!res.ok) {
            throw new Error(`Error en la solicitud: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        if (data.success) {
            alert('Compra finalizada con éxito');
            articulosCarrito = []; // Vacía el carrito
            limpiarHTML(); // Limpia la tabla
            cargarProductos(); // Recarga productos actualizados (por el stock)
        } else {
            alert('Error al finalizar la compra: ' + data.message);
        }
    } catch (error) {
        console.error('Error al finalizar la compra:', error);
        alert('Error al finalizar la compra: ' + error.message);
    }
}