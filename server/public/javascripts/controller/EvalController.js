FeedbackSystem.EvalController = (function() {
	var that = {},
	EvalView = null,
	travelCategories = null,
	edit_trip = false,
	edit_user = false,
	answer_option_counter = 0,
	new_question = null,
	old_answer_values = [],
	question_types = ['Multiple-Choice', 'Bewertungsskala', '', 'Freitext'],
	user_name = "",
	labels_age_group = ["< 20", "20-29", "30-39", "40-49", "50-59", "60-69", "> 69"],
	labels_exp = ["sehr wenig", "wenig", "durchschnittlich", "gut", "sehr gut"],
	questionnaire_type = ["Standard", "Surveytainment", "Hybrid-Version"];
	
	init = function() {				
	 console.log("EvalController init");
	 EvalView = FeedbackSystem.EvalView;
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

		if(url == '/eval/score'){
			EvalView.clearDashboard();
			EvalView.addLoadingGif();			
		}

		$.get(url, function( data ){
											
    		$('#dashboard-content').empty();
    		$('#dashboard-content').append(data);

    		switch(url){
    			case('/eval/trip'):{	    				
    				$(document).ready(function(){	
    					$('#table-trips > tbody  > tr').each(function(index, element) {
    						parseTravelType(element);
    						formatDate(element);    					
    					}); 

    					$(".btn-trip-active").bootstrapSwitch({size: 'mini',
    												onColor: 'success',
    												offColor: 'danger',
    												onSwitchChange: function(){
    													onChangeTripStatus(this);
    												}});
    					});	
    					

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
    				$('#loading-gif').remove();
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
    				break;
    			} 
    			case('/eval/users'):{
    				$.post( "/eval/user_name/", function( data ) {
  						user_name = data.name;  						
    					$('#table-users > tbody > tr').each(function(index, element) {
    						var name = $(element).find('td').eq(0).text();
    						var buttons = $(element).find('td').eq(2);    						
    						if(name == user_name) {
    							var password_field = $(element).find('td').eq(1);
    							EvalView.addEyeGlyphiconPassword(password_field);
    							$(buttons).find('a').removeClass('not-active').removeAttr('disabled');
    							addPasswordListener(password_field);    							
    						}
    						
    					});
					});
				break;
					
    			}  			
    		}

    		
    	});
	},

	onShowPassword = function(field){
		var type = $(field).find('input').prop("type");
    	if(type == 'password'){
    		EvalView.closeEyeGlyph();    		
    		$.post("/eval/password/", function( data ) {    									
    			$(field).find('input').val(data.pw);
    			$(field).find('input').prop("type", "text");					
    		});
    	} else {
    		EvalView.openEyeGlyph();    		
    		$(field).find('input').val("1234567890");
    		$(field).find('input').prop("type", "password");
    	}
	},

	addPasswordListener = function(field){
		$(".glyphicon-eye").on('click', function(){
    		onShowPassword(field);
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
        	answer_option_counter -= 1;
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


		$('#dashboard-content').on('hidden.bs.modal', "#modal-detail-question", function( e ){			
			onModalAnswerClose(e, this);						
		});

		$('#dashboard-content').on('click', ".btn-add-row-answer-option-detail", function( e ){			
			onAddRowAnswerOptionDetail(e);						
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

       	$('#dashboard-content').on("mouseover",'.tooltip-eval', function () {
       	   var tooltip = $(this).data('tooltip');
           EvalView.initTooltip(this, tooltip);
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
		if($(".panel-assignment").length === 0){
			EvalView.showNoInactiveTripMsg();			
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
				$("#modal-new-users").hide('modal');
				getPageContent('/eval/users');						
			});
		} else {			
			var url = '/eval/save-new-user';
			$.post(url, {mail: new_mail, password: new_password}, function( data ){
				$("#modal-new-users").hide('modal');
				getPageContent('/eval/users');						
			});
		}
		edit_user = false;
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
	},
	

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
        if (!$(element).hasClass('selected')) {
        	EvalView.checkListItem(element);           
        } else {
        	EvalView.uncheckListItem(element);
            
        }
	},

	onArrowLeftRightClick = function(element){
		var actives = '', url = '';
		trip_id = $(element).data('trip-id');
        if ($(element).hasClass('move-left')) {                	
            actives = $('.list-right ul li.active');
            actives.appendTo($('.list-left ul.'+trip_id));
            actives.addClass('trip-'+trip_id);
            url = '/eval/add-question-set';                 
              
        } else if ($(element).hasClass('move-right')) {                	
                actives = $('.list-left ul li.active');
                var actives_count = actives.length;
            	var count = $('li.trip-'+trip_id).length;
            	if (count > actives_count){
                	actives.appendTo($('.list-right ul.'+trip_id));
                	actives.removeClass('trip-'+trip_id);
                	url = '/eval/remove-question-set';
    			}                  
        }
        
        if(url){        	
        	for (var i = 0; i<actives.length;i++){
           		var $item = $(actives[i]);                    	
           		var trip_id = $item.data('trip-id');
           		var question_id =  $item.data('question-id');
           		var question_version =  $item.data('question-version');           		    	                    	
	    		$.post(url, {trip_id: trip_id, question_id: question_id, question_version: question_version}, function( data ){
					
				});
				$(actives[i]).removeClass('active');	
         	}
       	}
	},

	onArrowUpDownClick = function(element){
		
		var url = '';
        if ($(element).hasClass('move-up')) {  
           EvalView.moveListItemUp();
        } else if ($(element).hasClass('move-down')) {
           EvalView.moveListItemDown();                      
        }

        var trip_id = $(element).data('trip-id');     
        var question_entries = $('.list-left ul li.trip-'+trip_id);
        
        for (var i = 0; i<question_entries.length;i++){
        	
        	var question = $(question_entries[i]);
        	var question_id = $(question).data('question-id');
        	var position = i+1;
        	var url = '/eval/change-order-question-set';
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
		
		var url = '/eval/update-active-trip';
		$.post(url, {trip_id: trip_id, flag_active: active_state}, function( data ){
			
		});

	},

	onModalNewQuestion = function(){
		$("#modal-new-question").modal('show');
	},

	onModalTripShow = function(){
		$("#modal-new-trip").modal('show');
		loadTravelCategoriesInModal();
		EvalView.initDatePicker();
	},

	onModalEditQuestion = function(e, item){
		var question_id = $(item).data('question-id');		
		var $row = $('#question-row-' + question_id);	
		var old_question_name = $($row.children()[1]).text();
		var old_type = $($row.children()[2]).text();		
		var old_type_index = question_types.indexOf(old_type);		

		$("#modal-edit-question").modal('show');

		$('#edit-question-id').val(question_id);
		$('#edit-question-text').val(old_question_name);
		$('#edit-question-type').val(old_type_index);
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
			};
			var url = "";
			
			if ($(element).find("#detail-answer-text").data('answer-id')){
				if($.inArray(new_text, old_answer_values) == -1){
					answer_id = $(element).find("#detail-answer-text").data('answer-id');
					url = '/eval/update-answer';
					$.post(url, {data: answer, id: answer_id, question_id: question_id}, function( data ){			
						
					});
				}
			} else {					
				var answer_option = {
	    			text: new_text,
	    			question_id: question_id
	    		}; 
	    		new_answer_options.push(answer_option);					
			}
		
		});	
		
		if (new_answer_options.length > 0){			
			url = '/eval/save-new-answer-options';
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
		};
		
		var url = '/eval/update-question';
		$.post(url, {data: question, id: question_id}, function( data ){
			getPageContent('/eval/questions');
		});

		$("#modal-edit-question").hide('modal');
	},

	onEditTrip = function(e, item){		
		var trip_id = $(item).data('trip-id');
		var $row = $('#trip-row-' + trip_id);	
		var old_trip_name = $($row.children()[0]).text();
		var old_trip_date = $($row.children()[1]).text();
		var old_trip_type = $($row.children()[2]).text();
		var old_trip_count = $($row.children()[3]).text();
		var old_trip_password = $($row.children()[4]).text();
		
		$("#modal-new-trip").modal('show');
		loadTravelCategoriesInModal();
		EvalView.initDatePicker();
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
		var new_trip = {
			name: new_name,
			date_start: new_date,
			type: new_type,
			count_travellers: new_traveller_count,
			password: new_password
		};
		
		EvalView.addLoadingGif();
		if(edit_trip){
			var url = '/eval/update-trip';
			$.post(url, {data: new_trip, id: trip_id}, function( data ){
				getPageContent('/eval/trip');
			});
		} else {
			var url = '/eval/save-new-trip';
			$.post(url, {data: new_trip}, function( data ){
				getPageContent('/eval/trip');
			});
		}
		edit_trip = false;
			$("#modal-new-trip").hide('modal');
				
	},

	convertToDate = function (selector) {
    	var from = $(selector).val().split(".");    	
    	var jsDate = new Date(from[2], from[1]-1, parseInt(from[0])+1); 
    	return jsDate.toISOString().slice(0, 19).replace('T', ' ');
	},

	onAddRowAnswerOption = function(e){	
		EvalView.addRowAnswerOption(answer_option_counter);       
        answer_option_counter++;
	},

	onAddRowAnswerOptionDetail = function(e){
		EvalView.addRowAnswerOptionDetail();
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
		var new_text = $('#new-question-text').val();
		var new_type = $('#new-question-type').val();		
		new_question = {
				text: new_text,
				type: new_type,				
		};
		EvalView.modalRemoveQuestionContent();
		EvalView.modalChangeTextAnswerHeader(new_text);	
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
    			};     			
    			new_answer_options.push(answer_option);
			});
			var url = '/eval/save-new-answer-options';
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
			EvalView.removeQuestionRow(question_id, this);			
		});
	},

	onDeleteAnswer = function(e, element){
		var answer_id = $(element).prev().data('answer-id');		
		var url = '/eval/delete-answer';
		var count = $("#container-question-id-details").children('.form-inline').length;
		if(count > 1){
			$.post(url, {id: answer_id}, function( data ){
				EvalView.removeAnswerRow(element);				
			});			
		}							
	},

	onClickMenuItem = function(item){
		EvalView.changeActiveStyleMenuItem(item);		    	
    	var url = /eval/ + $(item).data('url'); 
    	getPageContent(url);    		
	},

	onLoadCharts = function(){
 	var url = '/eval/get-chart-data';
 	$.post(url, function(result){
		result.forEach(function(value){
			var trip = value.trip;
			var trip_id = trip.id;		
			var q_type = trip.type_questionnaire;		
			var count_questions = trip.questions.length;
			displayQType(trip_id, q_type);
			createDemografInfo(trip_id);
			displayCommonInfo(trip_id, count_questions);
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
					var length = answers.length;
					if(length > 0){			
						if(question_type === 0){
							var text_labels = $.map(labels, function (label) {												               
                	    	                                return label.text;                                                                                                  
                	        	                        });			
							var data = {
								labels: text_labels,
								datasets: [{
									data: [],							
									backgroundColor:backgroundColor
								}]
							};
	
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
					} else {
						EvalView.hideNoResponseContainer(trip_id, question_id);					
					}

				});
			
		});

		});
	});	

	},

	createNewTextChart = function(element, data){
		var count = 0;		
		$.each(data, function(index, item) {
			var text = data[index].text;
			if(!isBlank(text) && !isEmpty(text)){
				count++;
				var tr = '<p><i>('+count+') '+text+'</i></p></br>';
				$(element).append(tr);				
			}
		});
	},

	isBlank = function(str) {
   		return (!str || /^\s*$/.test(str));
	},

	isEmpty = function(str) {
    	return (!str || 0 === str.length);
	},

	createNewStarRating = function(element, label, data, trip_id, question_id, index){			
			var avg = calcAvgStarRating(data);			
			var text = label.text;
			EvalView.createStarTR(element, avg, text, trip_id, question_id, index);			
	},

	createNewBarChart = function(element, data, options){
			var ctx = $(element);			
			var chart = new Chart(ctx, {type: 'bar', data: data, options: options});
			chart.generateLegend();								  
	},

	createDemografInfo = function(trip_id){
		var backgroundColor = new Array("#2ecc71",
    										 "#3498db",
    										 "#95a5a6",
    										 "#9b59b6",
    										 "#f1c40f",
    										 "#e74c3c",
    										 "#ab82ff",
    										 "#f1f181");
		var options = {
				legend:{
					display: false
				},
				scales: {
    					xAxes: [{ gridLines: {
    					                display:false
    					            }}],
    					yAxes: [{ gridLines: {
    					                display:false
    					            }}]
    					}
						
		};
		createAgeChart(trip_id, backgroundColor, options);
		createExpChart(trip_id, backgroundColor, options);
	},

	createAgeChart = function(trip_id, color, options){
		var chart = $('#age-dem-container-'+trip_id);
		getAgeParticipants(trip_id, function(result){
			var sum_data = [0, 0, 0, 0, 0, 0, 0];
			$.each(result, function(index, object){
				sum_data[object.age_group] = object.value;			
				var data = {
    			labels: labels_age_group,
    			datasets: [
    			    {   
    			    	label: "Summe", 		       
    			        backgroundColor: color,
    			        data: sum_data
    			    }
    			]
				};
				createNewBarChart(chart, data, options);
			});
		});

		
	},

	createExpChart = function(trip_id, color, options){
		var chart = $('#exp-dem-container-'+trip_id);
		getExpParticipants(trip_id, function(result){
			var sum_data = [0, 0, 0, 0, 0, 0, 0];
			$.each(result, function(index, object){
				sum_data[object.experience] = object.value;			
				var data = {
    			labels: labels_exp,
    			datasets: [
    			    {   
    			    	label: "Summe", 		       
    			        backgroundColor: color,
    			        data: sum_data
    			    }
    			]
				};
				createNewBarChart(chart, data, options);
			});
		});
	},

	calcAvgStarRating = function(array){
		if(array.length > 0){
			var sum = 0; 
			for (var index in array){
				var value = array[index].value;
				sum += value;
			}		
			return sum/array.length;			
		}
		return 0;
	},

	createNewPieChart = function(element, data){
		var ctx = $(element);
		var chart = new Chart(ctx, {type:'doughnut',
									  data: data,
									  options:
									  { legend: {
									   				display: false								  				
									  			},
									  	legendCallback: function(chart){								  												  						
									  		                var text = EvalView.createCustomLegend(chart);	
    	           											return text.join("");
									  	}	
	
										}	  
								});	
		var legend = chart.generateLegend();	
		$(legend).insertAfter($(element).parent());
	},

	displayQType = function(trip_id, q_type){	
		$('#info-avg-qtype-'+trip_id).text(questionnaire_type[q_type]);
	},

	displayCommonInfo = function(trip_id, count_questions){
		getAvgTime(trip_id, function(time){
			var currentVal = $('#info-avg-time-'+trip_id).attr('data-seconds');
			var newVal = parseFloat(time) + parseFloat(currentVal);			
			newVal = newVal.toFixed(0) * count_questions;			

			$('#info-avg-time-'+trip_id).attr('data-seconds', newVal);
			$('#info-avg-time-'+trip_id).text(secondsToHms(newVal));
		});

		getSumParticipants(trip_id, function(sum){			
			$('#info-sum-participants-'+trip_id).text(sum);
		});
		
		getSumParticipantsFinish(trip_id, function(sum){			
			$('#info-sum-participants-finish-'+trip_id).text(sum);
		});

		getSumParticipantsCancel(trip_id, function(sum){			
			$('#info-sum-participants-cancel-'+trip_id).text(sum);
		});

		getGenderParticipants(trip_id, function(data){		
			$.each(data, function(index, object){
				var gender = object.gender;
				var value = object.value;
				if(gender == 'm'){
					$('#info-sum-male-'+trip_id).text(value);
				} else if(gender == 'f'){
					$('#info-sum-female-'+trip_id).text(value);
				} else {
					$('#info-sum-na-'+trip_id).text(value);
				}
			});
		});
	},

	secondsToHms = function(seconds) {    	
    	var h = Math.floor(seconds / 3600);
    	var m = Math.floor(seconds % 3600 / 60);
    	var s = Math.floor(seconds % 3600 % 60);
	
	    	var hDisplay = h > 0 ? h + (h == 1 ? " Stunde, " : " Stunden, ") : "";
	    	var mDisplay = m > 0 ? m + (m == 1 ? " Minute, " : " Minuten, ") : "";
	    	var sDisplay = s > 0 ? s + (s == 1 ? " Sekunde" : " Sekunden") : "";
    	return hDisplay + mDisplay + sDisplay; 
	},

	getSumParticipantsFinish = function(trip_id, callback){		
		var url = '/eval/get-sum-participants-finish';
		$.post(url, {trip_id: trip_id}, function( data ){
		if(!data[0]){ 
			callback(0);
			return;
		} else {
			callback(data[0].sum);
		}		
			
		});
	},

	getSumParticipantsCancel = function(trip_id, callback){
		var url = '/eval/get-sum-participants-cancel';
		$.post(url, {trip_id: trip_id}, function( data ){
			if(!data[0]){ 
			callback(0);
			return;
		} else {
			callback(data[0].sum);
		}		
		});
	},

	getSumParticipants = function(trip_id, callback){
		var url = '/eval/get-sum-participants';
		$.post(url, {trip_id: trip_id}, function( data ){
		if(!data[0]){ 
			callback(0);
			return;
		} else {
			callback(data[0].sum);
		}		
		});
	},

	getGenderParticipants = function(trip_id, callback){
		var url = '/eval/get-gender-participants';
		$.post(url, {trip_id: trip_id}, function( data ){			
			callback(data);
		});
	},

	getAgeParticipants = function(trip_id, callback){
		var url = '/eval/get-age-participants';
		$.post(url, {trip_id: trip_id}, function( data ){					
			callback(data);
		});
	},

	getExpParticipants = function(trip_id, callback){
		var url = '/eval/get-experience-participants';
		$.post(url, {trip_id: trip_id}, function( data ){					
			callback(data);
		});
	},

	getAvgTime = function(trip_id, callback){
		var url = '/eval/get-avg-question';
		$.post(url, {trip_id: trip_id}, function( data ){
		if(!data[0].avg){ 
			callback(0);
			return;
		} else {			
			callback(data[0].avg.toFixed(2));
		}	
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