const carrito = document.querySelector('#carrito'); 
const listaProductos = document.querySelector('#lista-productos .row');
const contenedorCarrito = document.querySelector('#lista-carrito tbody'); 
const vaciarCarritoBtn = document.querySelector('#vaciar-carrito'); 
let articulosCarrito = []; 

cargarEventListeners(); 
document.addEventListener('DOMContentLoaded', cargarProductos);

function cargarEventListeners(){
    listaProductos.addEventListener('click', agregarProducto); 
    carrito.addEventListener('click', eliminarProducto); 
    vaciarCarritoBtn.addEventListener('click', () => { 
        articulosCarrito = []; 
        limpiarHTML(); 
    }); 
}

function agregarProducto(e){
    e.preventDefault(); 
    if(e.target.classList.contains('agregar-carrito')){ 
        const productoSeleccionado = e.target.parentElement;
        leerDatosProducto(productoSeleccionado);
    }
}

function eliminarProducto(e){
    if(e.target.classList.contains('borrar-producto')){
        const productoId = e.target.getAttribute('data-id'); 
        articulosCarrito = articulosCarrito.filter( producto => producto.id !== productoId);  
        carritoHTML(); 
    }
}

function leerDatosProducto(producto){ 
    const infoProducto = { 
        imagen: producto.querySelector('img').src,
        titulo: producto.querySelector('h4').textContent,
        precio: producto.querySelector('.precio span').textContent,
        id: producto.querySelector('a').getAttribute('data-id'),
        cantidad: 1
    };

    const existe = articulosCarrito.some(producto => producto.id === infoProducto.id); 
    if(existe){
        articulosCarrito = articulosCarrito.map(producto => {
            if(producto.id === infoProducto.id){
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

function carritoHTML(){ 
    limpiarHTML(); 
    articulosCarrito.forEach( producto =>{ 
        const {imagen, titulo, precio, cantidad, id} = producto;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${imagen}" width="100"></td>
            <td>${titulo}</td>
            <td>${precio}</td>
            <td>${cantidad}</td>
            <td><a href="#" class="borrar-producto" data-id="${id}"> X </a></td>
        `;
        contenedorCarrito.appendChild(row); 
    });
}

function limpiarHTML(){
    while(contenedorCarrito.firstChild){ 
        contenedorCarrito.removeChild(contenedorCarrito.firstChild); 
    }
}

function cargarProductos() {
    const categorias = [
        'mens-shirts',
        'mens-shoes',
        'womens-dresses',
        'womens-shoes',
        'tops',
        'womens-bags'
    ];

    const promesas = categorias.map(categoria =>
        fetch(`https://dummyjson.com/products/category/${categoria}`)
            .then(res => res.json())
            .then(data => data.products)
    );

    Promise.all(promesas)
        .then(resultados => {
            const todosLosProductos = resultados.flat(); // Combina todos los arrays
            mostrarProductos(todosLosProductos);
        })
        .catch(error => console.error('Error al cargar productos:', error));
}

function mostrarProductos(productos) {
    productos.forEach(producto => {
        const { id, title, thumbnail, price } = producto;

        const card = document.createElement('div');
        card.classList.add('four', 'columns');
        card.innerHTML = `
            <div class="card">
                <img src="${thumbnail}" class="imagen-curso u-full-width">
                <div class="info-card">
                    <h4>${title}</h4>
                    <p class="precio">$${price}</p>
                    <a href="#" class="u-full-width button-primary button input agregar-carrito" data-id="${id}">Agregar al carrito</a>
                </div>
            </div>
        `;
        listaProductos.appendChild(card);
    });
}
