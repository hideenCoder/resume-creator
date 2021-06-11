const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const authenticate = require('../middleware/authenticate');
const MsqConn = require('../db/mysqlConn');

// for MongoDB database connection
// require('../db/mdbConn');
// const User = require("../model/userSchema");

// for MySQL database connection
// require('../db/mysqlConn');

// user register section
// for MongoDB database connection
// router.post('/register', async (req, res) => {
//     const { email, password } = req.body;

//     if(!email || !password){
//         return res.status(422).json({ error: "Filled the filds properly" });
//     }

//     try {
//         const emailExist = await User.findOne({ email: email });

//         if(emailExist) {
//             return res.status(422).json({ error: "Email already exist!"});
//         }else{
//             const user = new User({ email, password });

//             await user.save();

//             res.status(201).json({ message: "User registerd successfully." });
//         }


//     } catch (error) {
//         console.log(error);
//     }
// });

// user register section
// for MySQL database connection
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    var EncPassword;
    if (!email || !password) {
        return res.status(422).json({ error: "Filled the filds properly" });
    } else {
        // encrypt the password
        EncPassword = await bcrypt.hash(password, 12);
    }

    try {
        await MsqConn.query('SELECT * FROM user_data WHERE email = ?', [email], (err, result) => {
            if (err) {
                console.log(err)
            }
            try {
                if (result[0].email) {
                    return res.status(422).json({ error: "Email already exist!" });
                }
            } catch (err) {
                MsqConn.query('INSERT INTO user_data (email, password) VALUES (?,?)', [email, EncPassword], (err, result) => {
                    if (err) {
                        res.status(422).send({ err: err })
                    } else {
                        res.status(201).json({ message: "User registerd successfully." });
                    }
                })
            }

        })

    } catch (error) {
        console.log(error);
    }
});

// user login section for MongoDB
// router.post('/signin', async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({ error: "Filled the field properly" });
//         }

//         const userLogin = await User.findOne({ email: email });

//         if (userLogin) {
//             const isPassMatch = await bcrypt.compare(password, userLogin.password);

//             const token = await userLogin.generateAuthToken(); // jwt token generation in userSchema.js file

//             res.cookie('jwtoken', token, {
//                 expires: new Date(Date.now() + 25892000000),
//                 httpOnly: true
//             });

//             if (!isPassMatch) {
//                 res.status(400).json({ error: "Invalid Credentials!" });
//             } else {
//                 res.status(201).json({ message: "Signin successfully." });
//             }
//         } else {
//             res.status(400).json({ error: "Invalid Credentials!" });
//         }

//     } catch (error) {
//         console.log(error);
//     }
// });

// user login section for MySQL
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Filled the field properly" });
        }

        try {
            await MsqConn.query('SELECT * FROM user_data WHERE email = ?', [email], async (err, result) => {
                if (err) {
                    console.log(err)
                }
                try {
                    if (result[0].email) {
                        const isPassMatch = await bcrypt.compare(password, result[0].password);
                        if (!isPassMatch) {
                            res.status(400).json({ error: "Invalid Credential!" });
                        } else {
                            var user = {
                                email: result[0].email
                            }

                            const tokenCode = jwt.sign(user, "SecretKEY");

                            res.status(200).send({ access: tokenCode, message: "Signin successfully." })
                        }
                    } else {
                        res.status(400).json({ error: "Invalid Credentials!" });
                    }
                } catch (err) {
                    console.log(err)
                }

            })
        } catch (error) {
            console.log(error)
        }

    } catch (error) {
        console.log(error);
    }
});

// Home page with authenticate
router.get('/home', (req, res) => {
    res.send(req.rootUser);
});

module.exports = router;