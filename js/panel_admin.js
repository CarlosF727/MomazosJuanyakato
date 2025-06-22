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

window.onload = cargarReportes;