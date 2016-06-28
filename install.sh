sudo apt-get update
sudo apt-get install -y mongodb dnsmasq hostapd pkg-config libudev-dev libjpeg-dev libavformat56 libavformat-dev libavcodec56 libavcodec-dev libavutil54 libavutil-dev libc6-dev zlib1g-dev libmysqlclient18 libmysqlclient-dev libpq5 libpq-dev
sudo apt-get install -y tmux xdotool apache2 mysql-server php5 php5-mysql php5-gd motion libmysqlclient-dev libcurl4-openssl-dev
#sudo apt-get install -y tmux xdotool apache2 mysql-server libapache2-mod-php php php-mysql php-gd motion libmysqlclient-dev libcurl4-openssl-dev
sudo cp motion.conf /etc/motion/motion.conf
sudo cp motion /etc/default/motion
sudo cp rc.local /etc/rc.local
sudo chmod -R 777 /var
rm files/Audio files/Videos files/Documents files/motion
mkdir ~/Audio ~/Videos ~/Documents /var/lib/motion/video /var/lib/motion/images
ln -s /var/lib/motion files
ln -s ~/Audio files/
ln -s ~/Videos files/
ln -s ~/Documents files/
