#!/bin/sh -e
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y nmap npm motion speedtest-cli gstreamer1.0 v4l2loopback-dkms v4l2loopback-utils git nodejs mongodb dnsmasq hostapd pkg-config libudev-dev libjpeg-dev libavformat-dev libavcodec-dev libavutil-dev libc6-dev zlib1g-dev libmysqlclient-dev libpq5 libpq-dev tmux xdotool apache2 mysql-server libmysqlclient-dev libcurl4-openssl-dev
sudo ln -s /usr/bin/nodejs /usr/bin/node
sudo chmod -R 777 /var
sudo chmod -R 777 /usr/src
sudo chmod a+rwxt /var/run/motion
sudo cp motion/motion.conf /etc/motion/motion.conf
#rm files/Audio files/Videos files/Documents files/motion
#mkdir ~/Audio ~/Videos ~/Documents /var/lib/motion/video /var/lib/motion/images
#mkdir ~/Audio ~/Videos ~/Documents files
#ln -s /var/lib/motion files
#ln -s ~/Audio files/
#ln -s ~/Videos files/
#ln -s ~/Documents files/
echo "enable raspicam!"

#TODO: just include the binary
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

cd /usr/src
git clone https://github.com/umlaeute/v4l2loopback
cd v4l2loopback
make && sudo make install
modprobe v4l2loopback video_nr=1,10,11

##ffmpeg
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

##install open-automation
sudo npm install -g pm2
npm install
