document.addEventListener("DOMContentLoaded", () => {
    mostrarClientes();

    document.getElementById("form-cliente").addEventListener("submit", registrarNuevoCliente);

    document.getElementById("buscar-cliente").addEventListener("input", mostrarClientes);
});

function registrarNuevoCliente(evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const correo = document.getElementById("correo").value.trim();

    if (!nombre || !telefono) {
        alert("Completa el nombre y el teléfono.");
        return;
    }

    const clientes = obtenerDatos("clientes");

    const existe = clientes.some(cliente => cliente.telefono === telefono);

    if (existe) {
        alert("Este teléfono ya está registrado.");
        return;
    }

    registrarCliente({
        nombre,
        telefono,
        correo
    });

    document.getElementById("form-cliente").reset();

    mostrarClientes();

    alert("Cliente registrado correctamente.");
}

function mostrarClientes() {
    const tabla = document.getElementById("tabla-clientes");
    const busqueda = document.getElementById("buscar-cliente").value.toLowerCase();

    const clientes = obtenerDatos("clientes");

    const filtrados = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(busqueda) ||
        cliente.telefono.includes(busqueda)
    );

    tabla.innerHTML = "";

    if (filtrados.length === 0) {
        tabla.innerHTML = `<tr><td colspan="5">No se encontraron clientes.</td></tr>`;
        return;
    }

    filtrados.forEach(cliente => {
        const fila = document.createElement("tr");

        const id = document.createElement("td");
        id.textContent = cliente.id;

        const nombre = document.createElement("td");
        nombre.textContent = cliente.nombre;

        const telefono = document.createElement("td");
        telefono.textContent = cliente.telefono;

        const correo = document.createElement("td");
        correo.textContent = cliente.correo || "Sin correo";

        const acciones = document.createElement("td");

        const editar = document.createElement("button");
        editar.textContent = "Editar";
        editar.className = "btn";
        editar.addEventListener("click", () => editarCliente(cliente.id));

        const eliminar = document.createElement("button");
        eliminar.textContent = "Eliminar";
        eliminar.className = "btn";
        eliminar.addEventListener("click", () => eliminarCliente(cliente.id));

        acciones.append(editar, eliminar);
        fila.append(id, nombre, telefono, correo, acciones);

        tabla.appendChild(fila);
    });
}

function editarCliente(id) {
    const clientes = obtenerDatos("clientes");
    const cliente = clientes.find(item => item.id === id);

    if (!cliente) return;

    const nombre = prompt("Nombre del cliente:", cliente.nombre);
    if (nombre === null) return;

    const telefono = prompt("Teléfono:", cliente.telefono);
    if (telefono === null) return;

    const correo = prompt("Correo electrónico:", cliente.correo || "");
    if (correo === null) return;

    if (!nombre.trim() || !telefono.trim()) {
        alert("El nombre y el teléfono son obligatorios.");
        return;
    }

    const telefonoExiste = clientes.some(item =>
        item.id !== id && item.telefono === telefono.trim()
    );

    if (telefonoExiste) {
        alert("Ese teléfono ya pertenece a otro cliente.");
        return;
    }

    cliente.nombre = nombre.trim();
    cliente.telefono = telefono.trim();
    cliente.correo = correo.trim();

    guardarDatos("clientes", clientes);

    mostrarClientes();

    alert("Cliente actualizado correctamente.");
}

function eliminarCliente(id) {
    if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;

    const clientes = obtenerDatos("clientes");
    const nuevosClientes = clientes.filter(cliente => cliente.id !== id);

    guardarDatos("clientes", nuevosClientes);

    mostrarClientes();

    alert("Cliente eliminado correctamente.");
}
