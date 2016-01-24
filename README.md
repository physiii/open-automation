# home-gateway
nodejs automation and media server


##installation

###gateway
1. sudo apt-get install nodejs mysql-server php5 php5-mysql motion
2. mysql -u root -p
3. -- create database device;
15. clone repository into web directory
16. -- sudo git clone https://github.com/physiii/home-gateway.git /var/www/html
13. sudo nano /etc/rc.local
14. -- su pi -c 'sudo node /var/www/node/gateway >> /var/www/node/gateway.log 2>&1 &'

###camera
1. do steps for gateway then
10. sudo nano /etc/default/motion
11. -- change to start_motion_daemon=yes
12. sudo nano /etc/motion/motion.conf
13. -- change to stream_localhost off
14. sudo chmod -R 777 /var/lib/motion

##Dashboard
![Alt text](https://github.com/physiii/media-server/blob/master/screenshots/Screenshot%20from%202015-12-30%2012-35-47.png "Dashboard")

##Devices
![Alt text](https://github.com/physiii/media-server/blob/master/screenshots/Screenshot%20from%202015-12-31%2022-34-49.png "Devices")
