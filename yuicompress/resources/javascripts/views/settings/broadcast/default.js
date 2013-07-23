(function(view){
	view.settings = view.settings || {};
	view.settings.broadcast = view.settings.broadcast || {};
	view.settings.broadcast.defaultMsg = function(){};
	view.settings.broadcast.defaultMsg.initDefaultPage = function(url) {
	    EB_Common.validation.validate('broadcastDefaultForm',{
			rules :{
				defaultCycles:{
			      required: true,
			      digits: true,
			      min: 1,
			      less_equal: ['#maxCycles',i18n['setting.broadcast.cycles.default'],i18n['setting.broadcast.cycles.maximum']]
			    }
			},
			submitHandler:function(){
	            var queryString = $('#broadcastDefaultForm').formSerialize(); 
	            EB_Common.Ajax.put(url + "?" + queryString,{},
	            		function(data){ 
	            		EB_Common.ToolPrompt.show('formBut0',i18n['glocal.savesuccess']);
	            		
	            		//reset Leave Page State
                		EB_Common.LeavePage.resetState();
	            	});
			}
		});
		
	    $('input[name="confirmFlag"]').change(function(){
	    	var vms = $('input[value="MESSAGE_WITH_CONFIRMATION"]');
            var label = vms.next();
	    	if($(this).val() == 'true'){
	    		vms.attr('disabled',false);
                label.removeClass('disabletxt');
	    	}else{
	    		if(vms.is(':checked')){
	    			$('input[value="MESSAGE_ONLY"]').attr('checked',true);
	    		}
	    		vms.attr('disabled',true);
                label.addClass('disabletxt');
	    	}
	    });
	};
	
})(EB_View);