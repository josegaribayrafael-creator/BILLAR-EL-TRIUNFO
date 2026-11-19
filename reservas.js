document.addEventListener("DOMContentLoaded", () => {
    const fecha = document.getElementById("fecha-reserva");
    fecha.min = new Date().toLocaleDateString("en-CA");

    mostrarReservas();

    document.getElementById("form-reserva").addEventListener("submit", registrarNuevaReserva);

    document.getElementById("buscar-reserva").addEventListener("input", mostrarReservas);
});

function registrarNuevaReserva(evento) {
    evento.preventDefault();

    const cliente = document.getElementById("cliente-reserva").value.trim();
    const telefono = document.getElementById("telefono-reserva").value.trim();
    const mesa = Number(document.getElementById("mesa-reserva").value);
    const fecha = document.getElementById("fecha-reserva").value;
    const hora = document.getElementById("hora-reserva").value;
    const duracion = Number(document.getElementById("duracion-reserva").value);

    if (!cliente || !telefono || !mesa || !fecha || !hora || !Number.isInteger(duracion) || duracion < 1 || duracion > 12) {
        alert("Completa correctamente todos los campos.");
        return;
    }

    const inicio = new Date(`${fecha}T${hora}`);
    const fin = new Date(inicio.getTime() + duracion * 60 * 60 * 1000);

    if (Number.isNaN(inicio.getTime()) || inicio < new Date()) {
        alert("La fecha y hora deben ser futuras.");
        return;
    }

    const reservas = obtenerDatos("reservas");

    const conflicto = reservas.some(reserva => {
        if (Number(reserva.mesa) !== mesa || reserva.estado === "Cancelada") return false;

        const otroInicio = new Date(`${reserva.fecha}T${reserva.hora}`);
        const otroFin = new Date(otroInicio.getTime() + Number(reserva.duracion) * 60 * 60 * 1000);

        return inicio < otroFin && fin > otroInicio;
    });

    if (conflicto) {
        alert("Esta mesa ya tiene una reserva en ese horario.");
        return;
    }

    registrarReserva({
        cliente,
        telefono,
        mesa,
        fecha,
        hora,
        duracion,
        estado: "Pendiente"
    });

    document.getElementById("form-reserva").reset();

    document.getElementById("duracion-reserva").value = 1;
    document.getElementById("fecha-reserva").min = new Date().toLocaleDateString("en-CA");

    mostrarReservas();

    alert("Reserva registrada correctamente.");
}

function mostrarReservas() {
    const tabla = document.getElementById("tabla-reservas");
    const busqueda = document.getElementById("buscar-reserva").value.toLowerCase();

    const reservas = obtenerDatos("reservas");

    const filtradas = reservas.filter(reserva =>
        reserva.cliente.toLowerCase().includes(busqueda) ||
        reserva.telefono.includes(busqueda) ||
        String(reserva.mesa).includes(busqueda)
    );

    tabla.innerHTML = "";

    if (filtradas.length === 0) {
        tabla.innerHTML = `<tr><td colspan="9">No hay reservas registradas.</td></tr>`;
    }

    filtradas.forEach(reserva => {
        const fila = document.createElement("tr");

        const valores = [
            reserva.id,
            reserva.cliente,
            reserva.telefono,
            "Mesa " + reserva.mesa,
            reserva.fecha,
            reserva.hora,
            reserva.duracion + " hora(s)",
            reserva.estado
        ];

        valores.forEach((valor, indice) => {
            const celda = document.createElement("td");
            celda.textContent = valor;

            if (indice === 7) {
                celda.className = reserva.estado === "Pendiente" ? "estado disponible" : "estado ocupada";
            }

            fila.appendChild(celda);
        });

        const acciones = document.createElement("td");

        if (reserva.estado === "Pendiente") {
            const cancelar = document.createElement("button");
            cancelar.textContent = "Cancelar";
            cancelar.className = "btn";
            cancelar.addEventListener("click", () => cancelarReserva(reserva.id));
            acciones.appendChild(cancelar);
        }

        fila.appendChild(acciones);
        tabla.appendChild(fila);
    });

    actualizarResumenReservas(reservas);
}

function actualizarResumenReservas(reservas) {
    document.getElementById("total-reservas").textContent = reservas.length;

    document.getElementById("reservas-pendientes").textContent =
        reservas.filter(reserva => reserva.estado === "Pendiente").length;

    document.getElementById("reservas-canceladas").textContent =
        reservas.filter(reserva => reserva.estado === "Cancelada").length;
}

function cancelarReserva(id) {
    if (!confirm("¿Deseas cancelar esta reserva?")) return;

    const reservas = obtenerDatos("reservas");
    const reserva = reservas.find(item => item.id === id);

    if (!reserva) return;

    reserva.estado = "Cancelada";

    guardarDatos("reservas", reservas);

    mostrarReservas();

    alert("Reserva cancelada correctamente.");
}
