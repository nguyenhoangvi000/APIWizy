
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User = require('./app/models/user'); // get our mongoose model



// mongoose.connect('mongodb://localhost/test');
mongoose.connect('mongodb://nguyenhoangvi000:Nguyenhoangvi123@ds151451.mlab.com:51451/wizytest');




var port = process.env.PORT || 3000; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

var apiRoutes = express.Router();



app.get('/setup', function (req, res) {

    // create a user
    var nick = new User({
        firstName: 'Vi',
        lastName: 'Hoang',
        username: 'vihoang000',
        password: 'password',
        Age: '20',
        Email: 'nguyenhoangvi000@gmail.com  ',
        Company: 'Wizy',
        admin: true
    });

    // save the sample user
    nick.save(function (err) {
        if (err) throw err;

        console.log('User saved successfully');
        res.json({ success: true });
    });
});


var apiRoutes = express.Router();


apiRoutes.post('/login', function (req, res) {


    User.findOne({
        username: req.body.username
    }, function (err, user) {

        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {

            // check if password
            if (user.password != req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else {

                var token = jwt.sign(user, app.get('superSecret'), {
                    expiresIn: 1
                });

                User.findOne({}, function (err, user) {
                    res.json({
                        success: true,
                        message: 'Token Generated',
                        token: token,
                        result: user
                    });
                });

            }

        }

    });
});

// route middleware to verify a token
apiRoutes.use(function (req, res, next) {


    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    console.log(token);

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});




app.use('/api', apiRoutes);


app.listen(port);
console.log('Server Started at http://localhost:' + port);