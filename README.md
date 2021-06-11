# 1. Clone the repository.
# 2. for below steps you have to install node.js in your system. to install just download the file from here https://nodejs.org/en/ and istall it perfectly.
# 3. Install mySQL in your system.
# 4. create a Database which name should be resume.
# 5. create a table which name should be users.
# 6. create columns as mention below..
      id int(11) NOT NULL A_I,
      name VARCHAR(50) NOT NULL,
      email VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      image VARCHAR(50) NOT NULL,

# 7. Open the app.js in wich is in the clone directory.
# 8. At the down below there is a app.post('/register'.... section, in which change in the transporter section..
                                   auth: {
                                   user: 'your gmail id',
                                   pass: 'your email password'
                    

                                   const mailOptions = {
                                   from: 'your gmail id', // sender address
                                   subject: 'Your Subject', // Subject line
                                   html: '<p>Your email body..</p>'// plain text body
 
# 9. open the Cloned folder path in terminal.
# 10. execute this command npm i

# FINALLY. project should be Running Successfully.
