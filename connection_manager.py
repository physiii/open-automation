import os
hostname = "8.8.8.8"
response = os.system("ping -c 1 " + hostname)
if response == 0:
    pingstatus = "Network Active"
else:
    os.system("sudo cp ~/open-automation/cp/interfaces.ap /etc/network/interfaces")
    os.system("sudo cp ~/open-automation/cp/hostapd.conf /etc/hostapd/hostapd.conf")
    os.system("sudo cp ~/open-automation/cp/hostapd /etc/default/hostapd")
    os.system("sudo ifdown wlan0 && sudo ifup wlan0 && sudo service hostapd restart")
    os.system("sudo reboot")
    pingstatus = "Network Error"
print pingstatus
