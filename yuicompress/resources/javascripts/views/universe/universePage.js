(function(view){
    view.universe.pageApp={
        Model:{
            defaults:function(){
                return {
                    load:false,
                    loadCompleted:false
                }
            },
            initialize:function(){
                if(arguments && arguments.length>1 && arguments[1].url){
                    this.urlRoot = arguments[1].url;
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
                this.publish_permission = EB_Common.Security.protect(["NETWORK_EFFECT_showNetworkEffect","TEMPLATE_send_ipaws","ALERT_US","GENERIC_ONE_WAY"]);
                this.model.on("change:load",this.render,this);

                this.model.fetch();
                this.model.on("change:_publishChecked",this.dealValidate,this);
                this.model.on("change:_onlyIpawsChecked",this.dealValidate,this);
                this.model.on("change:_ipawsChecked",this.dealValidate,this);
                this.model.on("change:_isSaved",this.dealValidate,this);
                this.model.on("change:_hasContacts",this.dealValidate,this);
                this.model.on("change:loadCompleted", this.loadComplete, this);
                this.model.on("change:_notificationType", this.dealChangeNotificationType, this);
                this.pubishChecked= false;
            },
            render:function(){
                var view = this;
                EB_Common.validation.validate(this.$("#notificationForm"),{
                    submitHandler:function(form){
                        if(view.model.get("_publishChecked") && !view.model.get("_hasContacts")){
                            view.submitHandler(form);
                        }else if(view.subApps.messageApp.onlyHasText() && view.subApps.settingApp.hasVoicePath()){
                            EB_Common.dialog.confirm(i18n['notification.new.checkvoice'],'',function(){
                                view.submitHandler(form);
                            });
                        }else if(view.subApps.messageApp.onlyHasVoice() && view.subApps.settingApp.hasTextPath()){
                            EB_Common.dialog.alert(i18n['notification.text.textPath.voiceOnly.waring']);
                            return false;
                        }else{
                            view.submitHandler(form);
                        }
                    },
                    onfocusout: function (element, event) {
                        if (element.name !== "privateKey") {
                            $.validator.defaults.onfocusout.call(this, element, event);
                    }
                    }
                    ,
                    onkeyup: function (element, event) {
                        if (element.name !== "privateKey") {
                            $.validator.defaults.onkeyup.call(this, element, event);
                        }
                    }

                });
                this.jDom.messageContainer = this.$("#bc_message_li");
                this.jDom.publishContainer = this.$("#bc_publish_li");
                this.jDom.contactContainer = this.$("#bc_contacts_li");
                this.jDom.settingContainer = this.$("#bc_settings_li");
                this.jDom.launchTypeContainer = this.$("#bc_launchType_li");
                var model = this.model.toJSON();
                this.loadMessage(model.messageAppModelData);
                this.loadContacts(model.contactsAppModelData);
                this.loadSetting(model.settingAppModelData);
                this.loadLaunchType(model.launchTypeAppModelData);
                this.loadPublish({sourceData:model.additionalData.publishAdditionalData||{},modelData:model.broadcastTemplate.publicMessages});
                this.model.set("loadCompleted",true);
                if(EB_Common.browser.versions.handleDevice){
                    this.$("#widgets_list_ul a").removeAttr("title");
                    this.$("#notification_widget_icon").removeAttr("title");
                }else{
                    this.$("#widgets_list_ul a").tooltip({hide:false,position: { my: "left+15 center", at: "right center" }});
                    this.$("#notification_widget_icon").tooltip({hide:false,position: { my: "left+15 center", at: "right center" }});
                }
            },
            reset:function(){
                this.adjustNotificationContainer();
                this.$("#bc_message_li").replaceWith($("<li id='bc_message_li'class='noti_content_li'/>"));
                this.$("#bc_publish_li").replaceWith($("<li id='bc_publish_li'class='noti_content_li'/>"));
                this.$("#bc_settings_li").replaceWith($("<li id='bc_settings_li'class='noti_content_li'/>"));
                this.$("#bc_launchType_li").replaceWith($("<li id='bc_launchType_li' class='noti_content_li'/>"));
                this.jDom.messageContainer = this.$("#bc_message_li");
                this.jDom.publishContainer = this.$("#bc_publish_li");
                this.jDom.settingContainer = this.$("#bc_settings_li");
                this.jDom.launchTypeContainer = this.$("#bc_launchType_li");
                this.model.set("loadCompleted",false);
                var model = this.model.toJSON();
                this.subApps.contactApp.subApps.individualGroupFilter.reset();
                this.subApps.contactApp.model.set({"contactsCount":0,"groupsCount":0,filtersCount:0});
                this.subApps.messageApp = null;
                this.subApps.settingApp = null;
                this.subApps.launchTypeApp.subApps.buttonApp.undelegateEvents();
                this.subApps.launchTypeApp = null;
                this.subApps.publishApp = null;
                this.loadMessage(model.messageAppModelData);
                this.loadSetting(model.settingAppModelData);
                this.loadLaunchType(model.launchTypeAppModelData);
                this.loadPublish({sourceData:model.additionalData.publishAdditionalData||{},modelData:model.broadcastTemplate.publicMessages});
                this.model.set("loadCompleted",true);
            },
            isAr_SA : (i18n.getCurrentLanguage()=="ar_SA"),
            windowResize:function(){
                var windowWidth=EB_View.universe.page.width;
                var windowHeight=EB_View.universe.page.height;
                this.$el.width(windowWidth).height(windowHeight);
                if(!this.subApps.widgetApp) return;
                var widgetContainer = this.subApps.widgetApp.$el;
                var notificationContainer = this.$("#notificationContainer");
                if(widgetContainer.hasClass("open")){
                    var layout = this.subApps.widgetApp.$("#universe_layout a.selected").attr("layout");
                    var w = (layout==3)?(parseInt(windowWidth/2)):(parseInt(windowWidth/3));
                    widgetContainer.width(w);
                }
                if(notificationContainer.hasClass("open")){
                    var w = parseInt(windowWidth/3);
                    notificationContainer.width(w);
                    if(!this.isAr_SA){
                        widgetContainer.css({left:w+"px"});
                    }else{
                        widgetContainer.css({right:w+"px"});
                    }
                }
                widgetContainer.height(windowHeight);
                notificationContainer.height(windowHeight).children().height(windowHeight);
                var widgetContainerWidth = widgetContainer.is(":visible")?widgetContainer.width(): 0;
                var notificationContainerWidth = notificationContainer.is(":visible")?notificationContainer.width(): 0;
                this.subApps.contactApp.subApps.universeApp.adjustMapHeight(windowHeight);
                this.subApps.contactApp.subApps.universeApp.adjustMapWidth(windowWidth-widgetContainerWidth-notificationContainerWidth);
            },
            adjustWidgetContainer:function(){
                var windowWidth=EB_View.universe.page.width;
                var widgetContainer = this.subApps.widgetApp.$el;
                var notificationContainer = this.$("#notificationContainer");
                widgetContainer.toggleClass("open").toggleClass("close");
                var w = 0;
                if(widgetContainer.hasClass("close")){
                    w = 40;
                }else if(widgetContainer.hasClass("open")){
                    var layout = this.subApps.widgetApp.$("#universe_layout a.selected").attr("layout");
                    w = (layout==3)?(parseInt(windowWidth/2)):(parseInt(windowWidth/3));
                }
                widgetContainer.width(w);
                if(notificationContainer.hasClass("open")){
                    notificationContainer.toggleClass("open").toggleClass("close");
                    notificationContainer.css({left:"0px"});
                    if(!this.isAr_SA){
                        notificationContainer.css({left:"0px"});
                    }else{
                        notificationContainer.css({right:"0px"});
                    }
                    notificationContainer.width(40);
                    if(!this.isAr_SA){
                        widgetContainer.css({left:"40px"});
                    }else{
                        widgetContainer.css({right:"40px"});
                    }
                }else{
                    if(!this.isAr_SA){
                        notificationContainer.css({left:"0px"});
                    }else{
                        notificationContainer.css({right:"0px"});
                    }
                }
                if(!notificationContainer.is(":hidden")){
                    w+=40;
                }
                this.subApps.contactApp.subApps.universeApp.adjustMapWidth(windowWidth-w);
            },
            adjustWidgetContainerWhenLayoutChange:function(layout){
                var windowWidth=EB_View.universe.page.width;
                var widgetContainer = this.subApps.widgetApp.$el;
                var notificationContainer = this.$("#notificationContainer");
                var w = (layout==3)?(parseInt(windowWidth/2)):(parseInt(windowWidth/3));
                widgetContainer.width(w);
                if(!this.isAr_SA){
                    notificationContainer.css({left:"0px"});
                }else{
                    notificationContainer.css({right:"0px"});
                }
                if(!notificationContainer.is(":hidden")){
                    w+=40;
                }
                this.subApps.contactApp.subApps.universeApp.adjustMapWidth(windowWidth-w);
            },
            adjustNotificationContainer:function(){
                var windowWidth=EB_View.universe.page.width;
                var widgetContainer = this.subApps.widgetApp.$el;
                var notificationContainer = this.$("#notificationContainer");
                if(!notificationContainer.is(":hidden")){
                    notificationContainer.toggleClass("close")
                }
                notificationContainer.toggleClass("open").show();
                var w = 0;
                if(notificationContainer.hasClass("close")){
                    w = 40;
                }else if(notificationContainer.hasClass("open")){
                    w = parseInt(windowWidth/3);
                }
                notificationContainer.width(w);
                widgetContainer.width(40);
                if(widgetContainer.hasClass("open")){
                    widgetContainer.toggleClass("open").toggleClass("close");
                }
                if(!this.isAr_SA){
                    widgetContainer.css({left:w+"px"});
                }else{
                    widgetContainer.css({right:w+"px"});
                }

                this.subApps.contactApp.subApps.universeApp.adjustMapWidth(windowWidth-w-40);
            },
            submitHandler:function(form){
                this.options.submitCallBack && this.options.submitCallBack.call(this);
            },
            loadMessage:function(data){
                var view = this;
                var model = EB_View.notification.app.MessageApp.MessageModel.parse(data);
                var options={
                    sessionId:this.options.sessionId,
                    model:new Backbone.Model(model),
                    container:this.jDom.messageContainer.empty(),
                    notificationTypeChangeCallBack:function(type){
                        view.model.set("_notificationType",type);
                    },
                    publishMessageCallback:function(){
                        return view.pubishChecked;
                    }
                };
                var messageApp  =  this.subApps.messageApp = EB_View.universe.messageApp = EB_View.notification.app.MessageApp.getInstance(options);
                this.subApps.messageApp.subApps.templateApp = EB_View.notification.app.MessageTemplateApp.getInstance({
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
            loadPublish:function(data){
                if(this.publish_permission){
                    var universeView = this;
                    var options={
                        sourceData:data.sourceData,
                        modelData:data.modelData,
                        container:this.jDom.publishContainer,
                        sessionId:this.options.sessionId,
                        checkedCallback:function(isChecked, onlyHasIpwas, ipawsChecked){
                            universeView.clickPublishCheckbox(isChecked, onlyHasIpwas, ipawsChecked);
                        }
                    }
                    this.subApps.publishApp = EB_View.notification.app.PublishApp.getInstance(options);
                }
            },
            loadContacts:function(data){
                var that = this;
                var options={
                    modelData:data,
                    container:this.jDom.contactContainer,
                    isCrossOrg:that.isCrossOrg,
                    isDialog:false,
                    organizations:that.options.organizations,
                    loadSuccess:function(){
                        //create the instance of contact app
                        var _contactApp = this;
                        var options2={
                            model:new Backbone.Model(data.IndividualGroupFilterData),
                            selectedGroupIds:_contactApp.model.get("selectedGroupIds"),
                            okCallBack:function(){
                                _contactApp.model.set("contactsCount",this.multiselectIndividual.children().length);
                                _contactApp.model.set("groupsCount",this.multiselectGroup.children().length);
                                _contactApp.model.set("filtersCount",this.multiselectFilter.children().length);
                            }
                        }|| {};
                        var individualGroupFilter = EB_View.notification.app.ContactApp.SubUnits.IndividualGroupFilter.getInstance(options2);
                        this.subApps.individualGroupFilter = individualGroupFilter;
                        var options3 = {
                            url:EB_Common.Ajax.wrapperUrl("/universe/homeAsJson"),
                            originalGisData:data.UniverseAppData,
                            isDialog:false,
                            container:$("#universe_map"),
                            initMapSize:{w:Math.max($("#container").width(),1000)-40,h:Math.max(($(window).height()-120),500)},
                            selectButtonCallBack:function(){
                                _contactApp.model.set("shapesCount",this.model.get("tempStorage").shapesCount||0);
                            },
                            newNotificationButtonCallBack:function(){
                                if(that.$("#notificationContainer").hasClass("open")) return;
                                that.adjustNotificationContainer();
                            },
                            loadSuccess:function(){
                                that.loadWidgetApp();
                            }
                        }
                        EB_View.universe.universeApp = this.subApps.universeApp = EB_View.universe.UniverseApp.getInstance(options3);
                        EB_View.universe.config = this.subApps.universeApp.model.toJSON();
                        EB_View.universe.layers = this.subApps.universeApp.model.get("tempStorage").layers;
                        EB_View.universe.map = this.subApps.universeApp.map;
                    },
                    selectContactCallback:function(val){
                        that.dealSelectContact(val);
                    }
                };
                this.subApps.contactApp = EB_View.universe.contactApp = EB_View.notification.app.ContactApp.getInstance(options);
//                this.subApps.contactApp = EB_View.notification.app.ContactApp.getInstance(options);
            },
            loadContacts_:function(data){
                var universeView = this;
                var options={
                    model:new Backbone.Model(data),
                    isDialog:false,
                    container:this.jDom.contactContainer,
                    loadSuccess:function(){
                        //create the instance of contact app
                        var _contactApp = this;
                        var options2={
                            model:new Backbone.Model(data.IndividualGroupFilterData),
                            selectedGroupIds:_contactApp.model.get("selectedGroupIds"),
                            okCallBack:function(){
                                _contactApp.model.set("contactsCount",this.multiselectIndividual.children().length);
                                _contactApp.model.set("groupsCount",this.multiselectGroup.children().length);
                                _contactApp.model.set("filtersCount",this.multiselectFilter.children().length);
                            }
                        }|| {};
                        var individualGroupFilter = EB_View.notification.app.ContactApp.SubUnits.IndividualGroupFilter.getInstance(options2);
                        this.subApps.individualGroupFilter = individualGroupFilter;
                        options2 = {
                            url:EB_Common.Ajax.wrapperUrl("/universe/homeAsJson"),
                            originalGisData:data.UniverseAppData,
                            isDialog:false,
                            container:$("#universe_map"),
                            initMapSize:{w:Math.max($("#container").width(),1000)-40,h:Math.max(($(window).height()-120),500)},
                            selectButtonCallBack:function(){
                                _contactApp.model.set("shapesCount",this.model.get("tempStorage").shapesCount||0);
                            },
                            newNotificationButtonCallBack:function(){
                                if(universeView.$("#notificationContainer").hasClass("open")) return;
                                universeView.adjustNotificationContainer();
                            },
                            loadSuccess:function(){
                                universeView.loadWidgetApp();
                            }
                        }
                        EB_View.universe.universeApp = this.subApps.universeApp = EB_View.universe.UniverseApp.getInstance(options2);
                        EB_View.universe.config = this.subApps.universeApp.model.toJSON();
                        EB_View.universe.layers = this.subApps.universeApp.model.get("tempStorage").layers;
                        EB_View.universe.map = this.subApps.universeApp.map;
                    },
                    selectContactCallback:function(val){
                        universeView.dealSelectContact(val);
                    }
                };
                this.subApps.contactApp = EB_View.universe.contactApp = EB_View.notification.app.ContactApp.getInstance(options);
            },
            loadSetting:function(data){
                //create instance of Setting
                var model = EB_View.notification.app.SettingApp.settingAppModel.parse(data);
                var options={
                    model:new Backbone.Model(model),
                    container:this.jDom.settingContainer
                }
                this.subApps.settingApp = EB_View.notification.app.SettingApp.getInstance(options);
            },
            loadLaunchType:function(data){
                var view = this;
                var modelData = EB_View.notification.app.LaunchTypeApp.LaunchTypeModel.parse(data);
                var options = {
                    model:new Backbone.Model(modelData),
                    container:this.jDom.launchTypeContainer,
                    loadSuccess:function(){
                        var launchType = this.model.toJSON();
                        //ScheduleApp
                        var options = {
                            model:new Backbone.Model(launchType.launchPolicy.launchSetting.scheduleSetting),
                            container:this.jDom.scheduleContainer
                        } || {};
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
                        if(launchType.buttonsSetting) launchType.buttonsSetting.hideCancel = true;
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
            loadWidgetApp:function(){
                var universeView = this;
                var options = {
                    container:$("#universeWidgetContainer"),
                    layers:this.subApps.contactApp.subApps.universeApp.model.get("tempStorage").layers,
                    hideShowCallBack:function(){
                        universeView.adjustWidgetContainer();
                    },
                    layoutChangeCallBack:function(layout){
                        universeView.adjustWidgetContainerWhenLayoutChange(layout);
                    }
                }
                this.subApps.widgetApp = EB_View.universe.WidgetApp.getInstance(options);
            },
            loadComplete:function(model){
                if(model.get("loadCompleted")){
                    this.dealValidate(model);
                    this.dealChangeNotificationType(model);
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
            clickPublishCheckbox:function(isChecked, onlyHasIpawsChecked, ipawsChecked){
                this.model.set("_publishChecked",isChecked);
                this.model.set("_onlyIpawsChecked",onlyHasIpawsChecked);
                this.model.set("_ipawsChecked",ipawsChecked);
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
                    }else{
                        if(model.get("_hasContacts") || model.get("_ipawsChecked")){
                            this.subApps.contactApp.ignoreValidate(false);
                            this.subApps.settingApp.ignoreValidate(false);
                        }else if(model.get("_publishChecked")){
                            this.subApps.contactApp.ignoreValidate(true);
                            this.subApps.settingApp.ignoreValidate(true);
                        }

                    }
                    this.subApps.messageApp.model.set({"_isSaved":model.get("_isSaved"),"_hasContacts":model.get("_hasContacts"),"_publishChecked":model.get("_publishChecked"),"_onlyIpawsChecked":model.get("_onlyIpawsChecked")});
                    this.subApps.launchTypeApp.publishMessageCheckedHandle(model.get("_publishChecked"),model.get("_onlyIpawsChecked"), model.get("_ipawsChecked"));
                }
            },
            events:{
                "click #hide_show_notification_widget":"eventClickHideShowNotificationContainer",
                "click #notification_widget_icon":"eventClickHideShowNotificationContainer"
//                "click div.publishMessageCheckboxes>:checkbox":"clickPublishCheckbox"
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
            eventClickHideShowNotificationContainer:function(){
                this.adjustNotificationContainer();
            },
            getJsonData:function(){

                var broadcastTemplate = this.model.get("broadcastTemplate");
                this.subApps.messageApp.getJsonData(broadcastTemplate);
                this.subApps.contactApp.getJsonData(broadcastTemplate);
                this.subApps.launchTypeApp.getJsonData(broadcastTemplate);
                this.subApps.settingApp.getJsonData(broadcastTemplate);
                return {notification:broadcastTemplate,publishMessage:(this.publish_permission&&this.subApps.publishApp)?this.subApps.publishApp.getJsonData():{}};
            }

        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.Model);
            var model = new Model(null,{url:options.url});
            var View = Backbone.View.extend(this.View);
            var createApp = new View({
                el:options.container,
                model:model,
                sessionId:options.sessionId,
                submitCallBack:options.submitCallBack,
                sendCallBack:options.sendCallBack,
                scheduleCallBack:options.scheduleCallBack,
                saveCallBack:options.saveCallBack,
                cancelCallBack:options.cancelCallBack
            });
            return createApp;
        }
    }
})(EB_View);
