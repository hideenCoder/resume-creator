const jwtDecode = require("jwt-decode");

const Authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.currentuser;
        const userData = jwtDecode(token);

        req.token = token;
        req.rootUser = userData;
        console.log(req.rootUser)

        next();
    } catch (error) {
        console.log('Unauthorized: No token provide. ', error);
        res.redirect('/login')
    }
}

module.exports = Authenticate;