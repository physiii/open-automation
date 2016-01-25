#encoding=utf8
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BCM)
gb1_pin = 23
GPIO.setup(gb1_pin, GPIO.IN, pull_up_down = GPIO.PUD_DOWN)
GPIO.setup(24, GPIO.IN, pull_up_down = GPIO.PUD_UP)

def alert(gb1_pin):
 print("glass break triggered on pin " + str(gb1_pin))
GPIO.add_event_detect(gb1_pin, GPIO.RISING, callback=alert, bouncetime=10)

while True:
 GPIO.wait_for_edge(24, GPIO.FALLING)
 print("Button 2 Pressed")
 GPIO.wait_for_edge(24, GPIO.RISING)
 print("Button 2 Released")
GPIO.cleanup()
