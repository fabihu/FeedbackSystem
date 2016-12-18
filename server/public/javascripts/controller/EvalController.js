FeedbackSystem.EvalController = (function() {
	var that = {},
	travelCategories = null,
	edit_trip = false,
	edit_user = false,
	answer_option_counter = 0,
	new_question = null,
	old_answer_values = [],
	question_types = ['nominal', 'ordinal', '', 'Freitext'],
	user_name = "",
	
	init = function() {				
	 console.log("EvalController init");
	 getTravelCategories(function(){
	 	getPageContent('/eval/trip');	 	
	 });
	 setClickListener();
	 onNavBarClick();
	},


	getPageContent = function(url){
		if(url == '/eval/logout'){
			performLogout(url);		
		}	

		$.get(url, function( data ){
											
    		$('#dashboard-content').empty();
    		$('#dashboard-content').append(data);

    		switch(url){
    			case('/eval/trip'):{	    				
    				$(document).ready(function(){	
    					$('#table-trips > tbody  > tr').each(function(index, element) {
    						parseTravelType(element)
    						formatDate(element);    					
    					});
    				});	
    					
    				$(".btn-trip-active").bootstrapSwitch({size: 'mini',
    															onColor: 'success',
    															offColor: 'danger',
    															onSwitchChange: function(){
    																onChangeTripStatus(this);
    															}});
    				$('#table-trips > tbody  > tr').each(function(index, element) {    			
    					var trip_id = $(element).data('trip-id');
    					getQuestionnaireType(trip_id, function(data){
    						var type = data[0].type_questionnaire;    					
    						$("#select-q-type-"+trip_id).val(type);	
    					});
    				});	
    				break;
    			}
    			case('/eval/score'):{
    		     	parseTimeHeader();
    			 	onLoadCharts();
    			 	break;
    			} 
    			case('/eval/assignment'):{
    				checkNoActiveTrips(data);
    				break;	
    			} 
    			case('/eval/questions'):{
    				$('#table-questions > tbody > tr').each(function(index, element) {
    					parseQuestionType(element); 
    				});
    			} 
    			case('/eval/users'):{
    				$.post( "/eval/user_name/", function( data ) {
  						user_name = data.name;  						
    					$('#table-users > tbody > tr').each(function(index, element) {
    						var name = $(element).find('td').eq(0).text();
    						var buttons = $(element).find('td').eq(2);    						
    						if(name == user_name) {    				
    							var password_field = $(element).find('td').eq(1);
    							var eye_glyphicon = '<div class="glyphicon-eye"><span class="glyphicon glyphicon-eye-open"></span>';
    							$(password_field).append(eye_glyphicon);

    							$(buttons).find('a').removeClass('not-active').removeAttr('disabled');;


    							
    							$(".glyphicon-eye").on('click', function(){
    								var type = $(password_field).find('input').prop("type");
    								if(type == 'password'){
    									$(".glyphicon-eye").find('span').removeClass("glyphicon-eye-open").addClass("glyphicon-eye-close");
    									$.post("/eval/password/", function( data ) {    									
    										$(password_field).find('input').val(data.pw);
    										$(password_field).find('input').prop("type", "text");					
    									});
    								} else {
    									$(".glyphicon-eye").find('span').removeClass("glyphicon-eye-close").addClass("glyphicon-eye-open");
    									$(password_field).find('input').val("1234567890");
    									$(password_field).find('input').prop("type", "password");
    								}
    							})
    						}
    						
    					});
					});
					
    			}  			
    		}

    		
    	});
	},

	setClickListener = function(){
		$('li').hover(function(){			
			$(this).addClass('hover-li-enabled');
		}, function () {
		    $(this).removeClass('hover-li-enabled');		
		});

		$('li').click(function(){			
			onClickMenuItem(this);
		});
		
		
		//Buttons for trip	

		$('#dashboard-content').on('click', ".btn-modal-new-trip", function( e ){
			onModalTripShow();
		});

		$('#dashboard-content').on('click', ".btn-delete-trip", function( e ){
			onDeleteTrip(e, this);
		 	getPageContent('/eval/trip');
		});

		$('#dashboard-content').on('click', ".btn-edit-trip", function( e ){
			edit_trip = true;
			onEditTrip(e, this);		 	
		});

		$('#dashboard-content').on('click', ".btn-modal-cancel", function( e ){
			edit_user = false;
			edit_trip = false;				 	
		});	

		$('#dashboard-content').on('click', ".btn-modal-save-new-trip", function( e ){
			onSaveNewTrip(e);						
		});	

		

		
		//Buttons for question	
		$('#dashboard-content').on('click', ".btn-modal-new-question", function( e ){
			onModalNewQuestion();
		});

		$("#dashboard-content").on("click", ".button-add-row-answer-option", function () {
			onAddRowAnswerOption();
   		});

   		$("#dashboard-content").on("click", ".btn-del-answer-row", function (event) {
        	$(this).closest("tr").remove();       
        	answer_option_counter -= 1
    	});	

    	$('#dashboard-content').on('click', ".btn-modal-next-new-question", function( e ){			
			onNextNewQuestion(e);						
		});	

		$('#dashboard-content').on('click', ".btn-modal-save-new-answer-option", function( e ){			
			onSaveNewQuestion(e);						
		});

		$('#dashboard-content').on('click', ".btn-delete-question", function( e ){			
			onDeleteQuestion(e, this);						
		});

		$('#dashboard-content').on('click', ".btn-modal-edit-question", function( e ){			
			onModalEditQuestion(e, this);						
		});

		$('#dashboard-content').on('click', ".btn-modal-save-edit-question", function( e ){			
			onSaveEditQuestion(e);						
		});

		//Buttons for answer
		$('#dashboard-content').on('click', ".btn-detail", function( e ){
			onClickDetailQuestion(e, this);			
		});
	
		$('#dashboard-content').on('click', ".btn-modal-edit-answer", function( e ){			
			onModalEditAnswer(e, this);						
		});



		$('#dashboard-content').on('click', ".btn-delete-answer", function( e ){			
									
		});


		$('#dashboard-content').on('hidden.bs.modal', "#modal-detail-question", function( e ){			
			onModalAnswerClose(e, this);						
		});

		$('#dashboard-content').on('click', ".btn-add-row-answer-option-detail", function( e ){			
			onAddRowAnswerOptionDetail(e, this);						
		});	

		$('#dashboard-content').on('click','.btn-del-answer', function( e ){
			onDeleteAnswer(e, this);

		});

		$('#dashboard-content').on('click', ".btn-modal-save-edit-answer", function( e ){			
			onSaveEditAnswer(e, this);						
		});


		//Buttons for assignment
		$('#dashboard-content').on('click', '.list-group .list-group-item', function () {
            $(this).toggleClass('active');
       	});

        $('#dashboard-content').on('click','.list-arrows button', function () {
        	onArrowLeftRightClick(this);                
        });

         $('#dashboard-content').on('click','.dual-list .selector', function () {
         	onSelectListItem(this);
           
        });

        $('#dashboard-content').on('keyup', '[name="SearchDualList"]', function (e) {        	
        	onSearchInput(e, this);            
        });

		$('#dashboard-content').on('click','.list-order-arrows button', function (e) {        	
        	onArrowUpDownClick(this);            
        });

        $('#dashboard-content').on('change', '.select-questionnaire', function() {        	
  			onSelectChange(this);
		}); 


		//Buttons for user
		$('#dashboard-content').on('click', '.btn-modal-new-user', function () {
           onModalUserShow();
       	});

       	$('#dashboard-content').on('click', '.btn-modal-save-new-user', function () {
           onModalSaveNewUser(this);
       	});        		
		
		$('#dashboard-content').on('click', '.btn-delete-user', function () {
           onDeleteUser(this);
       	});

       	$('#dashboard-content').on('click', '.btn-edit-user', function () {
       	   edit_user = true;
           onModalEditUser(this);
       	});

       	$('#dashboard-content').on('click', '.tooltip-eval', function () {
       	   var tooltip = $(this).data('tooltip');
           initTooltip(this, tooltip);
           $(this).tooltip('show');
       	});      
	},

	performLogout = function(url){
		$.get(url, function(data){
			$('body').empty();
    		$('body').append(data);
		});
		return;
	},

	initTooltip = function(selector, tooltip){
		var title = "";
		switch(tooltip){
			case('status'):{ title = 'Ein Fragebogen kann mittels des Status-Sliders für die jeweilige Reise aktiviert oder deaktiviert werden. Die einzelnen Fragen des Fragebogens können nur im deaktivierten Zustand bearbeitet werden.'; break;}
			case('qtype'):{title = 'Es ist möglich den Fragebogen in verschiedenen Versionen beantworten zu lassen. In der Hybrid-Version werden abwechselnd Surveytainment- bzw. Standard-Fragebögen an den Nutzer ausgeliefert.'; break;}
			case('question'):{title = '<b>nominal:</b> Antwortoptionen der Frage können unterschiedliche Ausprägungen ohne natürliche Rangfolge aufweisen ' +
									   '\n<b>ordinal:</b> Antwortoptionen der Frage besitzen eine natürliche Ausprägung und werden auf einer Skala von "sehr gut" bis "sehr schlecht" beantwortet' +
									   '\n<b>Freitext:</b> Nutzer können Antworten in einem Freitextfeld beantworten'; break;}
			default: {title = 'Kein Tooltip gefunden!'; break;}
		}
		$(selector).tooltip({
					   animation: true,                       
                       container: selector,
                       placement: 'bottom',
                       html: true,
                       title: title 
                        })  		
	},

	parseQuestionType = function(selector){
		var field = $(selector).find('td').eq(2)[0];
    	var value = $(field).html();   	
    	var type = question_types[parseInt(value)];    	
    	$(field).html(type);
	},

	parseTimeHeader = function(){
		$(".header-date").each(function(index, element){
			var value = new Date($(element).html());				
			$(element).html(value.getDate() + '.' + (value.getMonth() + 1) + '.' +  value.getFullYear());
		});
	},

	parseTravelType = function(selector){
		var field = $(selector).find('td').eq(2)[0];
    	var value = $(field).html();    					
    	var category = $.grep(travelCategories, function(e){ return e.id == value; });
    	$(field).html(category[0].type);
	},

	formatDate = function(selector){
		var field = $(selector).find('td').eq(1)[0];
		var value = new Date($(field).html());				
		$(field).html(value.getDate() + '.' + (value.getMonth() + 1) + '.' +  value.getFullYear());

	},

	checkNoActiveTrips = function(data){
		if($(".panel-assignment").length == 0){
			var text ="<div class='main-text font-large'>Keine aktiven Reisen gefunden!</div>"
			$("#dashboard-content").append(text)
		} 
	},

	onDeleteUser = function(element){
		var user_id = $(element).data('user-id');
		var url =  '/eval/delete-user';

		$.post(url, {id: user_id}, function( data ){
			getPageContent('/eval/users');						
		});
	},

	onModalEditUser = function(element){

		var user_id = $(element).data('user-id');
		var $row = $('#user-row-' + user_id);
		var old_mail = $($row.children()[0]).text();
		var old_password = $($row.children()[1]).text();		
		
		onModalUserShow();
		
		$('#new-user-id').val(user_id);
		$('#new-user-email').val(old_mail);
		$('#new-user-password').val(old_password);
		
	},

	onModalSaveNewUser = function(element){
		var user_id = $('#new-user-id').val();
		var new_mail = $('#new-user-email').val();
		var new_password = $('#new-user-password').val();		

		if (edit_user){
			var url = '/eval/edit-user';		
			$.post(url, {id: user_id, mail: new_mail, password: new_password}, function( data ){
				getPageContent('/eval/users');						
			});
		} else {			
			var url = '/eval/save-new-user';
			$.post(url, {mail: new_mail, password: new_password}, function( data ){
				getPageContent('/eval/users');						
			});
		}
		edit_user = false;
		$("#modal-new-users").hide('modal');
	},

	onModalUserShow = function(){
		$("#modal-new-users").modal('show');		
	},

	onSelectChange = function(element){
		var new_value = $(element).val();
		var trip_id =  $(element).data('trip-id'); 		
		var url = '/eval/change-type-questionnaire';

		$.post(url, {trip_id: trip_id, type: new_value}, function( data ){
		 	callback(data);					
		});	

	},

	getQuestionnaireType = function(trip_id, callback){
		var url = '/eval/get-questionnaire-type';
		$.post(url, {trip_id: trip_id}, function( data ){
		 	callback(data);					
		});	
	},

	onNavBarClick = function(){
		$('ul.nav-stacked li a').click(function (e) {		
			$('a').removeClass('a-nav-active');
  			$(this).addClass('a-nav-active');      
		});
	}
	

	onSearchInput = function(e, element){			
			var code = e.keyCode || e.which;
            if (code == '9') return;
            if (code == '27') $(element).val(null);
            var $rows = $(element).closest('.dual-list').find('.list-group li');
           
            var val = $.trim($(element).val()).replace(/ +/g, ' ').toLowerCase();
           
            $rows.show().filter(function () {
                var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                return !~text.indexOf(val);
            }).hide();
	},

	onSelectListItem = function(element){
		 var $checkBox = $(element);
            if (!$checkBox.hasClass('selected')) {
                $checkBox.addClass('selected').closest('.well').find('ul li:not(.active)').addClass('active');
                $checkBox.children('i').removeClass('glyphicon-unchecked').addClass('glyphicon-check');
            } else {
                $checkBox.removeClass('selected').closest('.well').find('ul li.active').removeClass('active');
                $checkBox.children('i').removeClass('glyphicon-check').addClass('glyphicon-unchecked');
            }
	},

	onArrowLeftRightClick = function(element){
		var $button = $(element), actives = '', url = '';
				trip_id = $(element).data('trip-id');
                if ($button.hasClass('move-left')) {                	
                    actives = $('.list-right ul li.active');
                    actives.appendTo($('.list-left ul.'+trip_id)); 
                    url = '/eval/add-question-set'                   
                    

                } else if ($button.hasClass('move-right')) {

                    actives = $('.list-left ul li.active');
                    actives.appendTo($('.list-right ul.'+trip_id));
                    url = '/eval/remove-question-set';
				                      
                }
                
                for (var i = 0; i<actives.length;i++){
                    	var $item = $(actives[i]);                    	
                    	var trip_id = $item.data('trip-id');
                    	var question_id =  $item.data('question-id');
                    	var question_version =  $item.data('question-version');
                    	                    	
				    	$.post(url, {trip_id: trip_id, question_id: question_id, question_version: question_version}, function( data ){
							
						});	
                }
	},

	onArrowUpDownClick = function(element){
		
		var $button = $(element), $actives = '', url = '';
                if ($button.hasClass('move-up')) {  
                	              	
                    $actives = $('.list-left ul li.active');
                    $before = $actives.first().prev();
                    $actives.insertBefore($before);
                  
                } else if ($button.hasClass('move-down')) {
                 	
                   $actives = $('.list-left ul li.active'); 
                   $next = $actives.last().next();                  
                   $actives.insertAfter($next);                  
				                      
                }
        var trip_id = $(element).data('trip-id');     
        var question_entries = $('.list-left ul li.trip-'+trip_id);
        
        for (var i = 0; i<question_entries.length;i++){
        	
        	var question = $(question_entries[i]);
        	var question_id = $(question).data('question-id');
        	var position = i+1;
        	var url = '/eval/change-order-question-set'
			$.post(url, {trip_id: trip_id, question_id: question_id, position: position}, function( data ){
				
			});        	       	
        }
        
	},

	onChangeTripStatus = function(element){		
		var trip_id = $(element).data('trip-id');
		var active_state;
		if ($(element).is(":checked")){
 			active_state = true; 			
		} else {
			active_state = false;
		}
		
		var url = '/eval/update-active-trip'
		$.post(url, {trip_id: trip_id, flag_active: active_state}, function( data ){
			
		});

	},

	onModalNewQuestion = function(){
		$("#modal-new-question").modal('show');
	},

	onModalTripShow = function(){
		$("#modal-new-trip").modal('show');
		loadTravelCategoriesInModal();
		initDatepickerNew();
	},

	onModalEditQuestion = function(e, item){

		var question_id = $(item).data('question-id');
		
		var $row = $('#question-row-' + question_id);	
		var old_question_name = $($row.children()[1]).text();
		var old_type = $($row.children()[2]).text();

		$("#modal-edit-question").modal('show');

		$('#edit-question-id').val(question_id);
		$('#edit-question-text').val(old_question_name);
		$('#edit-question-type').val(parseInt(old_type));		

	},

	onModalEditAnswer = function(e, item){
		e.preventDefault();
		var answer_id = $(item).data('answer-id');
		var question_id = $(item).data('question-id');

		var $row = $('#answer-row-' + answer_id);			
		var old_answer_text = $($row.children()[0]).text();		

		$("#modal-edit-answer").modal('show');

		$('#edit-answer-id').val(answer_id);
		$('#edit-answer-text').val(old_answer_text);
		$('#edit-question-id').val(question_id);			

	},

	onSaveEditAnswer = function(e, item){
		e.preventDefault();
		var forms = $("#container-question-id-details").children('.form-inline');
		var question_id = $('#container-question-id-details').data('question-id');		
		var new_answer_options = [];
		
		
		$.each(forms, function(index, element){
			var answer_id = -1;
			var new_text = $(element).find("#detail-answer-text").val();
			var answer = {
				text: new_text,
				question_id: question_id			
			}
			var url = "";
			
			if ($(element).find("#detail-answer-text").data('answer-id')){
				if($.inArray(new_text, old_answer_values) == -1){
					answer_id = $(element).find("#detail-answer-text").data('answer-id');
					url = '/eval/update-answer'
					$.post(url, {data: answer, id: answer_id, question_id: question_id}, function( data ){			
						
					});
				}
			} else {
					
					var answer_option = {
	    				text: new_text,
	    				question_id: question_id
	    			} 
	    			new_answer_options.push(answer_option);
					
			}
		
		});	
		
		if (new_answer_options.length > 0){			
			url = '/eval/save-new-answer-options'
			$.post(url, {data: new_answer_options}, function( data ){
				
			});
		}	

		$("#modal-edit-answer").hide('modal');
	},

	onModalAnswerClose = function(e, item){
		e.preventDefault();	
		$('#modal-body-detail-question').empty();		
	},

	onSaveEditQuestion = function(e){
		e.preventDefault();		
		var question_id = $('#edit-question-id').val();
		var new_text = $('#edit-question-text').val();
		var new_type = $('#edit-question-type').val();
		var question = {
			text: new_text,
			type: new_type
		}
		
		var url = '/eval/update-question'
		$.post(url, {data: question, id: question_id}, function( data ){
			getPageContent('/eval/questions');
		});

		$("#modal-edit-question").hide('modal');
	},

	onEditTrip = function(e, item){
		
			var trip_id = $(item).data('trip-id')
			var $row = $('#trip-row-' + trip_id);	

			var old_trip_name = $($row.children()[0]).text();
			var old_trip_date = $($row.children()[1]).text();
			var old_trip_type = $($row.children()[2]).text();
			var old_trip_count = $($row.children()[3]).text();
			var old_trip_password = $($row.children()[4]).text();
			
			$("#modal-new-trip").modal('show');
			loadTravelCategoriesInModal();
			initDatepickerEdit();
			var result = travelCategories.filter(function( obj ) {				
  				return obj.type == old_trip_type;
			});					

			$('#new-trip-id').val(trip_id);
			$('#new-trip-name').val(old_trip_name);
			$('#new-trip-date').val(old_trip_date);
			$('#new-trip-type').val(result[0].id);			
			$('#new-trip-count-travellers').val(parseInt(old_trip_count));
			$('#new-trip-password').val(old_trip_password);

	},

	onSaveNewTrip = function(e){
			var trip_id = $('#new-trip-id').val();
			var new_name = $('#new-trip-name').val();
			var new_date = convertToDate('#new-trip-date');			
			var new_type = $('#new-trip-type').val();
			var new_traveller_count = $('#new-trip-count-travellers').val();
			var new_password = $('#new-trip-password').val();
			console.log(new_date)

			var new_trip = {
				name: new_name,
				date_start: new_date,
				type: new_type,
				count_travellers: new_traveller_count,
				password: new_password
			}
			
			
			if(edit_trip){
				var url = '/eval/update-trip'
				$.post(url, {data: new_trip, id: trip_id}, function( data ){
					getPageContent('/eval/trip');
				});

			} else {
				var url = '/eval/save-new-trip'
				$.post(url, {data: new_trip}, function( data ){
					getPageContent('/eval/trip');

				});
			}
			edit_trip = false;
			$("#modal-new-trip").hide('modal');
				
	},

	convertToDate = function (selector) {
    	var from = $(selector).val().split(".");
    	var jsDate = new Date(from[2], from[1] - 1, from[0]);    	
    	return jsDate.toISOString().slice(0, 19).replace('T', ' ');
	},

	initDatepickerNew = function(){		
		var nowTemp = new Date();
		var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
		$('.datepicker').datepicker({
			autoclose: true,
			calendarWeeks: true,
			format: 'dd.mm.yyyy',
			language: 'de-DE',
			todayHighlight: true
		})		
	},

	initDatepickerEdit = function(){
		$('.datepicker').datepicker()
	},

	onAddRowAnswerOption = function(e){		
        var newRow = $("<tr>");
        var cols = "";

        			  
        cols += '<td><input type="text" class="form-control" name="input-new-answer-option-id-' + answer_option_counter + '" disabled/></td>';
        cols += '<td><input type="text" class="form-control input-new-answer-option-text" name="input-new-answer-option-text-' + answer_option_counter + '"/></td>';
       

        cols += '<td><input type="button" class="btn btn-md btn-danger btn-del-answer-row"  value="X"></td>';
        newRow.append(cols);        
        $(".table-answer-options").append(newRow);
        answer_option_counter++;

	},

	onAddRowAnswerOptionDetail = function(e, item){
		var form = $("#container-question-id-details").children('.form-inline').last();
		var new_input = '<div class="form-inline margin-answer-detail"><input type="text" class="form-control custom-input-width new-input" id="detail-answer-text" value="Neue Antwortoptionen eingeben..."/>' +
						'<input type="button" class="btn btn-md btn-danger btn-del-answer" value="X"/></div>';	

		$(new_input).insertAfter(form);

		$('.new-input').focus(function(){						
		   $(this).data('value', $(this).attr('value'))
		          .attr('value','');
		}).blur(function(){
		  $('.new-input').attr('value' , "Neue Antwortoptionen eingeben...");
		});		

	},

	onDeleteTrip = function(e, element){
		e.preventDefault();	
		var trip_id = $(element).data('trip-id');
		var url = '/eval/delete-trip';
		$.post(url, {id: trip_id}, function( data ){					
			$('#trip-row-'+ trip_id).fadeOut().delay(800).queue(function(){
				$(this).remove();
			});
		});
	},

	onNextNewQuestion = function(e){
		var new_question_id = $('#new-question-id').val();
		var new_text = $('#new-question-text').val();
		var new_type = $('#new-question-type').val();
		var new_question_answer_id = $('#new-question-answer-id').val();

		new_question = {
				text: new_text,
				type: new_type,				
		}
		

		$('#modal-content-question').remove();
		$('#modal-content-answer').removeClass('hidden');
		
		
		$('#modal-text-header').text('Antwortoptionen anlegen')
		$('#new-question-text').text(new_text);	
		
	},

	onSaveNewQuestion = function(e){		
		var new_answer_options = [];
		var url = '/eval/save-new-question';
		$.post(url, {data: new_question}, function( data ){	
				
			var question_id = data.questionID;
			$('.table-answer-options').find('.input-new-answer-option-text').each(function(i, obj) {
    			
    			var answer_option_text = $(obj).val();
    			var answer_option = {
    				text: answer_option_text,
    				question_id: question_id
    			} 
    			
    			new_answer_options.push(answer_option);
			});
			var url = '/eval/save-new-answer-options'
			$.post(url, {data: new_answer_options}, function( data ){
				getPageContent('/eval/questions');
			});

			
		});
		$("#modal-new-question").hide('modal');	
	},

	onDeleteQuestion = function(e, element){
		var question_id = $(element).data('question-id');		
		var url = '/eval/delete-question';
		$.post(url, {id: question_id}, function( data ){							
			$('#question-row-'+ question_id).fadeOut().delay(800).queue(function(){
				$(this).remove();
			});
		});
	},

	onDeleteAnswer = function(e, element){
		

		var answer_id = $(element).prev().data('answer-id');		
		$(this).parent().remove();		
		
		var url = '/eval/delete-answer';
		$.post(url, {id: answer_id}, function( data ){							
	
		});
	},

	onClickMenuItem = function(item){
		$(".menu-active-main-color").removeClass("menu-active-main-color");
    	$(item).addClass("menu-active-main-color");
    	
    	var url = /eval/ + $(item).data('url'); 
    	getPageContent(url);
    		
	},

	onLoadCharts = function(){
 	var url = '/eval/get-chart-data';
 	var y = [];

	$.post(url, function(result){

	result.forEach(function(value){
		var trip = value.trip;
		var trip_id = trip.id		
		
		trip.questions.forEach(function(value){
			var question = value;
			var question_id = question.id;
			var chart = $('#chart-'+trip_id+"-"+question_id);
			var labels = [].concat.apply([], question.answers);		
			var question_type = question.type;
			var url = '/eval/get-question-score';			
			var backgroundColor = new Array("#2ecc71",
    										 "#3498db",
    										 "#95a5a6",
    										 "#9b59b6",
    										 "#f1c40f",
    										 "#e74c3c",
    										 "#ab82ff",
    										 "#f1f181");

			$.post(url, {trip_id: trip_id, question_id: question_id}, function(answers){
				
				if(answers.length == 0) return;
					displayCommonInfo(trip_id, question_id);				
				if(question_type == 0){
				var text_labels = $.map(labels, function (label) {												               
                                                    return label.text;                                                                                                  
                                                });			
				var data = {
						labels: text_labels,
						datasets: [{
							data: [],							
							backgroundColor:backgroundColor
					}]
				}

				labels.forEach(function(label){					
					var answer_id = label.answer_id;
					var count = $.grep(answers, function (answer) {												               
                                                    return answer.answer_id == answer_id;                                                                                                  
                                                });		
					data.datasets[0].data.push(count.length);
				 });
				createNewPieChart(chart, data);

				} else if(question_type == 1){								
					labels.forEach(function(label){
						var answer_id = label.answer_id;
						var data = $.grep(answers, function (answer) {              
                                                     return answer.answer_id == answer_id;                                                                                                  
                                                  });
						
						createNewStarRating(chart, label, data, trip_id, question_id, label.id);						
					});					
				} else if(question_type == 3){									
					createNewTextChart(chart, answers);
				}
				
			});
			
		});

	});
	});	

	},

	setAll = function(a, v) {
   	var i, n = a.length;
    	for (i = 0; i < n; ++i) {
    	    a[i] = v;
    	}
	},
	

	createNewTextChart = function(element, data){		
		$.each(data, function(index, item) {
			var text = data[index].text;
			var tr = '<p><i>'+text+'</i></p></br>';
			$(element).append(tr);
		});
	},

	createNewStarRating = function(element, label, data, trip_id, question_id, index){					
			var avg = calcAvgStarRating(data);
			var tr = '<tr>';
			var text = label.text;
			var header = '<td><label for="rating-'+trip_id + "-"+question_id+ "-"+ index +'" class="control-label label-score-star-rating">'+ text +'</label></td>';
			var rating = '<td><input class="rating-loading" id="rating-'+trip_id + "-"+question_id+ "-"+ index +'" value="'+ avg +'"></input></td>';
			var info = '<td><p class="score-avg-info">'+ avg.toFixed(1) +' / 5<p></td>'
			tr = tr+header+rating+info+'</tr>';			
			$(element).append(tr);		
			$("#rating-"+trip_id+"-"+question_id+ "-"+ index).rating({displayOnly: true, size: 'sm', step: 0.5});
	
			/*var color = getColor(avg.toFixed(1), 0, 5);
			var tag = $(info).find("p.score-avg-info").eq(0);			
			$(tag).css("color", color);*/							
	},

	calcAvgStarRating = function(array){
		var sum = 0; 
		for (var index in array){
			var value = array[index].value;
			sum += value;
		}		
		return sum/array.length;

	},

	getColor = function(value, min, max) {	
   	 	var hue=((max-(value-min))*120).toString(10);
   	 	console.log(["hsl(",hue,",100%,50%)"].join(""))
    	return ["hsl(",hue,",100%,50%)"].join("");
	}


	createNewPieChart = function(element, data){
	var ctx = $(element);
	var chart = new Chart(ctx, {type:'doughnut',
								  data: data,
								  options:
								  { legend: {
								   				display: false								  				
								  			},
								  	legendCallback: function(chart){								  						
								  		                var text = []
								  		                 text.push('<div class="legend-list">');
               											 text.push('<ul">');               											
               											 for (var i=0; i<chart.data.datasets[0].data.length; i++) {
               											     text.push('<li>');               											                											    
               											     text.push('<div class="legend-square" style="background-color:' + chart.data.datasets[0].backgroundColor[i] + '">' + chart.data.datasets[0].data[i] + '</div>');
               											     if (chart.data.labels[i]) {
               											         text.push(chart.data.labels[i]);
               											     }
               											     text.push('</li>');
               											 }
               											 text.push('</ul>');
               											 text.push('</div>');               											 
               											 return text.join("");
								  }

								  	}
								  	
								  
							});	
	var legend = chart.generateLegend();	
	$(legend).insertAfter($(element).parent());
	},

	createLegend = function(chart){
		var text = [];
        text.push('<ul>');
        for (var i=0; i<chart.data.datasets[0].data.length; i++) {
            text.push('<li>');
            text.push('<span style="background-color:' + chart.data.datasets[0].backgroundColor[i] + '">' + chart.data.datasets[0].data[i] + '</span>');
            if (chart.data.labels[i]) {
                text.push(chart.data.labels[i]);
            }
            text.push('</li>');
        }
        text.push('</ul>');
        return text.join("");
	},

	displayCommonInfo = function(trip_id, question_id){
		getAvgTimeForQuestion(trip_id, question_id, function(time){
			var currentVal = $('#info-avg-time').text();
			var newVal = parseFloat(time) + parseFloat(currentVal);
			newVal = newVal.toFixed(2);
			$('#info-avg-time').text(newVal);
		});

		getSumParticipants(trip_id, function(sum){			
			$('#info-sum-participants').text(sum);
		})
		
		getSumParticipantsFinish(trip_id, function(sum){			
			$('#info-sum-participants-finish').text(sum);
		})

		getSumParticipantsCancel(trip_id, function(sum){			
			$('#info-sum-participants-cancel').text(sum);
		})
	},

	getSumParticipantsFinish = function(trip_id, callback){		
		var url = '/eval/get-sum-participants-finish';
		$.post(url, {trip_id: trip_id}, function( data ){			
			callback(data[0].sum);
		});
	},

	getSumParticipantsCancel = function(trip_id, callback){
		var url = '/eval/get-sum-participants-cancel';
		$.post(url, {trip_id: trip_id}, function( data ){			
			callback(data[0].sum);
		});
	},

	getSumParticipants = function(trip_id, callback){
		var url = '/eval/get-sum-participants';
		$.post(url, {trip_id: trip_id}, function( data ){			
			callback(data[0].sum);
		});
	},

	getAvgTimeForQuestion = function(trip_id, question_id, callback){
		var url = '/eval/get-avg-question';
		$.post(url, {trip_id: trip_id, question_id: question_id}, function( data ){			
			callback(data[0].avg.toFixed(2));
		});
	},

	getTravelCategories = function(callback){
		var url = "/eval/get-categories";		
		$.get(url, function( data ){
			travelCategories = data;
			callback();
		});
	},

	loadTravelCategoriesInModal = function(){
		for(var category in travelCategories){				
			$('<option />', {value: travelCategories[category].id, text: travelCategories[category].type}).appendTo($('#new-trip-type'));
		}	
	},

	onClickDetailQuestion = function(e, element){
			e.preventDefault();
			$("#modal-detail-question").modal('show');			
			var question_id = $(element).data('question-id');		
			var url = '/eval/detail-questions';

			$.post(url, {id: question_id}, function( data ){
				$('#modal-body-detail-question').append(data);
				onReceiveAnswers();
			});
	},

	onReceiveAnswers = function(){
		var forms = $("#container-question-id-details").children('.form-inline');	
		$.each(forms, function(index, element){
			var text = $(element).find("#detail-answer-text").val();			
			old_answer_values.push(text);
		});		
	};


	that.init = init;	
	return that;
}());