import board
import busio
import adafruit_vl53l0x
import time
import pickle
import json
import sys
from math import sqrt

measure = {}
root = "measure/"

# Load calibration parameters

cD = {}
with open(root + "configZ", "rb") as config:
    cD = pickle.load(config)

# Z sensor calibration

i2c = busio.I2C(board.SCL, board.SDA)
sensor = adafruit_vl53l0x.VL53L0X(i2c)

sensor.measurement_timing_budget = 1000000
measure["z"] = cD["zCalib"] - sensor.range

print(json.dumps(measure))
sys.stdout.flush()