(function(){ //start wrapper
		  
	/* Set Script Global Variables */
	var _speed = 250, //transistion speeds
		_container = $('div#content'), //entire page container
		_seed = $('.nav .tab #seed',_container), //the button to set the seed
		_seed_w = 0, //seed width
		_seed_h = 0, //seed height
		_get = $('.calc .get',_container), //container for getting new sizes
		_get_w = $('.w input',_get), //width
		_get_h = $('.h input',_get), //height
		_stored = $('.nav .stored',_container), //container showing current dimensions
		_stored_w = $('.w',_stored), //width
		_stored_h = $('.h',_stored), //height
		_adjust = $('.calc .adjust',_container), //container for adjusting sizes
		_adjust_w = $('.w input',_adjust), //width
		_adjust_h = $('.h input',_adjust), //height
		_adjust_p = $('.p input',_adjust), //percent
		_adjust_rw = 0, //ratio width
		_adjust_rh = 0, //ratio height
		_inputs = $('.get .w input, .get .h input, .adjust .p input, .adjust .w input, .adjust .h input'), //width, height, and percentage
		_inputs_keydown = '', //the value before the data was entered 
		_options = $('.calc .options',_container), //container for the options
		_opt_precision = $('select',_options), //select input for precision dropdown
		_opt_enable_popup = $('#enable_popup',_options), //checkbox for ratio popup
		_to_fixed = 0, //the selected precision for floating point numbers
		_to_fixed_limit = 4, //protection against too high of _to_fixed
		_demo = $('.demo',_adjust), //demo box
		_ratio = $('.ratio',_demo), //ratio container
		_ratio_l = $('.left',_ratio), //text for left side ratio
		_ratio_r = $('.right',_ratio), //text for right side ratio
		_ratio_hover = $('.ratio_hover',_demo), //the ratio container for hover box
		_ratio_hover_display = false, //whether to show the popup or not
		_ratio_hover_l = $('.left',_ratio_hover), //text for left side of ratio hover
		_ratio_hover_r = $('.right',_ratio_hover), //text for right side of ratio hover
		_presets = $('.presets .list',_container), //container for list of presets
		_preset_list = [ //the list of presets
			{'':{w:1366,h:768}},
			{'':{w:1024,h:768}},
			{'iPad 3':{w:1536,h:2048}},
			{'iPhone 4s':{w:640,h:960}},
			{'YouTube':{w:560,h:315}}
			];
	
	/* Show _ratio_hover for detailed ratio information. */
	_adjust.mousemove(function(e){ _ratio_hover.css({'left':e.pageX + 10,'top':e.pageY + 10}); });
	_demo.hover(function(){
		if(_ratio_hover_display){ _ratio_hover.show(); }
	},function(){
		_ratio_hover.hide();
	});
		
	//populate the list of presets
	$.each(_preset_list,function(index,value){
		$.each(_preset_list[index],function(title,value){
			if(title == ''){title = value.w+' x '+value.h}
			_presets.append('<div item="'+index+'" w="'+value.w+'" h="'+value.h+'">'+title+'</div>');
		});
	});
	
	//populate _get fields on click of preset
	$('div',_presets).on('click',function(){
		var self = $(this);
		_seed.click(); //go to _get menu
		_get_w.val(self.attr('w')); //set the new width
		_get_h.val(self.attr('h')); //set the new height
	});
	
	//clear the value for initial loading
	if(_get_w.val() == 0){ _get_w.val(''); }
	
	//calculate the demo dimensions //max width is 250px, height is 230px
	function demo_set(w,h){
		w = parseFloat(w); //set to int
		h = parseFloat(h); //set to int
		if(w > h){
			var diff = 250 / w; //percentage difference to demo size
		}else{
			var diff = 230 / h; //percentage difference to demo size
		}
		
		_demo.width(Math.floor(w * diff)); //set width	
		_demo.height(Math.floor(h * diff)); //set height
		_demo.css('left',162+(294/2)-(_demo.width()/2));//center the box
		_ratio.css({'margin-top' : ((h * diff) / 2)-12,'margin-left' : 162-parseInt(_demo.css('left'))}); //center the ratio, 12 is the height of _ratio (it wont detect automatically)
	
		//get ratio
		function get_ratio(a,b){
			var mod = a % b; //get the remainder
			return (mod != 0) ? get_ratio(b,mod) : b; //if there is a remainder, loop through again.
		}
	
	var l = String(w/get_ratio(w,h)), //the left side of the ratio
		r = String(h/get_ratio(w,h)); //the right side of the ratio
	_ratio_hover_l.text(l); //save left text for the popup
	_ratio_hover_r.text(r); //save right text for the popup
	_ratio_hover_display = false; //reset to false with the possiblity to being change in the next two lines
		//limit the output
		if(l.length > 4){
			l = l.substring(0,5) + '~';
			if(_opt_enable_popup.is(':checked')){ _ratio_hover_display = true; }else{ _ratio_hover_display = false; }
		}
		//limit the output
		if(r.length > 4){
			r = r.substring(0,5) + '~';
			if(_opt_enable_popup.is(':checked')){ _ratio_hover_display = true; }else{ _ratio_hover_display = false; }
		} 
	_ratio_l.text(l); //save to _demo
	_ratio_r.text(r); //save to _demo
	}
	
	//sets _to_fixed based on input
	function preset_fixed(input){
		var arr = input.split('.'); //split the array
		//if float found
		if(arr.length > 1){
			//if the string is longer than the current setting
			if(arr[1].length > _to_fixed){
				_to_fixed = arr[1].substring(0,_to_fixed_limit).length; //set the new limited length for _to_fixed
			}
		}
	}
	
	//on _get submit, set the stored width and height
	function on_get(){
		_seed_w = _get_w.val(); //get new width
		_seed_h = _get_h.val(); //get new height
		if(_seed_w > 0 && _seed_h > 0){ //make sure values were entered
			preset_fixed(_seed_w); //determine initial _to_fixed
			preset_fixed(_seed_h); //determine initial _to_fixed
			_stored_w.text(_seed_w); //transfer width to current
			_stored_h.text(_seed_h); //transfer height to current
			_adjust_w.val(_seed_w); //transfer width to adjust
			_adjust_h.val(_seed_h); //transfer height to adjust
			_adjust_p.val('100'); //update percent
			_seed.removeClass('selected'); //deselect the button
			_get.fadeOut(_speed,function(){ //hide .get
				_stored.fadeIn(_speed); //show .current
				_adjust.fadeIn(_speed); //show .adjust
				_options.fadeIn(_speed); //show options
				demo_set(_seed_w,_seed_h); //set the proper dimensions for the demo box
				_demo.fadeIn(_speed); //show the demo box
				_opt_precision.trigger('change',[true]) //set the default precision
				});
		}
		//show that there is a problem with one of the inputs
		if(_seed_w == 0 || isNaN(_seed_w)){_get_w.css('background-color','#FF8F8F');}else{_get_w.css('background-color','#FFF');} //width
		if(_seed_h == 0 || isNaN(_seed_h)){_get_h.css('background-color','#FF8F8F');}else{_get_h.css('background-color','#FFF');} //height
	}
	
	//submit _get form
	$('.button',_get).on('click',function(){on_get();}); //via click
	$('body').on('keyup',function(e){ if(_get.is(':visible') && e.which == 13){on_get();} }); //via enter
	
	//store the value before input on fields
	_inputs.on('keydown.global',function(e){
		//if class doesn't exist
		if(!$(this).hasClass('keypress')){
			$(this).toggleClass('keypress'); //prevent holding down the key
			_inputs_keydown = $(this).val(); //save the initial value
		}
	});
	
	//update input fields on key press
	_inputs.on('keyup.global',function(e){
		var self = $(this);
		self.toggleClass('keypress'); //allow pressing the next key
		var input = self.val(); //get the current value
		if(input == '.') { input = '0.'; self.val(input); } //prepend 0 if decimal was entered into empty field
		
		//if the new data is a number AND not a space.
		if(!isNaN(input) && e.which != 32){
			//if this is an _adjust input
			if(self.parents('.adjust').length){
				var _parent = self.parent(); //cache the parent
				//if changing width
				if(_parent.hasClass('w')){
					input = self_fixed(self,input); //don't let user input past _to_fixed
					var p = input / _seed_w; //set percentage change from input
					_adjust_p.val((p * 100).toFixed(_to_fixed)); //output percentage
					_adjust_h.val((_seed_h * p).toFixed(_to_fixed)); //output height
				}
				
				//if changing height
				if(_parent.hasClass('h')){
					input = self_fixed(self,input); //don't let user input past _to_fixed
					var p = input / _seed_h; //set percentage change from input
					_adjust_p.val((p * 100).toFixed(_to_fixed)); //output percentage
					_adjust_w.val((_seed_w * p).toFixed(_to_fixed)); //set new _adjust height
				}
				
				//if changing percentage
				if(_parent.hasClass('p')){
					input = self_fixed(self,input); //don't let user input past _to_fixed
					var p = input / 100; //get the new percentage
					_adjust_w.val((_seed_w * p).toFixed(_to_fixed)); //set new _adjust height
					_adjust_h.val((_seed_h * p).toFixed(_to_fixed)); //set new _adjust height
				}
			}
		}else{
			self.val(_inputs_keydown); //change value back to original input
		}
	});	
	
	//don't let user input past _to_fixed 
	function self_fixed(self,input){
		var arr = input.split('.');
		if(arr.length > 1 && arr[1].length > _to_fixed){
			var new_input = parseFloat(arr[0] + '.' + arr[1].substring(0,_to_fixed));
			self.val(new_input);
			return new_input;
		}
		return input;
	}

	//show _get when clicking _seed
	_seed.on('click',function(){
		_options.fadeOut(_speed); //hide the options
		_adjust.fadeOut(_speed,function(){
			_seed.addClass('selected'); //make the button selected
			_get_w.css('background-color','#fff'); //reset width background
			_get_h.css('background-color','#fff'); //reset height background
			_get.fadeIn(_speed); //show the _get box
		});
	});
	
	//watch for when _opt_precision has been updated
	_opt_precision.on('change',function(e,manual){
		var self = $(this);
		
		//if not run manually
		if(!manual){
			_to_fixed = parseInt(self.val()); //get _to_fixed set by user
			}else{
			$('option[value="'+_to_fixed+'"]',self).attr('selected','selected'); //set to the currently selected value
		}
		//set the width of the select box
		if(_to_fixed == 0){ self.animate({'width':33}); }
		if(_to_fixed == 1){ self.animate({'width':42}); }
		if(_to_fixed == 2){ self.animate({'width':48}); }
		if(_to_fixed == 3){ self.animate({'width':54}); }
		if(_to_fixed == 4){ self.animate({'width':60}); }
		
		_adjust_p.trigger('keydown.global').trigger('keyup.global'); //run this to prevent rounding errors
	});
	
	//Listen for changes on the ratio popup status
	_opt_enable_popup.on('change',function(){
		if($(this).is(':checked')){
			_ratio_hover_display = true;
		}else{
			_ratio_hover_display = false;	
		}
	});
	
	//empty input field on focus if == 0
	$('input').on('focus',function(){ if($(this).val() == 0){ $(this).val(''); } });
	
	//fill input field on blur if == ''
	$('input').on('blur',function(){ if($(this).val() == ''){ $(this).val('0'); } });
	
})(); //end wrapper