const CONFIG = {
    nombre: "BILLAR EL TRIUNFO",
    ubicacion: "Oruro - Bolivia",
    mesas: 10,
    tarifa: 15
};
async function cargarDatos() {
    try {
        const respuesta = await fetch("datos.json");
        if (!respuesta.ok) {
            throw new Error("No se pudo cargar datos.json");
        }
        const datos = await respuesta.json();
        const claves = [
            "mesas",
            "clientes",
            "productos",
            "reservas",
            "ventas",
            "historialMesas"
        ];
        claves.forEach(clave => {
            if (localStorage.getItem(clave) === null) {
                localStorage.setItem(clave, JSON.stringify(datos[clave] || []));
            }
        });
        return datos;
    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
}

function obtenerDatos(clave) {
    return JSON.parse(localStorage.getItem(clave)) || [];
}

function guardarDatos(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

function generarID(clave) {
    const datos = obtenerDatos(clave);
    return datos.length ? Math.max(...datos.map(item => Number(item.id) || 0)) + 1 : 1;
}

function registrarCliente(cliente) {
    const clientes = obtenerDatos("clientes");

    cliente.id = generarID("clientes");

    clientes.push(cliente);

    guardarDatos("clientes", clientes);

    return cliente;
}

function registrarProducto(producto) {
    const productos = obtenerDatos("productos");

    producto.id = generarID("productos");

    productos.push(producto);

    guardarDatos("productos", productos);

    return producto;
}

function registrarReserva(reserva) {
    const reservas = obtenerDatos("reservas");

    reserva.id = generarID("reservas");

    reservas.push(reserva);

    guardarDatos("reservas", reservas);

    return reserva;
}

function registrarVenta(venta) {
    const ventas = obtenerDatos("ventas");

    venta.id = generarID("ventas");
    venta.fecha = venta.fecha || new Date().toISOString();

    ventas.push(venta);

    guardarDatos("ventas", ventas);

    return venta;
}

function iniciarMesa(numero, cliente) {
    const mesas = obtenerDatos("mesas");
    const mesa = mesas.find(item => Number(item.numero) === Number(numero));

    if (!mesa || mesa.estado === "Ocupada") {
        return false;
    }

    mesa.estado = "Ocupada";
    mesa.horaInicio = new Date().toISOString();
    mesa.cliente = cliente;

    guardarDatos("mesas", mesas);

    return true;
}

function finalizarMesa(numero) {
    const mesas = obtenerDatos("mesas");
    const mesa = mesas.find(item => Number(item.numero) === Number(numero));

    if (!mesa || mesa.estado !== "Ocupada" || !mesa.horaInicio) {
        return false;
    }

    const inicio = new Date(mesa.horaInicio);
    const fin = new Date();
    const minutos = Math.max(0, Math.ceil((fin - inicio) / 60000));
    const horas = Math.max(1, Math.ceil(minutos / 60));
    const total = horas * CONFIG.tarifa;

    const historial = obtenerDatos("historialMesas");

    historial.push({
        id: historial.length ? Math.max(...historial.map(item => Number(item.id) || 0)) + 1 : 1,
        numeroMesa: mesa.numero,
        cliente: mesa.cliente,
        horaInicio: mesa.horaInicio,
        horaFin: fin.toISOString(),
        minutos,
        horas,
        total
    });

    guardarDatos("historialMesas", historial);

    registrarVenta({
        concepto: "Alquiler de mesa " + mesa.numero,
        categoria: "Mesas",
        cantidad: 1,
        total
    });

    mesa.estado = "Disponible";
    mesa.horaInicio = null;
    mesa.cliente = null;

    guardarDatos("mesas", mesas);

    return total;
}

function calcularIngresos() {
    return obtenerDatos("ventas").reduce((total, venta) => {
        return total + Number(venta.total || 0);
    }, 0);
}

function contarMesasOcupadas() {
    return obtenerDatos("mesas").filter(mesa => mesa.estado === "Ocupada").length;
}

function mostrarResumen() {
    const mesas = obtenerDatos("mesas");
    const clientes = obtenerDatos("clientes");
    const productos = obtenerDatos("productos");
    const reservas = obtenerDatos("reservas");

    const elementos = {
        "total-mesas": mesas.length,
        "mesas-disponibles": mesas.filter(mesa => mesa.estado === "Disponible").length,
        "mesas-ocupadas": mesas.filter(mesa => mesa.estado === "Ocupada").length,
        "total-clientes": clientes.length,
        "total-productos": productos.length,
        "total-reservas": reservas.length,
        "ingresos-totales": "Bs " + calcularIngresos().toFixed(2)
    };

    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.textContent = valor;
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await cargarDatos();
    mostrarResumen();
});
