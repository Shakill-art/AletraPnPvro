# Alerta PNP - Sistema de Reportes de Incidentes

Una aplicación web para reportar incidentes en tiempo real a la PNP (Policía Nacional del Perú), con autenticación Firebase, almacenamiento de reportes en Firestore, y visualización en mapa interactivo.

## Características

- 🔐 **Autenticación**: Login/Register con Firebase Auth
- 📱 **Reportes en Tiempo Real**: Ciudadanos pueden enviar incidentes con foto y ubicación
- 🗺️ **Mapa Interactivo**: Visualización de reportes en Leaflet con marcadores
- 📊 **Panel de Control PNP**: Gestión de reportes y cambio de estado
- 🖼️ **Soporte de Imágenes**: Subida de evidencias a Firebase Storage

## Requisitos
- Cuenta de Firebase
- Habilitar Authentication (Email/Password), Firestore y Storage
- Servidor estático (XAMPP/Apache)

## Instalación
1) Edita `scripts/firebase.js` y reemplaza REEMPLAZAR con tu configuración.
2) Crea usuarios (correo y contraseña) para el panel PNP en Firebase Authentication.
3) Sirve la carpeta desde `htdocs/Proyecto_Alerta_PNP`.

## Reglas Firestore (ejemplo para pruebas)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reportes/{docId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
  }
}
```

## Reglas Storage (ejemplo para pruebas)
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /evidencias/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## Uso
- `index.html`: portada
- `ciudadano.html`: reportar incidente (geolocalización y foto)
- `dashboard.html`: panel PNP con login, lista en tiempo real y mapa
