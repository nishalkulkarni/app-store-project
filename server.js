const express = require('express');
const session = require('express-session');
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

var getInstalledApp = (did) => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT app_name \
         FROM transaction NATURAL JOIN app WHERE device_id = ?";
        db.query(sql, [did], async (error, results) => {
            resolve(results);
        })
    });
}

app.route('/devices')
    .get((req, res) => {
        var uid = req.session.user.user_id;
        devicesFunction(uid)
            .then((devcs) => {
                devcs.forEach((element) => {
                    getInstalledApp(element.device_id)
                        .then((aps) => {
                            var instapps = [];
                            aps.forEach((ap) => {
                                instapps.push(ap.app_name)
                            });
                            element["installed_apps"] = instapps
                        })
                });
                return res.render('devices', { devcs })
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
                        var devis = [];
                        devcs.forEach(element => {
                            devis.push([element.os, element.device_id]);
                        });
                        appInfo[0]['user_devices'] = devis;

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



var devloginFunction = (email, password) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM developer WHERE dev_email = ?', [email], async (error, results) => {
            if (results.length == 0 || !(await password === results[0].dev_password)) {
                reject('Email or Password is incorrect');
            } else {
                resolve(results[0]);
            }
        })
    });
}

app.route('/devlogin')
    .get(sessionChecker, (req, res) => {
        res.render('devlogin');
    })
    .post((req, res) => {
        try {
            var email = req.body.email;
            var password = req.body.password;

            if (!email || !password) {
                return res.status(400).render('devlogin', {
                    message: 'Please provide valid email and password'
                })
            }

            devloginFunction(email, password)
                .then((results) => {
                    req.session.user = results;
                    res.redirect('/devdashboard')
                }).catch((error) => {
                    return res.render('devlogin', {
                        message: error
                    })
                })
        } catch (error) {
            console.log(error)
        }

    });

var publishApp = (appname, did, description, cost, paylink, v1link, v2link, v3link) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT app_id FROM app;', async (error, results) => {
            if (error) console.log(error);
            else {
                var aids = [];
                results.forEach(element => {
                    aids.push(element.app_id);
                });

                let i = 101;
                while (aids.includes('APP' + i)) {
                    i += 1;
                }
                let newaid = 'APP' + i;
                var dop = new Date().toISOString().slice(0, 19).replace('T', ' ');
                var lu = dop;
                let params = {
                    app_id: newaid,
                    dev_id: did,
                    app_name: appname,
                    description: description,
                    cost: cost,
                    payment_link: paylink,
                    date_of_publishing: dop,
                    last_updated: lu,
                    version_1_link: v1link,
                    version_2_link: v2link,
                    version_3_link: v3link
                };
                db.query('INSERT INTO app SET ? ', params, (error, re) => {
                    if (error) {
                        reject("Error whiile publishing app.")
                    } else {
                        resolve("App published Successfully")
                    }
                });
            }
        });
    });
}

var addSupportList = (appname, supplats) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT app_id FROM app WHERE app_name = ?', [appname], async (error, results) => {
            if (error) console.log(error);
            else {
                let aid = results[0].app_id;
                let params = []
                supplats.forEach((element) => {
                    params.push([aid, element]);

                });

                db.query('INSERT INTO supported_platforms (app_id, os) VALUES ? ', [params], (error, re) => {
                    if (error) {
                        reject("Error whiile publishing app.")
                    } else {
                        resolve("App published and added supported platforms successfully")
                    }
                });
            }
        });
    });
}

app.route('/devdashboard')
    .get((req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            res.render('devdashboard')
        } else {
            res.redirect('/devlogin');
        }
    }).post((req, res) => {
        var appname = req.body.appname;
        var did = req.session.user.dev_id;
        var description = req.body.description;
        var cost = req.body.cost;
        var paylink = req.body.paylink;
        var v1link = req.body.v1link;
        var v2link = req.body.v2link;
        var v3link = req.body.v3link;
        var supplats = req.body.supplat.split(',');

        publishApp(appname, did, description, cost, paylink, v1link, v2link, v3link)
            .then((msg) => {
                addSupportList(appname, supplats)
                    .then((misg) => {
                        res.render('devdashboard', {
                            message: misg
                        })
                    }).catch((erro) => {
                        res.render('devdashboard', {
                            message: msg
                        })

                    })
            }).catch((err) => {
                res.render('devdashboard', {
                    message: err
                })
            })
    });

getDevApps = (did) => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT app_id,app_name \
                 FROM app WHERE dev_id = ?";
        db.query(sql, [did], async (error, results) => {
            resolve(results);
        })
    });
}

getGeoReach = (aid) => {
    return new Promise((resolve, reject) => {
        var sql = "select address from users NATURAL JOIN transaction \
                    natural join app WHERE app_id = ?;";
        db.query(sql, [aid], async (error, results) => {
            resolve(results);
        })
    });
}

getDeviceReach = (aid) => {
    return new Promise((resolve, reject) => {
        var sql = "select os from devices natural join users NATURAL JOIN \
         transaction natural join app WHERE app_id = ?;";
        db.query(sql, [aid], async (error, results) => {
            resolve(results);
        })
    });
}

getInstallCount = (aid) => {
    return new Promise((resolve, reject) => {
        var sql = "select app_name,count(*) total_installs from \
                            transaction natural join app where app_id = ?;";
        db.query(sql, [aid], async (error, results) => {
            resolve(results);
        })
    });
}

app.route('/analytics')
    .get((req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            var did = req.session.user.dev_id;
            getDevApps(did)
                .then((aps) => {
                    res.render('analytics', { aps })
                }).catch((err) => {
                    res.render('analytics', {
                        message: err
                    })
                })
        } else {
            res.redirect('/devlogin');
        }
    }).post((req, res) => {
        var aid = req.body.devApps;
        var did = req.session.user.dev_id;
        getDevApps(did)
            .then((aps) => {

                getInstallCount(aid)
                    .then((icounts) => {
                        getFeedback(aid)
                            .then((feeds) => {
                                getGeoReach(aid)
                                    .then((georeach) => {
                                        getDeviceReach(aid)
                                            .then((devicereach) => {
                                                res.render('analytics', { feeds, aps, georeach, devicereach, icounts })
                                            }).catch((err) => {
                                                res.render('analytics', { aps, feeds, georeach, icounts })
                                            })
                                    }).catch((err) => {
                                        res.render('analytics', { aps, feeds, icounts })
                                    })
                            }).catch((err) => {
                                res.render('analytics', { aps, icounts })
                            })

                    }).catch((euro) => {
                        res.render('analytics', { aps })
                    })
            }).catch((err) => {
                res.render('analytics', {
                    apna: err
                })
            })


    });


getUserApps = (uid) => {
    return new Promise((resolve, reject) => {
        var sql = "SELECT distinct(app_id),app_name FROM app NATURAL JOIN \
                    transaction WHERE user_id = ?";
        db.query(sql, [uid], async (error, results) => {
            resolve(results);
        })
    });
}

uninstallApp = (uid, did, aid) => {
    return new Promise((resolve, reject) => {
        var sql = "DELETE FROM transaction WHERE user_id = ? AND app_id = ? AND device_id = ?";
        db.query(sql, [uid, aid, did], async (error, results) => {
            if (error) reject("Error while uninstalling, check details and try again");
            resolve("App Uninstalled Successfully!");
        })
    });
}

changeVersion = (uid, did, aid, ver) => {
    return new Promise((resolve, reject) => {
        var vstr = '';
        if (ver == 1) vstr = 'version_1_link';
        else if (ver == 2) vstr = 'version_2_link';
        else if (ver == 3) vstr = 'version_3_link';

        var sql = "update transaction \
                    set version_link=(select "+ vstr + " from app where app_id = ?) \
                    WHERE app_id = ? AND device_id = ? AND user_id = ?;"

        db.query(sql, [aid, aid, did, uid], async (error, results) => {
            if (error) reject("Error while rolling to new version, check details and try again");
            resolve("Version changed Successfully!");
        })
    });
}



app.route('/manage')
    .get((req, res) => {
        var uid = req.session.user.user_id;
        getUserApps(uid)
            .then((aps) => {
                getUserDevices(uid)
                    .then((devcs) => {
                        res.render('manage', { aps, devcs })
                    }).catch((err) => {
                        res.render('manage', { message: "Some error occured, try again!" })
                    })
            }).catch((err) => {
                res.render('manage', { message: "Some error occured, try again!" })
            })
    }).post((req, res) => {
        var uid = req.session.user.user_id;
        var did = req.body.userDevices;
        var aid = req.body.userApps;
        var user_choice = req.body.userAction;

        getUserApps(uid)
            .then((aps) => {
                getUserDevices(uid)
                    .then((devcs) => {
                        if (user_choice == "useVersion1") {
                            changeVersion(uid, did, aid, 1)
                                .then((msg) => {
                                    res.render('manage', { aps, devcs, message: msg })
                                }).catch((err) => {
                                    res.render('manage', { aps, devcs, message: err })
                                })
                        } else if (user_choice == "useVersion2") {
                            changeVersion(uid, did, aid, 2)
                                .then((msg) => {
                                    res.render('manage', { aps, devcs, message: msg })
                                }).catch((err) => {
                                    res.render('manage', { aps, devcs, message: err })
                                })
                        } else if (user_choice == "useVersion3") {
                            changeVersion(uid, did, aid, 3)
                                .then((msg) => {
                                    res.render('manage', { aps, devcs, message: msg })
                                }).catch((err) => {
                                    res.render('manage', { aps, devcs, message: err })
                                })
                        } else if (user_choice == "uninstall") {
                            uninstallApp(uid, did, aid)
                                .then((msg) => {
                                    res.render('manage', { aps, devcs, message: msg })
                                }).catch((err) => {
                                    res.render('manage', { aps, devcs, message: err })
                                })
                        }
                    }).catch((err) => {
                        res.render('manage', { message: "Some error occured, try again!" })
                    })
            }).catch((err) => {
                res.render('manage', { message: "Some error occured, try again!" })
            })


    });

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
});

app.listen(2678, () => console.log('Server started at http://localhost:2678'))

// User
// pmallia2@mysql.com
// FRqEM9R1

// Developer
// mmorten3@Bluejam.com
// VksMPzVu6AO3