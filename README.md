## This repository contains the relay server portion of __open-automation__. Its main function is to route and process device and user data.

### open-automation is made from a cohesive set of web languages.

### Used for controlling cameras, dead bolts, garage openers, lights, thermostats, media, glass break, and a customizable alert system.


1. React frontend - http://open-automation.org
2. NodeJS and MongoDB for tokens, authentication, general processing
3. websocket relay server to communicate behind firewalls and routers - https://github.com/physiii/node-relay
4. z-wave compatible - https://github.com/OpenZWave
5. text alerts
6. motion - http://www.lavrsen.dk/foswiki/bin/view/Motion/WebHome
7. files - https://github.com/efeiefei/node-file-manager
8. thermostat - http://www.radiothermostat.com/
9. android - https://github.com/physiii/beacon

# Installation

    cp .env.example .env
    nano .env
    echo "export NODE_ENV=development" >> ~/.bashrc
    source ~/.bashrc
    npm install
    #get key.pem cert.pem
