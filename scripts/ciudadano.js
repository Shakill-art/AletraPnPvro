 (function(){
	const form = document.getElementById('reporteForm');
	const btnUbicacion = document.getElementById('btnUbicacion');
	const inputLat = document.getElementById('lat');
	const inputLng = document.getElementById('lng');
	const inputFoto = document.getElementById('foto');
	const btnLimpiarFoto = document.getElementById('btnLimpiarFoto');
	const msg = document.getElementById('msg');
	btnLimpiarFoto.addEventListener('click', () => {
		inputFoto.value = '';
		setMessage('Imagen eliminada');
	});

	function setMessage(text, isError){
		msg.textContent = text;
		msg.style.color = isError ? '#ef4444' : '#8a93a6';
	}

	btnUbicacion.addEventListener('click', () => {
		if (!navigator.geolocation) {
			setMessage('Geolocalización no soportada', true);
			return;
		}
		navigator.geolocation.getCurrentPosition((pos)=>{
			inputLat.value = pos.coords.latitude.toFixed(6);
			inputLng.value = pos.coords.longitude.toFixed(6);
			setMessage('Ubicación detectada');
		}, (err)=>{
			setMessage('No se pudo obtener ubicación: ' + err.message, true);
		}, { enableHighAccuracy: true, timeout: 12000 });
	});

	async function subirFotoSiExiste(file){
		if (!file) return null;
		const id = 'evidencias/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '-' + file.name;
		const ref = storage.ref(id);
		await ref.put(file);
		return await ref.getDownloadURL();
	}

	form.addEventListener('submit', async (e)=>{
		e.preventDefault();
		try {
			setMessage('Enviando...');
			const tipo = document.getElementById('tipo').value.trim();
			const descripcion = document.getElementById('descripcion').value.trim();
			const lat = parseFloat(inputLat.value);
			const lng = parseFloat(inputLng.value);
			if (!tipo || !descripcion) {
				setMessage('Completa tipo y descripción', true);
				return;
			}
			const fotoFile = inputFoto.files && inputFoto.files[0] ? inputFoto.files[0] : null;
			const fotoUrl = await subirFotoSiExiste(fotoFile);

			const reporte = {
				tipo,
				descripcion,
				ubicacion: (Number.isFinite(lat) && Number.isFinite(lng)) ? new firebase.firestore.GeoPoint(lat, lng) : null,
				fotoUrl: fotoUrl || null,
				estado: 'Nuevo',
				creadoEn: firebase.firestore.FieldValue.serverTimestamp()
			};

			await firestore.collection('reportes').add(reporte);
			form.reset();
			setMessage('Reporte enviado. ¡Gracias!');
		} catch (err) {
			console.error(err);
			setMessage('Error al enviar: ' + err.message, true);
		}
	});
})();


