(function(view) {
	var sspNameSpace = {};

    sspNameSpace.initSspOptions = function() {
      //init data
      EB_Common.Ajax.get('/settings/sspconfig/listSspOptions', {
			type : 'Notifications Portal Options',
			time : new Date()
		}, function(remoteData) {
			if(!remoteData || !remoteData.data) return;
			var data = remoteData.data,
				radioValue,shecked,
				newRecord;

			if (data.length >=2 &&(data[0].enabled || data[1].enabled)) {
				shecked = true;
			}else{
				return;
			}
			for (var i = 0, len = data.length; i < len; i++) {
				if(data[i].enabled == true){
					radioValue = data[i].itemName;
					newRecord = data[i].externalObject;
					break;
				}
			}
			if(shecked){
				$('#ssplink').show();
			}
			if(radioValue == 'Public Notifications Portal'){
				$('#publicType').show();
				$('#ssplink').show();
			}else{
				$('#publicType').hide();
			} 
			$('input[name="optionType"]').attr('checked', function(i,val){
				return $(this).val() == radioValue;
			});
		}, 'json');
      
			
      $('input[name="optionType"]').click(function(){
        var me = this;
        if($(me).val() == 'Public Notifications Portal'){
        	$('#publicType').show();
        }else{
        	$('#publicType').hide();
        }
      });
      
      $('#SSPOptionsSaveBtn').click(function(){
		var rowDatas = [],selected;
		$('input[name="optionType"]').each(function(index,element){
			var sspConfigItem = {};
			sspConfigItem.itemName = $(this).val();
			sspConfigItem.enabled = $(this).prop('checked');
			if($('#publicType')[0].style.display != 'none' && $(this).val() == 'Public Notifications Portal'){
				sspConfigItem.externalObject = $('#newRecord').val();
			}else{
			    sspConfigItem.externalObject = '';
			}
			rowDatas.push(sspConfigItem);
			if(!selected){
				selected = $(this).prop('checked');
			}
			});
		
		if (!selected) {
			EB_Common.dialog.alert(i18n['sspconfig.alert.sspoptions.selected']);
			return;
		}
		var json = EB_Common.json.stringify(rowDatas);
		EB_Common.Ajax.post("/settings/sspconfig/saveSSPOptions", {
			rs : json,
			type : 'Notifications Portal Options'
		}, function(data) {
			if (data.status != "yes") {
				EB_Common.ToolPrompt.show('SSPOptionsSaveBtn',i18n["'" + data.status + "'"]);
			} else {
                $("#ssplink").show();
				EB_Common.ToolPrompt.show('SSPOptionsSaveBtn',i18n['glocal.savesuccess']);
				EB_Common.LeavePage.resetState();
			}
		}, "json");
	
      });
      
    };
    
	view.ssp = sspNameSpace;

})(EB_View);