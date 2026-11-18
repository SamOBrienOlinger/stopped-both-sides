#!/usr/bin/env python3
"""Rebuild the README's matching PDF and PNG guide. See docs/user-guide/README.md."""

from pathlib import Path
import shutil
import subprocess

from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "docs" / "user-guide"
WIDTH, HEIGHT = 700, 1580
REVIEWED = "18 November 2026"
GAME = "https://samobrienolinger.github.io/stopped-both-sides/"
REPOSITORY = "https://github.com/SamOBrienOlinger/stopped-both-sides"
BACKGROUND, WHITE = "#f6f3ec", "#ffffff"
INK, MUTED = "#17383d", "#466269"
TEAL, BLUE = "#126b63", "#355c85"
MINT, ICE = "#deeee6", "#e4ecf6"
BORDER, ACCENT = "#b7cbc5", "#a44e45"


def generate():
    if shutil.which("pdftoppm") is None:
        raise SystemExit("Install Poppler (pdftoppm) before generating the guide.")
    for name, weight in (("OpenSans", 400), ("OpenSansBold", 700)):
        pdfmetrics.registerFont(TTFont(name, str(ROOT / "assets" / "fonts" / f"open-sans-{weight}.ttf")))

    output = GUIDE / "stopped-both-sides-user-flow"
    pdf = canvas.Canvas(str(output.with_suffix(".pdf")), pagesize=(WIDTH, HEIGHT), invariant=1)
    pdf.setTitle("Stopped: Both Sides - How to play")
    pdf.setAuthor("Sam Tim Solutions")
    pdf.setSubject(f"Visual guide to shared play; English wording checked {REVIEWED}.")

    def rect(x, top, width, height, fill, radius=0, stroke=None):
        pdf.setFillColor(HexColor(fill))
        pdf.setStrokeColor(HexColor(stroke or fill))
        pdf.setLineWidth(0.85)
        pdf.roundRect(x, HEIGHT - top - height, width, height, radius, fill=1, stroke=int(bool(stroke)))

    def text(x, top, value, size=15, bold=False, color=MUTED, leading=None, width=None, center=False):
        font = "OpenSansBold" if bold else "OpenSans"
        leading = leading or size * 1.4
        pdf.setFillColor(HexColor(color))
        pdf.setFont(font, size)
        for index, line in enumerate(value.split("\n")):
            measured = pdfmetrics.stringWidth(line, font, size)
            if measured > (width if width is not None else WIDTH - x - 30):
                raise ValueError(f"Text exceeds its box: {line}")
            draw = pdf.drawCentredString if center else pdf.drawString
            draw(x, HEIGHT - top - size - index * leading, line)

    def line(x1, top1, x2, top2, color=TEAL, width=1.7):
        pdf.setStrokeColor(HexColor(color))
        pdf.setLineWidth(width)
        pdf.setLineCap(1)
        pdf.line(x1, HEIGHT - top1, x2, HEIGHT - top2)

    def polygon(points, fill, stroke=None, width=1.5):
        p = pdf.beginPath()
        p.moveTo(points[0][0], HEIGHT - points[0][1])
        for x, top in points[1:]:
            p.lineTo(x, HEIGHT - top)
        p.close()
        pdf.setFillColor(HexColor(fill))
        pdf.setStrokeColor(HexColor(stroke or fill))
        pdf.setLineWidth(width)
        pdf.drawPath(p, fill=1, stroke=int(bool(stroke)))

    def arrow(x, start, end):
        line(x, start, x, end - 5)
        polygon([(x - 3.5, end - 5), (x + 3.5, end - 5), (x, end)], TEAL)

    def icon(name, x, top, size=26, color=TEAL):
        """Draw simple vector symbols; words always carry the instruction."""
        pdf.saveState()
        pdf.translate(x, HEIGHT - top - size)
        pdf.scale(size / 24, size / 24)
        pdf.setStrokeColor(HexColor(color))
        pdf.setFillColor(HexColor(color))
        pdf.setLineWidth(1.7)
        pdf.setLineCap(1)
        pdf.setLineJoin(1)
        if name == "book":
            p = pdf.beginPath()
            p.moveTo(12, 3)
            p.curveTo(8, 5, 5, 5, 2, 4)
            p.lineTo(2, 20)
            p.curveTo(5, 21, 9, 21, 12, 19)
            p.curveTo(15, 21, 19, 21, 22, 20)
            p.lineTo(22, 4)
            p.curveTo(19, 5, 16, 5, 12, 3)
            pdf.drawPath(p, fill=0, stroke=1)
            pdf.line(12, 3, 12, 19)
            for y in (9, 13, 17):
                pdf.line(5, y, 9, y)
                pdf.line(15, y, 19, y)
        elif name == "bulb":
            p = pdf.beginPath()
            p.moveTo(8, 7)
            p.curveTo(8, 10, 5, 11, 5, 15)
            p.curveTo(5, 24, 19, 24, 19, 15)
            p.curveTo(19, 11, 16, 10, 16, 7)
            p.close()
            pdf.drawPath(p, fill=0, stroke=1)
            pdf.line(9, 4, 15, 4)
            pdf.line(10, 1, 14, 1)
            pdf.line(12, 8, 12, 14)
        elif name in ("next", "switch"):
            for y, direction in ([(12, 1)] if name == "next" else [(17, 1), (7, -1)]):
                pdf.line(3, y, 21, y)
                p = pdf.beginPath()
                tip = 21 if direction == 1 else 3
                p.moveTo(tip - 5 * direction, y + 4)
                p.lineTo(tip, y)
                p.lineTo(tip - 5 * direction, y - 4)
                pdf.drawPath(p, fill=0, stroke=1)
        elif name == "retry":
            pdf.arc(4, 3, 22, 21, startAng=45, extent=-285)
            p = pdf.beginPath()
            p.moveTo(4, 21)
            p.lineTo(4, 13)
            p.lineTo(12, 13)
            pdf.drawPath(p, fill=0, stroke=1)
        elif name == "person":
            pdf.circle(12, 17, 4, fill=0, stroke=1)
            pdf.arc(4, 0, 20, 12, startAng=0, extent=180)
            pdf.line(4, 6, 4, 3)
            pdf.line(20, 6, 20, 3)
        elif name == "list":
            for y in (18, 12, 6):
                pdf.circle(4, y, 1, fill=1, stroke=0)
                pdf.line(9, y, 21, y)
        elif name == "grid":
            for xx in (3, 14):
                for yy in (3, 14):
                    pdf.roundRect(xx, yy, 7, 7, 1, fill=0, stroke=1)
        elif name == "clock":
            pdf.circle(12, 12, 9, fill=0, stroke=1)
            pdf.line(12, 12, 12, 18)
            pdf.line(12, 12, 16, 10)
        elif name == "save":
            pdf.roundRect(3, 2, 18, 20, 2, fill=0, stroke=1)
            pdf.rect(7, 14, 10, 8, fill=0, stroke=1)
            pdf.roundRect(7, 2, 10, 7, 1, fill=0, stroke=1)
        elif name == "info":
            pdf.circle(12, 12, 9, fill=0, stroke=1)
            pdf.circle(12, 17, 0.8, fill=1, stroke=0)
            pdf.line(12, 7, 12, 12)
        pdf.restoreState()

    def card(number, title, top, height, symbol=None, heading_size=23):
        rect(70, top, 570, height, WHITE, radius=17, stroke=BORDER)
        pdf.setFillColor(HexColor(INK if number == 6 else TEAL))
        pdf.circle(70, HEIGHT - top - 29, 18, fill=1, stroke=0)
        text(70, top + 13, str(number), 22, True, WHITE, center=True, width=32)
        text(100, top + 13, title, heading_size, True, INK)
        if symbol:
            rect(589, top + 15, 31, 31, MINT, radius=9)
            icon(symbol, 595, top + 21, 19)

    def button(x, top, width, label, fill=TEAL, color=WHITE, size=14, height=34, symbol=None):
        rect(x, top, width, height, fill, radius=8)
        if symbol:
            icon(symbol, x + 11, top + (height - 18) / 2, 18, color)
        text(x + width / 2 + (9 if symbol else 0), top + (height - size) / 2 - 1,
             label, size, True, color, width=width - (44 if symbol else 20), center=True)

    def perspective_button(x, label, role, fill, color):
        top, width, height = 243, 245, 74
        rect(x, top, width, height, fill, radius=10)
        bx, bt = x + 7, top + 6
        rect(bx, bt, 62, 62, WHITE, radius=9)
        # Lay out the owner's original JPEG unchanged inside the white badge.
        pdf.saveState()
        clip = pdf.beginPath()
        clip.roundRect(bx, HEIGHT - bt - 62, 62, 62, 9)
        pdf.clipPath(clip, stroke=0, fill=0)
        pdf.drawImage(str(GUIDE / f"{role}-perspective-logo.jpeg"), bx - 11,
                      HEIGHT - bt - 59, width=84, height=56)
        pdf.restoreState()
        text(x + 80, top + (17 if "\n" in label else 26), label, 13.5, True, color, 19, width=155)
        pdf.linkURL(GAME + f"#encounters/{role}", (x, HEIGHT - top - height, x + width, HEIGHT - top), relative=0)

    rect(0, 0, WIDTH, HEIGHT, BACKGROUND)
    rect(38, 28, 5, 105, ACCENT, radius=2)
    text(60, 27, "STOPPED: BOTH SIDES", 15, True, TEAL)
    text(58, 54, "How to play", 38, True, INK)
    text(60, 111, "Read a situation. Make a choice. Learn why it matters.", 16)

    card(1, "Choose your side", 164, 184)
    text(100, 207, "Start with either side. You can switch while you play.", 14)
    perspective_button(100, "Play as a member\nof the public", "public", MINT, TEAL)
    perspective_button(363, "Play as a Garda", "garda", ICE, BLUE)
    text(100, 326, "Same situations, two perspectives. Playing both sides is optional.", 12)
    arrow(355, 348, 365)

    card(2, "Pick a situation", 368, 190, "grid")
    button(100, 417, 237, "Start this situation", symbol="next")
    button(371, 417, 237, "Browse all situations", MINT, TEAL)
    text(354, 425, "or", 12, True, MUTED, center=True, width=22)
    text(100, 457, "Try the suggested situation.", 12.5)
    text(371, 457, "Choose from 24 situations.", 12.5, width=237)
    text(100, 488, "Topics include", 11.5, True)
    for x, w, label in [(191, 101, "Street stops"), (302, 87, "Searches"), (399, 128, "Discrimination")]:
        rect(x, 482, w, 25, BACKGROUND, radius=12)
        text(x + w / 2, 487, label, 10.5, color=MUTED, width=w - 16, center=True)
    icon("person", 101, 525, 18)
    text(128, 524, "A character is already chosen. You can change them.", 12.7)
    arrow(355, 558, 575)

    card(3, "Read, then choose", 578, 146)
    icon("book", 103, 643, 43)
    text(165, 632, "Read what is happening.\nChoose what you would\nsay or do.", 15, leading=21, width=250)
    # A schematic of the game's choice buttons, with no invented story or score.
    for i, letter in enumerate("ABC"):
        top = 632 + i * 27
        rect(457, top, 149, 22, MINT if i == 1 else BACKGROUND, radius=5)
        text(469, top + 3, letter, 10, True, TEAL)
        line(490, top + 11, 589 - i * 8, top + 11, TEAL if i == 1 else BORDER, 2.3)
    polygon([(595, 675), (595, 692), (600, 687), (604, 695), (608, 693), (604, 685), (612, 685)], WHITE, TEAL, 1)
    arrow(355, 724, 741)

    card(4, "Learn why it matters", 744, 276, "bulb")
    rect(100, 800, 508, 60, MINT, radius=10)
    icon("bulb", 112, 813, 30)
    text(155, 809, "YOUR LEARNING POINT", 10, True, TEAL)
    text(155, 830, "Read the explanation for your answer.", 14.2, width=440)
    button(100, 872, 161, "Why this matters", BACKGROUND, MUTED, size=11.5, height=26)
    button(273, 872, 335, "Read the sources for this decision", BACKGROUND, MUTED, size=11.5, height=26)
    text(100, 909, "OPTIONAL: TRY AGAIN OR SWITCH SIDES", 10, True, ACCENT)
    button(100, 930, 245, "Try another answer", MINT, TEAL, size=12.5, height=31, symbol="retry")
    button(363, 930, 245, "Compare the other side", ICE, BLUE, size=12.1, height=31, symbol="switch")
    text(100, 969, "Change your answer\nfor the side you are playing.", 11.7, leading=16, width=245)
    text(363, 969, "Try this moment from the other side.\nBoth sides' answers are kept.", 11.7, leading=16, width=245)
    arrow(355, 1020, 1037)

    card(5, "Continue the situation", 1040, 138, heading_size=22)
    button(100, 1094, 185, "Next decision", symbol="next")
    text(307, 1092, "Use Next decision when\nthere is more to explore.", 14, leading=19, width=280)
    icon("info", 101, 1146, 16)
    text(127, 1145, "New variation? Read what has changed.", 12.5)
    pdf.saveState()
    pdf.setDash(4, 4)
    line(640, 1111, 662, 1111)
    line(662, 1111, 662, 651)
    line(662, 651, 648, 651)
    pdf.restoreState()
    polygon([(648, 647), (648, 655), (641, 651)], TEAL)
    pdf.saveState()
    pdf.translate(680, HEIGHT - 987)
    pdf.rotate(90)
    pdf.setFillColor(HexColor(TEAL))
    pdf.setFont("OpenSansBold", 9)
    pdf.drawString(0, 0, "REPEAT FOR EACH DECISION")
    pdf.restoreState()
    arrow(355, 1178, 1203)
    text(370, 1184, "AT THE FINAL DECISION", 8.5, True, TEAL)

    card(6, "Review what you learned", 1206, 184, "list", heading_size=22)
    button(100, 1261, 185, "View recap", symbol="list")
    text(307, 1259, "Look back at your choices\nand the explanations.", 14, leading=19, width=280)
    for x, symbol, label in [(100, "list", "Review your choices"), (274, "switch", "Try the other side"), (448, "grid", "Choose another situation")]:
        rect(x, 1320, 160, 54, BACKGROUND, radius=9)
        icon(symbol, x + 70, 1327, 20)
        text(x + 80, 1353, label, 10, True, MUTED, width=154, center=True)

    rect(70, 1410, 570, 91, MINT, radius=12)
    for x, symbol, label in [(91, "person", "No sign-up"), (258, "clock", "No timer"), (414, "save", "Saved in this browser")]:
        icon(symbol, x, 1428, 20)
        text(x + 29, 1430, label, 11.5, True, TEAL)
    text(355, 1470, "Progress is saved when browser storage is available.", 10.5, width=540, center=True)
    line(70, 1520, 640, 1520, BORDER, 0.8)
    text(70, 1531, f"Checked against the English game - {REVIEWED}", 10)
    text(70, 1551, "github.com/SamOBrienOlinger/stopped-both-sides", 10)
    pdf.linkURL(REPOSITORY, (70, HEIGHT - 1567, 520, HEIGHT - 1547), relative=0)
    pdf.showPage()
    pdf.save()
    subprocess.run(["pdftoppm", "-singlefile", "-scale-to-x", "1400", "-scale-to-y", "-1",
                    "-png", str(output.with_suffix(".pdf")), str(output)], check=True)
    print(f"Generated {output.with_suffix('.pdf')} and {output.with_suffix('.png')}")


if __name__ == "__main__":
    generate()
