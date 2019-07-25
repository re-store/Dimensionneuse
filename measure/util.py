import cv2
import numpy as np

def findCheckerboard(gray, size):
    """Returns the corners of the checkerboard."""
    ret, corners = cv2.findChessboardCorners(gray, (size[1], size[0]), None)
    if ret == True:
        criteria = (cv2.TERM_CRITERIA_EPS +
                    cv2.TERM_CRITERIA_MAX_ITER, 30, 0.01)
        return cv2.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
    else:
        print("Couldn't find the checkerboard. Make sure that CHK_SIZE is right (inner corners), and that the image is correctly downsampled.")
        raise RuntimeError


def group(l, fun):
    """Group elements according to a comparison boolean function."""
    newl = []
    for i in range(len(l)):
        if i == 0:
            newl.append([l[0]])
        else:
            for j in range(len(newl)):
                if fun(newl[j][0], l[i]):
                    newl[j].append(l[i])
                    break
                if j == len(newl) - 1:
                    newl.append([l[i]])
    return newl


def getRectangle(lines):
    """Filter lines to select the four most probable borders of the rectangle, and return the rectangle."""
    DELTA_A = 0.5
    DELTA_B = 80  # Depends on the camera
    equations = []

    # First we get the equation of each line
    for line in lines:
        x1, y1, x2, y2 = line[0]
        if x1 == x2:
            x1 -= 1
        a = (y2 - y1) / (x2 - x1)
        b = y2 - a * x2
        equations.append([a, b, x1, x2, y1, y2])

    # Then we group these equations by close slope values
    eqBySlope = group(equations, lambda x, y: np.abs(x[0] - y[0]) < DELTA_A)

    # And we subgroup by b values
    eqByB = []
    for eqGroup in eqBySlope:
        if len(eqGroup) > 1:
            eqByB.append(
                group(eqGroup, lambda x, y: np.abs(x[1] - y[1]) < DELTA_B))

    # Hopefully we have 2 groups with 2 subgroups :-^
    finalEquations = []
    for eqGroup in eqByB:
        if len(eqGroup) > 1:
            if eqGroup[0][0][1] < eqGroup[1][0][1]:
                top = [e for e in eqGroup[0] if e[1]
                    == max([e[1] for e in eqGroup[0]])]
                bottom = [e for e in eqGroup[1] if e[1]
                        == min([e[1] for e in eqGroup[1]])]
                finalEquations.append(top[0])
                finalEquations.append(bottom[0])
            else:
                top = [e for e in eqGroup[1] if e[1]
                    == min([e[1] for e in eqGroup[1]])]
                bottom = [e for e in eqGroup[0] if e[1]
                        == max([e[1] for e in eqGroup[0]])]
                finalEquations.append(top[0])
                finalEquations.append(bottom[0])
    points = []
    for e in finalEquations:
        points.append([[e[2], e[4]]])
        points.append([[e[3], e[5]]])
    return cv2.minAreaRect(np.array(points))
