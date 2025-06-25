if (localStorage.getItem("sesion_admin") !== "activa") {
  alert("Acceso no autorizado. Redirigiendo...");
  window.location.href = "index.html"; 
}

async function cargarReportes() {
  const contenedor = document.getElementById("contenedor-reportes");

  try {
    const response = await fetch("https://bh49piq5y4.execute-api.us-east-1.amazonaws.com/prod/ver-reportes");
    const reportes = await response.json();
    contenedor.innerHTML = "";
    reportes.forEach(reporte => {
      const div = document.createElement("div");
      div.className = "reporte";
      div.innerHTML = `
  <strong>Barrio:</strong> ${reporte.barrio}<br>
  <strong>Descripción:</strong> ${reporte.descripcion}<br>
  <strong>Fecha:</strong> ${new Date(reporte.fecha).toLocaleString()}<br>
  <strong>Estado:</strong> 
    <select onchange="cambiarEstado('${reporte.id}', this.value)">
      <option value="pendiente" ${(!reporte.estado || reporte.estado === "pendiente") ? "selected" : ""}>Pendiente</option>
      <option value="en revisión" ${reporte.estado === "en revisión" ? "selected" : ""}>En revisión</option>
      <option value="resuelto" ${reporte.estado === "resuelto" ? "selected" : ""}>Resuelto</option>
    </select><br>
  ${reporte.imagen_url ? `<img src="${reporte.imagen_url}"><br>` : ''}
  <button class="eliminar-btn" onclick="eliminarReporte('${reporte.id}', '${reporte.imagen_url || ''}')">🗑 Eliminar</button>
`;
      contenedor.appendChild(div);
    });
  } catch (err) {
    contenedor.innerHTML = "Error al cargar los reportes.";
    console.error(err);
  }
}
async function eliminarReporte(id, imagen_url) {
  const confirmar = confirm("¿Seguro que deseas eliminar este reporte?");
  if (!confirmar) return;
  try {
    const response = await fetch("https://bh49piq5y4.execute-api.us-east-1.amazonaws.com/prod/eliminar-reporte", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id, imagen_url })
    });
    const result = await response.json();
    alert(result.mensaje || "Reporte eliminado.");
    cargarReportes(); // recargar lista
  } catch (err) {
    console.error(err);
    alert("el pepe");
  }
}
async function cambiarEstado(id, nuevoEstado) {
  try {
    const response = await fetch("https://bh49piq5y4.execute-api.us-east-1.amazonaws.com/prod/status_report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id, estado: nuevoEstado })
    });

    const result = await response.json();
    alert(result.mensaje || "Estado actualizado.");
  } catch (err) {
    console.error(err);
    alert("Error al actualizar el estado.");
  }
}

function cerrarSesion() {
  localStorage.removeItem("sesion_admin");
  window.location.href = "index.html";
}

window.onload = cargarReportes;