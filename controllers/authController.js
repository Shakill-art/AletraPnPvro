const admin = require('firebase-admin');

// Usar variable de entorno en producción (Render), archivo local en desarrollo
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : require('../firebase-service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

exports.register = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRecord = await admin.auth().createUser({ email, password });
        res.status(201).json({ user: { email: userRecord.email, uid: userRecord.uid } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    // El login con Firebase Auth se hace en el frontend. Aquí solo verificamos el token enviado por el frontend.
    const { token } = req.body;
    try {
        const decoded = await admin.auth().verifyIdToken(token);
        res.json({ user: { email: decoded.email, uid: decoded.uid } });
    } catch (err) {
        res.status(401).json({ error: 'Token inválido' });
    }
};
