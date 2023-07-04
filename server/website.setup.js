const express = require('express');
const AccountsManager = require('./accounts/accounts-manager.js');
const path = require('path');
const busboy = require('connect-busboy');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const compression = require('compression');
const bodyParser = require('body-parser');
const TAG = '[website.setup.js]';
const app = express();

const streamDir = path.join('/tmp', 'open-automation', 'stream');

app.use(busboy());
app.use(bodyParser.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: '500mb', extended: true, parameterLimit: 50000 }));
app.use(compression());
app.use(passport.initialize());
app.use(passport.session());
app.use('/', express.static(path.join(__dirname, '..', 'public')));
app.use('/stream', express.static(streamDir, {
	setHeaders: function(res, path, stat) {
		if (path.indexOf(".ts") > -1) {
				res.set("cache-control", "public, max-age=300");
		}
	}
}));
app.use('/recording', express.static('/usr/local/lib/open-automation/recording', {
	setHeaders: function(res, path, stat) {
		if (path.indexOf(".ts") > -1) {
				res.set("cache-control", "public, max-age=300");
		}
	}
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.use(new LocalStrategy((username, password, done) => {
    const account = AccountsManager.getAccountByUsername(username);

    if (!account) {
        console.log(TAG, `Login ${username}: account not found.`);
        return done(null, false);
    }

    account.isCorrectPassword(password).then((is_correct) => {
        if (!is_correct) {
            console.log(TAG, `Login ${username}: incorrect password.`);
            return done(null, false);
        }

        // Password is correct.
        return done(null, account);
    }).catch(() => {
        return done(null, false);
    });
}));

module.exports = app;
