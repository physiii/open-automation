sudo apt-get update
sudo apt-get install -y xdotool apache2 mysql-server php5 php5-mysql php5-gd motion libmysqlclient-dev libcurl4-openssl-dev
sudo cp motion.conf /etc/motion/motion.conf
sudo cp motion /etc/default/motion
sudo cp rc.local /etc/rc.local
sudo chmod -R 777 /var
rm files/Audio files/Video files/Documents files/motion
mkdir ~/Audio ~/Videos ~/Documents /var/lib/motion/video /var/lib/motion/images
ln -s /var/lib/motion files
ln -s ~/Audio files/
ln -s ~/Videos files/
ln -s ~/Documents files/
