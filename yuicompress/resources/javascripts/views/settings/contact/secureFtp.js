(function(view){
	view.settings.contact = view.settings.contact || {};
	view.settings.contact.secureFtp = {};
	view.settings.contact.secureFtp.initPage = function(hasFtpKey,hasFileKey) {
        if(hasFtpKey){
            $('#downloadFTPKey').show();
            $('#ftpKey').hide();
        }

        if(hasFileKey){
            $('#downloadFileKey').show();
            $('#fileKey').hide();
        }

        var encryptionStatus = $('input[name="encryptionStatus"]:checked').val();
        if("true" == encryptionStatus)  {
            $('#trFileKey').show();
            $('#divFileDoc').show();
        } else  {
            $('#trFileKey').hide();
            $('#divFileDoc').hide();
        }

		$('#downloadFTPKey').click(function(){
			window.open(EB_Common.Ajax.wrapperUrl("/settings/contact/downloadFTPKey"));
			return false; 
		});
        
        $('#generateFTP').click(function(e){
            e.preventDefault();
            EB_Common.dialog.confirm(i18n['setting.contact.security.generate.explain'],i18n['setting.contact.security.generate'],
                function(){
                    EB_Common.Ajax.ajax({
                        url: '/settings/contact/generateFtp',
                        success: function(data) {
                            $('#downloadFTPKey').show();
                            $('#ftpKey').hide();
                        }
                    });
                }, 
                null,i18n['setting.contact.security.generate.btn1'],i18n['setting.contact.security.generate.btn2']);
        });

        $('#downloadFileKey').click(function(){
            window.open(EB_Common.Ajax.wrapperUrl("/settings/contact/downloadFileKey"));
            return false;
        });
        
        $('#generateFile').click(function(e){
            e.preventDefault();
            EB_Common.dialog.confirm(i18n['setting.contact.security.generate.explain'],i18n['setting.contact.security.generate'],
                function(){
                    EB_Common.Ajax.ajax({
                        url: '/settings/contact/generateFile',
                        success: function(data) {
                            $('#downloadFileKey').show();
                            $('#fileKey').hide();
                        }
                    });
                }, 
                null,i18n['setting.contact.security.generate.btn1'],i18n['setting.contact.security.generate.btn2']);
        });

        $('#eb_file tbody').on('change', 'input[name="encryptionStatus"]', function(e) {
            var encryptionStatus = $('input[name="encryptionStatus"]:checked').val();
            if("true" == encryptionStatus)  {
                $('#trFileKey').show();
                $('#divFileDoc').show();
            }else  {
                $('#trFileKey').hide();
                $('#divFileDoc').hide();
            }

            EB_Common.Ajax.ajax({
                url: '/settings/contact/encryptionStatus?encryptionStatus=' + encryptionStatus,
                success: function(data) {

                }
            });

        });
	};

})(EB_View);