# home-gateway
Home automation and media server controlling a plethora of devices like cameras, lights, thermostats, media, glass break, and sends alerts via text message.

=======
#installation

##gateway
1. sudo apt-get install apache2 mysql-server php5 php5-mysql php5-gd motion libmysqlclient-dev libcurl4-openssl-dev
2. mysql -u root -p
3. -- create database device;
15. clone repository into web directory
16. -- sudo git clone https://github.com/physiii/home-gateway.git /var/www/html
13. sudo nano /etc/rc.local
14. -- su pi -c 'sudo node /var/www/node/gateway >> /var/www/node/gateway.log 2>&1 &'

##camera (optional)
1. do steps for gateway then
10. sudo nano /etc/default/motion
11. -- change to start_motion_daemon=yes
12. sudo nano /etc/motion/motion.conf
13. -- change to stream_localhost off
14. sudo chmod -R 777 /var/lib/motion
15. -- sudo cp camera/nph-mjprox /usr/lib/cgi-bin
