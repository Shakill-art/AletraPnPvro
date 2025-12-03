// Import the functions you need from the SDKs you need
// Usar solo el SDK compat, no imports ES Modules
const firebaseConfig = {
  apiKey: "AIzaSyD3xstDbjO9rxItvSZOhdTnUrD7Z5aIFd0",
  authDomain: "alertapnp.firebaseapp.com",
  projectId: "alertapnp",
  storageBucket: "alertapnp.appspot.com",
  messagingSenderId: "982606733081",
  appId: "1:982606733081:web:1f908c9cf74e5d2ca42f88"
};

// Initialize Firebase
// No se necesita inicializar con el SDK de compat

// Inicializa app solo una vez (compat)
if (!firebase.apps.length) {
	firebase.initializeApp(firebaseConfig);
}

// Exporta referencias globales simples
window.firebaseAuth = firebase.auth();
window.firestore = firebase.firestore();
// Solo asignar storage si el SDK de Storage-compat fue incluido en la página
if (typeof firebase.storage === 'function') {
  window.storage = firebase.storage(); // Habilitado para subida de imágenes
} else {
  window.storage = null;
}
window.storageBucket = "alertapnp.appspot.com"; // corregido



