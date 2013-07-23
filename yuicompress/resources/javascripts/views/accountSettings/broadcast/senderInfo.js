(function(view){
	if(!view.accountSettings.broadcast)
		view.accountSettings.broadcast ={};
	view.accountSettings.broadcast.senderInfo = function(){};
	view.accountSettings.broadcast.senderInfo.initPage = function() {
		$('#formBut0').click(function() {
            var queryString = $('#senderInfoForm').formSerialize(); 
            //console.log(queryString);
            EB_Common.Ajax.put("/account/settings/broadcast/senderInfo/permission?"+queryString,{},
            		function(data){ 
            		EB_Common.ToolPrompt.show('formBut0',i18n['glocal.savesuccess']);
            		
            		//reset Leave Page State
                	EB_Common.LeavePage.resetState();
            	});
		}); 
		
		$('#senderInfoBody input[name="isDefault"]').bind('click', setDefault);
		
		$("#addSenderInfo").click(function() {
			if(adding)
				return;
			if ($("#code,#callerId").valid() == false){
				return;
			}
			adding = true;
			var code = $("#code").val();
			var option = $("#code option[value='"+ code +"']");
			EB_Common.Ajax.post("/account/settings/broadcast/senderInfo",
				{
					countryCode : code,
					countryName : option.text(),
					callerId : $("#callerId").val().replace(/[^0-9]/ig, "")
				},
				function(data) {
					if (data == '-1') {
						EB_Common.dialog.alert(i18n['setting.error.senderInfo.exists'],i18n['dialog.title.warning']);
						return;
					}
					var defaultValue = '<td class="text-center">';
					if (data.isDefault == true) {
						defaultValue += '<input type="radio" name="isDefault" checked="checked" />';
					} else {
						defaultValue += '<input type="radio" name="isDefault" />';
					}
					var str = '<tr id = "'+ data.id +'">'
                            + defaultValue
                            + '<td id="'+data.countryCode+'">'
							+ data.countryName
							+ '</td><td class="text-right">'
							+ data.callerId
							+ '</td><td class="text-center"><a class="icn_edit_16" href="javascript:void(0);" title="'+i18n['button.edit']+'" onclick="EB_View.accountSettings.broadcast.senderInfo.update(this);"></a>'
							+ '<a class="icn_trash_16" href="javascript:void(0);" title="'+i18n['button.delete']+'" onclick="EB_View.accountSettings.broadcast.senderInfo.deleteType(this);"></a>'
							+ '</td></tr>';
					$("#addSenderInfoRow").before(str);
					$("#" + data.id +' input[name="isDefault"]').bind("click",setDefault);
					$("#callerId").val("");
					$("#code").val("");
					option.remove();
					adding = false;
                    //reset Leave Page State
                    EB_Common.LeavePage.resetState();
                    
				});
		});
		
		$('#editEmail').click(EB_View.accountSettings.broadcast.senderInfo.editEmail);
		$('#saveEmail').click(EB_View.accountSettings.broadcast.senderInfo.saveUpdate);
		$('#cancelEmail').click(EB_View.accountSettings.broadcast.senderInfo.cancleEdit);
	};
	
	var adding = false;
		
	function setDefault(e){
		var radio = $(this);
		var tr = radio.closest('tr');
		
		EB_Common.Ajax.put("/account/settings/broadcast/senderInfo/default", {
			id : tr.attr("id")
		}, function(data) {
			if (data == '-1') {
                EB_Common.LeavePage.resetState();

                EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning'],null,{close:function(){
                    $('#level1_4_2').click();
                }});

				return;
			}
            //reset Leave Page State
            EB_Common.LeavePage.resetState();
		});
	}
	
	var flag = true;
	view.accountSettings.broadcast.senderInfo.updateName = function(obj) {
		var tr = $(obj).closest('tr');
		var td1 = tr.find("td").eq(2);
		
		if ($("#newName").valid() == false){
			return;
		}
		var newName = $("#newName").val();
		
		EB_Common.Ajax.put(
			"/account/settings/broadcast/senderInfo",
			{
				id : tr.attr("id"),
				callerId : newName.replace(/[^0-9]/ig, "")
			},
			function(data) {
				if (data == '-1') {
                    EB_Common.LeavePage.resetState();

                    EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning'],null,{close:function(){
                        $('#level1_4_2').click();
                    }});
					return;
				}
				td1.text(data.callerId);
				var td2 = tr.find("td").eq(3);
				td2.text("");
				td2.append($('<a class="icn_edit_16" href="javascript:void(0);" title="'+i18n['button.edit']+'" onclick="EB_View.accountSettings.broadcast.senderInfo.update(this);"></a>'));
				td2.append($('<a class="icn_trash_16" href="javascript:void(0);" title="'+i18n['button.delete']+'" onclick="EB_View.accountSettings.broadcast.senderInfo.deleteType(this);"></a>'));
				flag = true;
                //reset Leave Page State
                EB_Common.LeavePage.resetState();
                
			});
	};

	view.accountSettings.broadcast.senderInfo.cancleUpdate = function (obj, oldName) {
		var tr = $(obj).closest('tr');
		var td1 = tr.find("td").eq(2);
		td1.text(oldName);
		var td2 = tr.find("td").eq(3);
		td2.text("");
		td2.append($('<a class="icn_edit_16" href="javascript:void(0);" title="'+i18n['button.edit']+'" onclick="EB_View.accountSettings.broadcast.senderInfo.update(this);"></a>'));
		td2.append($('<a class="icn_trash_16" href="javascript:void(0);" title="'+i18n['button.delete']+'" onclick="EB_View.accountSettings.broadcast.senderInfo.deleteType(this);"></a>'));
		flag = true;
        //reset Leave Page State
        EB_Common.LeavePage.resetState();
	};

	view.accountSettings.broadcast.senderInfo.update = function(obj) {
		if (flag == false)
			return;
		var tr = $(obj).closest('tr');
		var td2 = tr.find("td").eq(1);
		var td3 = tr.find("td").eq(2);
		var countryCode = td2.attr("id");
		var oldName = $(td3).text();
		td3.text("");
		td3.append($('<input type="text" class="width_percent94 {required:true,phone_length:[\'#'+countryCode+'\',\''+countryCode+'\']}" maxlength="21" name="newName" id="newName" pos="bottom">'));
		$("#newName").val(oldName);
		var td4 = tr.find("td").eq(3);
		td4.text("");
		td4.append($('<a href="javascript:void(0);" class="icn_save_16" title="'+i18n['button.save']+'" onclick="EB_View.accountSettings.broadcast.senderInfo.updateName(this);"></a>'));
		td4.append($('<a href="javascript:void(0);" class="icn_cancel_16" title="'+i18n['button.cancel']+'" onclick="EB_View.accountSettings.broadcast.senderInfo.cancleUpdate(this,\''
						+ oldName + '\');"></a>'));
		flag = false;
	};

	view.accountSettings.broadcast.senderInfo.deleteType = function(obj) {
		var tr = $(obj).closest('tr');
		var id = tr.attr("id");
		EB_Common.dialog.confirm(i18n['setting.delete.senderInfo'], i18n['global.dialog.title.confirm'], function() {
			$(this).dialog("close");
			EB_Common.Ajax.remove("/account/settings/broadcast/senderInfo", {
				id : id
			}, function(data) {
				if (data == '-1') {
                    EB_Common.LeavePage.resetState();

                    EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning'],null,{close:function(){
                        $('#level1_4_2').click();
                    }});
					return;
				}
				if(data == '-2'){
					EB_Common.dialog.alert(i18n['setting.error.senderInfo.default'],i18n['dialog.title.warning']);
					return;
				}
				
				var country = tr.find("td").eq(1).text();
				var code = tr.find("td").eq(1).attr("id");
				//$("#code").append('<option value="'+code+'">'+country+'</option>');
				$("#code option[value!='']").remove();
				var length = data.length;
				for(var i=0; i < length; i++){
					var country = data[i];
					$("#code").append('<option value="'+country.code+'">'+country.value+'</option>');
				}
				tr.remove();
			});
		}, function() {
			return;
		});
	};

	var email;
	view.accountSettings.broadcast.senderInfo.editEmail = function(e) {
		$('#emailContent').hide();
		email = $('#emailContent').text();
		$("#newEmail").val(email).show();
		$("#editEmail").hide();
		$("#saveEmail").show();
		$("#cancelEmail").show();
	};

	view.accountSettings.broadcast.senderInfo.saveUpdate = function(e) {
		if ($("#newEmail").valid() == false){
			return;
		}
		email = $("#newEmail").val();
		EB_Common.Ajax.put("/account/settings/broadcast/senderInfo/email", {
			email : email
		}, function(data) {
			$("#editEmail").closest('td').find("label.error").remove();
			$('#emailContent').text(email).show();
			
			$("#newEmail").hide().removeClass('error');
			$("#saveEmail").hide();
			$("#cancelEmail").hide();
			$("#editEmail").show();
            
            //reset Leave Page State
            EB_Common.LeavePage.resetState();
		});
	};

	view.accountSettings.broadcast.senderInfo.cancleEdit = function(e) {
		$("#editEmail").closest('td').find("label.error").remove();
		$('#emailContent').text(email).show();
		
		$("#newEmail").hide().removeClass('error');
		$("#saveEmail").hide();
		$("#cancelEmail").hide();
		$("#editEmail").show();

        //reset Leave Page State
        EB_Common.LeavePage.resetState();
	};

})(EB_View);