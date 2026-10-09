/* Encontrémonos — navegación y validaciones de demostración.
   Antes de publicar: configura un backend seguro y cambia el número de WhatsApp. */
"use strict";

const CONFIG = {
  // Formato internacional sin + ni espacios. Ecuador: 593 + número.
  whatsappNumber: "593000000000"
};

const pages = [...document.querySelectorAll("[data-panel]")];
const navLinks = [...document.querySelectorAll("[data-page]")];
const mainNav = document.getElementById("mainNav");
const menuToggle = document.getElementById("menuToggle");
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

function showPage(pageName, updateHistory = true) {
  const target = pages.find(page => page.dataset.panel === pageName);
  if (!target) return;
  pages.forEach(page => page.classList.toggle("active", page === target));
  document.querySelectorAll(".nav-link[data-page]").forEach(link => {
    const active = link.dataset.page === pageName;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  if (updateHistory) history.pushState({ page: pageName }, "", `#${pageName}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleInternalNavigation(event) {
  const link = event.target.closest('a[data-page]');
  if (!link) return;
  event.preventDefault();
  showPage(link.dataset.page);
}
document.addEventListener("click", handleInternalNavigation);

menuToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
});

window.addEventListener("popstate", () => {
  const pageName = location.hash.replace("#", "") || "inicio";
  showPage(pageName, false);
});

const initialPage = location.hash.replace("#", "");
if (pages.some(page => page.dataset.panel === initialPage)) showPage(initialPage, false);
document.getElementById("currentYear").textContent = new Date().getFullYear();

/* Búsqueda de las fichas de ejemplo. */
const caseSearch = document.getElementById("caseSearch");
caseSearch.addEventListener("input", () => {
  const query = caseSearch.value.trim().toLocaleLowerCase("es");
  let visible = 0;
  document.querySelectorAll(".case-card").forEach(card => {
    const matches = `${card.dataset.name || ""} ${card.innerText}`.toLocaleLowerCase("es").includes(query);
    card.hidden = !matches;
    if (matches) visible++;
  });
  document.getElementById("noCases").hidden = visible > 0;
});
document.querySelectorAll(".demo-detail").forEach(button => button.addEventListener("click", () => {
  showToast("Esta es una ficha de ejemplo. Añade información verificada desde el sistema de administración.");
}));

/* Foro: no publica en internet; solo muestra una confirmación de demostración. */
document.getElementById("forumForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const name = document.getElementById("forumName").value.trim();
  const topic = document.getElementById("forumTopic").value;
  const message = document.getElementById("forumMessage").value.trim();
  if (!name || !message) return;
  const post = document.createElement("article");
  post.className = "forum-post";
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = name.charAt(0).toLocaleUpperCase("es");
  const content = document.createElement("div");
  const meta = document.createElement("div");
  meta.className = "post-meta";
  const author = document.createElement("strong");
  author.textContent = name;
  const status = document.createElement("span");
  status.textContent = "Pendiente de revisión";
  meta.append(author, status);
  const body = document.createElement("p");
  body.textContent = message;
  const tag = document.createElement("span");
  tag.className = "post-tag";
  tag.textContent = `${topic} · NO PUBLICADO`;
  content.append(meta, body, tag);
  post.append(avatar, content);
  document.getElementById("pendingMessages").prepend(post);
  form.reset();
  showToast("Mensaje añadido solo a esta vista de prueba; todavía no está publicado.");
});

/* Foto: vista previa local y límites básicos. No se sube a un servidor. */
const photoInput = document.getElementById("personPhoto");
const photoPreview = document.getElementById("photoPreview");
const photoPreviewWrap = document.getElementById("photoPreviewWrap");
let currentPhotoUrl = null;

photoInput.addEventListener("change", () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) return;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    photoInput.value = "";
    showToast("Formato no válido. Usa JPG, PNG o WebP.");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    photoInput.value = "";
    showToast("La imagen supera los 5 MB.");
    return;
  }
  if (currentPhotoUrl) URL.revokeObjectURL(currentPhotoUrl);
  currentPhotoUrl = URL.createObjectURL(file);
  photoPreview.src = currentPhotoUrl;
  photoPreviewWrap.hidden = false;
});
document.getElementById("removePhoto").addEventListener("click", () => {
  photoInput.value = "";
  photoPreview.removeAttribute("src");
  photoPreviewWrap.hidden = true;
  if (currentPhotoUrl) URL.revokeObjectURL(currentPhotoUrl);
  currentPhotoUrl = null;
});

/* Validación de ejemplo: NO almacena ni transmite los datos del reporte. */
document.getElementById("reportForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const result = document.getElementById("reportResult");
  result.hidden = false;
  result.textContent = "Formulario validado en tu navegador. No se envió ni guardó información. Para usar casos reales, conecta un backend seguro y revisa la autorización antes de publicar.";
  result.scrollIntoView({ behavior: "smooth", block: "center" });
});

/* El enlace de WhatsApp se arma con el número editable de CONFIG. */
const whatsappLink = document.getElementById("whatsappLink");
whatsappLink.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent("Hola, necesito orientación sobre la plataforma Encontrémonos.")}`;
