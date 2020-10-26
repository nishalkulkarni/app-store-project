const express = require('express');
var session = require('express-session');
const path = require('path');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const app = express();


const db = mysql.createConnection({
    host: "localhost",
    user: "nishal",
    password: "vanhalnis",
    database: "softstore"
});

db.connect(function (err) {
    if (err) throw err;
    console.log("MySQL Connected!");
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
        var sql = "SELECT app_id,app_name,description,cost,DATE_FORMAT(last_updated, '%d-%M-%y') last_updated\
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

var dashboardSearch = (appName) => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT app_id FROM app WHERE app_name = ?"
        db.query(sql, [appName], async (error, results) => {
            if (results.length == 0) {
                reject(error);
            } else {
                resolve(results);
            }
        })
    });
}

app.route('/dashboard')
    .get((req, res) => {
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
    }).post((req, res) => {
        var appName = req.body.search;
        dashboardSearch(appName)
            .then((results) => {
                res.redirect('/app/' + results[0].app_id);
            }).catch((error) => {
                res.redirect('dashboard');
            })
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
            return res.render('rankings', { results })
        }).catch((error) => {
            return res.render('rankings', { error })
        })
});

var devicesFunction = (uid) => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT device_id,os \
         FROM devices WHERE user_id = ?";
        db.query(sql, [uid], async (error, results) => {
            if (results.length == 0) {
                reject('No devices found. Please add a device');
            } else {
                resolve(results);
            }
        })
    });
}

var addDevice = (uid, os) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT device_id FROM devices;', async (error, results) => {
            if (error) console.log(error);
            else {
                var dids = [];
                results.forEach(element => {
                    dids.push(element.device_id);
                });

                let i = 10001;
                while (dids.includes('D' + i)) {
                    i += 1;
                }
                let newdid = 'D' + i;
                let params = { device_id: newdid, user_id: uid, os: os };
                db.query('INSERT INTO devices SET ? ', params, (error, re) => {
                    if (error) {
                        console.log(error);
                    } else {
                        resolve(params)
                    }
                });
            }
        });
    });
}

app.route('/devices')
    .get((req, res) => {
        var uid = req.session.user.user_id;
        devicesFunction(uid)
            .then((results) => {
                console.log(results)
                return res.render('devices', { results })
            }).catch((error) => {
                return res.render('devices', { error })
            })
    }).post((req, res) => {
        try {
            var os = req.body.os;
            var uid = req.session.user.user_id;

            addDevice(uid, os)
                .then((results) => {
                    res.redirect('/devices')
                }).catch((error) => {
                    res.redirect('/devices')
                })


        } catch (error) {
            console.log(error)
        }
    });


var getAppInfo = (aid) => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * \
             FROM app NATURAL JOIN developer WHERE app_id = ?";
        db.query(sql, [aid], async (error, results) => {
            if (results.length == 0) {
                reject('App not found');
            } else {
                resolve(results);
            }
        })
    });
}

getUserDevices = (uid) => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * \
             FROM devices WHERE user_id = ?";
        db.query(sql, [uid], async (error, results) => {
            resolve(results);
        })
    });
}

var getSupportedPlatforms = (aid) => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT os \
             FROM supported_platforms WHERE app_id = ?";
        db.query(sql, [aid], async (error, results) => {
            if (results.length == 0) {
                reject('Supported platforms not found');
            } else {
                resolve(results);
            }
        })
    });
}

var getFeedback = (aid) => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * \
             FROM feedback WHERE app_id = ?";
        db.query(sql, [aid], async (error, results) => {
            if (results.length == 0) {
                reject('No feedbacks given');
            } else {
                resolve(results);
            }
        })
    });
}

var sendFeedback = (aid, uid, rating, review) => {
    return new Promise((resolve, reject) => {
        let params = { user_id: uid, app_id: aid, rating: rating, review: review };
        db.query('INSERT INTO feedback SET ? ', params, (error, re) => {
            if (error) {
                console.log(error);
            } else {
                resolve(params)
            }
        });
    });
}

app.route('/app/app*')
    .get((req, res) => {
        var aid = req.url.substring(5);
        var uid = req.session.user.user_id;
        getAppInfo(aid)
            .then((appInfo) => {
                getUserDevices(uid)
                    .then((devcs) => {
                        console.log(appInfo, devcs)
                        var devis = [];
                        devcs.forEach(element => {
                            devis.push([element.os, element.device_id]);
                        });
                        appInfo[0]['user_devices'] = devis;
                        console.log(devis, appInfo);

                        getSupportedPlatforms(aid)
                            .then((sup_plat) => {
                                getFeedback(aid)
                                    .then((feeds) => {
                                        return res.render('app', { appInfo, sup_plat, feeds })
                                    }).catch((error) => {
                                        return res.render('app', { appInfo, sup_plat })
                                    })
                            }).catch((error) => {
                                return res.render('app', { appInfo })
                            })
                    }).catch((error) => {
                        return res.render('app', { appInfo })
                    })
            }).catch((error) => {
                return res.render('app', { error })
            })
    }).post((req, res) => {
        var aid = req.url.substring(5);
        var uid = req.session.user.user_id;
        var rating = req.body.rating;
        var review = req.body.review;

        sendFeedback(aid, uid, rating, review)
            .then((results) => {
                getAppInfo(aid)
                    .then((rei) => {
                        console.log(rei)
                        return res.redirect(aid)
                    }).catch((error) => {
                        return res.redirect(aid)
                    })
            }).catch((error) => {
                return res.render('app', { error })
            })

    });


var performInstallation = (aid, uid, did, vlink) => {
    return new Promise((resolve, reject) => {
        var sql = "INSERT INTO transaction SET ? ";
        let params = { user_id: uid, app_id: aid, device_id: did, version_link: vlink, installed: 'YES' };
        db.query(sql, params, async (error, results) => {
            if (results.length == 0) {
                reject('Error while performing transaction please try again');
            } else {
                resolve('Transaction performed successfully');
            }
        })
    });
}

app.route('/transaction')
    .get((req, res) => {
        res.redirect("dashboard");
    }).post((req, res) => {
        var aid = req.body.apid;
        var uid = req.session.user.user_id;
        var vlink = req.body.versions;
        var did = req.body.userDevices;
        console.log(aid, uid, vlink, did);

        performInstallation(aid, uid, did, vlink)
            .then((msg) => {
                res.render('transaction', {
                    message: msg
                })
            }).catch((err) => {
                res.render('transaction', {
                    message: err
                })
            })

    });

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
});

app.listen(2678, () => console.log('Server started at http://localhost:2678'))

// pmallia2@mysql.com
// FRqEM9R1