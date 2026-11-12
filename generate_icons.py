#!/usr/bin/env python3
import struct
import zlib
import math
import os

def create_png(width, height, pixel_fn, filename):
    """
    Creates a standard RGBA PNG using only Python's built-in struct and zlib.
    pixel_fn is a callable (x, y, w, h) -> (r, g, b, a) with values 0-255.
    """
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack('>I', len(data)) + c + struct.pack('>I', crc)

    # PNG Signature
    png_bytes = bytearray(b'\x89PNG\r\n\x1a\n')

    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png_bytes.extend(chunk(b'IHDR', ihdr_data))

    # Raw image scanlines: each scanline starts with filter byte 0x00 (None)
    raw_rows = bytearray()
    for y in range(height):
        raw_rows.append(0)  # filter type None
        for x in range(width):
            r, g, b, a = pixel_fn(x, y, width, height)
            raw_rows.extend((int(r) & 0xff, int(g) & 0xff, int(b) & 0xff, int(a) & 0xff))

    compressed = zlib.compress(bytes(raw_rows), 9)
    png_bytes.extend(chunk(b'IDAT', compressed))
    png_bytes.extend(chunk(b'IEND', b''))

    os.makedirs(os.path.dirname(os.path.abspath(filename)), exist_ok=True)
    with open(filename, 'wb') as f:
        f.write(png_bytes)
    print(f"Created {filename} ({width}x{height}, {len(png_bytes)} bytes)")

def inside_flame(norm_x, norm_y):
    """
    Checks if normalized coordinate (norm_x in [-1, 1], norm_y in [-1, 1], where (0,0) is center,
    y pointing up from -1 to 1) is inside the flame shape.
    """
    # Flip y so 1 is flame tip, -1 is bottom
    # norm_x: -1 to 1, norm_y: -1 to 1
    x = norm_x
    y = norm_y

    # Outer teardrop/flame base
    if y < -0.8 or y > 0.85:
        return 0.0

    # Base circle at y = -0.2, radius ~ 0.55
    r_base = math.hypot(x, y + 0.2)
    if r_base < 0.55:
        # Smooth antialias near edge
        return max(0.0, min(1.0, (0.55 - r_base) * 20.0))

    # Upper teardrop/tip
    if y >= -0.2:
        # Width tapers as y approaches 0.85
        t = (0.85 - y) / 1.05
        max_w = 0.55 * math.sin(t * math.pi * 0.5)
        # S-curve curl at the tip
        center_curl = 0.12 * math.sin((y + 0.2) * math.pi * 1.5)
        dist = abs(x - center_curl)
        if dist < max_w:
            return max(0.0, min(1.0, (max_w - dist) * 20.0))

    return 0.0

def inside_inner_flame(norm_x, norm_y):
    x = norm_x
    y = norm_y
    if y < -0.6 or y > 0.4:
        return 0.0
    r_base = math.hypot(x, y + 0.15)
    if r_base < 0.28:
        return max(0.0, min(1.0, (0.28 - r_base) * 20.0))
    if y >= -0.15:
        t = (0.4 - y) / 0.55
        max_w = 0.28 * math.sin(t * math.pi * 0.5)
        dist = abs(x)
        if dist < max_w:
            return max(0.0, min(1.0, (max_w - dist) * 20.0))
    return 0.0

def draw_kidha_icon(x, y, w, h, maskable=False):
    # Normalize coords to [-1, 1]
    nx = (x / (w - 1.0)) * 2.0 - 1.0
    ny = (y / (h - 1.0)) * 2.0 - 1.0
    # Flame uses y pointing up
    flame_y = -ny

    # Base background: Deep dark slate #0F1015
    bg_r, bg_g, bg_b = 15, 16, 21

    if maskable:
        # Maskable icon has full bleed background to edges with safe zone
        scale = 0.72  # shrink flame to safe zone 80% circle
    else:
        scale = 0.88

    dist_from_center = math.hypot(nx, ny)

    # Ambient radial warm glow from center
    glow = max(0.0, 1.0 - (dist_from_center / 1.0))
    bg_r = int(bg_r + glow * 55)
    bg_g = int(bg_g + glow * 20)
    bg_b = int(bg_b + glow * 8)

    fnx = nx / scale
    fny = flame_y / scale

    flame_alpha = inside_flame(fnx, fny)
    inner_alpha = inside_inner_flame(fnx, fny)

    # Primary flame gradient: #f4511e to #FF6B35 to #ffb74d
    grad_t = max(0.0, min(1.0, (fny + 0.7) / 1.4))
    fl_r = int(244 * (1.0 - grad_t) + 255 * grad_t)
    fl_g = int(81 * (1.0 - grad_t) + 140 * grad_t)
    fl_b = int(30 * (1.0 - grad_t) + 60 * grad_t)

    # Inner flame: bright warm yellow #FFE082
    in_r, in_g, in_b = 255, 224, 130

    r = bg_r * (1.0 - flame_alpha) + fl_r * flame_alpha
    g = bg_g * (1.0 - flame_alpha) + fl_g * flame_alpha
    b = bg_b * (1.0 - flame_alpha) + fl_b * flame_alpha

    if inner_alpha > 0.0:
        r = r * (1.0 - inner_alpha) + in_r * inner_alpha
        g = g * (1.0 - inner_alpha) + in_g * inner_alpha
        b = b * (1.0 - inner_alpha) + in_b * inner_alpha

    return (int(r), int(g), int(b), 255)

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.join(base_dir, 'public')

    # 1. 192x192 icon
    create_png(192, 192, lambda x, y, w, h: draw_kidha_icon(x, y, w, h, False), os.path.join(public_dir, 'icon-192.png'))
    # Also create pwa-192x192.png alias
    create_png(192, 192, lambda x, y, w, h: draw_kidha_icon(x, y, w, h, False), os.path.join(public_dir, 'pwa-192x192.png'))

    # 2. 512x512 standard icon
    create_png(512, 512, lambda x, y, w, h: draw_kidha_icon(x, y, w, h, False), os.path.join(public_dir, 'icon-512.png'))
    # Also create pwa-512x512.png alias
    create_png(512, 512, lambda x, y, w, h: draw_kidha_icon(x, y, w, h, False), os.path.join(public_dir, 'pwa-512x512.png'))

    # 3. 512x512 maskable icon with safe zone
    create_png(512, 512, lambda x, y, w, h: draw_kidha_icon(x, y, w, h, True), os.path.join(public_dir, 'icon-512-maskable.png'))
    create_png(512, 512, lambda x, y, w, h: draw_kidha_icon(x, y, w, h, True), os.path.join(public_dir, 'pwa-maskable-512x512.png'))

    # 4. Apple Touch Icon 180x180
    create_png(180, 180, lambda x, y, w, h: draw_kidha_icon(x, y, w, h, False), os.path.join(public_dir, 'apple-touch-icon.png'))

    print("All PWA PNG icons generated successfully!")
