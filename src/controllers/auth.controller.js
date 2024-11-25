const db = require('../helpers/mysql-config');

// Mostrar dashboard solo si está autenticado
exports.dashboard = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html'); // Redirige al login si no hay usuario en sesión
    }

    res.send(`
        <h1>Bienvenido ${req.session.user.username}</h1>
        <p>Este es tu panel de control.</p>
        <p>Tu ID de usuario es: ${req.session.user.id}</p>  <!-- Muestra el ID de usuario -->
        <a href="/logout">Cerrar sesión</a>
    `);
};

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
            res.redirect('/dashboard');
        } else {
            res.redirect('/login.html?error=Usuario o contraseña incorrectos'); // Pasar mensaje de error
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error interno del servidor');
    }
};

// Cerrar sesión
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login.html');
    });
};
