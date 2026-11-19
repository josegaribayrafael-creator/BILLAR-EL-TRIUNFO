let graficoCategorias = null;
let graficoMesas = null;

document.addEventListener("DOMContentLoaded", () => {
    actualizarDashboard();
});

function actualizarDashboard() {
    const mesas = obtenerDatos("mesas");
    const clientes = obtenerDatos("clientes");
    const productos = obtenerDatos("productos");
    const reservas = obtenerDatos("reservas");
    const ventas = obtenerDatos("ventas");

    const ocupadas = mesas.filter(mesa => mesa.estado === "Ocupada").length;
    const disponibles = mesas.filter(mesa => mesa.estado === "Disponible").length;
    const pendientes = reservas.filter(reserva => reserva.estado === "Pendiente").length;
    const ingresos = ventas.reduce((total, venta) => total + Number(venta.total || 0), 0);

    document.getElementById("dash-ingresos").textContent = "Bs " + ingresos.toFixed(2);
    document.getElementById("dash-mesas").textContent = mesas.length;
    document.getElementById("dash-ocupadas").textContent = ocupadas;
    document.getElementById("dash-disponibles").textContent = disponibles;
    document.getElementById("dash-clientes").textContent = clientes.length;
    document.getElementById("dash-productos").textContent = productos.length;
    document.getElementById("dash-reservas").textContent = pendientes;
    document.getElementById("dash-ventas").textContent = ventas.length;

    crearGraficoCategorias(ventas);
    crearGraficoMesas(ocupadas, disponibles);
    mostrarUltimasVentas(ventas);
}

function crearGraficoCategorias(ventas) {
    const categorias = {};

    ventas.forEach(venta => {
        const categoria = venta.categoria || "Otros";
        categorias[categoria] = (categorias[categoria] || 0) + Number(venta.total || 0);
    });

    const contexto = document.getElementById("grafico-categorias");

    if (graficoCategorias) {
        graficoCategorias.destroy();
    }

    graficoCategorias = new Chart(contexto, {
        type: "bar",
        data: {
            labels: Object.keys(categorias),
            datasets: [{
                label: "Ingresos en Bs",
                data: Object.values(categorias),
                backgroundColor: "#138451",
                borderColor: "#d6ad55",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: "#f5f5ed"
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: "#f5f5ed"
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#f5f5ed"
                    }
                }
            }
        }
    });
}

function crearGraficoMesas(ocupadas, disponibles) {
    const contexto = document.getElementById("grafico-mesas");

    if (graficoMesas) {
        graficoMesas.destroy();
    }

    graficoMesas = new Chart(contexto, {
        type: "doughnut",
        data: {
            labels: ["Ocupadas", "Disponibles"],
            datasets: [{
                data: [ocupadas, disponibles],
                backgroundColor: ["#b83b32", "#138451"],
                borderColor: "#d6ad55",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#f5f5ed"
                    }
                }
            }
        }
    });
}

function mostrarUltimasVentas(ventas) {
    const tabla = document.getElementById("tabla-ventas");

    tabla.innerHTML = "";

    const ultimas = [...ventas].reverse().slice(0, 10);

    if (ultimas.length === 0) {
        tabla.innerHTML = `<tr><td colspan="5">No hay ventas registradas.</td></tr>`;
        return;
    }

    ultimas.forEach(venta => {
        const fila = document.createElement("tr");

        const fecha = venta.fecha
            ? new Date(venta.fecha).toLocaleString("es-BO")
            : "Sin fecha";

        const valores = [
            venta.id,
            venta.concepto || "Venta",
            venta.categoria || "Otros",
            fecha,
            "Bs " + Number(venta.total || 0).toFixed(2)
        ];

        valores.forEach(valor => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        tabla.appendChild(fila);
    });
}
