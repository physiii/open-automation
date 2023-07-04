const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = require('./website.setup');
const AccountsManager = require('./accounts/accounts-manager.js');
const setupRoutes = require('./website.routes');

const TAG = '[website.js]';
const tmpDir = '/tmp/open-automation';
const streamDir = path.join(tmpDir, '/stream/');
const MILLISECONDS_PER_SECOND = 1000;

module.exports = function (jwt_secret) {
    console.log(TAG, 'Starting website...', process.env);

	let logo_file_path = process.env.OA_LOGO_PATH || 'logo.png';

	try {
		fs.accessSync(__dirname + '/../public/' + logo_file_path);
	} catch (error) {
		logo_file_path = false;
	}

    // Remove existing temporary directory and create stream directory
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(streamDir, { recursive: true });

    // Setup options for helmet middleware
    const helmetOptions = {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ['\'self\''],
                scriptSrc: ['\'self\''],
                styleSrc: ['\'self\''],
                connectSrc: [
                    '\'self\'',
                    `${process.env.OA_SSL ? 'wss' : 'ws'}://${process.env.OA_DOMAIN_NAME}`
                ]
            }
        },
        crossdomain: { permittedPolicies: 'none' },
        frameguard: { action: 'deny' }
    };

    // Loosen security policies in development mode
    if (process.env.NODE_ENV === 'development') {
        helmetOptions.contentSecurityPolicy.directives.scriptSrc.push('\'unsafe-eval\'', '\'unsafe-inline\'');
        helmetOptions.contentSecurityPolicy.directives.styleSrc.push('\'unsafe-inline\'', 'blob:');
        helmetOptions.hsts = false;
    }

    // Verify Access Token
    const verifyAccessToken = (access_token, xsrf_token, skip_xsrf) => {
        return new Promise((resolve, reject) => {
            if (!access_token) {
                return reject('No access token');
            }

            jwt.verify(access_token, jwt_secret, { issuer: process.env.OA_API_TOKEN_ISSUER }, (error, claims) => {
                if (error) {
                    return reject(`Invalid access token ${error.name}`);
                }

                if (!skip_xsrf && xsrf_token !== claims.xsrf_token) {
                    return reject('Invalid XSRF token');
                }

                const account = AccountsManager.getAccountById(claims.sub);

                if (!account) {
                    return reject('Account not found');
                }

                resolve({
                    account,
                    refresh_token: claims.refresh_token
                });
            });
        });
    };

    // Routes
    setupRoutes(app);

    app.get('/js/config.js', (req, res) => {
        const config = {
            app_name: process.env.OA_APP_NAME || 'Open Automation',
            logo_path: logo_file_path
        };
        res.type('.js').send(`window.OpenAutomation = {config: ${JSON.stringify(config)}};`);
    });

    app.get('/get_ip', (req, res) => {
        const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(':').pop();
        res.send(ip);
    });

    app.post('/api/token', (req, res, next) => {
        const respondWithAccessToken = (account) => {
            account.generateAccessToken(process.env.OA_API_TOKEN_ISSUER, jwt_secret).then((tokens) => {
                const cookieOptions = `access_token=${tokens.access_token}; path=/; HttpOnly;${process.env.OA_SSL ? ' Secure;' : ''}`;
                res.setHeader('Set-Cookie', cookieOptions);
                res.json({
                    account: account.clientSerialize(),
                    xsrf_token: tokens.xsrf_token,
                    access_token_expires: jwt.decode(tokens.access_token).exp * MILLISECONDS_PER_SECOND
                });
            }).catch((error) => {
                console.log(TAG, 'Token signing error.', error);
                res.sendStatus(500);
            });
        };

        // Authenticate user credentials
        if (req.body.grant_type === 'password') {
            passport.authenticate('local', (error, account) => {
                if (error) return next(error);
                if (!account) return res.sendStatus(401);

                req.logIn(account, (error) => {
                    if (error) return next(error);
                    respondWithAccessToken(account);
                });
            })(req, res, next);
        } else if (req.body.grant_type === 'refresh') {
            const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};

            verifyAccessToken(cookies.access_token, req.headers['x-xsrf-token']).then(({ account, refresh_token }) => {
                account.verifyRefreshToken(refresh_token).then((is_refresh_token_valid) => {
                    if (is_refresh_token_valid) {
                        respondWithAccessToken(account);
                    } else {
                        res.sendStatus(401);
                    }
                }).catch(() => {
                    res.sendStatus(500);
                });
            }).catch((error) => {
                console.log(TAG, `Error validating access token (${error}).`);
                res.sendStatus(401);
            });
        } else {
            res.sendStatus(400);
        }
    });

    app.post('/api/logout', (req, res) => {
        res.setHeader('Set-Cookie', 'access_token=null; path=/; HttpOnly; expires=Thu, 01 Jan 1970 00:00:00 GMT;');
        res.sendStatus(200);
    });

    app.post('/api/account', (req, res) => {
        const { username, password } = req.body;

        AccountsManager.createAccount({ username, password }).then((account) => {
            console.log(TAG, 'Created account.', account.clientSerialize());
            res.status(201).json({ account: account.clientSerialize() });
        }).catch((error) => {
            const status = error === 'username' ? 409 : error === 'password' ? 422 : 500;
            res.sendStatus(status);
        });
    });

    app.get('*', (req, res) => {
        console.log(TAG, 'Sending index.html');
        res.sendFile('index.html', { root: path.resolve(__dirname, '../public') });
    });

    return app;
};
