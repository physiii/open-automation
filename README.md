# home-gateway
Automation software for controlling cameras, dead bolts, garage openers, lights, thermostats, media, glass break, and sends alerts via text message.

angularjs frontend (open-automation.org)
nodejs and php on the backend
websocket relay server for communicate behind firewalls and routers (https://github.com/physiii/node-relay)
z-wave compatible (https://github.com/OpenZWave)
text alerts
motion (http://www.lavrsen.dk/foswiki/bin/view/Motion/WebHome)
files (https://github.com/efeiefei/node-file-manager)
thermostat (http://www.radiothermostat.com/)
android ()


**camera and files are proxied out 
**the port you set with -p [port]
**forward that port in your router to gain access to files and camera using remote tokens
=======
#installation
##install node 4.x from source
1. wget https://nodejs.org/dist/v4.2.6/node-v4.2.6.tar.gz && tar -zxvf node-v4.2.6.tar.gz && cd node-v4.2.6 && ./configure && make && sudo make install
2. git clone https://github.com/physiii/home-gateway.git && cd home-gateway && sh install.sh

##camera (optional)
1. sudo apt-get install apache2 mysql-server php5 php5-mysql php5-gd motion libmysqlclient-dev libcurl4-openssl-dev xdotool
2. sudo a2enmod cgi;
3. sudo nano /etc/default/motion
<br><b>start_motion_daemon=yes</b>
5. sudo nano /etc/motion/motion.conf
<br><b>stream_localhost off</b>
7. sudo chmod -R 777 /var/lib/motion

##System Overview
![Alt text](https://github.com/physiii/home-gateway/blob/master/screenshots/system%20overview.jpg?raw=true "system overview")

