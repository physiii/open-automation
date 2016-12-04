#!/bin/sh -e
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y git nodejs mongodb dnsmasq hostapd pkg-config libudev-dev libjpeg-dev libavformat56 libavformat-dev libavcodec56 libavcodec-dev libavutil54 libavutil-dev libc6-dev zlib1g-dev libmysqlclient18 libmysqlclient-dev libpq5 libpq-dev tmux xdotool apache2 mysql-server php5 php5-mysql php5-gd libmysqlclient-dev libcurl4-openssl-dev
cd ~
#TODO: just include the binary
wget http://old.openzwave.com/snapshots/openzwave-1.4.324.tar.gz
tar zxvf openzwave-*.gz
cd openzwave-* && make && sudo make install
export LD_LIBRARY_PATH=/usr/local/lib
sudo ldconfig
sudo sed -i '$a LD_LIBRARY_PATH=/usr/local/lib' /etc/environment
sudo chmod -R 777 /var
rm files/Audio files/Videos files/Documents files/motion
#mkdir ~/Audio ~/Videos ~/Documents /var/lib/motion/video /var/lib/motion/images
mkdir ~/Audio ~/Videos ~/Documents files
ln -s /var/lib/motion files
ln -s ~/Audio files/
ln -s ~/Videos files/
ln -s ~/Documents files/
echo "enable raspicam!"

##ffmpeg
#git clone git://git.videolan.org/x264
#cd x264
#./configure --host=arm-unknown-linux-gnueabi --enable-static --disable-opencl
#make
#sudo make install
#cd ..
#git clone https://github.com/FFmpeg/FFmpeg.git
#cd FFmpeg
#sudo ./configure --arch=armel --target-os=linux --enable-gpl --enable-libx264 --enable-nonfree
#make
#sudo make install
