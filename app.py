#!/usr/bin/python
# -*- coding: utf-8 -*-

import os, glob, tarfile
from datetime import datetime
from flask import Flask, render_template, jsonify, redirect, url_for, request, send_from_directory, session

class MyServer(Flask):

    def __init__(self, *args, **kwargs):

        super(MyServer, self).__init__(*args, **kwargs)    
        self.fileList = []

app = MyServer(__name__)
app.config.from_object(__name__)
app.config['UPLOAD_FOLDER'] = 'MemoryGame/images'
app.config['DEL_UF_CONTENTS'] = 'MemoryGame/images/*'
app.config['XML_FILE'] = 'MemoryGame/memory.xml'
app.config['TAR_FILE'] = 'MemoryGame.tar.gz'

ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff']

app.secret_key = 'F12Zr47j\3yX R~X@H!jmM]Lwf/,?KT'

@app.route("/")
def index():
    app.fileList=[]

    filelist = glob.glob(app.config['DEL_UF_CONTENTS'])

    for f in filelist:
        os.remove(f)

    if(os.path.isfile(app.config['TAR_FILE'])):
        os.remove(app.config['TAR_FILE'])

    return render_template("index.html")

@app.route("/<path:filename>")
def getFile(filename):
    return send_from_directory(app.root_path + '/', filename)

@app.route('/MemoryGame/images/<path:filename>')
def images(filename):
    return send_from_directory(app.root_path + '/MemoryGame/images/', filename)


@app.route("/iPicker")
def iPicker():

    page='''<!DOCTYPE html><html>

            <style>
                .image_picker_image {
                    max-width: 200px;
                    max-height: 175px;
                    background-color: #FFFFFF;
                }
            </style>            

            
            <head><meta charset="utf-8"/>
            <title>Reveal and Card Front image selector</title>
            <link rel="stylesheet" href="static/css/image-picker.css" />
            <script type="text/javascript" src="static/js/jquery.min.js"></script> 
            <script type="text/javascript" src="static/js/image-picker.min.js"></script> 
            <script type="text/javascript" src="static/js/masonry.pkgd.min.js"></script></head>            

            <body>

            <div align="center"><h4>Select background reveal image</h4>
            <select id="bgImage" class="image-picker masonry">'''

    index=1

    for fPath in app.fileList:
        page+='<option data-img-src="%s" value="%s">Image %s</option>' % (fPath, index, index)
        index=index+1

    page+='''</select><br/><h4>Select image to be used on top of all the cards</h4><select id="cFImage" class="image-picker masonry">'''

    index=1

    for fPath in app.fileList:
        page+='<option data-img-src="%s" value="%s">Image %s</option>' % (fPath, index, index)
        index=index+1        


    page+='''</select>

            <input id="sData" type="submit" value="Submit"/>   

            <script>
                $(document).ready(function () {

                    $("#bgImage").imagepicker({
                        hide_select: false
                    });

                    $("#cFImage").imagepicker({
                        hide_select: false
                    });

                    $('#sData').click(function() {
                        
                        $.post('/uploadIInfo', {'bgIndex' : $("#bgImage option:selected").index(), 'cFIndex' : $("#cFImage option:selected").index() },
                            function(data){

                                window.location.replace("/MemoryGame.tar.gz");
                        });
                    }); 

                });
            </script>                                 

            </body></html>'''

    return page

@app.route('/uploadIInfo', methods=['POST'])
def uploadIInfo():

    if request.method == 'POST':  

        session['bgIndex']=request.form['bgIndex']
        session['cFIndex']=request.form['cFIndex']

        with open(app.config['XML_FILE'], "w") as xmlFile:
            xmlFile.write(getXML())        

        with tarfile.open(app.config['TAR_FILE'], "w:gz") as tar:        
            tar.add("MemoryGame/", arcname=None,  recursive=True)            

        return jsonify({"success":True})            

	return jsonify({"success":False})     

@app.route('/uploadDimensions', methods=['POST'])
def uploadDimensions():

    if request.method == 'POST':  

        session['nRows']=request.form['nRows']
        session['nCols']=request.form['nCols']

        return jsonify({"success":True})

	return jsonify({"success":False})             

@app.route('/upload', methods=['POST'])
def upload():

    if request.method == 'POST':      

        file = request.files['file']

        if file and allowed_file(file.filename):

            now = datetime.now()

            filename = os.path.join(app.config['UPLOAD_FOLDER'], "%s.%s" % (now.strftime("%Y-%m-%d-%H-%M-%S-%f"), file.filename.rsplit('.', 1)[1]))

            app.fileList.append(filename) 

            file.save(filename)

            return jsonify({"success":True})

	return jsonify({"success":False})                 

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def getCardTag(card):
    
    return '''<card cardA="%s" cardB="%s"/>\n''' % (card[11:], card[11:])    

def getCardTags():

    rString=""

    for index, card in enumerate(app.fileList):
        
        if (index==int(session['bgIndex']) or index==int(session['cFIndex'])):
            continue          

        rString+=getCardTag(card)

    return rString

def getXML():

    nCols=int(session['nCols'])
    nRows=int(session['nRows'])

    return '''<?xml version="1.0" encoding="utf-8"?>
    <memory>
        <customize>
            <columns>%d</columns>
            <totalpairs>%d</totalpairs>            
            <usebg>true</usebg>
            <bg>%s</bg>
            <front>%s</front>                   
            <revealspeed>300</revealspeed>
            <hidespeed>200</hidespeed>
            <fadespeed>200</fadespeed>
            <incorrecthold>2000</incorrecthold>
            <correcthold>1000</correcthold>        
            <endscreendelay>1500</endscreendelay>
            <endscreenfade>500</endscreenfade>        
            <showtitle>true</showtitle>
            <gametitle>Classic Memory game</gametitle>
            <usetimer>true</usetimer>
            <showtimer>true</showtimer>        
            <showpeek>true</showpeek>
            <peekspeed>1000</peekspeed>
            <scoresystem>flip</scoresystem>
            <displayscore>both</displayscore>
            <attemptscolor>#ff0000</attemptscolor>
        </customize>
        <cards> 
%s
        </cards>
        <endscreen>
            <skills>Perfection!!,Awesome!,Good Job!,Try Harder.,No Comment...</skills>
            <skillInc>4</skillInc>
            
            <lineTwo>score</lineTwo> <!-- Can be "score" or "solo" -->
            <lineTwoPre>You did it in </lineTwoPre>
            <lineTwoPost> tries.</lineTwoPost>
            <lineTwoSolo>Check out my other files.</lineTwoSolo>
            
            <lineThree>replay</lineThree> <!-- Can be "link" or "replay" -->
            <lineThreeReplay>Click here to play again.</lineThreeReplay>
            <lineThreeLink><![CDATA[<a href="http://www.google.com" target="blank">Google</a>]]></lineThreeLink>
        </endscreen>
    </memory>''' % (nCols, nCols*nRows/2, app.fileList[int(session['bgIndex'])][11:], app.fileList[int(session['cFIndex'])][11:], getCardTags())

if __name__ == "__main__":
    app.run(debug=True)
