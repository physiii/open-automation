# home-gateway
Automation software for controlling cameras, dead bolts, garage openers, lights, thermostats, media, glass break, and sends alerts via text message. Camera and files are proxied out the port you set with -p [port]. Forward that port in your routers settings to gain access to files and camera using remote tokens

1. angularjs frontend (open-automation.org)
2. nodejs and php on the backend
3. websocket relay server to communicate behind firewalls and routers (https://github.com/physiii/node-relay)
4. z-wave compatible (https://github.com/OpenZWave)
5. text alerts
6. motion (http://www.lavrsen.dk/foswiki/bin/view/Motion/WebHome)
7. files (https://github.com/efeiefei/node-file-manager)
8. thermostat (http://www.radiothermostat.com/)
9. android (https://github.com/physiii/beacon)

=======
#installation
##install node 4.x from source
1. wget https://nodejs.org/dist/v4.2.6/node-v4.2.6.tar.gz && tar -zxvf node-v4.2.6.tar.gz && cd node-v4.2.6 && ./configure && make && sudo make install
2. git clone https://github.com/physiii/home-gateway.git && cd home-gateway && sh install.sh

##System Overview
![Alt text](https://github.com/physiii/home-gateway/blob/master/screenshots/system%20overview.jpg?raw=true "system overview")

