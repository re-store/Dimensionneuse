"""Calibration process : checkerboard detection, undistort, crop and homography"""

import numpy as np
import pickle
import cv2
import util
import sys

# Parameters

CHK_SIZE = [15, 10] # Inner corners of the checkerboard
TILE_SIZE = 50      # Size of a square in mm
ZOOM = 2            # Number of px per mm after the homography
RESIZE_RATIO = 0.6  # Downsampling ratio (checkerboard detection)

# Load the image and create a smaller grayscale version

img = cv2.imread("measure/calib.jpg")
small_img = cv2.resize(img,
                       (0, 0),  # set fx and fy, not the final size
                       fx=RESIZE_RATIO,
                       fy=RESIZE_RATIO,
                       interpolation=cv2.INTER_NEAREST)
gray = cv2.cvtColor(small_img, cv2.COLOR_BGR2GRAY)

# Find the checkerboard

corners2 = util.findCheckerboard(gray, CHK_SIZE) / RESIZE_RATIO

# Find undistortion parameters

objp = np.zeros((CHK_SIZE[0]*CHK_SIZE[1], 3), np.float32)
objp[:, :2] = np.mgrid[0:CHK_SIZE[1],
                       0:CHK_SIZE[0]].T.reshape(-1, 2)
objpoints = []
objpoints.append(objp)
imgpoints = []
imgpoints.append(np.array(corners2))
ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera(
    objpoints, imgpoints, gray.shape[::-1], None, None)

# Find crop parameters

h, w = img.shape[:2]
newcameramtx, roi = cv2.getOptimalNewCameraMatrix(mtx, dist, (w, h), 1, (w, h))
x, y, w, h = roi

# Find homography parameters

corners3 = cv2.undistortPoints(corners2, mtx, dist, None, newcameramtx)

pts_src = [[corners3[0][0][0] - x, corners3[0][0][1] - y],
           [corners3[CHK_SIZE[1] - 1][0][0] - x,
               corners3[CHK_SIZE[1] - 1][0][1] - y],
           [corners3[-CHK_SIZE[1]][0][0] - x, corners3[-CHK_SIZE[1]][0][1] - y],
           [corners3[-1][0][0] - x, corners3[-1][0][1] - y]]

xD = (CHK_SIZE[0]-1.0) * TILE_SIZE * ZOOM
yD = (CHK_SIZE[1]-1.0) * TILE_SIZE * ZOOM
pts_dest = [[0.0, 0.0],
            [yD, 0.0],
            [0.0, xD],
            [yD, xD]]

h2, status = cv2.findHomography(np.array(pts_src), np.array(pts_dest))

# Save these parameters

configDictionary = {"TILE_SIZE": TILE_SIZE,
                    "ZOOM": ZOOM,
                    "mtx": mtx,
                    "dist": dist,
                    "newcameramtx": newcameramtx,
                    "h2": h2,
                    "y": y,
                    "h": h,
                    "x": x,
                    "w": w,
                    "xD": xD,
                    "yD": yD}

with open("measure/config", "wb") as config:
    pickle.dump(configDictionary, config)
    print("Calibrated.")
    sys.stdout.flush()
    