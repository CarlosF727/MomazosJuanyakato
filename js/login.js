const ADMIN_CREDENCIALES = {
  usuario: "admin",
  clave: "123456" 
};

document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const usuario = document.getElementById("usuario").value.trim();
  const clave = document.getElementById("clave").value.trim();

  if (usuario === ADMIN_CREDENCIALES.usuario && clave === ADMIN_CREDENCIALES.clave) {
    localStorage.setItem("sesion_admin", "activa");
    window.location.href = "panel_admin.html"; // tu archivo del panel
  } else {
    document.getElementById("error-msg").textContent = "Credenciales incorrectas.";
  }
});
