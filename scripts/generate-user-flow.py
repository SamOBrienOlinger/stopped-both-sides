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
WIDTH, HEIGHT = 700, 1320
REVIEWED = "18 November 2026"
GAME = "https://samobrienolinger.github.io/stopped-both-sides/"
REPOSITORY = "https://github.com/SamOBrienOlinger/stopped-both-sides"
BACKGROUND = "#f6f3ec"
INK = "#17383d"
MUTED = "#466269"
TEAL = "#126b63"
BLUE = "#355c85"
BORDER = "#a8bfba"
ACCENT = "#a44e45"


def generate():
    if shutil.which("pdftoppm") is None:
        raise SystemExit("Install Poppler (pdftoppm) before generating the guide.")
    for name, weight in (("OpenSans", 400), ("OpenSansBold", 700)):
        pdfmetrics.registerFont(TTFont(name, str(ROOT / "assets" / "fonts" / f"open-sans-{weight}.ttf")))

    output = GUIDE / "stopped-both-sides-user-flow"
    pdf = canvas.Canvas(str(output.with_suffix(".pdf")), pagesize=(WIDTH, HEIGHT), invariant=1)
    pdf.setTitle("Stopped: Both Sides - How to play")
    pdf.setAuthor("Sam Tim Solutions")
    pdf.setSubject(f"Six-step guide to shared play; wording checked {REVIEWED}.")

    def rect(x, top, width, height, fill, radius=0, stroke=None):
        pdf.setFillColor(HexColor(fill))
        pdf.setStrokeColor(HexColor(stroke or fill))
        pdf.setLineWidth(1)
        pdf.roundRect(x, HEIGHT - top - height, width, height, radius, fill=1, stroke=int(bool(stroke)))

    def text(x, top, value, size=17, bold=False, color=MUTED, leading=None):
        font = "OpenSansBold" if bold else "OpenSans"
        leading = leading or size * 1.4
        pdf.setFillColor(HexColor(color))
        pdf.setFont(font, size)
        for index, line in enumerate(value.split("\n")):
            if pdfmetrics.stringWidth(line, font, size) > WIDTH - x - 36:
                raise ValueError(f"Text exceeds the page: {line}")
            pdf.drawString(x, HEIGHT - top - size, line)
            top += leading

    def line(x1, top1, x2, top2, color=TEAL, width=1.8):
        pdf.setStrokeColor(HexColor(color))
        pdf.setLineWidth(width)
        pdf.line(x1, HEIGHT - top1, x2, HEIGHT - top2)

    def arrow(x, start, end):
        line(x, start, x, end - 4)
        path = pdf.beginPath()
        path.moveTo(x - 3.5, HEIGHT - end + 5)
        path.lineTo(x + 3.5, HEIGHT - end + 5)
        path.lineTo(x, HEIGHT - end)
        path.close()
        pdf.setFillColor(HexColor(TEAL))
        pdf.drawPath(path, fill=1, stroke=0)

    def card(number, title, top, height):
        rect(70, top, 550, height, "#ffffff", radius=18, stroke=BORDER)
        pdf.setFillColor(HexColor(INK if number == 6 else TEAL))
        pdf.circle(70, HEIGHT - top - 29, 20, fill=1, stroke=0)
        pdf.setFont("OpenSansBold", 24)
        pdf.setFillColor(HexColor("#ffffff"))
        pdf.drawCentredString(70, HEIGHT - top - 37, str(number))
        text(106, top + 14, title, 23, True, INK)

    def perspective_button(x, label, role, fill, color):
        top, width, height = 242, 235, 76
        rect(x, top, width, height, fill, radius=10)
        badge_x, badge_top, badge_size = x + 8, top + 6, 64
        rect(badge_x, badge_top, badge_size, badge_size, "#ffffff", radius=9)
        # Place the supplied JPEG unchanged; clip only its white side margins
        # inside the document's square logo badge. The source file is unedited.
        pdf.saveState()
        clip = pdf.beginPath()
        clip.roundRect(badge_x, HEIGHT - badge_top - badge_size, badge_size, badge_size, 9)
        pdf.clipPath(clip, stroke=0, fill=0)
        pdf.drawImage(str(GUIDE / f"{role}-perspective-logo.jpeg"), badge_x - 10,
                      HEIGHT - badge_top - 60, width=84, height=56)
        pdf.restoreState()
        text(x + 83, top + (19 if "\n" in label else 28), label, 13, True, color, 19)
        pdf.linkURL(GAME + f"#encounters/{role}", (x, HEIGHT - top - height, x + width, HEIGHT - top), relative=0)

    rect(0, 0, WIDTH, HEIGHT, BACKGROUND)
    rect(36, 30, 6, 127, ACCENT, radius=3)
    text(58, 30, "FIRST-TIME PLAYER GUIDE", 12, True)
    text(56, 52, "Stopped: Both Sides", 32, True, INK)
    text(56, 96, "How to play", 37, True, INK)
    text(58, 150, "Make a choice. Learn why it matters. Explore both sides.", 16.5)

    card(1, "Choose your side", 190, 164)
    perspective_button(106, "Play as a member\nof the public", "public", "#deeee6", TEAL)
    perspective_button(356, "Play as a Garda", "garda", "#e4ecf6", BLUE)
    text(106, 329, "Both perspectives explore the same shared situations.", 13.5)
    arrow(344, 354, 371)

    card(2, "Start a situation", 374, 132)
    text(106, 423, "Try the suggested situation or browse all 24.", 17)
    text(106, 449, "Filter by topic, including Discrimination.", 15.5)
    text(106, 474, "A character is ready. You can change it.", 15.5)
    arrow(344, 506, 523)

    card(3, "Read and choose", 526, 100)
    text(106, 572, "Read the fictional scene, then choose\nwhat you would say or do.", 17, leading=23)
    arrow(344, 626, 643)

    card(4, "Learn from feedback", 646, 218)
    text(106, 692, 'Read the explanation. Open "Why this matters"\nand the sources for more detail.', 17, leading=23)
    rect(106, 754, 480, 92, BACKGROUND, radius=12)
    text(122, 765, "OPTIONAL: EXPLORE BEFORE MOVING ON", 10.5, True, ACCENT)
    text(122, 786, "Try another answer", 14, True, INK)
    text(122, 808, "Rethink your choice.", 12)
    line(343, 790, 343, 832, BORDER, 0.8)
    text(360, 786, "Compare the other side", 13.5, True, INK)
    text(360, 808, "Same moment, other perspective.\nYour answers are kept.", 11.5, leading=16)
    arrow(344, 864, 881)

    card(5, "Continue the situation", 884, 112)
    text(106, 930, 'Select "Next decision" to move on.', 17)
    text(106, 957, "Repeat steps 3-5 until the situation ends.", 16)
    pdf.saveState()
    pdf.setDash(4, 3)
    line(620, 940, 649, 940)
    line(649, 940, 649, 576)
    line(649, 576, 625, 576)
    pdf.restoreState()
    path = pdf.beginPath()
    path.moveTo(628, HEIGHT - 572.5)
    path.lineTo(628, HEIGHT - 579.5)
    path.lineTo(621, HEIGHT - 576)
    path.close()
    pdf.setFillColor(HexColor(TEAL))
    pdf.drawPath(path, fill=1, stroke=0)
    pdf.saveState()
    pdf.translate(666, HEIGHT - 836)
    pdf.rotate(90)
    pdf.setFillColor(HexColor(TEAL))
    pdf.setFont("OpenSansBold", 10)
    pdf.drawString(0, 0, "NEXT DECISION")
    pdf.restoreState()
    arrow(344, 996, 1017)
    text(369, 999, "WHEN THE SITUATION ENDS", 9.5, True, TEAL)

    card(6, "Review and replay", 1020, 132)
    text(106, 1066, 'At the end, select "View recap".', 17)
    text(106, 1093, "Review each decision, try the other perspective\nor choose another situation.", 16, leading=22)

    text(70, 1172, "No sign-up. No timer.", 20, True, INK)
    text(70, 1207, "Progress is saved in this browser when storage is available.", 13)
    line(70, 1243, 620, 1243, BORDER, 0.8)
    text(70, 1257, f"Source: game interface and README - {REVIEWED}", 11)
    text(70, 1279, "github.com/SamOBrienOlinger/stopped-both-sides", 11)
    pdf.linkURL(REPOSITORY, (70, HEIGHT - 1297, 530, HEIGHT - 1276), relative=0)
    pdf.showPage()
    pdf.save()
    subprocess.run(["pdftoppm", "-singlefile", "-scale-to-x", "1400", "-scale-to-y", "-1",
                    "-png", str(output.with_suffix(".pdf")), str(output)], check=True)
    print(f"Generated {output.with_suffix('.pdf')} and {output.with_suffix('.png')}")


if __name__ == "__main__":
    generate()
