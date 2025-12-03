(function(){
	const loginForm = document.getElementById('loginForm');
	const loginMsg = document.getElementById('loginMsg');
	const btnSalir = document.getElementById('btnSalir');
	const contenedor = document.getElementById('reportes');
	let map, markersLayer;
	// mapa de id de reporte -> marker en el mapa
	let markersMap = {};

	function setLoginMsg(text, isError){
		loginMsg.textContent = text;
		loginMsg.style.color = isError ? '#ef4444' : '#8a93a6';
	}

	function ensureMap(){
		if (map) return map;
		map = L.map('map').setView([-12.0464, -77.0428], 12);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; OpenStreetMap'
		}).addTo(map);
		markersLayer = L.layerGroup().addTo(map);
		return map;
	}

	function renderReporteCard(id, data){
		const div = document.createElement('div');
		div.className = 'card';
		const ubicacion = data.ubicacion ? `${data.ubicacion.latitude.toFixed(5)}, ${data.ubicacion.longitude.toFixed(5)}` : 'No especificada';
		// Determinar el estado actual y aplicar estilo
		const estados = [
			{ label: 'Asignado', value: 'Asignado' },
			{ label: 'En curso', value: 'En curso' },
			{ label: 'Atendido', value: 'Atendido' }
		];
		let botones = estados.map(e => {
			let clase = 'button button--secondary';
			if (data.estado === e.value) clase = 'button button--active';
			return `<button class="${clase}" data-accion="${e.value}">${e.label}</button>`;
		}).join('');

		div.innerHTML = `
			<div class="grid-2">
				<div>
					<strong>${data.tipo}</strong>
					<p class="muted">${data.descripcion || ''}</p>
					<p class="muted">Ubicación: ${ubicacion}</p>
					<p class="muted">Estado: <span data-estado>${data.estado}</span></p>
				</div>
				<div style="text-align:right; display:flex; gap:8px; justify-content:flex-end; align-items:flex-start;">
					${botones}
				</div>
			</div>
			${data.fotoUrl ? `<div style="margin-top:8px"><img src="${data.fotoUrl}" alt="evidencia" style="max-width:100%; border-radius:10px;"/></div>` : ''}
		`;

		// Clicks en los botones cambian estado; clicks en la tarjeta centran el mapa
		div.addEventListener('click', async (ev)=>{
			const btn = ev.target.closest('button[data-accion]');
			if (btn) {
				const nuevo = btn.getAttribute('data-accion');
				await firestore.collection('reportes').doc(id).update({ estado: nuevo, actualizadoEn: firebase.firestore.FieldValue.serverTimestamp() });
				return;
			}
			// Si se hizo click en la tarjeta (fuera de botones), centrar el mapa en el marker
			const tarjeta = ev.currentTarget;
			// buscar marker por id
			const marker = markersMap[id];
			if (marker && map) {
				const latlng = marker.getLatLng();
				map.flyTo([latlng.lat, latlng.lng], 16, { duration: 0.8 });
				marker.openPopup();
				// seleccionar visualmente la tarjeta
				document.querySelectorAll('#reportes .card').forEach(c => c.classList.remove('report-selected'));
				tarjeta.classList.add('report-selected');
			}
		});
		return div;
	}

	function syncMapa(snapshot){
		ensureMap();
		markersLayer.clearLayers();
		let newestLoc = null; // track newest report with location
		markersMap = {}; // reset map
		snapshot.forEach(doc=>{
			const data = doc.data();
			if (data.ubicacion) {
				const lat = data.ubicacion.latitude;
				const lng = data.ubicacion.longitude;
				const marker = L.circleMarker([lat, lng], { radius: 7, color: '#0ea5e9', fillColor: '#0284c7', fillOpacity: 0.9 });
				marker.bindPopup(`<strong>${data.tipo}</strong><br/>${data.descripcion || ''}`);
				markersLayer.addLayer(marker);
				// almacenar marker por id para búsquedas desde la lista
				markersMap[doc.id] = marker;
				// keep the first (newest) location from the snapshot (snapshot ordered desc)
				if (!newestLoc) newestLoc = { lat, lng };
			}
		});
		// If we found a newest location, fly to it and open its popup
		if (newestLoc && map) {
			map.flyTo([newestLoc.lat, newestLoc.lng], 15, { duration: 1 });
			// open popup for the marker at that location
			markersLayer.eachLayer(layer => {
				if (layer.getLatLng) {
					const ll = layer.getLatLng();
					if (Math.abs(ll.lat - newestLoc.lat) < 1e-6 && Math.abs(ll.lng - newestLoc.lng) < 1e-6) {
						layer.openPopup();
					}
				}
			});
		}
	}

	function startRealtime(){
		return firestore.collection('reportes').orderBy('creadoEn','desc').limit(100)
			.onSnapshot((snapshot)=>{
				contenedor.innerHTML = '';
				snapshot.forEach(doc=>{
					const card = renderReporteCard(doc.id, doc.data());
					contenedor.appendChild(card);
				});
				syncMapa(snapshot);
			});
	}

	let unsubscribe = null;
	firebaseAuth.onAuthStateChanged((user)=>{
		if (user) {
			setLoginMsg(`Autenticado: ${user.email}`);
			if (!unsubscribe) unsubscribe = startRealtime();
		} else {
			setLoginMsg('Inicia sesión para ver reportes');
			contenedor.innerHTML = '';
			if (unsubscribe) { unsubscribe(); unsubscribe = null; }
		}
	});

	loginForm.addEventListener('submit', async (e)=>{
		e.preventDefault();
		try{
			setLoginMsg('Ingresando...');
			const email = document.getElementById('email').value.trim();
			const password = document.getElementById('password').value;
			await firebaseAuth.signInWithEmailAndPassword(email, password);
			setLoginMsg('');
		}catch(err){
			setLoginMsg('Error: ' + err.message, true);
		}
	});

	btnSalir.addEventListener('click', ()=> firebaseAuth.signOut());
})();


