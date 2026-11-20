"""Make the ground and rock textures for Rock Cycle Explorer.

Source: Poly Haven (polyhaven.com), all CC0 (free for any use).
Downloads are expected in SRC (1k or 2k JPGs from the Poly Haven API).
Output: assets/tex/*.jpg, 1024 px, ready for iPads.

Run:  python3 build_tools/textures.py
"""
import os
from PIL import Image

SRC = ['/home/claude/tex', '/home/claude/tex/cand']
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'tex')

# output name: (Poly Haven file, crop box as fractions or None, size)
JOBS = {
    # top surface
    'grass':      ('rocky_terrain_02.jpg', None, 1024),
    'slope':      ('aerial_grass_rock.jpg', None, 1024),
    'rock':       ('aerial_rocks_02.jpg', None, 1024),
    'snow':       ('snow_field_aerial.jpg', None, 1024),
    'sand':       ('coast_sand_01.jpg', None, 1024),
    'volc':       ('seaside_rock.jpg', None, 1024),
    'rock_n':     ('aerial_rocks_02_nor.jpg', None, 1024),
    'grass_n':    ('rocky_terrain_02_nor.jpg', None, 1024),
    # cut faces (rock units)
    'sed':        ('cliff_side.jpg', None, 1024),
    'gneiss':     ('marble_cliff_05.jpg', None, 1024),
    'granite':    ('granite_tile_03.jpg', (0.010, 0.010, 0.325, 0.325), 512),   # one tile, no grout lines
    'basalt':     ('dark_rock_02.jpg', None, 1024),
    'crust':      ('rock_face.jpg', None, 1024),
}


def find(name):
    for d in SRC:
        p = os.path.join(d, name)
        if os.path.exists(p):
            return p
    raise FileNotFoundError(name)


os.makedirs(OUT, exist_ok=True)
for out, (src, crop, size) in JOBS.items():
    im = Image.open(find(src)).convert('RGB')
    if crop:
        w, h = im.size
        im = im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
    im = im.resize((size, size), Image.LANCZOS)
    q = 90 if out.endswith('_n') else 84
    path = os.path.join(OUT, out + '.jpg')
    im.save(path, quality=q, optimize=True, progressive=False)
    print(out, os.path.getsize(path) // 1024, 'KB')
