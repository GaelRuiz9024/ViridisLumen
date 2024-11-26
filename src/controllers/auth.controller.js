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
            res.redirect('/main.html');
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
