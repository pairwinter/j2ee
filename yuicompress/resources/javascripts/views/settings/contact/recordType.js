(function(view){
    var colors = ['#6D1523', '#5B3795', '#739CC6', '#E48524', '#7B732E', '#127F4A', '#173B66', '#8A79B7', '#AD212A', '#E7B48D', '#0D4726', '#B1A665', '#21578E', '#DD6171', '#723F1B', '#8AC5A5', '#2B1948', '#565021'];
    var records = 0;
    
    function changeColorPickerAttach(index){
        index = index % colors.length;// mod calculator
        $('#colorPickerAttach').css('background-color',colors[index]);
        $('#fillColor').val(colors[index]);
    }
    
	if(!view.settings.contact)
		view.settings.contact = {};
	view.settings.contact.recordType = function(){};
	view.settings.contact.recordType.initRecordTypePage = function() {
        records = parseInt($('#records').val());
        changeColorPickerAttach(records);
        
		var adding = false;
		var addValidater = EB_Common.validation.validate("addRecordTypeForm",{
			rules: {
				name:{
					remote: {
							url : EB_Common.Ajax.wrapperUrl("/settings/contact/checkRecordTypeName"),
                            type: "post"
                    }
					}
			},
			messages: {
				name:{remote:i18n['setting.error.recordType.duplicatedName']}
    		},
    		submitHandler:function(){
    			if(adding)
    				return;
    			adding = true;
    			EB_Common.Ajax.post("/settings/contact/recordType",
					{
						name : $("#name").val(),
    					fillColor:$("#fillColor").val()
					},
					function(data) {
						var str = '<tr><td id = "'+ data.id +'">'
						        + '</td><td><input type="text"  name="colorPickerAttach" class="colorpicker-source" style="background-color:' + data.fillColor + '" readonly=""/>'
								+ '<input type="hidden" originalValue="' + data.fillColor + '" value="' + data.fillColor + '" name="colorPicker" />'
                                + '</td><td><a class="icn_edit_16" href="javascript:void(0);" title="'+i18n['button.edit']+'" onclick="EB_View.settings.contact.recordType.update(this);"></a>'
								+ '<a class="icn_trash_16" href="javascript:void(0);" title="'+i18n['button.delete']+'" onclick="EB_View.settings.contact.recordType.deleteType(this);"></a></td></tr>';
						var strEl = $(str).appendTo("#typeBody");
						$('#'+data.id).text(data.name);
						$("#name").val("");
						$("#name").removeData("previousValue");
						adding = false;
                        
                        records ++;
						changeColorPickerAttach(records);
                        //reset Leave Page State
                        EB_Common.LeavePage.resetState();
					}
				);
			}
		});
		
		EB_Common.validation.validate("updateRecordTypeForm",{
    		submitHandler:function(form){
    			var newName = $("#newName").val();
    			var tr = $("#newName").closest('tr');
    			var td1 = tr.find("td").eq(0);
    			EB_Common.Ajax.put("/settings/contact/recordType",
    				{
    					id : td1.attr("id"),
    					name : newName,
    					fillColor:tr.find("input[name='colorPicker']").val()
    				},
    				function(data) {
    					if (data == '-1') {
							EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
							return;
						}
    					
						td1.text(newName);
						var td2 = tr.find("td").eq(2);
						td2.text("");
						td2.append($('<a class="icn_edit_16" href="javascript:void(0);" title="'+i18n['button.edit']+'" onclick="EB_View.settings.contact.recordType.update(this);"></a>'));
						if(amount == 2)
							td2.append($('<a class="icn_trash_16" href="javascript:void(0);" title="'+i18n['button.delete']+'" onclick="EB_View.settings.contact.recordType.deleteType(this);"></a>'));
						
						var colorPicker = tr.find("td").eq(1).find('input[name="colorPicker"]');
						colorPicker.attr('originalValue',colorPicker.val());
						tr.find("td").eq(1).find('input[name="colorPickerAttach"]').attr('color',colorPicker.val()).colorpicker('destroy');
						var errorInput = $('input.error');
						if(errorInput && errorInput.length > 0 ){
							errorInput.removeData("previousValue").valid();
						}
						flag = true;
                        
                        //reset Leave Page State
                        EB_Common.LeavePage.resetState();
    				});
			}
		});
		
		$("#addRow").click(function(){
			return false;
		});
		
		$("#add").click(function() {
			$('#addRecordTypeForm').submit();
		});
		
		$('#colorPickerAttach').colorpicker({
		    defaultColor : '#881133',
			success : function(value){
				$('#colorPickerAttach').css('background-color', value);
				$('#fillColor').val(value);
			}
		});
	};
	
	var amount;
	var flag = true;
	var oldName;
	view.settings.contact.recordType.updateName = function(obj) {
		$('#updateRecordTypeForm').submit();
	};

	view.settings.contact.recordType.cancleUpdate = function(obj) {
		var tr = $(obj).closest('tr');
		var td1 = tr.find("td").eq(0);
		td1.text(oldName);
		var td2 = tr.find("td").eq(2);
		td2.text("");
		td2.append($('<a class="icn_edit_16" href="javascript:void(0);" title="'+i18n['button.edit']+'" onclick="EB_View.settings.contact.recordType.update(this);"></a>'));
		if(amount == 2)
			td2.append($('<a class="icn_trash_16" href="javascript:void(0);" title="'+i18n['button.delete']+'" onclick="EB_View.settings.contact.recordType.deleteType(this);"></a>'));
		
		var colorPickerAttach = tr.find("td").eq(1).find('input[name="colorPickerAttach"]'),
    		colorPicker = tr.find("td").eq(1).find('input[name="colorPicker"]');
    	
    	colorPickerAttach.css('background-color',colorPicker.attr('originalValue'));
    	colorPicker.val(colorPicker.attr('originalValue'));	
		colorPickerAttach.colorpicker('destroy');
		flag = true;
        
        //reset Leave Page State
        EB_Common.LeavePage.resetState();
	};

	view.settings.contact.recordType.update = function(obj) {
		if (flag == false)
			return;
		var tr = $(obj).closest('tr');
		var td1 = tr.find("td").eq(0);
		oldName = td1.text();
		td1.text("");
		td1.append($('<input type="text" class="width_percent94 {required:true}" maxlength="50" name="name" id="newName" pos="bottom">'));
		$("#newName").val(oldName);
		var td2 = tr.find("td").eq(2);
		amount = td2.find('a').length;
		td2.text("");
		td2.append($('<a href="javascript:void(0);" class="icn_save_16" title="'+i18n['button.save']+'" onclick="EB_View.settings.contact.recordType.updateName(this);"></a>'));
		td2.append($('<a href="javascript:void(0);" class="icn_cancel_16" title="'+i18n['button.cancel']+'" onclick="EB_View.settings.contact.recordType.cancleUpdate(this);"></a>'));
		$("#newName").rules("remove","remote");
    	$("#newName").rules("add", {
    		remote: {
    			url:EB_Common.Ajax.wrapperUrl("/settings/contact/checkRecordTypeName"),
                type: "post",
                data:{
    				id: function() {
    		            return td1.attr("id");
    				}
    			}
    		},
    		messages: {
    			remote:i18n['setting.error.recordType.duplicatedName']
    		}
    	});
    	
    	var colorPickerAttach = tr.find("td").eq(1).find('input[name="colorPickerAttach"]'),
    		colorPicker = tr.find("td").eq(1).find('input[name="colorPicker"]');
    	colorPickerAttach.colorpicker({
    		defaultColor : '#881133',
			success : function(value){
				colorPickerAttach.css('background-color', value);
				colorPicker.val(value);
			}
    	});
		flag = false;
	};

	view.settings.contact.recordType.deleteType = function(obj) {
		var tr = $(obj).closest('tr');
		var id = tr.find("td").eq(0).attr("id");
		EB_Common.dialog.confirm(i18n['setting.delete.recordType'], i18n['global.dialog.title.confirm'], function() {
			$(this).dialog("close");
			EB_Common.Ajax.remove("/settings/contact/recordType", {
				id : id
			}, function(data) {
				if (data == '-1') {
					EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
					return;
				}
				if(data == '-2'){
					EB_Common.dialog.alert(i18n['setting.error.recordType.inUse'],i18n['dialog.title.warning']);
					return;
				}
				
				var errorInput = $('input.error');
				if(errorInput && errorInput.length > 0 ){
					errorInput.removeData("previousValue").valid();
				}
				tr.remove();
                
                records --;
                changeColorPickerAttach(records);
			});
		}, function() {
			return;
		});
	};

})(EB_View);