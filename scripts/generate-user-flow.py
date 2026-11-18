#!/usr/bin/env python3
"""Build a phone-readable PNG and a matching three-page A4 player guide."""

from pathlib import Path
from tempfile import TemporaryDirectory
import shutil
import subprocess

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "docs" / "user-guide"
WIDTH, HEIGHT = 400, 880
REVIEWED = "18 November 2026"
GAME = "https://samobrienolinger.github.io/stopped-both-sides/"
REPOSITORY = "https://github.com/SamOBrienOlinger/stopped-both-sides"
BACKGROUND, WHITE = "#f6f3ec", "#ffffff"
INK, MUTED = "#17383d", "#466269"
TEAL, BLUE = "#126b63", "#355c85"
MINT, ICE = "#deeee6", "#e4ecf6"
BORDER, ACCENT = "#b7cbc5", "#a44e45"


def draw_page(pdf, page):
    """One column, the same text and layout in the PNG and print pages."""
    def rect(x, top, width, height, fill, radius=0, stroke=None):
        pdf.setFillColor(HexColor(fill))
        pdf.setStrokeColor(HexColor(stroke or fill))
        pdf.setLineWidth(0.85)
        pdf.roundRect(x, HEIGHT-top-height, width, height, radius,
                      fill=1, stroke=int(bool(stroke)))

    def text(x, top, value, size=17, bold=False, color=MUTED,
             leading=None, width=None, center=False):
        font = "OpenSansBold" if bold else "OpenSans"
        width = width if width is not None else WIDTH-x-30
        leading = leading or size*1.4
        lines = []
        for paragraph in value.split("\n"):
            lines.extend(simpleSplit(paragraph, font, size, width) or [""])
        pdf.setFillColor(HexColor(color))
        pdf.setFont(font, size)
        for i, line in enumerate(lines):
            if pdfmetrics.stringWidth(line, font, size)>width:
                raise ValueError(f"Text exceeds its box: {line}")
            draw=pdf.drawCentredString if center else pdf.drawString
            draw(x, HEIGHT-top-size-i*leading, line)
        return top+size+(len(lines)-1)*leading

    def line(x1, top1, x2, top2, color=TEAL, width=1.7):
        pdf.setStrokeColor(HexColor(color))
        pdf.setLineWidth(width)
        pdf.setLineCap(1)
        pdf.line(x1, HEIGHT-top1, x2, HEIGHT-top2)

    def polygon(points, fill, stroke=None, width=1.5):
        p=pdf.beginPath()
        p.moveTo(points[0][0], HEIGHT-points[0][1])
        for x, top in points[1:]:
            p.lineTo(x, HEIGHT-top)
        p.close()
        pdf.setFillColor(HexColor(fill))
        pdf.setStrokeColor(HexColor(stroke or fill))
        pdf.setLineWidth(width)
        pdf.drawPath(p, fill=1, stroke=int(bool(stroke)))

    def arrow(x, start, end):
        line(x, start, x, end-5)
        polygon([(x-3.5,end-5),(x+3.5,end-5),(x,end)],TEAL)

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

    def card(number, title, top, height):
        rect(16, top, 368, height, WHITE, 15, BORDER)
        pdf.setFillColor(HexColor(TEAL))
        pdf.circle(36, HEIGHT-top-26, 13, fill=1, stroke=0)
        text(36, top+13, str(number), 18, True, WHITE, center=True, width=24)
        text(58, top+11, title, 21, True, INK, width=310)

    def button(top, label, fill=TEAL, color=WHITE, size=17, height=38, symbol=None):
        rect(32, top, 336, height, fill, 8)
        if symbol:
            icon(symbol, 43, top+(height-20)/2, 20, color)
        text(200+(10 if symbol else 0), top+(height-size)/2-1,
             label, size, True, color, width=284 if symbol else 312, center=True)

    def perspective_button(top, role, label, fill, color):
        rect(32, top, 336, 58, fill, 9)
        bx, bt = 38, top+5
        rect(bx, bt, 48, 48, WHITE, 8)
        # Place the original JPEG unchanged, clipping its white side margins.
        pdf.saveState()
        clip=pdf.beginPath()
        clip.roundRect(bx,HEIGHT-bt-48,48,48,8)
        pdf.clipPath(clip,stroke=0,fill=0)
        pdf.drawImage(str(GUIDE/f"{role}-perspective-logo.jpeg"),bx-9,
                      HEIGHT-bt-46,width=66,height=44)
        pdf.restoreState()
        text(99, top+(5 if "\n" in label else 17), label, 16, True, color,
             leading=21, width=257)
        pdf.linkURL(GAME+f"#encounters/{role}",
                    (32,HEIGHT-top-58,368,HEIGHT-top),relative=1)

    rect(0,0,WIDTH,HEIGHT,BACKGROUND)
    if page==0:
        text(24,18,"STOPPED: BOTH SIDES",15,True,TEAL)
        text(22,45,"How to play",32,True,INK)
        text(24,99,"For Explore both perspectives",14.5,True)
        text(24,121,"Use these controls in the game.",13.5)

        card(1,"Choose your side",142,348)
        text(32,189,"Choose who you want to play.",17)
        perspective_button(222,"public","Play as a member\nof the public",MINT,TEAL)
        perspective_button(292,"garda","Play as a Garda",ICE,BLUE)
        text(32,364,"Trying both roles is optional.",16)
        text(32,391,"A character is ready. To change them:",15.5)
        button(420,"Choose a different character",MINT,TEAL,15,height=30)
        text(32,459,"Choose one, then select Done.",16.5)
        arrow(200,490,507)

        card(2,"Start a situation",510,294)
        text(32,558,"For the suggested story, select:",16.5)
        button(590,"Start this situation",symbol="next")
        text(32,645,"To pick another story, open:",16.5)
        button(677,"Browse all situations",MINT,TEAL)
        text(32,733,"Choose from 24 situations by topic.\nThen select Play this situation.",16,leading=23)
        text(32,823,"Next: read, choose and learn.",16,True,TEAL)
    elif page==1:
        text(24,24,"Read, choose and learn",26,True,INK)
        text(24,66,"There is no time limit.",17)

        card(3,"Read, then choose",105,170)
        icon("book",32,157,29)
        text(76,156,"Read the fictional scene.",17,width=292)
        text(32,199,"Choose what you would say or do.",17)
        rect(32,237,336,22,MINT,6)
        pdf.setStrokeColor(HexColor(TEAL))
        pdf.circle(46,HEIGHT-248,4,fill=0,stroke=1)
        line(61,248,330,248,BORDER,2)
        polygon([(337,242),(337,258),(342,253),(346,261),(350,259),(346,251),(354,251)],WHITE,TEAL,1)
        arrow(200,275,292)

        card(4,"Read the explanation",295,253)
        rect(32,347,336,61,MINT,9)
        icon("bulb",43,362,27)
        text(84,354,"You see an explanation\nafter every answer.",16.5,leading=22,width=272)
        text(32,424,"For more detail, open:",16.5)
        button(455,"Why this matters",BACKGROUND,MUTED,16,height=33)
        button(499,"Read the sources for this decision",BACKGROUND,MUTED,13.5,height=33)

        rect(16,568,368,280,ICE,15)
        text(32,580,"OPTIONAL: BEFORE YOU MOVE ON",13,True,BLUE)
        button(605,"Try another answer",WHITE,TEAL,16,height=34,symbol="retry")
        text(32,648,"Choose a new answer for this role.",16)
        button(686,"Compare the other side",WHITE,BLUE,16,height=34,symbol="switch")
        text(32,733,"Play the other person at this point\nin the story. Your first answer is kept.",16,leading=22)
        text(32,788,"Choose a response if you have not\nanswered in this role yet.",16,leading=22)
    else:
        text(24,24,"Continue, then review",26,True,INK)
        text(24,66,"Follow the button after your answer.",16.5)

        card(5,"Continue or finish",105,333)
        text(32,159,"The main button changes as you play.",16.5)
        rect(32,199,336,95,MINT,9)
        text(45,207,"WHEN THERE IS ANOTHER DECISION",12.5,True,TEAL,width=310)
        rect(45,230,310,33,TEAL,7)
        text(200,235,"Next decision",17,True,WHITE,center=True,width=286)
        text(45,269,"Return to step 3 for the new scene.",16,width=310)

        rect(32,311,336,109,ICE,9)
        text(45,319,"AFTER YOUR FINAL ANSWER",12.5,True,BLUE,width=310)
        rect(45,342,310,33,BLUE,7)
        text(200,347,"View recap",17,True,WHITE,center=True,width=286)
        text(45,386,"The situation is finished. Go to step 6.",15,width=310)
        arrow(200,438,455)

        card(6,"Review what you learned",458,217)
        text(32,510,"Read your choices and the explanations\nin the recap.",16.5,leading=23)
        text(32,570,"You can replay a decision or try\nthe other role.",16.5,leading=23)
        button(626,"Choose another situation",symbol="grid",size=15.5,height=34)

        rect(16,695,368,144,MINT,15)
        text(32,709,"No sign-up. No timer.",18,True,TEAL)
        text(32,741,"Your progress is saved in this browser\nif your browser allows saving.",16,leading=21)
        text(32,790,"It does not automatically appear\non another device.",16,leading=21)

    line(24,852,376,852,BORDER,0.7)
    text(24,860,f"English guide - {REVIEWED}",9.5)
    text(376,860,f"{page+1} / 3",9.5,True,TEAL,center=True,width=35)


def configure(pdf):
    pdf.setTitle("Stopped: Both Sides - Your first game")
    pdf.setAuthor("Sam Tim Solutions")
    pdf.setSubject(f"First-time player guide to shared play; checked {REVIEWED}.")


def generate():
    if shutil.which("pdftoppm") is None:
        raise SystemExit("Install Poppler (pdftoppm) before generating the guide.")
    for name,weight in [("OpenSans",400),("OpenSansBold",700)]:
        pdfmetrics.registerFont(TTFont(name,str(ROOT/"assets/fonts"/f"open-sans-{weight}.ttf")))
    output=GUIDE/"stopped-both-sides-user-flow"
    # Three A4 pages keep the print version readable. The same pages form a
    # narrow scrolling PNG, with text that remains legible at phone width.
    pdf=canvas.Canvas(str(output.with_suffix(".pdf")),pagesize=A4,invariant=1)
    configure(pdf)
    scale=min((A4[0]-36)/WIDTH,(A4[1]-36)/HEIGHT)
    for page in range(3):
        pdf.saveState()
        pdf.translate((A4[0]-WIDTH*scale)/2,(A4[1]-HEIGHT*scale)/2)
        pdf.scale(scale,scale)
        draw_page(pdf,page)
        pdf.restoreState()
        pdf.showPage()
    pdf.save()
    with TemporaryDirectory(prefix="stopped-player-guide-") as temporary:
        poster=Path(temporary)/"poster.pdf"
        pdf=canvas.Canvas(str(poster),pagesize=(WIDTH,HEIGHT*3),invariant=1)
        configure(pdf)
        for page in range(3):
            pdf.saveState()
            pdf.translate(0,HEIGHT*(2-page))
            draw_page(pdf,page)
            pdf.restoreState()
        pdf.showPage()
        pdf.save()
        subprocess.run(["pdftoppm","-singlefile","-scale-to-x","1400","-scale-to-y","-1",
                        "-png",str(poster),str(output)],check=True)
    print(f"Generated {output.with_suffix('.pdf')} and {output.with_suffix('.png')}")


if __name__=="__main__":
    generate()
