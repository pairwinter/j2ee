(function(view,i18n){
    view.notification.app.LaunchTypeApp={
        LaunchTypeModel:{
            defaults:function(){
                return {
                    load:false
                }
            },
            initialize:function(){
                if(arguments && arguments.length>1 && arguments[1].url){
                    this.urlRoot = arguments[1].url;
                }
            },
            parse:function(response){
                EB_Common.logger.log(response);
                var launchTypeData = {load:true};
                launchTypeData.categories=response.categories;
                launchTypeData.currentUser=response.currentUser;
                launchTypeData.events=response.events;
                launchTypeData.launchTypes = [];
                launchTypeData.launchType = response.bcTemplate.launchtype || "";
                $.each(response.launchTypes,function(i,type){
                    var _type={name:type,chekced:false,displayName:type};
                    if(type=="SendNow"){
                        _type.displayName = i18n["notification.type.now.label"]
                    }else if(type=="Schedule"){
                        _type.displayName = i18n["notification.type.later.label"]
                    }else if(type=="Recurring"){
                        _type.displayName = i18n["notification.type.recurring.label"]
                    }
                    if(i==0){
                        _type.checked = true;
                    }else{
                        if(type==launchTypeData.launchType){
                            launchTypeData.launchTypes[0].checked = false;
                            _type.checked = true;
                        }
                    }
                    launchTypeData.launchTypes.push(_type);
                });
                //----------------------------hand  Schedule and  Recurring value---------------------------------//
                launchTypeData.launchPolicy = response.launchPolicy || {};
                launchTypeData.launchPolicy.launchSetting = launchTypeData.launchPolicy.launchSetting || {};
                launchTypeData.launchPolicy.launchSetting.scheduleSetting = {scheduleDate:""};
                if(launchTypeData.launchType=="Schedule"){
                    if(launchTypeData.launchPolicy.launchSetting.startDate){
                        var startDate = launchTypeData.launchPolicy.launchSetting.startDate;
                        startDate = startDate.substring(0,startDate.lastIndexOf(":"));
                        launchTypeData.launchPolicy.launchSetting.scheduleSetting.scheduleDate = startDate;
                    }
                    launchTypeData.launchPolicy.launchSetting.startDate = "";
                    launchTypeData.launchPolicy.launchSetting.endDate="";
                    launchTypeData.launchPolicy.launchSetting.repeatNumber="";
                    launchTypeData.launchPolicy.launchSetting.hourMinutes="";
                }else if(launchTypeData.launchType=="Recurring"){
                    if(launchTypeData.launchPolicy.launchSetting.startDate){
                        var startDate = launchTypeData.launchPolicy.launchSetting.startDate;
                        startDate = startDate.split(" ")[0];
                        launchTypeData.launchPolicy.launchSetting.startDate = startDate;
                    }
                    if(launchTypeData.launchPolicy.launchSetting.endDate){
                        var endDate = launchTypeData.launchPolicy.launchSetting.endDate;
                        endDate = endDate.split(" ")[0];
                        launchTypeData.launchPolicy.launchSetting.endDate = endDate;
                    }
                }
                switch (launchTypeData.launchPolicy.launchSetting.repeatType){
                    case 'DAILY': launchTypeData.launchPolicy.launchSetting.dailySelected = true; break;
                    case 'WEEKLY': launchTypeData.launchPolicy.launchSetting.weeklySelected = true; launchTypeData.launchPolicy.launchSetting.onWeekly = true; break;
                    case 'MONTHLY': launchTypeData.launchPolicy.launchSetting.monthlySelected = true; launchTypeData.launchPolicy.launchSetting.onMonthly = true; break;
                    case 'YEARLY': launchTypeData.launchPolicy.launchSetting.yearlySelected = true; launchTypeData.launchPolicy.launchSetting.onYearly = true; break;
                    default : launchTypeData.launchPolicy.launchSetting.dailySelected = true; launchTypeData.launchPolicy.launchSetting.repeatType = "DAILY";
                }
                var weekDays=[];
                var selectedWeekDays = launchTypeData.launchPolicy.launchSetting.weekDays = launchTypeData.launchPolicy.launchSetting.weekDays || [];
                $.each(response.weekDays,function(i,weekDay){
                    var day = {weekDay:weekDay,checked:false};
                    if($.inArray(weekDay,selectedWeekDays)>-1){
                        day.checked = true;
                    }
                    weekDays.push(day);
                });
                launchTypeData.launchPolicy.launchSetting.weekDays = $.merge([],weekDays);
                var monthlyDays = [];
                for(var i = 1 ;i<=31;i++){
                    var day = {day:i,selected:false};
                    if(launchTypeData.launchPolicy.launchSetting.repeatType=="MONTHLY" && (i==launchTypeData.launchPolicy.launchSetting.day)){
                        day.selected = true;
                    }
                    monthlyDays.push(day);
                }
                launchTypeData.launchPolicy.launchSetting.monthlyDays = monthlyDays;
                launchTypeData.launchPolicy.launchSetting.yearlyValue="";
                if(launchTypeData.launchPolicy.launchSetting.repeatType=="YEARLY"){
                    if(launchTypeData.launchPolicy.launchSetting.month!=0 && launchTypeData.launchPolicy.launchSetting.day!=0)
                        launchTypeData.launchPolicy.launchSetting.yearlyValue = launchTypeData.launchPolicy.launchSetting.month + "/" + launchTypeData.launchPolicy.launchSetting.day;
                }
                launchTypeData.launchPolicy.launchSetting.recurringSetting = $.extend({},launchTypeData.launchPolicy.launchSetting);
                //-----------------------------------------------------------hand save category---------------------------------------------------------------------//
                launchTypeData.saveCategorySetting = {saveChecked:false,categories:[]};
                if((!launchTypeData.launchType) && response.bcTemplate.id){
                    $.each(launchTypeData.launchTypes,function(i,type){
                        type.checked = false;
                    });
                    launchTypeData.saveCategorySetting.saveChecked = true;
                    launchTypeData.saveChecked = true;
                    launchTypeData.launchType = "Save";
                }
                launchTypeData.saveCategorySetting.categoryName = response.bcTemplate.category?response.bcTemplate.category.name||"":"";
                var categories =[];
                $.each(response.categories||[],function(i,category){
                    categories.push({id:category.id,name:category.name,selected:category.name==launchTypeData.saveCategorySetting.categoryName});
                });
                launchTypeData.saveCategorySetting.categories = categories;

                //-----------------------------------------------------------hand event data -------------------------------//
                launchTypeData.eventSetting = {eventChecked:false,events:[]};
                launchTypeData.eventSetting.eventName = response.bcTemplate.event?response.bcTemplate.event.name||"":"";
                if(response.bcTemplate.event){
                    launchTypeData.eventSetting.eventChecked = true;
                }
                var events =[];
                $.each(response.events||[],function(i,event){
                    events.push({id:event.id,name:event.name,selected:event.name==launchTypeData.eventSetting.eventName});
                });
                launchTypeData.eventSetting.events = events;

                //------------------------------------------hand buttons ---------------------------//
                launchTypeData.buttonsSetting = {showSend:false,showSave:false,showSchedule:false};
                $.each(launchTypeData.launchTypes,function(i,type){
                    if(type.name=="SendNow" && type.checked){
                        launchTypeData.buttonsSetting.showSend = true;
                    }
                    if(type.name=="Schedule" && type.checked){
                        launchTypeData.buttonsSetting.showSchedule = true;
                    }
                    if(type.name=="Recurring" && type.checked){
                        launchTypeData.buttonsSetting.showSchedule = true;
                    }
                })
                launchTypeData.buttonsSetting.showSave = launchTypeData.saveCategorySetting.saveChecked;
                return launchTypeData;
            }
        },
        LaunchTypeAppView:{
            jDom:{},
            template:{},
            isCrossOrg:false,
            subApps:{
                scheduleApp:null,
                recurringApp:null,
                categoryApp:null,
                eventApp:null,
                buttonApp:null
            },
            initialize:function(){
                this.isCrossOrg = this.options.isCrossOrg;
                $.templates({
                    launchTypeAppTemplate: $("#launchTypeAppTemplate").html()
                });
                this.template.launchTypeAppTemplate = $.render.launchTypeAppTemplate;
                this.launchTypeChange = this.options.launchTypeChange;
                this.model.set("isFollowUp",this.options.isFollowUp);
                this.model.on("change:load",this.render,this);
                this.model.on("change:launchType",this.renderLaunchType,this);
                if(this.model.urlRoot)
                    this.model.fetch();
                else{

                    this.render();
                    this.renderLaunchType();
                }
            },
            render:function(){
                this.$el.html(this.template.launchTypeAppTemplate([this.model.toJSON()]));
                this.jDom.scheduleContainer = this.$("#scheduleContainer");
                this.jDom.recurringContainer = this.$("#recurringContainer");
                this.jDom.categoryContainer = this.$("#categoryContainer");

                this.options.loadSuccess && this.options.loadSuccess.call(this);
                this.model.set("launchType",$(":checked[name='launchTypeRadio']").val());
                return this;
            },
            renderLaunchType:function(){
                var launchType  = this.model.get("launchType");
                this.$("#scheduleContainer").hide();
                this.$("#recurringContainer").hide();
                this.$("#categoryContainer").hide();
                if(launchType == "Schedule"){
                    this.$("#scheduleContainer").show();
                    this.subApps.scheduleApp.addOrRemoveValidation(true);
                    this.subApps.recurringApp.addOrRemoveValidation(false);
                    this.subApps.buttonApp.model.set({"showSchedule":true,"showSave":false,"showSend":false});
                }else if(launchType == "Recurring"){
                    this.$("#recurringContainer").show();
                    this.subApps.scheduleApp.addOrRemoveValidation(false);
                    this.subApps.recurringApp.addOrRemoveValidation(true);
                    this.subApps.buttonApp.model.set({"showSchedule":true,"showSave":false,"showSend":false});
                }else if(launchType == "SendNow"){
                    this.subApps.scheduleApp.addOrRemoveValidation(false);
                    this.subApps.recurringApp.addOrRemoveValidation(false);
                    this.subApps.buttonApp.model.set({"showSchedule":false,"showSave":false,"showSend":true});
                }else if(launchType == "Save"){
                    this.$("#categoryContainer").show();
                    this.subApps.scheduleApp.addOrRemoveValidation(false);
                    this.subApps.recurringApp.addOrRemoveValidation(false);
                    this.subApps.buttonApp.model.set({"showSchedule":false,"showSave":true,"showSend":false});
                }
                var view = this;
                $.validator.addMethod("checkOnWeekly",function(){
                    return view.$("#weekly_repeat :checked").length>0;
                },"this field is required!");
                this.launchTypeChange && this.launchTypeChange.call(this,launchType);
            },
            events:{
                "click input[name='launchTypeRadio']":"eventChangeLaunchTypeRadio"
            },
            eventChangeLaunchTypeRadio:function(e){
                this.model.set({"launchType":e.target.value});
            },
            publishMessageCheckedHandle:function(publishChecked, onlyIpawsChecked, ipawsChecked){
                if(publishChecked){
                    var launchType = this.model.get("launchType");
                    if(launchType != "SendNow" && launchType != "Save"){
                        this.$(":radio[value='SendNow']")[0].click();
                    }
                    this.$("#span_type1").hide();
                    this.$("#span_type2").hide();
                }else{
                    this.$("#span_type1").show();
                    this.$("#span_type2").show();
                }
                if(ipawsChecked){
                    this.$("#ipaws_security_tip").show();
                    this.$("#saveAsTemplate_div").hide();
                }else{
                    this.$("#ipaws_security_tip").hide();
                    this.$("#saveAsTemplate_div").show();
                }
            },
            getJsonData:function(parentObj){
                var launchType  = this.model.get("launchType");
                if(launchType == "Save"){
                    this.subApps.categoryApp.getJsonData(parentObj);
                }else{
                    parentObj.launchPolicy={
                        launchSetting:{
                            repeatType:null,
                            repeatNumber:null,
                            startDate:null,
                            endDate:null,
                            hourMinutes:null,
                            weekDays:null
                        }
                    };
                    if(launchType == "Schedule"){
                        parentObj.launchtype = "Schedule";
                        this.subApps.scheduleApp.getJsonData(parentObj);
                    }else if(launchType == "Recurring"){
                        parentObj.launchtype = "Recurring";
                        this.subApps.recurringApp.getJsonData(parentObj);
                    }else if(launchType == "SendNow"){
                        parentObj.launchtype = "SendNow";
                    }
                }
                this.subApps.eventApp.getJsonData(parentObj);

            }
        },
        getInstance:function(_options){
            var options = $.extend({},_options||{});
            var Model = Backbone.Model.extend(this.LaunchTypeModel);
            var View = Backbone.View.extend(this.LaunchTypeAppView);
            var model = null;
            if(options.url){
                model = new Model(null,{url:options.url})
            }else{
                model = options.model || (new Model());
            }
            return new View({el:options.container,model:model,loadSuccess:options.loadSuccess, isCrossOrg:options.isCrossOrg, launchTypeChange: options.launchTypeChange, isFollowUp:options.isFollowUp});
        }
    };

    view.notification.app.LaunchTypeApp.subApp={
        ScheduleApp:{
            ScheduleAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        scheduleTemplate: $("#scheduleTemplate").html()
                    });
                    this.template.scheduleTemplate = $.render.scheduleTemplate;
                    this.model.on("change:scheduleDate",this.renderScheduleDate,this);
                    this.render();
                    this.model.trigger("change:scheduleDate");
                },
                render:function(){
                    this.$el.html(this.template.scheduleTemplate([this.model.toJSON()]));
                    this.jDom.scheduleDate = this.$("#scheduleDate");
                    var dateTime = this.model.get("scheduleDate"),hour= 0,minute=0;

                    if(dateTime){
                        var time = dateTime.split(" ")[1];
                        hour = parseInt(time.split(":")[0]);
                        minute = parseInt(time.split(":")[1]);
                    }
                    //set the datepicker;
                    this.$("#scheduleDate").datetimepicker({
                        dateFormat: "yy-mm-dd",
                        minDate : new Date(),
                        showOn : "both",
                        buttonImage : EB_Common.Ajax.wrapperUrl("/statics/stylesheets/common/img/icn_calendar_16.png"),
                        buttonImageOnly : true,
                        changeMonth : true,
                        buttonText:  i18n['button.calendar.tooltip'],
                        changeYear : true,
                        hour:hour,
                        minute:minute
                    });
                    return this;
                },
                renderScheduleDate:function(){
                    this.$("#scheduleDate").val(this.model.get("scheduleDate"));
                },
                addOrRemoveValidation:function(isAdd){
                    if(isAdd){
                        this.jDom.scheduleDate.removeClass("ignore");
                    }else{
                        this.jDom.scheduleDate.addClass("ignore");
                    }
                },
                getJsonData:function(parentObj){
                    parentObj.launchPolicy.launchSetting.startDate = this.$("#scheduleDate").val()+":00";
                }
            },
            getInstance:function(_options){
                var options = $.extend({},_options||{});
                var View = Backbone.View.extend(this.ScheduleAppView);
                return new View({el:options.container,model:options.model});
            }
        },
        RecurringApp:{
            RecurringAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({
                        repeatTypeOnTemplate: $("#repeatTypeOnTemplate").html(),
                        repeatTypeTemplate: $("#repeatTypeTemplate").html()
                    });
                    this.template.repeatTypeTemplate = $.render.repeatTypeTemplate;
                    this.template.repeatTypeOnTemplate = $.render.repeatTypeOnTemplate;
                    this.model.on("change:repeatType",this.renderRepeatType,this);
                    this.render();
                    this.model.trigger("change:repeatType");
                },
                render:function(){
                    this.$el.html(this.template.repeatTypeTemplate([this.model.toJSON()]));
                    this.jDom.repeatNumber = this.$("#repeatNumber");
                    this.jDom.repeatStart = this.$("#repeatStart");
                    this.jDom.repeatEnd = this.$("#repeatEnd");
                    this.jDom.hourMinutes =this.$("#hourMinutes");
                    //set the datepicker;
                    var calendayIconUrl = EB_Common.Ajax.wrapperUrl("/statics/stylesheets/common/img/icn_calendar_16.png");
                    var recurringAppView = this;
                    this.jDom.repeatStart.datepicker({
                        dateFormat: "yy-mm-dd",
                        minDate : new Date(),
                        showOn : "both",
                        buttonText:  i18n['button.calendar.tooltip'],
                        buttonImage : calendayIconUrl,
                        buttonImageOnly : true,
                        changeMonth : true,
                        changeYear : true,
                        onSelect : function(dateStr,ui) {
                            recurringAppView.jDom.repeatEnd.datepicker('option', {
                                minDate : dateStr
                            });
                            ui.input.valid();
                        }
                    });
                    this.jDom.repeatEnd.datepicker({
                        dateFormat: "yy-mm-dd",
                        minDate : new Date(),
                        buttonText:  i18n['button.calendar.tooltip'],
                        showOn : "both",
                        buttonImage : calendayIconUrl,
                        buttonImageOnly : true,
                        changeMonth : true,
                        changeYear : true,
                        onSelect : function(dateStr,ui) {
                            recurringAppView.jDom.repeatStart.datepicker('option', {
                                maxDate : dateStr
                            });
                            ui.input.valid();
                        }
                    });
                    this.jDom.hourMinutes.timepicker({
                        showOn : "both",
                        buttonText:  i18n['button.calendar.tooltip'],
                        buttonImage : calendayIconUrl,
                        buttonImageOnly : true,
                        onSelect : function(dateStr,ui) {
                            ui.$input.valid();
                        }
                    });
                    return this;
                },
                addOrRemoveValidation:function(isAdd){
                    if(isAdd){
                        this.jDom.repeatNumber.removeClass("ignore");
                        this.jDom.repeatStart.removeClass("ignore");
                        this.jDom.repeatEnd.removeClass("ignore");
                        this.jDom.hourMinutes.removeClass("ignore");
                    }else{
                        this.jDom.repeatNumber.addClass("ignore");
                        this.jDom.repeatStart.addClass("ignore");
                        this.jDom.repeatEnd.addClass("ignore");
                        this.jDom.hourMinutes.addClass("ignore");
                    }
                },
                renderRepeatType:function(){
                    var repeatType = this.model.get("repeatType");
                    var displayRepeatType = "";
                    this.$("#repeatOnDiv").show();

                    var launchPolicy = this.model.toJSON();

                    switch(repeatType){
                        case 'DAILY':
                            displayRepeatType = i18n["notification.title.setting.schedule.days"];
                            this.$("#repeatOnDiv").hide();
                            break;
                        case 'WEEKLY':
                            displayRepeatType = i18n["notification.title.setting.schedule.weeks"];
                            launchPolicy.onWeekly = true;
                            launchPolicy.onMonthly = false;
                            launchPolicy.onYearly = false;
                            break;
                        case 'MONTHLY':
                            displayRepeatType = i18n["notification.title.setting.schedule.months"];
                            launchPolicy.onMonthly = true;
                            launchPolicy.onWeekly = false;
                            launchPolicy.onYearly = false;
                            break;
                        case 'YEARLY':
                            displayRepeatType = i18n["notification.title.setting.schedule.years"];
                            launchPolicy.onYearly = true;
                            launchPolicy.onWeekly = false;
                            launchPolicy.onMonthly = false;
                            break;
                    }
                    this.$("#displayRepeatType").html(displayRepeatType);
                    this.$("#repeatOnDivContainer").html(this.template.repeatTypeOnTemplate([launchPolicy]));
                    if(repeatType=="YEARLY"){
                        this.$("#yearly_repeat").datepicker({
                            dateFormat: "m/d",
                            minDate : new Date(),
                            showOn : "both",
                            buttonText:  i18n['button.calendar.tooltip'],
                            buttonImage : EB_Common.Ajax.wrapperUrl("/statics/stylesheets/common/img/icn_calendar_16.png"),
                            buttonImageOnly : true,
                            changeMonth : true,
                            changeYear : false,
                            onSelect : function(dateStr,ui) {
                                ui.input.valid();
                            }
                        });
                    }
                },
                events:{
                    "change #repeatType":"eventChangeRepeatType",
                    "change #weekly_repeat :checkbox":"eventChangeCheckbox"
                },
                eventChangeRepeatType:function(e){
                    this.model.set({"repeatType":e.target.value});
                },
                eventChangeCheckbox:function(e){
                    var len = this.$("#weekly_repeat input:checked").length;
                    this.$("#checkOnWeekly").val(len?len:"").valid();
                },
                getJsonData:function(parentObj){
                    var repeatType = this.model.get("repeatType");
                    var launchSetting = {} || {};
                    launchSetting.repeatType = repeatType;
                    launchSetting.repeatNumber   =this.$("#repeatNumber").val();
                    launchSetting.startDate   =this.$("#repeatStart").val()+" 00:00:00";
                    launchSetting.endDate   =this.$("#repeatEnd").val()+" 00:00:00";
                    launchSetting.hourMinutes   =this.$("#hourMinutes").val();
                    switch(repeatType){
                        case 'DAILY':
                            break;
                        case 'WEEKLY':
                            var weekDays = [];
                            this.$("input[name=launchPolicy.launchSetting.weekDays]:checked").each(function(){
                                weekDays.push(this.value);
                            });
                            launchSetting.weekDays=weekDays;
                            break;
                        case 'MONTHLY':
                            launchSetting.day = this.$("#monthly_repeat").val();
                            break;
                        case 'YEARLY':
                            var dateStr = this.$("#yearly_repeat").val();
                            launchSetting.month = parseInt(dateStr.split("/")[0]);
                            launchSetting.day = parseInt(dateStr.split("/")[1]);
                            break;
                    }
                    parentObj.launchPolicy.launchSetting = launchSetting;
                    return parentObj;
                }
            },
            getInstance:function(_options){
                var options = $.extend({},_options||{});
                var View = Backbone.View.extend(this.RecurringAppView);
                return new View({el:options.container,model:options.model});
            }
        },
        CategoryApp:{
            CategoryAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({categoryTemplate: $("#categoryTemplate").html()});
                    this.template.categoryTemplate = $.render.categoryTemplate;
                    this.render();
                },
                render:function(){
                    this.$el.html(this.template.categoryTemplate([this.model.toJSON()]));
                    this.jDom.categorySelect = this.$("#category");
                    //set the datepicker;
                    this.jDom.categorySelect.combobox({
                        comboboxWidth : true
                    });
                    return this;
                },
                getJsonData:function(parentObj){
                    parentObj.category={};
                    parentObj.category.name=this.$("#hidden_category_name").val();
                }
            },
            getInstance:function(_options){
                var options = $.extend({},_options||{});
                var View = Backbone.View.extend(this.CategoryAppView);
                return new View({el:options.container,model:options.model});
            }
        },
        EventApp:{
            EventAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({eventTemplate: $("#eventTemplate").html()});
                    this.template.eventTemplate = $.render.eventTemplate;
                    this.render();
                },
                render:function(){
                    this.$el.html(this.template.eventTemplate([this.model.toJSON()]));
                    this.jDom.eventSelect = this.$("#events");
                    //set the datepicker;
                    this.jDom.eventSelect.combobox({
                        comboboxWidth : true
                    });
                    return this;
                },
                events:{
                    "change #input_sendevent":"eventChangeSendEvent"
                },
                eventChangeSendEvent:function(e){
                    if(e.target.checked)
                        this.$("#div_sendevent").show();
                    else
                        this.$("#div_sendevent").hide();
                },
                getJsonData:function(parentObj){
                    parentObj.event = {};
                    parentObj.event.name=this.$("#hidden_event_name").val();
                }
            },
            getInstance:function(_options){
                var options = $.extend({},_options||{});
                var View = Backbone.View.extend(this.EventAppView);
                return new View({el:options.container,model:options.model});
            }
        },
        ButtonApp:{
            ButtonAppView:{
                jDom:{},
                template:{},
                initialize:function(){
                    $.templates({launchTypeButtonTemplate: $("#launchTypeButtonTemplate").html()});
                    this.template.launchTypeButtonTemplate = $.render.launchTypeButtonTemplate;
                    this.model.on("change",this.renderButtons,this);
                    this.render();

                },
                render:function(){
                    this.$el.html(this.template.launchTypeButtonTemplate([this.model.toJSON()]));
                    return this;
                },
                events:{
                    "click #send":"send",
                    "click #schedule":"schedule",
                    "click #save":"save",
                    "click #cancel":"cancel"
                },
                renderButtons:function(){
                    var buttonSetting = this.model.toJSON()
                    this.$("#send").hide();
                    this.$("#schedule").hide();
                    this.$("#save").hide();
                    if(buttonSetting.showSend){
                        this.$("#send").show();
                    }
                    if(buttonSetting.showSchedule){
                        this.$("#schedule").show();
                    }
                    if(buttonSetting.showSave){
                        this.$("#save").show();
                    }
                },
                send:function(e){
                    this.options.sendCallBack && this.options.sendCallBack.call(this);
                },
                schedule:function(e){
                    this.options.scheduleCallBack && this.options.scheduleCallBack.call(this);
                },
                save:function(e){
                    this.options.saveCallBack && this.options.saveCallBack.call(this);
                },
                cancel:function(e){
                    this.options.cancelCallBack && this.options.cancelCallBack.call(this);
                }
            },
            getInstance:function(_options){
                var options = $.extend({},_options||{});
                var View = Backbone.View.extend(this.ButtonAppView);
                return new View({
                    el:options.container,
                    model:options.model,
                    sendCallBack:options.sendCallBack,
                    scheduleCallBack:options.scheduleCallBack,
                    saveCallBack:options.saveCallBack,
                    cancelCallBack:options.cancelCallBack
                });
            }
        }
    };
})(EB_View,i18n);