document.addEventListener("DOMContentLoaded", () => {
    mostrarProductos();

    document.getElementById("form-producto").addEventListener("submit", registrarNuevoProducto);

    document.getElementById("buscar-producto").addEventListener("input", mostrarProductos);
});

function registrarNuevoProducto(evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre-producto").value.trim();
    const categoria = document.getElementById("categoria-producto").value;
    const precio = Number(document.getElementById("precio-producto").value);
    const stock = Number(document.getElementById("stock-producto").value);

    if (!nombre || !categoria || precio <= 0 || stock < 0 || !Number.isInteger(stock)) {
        alert("Verifica los datos del producto.");
        return;
    }

    const productos = obtenerDatos("productos");

    const existe = productos.some(producto =>
        producto.nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (existe) {
        alert("Este producto ya está registrado.");
        return;
    }

    registrarProducto({
        nombre,
        categoria,
        precio,
        stock
    });

    document.getElementById("form-producto").reset();

    mostrarProductos();

    alert("Producto registrado correctamente.");
}

function mostrarProductos() {
    const tabla = document.getElementById("tabla-productos");
    const busqueda = document.getElementById("buscar-producto").value.toLowerCase();

    const productos = obtenerDatos("productos");

    const filtrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(busqueda) ||
        producto.categoria.toLowerCase().includes(busqueda)
    );

    tabla.innerHTML = "";

    filtrados.forEach(producto => {
        const fila = document.createElement("tr");

        const valores = [
            producto.id,
            producto.nombre,
            producto.categoria,
            "Bs " + Number(producto.precio).toFixed(2),
            producto.stock,
            producto.stock > 0 ? "Disponible" : "Agotado"
        ];

        valores.forEach((valor, indice) => {
            const celda = document.createElement("td");
            celda.textContent = valor;

            if (indice === 5) {
                celda.className = producto.stock > 0 ? "estado disponible" : "estado ocupada";
            }

            fila.appendChild(celda);
        });

        const acciones = document.createElement("td");

        const editar = document.createElement("button");
        editar.textContent = "Editar";
        editar.className = "btn";
        editar.addEventListener("click", () => editarProducto(producto.id));

        const eliminar = document.createElement("button");
        eliminar.textContent = "Eliminar";
        eliminar.className = "btn";
        eliminar.addEventListener("click", () => eliminarProducto(producto.id));

        acciones.append(editar, eliminar);
        fila.appendChild(acciones);

        tabla.appendChild(fila);
    });

    actualizarResumenProductos(productos);
}

function actualizarResumenProductos(productos) {
    document.getElementById("total-productos").textContent = productos.length;

    document.getElementById("total-stock").textContent =
        productos.reduce((total, producto) => total + Number(producto.stock), 0);

    document.getElementById("productos-agotados").textContent =
        productos.filter(producto => Number(producto.stock) === 0).length;
}

function editarProducto(id) {
    const productos = obtenerDatos("productos");
    const producto = productos.find(item => item.id === id);

    if (!producto) return;

    const nombre = prompt("Nombre del producto:", producto.nombre);
    if (nombre === null) return;

    const categoria = prompt("Categoría:", producto.categoria);
    if (categoria === null) return;

    const precio = prompt("Precio en Bs:", producto.precio);
    if (precio === null) return;

    const stock = prompt("Cantidad en stock:", producto.stock);
    if (stock === null) return;

    const precioNuevo = Number(precio);
    const stockNuevo = Number(stock);

    if (!nombre.trim() || !categoria.trim() || !Number.isFinite(precioNuevo) || precioNuevo <= 0 || !Number.isInteger(stockNuevo) || stockNuevo < 0) {
        alert("Los datos ingresados no son válidos.");
        return;
    }

    producto.nombre = nombre.trim();
    producto.categoria = categoria.trim();
    producto.precio = precioNuevo;
    producto.stock = stockNuevo;

    guardarDatos("productos", productos);

    mostrarProductos();

    alert("Producto actualizado correctamente.");
}

function eliminarProducto(id) {
    if (!confirm("¿Deseas eliminar este producto?")) return;

    const productos = obtenerDatos("productos");
    const nuevosProductos = productos.filter(producto => producto.id !== id);

    guardarDatos("productos", nuevosProductos);

    mostrarProductos();

    alert("Producto eliminado correctamente.");
}
