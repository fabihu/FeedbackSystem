FeedbackSystem.EvalController = (function() {
	var that = {},
	travelCategories = null,
	edit = false,
	
	init = function() {				
	 console.log("EvalController init");
	 getPageContent('trip');				
	 getTravelCategories();
	 setClickListener();
	},


	getPageContent = function(url){
		$.get(url, function( data ){						
    		$('#dashboard-content').empty();
    		$('#dashboard-content').append(data);
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
		
					
		$('#dashboard-content').on('click', ".btn-detail", function( e ){
			onClickDetailQuestion(e, this);
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
		

		$('#dashboard-content').on('click', ".btn-modal-save", function( e ){
			onSaveNewTrip(e);						
		});
	},

	onModalTripShow = function(){
		$("#modal-new-trip").modal('show');
		loadTravelCategoriesInModal();
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
				var url = 'edit-trip'
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
			var isActive = $('#question-row-'+ question_id).data('detail-active');			
			var url = 'detail-questions';			
			if(!isActive){
				$('#question-row-'+ question_id).data('detail-active', !isActive);				
				$.post(url, {id: question_id}, function( data ){					
					$('#question-row-'+ question_id).after($(data).fadeIn(1000));
				});
			} else {	
				
				$('#question-details-'+ question_id).fadeOut().delay(500).queue(function(){
					$(this).remove();
				});
				$('#question-row-'+ question_id).data('detail-active', !isActive);
			}
	};


	that.init = init;	
	return that;
}());