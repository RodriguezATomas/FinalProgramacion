const carrito = document.querySelector('#img-carrito'); 
const listaProductos = document.querySelector('#lista-productos .row');
const contenedorCarrito = document.querySelector('#lista-carrito tbody'); 
const vaciarCarritoBtn = document.querySelector('#vaciar-carrito'); 
const finalizarCompraBtn = document.querySelector('#finalizar-compra');
const formBuscador = document.querySelector('#form-buscador');
let articulosCarrito = []; 
let productosOriginales = [];

cargarEventListeners(); 
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando carga de productos'); // Depuración
    cargarProductos();
});

function cargarEventListeners() {
    if (!listaProductos) {
        console.error('Error: #lista-productos .row no encontrado en el DOM');
        return;
    }
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('agregar-carrito')) {
            e.preventDefault();
            const productoSeleccionado = e.target.closest('.card');
            if (!productoSeleccionado) {
                console.error('Error: No se encontró el elemento .card padre');
                return;
            }
            console.log('Producto seleccionado:', productoSeleccionado.innerHTML); // Depuración
            leerDatosProducto(productoSeleccionado);
        }
    });

    if (contenedorCarrito) {
        contenedorCarrito.addEventListener('click', eliminarProducto); 
    } else {
        console.error('Error: #lista-carrito tbody no encontrado en el DOM');
    }

    if (vaciarCarritoBtn) {
        vaciarCarritoBtn.addEventListener('click', () => { 
            articulosCarrito = []; 
            limpiarHTML(); 
        }); 
    } else {
        console.error('Error: #vaciar-carrito no encontrado en el DOM');
    }

    if (finalizarCompraBtn) {
        finalizarCompraBtn.addEventListener('click', finalizarCompra);
    } else {
        console.error('Error: #finalizar-compra no encontrado en el DOM');
    }

    if (formBuscador) {
        formBuscador.addEventListener('submit', (e) => {
            e.preventDefault();
            filtrarProductos();
        });
        formBuscador.querySelector('#buscador').addEventListener('input', filtrarProductos);
    } else {
        console.error('Error: #form-buscador no encontrado en el DOM');
    }
}

function eliminarProducto(e) {
    e.preventDefault(); // Evitar recarga de la página
    if (e.target.classList.contains('borrar-producto')) {
        const productoId = e.target.getAttribute('data-id'); 
        console.log('Eliminando producto con ID:', productoId); // Depuración
        articulosCarrito = articulosCarrito.filter(producto => producto.id !== productoId);  
        carritoHTML(); 
    }
}

function leerDatosProducto(producto) { 
    const img = producto.querySelector('img');
    const h4 = producto.querySelector('h4');
    const precioSpan = producto.querySelector('.precio span');
    const link = producto.querySelector('a[data-id]');

    if (!img || !h4 || !precioSpan || !link) {
        console.error('Error: No se encontraron todos los elementos necesarios en la card', {
            img: !!img,
            h4: !!h4,
            precioSpan: !!precioSpan,
            link: !!link
        });
        return;
    }

    const infoProducto = { 
        imagen: img.src, 
        titulo: h4.textContent,
        precio: precioSpan.textContent,
        id: link.getAttribute('data-id'),
        cantidad: 1
    };

    console.log('Agregando producto al carrito:', infoProducto); // Depuración

    const existe = articulosCarrito.some(producto => producto.id === infoProducto.id); 
    if (existe) {
        articulosCarrito = articulosCarrito.map(producto => {
            if (producto.id === infoProducto.id) {
                producto.cantidad++;
                return producto; 
            }
            return producto;
        });
    } else {
        articulosCarrito = [...articulosCarrito, infoProducto];
    }

    carritoHTML(); 
}

function carritoHTML() { 
    limpiarHTML(); 
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
        if (contenedorCarrito) {
            contenedorCarrito.appendChild(row); 
        } else {
            console.error('Error: #lista-carrito tbody no encontrado en el DOM');
        }
        console.log('Añadiendo fila al carrito con imagen:', imagen); // Depuración
    });
}

function limpiarHTML() {
    if (!contenedorCarrito) {
        console.error('Error: #lista-carrito tbody no encontrado en el DOM');
        return;
    }
    while (contenedorCarrito.firstChild) { 
        contenedorCarrito.removeChild(contenedorCarrito.firstChild); 
    }
}

function cargarProductos() {
    fetch('php/productos.php')
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error en la solicitud: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then(productos => {
            console.log('Productos recibidos:', productos); // Depuración
            if (productos.length === 0) {
                console.warn('No se encontraron productos en la base de datos');
                listaProductos.innerHTML = '<p>No hay productos disponibles.</p>';
            } else {
                productosOriginales = productos;
                mostrarProductos(productos);
            }
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
            listaProductos.innerHTML = '<p>Error al cargar los productos. Por favor, intenta de nuevo.</p>';
        });
}

function mostrarProductos(productos) {
    if (!listaProductos) {
        console.error('Error: #lista-productos .row no encontrado en el DOM');
        return;
    }
    listaProductos.innerHTML = ''; // Limpiar el contenedor
    productos.forEach(producto => {
        const { id, descripcion, precio, imagen } = producto;
        const imgSrc = imagen && imagen !== '' ? imagen : 'https://via.placeholder.com/150';
        console.log('Renderizando imagen:', imgSrc); // Depuración

        const card = document.createElement('div');
        card.classList.add('four', 'columns');
        card.innerHTML = `
            <div class="card">
                <img src="${imgSrc}" class="imagen-curso u-full-width" onerror="this.src='https://via.placeholder.com/150'">
                <div class="info-card">
                    <h4>${descripcion}</h4>
                    <p class="precio">$<span>${precio}</span></p>
                    <a href="#" class="u-full-width button-primary button input agregar-carrito" data-id="${id}">Agregar al carrito</a>
                </div>
            </div>
        `;
        listaProductos.appendChild(card);
    });
    console.log('Cards renderizadas en #lista-productos .row'); // Depuración
}

function filtrarProductos() {
    const textoBusqueda = document.querySelector('#buscador').value.toLowerCase().trim();
    console.log('Buscando:', textoBusqueda);

    if (!productosOriginales.length) {
        console.warn('No hay productos cargados para filtrar');
        return;
    }

    const productosFiltrados = productosOriginales.filter(producto => 
        producto.descripcion.toLowerCase().includes(textoBusqueda)
    );

    console.log('Productos filtrados:', productosFiltrados);

    if (productosFiltrados.length === 0) {
        listaProductos.innerHTML = '<p>No se encontraron productos</p>';
    } else {
        mostrarProductos(productosFiltrados);
    }
}

function finalizarCompra() {
    if (articulosCarrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    console.log('Enviando datos al servidor:', JSON.stringify(articulosCarrito, null, 2)); // Depuración

    fetch('php/finalizar_compra.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(articulosCarrito)
    })
    .then(res => {
        console.log('Respuesta del servidor:', { status: res.status, statusText: res.statusText }); // Depuración
        if (!res.ok) {
            throw new Error(`Error en la solicitud: ${res.status} ${res.statusText}`);
        }
        return res.json();
    })
    .then(data => {
        console.log('Datos recibidos del servidor:', data); // Depuración
        if (data.success) {
            alert('Compra finalizada con éxito');
            articulosCarrito = [];
            limpiarHTML();
        } else {
            alert('Error al finalizar la compra: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error al finalizar la compra:', error); // Depuración
        alert('Error al finalizar la compra: ' + error.message);
    });
}