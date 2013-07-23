(function(view) {
    view.notification.app.MessageApp={
        MessageModel:{
            "defaults":{
                load:false,
                priority:false,
                title:"",
                textMessage:"",
                notificationType:"",
                notificationTypes:[],
                conferenceBridges:[],
                audioFiles:[],
                attachmentFiles:[],
                questionaire:{answers:[{index:1,hideDelete:true}]}
            },
            initialize:function () {
                if(arguments && arguments.length>1 && arguments[1].url)
                    this.urlRoot=arguments[1].url;
            },
            parse:function(response){
                EB_Common.logger.log("message info");
                EB_Common.logger.log(response);
                var bcTemplate = response.bcTemplate||{};
                var message = response.bcTemplate.message||{};
                message.status = bcTemplate.status;
                message.priority = response.bcTemplate.priority=="Priority";
                message.notificationType = bcTemplate.type||"Standard";
                message.questionaire = message.questionaire ||{};
                message.attachmentFiles = message.attachmentFiles||[];

                //hand audio file
                var voiceData = message.voiceData;
                if(!voiceData){
                    var audioFiles = [];
                    var audioKey = "";
                    if(message.audio){
                        audioKey = message.audio.id;
                        var file = $.extend(true,{},message.audio);
                        file.index = 1;
                        file.hideProgress = true;
                        file.swfFileId=1;
                        file.fileName = file.name;
                        audioFiles = [file];
                    }
                    message.voiceData = {audioFiles:audioFiles,audioKey:audioKey};
                    if(message.voiceSource){
                        message.voiceData.voiceSource=message.voiceSource;
                    }
                }

                //hand attachment files
                $.each(message.attachmentFiles,function(i,file){
                    file.index = i+1;
                    file.hideProgress = true;
                    file.swfFileId = i+1;
                    file.serverFileName = file.fileName;
                });
               /* if(message.attachmentFiles && message.attachmentFiles.length){
                    message.needAttachs = true;
                    message.hasAttahcs = true;
                    if(!message.emailfaxAttachSwitch){
                        message.emailfaxAttachSwitch = "EMAILANDFAX";
                    }
                }else{
                    message.needAttachs = false;
                    message.hasAttahcs = false;
                }*/
                //hand notification type
                message.notificationTypes=[];
                $.each(response.notificationTypes,function(i,n){
                    if(n=="Quota"){
                        return;
                    }
                    var nt = {name:n}||{};
                    if(n==message.notificationType || (message.notificationType == "Quota" && n=="Polling")){
                        nt.checked=true;
                    }
                    nt.title=i18n["notification.tip."+nt.name.toLowerCase()];
                    nt.displayName=i18n["notification."+nt.name.toLowerCase()];
                    if(nt.name=="Standard") nt.S=true;
                    if(nt.name=="Polling") nt.P=true;
                    if(nt.name=="Conference") nt.C=true;
                    message.notificationTypes.push(nt);
                });
                //hand answers
                if(!message.questionaire.answers){
                    message.questionaire.answers=[{index:1,hideDelete:true,name:"",quotaNum:""}];
                }else{
                    $.each(message.questionaire.answers,function(i,answer){
                        answer.hideDelete=false;
                        answer.index=i+1;
                        answer.quotaNum = answer.quotaNum || "";
                    });
                    if(message.questionaire.answers.length==1){
                        message.questionaire.answers[0].hideDelete = true;
                    }
                }
                //hand conferenceBridges
                message.conferenceBridges = response.conferenceBridges||[];
                $.each(message.conferenceBridges,function(i,c){
                    if(!message.conferenceBridgeId && i==0){
                        message.conferenceBridgeId = c.id;
                    }
                    c.selected = c.id==message.conferenceBridgeId;
                });
                var _message={load:true,saveAsMessageTemplate:false};
                $.extend(_message,message);
                return $.extend(true,{},_message);
            }
        },
        MessageAppView:{
            messageMaxLength:2500,
            jDom:{},
            template:{},
            uploader:{},
            subApps:{},
            initialize:function () {
                $.templates({
                    messageTemplate: $("#messageTemplate").html(),
                    pollingAnswerTemplate:$("#pollingAnswerTemplate").html(),
                    uploadItemTemplate:$("#uploadItemTemplate").html(),
                    telephoneInstructions:$('#telephoneInstructions').html()
                });
                this.template.messageTemplate = $.render.messageTemplate;
                this.template.pollingAnswerTemplate = $.render.pollingAnswerTemplate;
                this.template.uploadItemTemplate = $.render.uploadItemTemplate;
                this.template.telephoneInstructions = $.render.telephoneInstructions;
                
                this.model.on("change:load",this.render,this);
                this.model.on("change:priority",this.renderPriority,this);
                this.model.on("change:title",this.renderTitle,this);
                this.model.on("change:textMessage",this.renderTextMessage,this);
                this.model.on("change:audioFiles",this.loadVoice,this);
                this.model.on("change:preMessage",this.renderPreMessage,this);
                this.model.on("change:postMessage",this.renderPostMessage,this);
                this.model.on("change:variableValueList",this.variableValueList,this);
                this.model.on("change:notificationType",this.renderNotificationType,this);
                this.model.on("change:_hasVoice",this.ignoreRequiredValidate,this);
                this.model.on("change:_publishChecked",this.ignoreRequiredValidate,this);
                this.model.on("change:_onlyIpawsChecked",this.ignoreRequiredValidate,this);
                this.model.on("change:_hasContacts",this.ignoreRequiredValidate,this);
                this.model.on("change:_isSaved",this.ignoreRequiredValidate,this);
//                this.model.on("change:needAttachs",this.dealNeedAttachs,this);
//                this.model.on("change:hasAttachs",this.dealHasAttachs,this);
//                this.model.on("change:emailfaxAttachSwitch",this.dealEmailfaxAttachSwitch,this);

                if(this.model.urlRoot){
                    this.model.fetch();
                }else{
                    this.model.trigger("change:load");
                    this.model.trigger("change:priority");
                    this.model.trigger("change:title");
                    this.model.trigger("change:textMessage");
                    this.model.trigger("change:preMessage");
                    this.model.trigger("change:postMessage");
                    this.model.trigger("change:notificationType");
                }
            },
            onlyHasText:function(){
                return (this.model.get("textMessage") || this.model.get("preMessage") || this.model.get("postMessage") || (this.model.get("formVariableItems") && this.model.get("formVariableItems").length>0 ))&& !this.model.get("_hasVoice");
            },
            onlyHasVoice:function(){
                return !this.model.get("textMessage") && !this.model.get("preMessage") && !this.model.get("postMessage")&& !(this.model.get("formVariableItems") && this.model.get("formVariableItems").length>0 )&& this.model.get("_hasVoice");
            },
            adaptDom:function(){
                this.model.set({"includeSaveAsMessageTemplate":true});
            },
            disableSaveAsMessageTemplate:function(){
                var titleLength = $.trim(this.model.get("title")).length;
                var textLength = $.trim(this.model.get("textMessage")).length;
                var audioLength = (this.subApps.voiceApp && this.subApps.voiceApp.model.get("audioFiles").length) || 0;
                if(titleLength && (textLength || audioLength)){
                    this.$("input[name=saveAsMessageTemplate]").prop("checked",false).prop("disabled",true);
                }else{
                    this.$("input[name=saveAsMessageTemplate]").prop("disabled",false);
                }
            },
            render:function(){
                this.model.set("isSupportFlash",EB_Common.checkFlash(false));
                var navMessage = i18n["notification.title.createmessage"];
                if(this.model.get("status")){
                    navMessage =  i18n["notification.title.updatemessage"];
                }
                this.model.set("navMessage",navMessage);
                if(this.options.isView===false){
                    this.$el.hide();
                }
                if(!this.options.adaptDom){
                    this.adaptDom();
                }else{
                    this.options.adaptDom.call(this);
                }

                this.$el.html(this.template.messageTemplate(this.getIdSuffixModelJSON()));
                var questionaire = this.model.get("questionaire");
                if (questionaire && questionaire.answers && questionaire.answers.length>=9){
                    this.$("#add_polling_answer").hide();
                }
                this.$("#pollingResponseHelp").tooltip({hide:false,position: { my: "left+15 center", at: "right center" }});
                this.$("#quotaHelp").tooltip({hide:false,position: { my: "left+15 center", at: "right center" }});
                this.jDom.messageTitle = this.$("#messageTitle");
                this.jDom.messageTitleView = this.$("#messageTitleView");
                this.jDom.messageLink = this.$("#message_link");
                this.jDom.textMessage = this.$("#textMessage");
                this.jDom.preMessage = this.$("#preMessage");
                this.jDom.preMessageView = this.$("#preMessageView");
                this.jDom.postMessage = this.$("#postMessage");
                this.jDom.postMessageView = this.$("#postMessageView");
                this.jDom.tipTextMessage = this.$("#tipTextMessage");
                this.jDom.voiceContainer = this.$("#voiceContainer");
                this.jDom.saveAsMessageTemplate = this.$("#saveAsMessageTemplate");
                this.jDom.attachmentItemContainer = this.$("#attachmentItemContainer");
                this.jDom.quotaCheckbox = this.$("#quotaCheckbox");
                
                
                var messageApp = this;
                setInterval(function(){
                    messageApp._countTextMessage();
                    messageApp._countPollingMessage();
                },100);
                this.jDom.polling_answers = this.$("#polling_answers");
                if(this.options.isEdit===false){
                    this.$el.find("input,select,textarea").prop("disabled",true);
                    this.$("#add_polling_answer").hide();
                    this.$("#polling_answers").find("i.remove_polling_answer").hide();
                    this.$("#attachmentButtonContainer").hide();
                    this.$("#attachmentItemContainer").parent().show();
                    this.$("#attachmentItemContainer").find("a.up_attachment_del_btn").hide();
                }
                if(this.options.hideUseMessageLink){
                	this.jDom.messageLink.hide();
                }
                if(this.options.formApp) {
                	var me = this;
                	setTimeout(function(){
                		me.messageBlur();
                	}, 1000);
                }
                this.loadVoice();
                this.renderUploader(true);
                this._countTextMessage(true);
                return this;
            },
            messageBlur:function(){
            	this.jDom.preMessage&&this.jDom.preMessage.val()&&this.jDom.preMessage.blur();
            	this.jDom.messageTitle&&this.jDom.messageTitle.val()&&this.jDom.messageTitle.blur();
            	this.jDom.postMessage&&this.jDom.postMessage.val()&&this.jDom.postMessage.blur();
            },
            renderPriority:function(){
                this.$("#i_warring").toggleClass("icn_priority_hover_16",this.model.get("priority"));
            },
            renderTitle:function(){
                this.$("#messageTitle").val(this.model.get("title"));
            },
            renderTextMessage:function(){
                this.$("#textMessage").val(this.model.get("textMessage"));
            },
            renderPreMessage:function(){
                this.$("#preMessage").val(this.model.get("preMessage"));
            },
            renderPostMessage:function(){
                this.$("#postMessage").val(this.model.get("postMessage"));
            },
            renderNotificationType:function(){
                var message = this.model.get("notificationType");
                this.$("#polling_conference_container>div").hide().find("input,select").addClass("ignore").errorCancel();
                switch (message){
                    case "Stander":
                        this.$("#quotaCheckbox").prop("checked",false);
                        break;
                    case "Polling":
                        this.$("#poldiv").show().find(".polling_answer").removeClass("ignore");
                        this.$(".quotaItem").hide();
                        this.$("#poldiv td.answer_value").css('width', $(this.$("#poldiv td.answer_value")).parent().width()*0.95);
                        this.$("#quotaCheckbox").prop("checked",false);
                        break;
                    case "Conference":
                        this.$("#confdiv").show().find("select").removeClass("ignore");
                        this.$("#quotaCheckbox").prop("checked",false);
                        break;
                    case "Quota":
                        this.$("#poldiv").show().find("input").removeClass("ignore");
                        this.$("#quotaCheckbox").prop("checked",true);
                        this.$(".quotaItem").show();
                        break;
                    case "IpawsCmas":
                        this.$("#ipawsdiv").show().find("input").removeClass("ignore");
                        this.$(".quotaItem").hide();
                        this.$("#quotaCheckbox").prop("checked",false);
                        break;
                    default :break;
                }
                this.options.notificationTypeChangeCallBack && this.options.notificationTypeChangeCallBack.call(this,message);
            },
            loadVoice:function(){
                //hand audio file
                var audioFiles = this.model.get("audioFiles") || [];
                if(!this.model.get("voiceData")){
                    if(audioFiles.length){
                        var voiceData = {audioFiles:audioFiles,audioKey:audioFiles[0].id,voiceSource:audioFiles[0].voiceSource};
                        this.model.set("voiceData",voiceData);
                    }
                }

                var that = this;
                this.subApps.voiceApp = EB_View.notification.app.VoiceApp.getInstance({
                    sessionId: this.options.sessionId,
                    modelData:this.model.get("voiceData"),
                    container:this.jDom.voiceContainer,
                    isView:this.options.isView,
                    isEdit:this.options.isEdit,
                    changeVoiceTypeCallback:function(val){
                        that.model.set("_hasVoice",val==="None"?false:true);
//                        that.ignoreTextmessage(val==="None"?false:true);
                        if($.isFunction(that.options.messageTypeChangeCallback)){

                            that.options.messageTypeChangeCallback(val);
                        }
                    }
                });
            },
            hasVoiceChange:function(model){
                if(model.get("_hasVoice")){
                    this.ignoreTextmessage(true);
                }else{
                    this.ignoreTextmessage(false);
                }
            },
            ignoreTextmessage:function(isIgnored){
                if(this.model.get("includeTextMessage")===false){
                    return;
                }
                if(isIgnored){
                    this.$("#textMessage").removeClass("required").valid();
                }else if(!this.model.get("_hasVoice")){
                    this.$("#textMessage").addClass("required");
                }

            },
            renderUploader:function(activeAttachment){
                if(EB_Common.isIpad) return;
                var messageApp = this;
                if(activeAttachment){
                    //var button_width = $("#attachmentButtonId"+this.cid).text().outerWidth(true);
                    var temp_span = $('<span/>').text(i18n['notification.model.attachmentfiles']).appendTo(document.body);
                    var button_width = temp_span.outerWidth(true) + 10;
                    temp_span.remove();
                    //console.info(button_width);
                    this.uploader.attachmentUploader = new EB_View.notification.uploader({
                        sessionId : messageApp.options.sessionId,
                        uploadUrl : "/upload/file",
                        container:this.$("#attachmentItemContainer"),
                        buttonId:"attachmentButtonId"+this.cid,
                        btnText : i18n['notification.model.attachmentfiles'],
                        button_width : button_width,
                        maxFilesCount : 5,
                        fileTypes : "*.*",
                        fieldName : "uploadedAttachments",
                        buttonImageUrl : "",
                        fileLimit : "1 MB",
                        uploadItemTemplate:$("#uploadItemTemplate"),
                        max_total_file_size:"2",  //unit is MB
                        wavCheck:false,
                        existFiles:this.model.get("attachmentFiles"),
                        uploadSuccess:function(swfFile,serverFile){
                            serverFile.swfFileId = swfFile.id;
                            serverFile.newFile = true;
                            serverFile.serverFileName = serverFile.fileName + "-" + serverFile.originFileName;
                            serverFile.fileName = swfFile.name;
                            serverFile.size = swfFile.size;
                            var files = $.merge([],messageApp.model.get("attachmentFiles"));
                            files.push(serverFile);
                            messageApp.model.set({"attachmentFiles":files},{silent:true});
//                            messageApp.model.set("hasAttachs",true);
                        },
                        uploadError:function(file,serverFile,callback){
                            file.container.remove();
                            EB_Common.dialog.alert(serverFile.message);
                            callback&&callback();
                        },
                        removeFile:function(swfFileId){
                            var files = $.merge([],messageApp.model.get("attachmentFiles"));
                            var newFiles = [];
                            $.each(files,function(i,file){
                                if(file.swfFileId!=swfFileId){
                                    newFiles.push(file);
                                }
                            });
                            messageApp.model.set({"attachmentFiles":newFiles});
                            /*if(!newFiles || !newFiles.length){
                                messageApp.model.set("hasAttachs",false);
                            }*/
                        }
                    });
                }
            },

            events:function(){
                var events = {
                    "click #message_link":"eventClickMessageLink",
                    "change input[name='priority']":"eventChangePriority",
                    "keyup #messageTitle":"eventChangeMessageTitle",
                    "blur #messageTitle":"eventChangeMessageTitle",
                    "keyup #textMessage":"eventChangeTextMessage",
                    "blur #textMessage":"eventChangeTextMessage",
                    "keyup #preMessage":"eventChangePreMessage",
                    "keyup #postMessage":"eventChangePostMessage",
                    "blur #preMessage":"eventChangePreMessage",
                    "blur #postMessage":"eventChangePostMessage",
                    "blur .message-content":"eventBlurMessageContent",
                    "focus .message-content":"eventFocusMessageContent",
                    "change input[name^='type']":"eventChangeMessageType",
                    "change input[name='saveAsMessageTemplate']":"eventChangeSaveAsMessageTemplate",
                    "click #add_polling_answer":"eventClickAddPollingAnswer",
                    "change #quotaCheckbox":"eventChangeQuotaCheckbox",
                    "click #polling_answers .remove_polling_answer":"eventClickRemovePollingAnswer",
                    "focus #polling_answers .polling_answer":"eventFocusPollingAnswer",
                    "change #polling_answers input":"eventChangePollingAnswer",
                    "blur #polling_answers input":"eventChangePollingAnswer",
                    "change #conferenceBridgeId":"eventChangeConferenceBridgeId",
                    "change #attach_files_check":"eventChangeAttachCheck",
//                    "change #send_email":"eventChangeAttachEmail",
//                    "change #send_fax":"eventChangeAttachFax"
                    "change .attachSwitch":"eventChangeAttachSwitch"
                };
                if (this.options.apply == "incidentTemplate") {
                	events["blur #messageTitle"] = "eventBlurInput";
                	events["blur #preMessage"] = "eventBlurInput";
                	events["blur #postMessage"] = "eventBlurInput";
                	
                	events["click #postMessageView"] = "eventclickView";
                	events["click #preMessageView"] = "eventclickView";
                	events["click #messageTitleView"] = "eventclickView";
                	
                	events["click #postMessage"] = "eventClikInput";
                	events["click #preMessage"] = "eventClikInput";
                	events["click #messageTitle"] = "eventClikInput";
                	
                	events["focus #postMessage"] = "eventFocusInput";
                	events["focus #preMessage"] = "eventFocusInput";
                	events["focus #messageTitle"] = "eventFocusInput";
                	
                	events["keyup #postMessage"] = "indexCount";
                	events["keyup #preMessage"] = "indexCount";
                	events["keyup #messageTitle"] = "indexCount";
                	
                }
                if(this.options.isEdit===false){
                    events={};
                }
                return this.dealEvents(events,this.cid);
            },
            _countTextMessage:function(execute){
                var max1 = this.messageMaxLength,max2 = 120,varibleLength = (this.options.formApp&&this.options.formApp.getVaribleLength())||0;
                max1 = max1 - varibleLength;
                if(!(this.jDom.textMessage.length || this.jDom.messageTitle.length || this.jDom.preMessage.length || this.jDom.postMessage.length)) return;
                var textLen = this.jDom.textMessage.val().countLength(),titleLen = this.jDom.messageTitle.val().countLength(),preLen = 0,postLen = 0;
                if((this.model.get("includePreMessage")&&this.model.get("includePostMessage"))){
                    preLen = this.jDom.preMessage.val().countLength();
                    postLen= this.jDom.postMessage.val().countLength();
                }
                if(this.jDom.typeInDom || execute){
                    var dom = null;
                    if(execute){
                        dom = this.jDom.messageTitle;
                    }else{
                        dom = this.jDom.typeInDom;
                    }
                    var val = dom.val();
                    var len = titleLen+textLen + preLen + postLen;
                    var last = 0;
                    if(dom.attr("id").indexOf("messageTitle")>-1){
                        last = max1-(textLen + preLen + postLen);
                        if(titleLen>last){
                            dom.val(val.substring2(0,last));
                        }
                    }else if(dom.attr("id").indexOf("preMessage")>-1){
                        last = max1-(textLen + titleLen + postLen);
                        if(preLen>last){
                            dom.val(val.substring2(0,last));
                        }
                    }else if(dom.attr("id").indexOf("textMessage")>-1){
                        last = max1-(titleLen + preLen + postLen);
                        if(textLen>last){
                            dom.val(val.substring2(0,last));
                        }

                    }else if(dom.attr("id").indexOf("postMessage")>-1){
                        last = max1-(titleLen+textLen + preLen);
                        if(postLen>last){
                            dom.val(val.substring2(0,last));
                        }
                    }
                    //dom.scrollTop(100000);
                    max1 = max1 - len;
                    max2 = max2 - (len % 120);
                    if(max1<0||max2<0)return;
                    var count2 = parseInt(len / 120) + 1;
                    this.jDom.tipTextMessage.html($.validator.format(i18n['notification.text.smsmessage'], max1.toString(), max2, count2));  //modified by daniel
                }
                if($.trim(this.jDom.messageTitle.val()).length){
                    var existAudio = false;
                    if(this.subApps.voiceApp){
                        existAudio = this.subApps.voiceApp.model.get("audioFiles") && this.subApps.voiceApp.model.get("audioFiles").length;
                    }
                    var existTextMessage = $.trim(this.jDom.textMessage.val()).length>0;
                    if(existAudio || existTextMessage){
                        this.jDom.saveAsMessageTemplate.prop("disabled",false);
                    }else{
                        this.jDom.saveAsMessageTemplate.prop("checked",false).trigger("change").prop("disabled",true);
                    }
                }else{
                    this.jDom.saveAsMessageTemplate.prop("checked",false).trigger("change").prop("disabled",true);
                }
            },
            _countPollingMessage:function(){
                if(this.jDom.focusedPollingAnswer){
                    var answerDoms = this.$("#polling_answers").children(),count=0;
                    answerDoms.each(function(i){
                        var t = $(this);
                        count+=t.find("input[name=answer]").val().countLength();
                    });

                    var val = this.jDom.focusedPollingAnswer.val(),lastLength = Math.max(0,500-count+val.countLength());
                    if(val.countLength()>lastLength){
                        this.jDom.focusedPollingAnswer.val(val.substring2(0,lastLength));
                    };
                }
            },
            eventFocusPollingAnswer:function(e){
                this.jDom.focusedPollingAnswer = $(e.target);
            },
            eventClickMessageLink:function(){
                if(this.subApps.templateApp)
                    this.subApps.templateApp.$el.dialog("open");
            },
            eventChangePriority:function(e){
                this.model.set({"priority":$(e.currentTarget).prop("checked")});
            },
            eventChangeMessageTitle:function(e){
                this.model.set({title:$.trim($(e.currentTarget).val())},{silent:true});
            },
            eventChangeTextMessage:function(e){
                this.model.set({textMessage:$(e.currentTarget).val()},{silent:true});
            },
            eventChangePreMessage:function(e){
                this.model.set({preMessage:$(e.currentTarget).val()},{silent:true});
            },
            eventChangePostMessage:function(e){
                this.model.set({postMessage:$(e.currentTarget).val()},{silent:true});
            },
            eventclickView:function(e){
            	var target = $(e.currentTarget), input = target.siblings("input,textarea");
            	input&&input.show().focus();
            	target.hide();
            	e.stopPropagation();
            },
            eventClikInput:function(e){
            	this.indexCount(e);
            	e.stopPropagation();
            },
            
            indexCount:function(e){
            	var target = $(e.currentTarget);
            	window.targetIndex = EB_Common.position(target);
            },
            eventFocusInput:function(e){
            	var target = $(e.currentTarget), formApp = this.options.formApp, targetInput = formApp.model.get("targetInput");
            	targetInput&&targetInput.attr("id") != target.attr("id")&&targetInput.blur();
            	if (formApp) {
            		formApp.addTokenFromList = false;
            		this.timeout&&clearTimeout(this.timeout); //deal with the "+" button flush
            		formApp.model.set("targetInput", target);
            	}
            	
            },
            eventBlurInput:function(e){
            	var target = $(e.currentTarget),viewDiv = target.siblings("div"), value = target.val(),reg = /{(.*?)}/g,names = [], id = target.attr("id"),name="",formApp = this.options.formApp,me = this;
            	while(name = value&&reg.exec(value)) {
            		    if($.inArray(name[1],names) < 0) {
            		    	names.push(name[1]);
            		    }
            	}
            	id&&id.indexOf("messageTitle")!= -1&&this.model.set({title:$.trim(value)},{silent:true});
            	id&&id.indexOf("preMessage")!= -1&&this.model.set({preMessage:$.trim(value)},{silent:true});
            	id&&id.indexOf("postMessage")!= -1&&this.model.set({postMessage:$.trim(value)},{silent:true});
            	value = EB_Common.htmlEncode(value);
            	
            	if (names&&names.length) {
            		var variables = formApp.model.get("variables")||[],sysVariables = formApp.model.get("sysVariables");
            		sysVariables&&(variables = variables.concat(sysVariables));
            		$.each(variables, function(k, v){
            			value = value.replceIgnoreRegex("{" + EB_Common.htmlEncode(v.variableName) + "}", "<span style='color:green;'>{" + EB_Common.htmlEncode(v.variableName) + "}</span>");
            		});
            	}
				me.timeout&&clearTimeout(me.timeout);
				me.timeout = setTimeout(function(){
					if (!formApp.addTokenFromList) {
						formApp.model.set("targetInput", null);
					}
				}, 200);
				
				// deal with '+' to add token.
				setTimeout(function(){
					if (target.val()&&target.valid()){
						if (!formApp.addTokenFromList) {
						value = value&&value.replace(/\n/g, '<br />');
						viewDiv.html(value);
						if (names&&names.length) {
							target.hide();
							viewDiv.show();
						}
						}
					}
				}, 200);
            },
            eventBlurMessageContent:function(e){
//                var j = $(e.target);
//                this.jDom.typeInDom = j;
            },
            eventFocusMessageContent:function(e){
                var j = $(e.target);
                this.jDom.typeInDom = j;
            },
            eventChangeSaveAsMessageTemplate:function(e){
                this.model.set({"saveAsMessageTemplate":e.target.checked});
            },
            eventChangeMessageType:function(e){
                this.model.set({"notificationType":e.target.value});
                var notificationTypes = this.model.get("notificationTypes");
                $.each(notificationTypes,function(i,n){
                    n.checked = n.name == e.target.value;
                });
            },
            eventChangeQuotaCheckbox:function(e){
                var j = $(e.target);
                var answer_value = j.closest('table').find('td.answer_value');
                if(e.target.checked){
                    this.model.set({"notificationType":e.target.value});
                    answer_value.css('width',answer_value.parent().width()*0.65);
                }else{
                    this.model.set({"notificationType":"Polling"});
                    answer_value.css('width',answer_value.parent().width()*0.95);
                }
            },
            eventClickAddPollingAnswer:function(e){
                var q = this.model.get("questionaire"),a = q.answers,answer = {idSuffix:this.cid,index:a.length+1,hideDelete:false,name:"",hideQuota:!this.jDom.quotaCheckbox.prop("checked")};
                a.push(answer);
                this.model.set({questionaire:q},{silent:true});
                this.jDom.polling_answers.append(this.template.pollingAnswerTemplate([answer]));
                this.jDom.polling_answers.find(".remove_polling_answer").show();
                if(a.length>=9){
                    this.$("#add_polling_answer").hide();
                    return;
                }
            },
            eventClickRemovePollingAnswer:function(e){
                var j = $(e.target);
                var row = j.closest("tr"),
                    siblings = row.siblings();
                if(siblings.length == 1 ){
                    siblings.find('.icn_action_delete').hide();
                }
                row.remove();
                var q = this.model.get("questionaire");
                var answerDoms = this.$("#polling_answers").children();
                var newAnsers=[];
                answerDoms.each(function(i){
                    var t = $(this);
                    t.find("span.answer_index").text(i+1);
                    newAnsers.push({index:i+1,showDelete:i==0,name:t.find("input[name=answer]").val(),quotaNum:t.find("input[name=quota]").val()});
                });
                q.answers = newAnsers;
                this.model.set({questionaire:q},{silent:true});
                this.$("#add_polling_answer").show();
            },
            eventChangePollingAnswer:function(e){
                var q = this.model.get("questionaire");
                var answerDoms = this.$("#polling_answers").children();
                var newAnsers=[];
                answerDoms.each(function(i){
                    var t = $(this);
                    t.find(".answer_index").text(i+1);
                    newAnsers.push({index:i+1,showDelete:i==0,name:t.find("input[name=answer]").val(),quotaNum:t.find("input[name=quota]").val()});
                });
                q.answers = newAnsers;
                this.model.set({questionaire:q},{silent:true});
            },
            eventChangeConferenceBridgeId:function(e){
                var id = $(e.target).val();
                var conferenceBridges = this.model.get("conferenceBridges");
                $.each(conferenceBridges,function(i,c){
                    c.selected = c.id==id;
                });
                this.model.set({"conferenceBridgeId":id,"conferenceBridges":conferenceBridges},{silent:true});
            },
            eventChangeAttachCheck:function(e){
                this.model.set("needAttachs", $(e.target).prop("checked"));
            },
            eventChangeAttachEmail:function(e){
                if($(e.target).prop("checked")){
                    if(this.model.get("emailfaxAttachSwitch")=="FAXONLY" || this.model.get("emailfaxAttachSwitch")=="EMAILANDFAX"){
                        this.model.set("emailfaxAttachSwitch", "EMAILANDFAX");
                    }else{
                        this.model.set("emailfaxAttachSwitch", "EMAILONLY");
                    }
                }else{
                    if(this.model.get("emailfaxAttachSwitch")=="FAXONLY" || this.model.get("emailfaxAttachSwitch")=="EMAILANDFAX"){
                        this.model.set("emailfaxAttachSwitch", "FAXONLY");
                    }else{
                        this.model.set("emailfaxAttachSwitch", null);
                    }
                }
            },
            eventChangeAttachSwitch:function(e){
                var emailSwitch = this.$("#send_email").prop("checked");
                var faxSwitch = this.$("#send_fax").prop("checked");
                var val = "";
                if(emailSwitch && faxSwitch){
                    val = "EMAILANDFAX";
                }else if(emailSwitch){
                    val = "EMAILONLY";
                }else if(faxSwitch){
                    val = "FAXONLY";
                }
                this.model.set("emailfaxAttachSwitch", val);
            },
            eventChangeAttachFax:function(e){
                if($(e.target).prop("checked")){
                    if(this.model.get("emailfaxAttachSwitch")=="EMAILONLY" || this.model.get("emailfaxAttachSwitch")=="EMAILANDFAX"){
                        this.model.set("emailfaxAttachSwitch", "EMAILANDFAX");
                    }else{
                        this.model.set("emailfaxAttachSwitch", "FAXONLY");
                    }
                }else{
                    if(this.model.get("emailfaxAttachSwitch")=="EMAILONLY" || this.model.get("emailfaxAttachSwitch")=="EMAILANDFAX"){
                        this.model.set("emailfaxAttachSwitch", "EMAILONLY");
                    }else{
                        this.model.set("emailfaxAttachSwitch", null);
                    }
                }
            },
            ignoreRequiredValidate:function(model){
                if(this.model.get("includeTextMessage")===false){
                    return;
                }
                var _isSaved = model.get("_isSaved");
                var hasContacts = model.get("_hasContacts");
                var publishChecked = model.get("_publishChecked");
                var onlyIpawsChecked = model.get("_onlyIpawsChecked");
                var hasVoice = model.get("_hasVoice");
                if(_isSaved){
                    this.$("#textMessage").removeClass("required").valid();
                }else if(publishChecked && !onlyIpawsChecked){
                    this.$("#textMessage").addClass("required");
                }else{
                    if(hasContacts){
                        if(hasVoice){
                            this.$("#textMessage").removeClass("required").valid();
                        }else{
                            this.$("#textMessage").addClass("required");
                        }
                    }else if(onlyIpawsChecked){
                        this.$("#textMessage").removeClass("required").valid();
                    }else{
                        if(hasVoice){
                            this.$("#textMessage").removeClass("required").valid();
                        }else{
                            this.$("#textMessage").addClass("required");
                        }
                    }
                }
            },
            dealNeedAttachs:function(model){
                if(model.get("needAttachs")){
                    this.$("#attachDiv").show();
                    this.$("#needAttachValidate").addClass("required");
                    this.$("#attachSwitchTypeValidate").addClass("required");
                }else{
                    this.$("#attachDiv").hide();
                    this.$("#needAttachValidate").removeClass("required").valid();
                    this.$("#attachSwitchTypeValidate").removeClass("required").valid();
                }
            },
            dealHasAttachs:function(model){
                if(model.get("hasAttachs")){
                    this.$("#needAttachValidate").val("true").valid();
                }else{
                    this.$("#needAttachValidate").val("").valid();
                }
            },
            dealEmailfaxAttachSwitch:function(model){
                if(model.get("emailfaxAttachSwitch")){
                    this.$("#attachSwitchTypeValidate").val("true").valid();
                }else{
                    this.$("#attachSwitchTypeValidate").val("").valid();
                }
            },
            ignoreValidate:function(isIgnored){
            	if (isIgnored) {
            		this.$("#messageTitle").removeClass("required").valid();
            	} else {
            		this.$("#messageTitle").addClass("required").valid();
            	}
            },
            ignoreValidate2:function(isIgnored){//for Incident template mgmt only. by Daniel, Allen
            	if (isIgnored) {
            		this.$("#messageTitle").removeClass("required");
            	} else {
            		this.$("#messageTitle").addClass("required");
            	}
            },
            getData:function(){
                var model = this.model.toJSON();
                model.load = false;
                if(this.subApps.voiceApp){
                    model.voiceData = this.subApps.voiceApp.getData();
                    model.voiceData.includeAVoice = false;
                }
                return $.extend(true,{},model);
            },
            getFormData:function(namePrefix){
                var data = this.getData();
                data.namePrefix = namePrefix || "";
                return $("#messageFormTemplate").render([data]);
            },
            getJsonData:function(parentObj){
                var data = this.getData();
                parentObj.priority = data.priority?"Priority":"NonPriority";
                parentObj.message = {
                    title:data.title,
                    textMessage:data.textMessage,
                    saveAsMessageTemplate:data.saveAsMessageTemplate===true

                };
                if(data.includePreMessage){
                    parentObj.message.preMessage = data.preMessage;
                }
                if(data.includePostMessage){
                    parentObj.message.postMessage = data.postMessage;
                }
                parentObj.type = data.notificationType;
                if(this.subApps.voiceApp){
                    this.subApps.voiceApp.getJsonData(parentObj.message);
                }
                parentObj.message.uploadedAttachments=[];
                parentObj.message.fileIds=[];
                parentObj.message.fileNames=[];
                parentObj.message.mimeTypes=[];
                parentObj.message.isImages=[];
                parentObj.message.fileSizes = [];
                $.each(data.attachmentFiles,function(i,file){
                    if(file.newFile){
                        parentObj.message.uploadedAttachments.push(file.serverFileName);
                    }else{
                        parentObj.message.fileIds.push(file.fileId);
                        parentObj.message.fileNames.push(file.serverFileName);
                        parentObj.message.mimeTypes.push(file.mimeType);
                        parentObj.message.isImages.push(file.image);
                        parentObj.message.fileSizes.push(file.size);
                    }
                });
                /*if(data.needAttachs){

                    parentObj.message.emailfaxAttachSwitch = data.emailfaxAttachSwitch;
                }*/
                if(data.notificationType=="Polling"){
                    parentObj.message.questionaire={answers:[]};
                    $.each(data.questionaire.answers,function(i,a){
                        parentObj.message.questionaire.answers.push({name:a.name});
                    });
                }
                if(data.notificationType=="Quota"){
                    parentObj.message.questionaire={answers:[]};
                    $.each(data.questionaire.answers,function(i,a){
                        parentObj.message.questionaire.answers.push({name:a.name,quotaNum:a.quotaNum});
                    });
                }
                if(data.notificationType=="Conference"){
                    parentObj.message.conferenceBridgeId = data.conferenceBridgeId;
                }
                return parentObj;
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{container:$("body")},_options||{});
            var Model = Backbone.Model.extend(this.MessageModel);
            var View = EB_Common.Backbone.View.extend(this.MessageAppView);
            var message = options.model;
            if(options.url){
                message = new Model(null,{url:options.url});
            }
            return new View({
                el:options.container,
                model:message,
                notificationTypeChangeCallBack:options.notificationTypeChangeCallBack,
                messageTypeChangeCallback:options.messageTypeChangeCallback,
                adaptDom:options.adaptDom,
                sessionId:options.sessionId,
                templateApp:options.templateApp,
                isView:options.isView,
                isEdit:options.isEdit,
                formApp:options.formApp,
                apply:options.apply,
                hideUseMessageLink:options.hideUseMessageLink,
                pubishChecked:options.pubishChecked
            });
        }
    };
    view.notification.app.MessageTemplateApp={
        MessageTemplateView:{
            jDom:{},
            template:{},
            initialize:function(){
                $.templates({
                    messageTemplateTemplate: $("#messageTemplateTemplate").html()
                });
                this.template.messageTemplateTemplate = $.render.messageTemplateTemplate;
                this.isCrossOrg =this.options.isCrossOrg;
                this.listUrl = this.options.listUrl;
                this.getedUrl = this.options.getedUrl;
                this.render();
            },
            render:function(){
                this.$el.html(this.template.messageTemplateTemplate(this.getIdSuffixModelJSON()));
                this.jDom.messageGrid = this.$("#message_gridTable");
                var messageTemplateApp = this;
                var url = this.getedUrl|| "/msgTemplates/";
                var okButtonId = "okButton"+this.cid;
                this.$el.dialog({
                    autoOpen : false,
                    width : 600,
                    height : "auto",
                    modal : true,
                    resizable : false,
                    title:i18n["notification.title.selmessage"],
                    open:function(){
                        messageTemplateApp.initMessageTemplateGridData();
                    },
                    buttons : {
                        Ok : {
                            click : function() {
                                var tId = messageTemplateApp.jDom.messageGrid.jqGrid('getGridParam','selrow');
                                var dialog = $(this);
                                if(tId){
                                    EB_Common.Ajax.get(url + tId, {}, function(data) {
                                        var msgTemplate = data.msgTemplate;
                                        if (msgTemplate) {
                                            var newMessage = {
                                                id:msgTemplate.id,
                                                title:msgTemplate.title,
                                                textMessage:msgTemplate.textMessage,
                                                audioFiles:[]
                                            }||{};
                                            newMessage.categoryName = msgTemplate.category ? msgTemplate.category.name : '';
                                            if(msgTemplate.audio){
                                                newMessage.voiceSource = msgTemplate.voiceSource || "None";
                                                newMessage.includeAVoice = newMessage.voiceSource != "None";
                                                var file = $.extend(true,{},msgTemplate.audio);
                                                file.index = 1;
                                                file.hideProgress = true;
                                                file.swfFileId=1;
                                                file.fileName = file.name;
                                                file.voiceSource=msgTemplate.voiceSource;
                                                newMessage.audioFiles = [file];
                                            }
                                            messageTemplateApp.options.okCallBack && messageTemplateApp.options.okCallBack.call(messageTemplateApp,newMessage);
                                        }
                                        dialog.dialog("close");
                                    }, 'json');
                                }else{
                                    dialog.dialog("close");
                                }
                            },
                            'class' : 'gray',
                           // 'disabled' : "disabled",
                            text : i18n['global.dialog.button.ok'],
                            id : okButtonId
                        },
                        Cancel : {
                            click : function() {
                                $(this).dialog("close");
                            },
                            'class' : 'gray',
                            text : i18n['global.dialog.button.cancel']
                        }
                    }
                });
            },

            events:{},
            initMessageTemplateGridData:function(){
                var templateApp = this;
                var url = this.listUrl || EB_Common.Ajax.wrapperUrl("/msgTemplates/list");
                this.jDom.messageGrid.jqGrid(
                    {
                        autoencode:true,
                        url : url,
                        datatype : "json",
                        emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                        jsonReader : {
                            root : "data",
                            page : "currentPageNo",
                            total : "totalPageCount",
                            records : "totalCount",
                            repeatitems : false
                        },
                        height : "auto",
                        width : 570,
                        rowNum: 10,
                        rowList: [10],
                        colNames : [
                            '',
                            i18n['broadcasttemplate.field.messagetitle'],
                            i18n['broadcasttemplate.field.voicetext'],
                            i18n['broadcasttemplate.field.createby'],
                            i18n['broadcasttemplate.field.createdate']
                        ],
                        colModel : [
                            {
                                name : 'id',
                                index : 'id',
                                width : 10,
                                align : "center",
                                sortable : false,
                                formatter : function(value, rec) {
                                    return '<input type="radio" name="templateSelect" value="' + value + '" class="msg_select_radio"/>';
                                }
                            }, {
                                name : 'title',
                                index : 'title',
                                width : 90
                            }, {
                                name : 'contentType',
                                index : 'contentType',
                                width : 50
                            }, {
                                name : 'createdName',
                                index : 'createdName',
                                width : 40,
                                sorttype : "string"
                            }, {
                                width : 70,
                                name : 'createdDate',
                                index : 'createdDate',
                                sorttype : "datetime",
                                sortable : true
                            } ],
                        sortname : 'createdDate',
                        sortorder : 'desc',
                        viewrecords : true,
                        pager : templateApp.$("#message_gridPager"),
                        multiselect : false,
                        prmNames : {
                            page : "pageNo",
                            totalrows : "totalrows"
                        },
                        onSelectRow : function(rowId, status) {
                            var chart_cell = templateApp.jDom.messageGrid.getInd(rowId, true);
                            if (chart_cell && chart_cell.cells) {
                                var chart_container = chart_cell.cells[0].childNodes[0];
                                chart_container.checked = true;
                                var okButtonId = "okButton"+templateApp.cid;
                                $("#"+okButtonId).addClass("orange").removeClass("gray").prop("disabled",false);

                            }
                        },
                        afterInsertRow : function(id, rowdata, rowele) { // display chart after insert
                            var chart_cell = templateApp.jDom.messageGrid.getInd(id, true);
                            if (chart_cell && chart_cell.cells) {
                                var chart_container = chart_cell.cells[0].childNodes[0];
                                chart_container.onchange = function(){
                                    templateApp.jDom.messageGrid.setSelection(this.value, true);
                                };
                            }
                        },
                        loadComplete:function(){
                            templateApp.$el.dialog("option","position",{
                                    my: 'center',
                                    at: 'center',
                                    of: window,
                                    collision: 'fit'}
                            );
                            var okButtonId = "okButton"+templateApp.cid;
                            $("#"+okButtonId).addClass("gray").removeClass("orange").prop("disabled",true);
                        }
                    });
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var View = EB_Common.Backbone.View.extend(this.MessageTemplateView);
            return new View({okCallBack:options.okCallBack,model:new Backbone.Model(),
                listUrl:options.listUrl,getedUrl:options.getedUrl,isCrossOrg:options.isCrossOrg});
        }
    };
})(EB_View);