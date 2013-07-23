(function(view){
	if(!view.settings.broadcast)
		view.settings.broadcast ={};
	view.settings.broadcast.emailTemplate = function(){};
	view.settings.broadcast.emailTemplate.initEmailTemplatePage = function(id) {
		$('#formBut0').click(function() {
			$('#emailTemplateForm').validate({
				submitHandler:function(){
		            EB_Common.Ajax.put("/settings/broadcast/emailTemplate",{id:id,defaultHeader:$("#defaultHeader").val(),defaultFooter:$("#defaultFooter").val()},function(data){
		            	EB_Common.ToolPrompt.show('formBut0',i18n['glocal.savesuccess']);
		            	
		            	//reset Leave Page State
                		EB_Common.LeavePage.resetState();
		            });
				}
			});
		}); 
		
		textAreaLimit("defaultHeader","defaultHeaderLength");
		textAreaLimit("defaultFooter","defaultFooterLength");
		
		
		$("#defaultHeaderLength").text(300 - $("#defaultHeader").val().length);
		$("#defaultFooterLength").text(300 - $("#defaultFooter").val().length);

        var cleditorFooter = $('#defaultFooter').cleditor({
            width : 610,
            height : 400,
            bodyStyle : 'min-height:300px;',
            controls : 'bold italic underline strikethrough subscript superscript | font size '
                + 'style | color highlight removeformat | bullets numbering | outdent '
                + 'indent | alignleft center alignright justify | '
                + 'rule image link unlink | cut copy paste pastetext'
            ,
            updateTextArea : function(html){
                if(html==="<br>")html="";
                if(html.countLength()>300){
                    $(cleditorFooter)[0].frameChecksum = false;
                    $($(cleditorFooter)[0].doc.body).html($('#defaultFooter').val());
                    return $('#defaultFooter').val();
                }
                $('#defaultFooter').val(html);
                $('#defaultFooter').change();
                return html;
            }
        });

       /* console.log(cleditorFooter[0]);
        $(cleditorFooter[0].doc).find("body").focus(function(){
            alert(1);
        });*/
        var cleditorHeader = $('#defaultHeader').cleditor({
            width : 610,
            height : 400,
            bodyStyle : 'min-height:300px;',
            controls : 'bold italic underline strikethrough subscript superscript | font size '
                + 'style | color highlight removeformat | bullets numbering | outdent '
                + 'indent | alignleft center alignright justify | '
                + 'rule image link unlink | cut copy paste pastetext'
            ,
            updateTextArea : function(html){
                if(html==="<br>")html="";
                if(html.countLength()>300){
                    $(cleditorHeader)[0].frameChecksum = false;
                    $($(cleditorHeader)[0].doc.body).html($('#defaultHeader').val());
                    return $('#defaultHeader').val();
                }
                $('#defaultHeader').val(html);
                $('#defaultHeader').change();
                return html;
            }
        });
	};
	
	function textAreaLimit(textAreaName,textCount){
		var checkInter=null;
		$("#"+textAreaName).change(function(){
			var ta=$(this);
			var tc=$("#"+textCount);
            var value=ta.val();
            var curLength=value.countLength();
            if(curLength > 300){
                value = value.substring2(0,300);
                ta.val(value);
                tc.text("0");
            }else{
                tc.text(300-value.countLength());
            }
//            checkInter=setInterval(function(){
//		},200);
		}).blur(function(){
			if(checkInter!=null)
			clearInterval(checkInter);
		});
	}

})(EB_View);