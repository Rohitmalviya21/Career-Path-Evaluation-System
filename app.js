const express = require('express');
const DbConnetion = require('./config/DbConnection');
const dotenv = require('dotenv');
const userRoutes = require('./routers/userRoutes');
const session = require('express-session');
const flash = require('connect-flash');
dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(session({
    secret: 'your-secret-key', // You should change this to a more secure secret
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // Set the views directory correctly
app.use(express.static(__dirname + '/public'));


app.use((req, res, next) => {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
});
//Database Connetion
DbConnetion();


// Routes
app.use('/api/users', userRoutes);

app.use("*", (req, res) => {
    console.log("Yes, Not found");
    res.status(404).send("Page not found");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
