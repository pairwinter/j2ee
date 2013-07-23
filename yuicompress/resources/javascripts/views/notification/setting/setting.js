(function(view,i18n){
    view.notification.app.SettingApp={
        settingAppModel:{
            defaults:function(){
                return {
                    load:false,
                    loadCompleted:false
                };
            },
            initialize:function () {
                if(arguments && arguments.length>1 && arguments[1].url){
                    this.urlRoot=arguments[1].url;
                }
            },
            parse:function(response){
            	if(!response) return; // Matrix exception handle            		
                EB_Common.logger.log("setting");
                EB_Common.logger.log(response);
                var org = response.org||{};
                var bcTemplate = response.bcTemplate||{};
                var setting = $.extend({},bcTemplate.broadcastSettings||{});
                setting.hasMybridge = response.hasMybridge;
                //hand senderEmail
                setting.senderEmailSetting = {senderEmail:setting.senderEmail,readonly:!(response.senderInfoPermission ||org.senderInfoPermission)};
                //hand senderCallerId
                setting.senderCallerIdSetting = {};
                var senderCallers = $.merge([],response.senderCallers||[]);
                setting.senderCallerIdSetting.savedSenderCallers = $.merge([],response.savedSenderCallers||[]);
                $.each(senderCallers,function(i,senderCaller){
                    senderCaller.id=i;
                    senderCaller.readonly=!(response.senderInfoPermission ||org.senderInfoPermission);
                    senderCaller.validation = "required:true {phone_length:['"+senderCaller.countryCode+"','"+senderCaller.countryCode+"']}";
                    $.each(bcTemplate.broadcastSettings.senderCallerInfos||[],function(i,senderCaller2){
                        if(senderCaller2.countryCode == senderCaller.countryCode){
                            senderCaller.callerId = senderCaller2.callerId;
                        }
                    });
                });
                setting.senderCallerIdSetting.senderCallers = senderCallers;

                //hand deliverPaths;
                setting.deliverPathSetting = {};
                setting.orgPaths = response.orgPaths||[];
                setting.deliverPaths = setting.deliverPaths||[];
                var deliverPathsIds= [];
                $.each(setting.deliverPaths,function(i,path){
                    deliverPathsIds.push(path.id);
                });
                var RECIP_Checked = false,fromBc = false;
                if(deliverPathsIds.length){
                    $.each(setting.orgPaths,function(i,path){
                        if($.inArray(path.id,deliverPathsIds)>-1){
                            path.checked = true;
                            if(path.code=="RECIP"){
                                RECIP_Checked = true;
                            }
                        }
                    });
                    fromBc = true;
                }else{
                    $.each(setting.orgPaths,function(i,path){
                        if(path.isDefault){
                            path.checked = true;
                            if(path.code=="RECIP"){
                                RECIP_Checked = true;
                            }
                        }
                    });
                }
                setting.deliverPathSetting.orgPaths = $.merge([],setting.orgPaths);
                //hand recipientApp
                setting.mobileSettings = setting.mobileSettings||{};
                setting.mobileSettings.hasMybridge = setting.hasMybridge;
                var b = fromBc,rc = RECIP_Checked;
                if(!b && rc){
                    setting.mobileSettings.requestLocation = true;
                    setting.mobileSettings.requestImage = true;
                    setting.mobileSettings.requestComment = true;
                }
                setting.mobileSettings.requestLocationChecked = rc && setting.mobileSettings.requestLocation;
                setting.mobileSettings.requestImageChecked =rc && setting.mobileSettings.requestImage;
                setting.mobileSettings.requestCommentChecked =rc && setting.mobileSettings.requestComment;

                setting.mobileSettings.requestLocationDisabled = !rc;
                setting.mobileSettings.requestImageDisabled = !rc;
                setting.mobileSettings.requestCommentDisabled = !rc;
//                && !setting.recipientApp
                setting.mobileSettings.allowShareMessage = org.allowShareMessage;
                setting.mobileSettings.shareMessageStatus = org.shareMessageStatus;
                if(org.allowShareMessage){
                    setting.mobileSettings.allowShareChecked = b?(rc && setting.mobileSettings.allowShare):(rc && org.shareMessageStatus);
                    setting.mobileSettings.allowShareDisabled = !rc;
                }else{
                    if(response.org){
                        setting.mobileSettings.allowShareChecked = false;
                        setting.mobileSettings.allowShareDisabled = true;
                    }else{
                        setting.mobileSettings.allowShareChecked = b?(rc && setting.mobileSettings.allowShare):(rc && org.shareMessageStatus);
                        setting.mobileSettings.allowShareDisabled = !rc;
                    }

                }
                
                //hand throttling
                setting.throttleSetting = org.throttleSetting||response.throttleSetting||{};
                setting.throttleSetting.throttleRules = response.throttleRules;
                setting.throttleSetting.yesOrNo = ((bcTemplate.id==0 && setting.throttleSetting.applyByFlag) || setting.throttleSetting.enforceAllFlag || setting.throttle)?i18n["setting.broadcast.confirmation.yes"]:i18n["setting.broadcast.confirmation.no"];
                setting.throttleSetting.throttlDefaultAmount = setting.throttlDefaultAmount;
                setting.throttleSetting.senderReviewFlag = setting.throttleSetting.senderReviewFlag;
                setting.throttleSetting.throttleChecked= (bcTemplate.id==0 && setting.throttleSetting.applyByFlag) || setting.throttleSetting.enforceAllFlag || setting.throttle;

                //hand duration
                setting.durationSetting={};
                setting.durationSetting.duration=setting.duration;
                setting.durationSetting.durations = [];
                for(var i=1;i<=24;i++){
                    setting.durationSetting.durations.push({index:i,selected:setting.durationSetting.duration==i});
                }
                //hand contactCycle
                setting.contactCycleSetting={};
                setting.contactCycleSetting.contactCycle=setting.contactCycles;
                setting.contactCycleSetting.contactCycles = [];
                for(var i=1;i<=response.maxCycles;i++){
                    setting.contactCycleSetting.contactCycles.push({index:i,selected:setting.contactCycleSetting.contactCycle==i});
                }
                //hand contactCycle
                setting.cycleintervalSetting={};
                setting.cycleintervalSetting.cycleInterval=setting.cycleInterval;
                setting.cycleintervalSetting.cycleIntervals = [];
                for(var i=0;i<=60;i++){
                    if(i<3 || i%5==0){
                        setting.cycleintervalSetting.cycleIntervals.push({index:i,selected:setting.cycleintervalSetting.cycleInterval==i});
                    }
                }
                //hand methodInterval
                setting.methodIntervalSetting={};
                setting.methodIntervalSetting.deliveryMethodInterval=setting.deliveryMethodInterval;
                setting.methodIntervalSetting.deliveryMethodIntervals = [];
                for(var i=0;i<=3;i++){
                    setting.methodIntervalSetting.deliveryMethodIntervals.push({index:i,selected:setting.methodIntervalSetting.deliveryMethodInterval==i});
                }
                //hand VoiceMail
                setting.voiceMailOption = setting.voiceMailOption;
                var message = bcTemplate.message || {};
                if(!message.notificationType){
                    message.notificationType = "Standard";
                }
                setting.voiceMailSetting = {voiceMailOption:null,displayVoiceMailOption:"",isHide:message.notificationType=="Conference",messageWithConfirmationDisabled:true};
                if(setting.voiceMailOption){
                    setting.voiceMailSetting.voiceMailOption = setting.voiceMailOption;
                    //move the "Message with Confirmation" option enable/disable check logic here, to avoid user needs to click confirm checkbox twice to enable this option.
                    //For Notification and Incident. Allen 4/11/2013
                    if(setting.confirm){
                    	setting.voiceMailSetting.messageWithConfirmationDisabled = false;
                    }
                    if(setting.voiceMailOption == "MESSAGE_ONLY"){
                        setting.voiceMailSetting.messageOnlyChecked = true;
                        setting.voiceMailSetting.displayVoiceMailOption = i18n["notification.title.setting.voicemail.messageonly"];
                    }else if(setting.voiceMailOption == "NO_MESSAGE"){
                        setting.voiceMailSetting.noMessageChecked = true;
                        setting.voiceMailSetting.displayVoiceMailOption = i18n["notification.title.setting.voicemail.nomessage"];
                    }else if(setting.voiceMailOption == "MESSAGE_WITH_CONFIRMATION"){
                        if(setting.confirm){                        	
                            setting.voiceMailSetting.messageWithConfirmationChecked = true;
                            setting.voiceMailSetting.displayVoiceMailOption = "Message with Confirmation";
                        }else{
                            setting.voiceMailSetting.voiceMailOption = "MESSAGE_ONLY";
                            setting.voiceMailSetting.messageOnlyChecked = true;
                            setting.voiceMailSetting.displayVoiceMailOption = i18n["notification.title.setting.voicemail.messageonly"];
                        }
                    }
                }else{
                    setting.voiceMailSetting.voiceMailOption = "MESSAGE_ONLY";
                    setting.voiceMailSetting.messageOnlyChecked = true;
                    setting.voiceMailSetting.displayVoiceMailOption = i18n["notification.title.setting.voicemail.messageonly"];
                }
                //hand confirm
                setting.confirmSetting = {checked:false,displayConfirm:""};
                if(setting.confirm){
                    setting.confirmSetting.checked = true;
                    setting.confirmSetting.displayConfirm = i18n["setting.broadcast.confirmation.yes"];
                }else{

                    setting.confirmSetting.displayConfirm = i18n["setting.broadcast.confirmation.no"];
                }
                //hand language
                setting.languageSetting = {language:setting.language,languages:response.languages,displayLanguage:""};
                if(setting.language){
                    $.each(setting.languageSetting.languages,function(i,language){
                        if(i==0){
                            setting.languageSetting.displayLanguage = language.value;
                        }
                        if(language.code == setting.language){
                            language.selected = true;
                            setting.languageSetting.displayLanguage = language.value;
                        }
                    });
                }
                setting.load = true;
                return setting;
            }
        },
        settingAppView:{
            jDom:{},
            template:{},
            subApps:[],
            initialize:function(){
                $.templates({
                    settingAppTemplate: $("#settingAppTemplate").html()
                });
                this.template.settingAppTemplate = $.render.settingAppTemplate;
                this.model.on("change:load",this.render,this);
                this.model.on("change:loadCompleted",this.loadComplete,this);
                this.model.on("change:_recipChecked",this.dealRecipChecked,this);
                this.ttsPathCollection = new Backbone.Collection();
                this.textPathCollection = new Backbone.Collection();
                this.ttsPathCollection.on("all",this.dealTTSPaths,this);

                if(this.model.urlRoot){
                    this.model.fetch();
                }else{
                    this.render();
                }
            },
            render:function(){
                var settingApp=this;
                if(this.options.isView === false){
                    this.$el.hide();
                }
                this.$el.html(this.template.settingAppTemplate(this.getIdSuffixModelJSON()));
                if(this.options.isEdit === false){
                    this.$("#edit_link").hide();
                }
                this.jDom.senderEmailContainer=this.$("#senderEmailContainer");
                this.jDom.senderCallerIdContainer=this.$("#senderCallerIdContainer");
                this.jDom.deliveryMethodContainer=this.$("#deliveryMethodContainer");
                this.jDom.recipientAppContainer=this.$("#recipientAppContainer");
                this.jDom.throttlingContainer=this.$("#throttlingContainer");
                this.jDom.durationContainer=this.$("#durationContainer");
                this.jDom.contactCycleContainer=this.$("#contactCycleContainer");
                this.jDom.cycleintervalContainer=this.$("#cycleintervalContainer");
                this.jDom.methodIntervalContainer=this.$("#methodIntervalContainer");
                this.jDom.voiceMailContainer=this.$("#voiceMailContainer");
                this.jDom.confirmContainer=this.$("#confirmContainer");
                this.jDom.languageContainer=this.$("#languageContainer");
                if(this.options.loadSuccess){
                    this.options.loadSuccess.call(this);
                }
                else{
                    var setting = this.model.toJSON();
                    //senderEmail app
                    var options = {
                        model:new Backbone.Model(setting.senderEmailSetting),
                        container:this.jDom.senderEmailContainer
                    }||{};
                    this.senderEmailApp =EB_View.notification.app.SettingApp.subApp.SenderEmailApp.getInstance(options)
                    this.subApps.push(this.senderEmailApp);
                    //SenderCallerId app
                    options = {
                        model:new Backbone.Model(setting.senderCallerIdSetting),
                        container:this.jDom.senderCallerIdContainer
                    };
                    this.senderCallerIdApp = EB_View.notification.app.SettingApp.subApp.SenderCallerIdApp.getInstance(options);
                    this.subApps.push(this.senderCallerIdApp);
                    //deliverPathSetting app
                    var settingApp = this;
                    options = {
                        model:new Backbone.Model(setting.deliverPathSetting),
                        container:this.jDom.deliveryMethodContainer,
//                        RECIPCallBack:function(checked){
//                            settingApp.recipienApp && settingApp.recipienApp.active(checked);
//                        },
                        callback:function(path){
                            if(path.type=="RECIP"){
                                settingApp.model.set("_recipChecked",path.checked);
                            }else if(path.pathFlag!="0"){
                                if(path.checked){

                                    settingApp.ttsPathCollection.add(path);
                                }else{
                                    settingApp.ttsPathCollection.remove(path);
                                }
                            }else{
                                if(path.checked){

                                    settingApp.textPathCollection.add(path);
                                }else{
                                    settingApp.textPathCollection.remove(path);
                                }
                            }
                        }
                    };
                    this.deliveryMethodApp = EB_View.notification.app.SettingApp.subApp.DeliveryMethodApp.getInstance(options);
                    this.subApps.push(this.deliveryMethodApp);
                    //RecipientApp app
                    if(setting.hasMybridge){
                        options = {
                            model:new Backbone.Model(setting.mobileSettings),
                            container:this.jDom.recipientAppContainer,
                            isCrossOrg:this.options.isCrossOrg
                        };
                        this.recipienApp =EB_View.notification.app.SettingApp.subApp.RecipientApp.getInstance(options);
                        this.subApps.push(this.recipienApp);
                    }
                    //throttling app
                    options = {
                        model:new Backbone.Model(setting.throttleSetting),
                        container:this.jDom.throttlingContainer,
                        isCrossOrg:this.options.isCrossOrg
                    };
                    this.subApps.push(EB_View.notification.app.SettingApp.subApp.ThrottlingApp.getInstance(options));

                    //duration app
                    options = {
                        model:new Backbone.Model(setting.durationSetting),
                        container:this.jDom.durationContainer
                    };
                    this.subApps.push(EB_View.notification.app.SettingApp.subApp.DurationApp.getInstance(options));

                    //contactCycle app
                    options = {
                        model:new Backbone.Model(setting.contactCycleSetting),
                        container:this.jDom.contactCycleContainer
                    };
                    this.subApps.push(EB_View.notification.app.SettingApp.subApp.ContactCycleApp.getInstance(options));

                    //contactCycle app
                    options = {
                        model:new Backbone.Model(setting.cycleintervalSetting),
                        container:this.jDom.cycleintervalContainer
                    };
                    this.subApps.push(EB_View.notification.app.SettingApp.subApp.CycleintervalApp.getInstance(options));

                    //methodInterval app
                    options = {
                        model:new Backbone.Model(setting.methodIntervalSetting),
                        container:this.jDom.methodIntervalContainer
                    };
                    this.subApps.push(EB_View.notification.app.SettingApp.subApp.MethodIntervalApp.getInstance(options));

                    //methodInterval app
                    options = {
                        model:new Backbone.Model(setting.voiceMailSetting),
                        container:this.jDom.voiceMailContainer
                    };
                    this.voiceMailApp =  EB_View.notification.app.SettingApp.subApp.VoiceMailApp.getInstance(options)
                    this.subApps.push(this.voiceMailApp);
                    this.subApps.voiceMailApp = this.voiceMailApp;

                    //methodInterval app
                    options = {
                        model:new Backbone.Model(setting.confirmSetting),
                        container:this.jDom.confirmContainer,
                        confirmCallback:function(isConfirmed){
                            settingApp.subApps.voiceMailApp.model.set({messageWithConfirmationDisabled:!isConfirmed});
                        }
                    };
                    var confirmApp = EB_View.notification.app.SettingApp.subApp.ConfirmApp.getInstance(options);
                    this.subApps.push(confirmApp);
                    this.subApps.confirmApp = confirmApp;
                    //language app
                    options = {
                        model:new Backbone.Model(setting.languageSetting),
                        container:this.jDom.languageContainer
                    };
                    this.languageApp = EB_View.notification.app.SettingApp.subApp.LanguageApp.getInstance(options);
                    this.subApps.push(this.languageApp);

                }
                this.model.set("loadCompleted",true);
                return this;
            },
            events:function(){
                var events = {
                    "click #edit_link":"eventClickEditLink"
                }
                return this.dealEvents(events,this.cid);
            },
            ignoreValidate:function(isIgnored, validate){  //updated by daniel
                if(isIgnored===true){
                    if(this.senderEmailApp.$("#senderEmail") && this.senderEmailApp.$("#senderEmail").length > 0){
                        this.senderEmailApp.$("#senderEmail").removeClass("required").valid();
                    }
                    if(this.senderCallerIdApp.$(".callerIds") && this.senderCallerIdApp.$(".callerIds").length > 0){
                        this.senderCallerIdApp.$(".callerIds") && this.senderCallerIdApp.$(".callerIds").removeClass("required").valid();
                    }
                    if(this.deliveryMethodApp.$("#deliveryMethodsValid")  && this.deliveryMethodApp.$("#deliveryMethodsValid") .length > 0){
                        this.deliveryMethodApp.$("#deliveryMethodsValid") && this.deliveryMethodApp.$("#deliveryMethodsValid").removeClass("required").valid();
                    }
                    if(this.senderCallerIdApp.$("#senderCallerIdValid") && this.senderCallerIdApp.$("#senderCallerIdValid").length > 0){
                        this.senderCallerIdApp.$("#senderCallerIdValid").removeClass("required").valid();
                    }

                }else{
                    if(this.senderEmailApp.$("#senderEmail") && this.senderEmailApp.$("#senderEmail").length > 0){
                        this.senderEmailApp.$("#senderEmail").addClass("required").valid();//.valid();
                        validate&&this.senderEmailApp.$("#senderEmail")&&this.senderEmailApp.$("#senderEmail").valid();
                    }
                    if(this.senderCallerIdApp.$(".callerIds") && this.senderCallerIdApp.$(".callerIds").length > 0){
                        this.senderCallerIdApp.$(".callerIds") && this.senderCallerIdApp.$(".callerIds").addClass("required");//.valid();
                        validate&&this.senderCallerIdApp.$(".callerIds") &&this.senderCallerIdApp.$(".callerIds").valid();
                    }
                    if(this.deliveryMethodApp.$("#deliveryMethodsValid")  && this.deliveryMethodApp.$("#deliveryMethodsValid") .length > 0){
                        this.deliveryMethodApp.$("#deliveryMethodsValid") && this.deliveryMethodApp.$("#deliveryMethodsValid").addClass("required");//.valid();
                        validate&&this.deliveryMethodApp.$("#deliveryMethodsValid") && this.deliveryMethodApp.$("#deliveryMethodsValid").valid();
                    }
                    if(this.senderCallerIdApp.$("#senderCallerIdValid") && this.senderCallerIdApp.$("#senderCallerIdValid").length > 0){
                        this.senderCallerIdApp.$("#senderCallerIdValid").addClass("required");//.valid();
                        validate&&this.senderCallerIdApp.$("#senderCallerIdValid").valid();
                    }
                }
            },
            hasTextPath:function(){
                return  this.textPathCollection && this.textPathCollection.length>0;
            },
            hasVoicePath:function(){
                return  this.ttsPathCollection && this.ttsPathCollection.length>0;
            },
            setConfirmChecked:function(value){
                this.subApps.confirmApp.setConfirmChecked(value);
            },
            eventClickEditLink:function(e){
                var j = $(e.target);
                var hids = this.$(".noti_content_hid");
                hids.toggle();
                if(hids.eq(0).is(":hidden"))
                    j.text(i18n["notification.title.setting.edit"]);
                else
                    j.text(i18n["notification.title.setting.hide"]);
            },
            loadComplete:function(model){
                if(model.get("loadCompleted")){
                    if($.isFunction(this.options.loadCompleteCallback)){
                        this.options.loadCompleteCallback.call(this);
                    }
                    this.dealTTSPaths(model);
                }
            },
            dealRecipChecked:function(model){
                if(model.get("loadCompleted")){
                    this.recipienApp && this.recipienApp.active(model.get("_recipChecked"));
                }
            },
            dealTTSPaths:function(){
                if(this.model.get("loadCompleted")){
                    this.languageApp.model.set("_hasTTSPaths", this.ttsPathCollection.length>0?true:false);
                }
            },
            getData:function(){
                var model = this.model.toJSON();
                model.load= false;
                for(var i=0;i<this.subApps.length;i++){
                    $.extend(model,this.subApps[i].getData());
                }
                return $.extend(true,{},model);
            },
            getJsonData:function(parentObj){
                var data = this.getData();
                parentObj.broadcastSettings={
                    senderEmail:data.senderEmailSetting.senderEmail,
                    recipientApp: (data.mobileSettings)?data.mobileSettings.recipientApp:false, //updated by Allen
                    mobileSettings:{
                        requestLocation:(data.mobileSettings)?data.mobileSettings.requestLocation:false,
                        requestImage:(data.mobileSettings)?data.mobileSettings.requestImage:false,
                        requestComment:(data.mobileSettings)?data.mobileSettings.requestComment:false,
                        allowShare: (data.mobileSettings)?data.mobileSettings.allowShare:false
                    },
                    throttlDefaultAmount:data.throttleSetting.throttlDefaultAmount,
                    throttle:data.throttleSetting.throttleChecked,
                    duration:data.durationSetting.duration,
                    contactCycles:data.contactCycleSetting.contactCycle,
                    cycleInterval:data.cycleintervalSetting.cycleInterval,
                    deliveryMethodInterval:data.methodIntervalSetting.deliveryMethodInterval,
                    confirm:data.confirmSetting.checked,
                    language:data.languageSetting.language
                };
                if(data.voiceMailSetting.voiceMailOption){
                    parentObj.broadcastSettings.voiceMailOption=data.voiceMailSetting.voiceMailOption;
                }
                var senderCallers = [];
                $.each(data.senderCallerIdSetting.senderCallers,function(i,s){
                    senderCallers.push({
                        countryName:s.countryName,
                        countryCode:s.countryCode,
                        isDefault:s.isDefault,
                        callerId:s.callerId
                    });
                });
                parentObj.broadcastSettings.senderCallerInfos=senderCallers;

                var deliverPaths = [],deliverPathType = "other";
                $.each(data.deliverPathSetting.orgPaths,function(i,o){
                    if(o.checked){
                        deliverPaths.push({id:o.id,pathId:o.pathId});
                        if (o.pathType == "PHONE")deliverPathType = o.pathType;   //added by daniel
                    }
                });
                parentObj.broadcastSettings.deliverPaths=deliverPaths;
                parentObj.broadcastSettings.deliverPathsType=deliverPathType;
                return parentObj;
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.settingAppModel);
            var settingAppModel = null;
            if(options.url)
                settingAppModel = new Model(null,{url:options.url});
            else
                settingAppModel = options.model;
            var View = EB_Common.Backbone.View.extend(this.settingAppView);
            return new View({el:options.container,model:settingAppModel,isView:options.isView,isEdit:options.isEdit,loadSuccess:options.loadSuccess,
                loadCompleteCallback:options.loadCompleteCallback,isCrossOrg:options.isCrossOrg});
        }
    }
    view.notification.app.SettingApp.subApp={
        SenderEmailApp:{
            SenderEmailAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        senderEmailTemplate: $("#senderEmailTemplate").html()
                    });
                    this.template.senderEmailTemplate = $.render.senderEmailTemplate;
                    this.model.on("change:senderEmail",this.changeSenderEmail,this);
                    this.render();
                },
                render:function(){
                    this.$el.html(this.template.senderEmailTemplate(this.getIdSuffixModelJSON()));
                    return this;
                },
                changeSenderEmail:function(){
                    this.$("#senderEmail_lbl").text(this.model.get("senderEmail"));
                },
                events:function(){
                    var events = {
                        "change #senderEmail":"eventChangeSenderEmail"
                    }
                    return this.dealEvents(events,this.cid);
                },
                eventChangeSenderEmail:function(e){
                    this.model.set({"senderEmail":e.target.value});
                },
                getData:function(){
                    return {senderEmailSetting:this.model.toJSON()};
                }
            },
            getInstance:function(_options){
                var options = $.extend(true,{},_options||{});
                var View = EB_Common.Backbone.View.extend(this.SenderEmailAppView);
                return new View({el:options.container,model:options.model});
            }
        },
        SenderCallerIdApp:{
            SenderCallerIdModel:{
                defaults:function(){
                    return {
                        countryName:"",
                        readOnly:false
                    }
                }
            },
            SenderCallerIdView:{
                tagName:"li",
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        senderCallerTemplate: $("#senderCallerTemplate").html()
                    });
                    this.template.senderCallerTemplate = $.render.senderCallerTemplate;
                    this.model.on("change:callerId",this.renderChangeCallerId,this);
                },
                render:function(){
                    this.$el.html(this.template.senderCallerTemplate(this.getIdSuffixModelJSON()));
                    return this;
                },
                renderChangeCallerId:function(){

                },
                events:function(){
                    var events = {
                        "change input":"eventChangeInput"
                    }
                    return this.dealEvents(events,this.cid);
                },
                eventChangeInput:function(e){
                    this.model.set({"callerId":e.target.value});
                }
            },
            SenderCallerIdCollection:{},
            SenderCallerIdAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        senderCallerIdTemplate: $("#senderCallerIdTemplate").html()
                    });
                    this.template.senderCallerIdTemplate = $.render.senderCallerIdTemplate;
                    this.collection.on("add",this.collectionAddOne,this);
                    this.collection.on("all",this.collectionChange,this);
                    this.render();
                },
                render:function(){
                    this.$el.html(this.template.senderCallerIdTemplate(this.getIdSuffixModelJSON()));
                    this.$("#senderCallerTips").tooltip({hide:false,position: { my: "left+15 center", at: "right center" }});
                    return this;
                },
                collectionAddOne:function(senderCaller){
                    var view = new this.options.modelView({model: senderCaller});
                    this.$("#div_sendercallerid").append(view.render().el);
                },
                collectionChange:function(){
                    var content = $("#senderCallerTipTemplate").render(this.collection.toJSON());
                    this.$("#senderCallerTips").attr("title",content);
                },
                getData:function(){
                    return {senderCallerIdSetting:{senderCallers:this.collection.toJSON()}};
                }
            },
            getInstance:function(_options){
                var options = $.extend(true,{},_options||{});
                var Model = Backbone.Model.extend(this.SenderCallerIdModel);
                var Collection = Backbone.Collection.extend({model:Model});
                var collection = new Collection();
                var ModelView = EB_Common.Backbone.View.extend(this.SenderCallerIdView);
                var View = EB_Common.Backbone.View.extend(this.SenderCallerIdAppView);
                var view = new View({el:options.container,collection:collection,modelView:ModelView,model:options.model});
                view.collection.add(options.model.get("senderCallers"));
                return view;
            }
        },
        DeliveryMethodApp:{
            DeliveryMethodModel:{
                defaults:function(){
                    return {
                        checked:false
                    }
                }
            },
            DeliveryMethodView:{
                tagName:"li",
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        deliveryMethodModelTemplate: $("#deliveryMethodModelTemplate").html()
                    });
                    this.template.deliveryMethodModelTemplate = $.render.deliveryMethodModelTemplate;
                    this.model.on("change:checked",this.renderChecked,this);
                    this.model.on("change:isConference",this.renderTTYStatus,this);
                },
                render:function(){
                    var model = this.model.toJSON();
                    model.labelId = Math.random();
                    this.$el.html(this.template.deliveryMethodModelTemplate([model]));
                    this.model.trigger("change:checked",this);
                    return this;
                },
                renderChecked:function(){
                    this.$("input[type='checkbox']").prop("checked",this.model.get("checked"));
                    if($.isFunction(this.options.callback)){
                        this.options.callback.call(this,this.model.toJSON());
                    }
//                    if(this.model.get("type")=="RECIP"){
//                        this.options.RECIPCallBack.call(this,this.model.get("checked"));
//                    }
                },
                renderTTYStatus:function(){
                    var isConference = this.model.get("isConference");
                    if(this.model.get("code").indexOf("TTY")>-1){
                        if(isConference){
                            this.model.set("checked",false);
                            this.$el.hide();
                        }else{
                            this.$el.show();
                        }
                    }
                },
                events:function(){
                    var events = {
                        "change input[type='checkbox']":"eventChangeCheckbox"
                    }
                    return this.dealEvents(events,this.cid);
                },
                eventChangeCheckbox:function(e){
                    this.model.set({"checked":e.target.checked});
                }
            },
            DeliveryMethodAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        deliveryMethodTemplate: $("#deliveryMethodTemplate").html()
                    });
                    this.template.deliveryMethodTemplate = $.render.deliveryMethodTemplate;
                    this.collection.on("add",this.collectionAddOne,this);
                    this.collection.on("all",this.collectionAll,this);
                    this.collection.on("change",this.collectionChange,this);
                    this.render();
                },
                render:function(){
                    this.$el.html(this.template.deliveryMethodTemplate(this.getIdSuffixModelJSON()));
                    this.$("#a_showstr").tooltip({hide:false,position: { my: "left+15 center", at: "right center" }});
                    return this;
                },
                collectionAddOne:function(deliverMethod){
                    var view = new this.options.modelView({model:deliverMethod,deliveryMethodsValid:this.$("#deliveryMethodsValid"),callback:this.options.callback});
                    this.$("#deliveryMethodsUl").append(view.render().el);
                },
                collectionAll:function(){
                    var objs = this.collection.toJSON(),objs2=[];
                    $.each(objs,function(i,obj){
                        if(obj.checked)objs2.push(obj);
                    });
                    var content = $("#deliveryMethodTipTemplate").render(objs2);
                    this.$("#a_showstr").attr("title",content);

                    if(objs2.length){
                        this.$("#deliveryMethodsValid").val("true");
                    }else{
                        this.$("#deliveryMethodsValid").val("");
                    }
                },
                collectionChange:function(){
                    var length = this.collection.where({checked:true}).length;
                    if(length){
                        this.$("#deliveryMethodsValid").val("true").valid();
                    }else{
                        this.$("#deliveryMethodsValid").val("").valid();
                    }
                },
                renderTTYStatus:function(isConference){
                    this.collection.each(function(model,i){
                        model.set("isConference",isConference);
                    });
                },
                events:function(){
                    var events = {
                        "change input[name='sel_deliverpath']":"eventChangeDeliverpath"
                    }
                    return this.dealEvents(events,this.cid);
                },
                eventChangeDeliverpath:function(e){
                    var type = e.target.value;
                    this.collection.each(function(model,i){
                        if(type=="ALL"){
                            model.set("checked",true);
                        }else if(type=="PHONE"){
                            model.set("checked",model.get("pathFlag")!="0" || model.get("type")=="RECIP");
                        }else{
                            model.set("checked",model.get("pathFlag")=="0");
                        }
                    });
                    this.model.set("type",type);
                    this.$("#deliveryMethodsValid").valid();
                },
                getData:function(){
                    return {deliverPathSetting:{orgPaths:this.collection.toJSON(),type:this.model.get("type")}};
                }
            },
            getInstance:function(_options){
                var options = $.extend(true,{},_options||{});
                var Model = Backbone.Model.extend(this.DeliveryMethodModel);
                var Collection = Backbone.Collection.extend({model:Model});
                var collection = new Collection();
                var ModelView = EB_Common.Backbone.View.extend(this.DeliveryMethodView);
                var View = EB_Common.Backbone.View.extend(this.DeliveryMethodAppView);
                var view = new View({el:options.container,collection:collection,modelView:ModelView,model:options.model,callback:options.callback});
                view.collection.add(options.model.get("orgPaths"));
                return view;
            }
        },
        RecipientApp:{
            RecipientAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        recipientAppTemplate: $("#recipientAppTemplate").html()
                    });
                    this.template.recipientAppTemplate = $.render.recipientAppTemplate;
                    this.render();
                },
                render:function(){
                    this.$el.html(this.template.recipientAppTemplate(this.getIdSuffixModelJSON()));
                    this.$("#recipientapp_showstr").tooltip({hide:false,position: { my: "left+15 center", at: "right center" }});
                    this.eventChangeCheckbox();
                    this.$("#recipientapp_showstr").attr("title",$("#recipientTipTemplate").render(this.model.toJSON()));
                    return this;
                },
                events:function(){
                    var events = {
                        "change input[type='checkbox']":"eventChangeCheckbox"
                    }
                    return this.dealEvents(events,this.cid);
                },
                eventChangeCheckbox:function(){
                    var view = this;
                    var values =[];
                    this.$("input[type='checkbox']").each(function(){
                        var j = $(this);
                        if(this.checked){
                            if(j.hasClass("recipientAppChbox")){
                                values.push({checked:this.checked,prompt:j.next().html()});
                            }
                        }
                        view.model.set(j.attr("attrName"),this.checked);
                        view.model.set(j.attr("attrName") + "Checked",this.checked); //added by daniel
                    });
                    this.$("#recipientapp_showstr").attr("title",$("#recipientTipTemplate").render(this.model.toJSON()));
                },
                active:function(actived){
                    this.model.set("recipientApp",!!actived);
                    var view = this;
                    this.$("input[type='checkbox']").each(function(){
                        var j = $(this);
                        if(!actived){
                            j.prop("disabled",true).prop("checked",false).next().addClass("disabletxt");
                        }else{
                            if(j.attr("attrName")=="allowShare"){
                                if(view.model.get("allowShareMessage") || view.options.isCrossOrg){
                                    j.attr("disabled",false).next().removeClass("disabletxt");
                                    if(view.model.get("shareMessageStatus")){
                                        j.prop("checked",true);
                                    }
                                }
                            }else{
                                j.attr("disabled",false).prop("checked",true).next().removeClass("disabletxt");
                            }
                        }
                    });
                    this.eventChangeCheckbox();
                },
                getData:function(){
                    return {mobileSettings:this.model.toJSON()};
                }
            },
            getInstance:function(_options){
                var options = $.extend(true,{},_options||{});
                var View = EB_Common.Backbone.View.extend(this.RecipientAppView);
                return new View({el:options.container,model:options.model, isCrossOrg:options.isCrossOrg});
            }
        },
        ThrottlingApp:{
            ThrottlingAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        throttlingTemplate: $("#throttlingTemplate").html()
                    });
                    this.template.throttlingTemplate = $.render.throttlingTemplate;
                    this.model.on("change:enforceAllFlag",this.renderEnforceAppFlay,this);
                    this.model.on("change:yesOrNo",this.renderYesOrNo,this);
                    this.render();
                },
                render:function(){
                    var datas_ =this.getIdSuffixModelJSON();
                    datas_[0].isCrossOrg = this.options.isCrossOrg
                    this.$el.html(this.template.throttlingTemplate(datas_));
                    var throttleRules = this.model.get("throttleRules")
                    if((!throttleRules) || throttleRules.length==0){
                        this.$("#viewRules").hide();
                    }
                    return this;
                },
                renderEnforceAppFlay:function(){
                    this.$("#isThrottle").prop("disabled",this.model.get("enforceAllFlag"));
                },
                renderYesOrNo:function(){
                    this.$("#isThrottle_lbl").text(this.model.get("yesOrNo"));
                },
                events:function(){
                    var events = {
                        "change #isThrottle":"eventChangeIsThrottle",
                        "click #viewRules":"eventClickViewRules"
                    }
                    return this.dealEvents(events,this.cid);
                },
                eventChangeIsThrottle:function(e){
                    this.model.set("throttleChecked", e.target.checked);
                    if(e.target.checked)
                        this.model.set("yesOrNo",i18n["setting.broadcast.confirmation.yes"]);
                    else
                        this.model.set("yesOrNo",i18n["setting.broadcast.confirmation.no"]);
                },
                eventClickViewRules:function(e){
                    this.$("#throttle").toggle();
                    if(this.$("#throttle").is(":hidden")){
                        $(e.currentTarget).text(i18n["notification.title.setting.applythrottling.view"]);
                    }else{
                        $(e.currentTarget).text(i18n["notification.title.setting.applythrottling.hide"]);
                    }
                },
                getData:function(){
                    return {throttleSetting:this.model.toJSON()};
                }
            },
            getInstance:function(_options){
                var options = $.extend(true,{},_options||{});
                var View = EB_Common.Backbone.View.extend(this.ThrottlingAppView);
                return new View({el:options.container,model:options.model, isCrossOrg:options.isCrossOrg});
            }
        },
        DurationApp:{
            DurationAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        durationTemplate: $("#durationTemplate").html()
                    });
                    this.template.durationTemplate = $.render.durationTemplate;
                    this.model.on("change:duration",this.renderChangeDuration,this);
                    this.render();
                },
                render:function(){
                    this.$el.html(this.template.durationTemplate(this.getIdSuffixModelJSON()));
                    return this;
                },
                renderChangeDuration:function(){
                    var d = this.$("#duration_lbl");
                    d.text(d.text().replace(/\d+/,this.model.get("duration")));
                },
                events:function(){
                    var events = {
                        "change #duration":"eventChangeDuration"
                    }
                    return this.dealEvents(events,this.cid);
                },
                eventChangeDuration:function(e){
                    var val = $(e.target).val();
                    this.model.set("duration",val);
                    var durations = this.model.get("durations");
                    $.each(durations,function(i,d){
                        d.selected = d.index==val;
                    });
                    this.model.set("durations",durations);
                },
                getData:function(){
                    return {durationSetting:this.model.toJSON()};
                }
            },
            getInstance:function(_options){
                var options = $.extend(true,{},_options||{});
                var View = EB_Common.Backbone.View.extend(this.DurationAppView);
                return new View({el:options.container,model:options.model});
            }
        },
        ContactCycleApp:{
            ContactCycleAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        contactCycleTemplate: $("#contactCycleTemplate").html()
                    });
                    this.template.contactCycleTemplate = $.render.contactCycleTemplate;
                    this.model.on("change:contactCycle",this.renderChangeContactCycle,this);
                    this.render();
                },
                render:function(){
                    this.$el.html(this.template.contactCycleTemplate(this.getIdSuffixModelJSON()));
                    return this;
                },
                renderChangeContactCycle:function(){
                    var d = this.$("#contactCycles_lbl");
                    d.text(d.text().replace(/\d+/,this.model.get("contactCycle")));
                },
                events:function(){
                    var events = {
                        "change #contactCycles":"eventChangeContactCycle"
                    }
                    return this.dealEvents(events,this.cid);
                },
                eventChangeContactCycle:function(e){
                    var val = $(e.target).val();
                    this.model.set("contactCycle",val);
                    var contactCycles = this.model.get("contactCycles");
                    $.each(contactCycles,function(i,d){
                        d.selected = d.index==val;
                    });
                    this.model.set("contactCycles",contactCycles);
                },
                getData:function(){
                    return {contactCycleSetting:this.model.toJSON()};
                }
            },
            getInstance:function(_options){
                var options = $.extend(true,{},_options||{});
                var View = EB_Common.Backbone.View.extend(this.ContactCycleAppView);
                return new View({el:options.container,model:options.model});
            }
        },
        CycleintervalApp:{
            CycleintervalAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        cycleintervalTemplate: $("#cycleintervalTemplate").html()
                    });
                    this.template.cycleintervalTemplate = $.render.cycleintervalTemplate;
                    this.model.on("change:cycleInterval",this.renderChangeContactCycle,this);
                    this.render();
                },
                render:function(){
                    this.$el.html(this.template.cycleintervalTemplate(this.getIdSuffixModelJSON()));
                    return this;
                },
                renderChangeContactCycle:function(){
                    var d = this.$("#cycleInterval_lbl");
                    d.text(d.text().replace(/\d+/,this.model.get("cycleInterval")));
                },
                events:function(){
                    var events = {
                        "change #cycleInterval":"eventChangeCycleInterval"
                    }
                    return this.dealEvents(events,this.cid);
                },
                eventChangeCycleInterval:function(e){
                    var val = $(e.target).val()
                    this.model.set("cycleInterval",val);
                    var cycleIntervals = this.model.get("cycleIntervals");
                    $.each(cycleIntervals,function(i,d){
                        d.selected = d.index==val;
                    });
                    this.model.set("cycleIntervals",cycleIntervals);
                },
                getData:function(){
                    return {cycleintervalSetting:this.model.toJSON()};
                }
            },
            getInstance:function(_options){
                var options = $.extend(true,{},_options||{});
                var View = EB_Common.Backbone.View.extend(this.CycleintervalAppView);
                return new View({el:options.container,model:options.model});
            }
        },
        MethodIntervalApp:{
            MethodIntervalAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        methodIntervalTemplate: $("#methodIntervalTemplate").html()
                    });
                    this.template.methodIntervalTemplate = $.render.methodIntervalTemplate;
                    this.model.on("change:deliveryMethodInterval",this.renderDeliveryMethodInterval,this);
                    this.render();
                },
                render:function(){
                    this.$el.html(this.template.methodIntervalTemplate(this.getIdSuffixModelJSON()));
                    return this;
                },
                renderDeliveryMethodInterval:function(){
                    var d = this.$("#deliveryMethodInterval_lbl");
                    d.text(d.text().replace(/\d+/,this.model.get("deliveryMethodInterval")));
                },
                events:function(){
                    var events = {
                        "change #deliveryMethodInterval":"eventChangeDeliveryMethodInterval"
                    }
                    return this.dealEvents(events,this.cid);
                },
                eventChangeDeliveryMethodInterval:function(e){
                    var val =  $(e.target).val();
                    this.model.set("deliveryMethodInterval",val);
                    var deliveryMethodIntervals = this.model.get("deliveryMethodIntervals");
                    $.each(deliveryMethodIntervals,function(i,d){
                        d.selected = d.index==val;
                    });
                    this.model.set("deliveryMethodIntervals",deliveryMethodIntervals);
                },
                getData:function(){
                    return {methodIntervalSetting:this.model.toJSON()};
                }
            },
            getInstance:function(_options){
                var options = $.extend(true,{},_options||{});
                var View = EB_Common.Backbone.View.extend(this.MethodIntervalAppView);
                return new View({el:options.container,model:options.model});
            }
        },
        VoiceMailApp:{
            VoiceMailAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        voiceMailTemplate: $("#voiceMailTemplate").html()
                    });

                    this.template.voiceMailTemplate = $.render.voiceMailTemplate;
                    this.model.on("change:displayVoiceMailOption",this.renderDisplayVoiceMailOption,this);
                    this.model.on("change:voiceMailOption",this.renderVoiceMailOption,this);
                    this.model.on("change:messageWithConfirmationDisabled",this.renderMessageWithConfirmationDisabled,this);
                    this.render();
                },
                render:function(){
                    if(this.model.get("isHide")) this.$el.hide();
                    this.$el.html(this.template.voiceMailTemplate(this.getIdSuffixModelJSON()));
                    return this;
                },
                renderVoiceMailOption:function(){
                	var value = this.model.get("voiceMailOption");
                    if(value=="MESSAGE_ONLY"){
                        this.$("#messageonly").prop("checked",true);  
                        this.model.set("messageOnlyChecked", true);  //modified by daniel
                        this.model.set("messageWithConfirmationChecked", false);
                        this.model.set("noMessageChecked", false);
                        this.model.set("displayVoiceMailOption",i18n["notification.title.setting.voicemail.messageonly"]);
                    }else if(value=="NO_MESSAGE"){
                        this.$("#nomessage").prop("checked",true);
                        this.model.set("messageOnlyChecked", false);
                        this.model.set("messageWithConfirmationChecked", false);
                        this.model.set("noMessageChecked", true);
                        this.model.set("displayVoiceMailOption",i18n["notification.title.setting.voicemail.nomessage"]);
                    }else if(value=="MESSAGE_WITH_CONFIRMATION"){
                        this.$("#messagewithconfirmation").prop("checked",true);
                        this.model.set("messageOnlyChecked", false);
                        this.model.set("messageWithConfirmationChecked", true);
                        this.model.set("noMessageChecked", false);
                        this.model.set("displayVoiceMailOption","Message with Confirmation");
                    }
                },
                renderMessageWithConfirmationDisabled:function(){
                    var isDisabled =  this.model.get("messageWithConfirmationDisabled")
                    this.$("#messagewithconfirmation").prop("disabled",isDisabled);
                    if(isDisabled){
                        this.$("#messagewithconfirmation").next().addClass("disabletxt");
                    }else{
                        this.$("#messagewithconfirmation").next().removeClass("disabletxt");
                    }
                    if(this.model.get("voiceMailOption") == "MESSAGE_WITH_CONFIRMATION"){
                        this.model.set("voiceMailOption","MESSAGE_ONLY");
                    }
                },
                adjustVisibleByNotificationType:function(notificationTypeStatus){
                    if(notificationTypeStatus && notificationTypeStatus.conference){
                        this.$el.hide();
                        this.model.set("isHide",true);
                    }else{
                        this.$el.show();
                        this.model.set("isHide",false);
                    }
                },
                renderDisplayVoiceMailOption:function(){
                    this.$("#voiceMailOption_lbl").text(this.model.get("displayVoiceMailOption"));
                },
                events:function(){
                    var events = {
                        "change input[name=leaveMessage]":"eventChangeLeaveMessage"
                    }
                    return this.dealEvents(events,this.cid);
                },
                eventChangeLeaveMessage:function(e){
                    this.model.set("voiceMailOption", e.target.value);

                },
                getData:function(){
                    if(this.model.get("isHide")===true) return {voiceMailSetting:{}};
                    return {voiceMailSetting:this.model.toJSON()};
                }
            },
            getInstance:function(_options){
                var options = $.extend(true,{},_options||{});
                var View = EB_Common.Backbone.View.extend(this.VoiceMailAppView);
                return new View({el:options.container,model:options.model});
            }
        },
        ConfirmApp:{
            ConfirmAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        confirmTemplate: $("#confirmTemplate").html()
                    });
                    this.model.set("pollingOrConference", null);
                    this.template.confirmTemplate = $.render.confirmTemplate;
                    this.model.on("change:checked",this.renderChecked,this);
                    this.model.on("change:displayConfirm",this.renderDisplayConfirm,this);
                    this.model.on("change:pollingOrConference",this.renderPollingOrConference,this);
                    this.render();
                },
                render:function(){
                    this.$el.html(this.template.confirmTemplate(this.getIdSuffixModelJSON()));
                    return this;
                },
                renderChecked : function(){
                    var checked = this.model.get("checked");
                    this.options.confirmCallback && this.options.confirmCallback.call(this,checked);
                    if(checked){
                        this.model.set("displayConfirm",i18n["setting.broadcast.confirmation.yes"]);
                    }else{
                        this.model.set("displayConfirm",i18n["setting.broadcast.confirmation.no"]);
                    }
                },
                renderPollingOrConference:function(){
                    var pollingOrConference  = this.model.get("pollingOrConference");
                    this.$("#confirm").next().text(i18n["notification.title.setting.confirm"].replace("{0}",""));
                    this.$("#confirm_title").text(i18n["notification.title.setting.confirm"].replace("{0}",":"));
                    if(pollingOrConference.conference){
                        if (this.model.get("checked")){  //modified by daniel
                        	this.options.confirmCallback && this.options.confirmCallback.call(this,true);
                        } else {
                        	this.model.set("checked",true);
                        }
                        this.$("#confirm").prop("checked",true).prop("disabled",true).next().addClass("disabletxt");
                    }else if(pollingOrConference.polling){
                        this.$("#confirm_title").text(i18n["notification.title.setting.smscallback"]+":");
                        this.$("#confirm").prop("disabled",false).next().removeClass("disabletxt").text(i18n["notification.title.setting.smscallback"]);
                    }else{
                        this.$("#confirm").prop("disabled",false).next().removeClass("disabletxt");
                    }
                },
                renderDisplayConfirm:function(){
                    this.$("#confirm_lbl").text(this.model.get("displayConfirm"));
                },
                events:function(){
                    var events = {
                        "change #confirm":"eventChangeConfirm"
                    }
                    return this.dealEvents(events,this.cid);
                },
                eventChangeConfirm:function(e){
                    this.model.set("checked",e.target.checked);
                },
                getData:function(){
                    return {confirmSetting:this.model.toJSON()};
                }
            },
            getInstance:function(_options){
                var options = $.extend(true,{},_options||{});
                var View = EB_Common.Backbone.View.extend(this.ConfirmAppView);
                return new View({el:options.container,model:options.model,confirmCallback:options.confirmCallback});
            }
        },
        LanguageApp:{
            LanguageAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        languageTemplate: $("#languageTemplate").html()
                    });
                    this.template.languageTemplate = $.render.languageTemplate;
                    this.model.on("change:displayLanguage",this.renderDisplayLanguage,this);
                    this.model.on("change:_hasTTSPaths",this.ttsPathsChanged,this);
                    this.render();
                    var that = this;
                    $.validator.addMethod("ttsCheck", function(value, element, params) {
                        if(value=="ja_JP"){
                            if(that.model.get("_onlyText") && that.model.get("_hasTTSPaths")){
                                return false;
                            }
                        }
                        return true;
                    }, i18n['notification.voice.unsupport']);
                    this.$("#language").rules("add","ttsCheck");
                },
                render:function(){
                    this.$el.html(this.template.languageTemplate(this.getIdSuffixModelJSON()));
                    return this;
                },
                ttsPathsChanged:function(model){
                    this.$("#language").valid();
                },
                renderDisplayLanguage:function(){
                    this.$("#lbl_language").text(this.model.get("displayLanguage"));
                },
                events:function(){
                    var events = {
                        "change #language":"eventChangeLanguage"
                    }
                    return this.dealEvents(events,this.cid);
                },
                eventChangeLanguage:function(e){
                    var option = $(e.target).children(":selected");
                    this.model.set("displayLanguage",option.text());
                    var code = option.val();
                    var languages = this.model.get("languages");
                    $.each(languages,function(i,language){
                        language.selected = language.code == code;
                    });
                    this.model.set("language",code);
                    this.model.set("languages",languages);
                },
                getData:function(){
                    return {languageSetting:this.model.toJSON()};
                }
            },
            getInstance:function(_options){
                var options = $.extend(true,{},_options||{});
                var View = EB_Common.Backbone.View.extend(this.LanguageAppView);
                return new View({el:options.container,model:options.model});
            }
        }
    }

})(EB_View,i18n);