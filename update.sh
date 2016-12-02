#!/bin/sh -e
git pull
sudo pkill node
sudo /etc/rc.local
