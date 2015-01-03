(function($){
	// Variables set from the XML
	var front;								// the front graphic
	var usebg;								//(true/false) whether or not you want a bg img.
	var bg;										// the background image
	var cardW;								// the width of one card
	var cardH;								// the height of one card
	var columns;									// how many columns
	var totalpairs;						// how many pairs of cards
	                    
	var revealspeed;					// the speed of the reveal flip
	var hidespeed;						// the speed of the flip back
	var fadespeed;						// the speed a match fades away
	var incorrecthold;				// the speed a wrong match is held before it flips back
	var correcthold;					// the speed a correct match is held before it fades
	var endscreendelay;				// the delay after the last match before revealing your score
	var endscreenfade;				// the speed at which the score fades in
	var showpeek;							// give a peak of all the cards at the start of the game
	var peekspeed; 						// speed of initial peek
	var usetimer; 						// boolean that determines if the timer is initiated at all
	var showtimer; 						// show or hide the timer clock
	var scoresystem;					// (time/flip) how do you want to judge the score 
	var displayscore; 				// (time/flip/both) what do you want to show at the end of the game
	var attemptscolor;  			//color of attempts/timer in end screen
	
	// Variables used by the application == DON"T TOUCH
	var $xml;
	var totalCards;
	var cardsets;
	var cardids = [];
	var currClickID;
	var cardOne;
	var cardTwo;
	var num_correct = 0;
	var attempts = 0;
	var clickready = false;
	var dataArray = [];
	var randomizer = [];
	var allCards = [];
	var setCards = [];
	var boardHeight;
	var boardWidth;
	var totalImages = 0;
	var loadedImages = 0;
	var timer;
	var elapsed = '0.0';
	var showtitle;
	var gametitle;
	var imgDimensions = {};
	var frontImgDimensions=[]
	var backImgDimensions=[]
	
	// End Screen Variables
	var skillArray = [];
	var skillInc;
	var linetwo;
	var linetwopre;
	var linetwopost;
	var linetwosolo;
	var linethree;
	var linethreereplay;
	var linethreelink;
	var zinc = 1;
	
	var ie=function(){var e,t=-1;if(navigator.appName=="Microsoft Internet Explorer"){var n=navigator.userAgent;var r=new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");if(r.exec(n)!=null)t=parseFloat(RegExp.$1)}return t>-1?t:e}();
	var use3D = (ie==undefined);
	
	//fix windows issues
	var platform = navigator.platform;
	if (platform.indexOf('Win') != -1){
		use3D = false;
		//if ((!!navigator.userAgent.match(/firefox/i)) || (/opr/.test(navigator.userAgent.toLowerCase())) || (/opera/.test(navigator.userAgent.toLowerCase()))) use3D = false;
	}
	
	getXML();

	function getXML()
	{
		$.ajax({
			type: "GET",
			url: "memory.xml",
			dataType: "xml",
			success: xmlParser
			
		});
	}	

	var rtime = new Date(1, 1, 2000, 12,00,00);
	var timeout = false;
	var delta = 200;

	$(window).resize(function() 
	{
	    rtime = new Date();
	    if (timeout === false) 
	    {
	        timeout = true;
	        setTimeout(resizeEnd, delta);
	    }

	});

	function resizeEnd() 
	{
	    if (new Date() - rtime < delta)
	        setTimeout(resizeEnd, delta);
	    else 
	    {
	        timeout = false;
	        initCardWAndH(false);
	    }

	}	

	function handleResize()
	{
		$(".memory").css({'width' : (cardW * columns) +'px','overflow':'auto', 'visibility':'hidden'});
		var rows = Math.ceil(totalCards/columns);
		
		$(".cards").css({'width' : cardW * columns,'height':(cardH * rows + 5) +'px'});
		$(".gameover").css({'width' : cardW * columns});

		var reveal = revealspeed/1000+'s';		

		$(".card_holder").css({'width' : cardW +'px', 'height':cardH+'px'});
		$(".card").css({'float':'left', 'width' : cardW +'px', 'height':cardH+'px','position':'relative','transition':reveal});		

		boardHeight = $(".cards").height();
		boardWidth = $(".cards").width();		

		$(".gameover").css({'height':boardHeight+'px'});		
		if (showtitle) 
			$('.gametitle').css('width',boardWidth+'px');

		$('.gametitle').css('font-size', Math.ceil(35*$(".cards").width()/1024) + 'px');
		$('.timer').css('font-size', Math.ceil(25*$(".cards").width()/1024) + 'px');												

		adjustDimensions(false);

		$('.memory').css({'visibility':'visible'});
	}

	function adjustDimensions(onLoad)
	{

		if (usebg)
		{
			$('#bg').each(function(){

				var iWidth=backImgDimensions[0];	
				var iHeight=backImgDimensions[1];

				$(this).css('width', iWidth+'px');
				$(this).css('height', iHeight+'px');						

		  		if ( iHeight >= boardHeight)
		  		{
		   			$(this).css('height',boardHeight+'px');
		   			$(this).css('width','auto');
		  		}

			  	if ( $(this).width() > boardWidth)
				{
				   $(this).css('height','auto');
				   $(this).css('width',boardWidth+'px');
				}	

				$(this).css('margin-left',( ( boardWidth-$(this).width() )/2)+'px');
				$(this).css('margin-top',( ( boardHeight-$(this).height() )/2)+'px');					

			});
		}					
	
		$('img.cardBack').each(function()
		{

	 		if(onLoad)
				imgDimensions[$(this).attr('src')]=[$(this).width(), $(this).height()];

			var iWidth=imgDimensions[$(this).attr('src')][0];
			var iHeight=imgDimensions[$(this).attr('src')][1];			

			$(this).css('width', iWidth+'px');
			$(this).css('height', iHeight+'px');			

			if ( iHeight >= cardH)
			{
	   			$(this).css('height',cardH+'px');
				$(this).css('width','auto');	   			
			}

	  		if ( $(this).width() > cardW)
	  		{
	   			$(this).css('height','auto');
	   			$(this).css('width',cardW+'px');
			}			

	  		$(this).css('margin-left',( ( cardW-$(this).width() )/2)+'px');
	  		$(this).css('margin-top',( ( cardH-$(this).height() )/2)+'px');	

		});

	 	$('img.cardFront').each(function()
	 	{

			var iWidth=frontImgDimensions[0];	
			var iHeight=frontImgDimensions[1];

			$(this).css('width', iWidth+'px');
			$(this).css('height', iHeight+'px');						

	  		if ( iHeight >= cardH)
	  		{
	   			$(this).css('height',cardH+'px');
	   			$(this).css('width','auto');
	  		}

		  	if ( $(this).width() > cardW)
			{
			   $(this).css('height','auto');
			   $(this).css('width',cardW+'px');
			}	

			$(this).css('margin-left',( ( cardW-$(this).width() )/2)+'px');
			$(this).css('margin-top',( ( cardH-$(this).height() )/2)+'px');	

		});	

	}

	function buildgame()
	{
		var c_id;
		var set;
		var cImg;
		
		totalImages += totalCards;
		
		for (i=0;i<totalCards;i++)
		{
			if (randomizer[i]<cardsets)
			{
				c_id = allCards[randomizer[i]].id;
				set = 'a';
				id_set = c_id+set;

				cardids.push(set+c_id);

				$(".cards").append('<div class="card_holder"><div class="card" id="a'+c_id+'"><span class="'+id_set+'"><img class="cardFront" src="' + front + '"/></span><img class="cardBack" src=""/></div></div>');

				setClick(id_set,c_id,set);
				cImg = allCards[randomizer[i]].cardA;

				$('#'+set+c_id +' .cardBack').load({img:cImg},function(e) { checkLoad(e.data.img);}).attr('src', cImg);				
			} 
			else
			{
				c_id = allCards[randomizer[i]].id;
				set = 'b';
				id_set = c_id+set;

				cardids.push(set+c_id);

				$(".cards").append('<div class="card_holder"><div class="card" id="b'+c_id+'"><span class="'+id_set+'"><img class="cardFront" src="' + front + '"/></span><img class="cardBack" src=""/></div></div>');

				setClick(id_set,c_id,set);
				cImg = allCards[randomizer[i]].cardB;

				$('#'+set+c_id +' .cardBack').load({img:cImg},function(e) { checkLoad(e.data.img);}).attr('src', cImg);
				
			}
			
		}
		
		if (usebg)
		{
			if ($(".bg").children().length > 0) $(".bg_img").children().remove();
			$(".bg").append('<div class="bg_img"><img id="bg" src=""/></div>');
			$('#bg').load(function() { checkLoad(bg); }).attr('src', bg); 
		}
		
		var reveal = revealspeed/1000+'s';

		$(".card_holder").css({'width' : cardW +'px', 'height':cardH+'px'});
		$(".card").css({'float':'left', 'width' : cardW +'px', 'height':cardH+'px','position':'relative','transition':reveal});		
		
		if (usebg)
			$(".bg_img").css({'position':'abolute'});
		
		boardHeight = $(".cards").height();
		boardWidth = $(".cards").width();

		$(".gameover").css({'height':boardHeight+'px'});		
		if (showtitle)
			$('.gametitle').css('width',boardWidth+'px');					
		
		if (use3D)
		{
			$('.cardFront').addClass('backVis');
			$('.cardBack').addClass('backVis');
		}
		else
			$('.cardBack').addClass('notransform');
	}	

	function xmlParser(xml) 
	{
		
		$xml = $(xml);
	
		front = $xml.find("front").text()+ "?" + Math.random()*999999999;
		usebg = $xml.find("usebg").text() == "true" ? true : false;
		bg = $xml.find("bg").text() + "?" + Math.random()*999999999;	
		columns = Number($xml.find("columns").text());
		totalpairs =  Number($xml.find("totalpairs").text());		

		usetimer = $xml.find("usetimer").text() == "true" ? true : false;
		showtitle = $xml.find("showtitle").text() == "true" ? true : false;
		gametitle = $xml.find("gametitle").text();
		showtimer = $xml.find("showtimer").text() == "true" ? true : false;	

		revealspeed = Number($xml.find("revealspeed").text());
		hidespeed = Number($xml.find("hidespeed").text());
		fadespeed = Number($xml.find("fadespeed").text());

		incorrecthold = Number($xml.find("incorrecthold").text());
		correcthold = Number($xml.find("correcthold").text());

		endscreendelay = Number($xml.find("endscreendelay").text());
		endscreenfade = Number($xml.find("endscreenfade").text());

		showpeek = $xml.find("showpeek").text() == "true" ? true : false;
		peekspeed = Number($xml.find("peekspeed").text());

		scoresystem = $xml.find("scoresystem").text();
		displayscore = $xml.find("displayscore").text();
		attemptscolor =  $xml.find("attemptscolor").text();
		
		skillArray = $xml.find("skills").text().split(',');
		skillInc = Number($xml.find("skillInc").text());
		
		linetwo = $xml.find("lineTwo").text();
		linetwopre = $xml.find("lineTwoPre").text();
		linetwopost = $xml.find("lineTwoPost").text();
		linetwosolo = $xml.find("lineTwoSolo").text();
		
		linethree = $xml.find("lineThree").text();
		linethreereplay = $xml.find("lineThreeReplay").text();
		linethreelink = $xml.find("lineThreeLink").text();
				
		if (displayscore == "time" || displayscore == "both" || scoresystem == "time")
			if (!usetimer) alert("Set the 'usetimer' value in the XML to 'true'");
		
		var n = 0;

		$xml.find("card").each(function () 
		{
			dataArray.push({'cardA':$(this).attr("cardA")+ "?" + Math.random()*999999999,'cardB':$(this).attr("cardB")+ "?" + Math.random()*999999999,'id':n});
			n++;			
		});
		
		if (totalpairs == -1)
			cardsets = dataArray.length;
		else
			cardsets = totalpairs;
			
		totalCards = cardsets * 2;
		
		for (var i=0;i<cardsets;i++)
		{
			randomizer.push(i);
			randomizer.push(i+cardsets);
		}

		if (showtimer)
			showtitle = true;		

		if (showtitle) 
		{
			$('.memory').append('<div class="gametitle">' + gametitle + '</div>');			

			if (usetimer) 
				$('.gametitle').append('<div class="timer">Time Elapsed: <span id="clock"></span></div>');

			if (showtimer)
				$('#clock').html("00:00");
		} 		

		if (usebg)
		{
			totalImages++;
			$('.memory').append('<div class="bg"></div>');
		}

		$('.memory').append('<div class="cards"></div>');
		$('.memory').append('<div class="gameover"></div>');
		$('.gameover').append('<div class="gameover_bg"></div>');	
		

		if(usebg)
		{
			$("<img/>").attr("src", bg).load(function() 
			{
				backImgDimensions=[this.width, this.height];

				initCardWAndH(true);
		 	});	
		}
		else
			initCardWAndH(true);		
			
	}	

	function initCardWAndH(onLoad)
	{

		var numRows=totalpairs*2/columns;
		var wWidth=$(window).width()-14 /*Margin*/;
		var wHeight=$(window).height()-$('.gametitle').height()-34 /*Margins*/;

		if(onLoad)
		{
			$("<img/>").attr("src", front).load(function() 
			{
				frontImgDimensions=[this.width, this.height];

				cardH=Math.floor(wHeight/numRows);	
				cardW=Math.floor(wHeight*this.width/(this.height*columns));

				if(cardW*columns > wWidth)
				{
					cardW=Math.floor(wWidth/columns);
					cardH=Math.floor(wWidth*this.height/(this.width*numRows));
				}

				initGame();
		 	});			
		}
		else
		{
			cardH=Math.floor(wHeight/numRows);	
			cardW=Math.floor(wHeight*frontImgDimensions[0]/(frontImgDimensions[1]*columns));	

			if(cardW*columns > wWidth)
			{								
				cardW=Math.floor(wWidth/columns);
				cardH=Math.floor(wWidth*frontImgDimensions[1]/(frontImgDimensions[0]*numRows));
			}			

			handleResize();			
		}

				
	}

	function initGame()
	{
		buildGameSet();
			
		shuffleData(randomizer);					
		
		$(".memory").css({'width' : (cardW * columns)+'px','overflow':'auto','visibility':'hidden'});
		var rows = Math.ceil(totalCards/columns);
		
		$(".cards").css({'width' : cardW * columns,'height':(cardH * rows + 5) +'px'});
		$(".gameover").css({'width' : cardW * columns});											

		$('.gametitle').css('font-size', Math.ceil(35*$(".cards").width()/1024) + 'px');
		$('.timer').css('font-size', Math.ceil(25*$(".cards").width()/1024) + 'px');		
	
		buildgame();		
	}
	
	function startTimer()
	{
		var time = 0;

		timer = window.setInterval(function()
		{
		    time += 100;
		    elapsed = Math.floor(time / 100) / 10;

		    if(Math.round(elapsed) == elapsed) 
		    	elapsed += '.0';

			if (showtimer)
				$('#clock').html(convertTime(elapsed));

		}, 100);

	}
	
	function stopTimer()
	{
		clearInterval(timer);
	}
	
	function convertTime(raw) 
	{
	    var output = "",mins,secs;

	    if (raw >= 60) 
	    {
	        mins = Math.round(raw / 60);
	        raw = raw % 60;

			if (mins < 10)
				output += "0";

	        output += mins + ':';

	    } 
	    else
			output += "00:";
	
		secs = Math.round(raw);

		if (secs < 10)
			output += "0";

	    output += secs;

	    return output;
	}
	
	function buildGameSet()
	{	
		var randomCards = [];

		for (var i=0;i<dataArray.length;i++)
			randomCards.push(i);
		
		allCards = [];
		
		for (i=0;i<cardsets;i++)
		{
			var num = randomCards[Math.floor(Math.random()*randomCards.length)];
			allCards[i]=dataArray[num];
			allCards[i+cardsets]=dataArray[num];
			
			randomCards = jQuery.grep(randomCards, function(value){
			        return value != num;
	      	});

		}

	}
	
	function shuffleData(arr)
	{
		for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
		return arr;
	};
	
	function setClick(id_set,id,set)
	{
		var _id = '.'+id_set;

		 $(_id).click(function(){
			cardClick(id,set);
		 });

	}

	function checkLoad(path)
	{
		loadedImages++;

		if (totalImages == loadedImages)
			loadComplete();
	}	
	
	function loadComplete() {
	
		adjustDimensions(true);	 		

		$('.memory').css({'visibility':'visible'});
		
		if(!Modernizr.csstransitions || !use3D)
		{
				if(!showpeek)
					setReady();				
				else
				{
					window.setTimeout(function() {
						for (var i=0; i < cardids.length; i++) {
							var card = 'div#'+cardids[i]+'.card';
							spinCard(card);
						};
					},1000);

					window.setTimeout(function() {						
						for (var i=0; i < cardids.length; i++) {
							var card = 'div#'+cardids[i]+'.card';
							spinCardBack(card);
						};
						setReady();
					},peekspeed + 1000);

				}
		}
		else
		{	
		   	if(!showpeek)
				setReady();
			else
			{
				window.setTimeout(function() {
					$('.card').addClass('spin');
				},1000);

				window.setTimeout(function() {
					$('.card').removeClass('spin');
					setReady();
				},peekspeed + 1000);

			}

		}

	}
	
	function setReady()
	{
		clickready = true;

		if (usetimer)
			startTimer();
	}	
	
	function cardClick(id,set)
	{
		if (clickready)
		{
			var card = 'div#'+set+id+'.card';
			spinCard(card);

			if (currClickID == null)
			{
				currClickID = id;
				cardOne = card;
				attempts ++;
				
			}
			else
			{
				cardTwo = card;
				clickready = false;

				if (currClickID == id)
				{				
					num_correct++;

					window.setTimeout(function() {
						fadeCards(cardOne);
						fadeCards(cardTwo);
						cardOne = cardTwo = undefined;
						currClickID = null;
						clickready = true;
					},correcthold);

					if (num_correct == cardsets)
					{
						stopTimer();

						window.setTimeout(function() {
							youwin();
							num_correct = 0;
							attempts = 0;
						},endscreendelay);

					}

				}
				else
				{					
					window.setTimeout(function() {
						spinCardBack(cardOne);
						spinCardBack(cardTwo);
						cardOne = cardTwo = undefined;
						currClickID = null;
						clickready = true;
					},incorrecthold);
				}

			}

		}

	}

	function youwin()
	{
		if ($(".gameover_bg").children().length > 0)
			$(".gameover_bg").children().remove();

		$(".gameover_bg").append('<h1>'+accessSkill()+'</h1>');
		
		attempts = "<span style='color:"+attemptscolor+";'>"+attempts+"</span>";
		elapsed = "<span style='color:"+attemptscolor+";'>"+convertTime(elapsed)+"</span>";

		var scoreOutput = attempts;

		if (linetwo == "score")
		{
			if (displayscore == "time")
			{
				linetwopost = ".";
				scoreOutput = elapsed;
			}
			else if (displayscore == "both")
				scoreOutput = elapsed + " and "+attempts;

			$(".gameover_bg").append('<p>'+linetwopre+scoreOutput+linetwopost+'</p>');

		}
		else
			$(".gameover_bg").append('<p>'+linetwosolo+'</p>');
			
		if (linethree == "replay")
		{
			$(".gameover_bg").append('<p id="onemoretime"><a>'+linethreereplay+'</a></p>');
			onemoretime();
		}
		else
			$(".gameover_bg").append('<p id="onemoretime">'+linethreelink+'</p>');
		
		$('.gameover').fadeIn(endscreenfade);
		var middle = .5 - ( ($(".gameover_bg").height() / boardHeight ) / 2);
		
		$(".gameover_bg").css({'top':middle*100+"%"});
		
	}
		
	function onemoretime()
	{
		$('#onemoretime a').click(function(){
			playAgain();
		});
	}
		
	function accessSkill()
	{
		for (var i=0;i<skillArray.length;i++)
		{
			if (scoresystem == "time")
				if (elapsed <= (i*skillInc))
					return skillArray[i];
			else
				if (attempts <= cardsets + (i*skillInc))
					return skillArray[i];
		}

		return skillArray[skillArray.length-1];
	}
		
	function playAgain()
	{
		$(".cards").children().remove();
		toggleEnd('none');
		buildGameSet();
		shuffleData(randomizer);
		buildgame();
	}

	function toggleEnd(dir)
	{
		$(".gameover").css({'display':dir});
	}

	function spinCard(id)
	{
		if(!Modernizr.csstransitions || !use3D)
		{		
			var margin = $(id + ' .cardFront').width()/2;

			$(id + ' .cardBack').stop().css({width:'0px',height:''+cardH+'px',marginLeft:''+margin+'px',opacity:'0.5'});
			$(id + ' .cardFront').stop().animate({width:'0px',height:''+cardH+'px',marginLeft:''+margin+'px',opacity:'0.5'},{duration:revealspeed});

			window.setTimeout(function() {
				$(id + ' .cardBack').stop().animate({width:''+cardW+'px',height:''+cardH+'px',marginLeft:'0px',opacity:'1'},{duration:revealspeed});
			},revealspeed);
				
		}
		else
		{
			var reveal = revealspeed/1000+'s';
			$(".card").css({'transition':reveal,'-webkit-transition':reveal});
			$(id).addClass('spin');
			$(id).parent().css({'z-index':zinc});
			zinc++;
		}
	}
		
	function spinCardBack(id)
	{
		if(!Modernizr.csstransitions || !use3D)
		{
			var margin = $(id + ' .cardBack').width()/2;

			$(id + ' .cardBack').stop().animate({width:'0px',height:''+cardH+'px',marginLeft:''+margin+'px',opacity:'0.5'},{duration:hidespeed});

			window.setTimeout(function() {
				$(id + ' .cardFront').stop().animate({width:''+cardW+'px',height:''+cardH+'px',marginLeft:'0px',opacity:'1'},{duration:hidespeed});
			},hidespeed);
			
		}
		else
		{
			var hide = hidespeed/1000+'s';
			$(".card").css({'transition':hide,'-webkit-transition':hide});
			$(id).removeClass('spin');
		}
	}
		
	function fadeCards(id)
	{
		$(id + ' .cardBack').stop().animate({opacity:'0'},{duration:fadespeed});

		window.setTimeout(function() {
			$(id + ' .cardFront').stop().animate({opacity:'0'},{duration:fadespeed});
		},fadespeed);
		
	}

})(jQuery);