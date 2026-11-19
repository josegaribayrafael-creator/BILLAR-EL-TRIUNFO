
document.addEventListener("DOMContentLoaded", async function () {
    const formulario = document.getElementById("form-cliente");
    const tabla = document.getElementById("lista-clientes");
    const buscador = document.getElementById("buscar-cliente");

    if (!formulario || !tabla) {
        console.error("No se encontró el formulario o la tabla de clientes.");
        return;
    }

    try {
        await cargarDatos();
    } catch (error) {
        console.error("Error al preparar los datos:", error);
    }

    function mostrarClientes(filtro = "") {
        const clientes = obtenerDatos("clientes");

        const filtrados = clientes.filter(cliente => {
            const nombre = (cliente.nombre || "").toLowerCase();
            const celular = String(cliente.telefono || cliente.celular || "");

            return nombre.includes(filtro.toLowerCase()) ||
                celular.includes(filtro);
        });

        tabla.innerHTML = "";

        if (filtrados.length === 0) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="6">No hay clientes registrados</td>
                </tr>
            `;
        } else {
            filtrados.forEach(cliente => {
                const fila = document.createElement("tr");

                const valores = [
                    cliente.id,
                    cliente.nombre,
                    cliente.telefono || cliente.celular || "",
                    cliente.correo || "",
                    cliente.direccion || ""
                ];

                valores.forEach(valor => {
                    const celda = document.createElement("td");
                    celda.textContent = valor || "-";
                    fila.appendChild(celda);
                });

                const acciones = document.createElement("td");

                const botonEditar = document.createElement("button");
                botonEditar.textContent = "Editar";
                botonEditar.type = "button";
                botonEditar.addEventListener("click", function () {
                    editarCliente(cliente.id);
                });

                const botonEliminar = document.createElement("button");
                botonEliminar.textContent = "Eliminar";
                botonEliminar.type = "button";
                botonEliminar.addEventListener("click", function () {
                    eliminarCliente(cliente.id);
                });

                acciones.appendChild(botonEditar);
                acciones.appendChild(botonEliminar);
                fila.appendChild(acciones);

                tabla.appendChild(fila);
            });
        }

        const total = document.getElementById("total-clientes");
        const registrados = document.getElementById("clientes-registrados");

        if (total) total.textContent = clientes.length;
        if (registrados) registrados.textContent = clientes.length;
    }

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const telefono = document.getElementById("celular").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const direccion = document.getElementById("direccion").value.trim();

        if (!nombre || !telefono) {
            alert("Ingresa el nombre y el número de celular.");
            return;
        }

        const nuevoCliente = {
            nombre: nombre,
            telefono: telefono,
            correo: correo,
            direccion: direccion
        };

        registrarCliente(nuevoCliente);

        formulario.reset();
        mostrarClientes(buscador ? buscador.value : "");

        const mensaje = document.getElementById("mensaje-cliente");

        if (mensaje) {
            mensaje.textContent = "Cliente registrado correctamente.";
            mensaje.classList.remove("oculto");
        } else {
            alert("Cliente registrado correctamente.");
        }
    });

    function editarCliente(id) {
        const clientes = obtenerDatos("clientes");
        const cliente = clientes.find(c => String(c.id) === String(id));

        if (!cliente) return;

        const nombre = prompt("Nuevo nombre:", cliente.nombre);
        if (nombre === null) return;

        const telefono = prompt("Nuevo celular:", cliente.telefono || cliente.celular || "");
        if (telefono === null) return;

        const correo = prompt("Nuevo correo:", cliente.correo || "");
        if (correo === null) return;

        const direccion = prompt("Nueva dirección:", cliente.direccion || "");
        if (direccion === null) return;

        if (!nombre.trim() || !telefono.trim()) {
            alert("El nombre y el celular son obligatorios.");
            return;
        }

        cliente.nombre = nombre.trim();
        cliente.telefono = telefono.trim();
        cliente.correo = correo.trim();
        cliente.direccion = direccion.trim();

        guardarDatos("clientes", clientes);
        mostrarClientes(buscador ? buscador.value : "");

        alert("Cliente actualizado correctamente.");
    }

    function eliminarCliente(id) {
        if (!confirm("¿Deseas eliminar este cliente?")) return;

        const clientes = obtenerDatos("clientes");
        const actualizados = clientes.filter(c => String(c.id) !== String(id));

        guardarDatos("clientes", actualizados);
        mostrarClientes(buscador ? buscador.value : "");

        alert("Cliente eliminado correctamente.");
    }

    if (buscador) {
        buscador.addEventListener("input", function () {
            mostrarClientes(this.value);
        });
    }

    mostrarClientes();
});
