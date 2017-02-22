FeedbackSystem.EvalView = (function() {
	var that = {},	
		
	//Initalizing EvalView
	init = function() {		
		console.log("EvalView init");		
	},

	//clear complete dashboard
	clearDashboard = function(){
		$('#dashboard-content').empty();
	},

	//add loading gif at the end of dashboard
	addLoadingGif = function(){		
		var loading_gif = '<div id="loading-gif" class="col-md-6 col-md-offset-6"><img src="../images/loading_content.gif" class="div-loading"></img></div>';
		$('#dashboard-content').append(loading_gif);
	},

	//add eye glyphicon to possible visible field
	addEyeGlyphiconPassword = function(field){
		var eye_glyphicon = '<div class="glyphicon-eye"><span class="glyphicon glyphicon-eye-open"></span>';
    	$(field).append(eye_glyphicon);
	},

	//close eye glyph on click
	closeEyeGlyph = function(){
		$(".glyphicon-eye").find('span').removeClass("glyphicon-eye-open").addClass("glyphicon-eye-close");
	},

	//open eye glyph on click
	openEyeGlyph = function(){
		$(".glyphicon-eye").find('span').removeClass("glyphicon-eye-close").addClass("glyphicon-eye-open");
	},

	//initialize diffrent tooltip types
	initTooltip = function(selector, tooltip){
		var title = "";
		switch(tooltip){
			case('status'):{ title = 'Ein Fragebogen kann mittels des Status-Sliders für die jeweilige Reise aktiviert oder deaktiviert werden. Die einzelnen Fragen des Fragebogens können nur im deaktivierten Zustand bearbeitet werden.'; break;}
			case('qtype'):{title = 'Es ist möglich den Fragebogen in verschiedenen Versionen beantworten zu lassen. In der Hybrid-Version werden abwechselnd Surveytainment- bzw. Standard-Fragebögen an den Nutzer ausgeliefert.'; break;}
			case('question'):{title = '<b>Multiple-Choice:</b> Teilnehmer kann eine oder mehrere Antwortoptionen auswählen' +
									   '\n<b>Bewertungsskala:</b> Antwortoptionen der Frage werden auf einer Skala von "sehr gut" bis "sehr schlecht" beantwortet' +
									   '\n<b>Freitext:</b> Nutzer können Antworten in einem Freitextfeld beantworten'; break;}
			default: {title = 'Kein Tooltip gefunden!'; break;}
		}
		$(selector).tooltip({
					   animation: true,                       
                       container: selector,
                       placement: 'bottom',
                       html: true,
                       title: title 
        });  		
	},

	//show mesasge to user when all trips are inactive
	showNoInactiveTripMsg = function(){
		var text ="<div class='main-text font-large'>Keine inaktiven Reisen gefunden!</div>";
		$("#dashboard-content").append(text);
	},

	//check question item in questionnaires
	checkListItem = function(element){
		$(element).addClass('selected').closest('.well').find('ul li:not(.active)').addClass('active');
        $(element).children('i').removeClass('glyphicon-unchecked').addClass('glyphicon-check');
	},

	//uncheck question item in questionnaires
	uncheckListItem = function(element){
		$(element).removeClass('selected').closest('.well').find('ul li.active').removeClass('active');
        $(element).children('i').removeClass('glyphicon-check').addClass('glyphicon-unchecked');
	},

	//move question ranking up
	moveListItemUp = function(){
		$actives = $('.list-left ul li.active');
        $before = $actives.first().prev();
        $actives.insertBefore($before);
	},

	//move question ranking down
	moveListItemDown = function(){
		$actives = $('.list-left ul li.active'); 
        $next = $actives.last().next();                  
        $actives.insertAfter($next);     
	},

	//initialize date picker for date input
	initDatePicker = function(){
		$('.datepicker').datepicker({
			autoclose: true,
			calendarWeeks: true,
			format: 'dd.mm.yyyy',
			language: 'de-DE',
			todayHighlight: true
		});		
	},

	//add one answer row when adding new question
	addRowAnswerOption = function(counter){
		var newRow = $("<tr>");
        var cols = "";
        			  
        cols += '<td class="invis"><input type="text" class="form-control" name="input-new-answer-option-id-' + counter + '" disabled/></td>';
        cols += '<td><input type="text" class="form-control input-new-answer-option-text" name="input-new-answer-option-text-' + counter + '"/></td>'; 
        cols += '<td><input type="button" class="btn btn-md btn-danger btn-del-answer-row"  value="X"></td>';

        newRow.append(cols);        
        $(".table-answer-options").append(newRow);
	},

	//add one answer row when editing a question
	addRowAnswerOptionDetail = function(){
		var form = $("#container-question-id-details").children('.form-inline').last();
		var new_input = '<div class="form-inline margin-answer-detail"><input type="text" class="form-control custom-input-width new-input" id="detail-answer-text" value="Neue Antwortoptionen eingeben..."/>' +
						'<input type="button" class="btn btn-md btn-danger btn-del-answer" value="X"/></div>';	
		$(new_input).insertAfter(form);

		$('.new-input').focus(function(){						
		   $(this).data('value', $(this).attr('value')).attr('value','');
		}).blur(function(){
		  $('.new-input').attr('value' , "Neue Antwortoptionen eingeben...");
		});		
	},

	//change visiblity of answer input on new question
	modalRemoveQuestionContent = function(){
		$('#modal-content-question').remove();
		$('#modal-content-answer').removeClass('hidden');
	},

	//change heading of answer input on new question
	modalChangeTextAnswerHeader = function(text){
		$('#modal-text-header').text('Antwortoptionen anlegen');
		$('#new-question-text').text(text);	
	},

	//animation on question delete
	removeQuestionRow = function(id, element){
		$('#question-row-'+ id).fadeOut().delay(800).queue(function(){
			$(element).remove();
		});
	},

	//remove one answer row from input
	removeAnswerRow = function(element){
		$(element).parent().remove();
	},

	//change the style of an active menue item
	changeActiveStyleMenuItem = function(item){
		$(".menu-active-main-color").removeClass("menu-active-main-color");
    	$(item).addClass("menu-active-main-color");
	},

	//dont show score container that dont have a single response
	hideNoResponseContainer = function(trip_id, question_id){
		$('#container-question-'+trip_id+'-'+question_id).removeClass('in');
	},

	//custom table row for chart star rating in evaluation
	createStarTR = function(element, avg, text, trip_id, question_id, index){
		var tr = '<tr>';
		var header = '<td><label for="rating-'+trip_id + "-"+question_id+ "-"+ index +'" class="control-label label-score-star-rating">'+ text +'</label></td>';
		var rating = '<td ><input class="rating-loading" id="rating-'+trip_id + "-"+question_id+ "-"+ index +'" value="'+ avg +'"></input></td>';
		var info = '<td class="td-inline"><p class="score-avg-info">'+ avg.toFixed(1) +' / </p><p class="score-avg-info-weight">5</p></td>';
		tr = tr+header+rating+info+'</tr>';			
		$(element).append(tr);
		$("#rating-"+trip_id+"-"+question_id+ "-"+ index).rating({displayOnly: true, size: 'sm', step: 0.5});	
	},

	//customization of legend at ring diagram
	createCustomLegend = function(chart){
		var text = [];
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
		return text;
	};

	that.init = init;
	that.initTooltip = initTooltip;
	that.addLoadingGif = addLoadingGif;
	that.addEyeGlyphiconPassword = addEyeGlyphiconPassword;
	that.closeEyeGlyph = closeEyeGlyph;
	that.openEyeGlyph = openEyeGlyph;
	that.showNoInactiveTripMsg = showNoInactiveTripMsg;
	that.checkListItem = checkListItem;
	that.uncheckListItem = uncheckListItem;
	that.moveListItemUp = moveListItemUp;
	that.moveListItemDown = moveListItemDown;
	that.clearDashboard = clearDashboard;
	that.initDatePicker = initDatePicker;
	that.addRowAnswerOption = addRowAnswerOption;
	that.addRowAnswerOptionDetail = addRowAnswerOptionDetail;
	that.modalRemoveQuestionContent = modalRemoveQuestionContent;
	that.modalChangeTextAnswerHeader = modalChangeTextAnswerHeader;
	that.removeQuestionRow = removeQuestionRow;
	that.removeAnswerRow = removeAnswerRow;
	that.changeActiveStyleMenuItem = changeActiveStyleMenuItem;
	that.hideNoResponseContainer = hideNoResponseContainer;
	that.createStarTR = createStarTR;
	that.createCustomLegend = createCustomLegend;
	return that;
}());