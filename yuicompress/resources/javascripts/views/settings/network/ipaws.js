/**
 * Network - Ipaws
 * 
 */
(function(view) {

	var pub = {
		initPage : function(context) {
			EB_Common.validation.validate("ipawsForm",{
				submitHandler : function() {
					var options = {
						url : EB_Common.Ajax.wrapperUrl('/settings/network/ipaws'),
						type : 'POST',
						dataType : 'json',
						success : function(data) {
							var ipawsSetting = data.ipawsSetting;
							if (ipawsSetting) {
								$('#logonUser').hide();
								$('#logonCogId').hide();
								$('#digCertFile').hide();
								$('#logonUserLabel').text(ipawsSetting.logonUser).show();
								$('#logonCogIdLabel').text(ipawsSetting.logonCogId).show();
								$('#digitalCertFileName').text(ipawsSetting.digitalCertFileName).show();
								$('#removeBtn').show();
								$('#saveBtn').hide();

								$('#lastModifiedUserId').text(ipawsSetting.lastModifiedName);
								$('#lastModifiedDate').text(data.lastModifiedDate);
								$('#lastModified').show();
								EB_Common.ToolPrompt.show('removeBtn', i18n['glocal.savesuccess']);
								// reset Leave Page State
								EB_Common.LeavePage.resetState();
							} else {
								EB_Common.dialog.alert('Error saving IPAWS information');
							}
						},
						failure : function(data) {
							EB_Common.dialog.alert('Error saving IPAWS information');
						}
					};

					$('#ipawsForm').ajaxSubmit(options);
				}
			});
			
			$('#saveBtn').click(function() {
				$('#ipawsForm').submit();
			});

			$('#removeBtn').click(function(e) {
				EB_Common.dialog.confirm(i18n['setting.publish.ipaws.deleteMsg'],i18n['global.dialog.title.confirm'],
					function() {
						EB_Common.Ajax.remove("/settings/network/ipaws",{},
						function(data) {
							var ipawsSetting = data.ipawsSetting;
							$('#logonUser').val('').show();
							$('#logonCogId').val('').show();
							$('#digCertFile').val('').show();
							$('#logonUserLabel').hide();
							$('#logonCogIdLabel').hide();
							$('#digitalCertFileName').hide();
							$('#removeBtn').hide();
							$('#saveBtn').show();
							$('#lastModifiedUserId').text(ipawsSetting.lastModifiedName);
							$('#lastModifiedDate').text(data.lastModifiedDate);
						});
					}, function() {
					});
			});
			
			setInterval(function(){
				var inputs = $('table.b-form-table').find('input');
				var hasValues = true;
				inputs.each(function(){
					var input = $(this);
					hasValues = hasValues && ($(this).val() != '');
				});
				if(hasValues){
                    $("#saveBtn").removeAttr("disabled").removeClass("btn_disabled").addClass('orange');
                    $("#saveBtn").find('i').removeClass("icn_gray");
                }else{
                    $("#saveBtn").attr("disabled",true).addClass("btn_disabled").removeClass('orange');
                    $("#saveBtn").find('i').addClass("icn_gray");
                }
			},300);
		}
	   
	};

	view.settings.network = view.settings.network || {};
	view.settings.network.ipaws = pub;

})(EB_View);