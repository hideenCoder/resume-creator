const express = require('express');
const path = require('path')
const app = express();
const MsqConn = require('./db/mysqlConn');
const fs = require('fs')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');
const authenticate = require('./middleware/authenticate');

app.use(fileUpload());
app.use(bodyParser.json());
app.use(cookieParser());
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, './public')))
app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    res.render('index.hbs')
})
app.get('/home', authenticate, (req, res) => {
    res.render('home.hbs', { user: req.rootUser })
})
app.get('/register', (req, res) => {
    res.render('register.hbs')
})

app.post('/register', async (req, res) => {
    const { name, email, password } = await req.body;

    const EncPassword = await bcrypt.hash(password, 12);

    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    } else {
        var file = req.files.image;
        var img_name = file.name;

        if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {

            file.mv('public/images/uploaded_images/' + file.name, async function (err) {

                if (err) {
                    console.log(err)
                } else {
                    await MsqConn.query('INSERT INTO users (name, email, password, image) VALUES (?,?,?,?)', [name, email, EncPassword, img_name], (err, result) => {
                        if (err) {
                            console.log(err)
                        } else {
                            const transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: 'your gmail id',
                                    pass: 'your gmail password'
                                }
                            });

                            const mailOptions = {
                                from: 'your gmail id', // sender address
                                to: email, // list of receivers
                                subject: 'Team Hidden_Coder from Resume Creator', // Subject line
                                html: '<p>You are registerd sucessfully</p>'// plain text body
                            };

                            transporter.sendMail(mailOptions, function (err, info) {
                                if (err)
                                    console.log(err)
                                else
                                    console.log(info);
                            });


                            console.log("Registration Successfully.")
                            res.redirect('/login');
                        }
                    })
                }
            });
        } else {
            res.redirect('/register')
        }
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = await req.body;

    await MsqConn.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
        if (err) {
            console.log(err)
        } else {
            const isPassMatch = await bcrypt.compare(password, result[0].password);
            if (!isPassMatch) {
                console.log("Invalid Credential!")
            } else {
                var user = {
                    name: result[0].name,
                    email: result[0].email,
                    image: result[0].image
                }

                const tokenCode = jwt.sign(user, "SecretKEY");

                res.cookie('currentuser', tokenCode, {
                    expires: new Date(Date.now() + 25892000000),
                    httpOnly: true
                });

                res.redirect('/home');
            }

        }

    })
})

app.get('/login', (req, res) => {
    res.render('login.hbs')
})

app.get('/logout', (req, res) => {
    res.clearCookie('currentuser');
    res.redirect('/login')
})

app.get('/readfile', authenticate, (req, res) => {
    fs.readFile('./public/read.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            res.redirect('/login')
        } else {
            res.render('readfile.hbs', { user: req.rootUser, text: data })
        }
    })
})

app.get('/create', authenticate, (req, res) => {
    res.render('create.hbs', { user: req.rootUser })
})

app.listen(8000, () => {
    console.log('listening on port 8000');
});
