#!/bin/sh -e
# make it so it will install in back ground and output to log so you can tail -f if you want
#wget -qO- https://raw.githubusercontent.com/physiii/open-automation/master/install.sh | bash

## speed up sd card on pi
# https://www.jeffgeerling.com/blog/2016/how-overclock-microsd-card-reader-on-raspberry-pi-3
# sudo bash -c 'printf "dtoverlay=sdhost,overclock_50=100\n" >> /boot/config.txt'
# Installs and run hdparm, dd, and iozone benchmarks.
# curl https://raw.githubusercontent.com/geerlingguy/raspberry-pi-dramble/master/setup/benchmarks/microsd-benchmarks.sh | sudo bash
# Run hdparm and some large file read/write benchmarks.
# curl http://www.nmacleod.com/public/sdbench.sh | sudo bash

sudo apt-get install -y curl
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get update
sudo apt-get upgrade -y

sudo apt-get install -y --force-yes \
bc g++ lua5.2 bc sshpass libudev-dev nmap motion speedtest-cli gstreamer1.0 \
v4l2loopback-dkms v4l2loopback-utils git nodejs mongodb dnsmasq hostapd \
pkg-config libudev-dev libjpeg-dev libavformat-dev libavcodec-dev libavutil-dev \
libc6-dev zlib1g-dev libpq5 libpq-dev tmux xdotool

sudo ln -s /usr/bin/nodejs /usr/bin/node
sudo chmod a+rwxt /var/run/motion

## make and install openzwave
cd /usr/src
wget http://old.openzwave.com/downloads/openzwave-1.4.1.tar.gz
tar zxvf openzwave-1.4.1.tar.gz
cd openzwave-1.4.1
make && sudo make install
export LD_LIBRARY_PATH=/usr/local/lib
sudo ldconfig
sudo sed -i '$a LD_LIBRARY_PATH=/usr/local/lib' /etc/environment
sudo ln -s /usr/local/lib64/libopenzwave.so.1.4 /usr/local/lib/

## create loop back devices for video
sudo wget https://raw.githubusercontent.com/notro/rpi-source/master/rpi-source -O /usr/bin/rpi-source
sudo chmod +x /usr/bin/rpi-source
/usr/bin/rpi-source -q --tag-update
rpi-source

## v4l2loopback
sudo chmod -R 777 /usr/src
cd /usr/src
git clone https://github.com/umlaeute/v4l2loopback
cd v4l2loopback
make && sudo make install
sudo modprobe v4l2loopback video_nr=1,10,11

## ffmpeg
cd /usr/src
git clone git://git.videolan.org/x264
cd x264
./configure --host=arm-unknown-linux-gnueabi --enable-static --disable-opencl
make
sudo make install

cd /usr/src
git clone https://github.com/FFmpeg/FFmpeg.git
cd FFmpeg
sudo ./configure --arch=armel --target-os=linux --enable-gpl --enable-libx264 --enable-nonfree
make
sudo make install

## install open-automation
cd ~
git clone https://github.com/physiii/open-automation
cd open-automation
sudo npm install -g pm2 openzwave-shared
npm install

## copy files and set permissions
sudo cp files/motion.conf /etc/motion/motion.conf
sudo cp files/thread1.conf /etc/motion/thread1.conf
sudo cp files/thread2.conf /etc/motion/thread2.conf
sudo cp files/default.motion /etc/default/motion
sudo service motion restart
sudo chmod -R 777 /var/log /var/lib
