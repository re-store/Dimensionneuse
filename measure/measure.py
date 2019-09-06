"""Measuring process :
    - Crop and undistort image
    - Apply the homography
    - Use Canny, gaussian blur & Hough algorithm to detect the lines
    - Filter the lines to get the 4 borders"""

import numpy as np
import pickle
import cv2
import util
import sys
import json

measure = {}
root = "measure/"

# Load calibration parameters

cD = {}
with open(root + "config", "rb") as config:
    cD = pickle.load(config)

if sys.argv[1] or sys.argv[2]:

    # Load new image, undistort & warp
    img2 = cv2.imread(root + "measure.jpg")
    img2 = cv2.undistort(img2, cD["mtx"], cD["dist"], None, cD["newcameramtx"])
    cv2.imwrite(root + "undistorted.jpg", img2)
    img2 = img2[cD["y"]:cD["y"]+cD["h"], cD["x"]:cD["x"]+cD["w"]]
    img2 = cv2.warpPerspective(img2, cD["h2"], (int(cD["yD"]), int(cD["xD"])))
    cv2.imwrite(root + 'perspective.jpg', img2)

    # "anti-checkerboard" filter

    CHK_DIFF = 50
    for line in img2:
        for pixel in line:
            r = int(pixel[0])
            g = int(pixel[1])
            b = int(pixel[2])
            if np.abs(r-g) + np.abs(r-b) + np.abs(b-g) < CHK_DIFF:
                pixel[0] = 0
                pixel[1] = 0
                pixel[2] = 0

    # Measure

    img2hsv = cv2.cvtColor(img2, cv2.COLOR_RGB2HSV)
    h, s, v = cv2.split(img2hsv)
    lines = None
    threshold = 120
    lowerBound = 50
    upperBound = 120
    tries = 0
    rect = []

    # Try to find correct values for the canny & hough algorithm

    while len(rect) == 0:
        try:
            edges = cv2.Canny(h, lowerBound, upperBound)
            kernel_size = 3
            edges = cv2.GaussianBlur(edges, (kernel_size, kernel_size), 0)
            #cv2.imwrite(root + 'canny-' + str(lowerBound) + '-' +
            #             str(upperBound) + '.jpg', edges)
            lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold,
                                    minLineLength=cD["TILE_SIZE"] * (cD["ZOOM"] + 2), maxLineGap=200)
            rect = util.getRectangle(lines)
        except:
            pass
        if tries > 100:
            print("Couldn't find the object borders.")
            raise Exception
        threshold -= 5
        lowerBound -= 2
        upperBound += 3
        tries += 1

    # Computes the size of the rectangle and draw a text

    w = np.floor(rect[1][0] / cD["ZOOM"])
    h = np.floor(rect[1][1] / cD["ZOOM"])
    pts = cv2.boxPoints(rect).astype(np.int32)
    cv2.drawContours(img2, [pts], -1, (0, 255, 0), 1, cv2.LINE_AA)
    cv2.putText(img2, str(w) + " x " + str(h) + "mm",
                (int(rect[0][0]), int(rect[0][1])), cv2.FONT_HERSHEY_SIMPLEX, 1, (100, 255, 100), 2)

    cv2.imwrite(root + 'contours.jpg', img2)
    if sys.argv[1]:
        measure["x"] = w
    if sys.argv[2]:
        measure["y"] = h

if sys.argv[3]:
    # Z sensor calibration

    import board
    import busio
    import adafruit_vl53l0x
    import time
    from math import sqrt

    i2c = busio.I2C(board.SCL, board.SDA)
    sensor = adafruit_vl53l0x.VL53L0X(i2c)

    sensor.measurement_timing_budget = 1000000
    measure["z"] = sensor.range

print(json.dumps(measure))
sys.stdout.flush()