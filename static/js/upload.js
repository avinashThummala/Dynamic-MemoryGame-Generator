$(function(){

	var numImages = $('#nRText').val()*$('#nCText').val()/2 + 2;

	$.post('/uploadDimensions', {'nRows': $('#nRText').val(), 'nCols': $('#nCText').val()} );

	$('#nRText').on('input',function(e){
 		numImages = $('#nRText').val()*$('#nCText').val()/2 + 2;

 		$.post('/uploadDimensions', {'nRows': $('#nRText').val(), 'nCols': $('#nCText').val()} );

     	if(uploadedImages>=numImages)
        	window.location.replace("/iPicker");		
	});

	$('#nCText').on('input',function(e){
 		numImages = $('#nRText').val()*$('#nCText').val()/2 + 2;

 		$.post('/uploadDimensions', {'nRows': $('#nRText').val(), 'nCols': $('#nCText').val()} );

    	if(uploadedImages>=numImages)
        	window.location.replace("/iPicker");
	});	

	var uploadedImages = 0;	
	
	var dropbox = $('#dropbox'),
		message = $('.message', dropbox);
	
	dropbox.filedrop({
		paramname: 'file',
		maxfiles: 10,
		queuefiles: 2,		
    	maxfilesize: 1,
		url: '/upload',

		uploadFinished:function(i,file,response){
			$.data(file).addClass('done');
		},

        afterAll: function() {

        	if(uploadedImages>=numImages)
            	window.location.replace("/iPicker");
        },  		
		
    	error: function(err, file) {
			switch(err) {
				case 'BrowserNotSupported':
					showMessage('Your browser does not support HTML5 file uploads!');
					break;
				case 'TooManyFiles':
					alert('Too many files! Please select ' + this.maxfiles + ' at most!');
					break;
				case 'FileTooLarge':
					alert(file.name + ' is too large! The size is limited to ' + this.maxfilesize + 'MB.');
					break;
				default:
					break;
			}
		},
		
		beforeEach: function(file){
			if(!file.type.match(/^image\//)){
				alert('Only images are allowed!');
				return false;
			}

			uploadedImages++;
		},
		
		uploadStarted:function(i, file, len){
			createImage(file);
		},
		
		progressUpdated: function(i, file, progress) {
			$.data(file).find('.progress').width(progress);
		}
    	 
	});
	
	var template = '<div class="preview">'+
						'<span class="imageHolder">'+
							'<img />'+
							'<span class="uploaded"></span>'+
						'</span>'+
						'<div class="progressHolder">'+
							'<div class="progress"></div>'+
						'</div>'+
					'</div>'; 
	
	
	function createImage(file){

		var preview = $(template), 
			image = $('img', preview);
			
		var reader = new FileReader();
		
        image.width = 100;
		image.height = 100;

		reader.onload = function(e){
			image.attr('src',e.target.result);
		};
		
		reader.readAsDataURL(file);
		
		message.hide();
		preview.appendTo(dropbox);
		
		$.data(file,preview);
	}

	function showMessage(msg){
		message.html(msg);
	}

});
