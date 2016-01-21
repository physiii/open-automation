# media-server
nodejs automation and media server

##installation

1. sudo apt-get install nodejs apache2 mysql-server php5 php5-mysql php5-gd motion libmysqlclient-dev libcurl4-openssl-dev pkg-config tmux
2. clone repository into home directory
2. -- sudo git clone https://github.com/physiii/home-gateway.git ~/home-gateway
12. go to http://127.0.0.1 and create master account (token for userfrosting database in the uf_configuration table)
13. sudo nano /etc/rc.local
14. -- su pi -c 'node ~/home-gateway/gateway >> ~/home-gateway/gateway.log 2>&1 &'
13. [still editing]

##Dashboard
![Alt text](https://github.com/physiii/media-server/blob/master/screenshots/Screenshot%20from%202015-12-30%2012-35-47.png "Dashboard")

##Devices
![Alt text](https://github.com/physiii/media-server/blob/master/screenshots/Screenshot%20from%202015-12-31%2022-34-49.png "Devices")
