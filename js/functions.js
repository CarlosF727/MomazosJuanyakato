// index.html

let mapaModal;
const allowedExtension = 'image';
  const sanitizeString = (string) => {
    const safeString = string
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

    return safeString
  };

async function verReportes() {
  const contenedor = document.getElementById("contenedor-reportes");
  contenedor.innerHTML = "Cargando reportes...";

  try {
    const response = await fetch("https://bh49piq5y4.execute-api.us-east-1.amazonaws.com/prod/ver-reportes");
    const data = await response.json();
    contenedor.innerHTML = "";

    data.forEach(reporte => {
      const div = document.createElement("div");
      div.className = "reporte";

      const claseEstado =
       reporte.estado === 'resuelto' ? 'estado-resuelto' :
       reporte.estado === 'en revisión' ? 'estado-revision' :
       'estado-pendiente';

      div.innerHTML = `
       <strong>Barrio:</strong> ${sanitizeString(reporte.barrio) ?? "error"}<br>
       <strong>Descripción:</strong> ${sanitizeString(reporte.descripcion) ?? "error"}<br>
       <strong>Fecha:</strong> ${new Date(reporte.fecha).toLocaleString()}<br>
       <strong>Estado:</strong> <span class="estado ${claseEstado}">
        ${sanitizeString(reporte.estado || 'pendiente')}
      </span><br>
      ${reporte.imagen_url
        ? `<span class="helper"></span><img src="${reporte.imagen_url}" alt="Imagen del reporte">`
        : ""}
      `;


      div.addEventListener("click", () => mostrarModal(reporte));
      contenedor.appendChild(div);
    });

  } catch (err) {
    contenedor.innerHTML = "Error al cargar los reportes.";
    console.error(err);
  }
}

function irAFormulario() {
  window.location.href = "formulario.html";
}

function mostrarModal(reporte) {
  const modal = document.getElementById("modal");
  const info = document.getElementById("modal-info");
  const mapDiv = document.getElementById("modal-map");

  info.innerHTML = `
      <h3>Detalle del Reporte</h3>
      <p><strong>Barrio:</strong> ${sanitizeString(reporte.barrio) ?? "error"}</p>
      <p><strong>Descripción:</strong> ${sanitizeString(
    reporte.descripcion) ?? "error"
    }</p>
      <p><strong>Fecha:</strong> ${new Date(reporte.fecha).toLocaleString()}</p>
      ${reporte.imagen_url ? `<img src="${reporte.imagen_url}" style="max-width:100%; margin-top:10px;">` : ''}
    `;

  modal.style.display = "flex";

  setTimeout(() => {
    if (mapaModal) {
      mapaModal.remove(); // eliminar el mapa anterior si existe
    }
    mapaModal = L.map('modal-map').setView([reporte.latitud, reporte.longitud], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapaModal);

    L.marker([reporte.latitud, reporte.longitud]).addTo(mapaModal);

    setTimeout(() => {
      mapaModal.invalidateSize();
    }, 200);

  }, 100); // tiempo mínimo para asegurar que el div es visible
}

window.onload = function () {
  document.getElementById("modal-close").onclick = () => {
    document.getElementById("modal").style.display = "none";
    if (mapaModal) {
      mapaModal.remove();
      mapaModal = null;
    }

    document.getElementById("modal-map").innerHTML = "";

  };
};

// formulario.html

const barriosCoords = {
  "Laureles": [6.2442, -75.6012],
  "El Poblado": [6.2088, -75.5658],
  "Belén": [6.2312, -75.5906],
  "Robledo": [6.2875, -75.5900],
  "Castilla": [6.2915, -75.5734]
};

let map = L.map('map').setView([6.2442, -75.6012], 13);
let userMarker = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Manejar cambio de barrio
document.getElementById("barrio").addEventListener("change", function () {
  const barrio = this.value;
  if (barriosCoords[barrio]) {
    const coords = barriosCoords[barrio];
    map.setView(coords, 15);
    setOrMoveMarker(coords);
  }
});


function volverALaUbicacion() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const coords = [lat, lon];
        map.setView(coords, 16);
        setOrMoveMarker(coords);
    }, function () {
        alert("No se pudo obtener tu ubicación.");
    });
    } else {
        alert("Tu navegador no soporta geolocalización.");
    }
}
document.getElementById("monda").addEventListener("click",() => volverALaUbicacion())
// Coloca o mueve el marcador, haciéndolo arrastrable
function setOrMoveMarker(coords) {
  if (userMarker) {
    userMarker.setLatLng(coords);
  } else {
    userMarker = L.marker(coords, { draggable: true }).addTo(map);
    userMarker.on("dragend", function (e) {
      const pos = e.target.getLatLng();
      console.log("Nueva ubicación:", pos.lat, pos.lng);
    });
  }
}

function mostrarPreview() {
  const input = document.getElementById('imagen');
  const preview = document.getElementById('preview');
  const archivo = input.files[0];

  if (archivo) {
    const lector = new FileReader();
    lector.onload = function (e) {
      imagenBase64 = e.target.result; // Guardamos el base64
      preview.src = imagenBase64;
      preview.style.display = 'block';
    };
    lector.readAsDataURL(archivo);
  } else {
    preview.src = '#';
    preview.style.display = 'none';
    imagenBase64 = null;
  }
}


function enviarReporte() {
  alert("Reporte enviado (simulado)");
}

// Al cargar la página, centrar en ubicación si es posible
// window.onload = volverALaUbicacion;

async function subirImagenAS3(archivo) {
  const nombreUnico = `${Date.now()}_${archivo.name}`;
  const url = `https://fixmycity-imagenes.s3.amazonaws.com/${nombreUnico}`;
  const fileType = archivo.type.split("/")
  if (fileType[0] !== allowedExtension) return false;

  await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": archivo.type
    },
    body: archivo
  });

  return url;
}

let imagenBase64 = null;

document.getElementById("reporte-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const barrio = document.getElementById("barrio").value;
  const descripcion = document.getElementById("descripcion").value.trim();
  const imagen = document.getElementById("imagen").files[0];
  const coords = userMarker ? userMarker.getLatLng() : null;

  if (!barrio) {
    alert("Por favor selecciona un barrio.");
    return;
  }

  if (!descripcion || descripcion.length < 5) {
    alert("Por favor describe brevemente el problema.");
    return;
  }

  let imagenURL = "";
  try {
    imagenURL = await subirImagenAS3(imagen);
    if (!imagenURL) {
      throw new Error("Invalid format");
    }
  } catch (err) {
    console.error("Error al subir imagen:", err);
    alert("Ocurrió un error al subir la imagen.");
    return;
  }

  const data = {
    barrio,
    descripcion,
    latitud: coords.lat,
    longitud: coords.lng,
    imagenURL: imagenURL
  };

  try {
    console.log(imagenURL)
    const response = await fetch("https://bh49piq5y4.execute-api.us-east-1.amazonaws.com/prod/reportes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert("Reporte enviado correctamente 🎉");
      document.getElementById("reporte-form").reset();
      document.getElementById("preview").style.display = "none";
    } else {
      alert("Error al enviar el reporte ❌");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error en la conexión con el servidor.");
  }
});
