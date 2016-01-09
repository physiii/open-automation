# media-server
nodejs automation and media server

##installation

1. sudo apt-get install nodejs apache2 mysql-server php5 php5-mysql php5-gd motion libmysqlclient-dev libcurl4-openssl-dev
2. clone repository into web directory
2. -- sudo git clone https://github.com/physiii/media-server.git /var/www/html
2. mysql -u root -p
3. create database userfrosting;
4. sudo a2enmod rewrite cgi
5. sudo nano /etc/apache2/apache2.conf
6. -- change AllowOverride All for /var/www/
7. -- Require all granted
7. sudo nano /etc/default/motion
8. -- change to start_motion_daemon=yes
9. sudo nano /etc/motion/motion.conf
10. -- change to stream_localhost off
11. sudo chown -R pi /var/lib/motion; sudo chmod -R u+rX /var/lib/motion
12. go to http://127.0.0.1 and create master account (token for userfrosting database in the uf_configuration table)
13. edit /etc/rc.local
14. -- add this line: su pi -c 'node /var/www/html/node/media-server >> /var/log/media-server.log 2>&1 &'
13. [still editing]


##Dashboard
![Alt text](https://github.com/physiii/media-server/blob/master/screenshots/Screenshot%20from%202015-12-30%2012-35-47.png "Dashboard")

##Devices
![Alt text](https://github.com/physiii/media-server/blob/master/screenshots/Screenshot%20from%202015-12-31%2022-34-49.png "Devices")
