(function(view){
	if(!view.settings.broadcast)
		view.settings.broadcast ={};
	view.settings.broadcast.deliveryMethods = function(){};
	view.settings.broadcast.deliveryMethods.initPage = function() {
		setMoveBtn();
		$('#deliveryMethodDiv').show();
        
		$('#deliveryMethodsBody input[name="isDefault"]').bind('click', setDefault);
		
		var adding = false;
		EB_Common.validation.validate("addDeliveryMethodForm",{
    		submitHandler:function(){
    			if(adding)
    				return;
    			adding = true;
                var waitTime = 3;
                var radioVal = $(":radio[name=addDeliveryMethodsRowwaitTimeRadio]:checked").val();
                console.log(radioVal);
                if(radioVal=="default"){
                    waitTime= 3;
                }else if(radioVal=="custom"){
                    waitTime = $("#addDeliveryMethodsRowcustomSeconds").val();
                }
                var postData={
                    prompt : $("#prompt").val(),
                    pathId : $("#code").val(),
                    seq	   : $("#addDeliveryMethodsRow").find("td:eq(0) span").text()
                };
                if(waitTime){
                    postData.waitTime = waitTime;
                }
    			EB_Common.Ajax.post(
    				"/settings/broadcast/deliveryMethods",
                    postData,
    				function(data) {
    					if (data == '-1') {
    						EB_Common.dialog.alert(i18n['setting.error.deliveryMethod.exists'],i18n['dialog.title.warning']);
    						return;
    					}
    					var option = $("#code option[value='"+ data.pathId +"']");
    					var str = '<tr id = "'+ data.id +'" name="data" flag="'+data.pathFlag+'" waitTime="'+data.waitTime+'"><td>'+data.seq+'</td><td><input type="checkbox" name="isDefault" /></td><td id="'+option.val()+'">'+option.text()+'</td><td>'
    							+ '</td><td><a class="icn_edit_16" href="javascript:void(0);" title="'+i18n['button.edit']+'" onclick="EB_View.settings.broadcast.deliveryMethods.update(this);"></a>'
    							+ '<a class="icn_trash_16" href="javascript:void(0);" title="'+i18n['button.delete']+'" onclick="EB_View.settings.broadcast.deliveryMethods.deleteType(this);"></a></td></tr>';
    					$("#deliveryMethodsBody").append(str);
    					$('#' + data.id +' td:eq(3)').text(data.prompt);
    					$("#" + data.id +' input[name="isDefault"]').bind("click",setDefault);
    					$("#code").val("");
    					$("#prompt").val("");
    					option.remove();
    					var length = $("#code option[value!='']").length;
    					if(length == 0){
    						$("#addDeliveryMethodsRow").hide();
    					}
                        setMoveBtn();
    					adding = false;
//                        var radio1 = $('#addDeliveryMethodsRowwaitTimeRadio1');
//                        var radio2 = $('#addDeliveryMethodsRowwaitTimeRadio2');
//                        var waitTimeInput = $('#addDeliveryMethodsRowcustomSeconds');
//                        radio1.prop("checked",false);
//                        radio2.prop("checked", false);
//                        waitTimeInput.val("");
//                        $('#addDeliveryMethodsRowadvanced').hide();
                        clearWaittimeInput("addDeliveryMethodsRow");
                        $("#prompt").addClass("width_percent94").removeClass("width_percent55").next("#new_advanced").hide();
                        //reset Leave Page State
                        EB_Common.LeavePage.resetState();
    				});
    		}
		});
		
		EB_Common.validation.validate("updateDeliveryMethodForm",{
    		submitHandler:function(){
    			var tr = $("#newName").closest('tr');
                var trId = tr.attr("id");
    			var td1 = tr.find("td").eq(3);
    			var newName = $("#newName").val();
                var waitTime = 3;
                var radioVal = $(":radio[name="+trId+"waitTimeRadio]:checked").val();
                if(radioVal=="default"){
                    waitTime= 3;
                }else if(radioVal=="custom"){
                    waitTime = $("#"+trId+"customSeconds").val();
                }
                var postData={
                    id : trId,
                    prompt : newName
                };
                if(waitTime){
                    postData.waitTime = waitTime;
                }
    			EB_Common.Ajax.put("/settings/broadcast/deliveryMethods",
                    postData,
    				function(data) {
    					//console.log(data);
    					if (data == '-1') {
    						EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
                            $('#level1_4_3').click();
    						return;
    					}
                        tr.attr("waitTime", waitTime);
    					td1.text(newName);
    					var td2 = tr.find("td").eq(4);
    					td2.text("");
    					td2.append($('<a class="icn_edit_16" href="javascript:void(0);" title="'+i18n['button.edit']+'" onclick="EB_View.settings.broadcast.deliveryMethods.update(this);"></a>'));
    					td2.append($('<a class="icn_trash_16" href="javascript:void(0);" title="'+i18n['button.delete']+'" onclick="EB_View.settings.broadcast.deliveryMethods.deleteType(this);"></a>'));
    					setMoveBtn();
    					flag = true;

//                        var radio1 = $('#'+trId+'waitTimeRadio1');
//                        var radio2 = $('#'+trId+'waitTimeRadio2');
//                        var waitTimeInput = $('#'+trId+'customSeconds');
//                        radio1.prop("checked",false);
//                        radio2.prop("checked", false);
//                        waitTimeInput.val("");
//                        $('#'+trId+'advanced').hide();
                        clearWaittimeInput(trId);
    					//reset Leave Page State
                        EB_Common.LeavePage.resetState();
    				});

    		}
		});
		
		$("#addDeliveryMethodsRow").click(function(){
			return false;
		});
		
		$("#addDeliveryMethods").click(function() {
			$('#addDeliveryMethodForm').submit();
		});
        
        //Advanced click event
        $('#updateDeliveryMethodForm').on('click','a[name="operte_advanced"]',function(e){
            showAdvance(e);
        });
        $('#new_advanced').on('click',function(e){
            showAdvance(e, true);
        });
        $("#code").change(function(){
            if($(this).find("option:selected").attr("flag")=="2"){
                $("#prompt").removeClass("width_percent94").addClass("width_percent55");
                $("#new_advanced").show();

            }else{
                $("#prompt").addClass("width_percent94").removeClass("width_percent55");
                $("#new_advanced").hide();
                clearWaittimeInput("addDeliveryMethodsRow");

            }
        });
	};
    function clearWaittimeInput(trId){
        /*var radio1 = $('#'+trId+'waitTimeRadio1');
        var radio2 = $('#'+trId+'waitTimeRadio2');
        var waitTimeInput = $('#'+trId+'customSeconds');
        radio1.prop("checked",false);
        radio2.prop("checked", false);
        waitTimeInput.val("");*/
        $('#'+trId+'advanced').remove();
    }
	function showAdvance(e, isNew){
        e.preventDefault();
        var tr = $(e.target).closest('tr');
        $(e.target).hide();
        if(isNew){
            tr.addClass("white_bg");
        }
        var trId= tr.attr("id");
        var advancedEl = $('#'+trId+'advanced');
        var radio1, radio2, waitTimeInput;
        if(advancedEl.length == 0){
            var advancedTmpl = $('<tr name="advanced" style="display: none;" id="'+trId+'advanced" class="'+(isNew?'white_bg':'gray_bg')+'">').append("<td>").append("<td>");
            var td3 = $('<td colspan="3">').append('<div class="margin10-B"><label class="normal">' + i18n['setting.broadcast.deliverymethods.label1'] + '</label> <i class="icn_information_16" title="' + i18n['setting.broadcast.deliverymethods.tooltip'] + '"></i></div>');
            advancedTmpl.append(td3);
            var waitTime_div = $('<div>');
            td3.append(waitTime_div);
            radio1 = $('<input type="radio" name="'+trId+'waitTimeRadio" id="'+trId+'waitTimeRadio1" value="default"/>');
            radio2 = $('<input type="radio" name="'+trId+'waitTimeRadio" id="'+trId+'waitTimeRadio2" value="custom" class="margin20-L"/>');
            waitTimeInput = $('<input type="text" name="'+trId+'customSeconds" disabled="disabled" class="input_width50 {digits:true,range:[1,20]}" id="'+trId+'customSeconds"/>');
            waitTime_div.append(radio1).append('<label  class="normal" for="'+trId+'waitTimeRadio1">' + i18n['setting.broadcast.deliverymethods.label2'] + '</label>')
                .append(radio2).append('<label  class="normal" for="'+trId+'waitTimeRadio2">' + i18n['setting.broadcast.deliverymethods.label3'] + ' </label>')
                .append(waitTimeInput).append(" "+i18n['global.text.seconds']);

            radio1.click(function(){
                waitTimeInput.prop("disabled", true);
                waitTimeInput.removeClass("required").valid();
            });
            radio2.click(function(){
                waitTimeInput.prop("disabled", false);
                waitTimeInput.addClass("required");
            });
            advancedEl = $(advancedTmpl).insertAfter($(e.target).closest('tr'));
            advancedEl.find('.icn_information_16').tooltip();;
        }else{
            radio1 = $('#'+trId+'waitTimeRadio1');
            radio2 = $('#'+trId+'waitTimeRadio2');
            waitTimeInput = $('#'+trId+'customSeconds');
        }
        var waitTime = tr.attr("waitTime");
        if( !waitTime ||waitTime=="3"){
            radio1.click();
        }else{
            radio2.click();
            waitTimeInput.val(waitTime);
        }
//        if(waitTime){
//        }
        advancedEl.show();
//        if(advancedEl.is(":hidden")){
//        }else{
//            advancedEl.hide();
//        }
    }
	function setDefault(e){
		var checkBox = $(this);
		var tr = checkBox.closest('tr');
		EB_Common.Ajax.put("/settings/broadcast/deliveryMethods/default",
			{
				id : tr.attr("id"),
				isDefault : checkBox.is(':checked')
			},
			function(data) {
				if (data == '-1') {
					EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
					return;
				}
                
                //reset Leave Page State
                EB_Common.LeavePage.resetState();
			});
	}
	
	var flag = true;
	var oldName;
	view.settings.broadcast.deliveryMethods.updateName = function(obj) {
		$('#updateDeliveryMethodForm').submit();
	};

	view.settings.broadcast.deliveryMethods.cancleUpdate = function(obj) {
		var tr = $(obj).closest('tr').removeClass("gray_bg");
        var trId = tr.attr("id");
		var td1 = tr.find("td").eq(3);
		td1.text(oldName);
		var td2 = tr.find("td").eq(4);
		td2.text("");
		td2.append($('<a class="icn_edit_16" href="javascript:void(0);" title="'+i18n['button.edit']+'" onclick="EB_View.settings.broadcast.deliveryMethods.update(this);"></a>'));
		td2.append($('<a class="icn_trash_16" href="javascript:void(0);" title="'+i18n['button.delete']+'" onclick="EB_View.settings.broadcast.deliveryMethods.deleteType(this);"></a>'));
		setMoveBtn();
		flag = true;
        
//        tr.next('[name="advanced"]').hide();
        clearWaittimeInput(trId);
        //reset Leave Page State
        EB_Common.LeavePage.resetState();
	};

	view.settings.broadcast.deliveryMethods.update = function(obj) {
		if (flag == false)
			return;
		var tr = $(obj).closest('tr').addClass("gray_bg");
        var pathFlag = tr.attr("flag");
		var td3 = tr.find("td").eq(3);
		oldName = td3.text();
		td3.text("");
		td3.append($('<input type="text" class="width_percent55 margin10-R {required:true}" maxlength="20" name="newName" id="newName">'));
		if(pathFlag=="2"){
            td3.append($(' <a name="operte_advanced" href="#">' + i18n['setting.broadcast.deliverymethods.advanced'] + '</a>'));
        }
        $("#newName").val(oldName);
		var td4 = tr.find("td").eq(4);
		td4.text("");
		td4.append($('<a href="javascript:void(0);" class="icn_save_16" title="'+i18n['button.save']+'" onclick="EB_View.settings.broadcast.deliveryMethods.updateName(this);"></a>'));
		td4.append($('<a href="javascript:void(0);" class="icn_cancel_16" title="'+i18n['button.cancel']+'" onclick="EB_View.settings.broadcast.deliveryMethods.cancleUpdate(this);"></a>'));
		flag = false;
	};

	view.settings.broadcast.deliveryMethods.deleteType = function(obj) {
		var tr = $(obj).closest('tr');
		var id = tr.attr("id");
		EB_Common.dialog.confirm(i18n['setting.delete.deliveryMethod'], i18n['global.dialog.title.confirm'], function() {
			$(this).dialog("close");
			EB_Common.Ajax.remove("/settings/broadcast/deliveryMethods", {
				id : id
			}, function(data) {
				if (data == '-1') {
					EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
					return;
				}
				var pathCode = tr.find("td").eq(1).text();
				var pathId = tr.find("td").eq(1).attr("id");
				$("#code option[value!='']").remove();
				var length = data.length;
				for(var i=0; i < length; i++){
					var path = data[i];
					$("#code").append('<option value="'+path.id+'" flag="'+path.pathFlag+'">'+path.prompt+'</option>');
				}
				$("#addDeliveryMethodsRow").show();
				tr.remove();

                setMoveBtn();
			});
		}, function() {
			return;
		});
	};
	
	var moving = false;
	view.settings.broadcast.deliveryMethods.moveUp = function(obj){
		if(moving || !flag)
			return;
		var tr = $(obj).closest('tr');
		var prevTr = tr.prev();
		var td = tr.find("td").eq(4);
		var seq = tr.find("td:eq(0) span").text();
		var prevTd = prevTr.find("td").eq(4);
		var trAction = td.find("a");
		var preTrAction = $(prevTd).find("a");
		moving = true;
		//console.log(seq);
		EB_Common.Ajax.put("/settings/broadcast/deliveryMethods/move",
				{
					id : tr.attr("id"),
					seq : seq -1 ,
					targetSeq: seq,
					targetId:$(prevTr).attr("id")
				},
				function(data) {
					if (data == '-1') {
						EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
						return;
					}
					td.find("a").remove();
					prevTd.find("a").remove();
					td.append(preTrAction);
					prevTd.append(trAction);
					prevTr.before(tr);
                    setMoveBtn();
					moving = false;
				});
	};
	
	view.settings.broadcast.deliveryMethods.moveDown = function(obj){
		if(moving || !flag)
			return;
		var tr = $(obj).closest('tr');
		var nextTr = tr.next();
		var seq = tr.find("td:eq(0) span").text();
		var td = tr.find("td").eq(4);
		var nextTd = nextTr.find("td").eq(4);
		var trAction = td.find("a");
		var nextTrAction = nextTd.find("a");
		moving = true;
		EB_Common.Ajax.put("/settings/broadcast/deliveryMethods/move",
			{
				id : tr.attr("id"),
				seq : new Number(seq)+1 ,
				targetSeq: seq,
				targetId:nextTr.attr("id")
			},
			function(data) {
				//console.log(data);
				if (data == '-1') {
					EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
					return;
				}
				td.find("a").remove();
				nextTd.find("a").remove();
				td.append($(nextTrAction));
				nextTd.append($(trAction));
				nextTr.after(tr);
                setMoveBtn();
				moving = false;
			});
	};

	function setMoveBtn(){
		$(".icn_up").remove();
		$(".icn_down").remove();
		var trs = $("#deliveryMethodsBody tr[name='data']");
		var rowCount = trs.length;

		if(rowCount > 1){
			var moveUp = '<a href="javascript:void(0);" class="icn_up" onclick="EB_View.settings.broadcast.deliveryMethods.moveUp(this);" title="'+i18n['button.up']+'"></a>';
            var moveUpHide = '<a href="javascript:void(0);" class="icn_up disabled" title="'+i18n['button.up']+'"></a>';
            var moveDown = '<a href="javascript:void(0);" class="icn_down" onclick="EB_View.settings.broadcast.deliveryMethods.moveDown(this);" title="'+i18n['button.down']+'"></a>';
            var moveDownHide = '<a href="javascript:void(0);" class="icn_down disabled" title="'+i18n['button.down']+'"></a>';

            var firstTd = $(trs[0]).find("td").eq(0);
            firstTd.html($(moveDown));
            firstTd.append(moveUpHide);
            firstTd.append('<span class="margin10-L txt_middle">1</span>');

			var lastTd = $(trs[rowCount-1]).find("td").eq(0);
            lastTd.html($(moveDownHide));
			lastTd.append($(moveUp));
            lastTd.append('<span class="margin10-L txt_middle">' + rowCount + '</span>');

			for ( var i = 1; i < rowCount-1; i++) {
                var midTd = $(trs[i]).find("td").eq(0);
                midTd.html($(moveDown));
                midTd.append($(moveUp));
                midTd.append('<span class="margin10-L txt_middle">' + (i + 1) + '</span>');
			}
		}
        $('#addDeliveryMethodsRow').find("td:eq(0) span").text(rowCount+1);
	}
    
})(EB_View);