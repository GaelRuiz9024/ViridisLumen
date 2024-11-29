const db = require('../helpers/mysql-config');



// Iniciar sesión
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.query(
            'SELECT * FROM Users WHERE username = ? AND password_hash = ?',
            [username, password]
        );
        if (rows.length > 0) {
            req.session.user = {
                id: rows[0].id,
                username: rows[0].username
            };
            res.redirect('http://viridis-lumen.s3-website-us-east-1.amazonaws.com/main.html');
        } else {
            res.redirect('http://viridis-lumen.s3-website-us-east-1.amazonaws.com//login.html?error=Usuario o contraseña incorrectos'); // Pasar mensaje de error
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error interno del servidor');
    }
};

// Cerrar sesión
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('http://viridis-lumen.s3-website-us-east-1.amazonaws.com//login.html');
    });
};
// Verificar si hay una sesión activa
exports.verifySession = (req, res) => {
    if (req.session && req.session.user) {
        res.status(200).json({ user_id: req.session.user.id });
    } else {
        res.status(401).json({ error: "No hay una sesión activa" });
    }
};