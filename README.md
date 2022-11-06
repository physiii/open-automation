## Objective
This repository contains the front facing and backend portions of __open-automation__. Its function is to route, process, and display data from devices and users. It provides a user interface for controlling devices, setting schedules, and has customizable text/email alert system.

#### Dashboard
![Alt text](/images/dashboard.png?raw=true "Dashboard")

## Technologies
ReactJS  
NodeJS  
MongoDB  
Websockets  
Z-Wave  
Hls  
FFmpeg  
FreeRTOS  

## Supported Devices

### Gateway (https://github.com/physiii/open-automation-gateway)
This is used to interface devices like cameras, thermostats, and various z-wave devices from other ecosystems into open-automation. Allows devices to operate while disconnected from the front end server.

### Cameras (https://github.com/physiii/open-automation-gateway)
Handled by gateway which performs computer vision tasks, motion detection, and supports 4K live streaming. Recordings can be stored remotely and played from video player component.

### Access Control (https://github.com/physiii/access-controller)
Can be interfaced with commercial strike/magnetic locks through my open-source controllers or third-party Z-wave deadbolts through the gateway software.

### Thermostat
Supports wifi thermostats through the gateway with scheduling and energy efficient features.

### Lights (https://github.com/physiii/led-controller)
Can use my open-source LED controller or Philips Hue lights through the gateway.

### Liger (https://github.com/physiii/liger)
General purpose relay board for attaching sirens and various sensors.

### Garage Opener (https://github.com/physiii/garage-opener)

### Beacon (https://github.com/physiii/beacon)
Android app for location tracking

## Graphs

#### Server
![Alt text](/images/server-graph.svg?raw=true "Server Graph")

#### Client
![Alt text](/images/website-graph.svg?raw=true "Server Graph")


# Installation
	sudo apt install -y mediainfo
    git clone https://github.com/physiii/open-automation
    cd open-automation
    cp .env.example .env
    nano .env
    echo "export NODE_ENV=development" >> ~/.bashrc
    source ~/.bashrc
    npm install
    #get .env key.pem cert.pem
    npm run build
    npm run start
