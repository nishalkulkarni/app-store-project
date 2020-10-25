const express = require('express');
var session = require('express-session');
const path = require('path');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const app = express();


const db = mysql.createConnection({
    host: "localhost",
    user: "nishal",
    password: "vanhalnis",
    database: "softstore"
});


app.use('/', express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'hbs');

app.use(session({
    key: 'user_sid',
    secret: 'vanhalnis',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});

var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};

app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});

var signupFunction = (email, password, address) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT email FROM users WHERE email = ?', [email], async (err, result) => {
            if (err) console.log(err);

            if (result.length > 0) {
                reject('That email is already in use')
            }

            db.query('SELECT user_id FROM users;', async (error, results) => {
                if (error) console.log(error);
                else {
                    var uids = [];
                    results.forEach(element => {
                        uids.push(element.user_id);
                    });

                    let i = 10001;
                    while (uids.includes('U' + i)) {
                        i += 1;
                    }
                    let newuid = 'U' + i;
                    let params = { user_id: newuid, email: email, password: password, address: address };
                    db.query('INSERT INTO users SET ? ', params, (error, re) => {
                        if (error) {
                            console.log(error);
                        } else {
                            resolve(params)
                        }
                    });
                }
            });
        })

    });
}

app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.render('signup');
    })
    .post((req, res) => {
        const email = req.body.email;
        const password = req.body.password;
        const address = req.body.address;

        signupFunction(email, password, address)
            .then((results) => {
                req.session.user = results;
                res.redirect('/dashboard')
            }).catch((error) => {
                return res.render('signup', {
                    message: error
                })
            })

    });

var loginFunction = (email, password) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (results.length == 0 || !(await password === results[0].password)) {
                reject('Email or Password is incorrect');
            } else {
                resolve(results[0]);
            }
        })
    });
}

app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.render('login');
    })
    .post((req, res) => {
        try {
            var email = req.body.email;
            var password = req.body.password;

            if (!email || !password) {
                return res.status(400).render('login', {
                    message: 'Please provide valid email and password'
                })
            }

            loginFunction(email, password)
                .then((results) => {
                    req.session.user = results;
                    res.redirect('/dashboard')
                }).catch((error) => {
                    return res.render('login', {
                        message: error
                    })
                })


        } catch (error) {
            console.log(error)
        }

    });

app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

var dashboardFunction = () => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT app_name,description,cost,DATE_FORMAT(last_updated, '%d-%M-%y') last_updated\
         FROM app;"
        db.query(sql, async (error, results) => {
            if (results.length == 0) {
                reject('Cannot find apps');
            } else {
                resolve(results);
            }
        })
    });
}

app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        dashboardFunction()
        .then((results) => {
            return res.render('dashboard', { results })
        }).catch((error) => {
            return res.render('dashboard', { error })
        })
    } else {
        res.redirect('/login');
    }
});

var rankingsFunction = () => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT distinct(app_id),app_name,installs,description \
         FROM app NATURAL JOIN ( \
            SELECT app_id, \
                COUNT(*) installs \
            FROM transaction \
            GROUP BY app_id \
            ORDER BY COUNT(*) DESC \
        ) AS top \
        ORDER BY installs DESC;";
        db.query(sql, async (error, results) => {
            if (results.length == 0) {
                reject('Cannot generate rankings');
            } else {
                resolve(results);
            }
        })
    });
}

app.get('/rankings', (req, res) => {
    rankingsFunction()
        .then((results) => {
            console.log(results[0].app_id);
            console.log(results);
            return res.render('rankings', { results })
        }).catch((error) => {
            return res.render('rankings', { error })
        })
});

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
});


db.connect(function (err) {
    if (err) throw err;
    console.log("MySQL Connected!");
    db.query("select app_name from app;", function (err, result, fields) {
        if (err) throw err;
        // console.log("Result: " + JSON.stringify(result));
    });
});

app.listen(2678, () => console.log('Server started at http://localhost:2678'))