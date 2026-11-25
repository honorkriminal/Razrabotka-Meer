import re
import subprocess
import sys

from mss import mss
from mss.tools import to_png

tree = subprocess.check_output(["xwininfo", "-root", "-tree"], text=True)
windows = [line for line in tree.splitlines() if "Visual Studio Code" in line or '("code" "Code")' in line]
with mss() as display:
    frame = display.monitors[1]
    for line in windows:
        geometry = re.search(r"(\d+)x(\d+)\+[-\d]+\+[-\d]+\s+\+(-?\d+)\+(-?\d+)", line)
        if geometry:
            w,h,x,y = map(int, geometry.groups())
            if w > 500 and h > 300:
                frame = {"left": max(x,0), "top": max(y,0), "width": min(w,frame["width"]-max(x,0)), "height": min(h,frame["height"]-max(y,0))}
                break
    image = display.grab(frame)
    to_png(image.rgb, image.size, output=sys.argv[1])
