const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3306;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'beauty_cosmeticos'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Conexión a la base de datos establecida');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Asegura que el servidor pueda manejar JSON
app.use(session({
    secret: 'secret', // Cambia esto por una cadena secreta segura
    resave: false,
    saveUninitialized: true
}));

// Servir archivos estáticos de las carpetas 'beauty' y 'assets'
app.use(express.static(path.join(__dirname, 'beauty')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para la página 'nosotros.html'
app.get('/nosotros.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'nosotros.html'));
});

// Ruta para la página 'login.html'
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

// Ruta para la página 'register.html'
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register', 'signup.html'));
});

// Manejar la autenticación de inicio de sesión
app.post('/login', (req, res) => {
    const { email, clave } = req.body;
    const query = 'SELECT * FROM usuario WHERE CorreoElectronico = ?';
    db.query(query, [email], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (result.length > 0) {
            const hashedPassword = result[0].Clave; // Cambia esto si el nombre de la columna es diferente
            bcrypt.compare(clave, hashedPassword, (err, bcryptResult) => {
                if (err) {
                    return res.status(500).json({ error: 'Error en el servidor' });
                }
                if (bcryptResult) {
                    req.session.user = result[0];
                    res.json({ exists: true });
                } else {
                    res.json({ exists: false });
                }
            });
        } else {
            res.json({ exists: false });
        }
    });
});

// Manejar las solicitudes POST para registrar un nuevo usuario
app.post('/register', (req, res) => {
    const { nombre, email, clave } = req.body;
    const saltRounds = 10;
    const insertUserQuery = 'INSERT INTO usuario (Nombre, CorreoElectronico, Clave) VALUES (?, ?, ?)';

    const checkEmailQuery = 'SELECT * FROM usuario WHERE CorreoElectronico = ?';
    db.query(checkEmailQuery, [email], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (result.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
        }
        bcrypt.hash(clave, saltRounds, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            db.query(insertUserQuery, [nombre, email, hashedPassword], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Error en el servidor' });
                }
                res.json({ registered: true });
            });
        });
    });
});

// Ruta para la página 'inicio.html'
app.get('/inicio', (req, res) => { // Asegúrate de que la ruta esté bien definida
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'inicio', 'inicio.html'));
    } else {
        res.redirect('/login');
    }
});

// Ruta para la página 'carrito.html'
app.get('/carrito.html', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'carrito.html'));
    } else {
        res.redirect('/login');
    }
});

// Manejar el cierre de sesión
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.error(err);
        }
        res.redirect('/login');
    });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
