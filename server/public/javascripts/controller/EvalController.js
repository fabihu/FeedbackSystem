FeedbackSystem.EvalController = (function() {
	var that = {},
	travelCategories = null,
	edit = false,
	answer_option_counter = 0,
	new_question = null,
	
	init = function() {				
	 console.log("EvalController init");
	 getPageContent('questions');				
	 getTravelCategories();
	 setClickListener();



	},


	getPageContent = function(url){
		$.get(url, function( data ){						
    		$('#dashboard-content').empty();
    		$('#dashboard-content').append(data);
    		$(".btn-question-active").bootstrapSwitch({size: 'mini',
    													onColor: 'success',
    													offColor: 'danger',
    													onSwitchChange: function(){
    														onChangeQuestionStatus(this);
    													}});
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
		$('#dashboard-content').on('click', ".btn-detail", function( e ){
			onClickDetailQuestion(e, this);
			$(this).find('span').toggleClass('glyphicon glyphicon-chevron-down').toggleClass('glyphicon glyphicon-chevron-up');
		});
	
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
		$('#dashboard-content').on('click', ".btn-modal-edit-answer", function( e ){			
			onModalEditAnswer(e, this);						
		});

		$('#dashboard-content').on('click', ".btn-modal-save-edit-answer", function( e ){			
			onSaveEditAnswer(e, this);						
		});

		
		
	},

	onChangeQuestionStatus = function(element){		
		var question_id = $(element).data('question-id');
		var active_state;
		if ($(element).is(":checked")){
 			active_state = true; 			
		} else {
			active_state = false;
		}
		
		var url = 'change-active-question'
		$.post(url, {id: question_id, active: active_state}, function( data ){
			
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

	onSaveEditAnswer = function(e, item){
		e.preventDefault();		
		var question_id =  $('#edit-question-id').val();
		var answer_id = $('#edit-answer-id').val();
		var new_text = $('#edit-answer-text').val();

		var answer = {
			text: new_text			
		}
		
		var url = 'update-answer'
		$.post(url, {data: answer, id: answer_id, question_id: question_id}, function( data ){			
			$('#collapse-detail-question-' + question_id).empty();
    		$('#collapse-detail-question-' + question_id).append(data);
		});

		$("#modal-edit-answer").hide('modal');
	},

	onSaveEditQuestion = function(e){
		e.preventDefault();		
		var question_id = $('#edit-question-id').val();
		var new_text = $('#edit-question-text').val();
		var new_type = $('#edit-question-type').val();
		var question = {
			question: new_text,
			type: new_type
		}
		
		var url = 'update-question'
		$.post(url, {data: question, id: question_id}, function( data ){
			getPageContent('questions');
		});

		$("#modal-edit-question").hide('modal');
	},

	onEditTrip = function(e, item){
		
			var trip_id = $(item).data('trip-id')
			var $row = $('#trip-row-' + trip_id);	

			var old_trip_name = $($row.children()[1]).text();
			var old_trip_type = $($row.children()[2]).text();
			var old_trip_count = $($row.children()[4]).text();
			var old_trip_password = $($row.children()[5]).text();

			$("#modal-new-trip").modal('show');
			loadTravelCategoriesInModal();

			var result = travelCategories.filter(function( obj ) {				
  				return obj.id == old_trip_type;
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
				var url = 'update-trip'
				$.post(url, {data: new_trip, id: trip_id}, function( data ){
					getPageContent('trip');
				});

			} else {
				var url = 'save-new-trip'
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

	}

	onDeleteTrip = function(e, element){
		e.preventDefault();	
		var trip_id = $(element).data('trip-id');
		var url = 'delete-trip';
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
				question: new_text,
				type: new_type,				
		}
		

		$('#modal-content-question').remove();
		$('#modal-content-answer').removeClass('hidden');
		
		
		$('#modal-text-header').text('Antwortoptionen anlegen')
		$('#new-question-text').text(new_text);
		
		

		
		
	},

	onSaveNewQuestion = function(e){		
		var new_answer_options = [];
		var url = 'save-new-question';
		$.post(url, {data: new_question}, function( data ){	
			console.log(data.questionID);		
			var question_id = data.questionID;
			$('.table-answer-options').find('.input-new-answer-option-text').each(function(i, obj) {
    			
    			var answer_option_text = $(obj).val();
    			var answer_option = {
    				text: answer_option_text,
    				question_id: question_id
    			} 
    			
    			new_answer_options.push(answer_option);
			});
			var url = 'save-new-answer-options'
			$.post(url, {data: new_answer_options}, function( data ){
				getPageContent('questions');
			});

			
		});
		$("#modal-new-question").hide('modal');	
	},

	onDeleteQuestion = function(e, element){
		var question_id = $(element).data('question-id');
		console.log(question_id);
		var url = 'delete-question';
		$.post(url, {id: question_id}, function( data ){							
			$('#question-row-'+ question_id).fadeOut().delay(800).queue(function(){
				$(this).remove();
			});
		});
	},

	onClickMenuItem = function(item){
		$(".menu-active-main-color").removeClass("menu-active-main-color");
    	$(item).addClass("menu-active-main-color");
    	
    	var url = $(item).data('url'); 
    	getPageContent(url);
    		
	},

	getTravelCategories = function(){
		var url = "get-categories";
		$.get(url, function( data ){
			travelCategories = data;
		});
	},

	loadTravelCategoriesInModal = function(){
		for(var category in travelCategories){				
			$('<option />', {value: travelCategories[category].id, text: travelCategories[category].type}).appendTo($('#new-trip-type'));
		}	
	},

	onClickDetailQuestion = function(e, element){
			e.preventDefault();			
			var question_id = $(element).data('question-id');
			var isLoaded = $(element).data('detail-loaded');			
			var url = 'detail-questions';
					
			if(!isLoaded){
				$.post(url, {id: question_id}, function( data ){					
					$('#collapse-detail-question-'+ question_id).append(data);
					$(element).data('detail-loaded', true);
				});
			} 	
			
	};


	that.init = init;	
	return that;
}());