from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/social/sinhronica-share.png"
ICON = ROOT / "public/icons/sinhronica-v1-icon-512.png"
MASCOT = ROOT / "public/onboarding/practice.webp"

WIDTH, HEIGHT = 1200, 630
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def main() -> None:
    # Fixed zones: copy stays within x=70..720; mascot stays within x=770..1160.
    image = Image.new("RGB", (WIDTH, HEIGHT), "#07143B")
    pixels = image.load()
    assert pixels is not None
    for y in range(HEIGHT):
        for x in range(WIDTH):
            blue = int(59 + 70 * (x / WIDTH))
            glow = max(0, 1 - (((x - 930) / 470) ** 2 + ((y - 275) / 440) ** 2))
            pixels[x, y] = (7 + int(10 * glow), 20 + int(18 * glow), blue + int(32 * glow))

    # A deliberately separate, soft visual zone behind the mascot.
    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((745, 35, 1190, 600), fill=(34, 211, 238, 38))
    image = Image.alpha_composite(image.convert("RGBA"), glow.filter(ImageFilter.GaussianBlur(42)))
    draw = ImageDraw.Draw(image)

    icon = Image.open(ICON).convert("RGBA")
    icon.thumbnail((86, 86), Image.Resampling.LANCZOS)
    image.alpha_composite(icon, (70, 64))
    draw.text((178, 78), "Синхроника", font=font(FONT_BOLD, 45), fill="#F8FBFF")
    draw.text((72, 235), "Плыви к своим", font=font(FONT_BOLD, 58), fill="#F8FBFF")
    draw.text((72, 308), "целям в своём ритме", font=font(FONT_BOLD, 51), fill="#40DDF8")
    draw.text((74, 432), "Тренировки, фигуры и личный прогресс", font=font(FONT_REGULAR, 28), fill="#C4D7FF")

    mascot = Image.open(MASCOT).convert("RGBA")
    # Preserve the full artwork inside the dedicated right-side zone.
    mascot.thumbnail((380, 545), Image.Resampling.LANCZOS)
    mascot_x = 790 + (380 - mascot.width) // 2
    mascot_y = 58 + (545 - mascot.height) // 2
    image.alpha_composite(mascot, (mascot_x, mascot_y))

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(OUTPUT, "PNG", optimize=True)


if __name__ == "__main__":
    main()
