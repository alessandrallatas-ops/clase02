/**
 * PetCare - Lógica de Frontend
 */

const API_BASE = "http://127.0.0.1:8000";
const protectedTabs = ["servicios", "mascotas", "reporte"];
let currentUser = null;

// --- Seleccion de Elementos ---
const navLinks = Array.from(document.querySelectorAll(".sidebar-nav a"));
const logoutButton = document.getElementById("logoutButton");
const userBadgeStrong = document.querySelector(".sidebar-footer .user-badge strong");

const saludoForm = document.getElementById("saludoForm");
const registroForm = document.getElementById("registroForm");
const loginForm = document.getElementById("loginForm");
const servicioForm = document.getElementById("servicioForm");
const mascotaForm = document.getElementById("mascotaForm");
const buscadorMascotaForm = document.getElementById("buscadorMascotaForm");
const reporteForm = document.getElementById("reporteForm");

const listaServicios = document.getElementById("listaServicios");
const selectServicioMascota = document.getElementById("mascotaServicio");
const resultadoMascotas = document.getElementById("resultadoMascotas");
const reporteResultados = document.getElementById("reporteResultados");
const reporteEmail = document.getElementById("reporteEmail");

// --- Funciones de Utilidad ---

/**
 * Muestra alertas visuales en el contenedor especificado
 */
function showAlert(container, message, type = "success") {
  if (!container) return;
  const alert = document.createElement("div");
  alert.className = `alert ${type}`;
  alert.textContent = message;
  
  // Insertar al inicio del contenedor
  container.prepend(alert);
  
  // Auto-eliminar después de 3.2 segundos
  setTimeout(() => {
    alert.style.opacity = "0";
    setTimeout(() => alert.remove(), 500);
  }, 3200);
}

/**
 * Función centralizada para peticiones Fetch
 */
async function apiRequest(path, options = {}) {
  try {
    const resp = await fetch(`${API_BASE}${path}`, options);
    
    // Manejar respuestas sin contenido (204)
    if (resp.status === 204) return {};

    const payload = await resp.json();

    if (!resp.ok) {
      // Extraer mensaje de error de FastAPI (puede venir en 'mensaje' o 'detail')
      let msg = "Error del servidor";
      if (payload.mensaje) {
        msg = payload.mensaje;
      } else if (payload.detail) {
        msg = Array.isArray(payload.detail) ? payload.detail[0].msg : payload.detail;
      }
      throw new Error(msg);
    }
    return payload;
  } catch (err) {
    if (err.message.includes("Failed to fetch")) {
      throw new Error("No se pudo conectar con el servidor de Python. ¿Está encendido?");
    }
    throw err;
  }
}

/**
 * Actualiza la interfaz según el estado de autenticación
 */
function setAuthUI(loggedIn) {
  if (loggedIn) {
    if (userBadgeStrong) userBadgeStrong.textContent = currentUser;
    if (logoutButton) logoutButton.style.display = "block";
    navLinks.forEach((link) => {
      if (protectedTabs.includes(link.dataset.tab)) {
        link.classList.remove("locked");
        link.removeAttribute("aria-disabled");
      }
    });
  } else {
    currentUser = null;
    if (userBadgeStrong) userBadgeStrong.textContent = "Invitado";
    if (logoutButton) logoutButton.style.display = "none";
    navLinks.forEach((link) => {
      if (protectedTabs.includes(link.dataset.tab)) {
        link.classList.add("locked");
        link.setAttribute("aria-disabled", "true");
      }
    });
  }
}

/**
 * Cambia visualmente entre secciones
 */
function setActiveTab(tabName) {
  document.querySelectorAll("main section").forEach((sec) => sec.classList.remove("active"));
  const section = document.getElementById(tabName);
  if (section) section.classList.add("active");
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.tab === tabName));
}

/**
 * Lógica para cambiar de pestaña y cargar datos si es necesario
 */
async function switchTab(tabName) {
  if (protectedTabs.includes(tabName) && !currentUser) {
    showAlert(document.getElementById("acceso"), "Debes iniciar sesión para acceder.", "error");
    tabName = "acceso";
  }
  
  setActiveTab(tabName);

  if (tabName === "servicios" && currentUser) await cargarServicios();
  if (tabName === "mascotas" && currentUser) obtenerMascotas(currentUser);
  if (tabName === "reporte" && currentUser) {
    if (reporteEmail) reporteEmail.value = currentUser;
    obtenerReporte(currentUser);
  }
}

// --- Peticiones de Datos ---

async function cargarServicios() {
  if (!listaServicios || !selectServicioMascota) return;
  try {
    const data = await apiRequest("/servicios");
    const servicios = Array.isArray(data.servicios) ? data.servicios : [];
    
    listaServicios.innerHTML = servicios.length
      ? servicios.map((s) => `<li>${s.nombre} - $${Number(s.precio).toFixed(2)}</li>`).join("")
      : "<li>No hay servicios registrados</li>";
    
    selectServicioMascota.innerHTML =
      `<option value="">Selecciona servicio</option>` +
      servicios.map((s) => `<option value="${s.nombre}">${s.nombre}</option>`).join("");
  } catch (err) {
    showAlert(document.getElementById("servicios"), err.message, "error");
  }
}

async function obtenerMascotas(correo) {
  if (!resultadoMascotas || !correo) return;
  try {
    const data = await apiRequest(`/mascotas/${encodeURIComponent(correo)}`);
    const mascotas = Array.isArray(data.mascotas) ? data.mascotas : [];
    
    if (!mascotas.length) {
      resultadoMascotas.innerHTML = "<p>No hay mascotas registradas para este correo.</p>";
      return;
    }
    
    resultadoMascotas.innerHTML = mascotas
      .map((m) => `
        <article class="mascota-card">
          <h4>${m.nombre || "Sin nombre"}</h4>
          <p><strong>Dueño:</strong> ${correo}</p>
          <p><strong>Servicio:</strong> ${m.tipo_servicio || m.servicio || "N/A"}</p>
          <p><strong>Fecha:</strong> ${m.fecha || "Pendiente"}</p>
        </article>`)
      .join("");
  } catch (err) {
    showAlert(document.getElementById("mascotas"), err.message, "error");
  }
}

async function obtenerReporte(correo) {
  if (!reporteResultados || !correo) return;
  try {
    const data = await apiRequest(`/reporte/${encodeURIComponent(correo)}`);
    const servicios = Array.isArray(data.servicios) ? data.servicios : [];
    
    reporteResultados.innerHTML = `
      <div class="reporte-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
        <div class="stat-box" style="padding: 1rem; border: 1px solid #eee; border-radius: 8px;">
          <small>Cantidad servicios</small><br><strong>${data.cantidad_servicios ?? 0}</strong>
        </div>
        <div class="stat-box" style="padding: 1rem; border: 1px solid #eee; border-radius: 8px;">
          <small>Total gastado</small><br><strong>$${Number(data.total_gastado ?? 0).toFixed(2)}</strong>
        </div>
      </div>
      <div class="report-tags" style="margin-top: 1.5rem;">
        <h4>Servicios usados</h4>
        <div class="tags-container">
          ${servicios.length 
            ? servicios.map((s) => `<span class="service-tag" style="background: #e0f2f1; padding: 4px 8px; border-radius: 4px; margin-right: 5px; font-size: 0.8rem;">${s}</span>`).join("") 
            : "<em>No hay servicios</em>"}
        </div>
      </div>`;
  } catch (err) {
    showAlert(document.getElementById("reporte"), err.message, "error");
  }
}

function logout() {
  setAuthUI(false);
  switchTab("acceso");
  showAlert(document.getElementById("acceso"), "Has cerrado sesión correctamente", "success");
}

// --- Event Listeners Iniciales ---

document.addEventListener("DOMContentLoaded", () => {
  // Estado inicial
  setAuthUI(false);
  switchTab("inicio");

  // Navegación lateral
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      if (tab) switchTab(tab);
    });
  });

  if (logoutButton) logoutButton.addEventListener("click", logout);

  // Formulario de Saludo
  if (saludoForm) {
    saludoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("saludoNombre").value.trim();
      if (!nombre) return showAlert(saludoForm, "Ingresa tu nombre", "error");
      
      try {
        const data = await apiRequest(`/bienvenido/${encodeURIComponent(nombre)}`);
        showAlert(saludoForm, data.mensaje || "¡Hola!", "success");
        saludoForm.reset();
      } catch (err) {
        showAlert(saludoForm, err.message, "error");
      }
    });
  }

  // Formulario Registro
  if (registroForm) {
    registroForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const correo = document.getElementById("registroEmail").value.trim();
      const contrasena = document.getElementById("registroPassword").value;
      
      try {
        const data = await apiRequest("/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, contrasena }),
        });
        showAlert(registroForm, data.mensaje || "Registro exitoso", "success");
        registroForm.reset();
      } catch (err) {
        showAlert(registroForm, err.message, "error");
      }
    });
  }

  // Formulario Login
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const correo = document.getElementById("loginEmail").value.trim();
      const contrasena = document.getElementById("loginPassword").value;
      
      try {
        const data = await apiRequest("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, contrasena }),
        });
        currentUser = correo;
        setAuthUI(true);
        showAlert(loginForm, data.mensaje || "Bienvenido/a", "success");
        loginForm.reset();
        switchTab("servicios");
      } catch (err) {
        showAlert(loginForm, err.message, "error");
      }
    });
  }

  // Formulario Agregar Servicio
  if (servicioForm) {
    servicioForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("servicioNombre").value.trim();
      const precio = Number(document.getElementById("servicioPrecio").value);
      
      try {
        const data = await apiRequest("/agregar-servicio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, precio }),
        });
        showAlert(servicioForm, data.mensaje || "Servicio añadido", "success");
        servicioForm.reset();
        cargarServicios();
      } catch (err) {
        showAlert(servicioForm, err.message, "error");
      }
    });
  }

  // Formulario Registrar Mascota
  if (mascotaForm) {
    mascotaForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const correo = document.getElementById("mascotaEmail").value.trim();
      const nombre = document.getElementById("mascotaNombre").value.trim();
      const tipo_servicio = document.getElementById("mascotaServicio").value;
      const fecha = document.getElementById("mascotaFecha").value;
      
      try {
        const data = await apiRequest("/registrar-mascota", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, nombre, tipo_servicio, fecha }),
        });
        showAlert(mascotaForm, data.mensaje || "Mascota registrada", "success");
        mascotaForm.reset();
        if (correo === currentUser) obtenerMascotas(correo);
      } catch (err) {
        showAlert(mascotaForm, err.message, "error");
      }
    });
  }

  // Buscador de Mascotas
  if (buscadorMascotaForm) {
    buscadorMascotaForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const correo = document.getElementById("buscadorMascota").value.trim();
      if (!correo) return showAlert(buscadorMascotaForm, "Ingresa un correo", "error");
      obtenerMascotas(correo);
    });
  }

  // Formulario de Reporte
  if (reporteForm) {
    reporteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const correo = reporteEmail?.value.trim();
      if (!correo) return showAlert(reporteForm, "Ingresa un correo", "error");
      obtenerReporte(correo);
    });
  }
});
