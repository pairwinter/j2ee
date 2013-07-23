(function(view){
	view.settings.broadcast = function(){};
	view.settings.broadcast.greetingLib = function(){};
	view.settings.broadcast.greetingLib.initPage = function(options) {
        view.settings.broadcast.greetingLib.saveHandler = function(){
            var standardData = {}, emergencyData = {};
            voiceApp1.getJsonData(standardData);
            voiceApp2.getJsonData(emergencyData);
            console.log(standardData);
            console.log(emergencyData);
            var standardVoice = view.settings.broadcast.greetingLib.getVoiceKey(standardData),
                emergencyVoice = view.settings.broadcast.greetingLib.getVoiceKey(emergencyData);
            EB_Common.Ajax.post("/settings/broadcast/greetingLib",{
                viaType : standardData.voiceSource || "None",
                emViaType : emergencyData.voiceSource || "None",
                standardVoice : standardVoice,
                emergencyVoice : emergencyVoice
            },function(data){
                EB_Common.ToolPrompt.show('save',i18n['glocal.savesuccess']);
                //reset Leave Page State
                EB_Common.LeavePage.resetState();
            });
        };
        EB_Common.validation.validate($("#greetingLibForm"),{submitHandler:function(){
            view.settings.broadcast.greetingLib.saveHandler();
        }});
		var voiceApp1 = EB_View.notification.app.VoiceApp.getInstance({
	        sessionId: options.sessionId,
	        modelData:options.standardVoiceData,//this.model.get("voiceData")
	        container:$("#nonPriority"),
	        isView:true,
	        isEdit:true,
            mode:2
	    });
//		window.voiceApp1 = voiceApp1;
		var voiceApp2 = EB_View.notification.app.VoiceApp.getInstance({
			sessionId: options.sessionId,
	        modelData:options.emergencyVoiceData,//this.model.get("voiceData")
	        container:$("#priority"),
	        isView:true,
	        isEdit:true,
            mode:2
	    });
		$('#save').click(function(){
            $('#greetingLibForm').submit();
		});
	};
	
	view.settings.broadcast.greetingLib.getVoiceKey = function (data){
		if(data.voiceSource=="WebRecorder" && data.recordedVoice){
			return data.recordedVoice[0];
        }else if(data.voiceSource=="LandlineRecorder"){
        	return data.audioKey;
        }else if(data.voiceSource=="WebUploader" && data.uploadedVoice){
        	return data.uploadedVoice[0];
        }else{
        	return '';
        }
	}
	
})(EB_View);
