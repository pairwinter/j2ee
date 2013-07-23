/**
 * Settings Publishing Options CMAS/WEA CMAS Fields
 * 
 */
(function(view) {

	var pub = {
		initPage : function() {

            EB_Common.validation.validate('eb_form',{
                submitHandler:function(){
                    var parmDataSameCodeValues = "";
                    var inputs = $('#sameCodes input');
                    var j = 0;
                    for (var i = 0, len = inputs.length; i < len; i++) {
                        if($(inputs[i]).attr('checked')){
                            if(j++ > 0) parmDataSameCodeValues += ",";
                            parmDataSameCodeValues += $(inputs[i]).attr('id');
                        }
                    }

                    var parmData={};
                    parmData["agencyHidden"]=($('#agencyExpose').attr('checked') == 'checked'? "false" : "true");
                    parmData["agencyId"]= $('#senderAgencyName').val();
                    parmData["urgencyHidden"]= ($('#urgencyExpose').attr('checked') == 'checked'? "false" : "true");
                    parmData["urgency"]=$('#urgency').val();
                    parmData["severityHidden"]= ($('#severityExpose').attr('checked') == 'checked'? "false" : "true");
                    parmData["severity"]=$('#severity').val();
                    parmData["certaintyHidden"]=($('#certaintyExpose').attr('checked') == 'checked'? "false" : "true");
                    parmData["certainty"]=$('#certainty').val();
                    parmData["expiredHoursHidden"]=($('#expiredHoursExpose').attr('checked') == 'checked'? "false" : "true");
                    parmData["expiredHoursId"]=$('#expiredHours').val();
                    parmData["sameCodeHidden"]=($('#sameCodeExpose').attr('checked') == 'checked'? "false" : "true");
                    parmData["sameCodeIds"]=parmDataSameCodeValues;

                    EB_Common.Ajax.put(
                        "/settings/network/cmasfields",
                        parmData,
                        function(data) {
                            if(data == 10 || data == 60){
                                EB_Common.LeavePage.resetState();

                                EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning'],null,{close:function(){
                                    $('#level1_8_2_4').click();
                                }});
                                return;
                            }

                            //code
                            EB_Common.ToolPrompt.show('saveBtn',i18n['glocal.savesuccess']);
                            //reset Leave Page State
                            EB_Common.LeavePage.resetState();
                        }
                    );
                }
            });
            
            $('#eb_grid tbody').on('change', 'input[name="expose"]', function(e) {
                var el = $(this);
                var select = el.parent().next().find('select,input[name="sameCode"]');
                var checked = el.attr('checked');

                if(checked && select.val() != null){
                    select.rules('remove', 'required');
                    select.valid();
                }else{
                    select.rules('add', {required:true});
                }
            });
            
            $('#sameCodes input').change(function(e){
                var el = $(e.target);
                var checked = el.attr('checked');
                var sameCode = $('#sameCode');
                if(checked){
                    sameCode.val('true');
                }else{
                    var inputs = $('#sameCodes input');
                    var b = false;
                    for (var i = 0, len = inputs.length; i < len; i++) {
                        if($(inputs[i]).attr('checked')){
                            b = true;
                            break;
                        }
                    }
                    sameCode.val(b ? 'true' : '');
                }

                sameCode.valid();
            });

            $('#agencyExpose').change();
            $('#sameCodeExpose').change();
            $($('#sameCodes input')[0]).change();

		}
	   
	};

	view.settings.network = view.settings.network || {};
	view.settings.network.cmasFields = pub;

})(EB_View);