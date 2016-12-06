FeedbackSystem.EvalController = (function() {
	var that = {},
	travelCategories = null,
	edit = false,
	answer_option_counter = 0,
	new_question = null,
	old_answer_values = [],
	
	init = function() {				
	 console.log("EvalController init");
	 getTravelCategories(function(){
	 	getPageContent('/eval/trip');	 	
	 });
	 setClickListener();
	 onNavBarClick();
	},


	getPageContent = function(url){		
		$.get(url, function( data ){									
    		$('#dashboard-content').empty();
    		$('#dashboard-content').append(data);

    		switch(url){
    			case('/eval/trip'):{	    				
    			$(document).ready(function(){	
    				$('#table-trips > tbody  > tr').each(function(index) {    									
    					var field = $('#table-trips tr').eq(index+1).find('td').eq(1);
    					var value = $(field[0]).html();    					
    					var category = $.grep(travelCategories, function(e){ return e.id == value; });
    					$(field[0]).html(category[0].type);
    					
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
    			 onLoadCharts();
    			 break;
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
		 	getPageContent('trip');
		});

		$('#dashboard-content').on('click', ".btn-edit-trip", function( e ){
			edit = true;
			onEditTrip(e, this);		 	
		});

		$('#dashboard-content').on('click', ".btn-modal-cancel", function( e ){
			edit = false;				 	
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

	//check if works
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
			getPageContent('questions');
		});

		$("#modal-edit-question").hide('modal');
	},

	onEditTrip = function(e, item){
		
			var trip_id = $(item).data('trip-id')
			var $row = $('#trip-row-' + trip_id);	

			var old_trip_name = $($row.children()[0]).text();
			var old_trip_type = $($row.children()[1]).text();
			var old_trip_count = $($row.children()[2]).text();
			var old_trip_password = $($row.children()[3]).text();
			
			$("#modal-new-trip").modal('show');
			loadTravelCategoriesInModal();

			var result = travelCategories.filter(function( obj ) {				
  				return obj.type == old_trip_type;
			});					

			$('#new-trip-id').val(trip_id);
			$('#new-trip-name').val(old_trip_name);
			$('#new-trip-type').val(result[0].id);			
			$('#new-trip-count-travellers').val(parseInt(old_trip_count));
			$('#new-trip-password').val(old_trip_password);

	},

	onSaveNewTrip = function(e){
			var trip_id = $('#new-trip-id').val();
			var new_name = $('#new-trip-name').val();
			var new_type = $('#new-trip-type').val();
			var new_traveller_count = $('#new-trip-count-travellers').val();
			var new_password = $('#new-trip-password').val();

			var new_trip = {
				name: new_name,
				type: new_type,
				count_travellers: new_traveller_count,
				password: new_password
			}
			
			
			if(edit){
				var url = '/eval/update-trip'
				$.post(url, {data: new_trip, id: trip_id}, function( data ){
					getPageContent('trip');
				});

			} else {
				var url = '/eval/save-new-trip'
				$.post(url, {data: new_trip}, function( data ){
					getPageContent('trip');

				});
			}
			
			$("#modal-new-trip").hide('modal');
				
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
				getPageContent('questions');
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
	
	$('.chart').each(function(el){

		var element = this;		
		var trip_id = $(this).data('trip-id');
		var question_id = $(this).data('question-id');
		var url = '/eval/get-trip-score';
			
		$.post(url, {trip_id: trip_id, question_id: question_id}, function(res){
		var answerd_questions = res;		

		for(var index in result){
			var trip = result[index].trip;
			var res = $.grep(trip.questions, function(e){ return e[0].question_id == question_id; });					
			var question = res[0][0];
			var answers = [].concat.apply([], question.answers);			
			var data = {};			
			var x = {};

			data.labels = [];
			data.datasets = [];
			var set = {};	
			
			set.data = new Array(answers.length);			
			var backgroundColor = new Array("#2ecc71",
    										    "#3498db",
    										    "#95a5a6",
    										    "#9b59b6",
    										    "#f1c40f",
    										    "#e74c3c");
			setAll(set.data, 0);					
					
			x.question = question.question_id;
			x.answer_ids = new Array();
			for (var answer_index in answers){
					var answer = answers[answer_index];					
					data.labels.push(answer.text)
					x.answer_ids.push(answer.answer_id);			
			}
			y.push(x);

			if(question.type==0){
				for (var answer_index in answerd_questions){
					var user_answer = answerd_questions[answer_index];
					var count_index = -1;
					for (var j = 0; j<y.length;j++){							
						for (var i = 0; i<y[j].answer_ids.length;i++){
							
							if(user_answer.answer_id == y[j].answer_ids[i]){
								count_index = i;							
							}
						}					
					}
					++set.data[count_index];
					
				}				
				set.backgroundColor = backgroundColor
				data.datasets.push(set);				
				createNewPieChart(element, data);

			} else if(question.type==1){			
			
			var length_answerd_questions = answerd_questions.length / set.data.length;
			

			for (var answer_index in answerd_questions){				
				var user_answer = answerd_questions[answer_index];					
				var count_index = -1;
				
				for (var j = 0; j<y.length;j++){							
					for (var i = 0; i<y[j].answer_ids.length;i++){
						
						if(user_answer.answer_id == y[j].answer_ids[i]){
							count_index = i;

							set.data[count_index] += user_answer.value;																					
						}
					}					
				}			
					
			}
			
			set.data = $.map(set.data, function(n) {
  				return (n / length_answerd_questions);
			});
						

			data.datasets.push(set);				
			createNewStarRating(element, data, trip.id, question.question_id);
			} else if (question.type == 3){

			for (var answer_index in answerd_questions){
				var user_answer = answerd_questions[answer_index];
					data.datasets.push(user_answer.text);
				}	
							
			createNewTextChart(element, data);
			}
		}
		

			});

		displayCommonInfo(trip_id, question_id);
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
		$.each(data.datasets, function(index, item) {
			var text = data.datasets[index];
			var tr = '<p><i>'+text+'</i></p></br>';
			$(element).append(tr);
		});
	},

	createNewStarRating = function(element, data, trip_id, question_id){		
		
		for (var index in data.labels){		
			var avg = data.datasets[0].data[index];
			var tr = '<tr>';
			var text = data.labels[index];
			var header = '<td><label for="rating-'+trip_id + "-"+question_id+ "-"+ index +'" class="control-label label-score-star-rating">'+ text +'</label></td>';
			var rating = '<td><input class="rating-loading" id="rating-'+trip_id + "-"+question_id+ "-"+ index +'" value="'+ avg +'"></input></td>';
			var info = '<td><p class="score-avg-info">'+ avg.toFixed(1) +' / 5<p></td>'
			tr = tr+header+rating+info+'</tr>';			
			$(element).append(tr);		
			$("#rating-"+trip_id+"-"+question_id+ "-"+ index).rating({displayOnly: true, step: 0.5});	
		}			
		
	},

	calcAvgStarRating = function(array){
		var sum = 0; 
		for (var index in array){
			var value = array[index];
			sum += value;
		}		
		return sum/array.length;

	},


	createNewPieChart = function(element, data){
	
	var ctx = document.getElementById(element.id).getContext('2d');
	var myChart = new Chart(ctx, {type:'doughnut', data});

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