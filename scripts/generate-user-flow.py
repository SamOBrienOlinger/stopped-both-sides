#!/usr/bin/env python3
"""Create a concise, phone-readable learning guide from the current production assets."""
from pathlib import Path
import json
import subprocess

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader, simpleSplit
from PIL import Image
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/user-guide'
GAME = 'https://samobrienolinger.github.io/stopped-both-sides/'
W, H = 400, 566
BG, PAPER = '#f6f3ec', '#ffffff'
INK, MUTED = '#17383d', '#466269'
TEAL, BLUE = '#126b63', '#355c85'
MINT, ICE = '#deeee6', '#e4ecf6'
BORDER = '#b7cbc5'
BOXES = []

for name, weight in [('OpenSans', 400), ('OpenSansBold', 700)]:
    pdfmetrics.registerFont(TTFont(name, str(ROOT / f'assets/fonts/open-sans-{weight}.ttf')))

result = subprocess.run(['node', '--input-type=module', '-e', r'''
import {fileURLToPath} from 'node:url';
import {characterFor, characterArtwork} from './encounters/characters.mjs';
import {gardaAtlas} from './encounters/garda-atlas.mjs';
import {encounters} from './encounters/catalog.mjs';
console.log(JSON.stringify({count:Object.keys(encounters).length, portraits:
 [['garda','garda-5'],['public','public-5']].map(([role,id])=>{
 const c=characterFor(role,id), art=characterArtwork(c);
 const box=role==='garda'?gardaAtlas.cells[4].slice(0,4):
 [c.column*art.width/6,c.row*art.height/3,(c.column+1)*art.width/6,(c.row+1)*art.height/3];
 return {name:c.name,role,src:fileURLToPath(art.src),width:art.width,height:art.height,box};
})}));
'''], cwd=ROOT, check=True, text=True, capture_output=True)
production = json.loads(result.stdout)
assert production['count'] == 24
assert [p['name'] for p in production['portraits']] == ['Garda Aisling', 'Daniel']


def draw(c, page):
    def rect(x, top, w, h, fill, r=8, border=None):
        c.setFillColor(HexColor(fill))
        c.setStrokeColor(HexColor(border or fill))
        c.setLineWidth(.7)
        c.roundRect(x, H-top-h, w, h, r, fill=1, stroke=bool(border))

    def text(x, top, value, size=13, bold=False, color=MUTED,
             width=None, leading=None, centered=False):
        width = width or W-x-28
        font = 'OpenSansBold' if bold else 'OpenSans'
        leading = leading or size*1.38
        lines = []
        for paragraph in value.split('\n'):
            lines.extend(simpleSplit(paragraph, font, size, width) or [''])
        c.setFillColor(HexColor(color))
        c.setFont(font, size)
        for n, value in enumerate(lines):
            measured = pdfmetrics.stringWidth(value, font, size)
            if measured > width+.1:
                raise ValueError(f'Too wide: {value}')
            baseline = H-top-size-n*leading
            if baseline < 0:
                raise ValueError(f'Too low: {value}')
            if centered:
                c.drawCentredString(x, baseline, value)
                left = x-measured/2
            else:
                c.drawString(x, baseline, value)
                left = x
            BOXES.append(dict(page=page, value=value, x=left, top=top+n*leading,
                              right=left+measured, bottom=top+n*leading+size))
        return top+size+(len(lines)-1)*leading

    def line(x1, top1, x2, top2, color=TEAL, width=1.5):
        c.setStrokeColor(HexColor(color))
        c.setLineWidth(width)
        c.setLineCap(1)
        c.line(x1,H-top1,x2,H-top2)

    def arrow(top1, top2):
        line(200,top1,200,top2-3)
        line(197,top2-5,200,top2)
        line(203,top2-5,200,top2)

    def card(number, title, top, height):
        rect(16,top,368,height,PAPER,12,BORDER)
        c.setFillColor(HexColor(TEAL))
        c.circle(34,H-top-23,11,fill=1,stroke=0)
        text(34,top+12,str(number),15,True,PAPER,width=22,centered=True)
        text(52,top+10,title,17,True,INK,width=314)

    def button(top, label, x=30, width=340, height=28, size=13,
               fill=TEAL, color=PAPER, url=None):
        rect(x,top,width,height,fill,6)
        text(x+width/2,top+(height-size)/2-1,label,size,True,color,
             width=width-14,centered=True)
        if url:
            c.linkURL(url,(x,H-top-height,x+width,H-top),relative=1)

    def role_button(top, role, label, fill, color):
        x, width, height = 30, 340, 40
        rect(x,top,width,height,fill,7)
        rect(34,top+3,34,34,PAPER,5)
        c.saveState()
        clip=c.beginPath()
        clip.roundRect(34,H-top-37,34,34,5)
        c.clipPath(clip,fill=0,stroke=0)
        c.drawImage(str(ROOT/f'docs/user-guide/{role}-perspective-logo.jpeg'),
                    28,H-top-36,width=47,height=31.3333)
        c.restoreState()
        text(80,top+(3 if '\n' in label else 11),label,13.5,True,color,
             width=278,leading=17)
        c.linkURL(GAME+f'#encounters/{role}',(x,H-top-height,x+width,H-top),relative=1)

    def portrait(item, center, top, size=45):
        left, source_top, right, bottom = item['box']
        scale=size/(right-left)
        height=(bottom-source_top)*scale
        x=center-size/2
        # Embed the selected production sprite cell, rather than the full atlas.
        # This keeps the downloadable document small without altering site art.
        cell=Image.open(item['src']).crop((left,source_top,right,bottom))
        c.drawImage(ImageReader(cell),x,H-top-height,width=size,height=height,mask='auto')
        text(center,top+height+3,item['name'],9.4,True,TEAL,width=71,centered=True)

    rect(0,0,W,H,BG,0)
    if page==0:
        text(22,14,'STOPPED: BOTH SIDES',10.5,True,TEAL,width=220)
        text(22,36,'How it works',27,True,INK)
        text(22,76,'Explore fictional encounters. Choose a response.\nReflect on rights, powers and responsibilities.',13,leading=18)
        text(22,119,'Mode: Explore both perspectives',11.5,True,TEAL)
        text(22,137,'Button names below match the resource.',10.5)

        card(1,'Choose a perspective',160,153)
        text(30,198,'Choose which perspective to explore first.',13)
        role_button(223,'public','Explore the public perspective',MINT,TEAL)
        role_button(270,'garda','Explore the Garda perspective',ICE,BLUE)
        arrow(315,325)

        card(2,'Start the situation',328,91)
        text(30,365,'For your first try, use the suggested story.',12.4)
        button(389,'Start this situation',height=26,size=13)

        rect(16,431,368,112,ICE,12)
        text(30,440,'OPTIONAL: BEFORE YOU START',10.2,True,BLUE)
        text(30,459,'A character is already selected.',11.3,width=203)
        button(482,'Choose a different character',x=30,width=197,
               height=23,size=10.2,fill=PAPER,color=TEAL)
        text(30,513,'Choose a portrait for your role,\nthen select Done.',11,width=200,leading=15)
        text(301,460,'Examples from each role',8.4,False,BLUE,width=139,centered=True)
        portrait(production['portraits'][0],265,477,45)
        portrait(production['portraits'][1],342,477,45)
    elif page==1:
        text(22,20,'Read. Choose. Learn.',26,True,INK)
        text(22,60,'Take your time. There is no timer.',13)

        card(3,'Choose one response',96,107)
        text(30,135,'Read the scene and the question, then\nselect one of the answer buttons.',13,leading=18)
        rect(30,179,340,17,MINT,4)
        text(39,180,'A',10,True,TEAL,width=15)
        line(58,187,329,187,BORDER,1.4)
        c.setFillColor(HexColor(PAPER))
        c.setStrokeColor(HexColor(TEAL))
        p=c.beginPath()
        p.moveTo(342,H-181);p.lineTo(342,H-195);p.lineTo(346,H-191)
        p.lineTo(350,H-199);p.lineTo(353,H-197);p.lineTo(349,H-189)
        p.lineTo(356,H-189);p.close()
        c.drawPath(p,stroke=1,fill=1)
        arrow(206,217)

        card(4,'Read the explanation',220,151)
        text(30,259,'Your learning point appears as soon\nas you answer.',13,leading=18)
        text(30,301,'OPTIONAL: MORE DETAIL',9.5,True,TEAL)
        button(316,'Why this matters',height=22,size=11.5,fill=MINT,color=TEAL)
        button(343,'Read the sources for this decision',height=22,size=11.3,
               fill=MINT,color=TEAL)

        rect(16,381,368,165,ICE,12)
        text(30,391,'OPTIONAL: BEFORE YOU MOVE ON',10.2,True,BLUE)
        button(411,'Try another answer',height=24,size=12.5,fill=PAPER,color=TEAL)
        text(30,442,'Replace your answer for the current role.',12.1)
        button(469,'Compare the other side',height=24,size=12.5,fill=PAPER,color=BLUE)
        text(30,500,'Switch roles at this moment. Your first answer\nis kept. If this role has no answer yet, choose\none before you continue.',11.5,leading=15)
    else:
        text(22,20,'Continue, then review',25,True,INK)
        text(22,60,'After the explanation, use the main button.',12.6)

        card(5,'Continue or finish',96,207)
        rect(30,137,340,70,MINT,7)
        text(41,143,'WHEN THERE IS MORE OF THE STORY',9.5,True,TEAL,width=317)
        button(161,'Next decision',x=41,width=318,height=23,size=12.5)
        text(41,190,'Read the next scene and choose again.',11.7,width=318)

        rect(30,220,340,70,ICE,7)
        text(41,226,'AFTER YOUR FINAL ANSWER',9.5,True,BLUE,width=317)
        button(244,'View recap',x=41,width=318,height=23,size=12.5,fill=BLUE)
        text(41,273,'Open a summary of your choices.',11.7,width=318)
        arrow(306,317)

        card(6,'Review what you learned',320,105)
        text(30,357,'Review your answers and the explanations.\nYou can revisit a decision or try the other role.',12.3,leading=17.5)
        button(398,'Choose another situation',height=23,size=12.2)

        rect(16,439,368,82,ICE,12)
        text(30,448,'OPTIONAL: CHOOSE YOUR OWN STORY',10.1,True,BLUE)
        text(30,470,'At the start, open Browse all situations.\nChoose from 24 situations by topic, then\nselect Explore this situation.',12.2,leading=16.5)
        text(22,532,'Your progress is saved in this browser.',11.6,False,TEAL)

    line(22,551,378,551,BORDER,.6)
    text(378,555,f'{page+1} / 3',8.8,True,TEAL,width=30,centered=True)


output=OUT/'stopped-both-sides-user-flow.pdf'
c=canvas.Canvas(str(output),pagesize=A4,invariant=1,pageCompression=1)
c.setTitle('Stopped: Both Sides - How it works')
c.setAuthor('Sam Tim Solutions')
c.setSubject('A first-time player guide to Explore both perspectives.')
scale=min((A4[0]-36)/W,(A4[1]-36)/H)
for page,title in enumerate(['Get started','Choose a response','Continue and review']):
    c.bookmarkPage(f'page-{page}')
    c.addOutlineEntry(title,f'page-{page}')
    c.saveState()
    c.translate((A4[0]-W*scale)/2,(A4[1]-H*scale)/2)
    c.scale(scale,scale)
    draw(c,page)
    c.restoreState()
    c.showPage()
c.save()

from tempfile import TemporaryDirectory
with TemporaryDirectory(prefix='stopped-learning-guide-') as temporary:
    poster=Path(temporary)/'poster.pdf'
    c=canvas.Canvas(str(poster),pagesize=(W,H*3),invariant=1,pageCompression=1)
    c.setTitle('Stopped: Both Sides - How it works')
    c.setAuthor('Sam Tim Solutions')
    for page in range(3):
        c.saveState()
        c.translate(0,H*(2-page))
        draw(c,page)
        c.restoreState()
    c.showPage()
    c.save()
    subprocess.run(['pdftoppm','-singlefile','-png','-scale-to-x','1400','-scale-to-y','-1',
                    str(poster),str(output.with_suffix(''))],check=True)
print(f'Generated {output.name} and {output.with_suffix(".png").name}')
