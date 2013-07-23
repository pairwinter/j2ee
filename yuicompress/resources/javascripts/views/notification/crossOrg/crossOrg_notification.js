(function(view){
    view.notification.page = {};
    view.notification.page.CreateApp={
        Model:{
            defaults:function(){
                return {
                    load:false
                }
            },
            initialize:function(){
                if(arguments && arguments.length>1 && arguments[1].url){
                    this.urlRoot = arguments[1].url;
                    this.isCrossOrg = arguments[1].isCrossOrg;
                }
            },
            parse:function(data){
                //hand message
                data.additionalData = data.additionalData ||{};
                if(data.additionalData.messageAdditionalData){
                    data.additionalData.messageAdditionalData.bcTemplate = data.broadcastTemplate;
                }
                data.messageAppModelData = data.additionalData.messageAdditionalData;
                //hand contacts
                data.contactsAppModelData={
                    load:false,
                    hadOpenDialog:false,
                    contactsCount:0,
                    groupsCount:0,
                    filtersCount:0,
                    shapesCount:0,
                    selectedGroupIds:"",
                    IndividualGroupFilterData:{
                        contacts:[],
                        groups:[],
                        filters:[]
                    },
                    UniverseAppData:{
                        filterRules:"",
                        polygons:"",
                        excludedContactIds:[]
                    }
                }
                if(this.isCrossOrg){
                    data.contactsAppModelData.orgContactData = data.additionalData.contactsAdditionalData;
                    data.contactsAppModelData.contactsCount = data.contactsCount||0;
                    data.contactsAppModelData.groupsCount = data.groupsCount||0;
                    data.contactsAppModelData.filtersCount = data.filtersCount||0;
                }else{
                    if(data.broadcastTemplate&&data.broadcastTemplate.broadcastContacts){
                        var contacts = data.broadcastTemplate.broadcastContacts;
                        data.contactsAppModelData.contactsCount = (contacts.contactIds&&contacts.contactIds.length)||0;
                        data.contactsAppModelData.groupsCount = (contacts.groupIds&&contacts.groupIds.length)||0;
                        data.contactsAppModelData.filtersCount = (contacts.filterIds&&contacts.filterIds.length)||0;
                        data.contactsAppModelData.selectedGroupIds = (contacts.groupIds&&[]).join(",");
                    }
                    if(data.additionalData.contactsAdditionalData){
                        data.contactsAppModelData.IndividualGroupFilterData={
                            contacts:data.additionalData.contactsAdditionalData.contacts||[],
                            groups:data.additionalData.contactsAdditionalData.groups||[],
                            filters:data.additionalData.contactsAdditionalData.filters||[]
                        }
                        data.contactsAppModelData.UniverseAppData = data.additionalData.contactsAdditionalData.map || {};
                        data.contactsAppModelData.shapesCount = (data.contactsAppModelData.UniverseAppData.shapesCount)||0;
                        var filterRules = data.contactsAppModelData.UniverseAppData.filterRules;
                        if(filterRules && filterRules.length){
                            filterRules = JSON.stringify(filterRules);
                        }else{
                            filterRules="";
                        }
                        data.contactsAppModelData.UniverseAppData.filterRules=filterRules;
                    }
                }
                data.settingAppModelData = data.additionalData.settingAdditionalData;
                //hand setting data
                if(data.additionalData.settingAdditionalData){
                    data.additionalData.settingAdditionalData.bcTemplate = data.broadcastTemplate;
                }
                data.settingAppModelData = data.additionalData.settingAdditionalData;

                data.launchTypeAppModelData = data.additionalData.launchTypeAdditionalData;
                //hand setting data
                if(data.additionalData.launchTypeAdditionalData){
                    data.additionalData.launchTypeAdditionalData.bcTemplate = data.broadcastTemplate;
                }
                data.launchTypeAppModelData = data.additionalData.launchTypeAdditionalData;

                return $.extend({load:true},data);
            }
        },
        View:{
            jDom:{},
            subApps:{},
            initialize:function(){
                this.isCrossOrg = this.options.isCrossOrg;
                this.model.on("change:load",this.render,this);
                this.model.fetch();
                this.model.on("change:_pubishChecked",this.dealValidate,this);
                this.model.on("change:_isSaved",this.dealValidate,this);
                this.model.on("change:_hasContacts",this.dealValidate,this);
                this.model.on("change:loadCompleted", this.loadComplete, this);
                this.model.on("change:_notificationType", this.dealChangeNotificationType, this);
                this.model.on("change:_onlyText",this.dealMessageTypeChange, this);
            },
            events:{
//                "click .notificationTypeRadios":"changeNotificationType"
            },
            render:function(){
                var view = this;
                $.validator.setDefaults({
                    ignore: ':button, .ignore'
                });
                EB_Common.validation.validate(this.$("#notificationForm"),{
                    submitHandler:function(form){
                        if(view.subApps.messageApp.onlyHasText() && view.subApps.settingApp.hasVoicePath()){
                            EB_Common.dialog.confirm(i18n['notification.new.checkvoice'],'',function(){
                                view.submitHandler(form);
                            });
                        }else if(view.subApps.messageApp.onlyHasVoice() && view.subApps.settingApp.hasTextPath()){
                            EB_Common.dialog.alert(i18n['notification.text.textPath.voiceOnly.waring']);
                            return false;
                        }else{
                            view.submitHandler(form);
                        }
                    }
                });
                this.jDom.messageContainer = this.$("#bc_message_li");
                this.jDom.contactContainer = this.$("#bc_contacts_li");
                this.jDom.settingContainer = this.$("#bc_settings_li");
                this.jDom.launchTypeContainer = this.$("#bc_launchType_li");
                var model = this.model.toJSON();
                this.loadMessage(model.messageAppModelData);
                this.loadContacts(model.contactsAppModelData);
                this.loadSetting(model.settingAppModelData);
                this.loadLaunchType(model.launchTypeAppModelData);
                this.model.set("loadCompleted",true);
            },
            submitHandler:function(form){
                this.options.submitCallBack && this.options.submitCallBack.call(this,this.getJsonData());
            },
            changeNotificationType:function(e){
                if($(e.currentTarget).val()=="Polling" || $(e.currentTarget).val()=="Conference"){
                    if(this.subApps.settingApp){
                        this.subApps.settingApp.setConfirmChecked(true);
                    }
                }else{
                    if(this.subApps.settingApp){
                        this.subApps.settingApp.setConfirmChecked(false);
                    }
                }
            },
            loadMessage:function(data){
                var that = this;
                var model = EB_View.notification.app.MessageApp.MessageModel.parse(data);
                var options={
                    sessionId:this.options.sessionId,
                    model:new Backbone.Model(model),
                    container:this.jDom.messageContainer,
                    notificationTypeChangeCallBack:function(type){
                        that.model.set("_notificationType",type);
                    },
                    messageTypeChangeCallback:function(type){
                        that.model.set("_onlyText",type=="None"?true:false);
                    },
                    isCrossOrg:that.isCrossOrg
                };
                var messageApp = this.subApps.messageApp = EB_View.notification.app.MessageApp.getInstance(options);
                messageApp.subApps.templateApp = EB_View.notification.app.MessageTemplateApp.getInstance({
                    listUrl:EB_Common.Ajax.wrapperUrl("/crossOrgMessageTemplates/json"),
                    getedUrl:"/crossOrgMessageTemplates/getJson/",
                    okCallBack:function(newMessage){
                        messageApp.model.set({"title":newMessage.title});
                        messageApp.model.set({"textMessage":newMessage.textMessage});
                        if(messageApp.subApps.voiceApp){
                            messageApp.subApps.voiceApp.model.set({"includeAVoice":newMessage.includeAVoice,"voiceOptionType":newMessage.voiceSource,"audioFiles":newMessage.audioFiles});
                        }
                        messageApp.jDom.messageTitle.focus();
                        messageApp.jDom.messageTitle.valid();
                        messageApp.jDom.textMessage.valid();
                    }
                });
            },
            loadContacts:function(data){
                var that = this;
                var options={
                    modelData:data,
                    container:this.jDom.contactContainer,
                    isCrossOrg:that.isCrossOrg,
                    organizations:that.options.organizations,
                    loadSuccess:function(){
                        //create the instance of contact app
                        if(!that.isCrossOrg){
                            options2 = {
                                url:EB_Common.Ajax.wrapperUrl("/universe/homeAsJson"),
                                originalGisData:data.UniverseAppData,
                                isDialog:true,
                                selectButtonCallBack:function(){
//                                    _contactApp.model.set("shapesCount",this.model.get("tempStorage").shapesCount||0);
                                }
                            }
                            this.subApps.universeApp = EB_View.universe.UniverseApp.getInstance(options2);
                        }
                    },
                    selectContactCallback:function(val){
                        that.dealSelectContact(val);
                    }
                };
                this.subApps.contactApp = EB_View.notification.app.ContactApp.getInstance(options);
            },
            loadSetting:function(data){
                //create instance of Setting
                var model = EB_View.notification.app.SettingApp.settingAppModel.parse(data);
                var options={
                    model:new Backbone.Model(model),
                    container:this.jDom.settingContainer,
                    isCrossOrg:this.isCrossOrg
                }
                this.subApps.settingApp = EB_View.notification.app.SettingApp.getInstance(options);
            },
            loadLaunchType:function(data){
                var view = this;
                var modelData = EB_View.notification.app.LaunchTypeApp.LaunchTypeModel.parse(data);
                var options = {
                    model:new Backbone.Model(modelData),
                    container:this.jDom.launchTypeContainer,
                    isCrossOrg:view.isCrossOrg,
                    loadSuccess:function(){
                        var launchType = this.model.toJSON();
                        //ScheduleApp
                        var options = {
                            model:new Backbone.Model(launchType.launchPolicy.launchSetting.scheduleSetting),
                            container:this.jDom.scheduleContainer
                        };
                        this.subApps.scheduleApp = EB_View.notification.app.LaunchTypeApp.subApp.ScheduleApp.getInstance(options);

                        //RecurringApp app
                        options = {
                            model:new Backbone.Model(launchType.launchPolicy.launchSetting.recurringSetting),
                            container:this.jDom.recurringContainer
                        };
                        this.subApps.recurringApp = EB_View.notification.app.LaunchTypeApp.subApp.RecurringApp.getInstance(options);

                        //RecurringApp app
                        options = {
                            model:new Backbone.Model(launchType.saveCategorySetting),
                            container:this.jDom.categoryContainer
                        };
                        this.subApps.categoryApp = EB_View.notification.app.LaunchTypeApp.subApp.CategoryApp.getInstance(options);

                        //event app
                        options = {
                            model:new Backbone.Model(launchType.eventSetting),
                            container:$("#bc_event_li")
                        };
                        this.subApps.eventApp = EB_View.notification.app.LaunchTypeApp.subApp.EventApp.getInstance(options);
                        //button app
                        options = {
                            model:new Backbone.Model(launchType.buttonsSetting),
                            container:$("#buttons"),
                            sendCallBack: function(){
                                view.options.sendCallBack.call(view);
                            },
                            scheduleCallBack: function(){
                                view.options.scheduleCallBack.call(view);
                            },
                            saveCallBack: function(){
                                view.options.saveCallBack.call(view);
                            },
                            cancelCallBack:function(){
                                view.options.cancelCallBack.call(view);
                            }
                        };
                        this.subApps.buttonApp = EB_View.notification.app.LaunchTypeApp.subApp.ButtonApp.getInstance(options);
                    },
                    launchTypeChange:function(type){
                        if(type=="Save"){
                            view.model.set("_isSaved",true);
                        }else{
                            view.model.set("_isSaved",false);

                        }
                    }
                }
                this.subApps.launchTypeApp = EB_View.notification.app.LaunchTypeApp.getInstance(options);
            },
            loadComplete:function(model){
                if(model.get("loadCompleted")){
                    this.dealValidate(model);
                    this.dealChangeNotificationType(model);
                    this.dealMessageTypeChange(model);
                }
            },
            dealMessageTypeChange:function(model){
                if(model.get("loadCompleted")){
                    this.subApps.settingApp.languageApp.model.set("_onlyText",model.get("_onlyText"));
                }
            },
            dealChangeNotificationType:function(model){
                if(model.get("loadCompleted")){
                    var type = model.get("_notificationType");
                    var pollingOrConference = {"polling":(type=="Polling" || type=="Quota"), "conference" : (type=="Conference")};
                    this.subApps.settingApp.subApps.confirmApp.model.set("pollingOrConference", $.extend({},pollingOrConference));
                    if(this.subApps.settingApp && this.subApps.settingApp.voiceMailApp){
                        this.subApps.settingApp.voiceMailApp.adjustVisibleByNotificationType($.extend({},pollingOrConference));
                        this.subApps.settingApp.deliveryMethodApp.renderTTYStatus(type=="Conference");
                    }
                }
            },
            clickPublishCheckbox:function(isChecked, hasIpaws){
                if(isChecked){
                    this.model.set("_pubishChecked",true);
                }else{
                    this.model.set("_pubishChecked",false);
                }
                this.subApps.launchTypeApp.publishMessageCheckedHandle(isChecked,hasIpaws);
            },
            dealSelectContact:function(selected){
                if(selected){
                    this.model.set("_hasContacts",true);
                }else{
                    this.model.set("_hasContacts",false);
                }
            },
            dealValidate:function(model){
                if(this.model.get("loadCompleted")){
                    if(model.get("_isSaved")){
                        this.subApps.contactApp.ignoreValidate(true);
                        this.subApps.settingApp.ignoreValidate(true);
//                        this.subApps.messageApp.ignoreValidate(true);
                    }else{
                        if(model.get("_hasContacts")){
                            this.subApps.contactApp.ignoreValidate(false);
                            this.subApps.settingApp.ignoreValidate(false);
//                            this.subApps.messageApp.ignoreValidate(false);
                        }else if(model.get("_pubishChecked")){
                            this.subApps.contactApp.ignoreValidate(true);
                            this.subApps.settingApp.ignoreValidate(true);
//                            this.subApps.messageApp.ignoreValidate(true);
                        }

                    }
                    this.subApps.messageApp.model.set({"_isSaved":model.get("_isSaved"),"_hasContacts":model.get("_hasContacts"),"_publishChecked":model.get("_publishChecked"),"_onlyIpawsChecked":model.get("_onlyIpawsChecked")});
                }
            },
            getJsonData:function(){
                if(this.isCrossOrg){
                    var broadcastTemplate = this.model.get("broadcastTemplate");
                    this.subApps.messageApp.getJsonData(broadcastTemplate);
                    var batchNotificationContacts = this.subApps.contactApp.getJsonData();
                    this.subApps.launchTypeApp.getJsonData(broadcastTemplate);
                    this.subApps.settingApp.getJsonData(broadcastTemplate);
                    return {notification:broadcastTemplate, batchNotificationContacts : batchNotificationContacts};
                }else{
                    var broadcastTemplate = this.model.get("broadcastTemplate");
                    this.subApps.messageApp.getJsonData(broadcastTemplate);
                    this.subApps.contactApp.getJsonData(broadcastTemplate);
                    this.subApps.launchTypeApp.getJsonData(broadcastTemplate);
                    this.subApps.settingApp.getJsonData(broadcastTemplate);
                    return broadcastTemplate;
                }
            }

        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.Model);
            var model = new Model(null,{url:options.url,isCrossOrg:options.isCrossOrg});
            var View = Backbone.View.extend(this.View);
            var createApp = new View({
                el:options.container,
                model:model,
                sessionId:options.sessionId,
                submitCallBack:options.submitCallBack,
                sendCallBack:options.sendCallBack,
                scheduleCallBack:options.scheduleCallBack,
                saveCallBack:options.saveCallBack,
                cancelCallBack:options.cancelCallBack,
                isCrossOrg:options.isCrossOrg,
                organizations:options.organizations
            });
            return createApp;
        }
    }
})(EB_View);
