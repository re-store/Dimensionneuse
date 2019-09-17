import board
import busio
import adafruit_vl53l0x
import time
import pickle
import sys

root = "measure/"

# Z sensor calibration

i2c = busio.I2C(board.SCL, board.SDA)
sensor = adafruit_vl53l0x.VL53L0X(i2c)

sensor.measurement_timing_budget = 1000000

zCalib = sensor.range
configDictionary = { "zCalib": zCalib }

with open(root + "configZ", "wb") as config:
    pickle.dump(configDictionary, config)
    print("Calibrated.")
    sys.stdout.flush()