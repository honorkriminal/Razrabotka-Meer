import sys

from mss import mss
from mss.tools import to_png

with mss() as display:
    image = display.grab(display.monitors[1])
    to_png(image.rgb, image.size, output=sys.argv[1])
