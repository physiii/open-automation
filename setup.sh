sudo apt-get install apache2 mysql-server php5 php5-mysql php5-gd motion libmysqlclient-dev libcurl4-openssl-dev
sudo cp motion.conf /etc/motion/motion.conf
sudo cp motion /etc/default/motion
mkdir ~/audio ~/video ~/documents
sudo chmod -R 777 /var/lib/motion
ln -s ~/audio ./files/
ln -s ~/video ./files/
ln -s ~/documents ./files/
