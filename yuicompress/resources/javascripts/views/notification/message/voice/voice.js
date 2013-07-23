(function(view) {
    view.notification.app.VoiceApp={
        VoiceModel:{
            "defaults":function(){
            	return {
                    mode : 1,
                    load:false,
                    audioFiles:[],
                    recordedVoices:[],
                    voiceOptionType:"None",//WebRecorder,LandlineRecorder,WebUploader,
                    voiceFlashObject:{
                        recorderId:"recorder",
                        saveUrl:EB_Common.Ajax.wrapperUrl("/voices/write"),
                        audioUrl:EB_Common.Ajax.wrapperUrl("/voices/readRemote/"),
                        callbackMethod:"recorderCallback",
                        resizeMethod:"resizeRecorderCallback",
                        startRecordingCallback : "startRecordingCallback",
                        stopRecordingCallback : "stopRecordingCallback"
                    },
                    uploadingValid:true,
                    disableRadio:false,
                    includeAVoice:false
                };
            }
        },
        VoiceAppView:{
            jDom:{},
            template:{},
            uploader:{},
            initialize:function () {
                $.templates({
                    voiceTemplate: $("#voiceTemplate").html(),
                    voiceUploadItemTemplate: $("#voiceUploadItemTemplate").html(),
                    telephoneInstructionsTemplate: $("#telephoneInstructionsTemplate").html()
                });
                this.model.set("mode",this.options.mode);
                this.dealInitData();
                this.template.voiceTemplate = $.render.voiceTemplate;
                this.template.voiceUploadItemTemplate = $.render.voiceUploadItemTemplate;
                this.template.telephoneInstructionsTemplate = $.render.telephoneInstructionsTemplate;
                this.changeVoiceTypeCallback = this.options.changeVoiceTypeCallback;
                this.model.on("change:webUploader_validate", this.dealCheckUpload, this);
                this.model.on("change:landLine_validate", this.dealCheckLandLine, this);
                this.model.on("change:webRecorder_validate", this.dealCheckRecoder, this);
                this.model.on("change:includeAVoice", this.renderIncludeAVoice, this);
                this.render();
                this.model.on("change:voiceOptionType",this.renderVoiceOptionType,this);
                this.model.on("change:uploadingValid",this.renderUploadingValid,this);
                this.model.on("change:audioFiles",this.renderAudioItemContainer,this);
                this.model.on("change:disableRadio",this.renderDisableRadio,this);
            },
            dealInitData:function(){  //add by daniel.
            	this.model.set({"webRecorder_validate":null});
            	this.model.set({"landLine_validate":null});
            	this.model.set({"webUploader_validate":null});
            },
            renderDisableRadio:function(){
                var disabled = this.model.get("disableRadio");
                this.$("input[name^=recorder]").prop("disabled",disabled);
            },
            renderUploadingValid:function(){
                var uploadingValid = this.model.get("uploadingValid");
                if(uploadingValid){
                    this.$("#includeAVoiceValid").removeClass("ignore");
                }else{
                    this.$("#includeAVoiceValid").addClass("ignore");
                }

            },
            renderIncludeAVoice:function(){
                if(this.model.get("mode")!=1) return;
                var include = this.model.get("includeAVoice") || false;
                if(include){
                    this.$("#includeAVoice").prop("checked",true);
                    this.$("#includeAVoiceContainer").next().css({width:"auto",height:"auto","overflow":"hidden"});
                    var voiceOptionType = this.model.get("voiceOptionType");
                    if(voiceOptionType == "None"){
                        this.$("#voiceOptionsContainer input[name^=recorder]").prop("checked",false);
                    }
                }else{
                    this.$("#includeAVoice").prop("checked",false);
                    this.$("#includeAVoiceContainer").next().css({width:"0px",height:"0px","overflow":"hidden"});
                    this.model.set("voiceOptionType","None");
                    this.model.set({"audioFiles":[]},{silent:true});
                    this.renderAudioItemContainer();
                }
            },
            renderVoiceFlashData:function(){
                var view = this, voiceFlashObject = {
                    recorderId:"recorder",
                    saveUrl:EB_Common.Ajax.wrapperUrl("/voices/write"),
                    audioUrl:EB_Common.Ajax.wrapperUrl("/voices/readRemote/"),
                    callbackMethod:"recorderCallback",
                    resizeMethod:"resizeRecorderCallback",
                    startRecordingCallback : "startRecordingCallback",
                    stopRecordingCallback : "stopRecordingCallback"
                };
                voiceFlashObject.recorderId = voiceFlashObject.recorderId + this.cid;
                //create call back for voice flash
                var recorderCallback = voiceFlashObject.callbackMethod+this.cid;
                voiceFlashObject.callbackMethod = "window."+recorderCallback;
                window[recorderCallback]= function(serverData, recorderId){
                    view.recordUploadedCallBack(serverData, recorderId);
                };
                var resizeRecorderCallback = voiceFlashObject.resizeMethod+this.cid;
                voiceFlashObject.resizeMethod = "window."+resizeRecorderCallback;
                window[resizeRecorderCallback]=function(expanding, recorderId){
                    view.recordResizeCallBack(expanding, recorderId);
                };
                var startRecordingCallback = voiceFlashObject.startRecordingCallback+this.cid;
                voiceFlashObject.startRecordingCallback = "window."+startRecordingCallback;
                window[startRecordingCallback]=function(){
                    view.startRecordingCallback();
                };
                var stopRecordingCallback = voiceFlashObject.stopRecordingCallback+this.cid;
                voiceFlashObject.stopRecordingCallback = "window."+stopRecordingCallback;
                window[stopRecordingCallback]=function(){
                    view.stopRecordingCallback();
                };
                this.model.set("voiceFlashObject",voiceFlashObject);
            },
            render:function(){
                this.model.set("isIpad",EB_Common.isIpad);
                this.model.set("isSupportFlash",EB_Common.checkFlash(false));
                this.renderVoiceFlashData();
                //this is a test
                var voiceSource = this.model.get("voiceSource") || "None",audioKey = this.model.get("audioKey");

                if(voiceSource=="WebRecorder"){
                    var voiceFlashObject = this.model.get("voiceFlashObject");
                    voiceFlashObject.audioUrl = voiceFlashObject.audioUrl + (audioKey || "");
                    this.model.set("voiceFlashObject",voiceFlashObject);
                    this.model.set("voiceOptionType","WebRecorder");
                }else if(voiceSource=="LandlineRecorder"){
                    this.model.set("voiceOptionType","LandlineRecorder");
                }else if(voiceSource=="WebUploader"){
                    this.model.set("voiceOptionType","WebUploader");
                }

                this.$el.html(this.template.voiceTemplate(this.getIdSuffixModelJSON()));
                if(this.options.isEdit===false){
                    this.$("input").prop("disabled",true);
                }
                this.jDom.audioItemContainer = this.$("#audioItemContainer");
                this.jDom.audioItemContainerUl = this.$("#audioItemContainerUl");
                this.jDom.telephoneInstructionsDialog =  $(this.template.telephoneInstructionsTemplate({}));
                this.renderTelephoneInstructionsDialog();
                this.renderUploader();
                this.$("#voiceOptionsContainer input[name^=recorder][value="+this.model.get("voiceOptionType")+"]").prop("checked",true);
                this.renderVoiceOptionType();
                this.renderAudioItemContainer();
                this.model.set({"includeAVoice":(voiceSource != "None")},{silent:true});
                this.renderIncludeAVoice();
                return this;
            },
            renderVoiceOptionType:function(){
                var val = this.model.get("voiceOptionType");
                if("WebRecorder"==val){
//                    this.$("#recordContainer").height("auto").width("auto");
                    this.$("#recordContainer").show();
                    var recorder = this.getFlashMovieObject(this.model.get("voiceFlashObject").recorderId);
                    if(recorder){
                        $(recorder).show();
                        if(!recorder.style.oldHeight) recorder.style.oldHeight = "67px";
                        recorder.style.height= recorder.style.oldHeight || "200px";
                    }
                    this.$("#webRecorder_validate").addClass("required");
                }else{
                    var recorder = this.getFlashMovieObject(this.model.get("voiceFlashObject").recorderId);
                    if(recorder){
                        this.$("#recordContainer").hide();
                        $(recorder).hide();
                    }
                    this.$("#webRecorder_validate").removeClass("required").valid();
                }
                if("LandlineRecorder"==val){
                    this.$("#telephoneContainer").show();
                    this.$("#landLine_validate").addClass("required");
                }else{
                    this.$("#telephoneContainer").hide();
                    this.$("#landLine_validate").removeClass("required").valid();
                }
                if("WebUploader"==val){
                    this.$("#voiceUploadFileContainer").show();
                    this.$("#webUploader_validate").addClass("required");
                }else{
                    this.$("#voiceUploadFileContainer").hide();
                    this.$("#webUploader_validate").removeClass("required").valid();
                }

                if("None"==val){
                    this.jDom.audioItemContainer.hide();
                    this.$("input[name^=recorder][value=None]").prop("checked",true);
                }else{
                    if(this.jDom.audioItemContainerUl.children().length){
                        this.jDom.audioItemContainer.show();
                    }else{
                        this.jDom.audioItemContainer.hide();
                    }
                }
                if($.isFunction(this.changeVoiceTypeCallback)){
                    this.changeVoiceTypeCallback.call(this, val);
                }

            },
            renderAudioItemContainer:function(){
                var files = this.model.get("audioFiles");
                var val = this.model.get("voiceOptionType");
                this.jDom.audioItemContainerUl.empty().html(this.template.voiceUploadItemTemplate(files));
                if(this.uploader && this.uploader.audioUploader && this.uploader.audioUploader.loaded && this.model.get("voiceOptionType")=="WebUploader"){
                    this.uploader.audioUploader.updateUploadLimit();
                }
                if(files.length){
                    this.disableRadio();

                    this.jDom.audioItemContainer.show();
                    if("WebRecorder"==val){
                        this.model.set({"webRecorder_validate":true});
                    }
                    if("LandlineRecorder"==val){
                        this.model.set({"landLine_validate":true});
                    }
                    if("WebUploader"==val){
                        this.model.set({"webUploader_validate":true});
                    }
                }else{
                    var recordSWF = this.getFlashMovieObject(this.model.get("voiceFlashObject").recorderId);
                    if(recordSWF && recordSWF.setAudioUrl){
                        recordSWF.setAudioUrl("");
                    }
                    this.$("input[name^=recorder]").prop("disabled",false);
                    this.jDom.audioItemContainer.hide();
                    if("WebRecorder"==val){
                        this.model.set({"webRecorder_validate":false});
                    }
                    if("LandlineRecorder"==val){
                        this.model.set({"landLine_validate":false});
                    }
                    if("WebUploader"==val){
                        this.model.set({"webUploader_validate":false});
                    }
                }
                if (this.options.isEdit===false){
                	this.$("#voiceUploadFileContainer").hide();
                	this.$("input[name^=recorder]").prop("disabled",true);
                	this.jDom.audioItemContainerUl.find("a.up_attachment_del_btn").hide();
                	this.jDom.audioItemContainerUl.find("a.sound_preview").hide();
                	this.$("#recordContainer").hide();
                }

            },
            renderTelephoneInstructionsDialog:function(){
                var view = this;
                EB_Common.dialog.dialog(this.jDom.telephoneInstructionsDialog, {
                    dialogClass:"no-close",
                    title: i18n["notification.voice.telephone.title"],
                    autoOpen : false,
                    height: 'auto',
                    buttons: [
                        {
                            click: function() {
                                view.telephoneInstructionsDone();
                            },
                            'class': 'orange',
                            text: i18n["button.done"]
                        },
                        {
                            click:function(){
                                $(this).dialog("close")
                            },
                            'class':'gray',
                            text : i18n['global.dialog.button.cancel']
                        }
                    ]
                });
            },
            renderUploader:function(){
                if(EB_Common.isIpad) return;
                var voiceApp = this;
                this.uploader.audioUploader = new EB_View.notification.uploader({
                    sessionId : voiceApp.options.sessionId,
                    uploadUrl : "/upload/file",
                    container:this.jDom.audioItemContainerUl,
                    buttonId:"audioButtonId"+this.cid,
                    btnText : i18n['notification.title.uploadmessage'],
                    maxFilesCount : 1,
                    fileTypes : "*.wav",
                    fieldName : "uploadedAttachments",
                    buttonImageUrl : "/statics/stylesheets/common/img/uploader_bg.png",
                    fileLimit : "2.4 MB",
                    uploadItemTemplate:$("#voiceUploadItemTemplate"),
                    fileDialogStart:function(){
//                        voiceApp.$("#swfuploadLabel").trigger("click");
                    },
                    queue_limit_exceeded:i18n["notification.voice.exceed.max"],
                    filesStartUpload:function(){
                        voiceApp.model.set("disableRadio",true);
                        voiceApp.renderDisableRadio();
                        voiceApp.jDom.audioItemContainerUl.find('.sound_preview').hide();
                    },
                    wavCheck:true,
                    uploadSuccess:function(swfFile,serverFile){
                        serverFile.swfFileId = swfFile.id;
                        serverFile.newFile = true;
                        serverFile.serverFileName = serverFile.fileName + "-" + serverFile.originFileName;
                        serverFile.fileName = swfFile.name;
                        serverFile.index = 1;
                        voiceApp.model.set({"audioFiles":[serverFile]},{silent:true});
                        voiceApp.model.set({"webUploader_validate":true});
                        if(swfFile.container){
                            $(swfFile.container).find('.sound_preview').show();
                        }
                    },
                    uploadError:function(file,serverFile){
                        voiceApp.model.set({"audioFiles":[]});
                        voiceApp.model.trigger("change:audioFiles");
                        EB_Common.dialog.alert(serverFile.message);
                    },
                    uploadCancel:function(){
                        voiceApp.model.set("disableRadio",false);
                        voiceApp.renderDisableRadio();
                    },
                    removeFile:function(swfFileId){
                    	if (!voiceApp.options.isEdit) return;
                        var files = $.merge([],voiceApp.model.get("audioFiles"));
                        var newFiles = [];
                        $.each(files,function(i,file){
                            if(file.swfFileId!=swfFileId){
                                newFiles.push(file);
                            }
                        });
                        voiceApp.model.set({"audioFiles":[]});
                    },
                    allUploadComplete:function(){
                        voiceApp.model.set("uploadingValid",true);
                    }
                });
            },
            removeFile:function(){
                this.model.set("audioFiles",[]);
            },
            disableRadio:function(){
                this.$("input[name^=recorder]").prop("disabled",true);
                var val = this.model.get("voiceOptionType");
                if("WebRecorder"==val){
                    this.$("#recorder1").prop("disabled",false).prop("checked",true);
                }
                if("LandlineRecorder"==val){
                    this.$("#recorder2").prop("disabled",false).prop("checked",true);
                }
                if("WebUploader"==val){
                    this.$("#recorder3").prop("disabled",false).prop("checked",true);
                }
            },
            getFlashMovieObject:function(movieName){
                if(EB_Common.isIpad) return null;
                return document[movieName] || window[movieName];
            },
            recordUploadedCallBack:function(serverData,recorderId){
                var ret = $.parseJSON(serverData);
                var recordSWF = this.getFlashMovieObject(recorderId);
                if(!recordSWF) return;
                recordSWF.setAudioUrl(EB_Common.Ajax.wrapperUrl("/voices/readLocal/record/" + ret.fileName));
                var file = {
                    index:1,
                    hideProgress:true,
                    newFile:true,
                    recordedVoice:ret.fileName,
                    fileName:ret.fileInfo
                };
                this.model.set({"audioFiles":[file]});
            },
            recordResizeCallBack:function(expanding,recorderId){
                var movieName = this.getFlashMovieObject(recorderId);
                if(!movieName) return;
                if(expanding) {
                    movieName.style.height = "200px";
                    movieName.style.width = "220px";
                    movieName.style.oldHeight = "200px";
                } else {
                    movieName.style.height = "87px";
                    movieName.style.width = "150px";
                    movieName.style.oldHeight = "87px";
                }
            },
            startRecordingCallback:function(){
                this.model.set("disableRadio",true);
                this.renderDisableRadio();
            },
            stopRecordingCallback:function(){
//                this.model.set("disableRadio",true);
            },
            creatRecordingSession:function(){
                var view = this;
                var mode = this.model.get("mode");
                EB_Common.Ajax.get("/recording/creatRecordingSession",{mode:mode},function(data){
                    view.jDom.telephoneInstructionsDialog.dialog("open");
                    var inboundScripts = data.inboundScripts || [],phones = [];
                    $.each(inboundScripts,function(i,script){
                        phones.push(script.displayPhoneNumber);
                    });
                    view.jDom.telephoneInstructionsDialog.find("label.phonenum").html(phones.join(","));
                    view.jDom.telephoneInstructionsDialog.find("label.telephonePIN").html(data.recordingSession.sessionToken);
                    view.model.set("recordingSession",data.recordingSession);
                },"json");
            },
            startPoll:function(){
                var view = this;
                view.model.set("disableRadio",true);
                this.renderDisableRadio();
                var mode = this.model.get("mode");
                this.$("input[name^=recorder]").prop("disabled",true);
                this.$("#telephoneWorking").show();
                this.polling = 1;
                this.poll = setInterval(function(){
                    view.polling = view.polling + 1 ;
                    if(view.polling > 5){
                        view.endPoll();
                        EB_Common.dialog.alert("No record by phone results received. Please try again.");
                    }
                    var recordingSession = view.model.get("recordingSession");
                    $.ajax({
                        url:EB_Common.Ajax.wrapperUrl("/recording/findRecordingSessionByToken"),
                        data: {token:recordingSession.sessionToken,mode:mode},
                        type:"get",
                        global:false,
                        success: function(data){
                            if(data.audio){
                                view.polling = false;
                                view.endPoll();
                                var file = $.extend(true,{},data.audio);
                                file.index = 1;
                                file.hideProgress = true;
                                file.fileName = file.name;
                                view.model.set({"audioFiles":[file]});
                                // force a re-render so that message is no longer marked required
                                view.renderVoiceOptionType();
                            }
                        },
                        dataType:"json"
                    });
                },3000);
            },
            endPoll:function(){
                this.$("input[name^=recorder]").prop("disabled",false);
                clearInterval(this.poll);
                this.model.set("disableRadio",false);
                this.renderDisableRadio();
                this.$("#telephoneWorking").hide();
                this.polling = 0;
            },
            events:function(){
                var events = {
                    "click #recorder_link15":"eventClickTelephoneInstructions",
                    "click #voiceOptionsContainer label.voiceOptionLabel":"eventClickVoiceLabel",
                    "change #includeAVoice":"eventChangeIncludeAVoice",
                    "change input[name^=recorder]":"eventChangeVoiceOption",
                    "click a.up_attachment_del_btn":"eventClickRemoveVoiceAttachment",
                    "click a.sound_preview":"eventClickSoundPreview"
                };
                if(this.options.isEdit===false){
                    events={};
                }
                return this.dealEvents(events,this.cid);
            },
            eventClickRemoveVoiceAttachment:function(){
                this.model.set("audioFiles",[]);
                this.model.trigger("change:audioFiles");
            },
            eventClickTelephoneInstructions:function(e){
                var audioFiles = this.model.get("audioFiles")||[];
                if(audioFiles.length) return;
                if(this.polling) return;
                this.creatRecordingSession();
            },
            eventClickVoiceLabel:function(e){
                var j = $(e.currentTarget);
                j.prev().prop("checked",true).trigger("change");
            },
            eventChangeIncludeAVoice:function(e){
                this.model.set("includeAVoice", e.target.checked);
                if(e.target.checked){
                    this.$("#voiceOptionsContainer input[name^=recorder]").prop("disabled",false);

                }
            },
            eventChangeVoiceOption:function(e){
                var j = $(e.target),val = j.val();
                this.model.set("voiceOptionType",val);
            },
            eventClickSoundPreview:function(e){
                e.preventDefault();
                var audioIcon = $(e.target);
                var title = audioIcon.parent().children('span').text();
//                console.log(title);
                var postData = {},path;
                var files = this.model.get("audioFiles");
                if(files && files.length){
                    var file = files[0];
                    if(file.id){
                        postData.audioKey = file.id;
                    }else if(file.serverFileName){
                        postData.uploadedVoice = file.serverFileName;
                    }else if(file.recordedVoice){
                        postData.recordedVoice = file.recordedVoice;
                    }
                }else{
                    return;
                }
                if(postData.audioKey){
                    path = "/voices/readRemote/" + postData.audioKey;
                }else if(postData.uploadedVoice){
                    var path2 = postData.uploadedVoice;
                    if(/\.wav$/.test(path2)){
                        path2 = path2.substring(0,path2.indexOf(".wav"));
                    }
                    path = "/voices/readLocal/upload/" + path2;
                }else if(postData.recordedVoice){
                    path = "/voices/readLocal/record/" + postData.recordedVoice;
                }
                

                $('#audioPlay'+this.cid).remove();
                var audioPlay = null;
                var that = this;
                audioPlay = $('<div id="audioPlay'+this.cid+'"/>');
                audioPlay.dialog({
                    title : title,
                    autoOpen: false,
                    minWidth : 440,
                    minHeight : 130,
                    resizable : false,
                    modal : true,
                    zIndex : 2300,
                    create: function(event, ui ){
                        $('#audioPlay'+that.cid).parent().css('overflow', 'visible');
                    },
                    close: function() {
                        $(this).dialog('destroy');
                        audioPlay.remove();
                    }
                });
                EB_Common.audio.play({
                    path : EB_Common.Ajax.wrapperUrl(path),
                    container : "#"+audioPlay.attr("id"),
                    audioId:this.cid
                });
                audioPlay.dialog('open');
            },
            telephoneInstructionsDone:function(){
                this.jDom.telephoneInstructionsDialog.dialog("close");
                this.startPoll();
            },
            dealCheckUpload:function(model){
                if(model.get("webUploader_validate")){
                    this.$("#webUploader_validate").val("true").valid();
                }else{
                    this.$("#webUploader_validate").val("");
                }
            },
            dealCheckLandLine:function(model){
                if(model.get("landLine_validate")){
                    this.$("#landLine_validate").val("true").valid();
                }else{
                    this.$("#landLine_validate").val("");
                }
            },
            dealCheckRecoder:function(model){
                if(model.get("webRecorder_validate")){
                    this.$("#webRecorder_validate").val("true").valid();
                }else{
                    this.$("#webRecorder_validate").val("");
                }
            },
            getData:function(){
                var model = this.model.toJSON();
                model.load = false;
                if(model.mode == 1 && (!model.includeAVoice)){
                    model.voiceSource = "None";
                }
                if(model.voiceOptionType=="WebRecorder"){
                    model.voiceSource = "WebRecorder";
                }else if(model.voiceOptionType=="LandlineRecorder"){
                    model.voiceSource = "LandlineRecorder";
                }else if(model.voiceOptionType=="WebUploader"){
                    model.voiceSource = "WebUploader";
                }
                return $.extend(true,{},model);
            },
            getJsonData:function(parentObj){
                var data = this.getData();
                if(data.voiceOptionType=="WebRecorder"){
                    parentObj.voiceSource = "WebRecorder";
                }else if(data.voiceOptionType=="LandlineRecorder"){
                    parentObj.voiceSource = "LandlineRecorder";
                }else if(data.voiceOptionType=="WebUploader"){
                    parentObj.voiceSource = "WebUploader";
                }
                if((data.mode == 1 && data.includeAVoice) || (data.mode==2)){
                    var files = data.audioFiles||[];
                    if(files.length){
                        var file = files[0];
                        if(file.id){
                            parentObj.audioKey = file.id;
                        }else if(file.serverFileName){
                            parentObj.uploadedVoice = [file.serverFileName];
                        }else if(file.recordedVoice){
                            parentObj.recordedVoice = [file.recordedVoice];
                        }
                    }
                }
                return parentObj;
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.VoiceModel);
            var View = EB_Common.Backbone.View.extend(this.VoiceAppView);
            var voiceMode = new Model(options.modelData);
            return new View({
                mode : options.mode || 1,
                el:options.container,
                model:voiceMode,
                sessionId:options.sessionId,
                isView:options.isView,
                isEdit:options.isEdit,
                changeVoiceTypeCallback:options.changeVoiceTypeCallback
            });
        }
    };
})(EB_View);