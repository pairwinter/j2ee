(function(view){
	view.settings.organization = function(){};
	view.settings.organization.initLoginMsgPage = function() {
//		view.settings.organization.textAreaLimit("loginMsg","loginMsgLength");
		EB_Common.validation.validate("loginMsgForm",{});
		
//		$("#loginMsgLength").text(2500 - $("#loginMsg").val().length);
		
		var loginMsgVid,
	     timeout = function(){
            var iframe = $('iframe');
            if(!iframe || iframe.length === 0){
                loginMsgVid && clearInterval(loginMsgVid);
                return;
            }
            iframe = iframe[0];
            var doc = iframe.contentWindow ? iframe.contentWindow.document : iframe.contentDocument ? iframe.contentDocument : iframe.document;
		    var val = $(doc.body).text();
            var validVal = '';
            if(val == ''){
               if(/\<img/i.test($(doc.body).html())){
                 validVal = 'true';  
               }
            }else{
               validVal = 'true';
            }
			$("#loginMsgVid").val(validVal).valid();
		};
		
		if($("#showMessage").is(":checked")){
			$("#loginMsgVid").rules("add", {
				required:true
	    	});
			loginMsgVid = setInterval(timeout,200);
		}
		
		$("#showMessage").change(function(){
			if($("#showMessage").is(":checked")){
				$("#loginMsgVid").rules("add", {
					required:true
		    	});
				if(!loginMsgVid){
					loginMsgVid = setInterval(timeout,200);
				}
			}else{
				clearInterval(timeout);
				$("#loginMsgVid").rules("remove","required");
				$("#loginMsgVid").removeClass('error');
			}
			$("#loginMsg").removeData("previousValue").valid();
		});
		
		var cleditor = $('#loginMsg').cleditor({
		    width : 610, 
			height : 400,
			bodyStyle : 'min-height:300px;',
			controls : 'bold italic underline strikethrough subscript superscript | font size '
						+ 'style | color highlight removeformat | bullets numbering | outdent '
						+ 'indent | alignleft center alignright justify | '
						+ 'rule image link unlink | cut copy paste pastetext'
						,
		    updateTextArea : function(html){
		    	$('#loginMsg').change();
		    	return html;
		    }
	    });
		
		$('#formBut0').click(function() {
			var showMessage = $("#showMessage").is(":checked");
			
			if ( showMessage && $("#loginMsgVid").valid() == false){
				return;
			}
			
            EB_Common.Ajax.put("/settings/organization/loginMsg",{loginMessage:$("#loginMsg").val(),showMessage:showMessage},function(data){
                $("#lastModifiedDate").text(data.lastModifyDate);
                $("#lastModifiedBy").text(data.userName);
                EB_Common.ToolPrompt.show('formBut0',i18n['glocal.savesuccess']);
                
                //reset Leave Page State
                EB_Common.LeavePage.resetState();
            });
			
		}); 
	};
	
	view.settings.organization.textAreaLimit = function(textAreaName,textCount){
		var checkInter=null;
		$("#"+textAreaName).focus(function(){
			var ta=$(this);
			var tc=$("#"+textCount);
			checkInter=setInterval(function(){
			var value=ta.val();
			var curLength=value.length;	
			if(curLength > 2500){
						value = value.substring(0,2500);
						ta.val(value);
						tc.text("0");
					}else{
						tc.text(2500-value.length);
					}	
		},100);
		}).blur(function(){
			if(checkInter!=null)
			clearInterval(checkInter);
		});
	}
	
})(EB_View);