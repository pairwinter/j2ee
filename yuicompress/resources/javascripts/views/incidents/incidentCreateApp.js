/**
 * Created with IntelliJ IDEA.
 * User: Damon
 * Date: 13-1-25
 * Time: PM1:56
 * To change this template use File | Settings | File Templates.
 */
(function(view){
    view.incidents = view.incidents || {};
    view.incidents.apps = view.incidents.apps || {};
    view.incidents.apps.VariableApp={
        VaribaleAppModel:{
            defaults:function(){
                return {
                    formVariableItems:[]
                };
            }
        },
        VariableAppView:{
            jDom:{},
            template:{},
            initialize:function(){
            	var model = this.model.toJSON();
            	model.formVariableItems.length&&model.formVariableItems.sort(function(a,b){
            		return (a.seq > b.seq)?1:-1;
            	});
                $.templates({incidentCreateAppVariableTemplate: $("#incidentCreateAppVariableTemplate").html()});
                this.template.incidentCreateAppVariableTemplate = $.render.incidentCreateAppVariableTemplate;
                this.model.on("change:formVariableItems",this.renderVariablesChange,this);
                this.render();
            },
            render:function(){
                var cid = this.cid;
                var model = this.model.toJSON();
                $.each(model.formVariableItems,function(j,v){
                    v.seq = j+1;
                    v.variableLiId = v.variableId + cid;
                    
                    var variableItem = v.variableItem;
                    if (variableItem.varType == 'Multiple' || variableItem.varType == 'Single') {
                    	var options = variableItem.variableOptions||[], value = [];
                    	$.each(options, function(i,option){
                    		if (option.isSelected) {
                    			value.push(option.val);
                    		}
                    	});
                    	v.val = value;
                    }
                }); 
                this.$el.html(this.template.incidentCreateAppVariableTemplate(model.formVariableItems));               
                this.addDatePicker();
                this.clearDatePicker();
                this.updateSystemTime();
                if(!this.options.isView){
                    this.$el.hide();
                }
//                this.sortableVariable();
                return this;
            },
            //clear the value of datepicker
            clearDatePicker: function() {
            	$('a.icon_clear_16').click(function(e){
                    var clsObj = $(this);//.prev().prev();
                    var isDateInput = false;                    
                    while(!isDateInput) {
                    	clsObj =  $(clsObj).prev();
                    	if($(clsObj).attr("inputdate")) {
                    		isDateInput = true;
                    		$(clsObj).val("");
                    		$(clsObj).valid();
                    		$(clsObj).trigger("change");
                    		break;
                    	}                	
                    }
                                    
                });
            },
            addDatePicker:function(context){
                var calendayIconUrl = EB_Common.Ajax.wrapperUrl("/statics/stylesheets/common/img/icn_calendar_16.png");
                context = context || this.$el;
                context.find("input[inputDate]").each(function(){
                    var j = $(this),dateFormat= j.attr("inputDate");
//                    timeFormat: "HH:mm:ss",
//                        dateFormat: "yy-mm-dd"
                    if(/\w+\s\w+/.test(dateFormat)){
                        j.datetimepicker({
                            showOn : "both",
                            buttonImage : EB_Common.Ajax.wrapperUrl("/statics/stylesheets/common/img/icn_calendar_16.png"),
                            buttonImageOnly : true,
                            showSecond: true,
                            dateFormat:"mm-dd-yy at",
                            stepHour: 1,
                            stepMinute: 1,
                            stepSecond: 1,
                            minDate: '-10y',
                            changeMonth : true,
                            changeYear : true,                            
                            buttonText:  i18n['button.calendar.tooltip'],
                            onSelect : function(dateStr,ui) {
                                ui.input.valid();
                                ui.input.trigger("change");
                            }
                        });
                        if(j.val()){
                            var date = new Date(j.val().replace(/-/g,"/").replace("at", " "));
                            j.datetimepicker("setDate",date);
                        }
                    }else{
                        j.attr("readonly","readonly").datepicker({
                            dateFormat: "mm-dd-yy",
                            minDate : "-10y",
                            showOn : "both",
                            buttonText:  i18n['button.calendar.tooltip'],
                            buttonImage : calendayIconUrl,
                            buttonImageOnly : true,
                            changeMonth : true,
                            changeYear : true,                           
                            onSelect : function(dateStr,ui) {
                                ui.input.valid();
                                ui.input.trigger("change");
                            }
                        });
                    }
                });
            },
            renderVariablesChange:function(){
                var formVariableItems = this.model.get("formVariableItems");
                this.options.variablesChangedCallBack && this.options.variablesChangedCallBack.call(this,formVariableItems);
            },
            updateSystemTime:function(){
                var view = this;
                var serverTime = null;
                //ensure to get servertime before executing following.
                EB_Common.Ajax.ajax({
                    url:EB_Common.Ajax.wrapperUrl("/incidents/incident/getServerTime"),
                    type: "get",
                    dataType: "json",
                    async:false,
                    success:function(data) {
                            serverTime=new Date(data);
                            //$('#manageCategoriesForm').valid();
                }});
                this.$("input[variableId]").each(function(){
                    var j = $(this),variableId = j.attr("variableId");
                    if(variableId=="10003"){
                        view.jDom.systemCurrentTimeDom = j;
                    }else if(variableId=="10004"){
                        view.jDom.systemDateDom = j;
                    }
                });
                if(view.jDom.systemDateDom || view.jDom.systemCurrentTimeDom){
                    var formVariableItems = this.model.get("formVariableItems");
                    var currentTime = null;                   
                    $.each(formVariableItems,function(i,item){
                        if(item.isSys && (item.variableId=="10003")){
                            currentTime = item;
                        }
                        if(item.isSys && (item.variableId=="10004")){
                            date = item;
                        }
                    });
                    setInterval(function(){  
                    	serverTime.setSeconds(serverTime.getSeconds()+1);
                        var dateTime =serverTime.date2str("MM-dd-yyyy hh:mm:ss"),date = dateTime.split(" ")[0],time = dateTime.split(" ")[1];
                        view.jDom.systemDateDom && view.jDom.systemDateDom.val(date);
                        view.jDom.systemCurrentTimeDom && view.jDom.systemCurrentTimeDom.val(time);
                        date && (date.val=[date]);
                        currentTime && (currentTime.val=[time]);
                        view.renderVariablesChange();
                    },1000);
                }

            },
            sortableVariable:function(){
                var app = this;
                this.$el.sortable({
                    axis: "y",
                    cursor:'move',
                    forcePlaceholderSize: true,
                    delay: 100,
                    opacity: 0.8,
                    scroll:false,
                    update:function( event, ui ){
                        app.updateVariableItemIndex();
                    }
                });
            },
            updateVariableItemIndex:function(){
                var formVariableItems = this.model.get("formVariableItems");
                this.$el.children().each(function(i){
                    var j = $(this).find(".index"),variableId = j.attr("variableId");
                    j.text(i+1);
                    $.each(formVariableItems,function(j,variable){
                        if((variable.variableId+"")==variableId){
                            variable.seq = i+1;
                        }
                    });
                });
                formVariableItems.sort(function(a,b){
                    return (a.seq > b.seq)?1:-1;
                });
                this.model.set("formVariableItems",formVariableItems);
            },
            events:function(){
                var events = {
                    "change input":"eventChangeVariableInput",
                    "change textarea":"eventChangeVariableInput",
                    "change select":"eventChangeVariableSelect"
                };
                return this.dealEvents(events,this.cid);
            },
            eventChangeVariableInput:function(e){
                var variables = $.extend(true,{},this.model.toJSON()).formVariableItems;
                var j = $(e.target),li = j.parent(),variableId = li.attr("variableId"), markeUpdate= j.attr("markeUpdate");
                $.each(variables,function(i,v){
                    if((v.variableId+"")==variableId){
                        v.val = [j.val()], oldValue = v.previousVal;
                        if (v.id != 10003&& markeUpdate == "0"&&v.val != oldValue) {
                        	v.prefixName = i18n['incident.updated.literal'];
                        } else {
                        	v.prefixName = "";
                        }
                    } else {
                    	v.prefixName != i18n['incident.updated.literal']&&(v.prefixName = "");
                    }
                });
                this.model.set("formVariableItems",variables);
            },
            eventChangeVariableSelect:function(e){
                var variables = $.extend(true,{},this.model.toJSON()).formVariableItems;
                var j = $(e.target),li = j.parent(),variableId = li.attr("variableId"), markeUpdate= j.attr("markeUpdate");
                $.each(variables,function(i,v){
                    if((v.variableId+"")==variableId){
                        var val = j.val(), oldValue = v.previousVal||[];
                        if(val&&val.join){
                            v.val = j.val();
                        }else{
                            v.val = [j.val()];
                        }
                        if (v.id != 10003&& markeUpdate == "0"&&v.val.join("") !== oldValue.join("")){
                        	v.prefixName = i18n['incident.updated.literal'];
                        } else {
                        	v.prefixName = "";
                        }
                    } else {
                    	v.prefixName != i18n['incident.updated.literal']&&(v.prefixName = "");
                    }
                });
                this.model.set("formVariableItems",variables);
            },
            getData:function(){
                var model = $.extend(true,{},this.model.toJSON());
                return model.formVariableItems;
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var View = EB_Common.Backbone.View.extend(this.VariableAppView);
            return new View({el:options.container,model:options.model,isView:options.isView,isEdit:options.isEdit,variablesChangedCallBack:options.variablesChangedCallBack});
        }
    };
    view.incidents.apps.PhaseTempateApp={
        PhaseTemplateModel:{
            defaults:function(){
                return {
                    load:false,
                    display:true,
                    phaseTemplate:null
                };
            },
            parse:function(phase){
                var data = {load:true} || {};
                phase.formTemplate =  phase.formTemplate || {};
                phase.formTemplate.formVariableItems = phase.formTemplate.formVariableItems || [];
                $.each(phase.formTemplate.formVariableItems,function(i,variable){
                    if(variable.variableItem){
                        if(variable.variableItem.varType=="Single"){
                            $.each(variable.variableItem.variableOptions||(variable.variableItem.variableOptions=[]),function(i,vo){
                                vo.selected = ($.inArray(vo.val,variable.val||[])>-1);
                            });
                        }else if(variable.variableItem.varType=="Multiple"){
                            $.each(variable.variableItem.variableOptions||(variable.variableItem.variableOptions=[]),function(i,vo){
                                vo.selected = ($.inArray(vo.val,variable.val||[])>-1);
                            });
                        }
                    }
                    if(variable.isRequired){
                        variable.validation = "{required:true}";
                    }
                });
                phase.appsData = {};
                //hand message
                phase.additionalData = phase.additionalData ||{};
                if(phase.additionalData.messageAdditionalData){
                    phase.additionalData.messageAdditionalData.bcTemplate = phase.broadcastTemplate;
                    phase.additionalData.messageAdditionalData.bcTemplate.message.preMessage = phase.formTemplate.preMessage;
                    phase.additionalData.messageAdditionalData.bcTemplate.message.postMessage = phase.formTemplate.postMessage;
                    phase.additionalData.messageAdditionalData.bcTemplate.message.formVariableItems = phase.formTemplate.formVariableItems;

                }
                phase.appsData.messageAppModelData = phase.additionalData.messageAdditionalData;

                phase.appsData.contactsAppModelData={
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
                        filterRules:[],
                        polygons:"",
                        polygonIsIncludes:"",
                        excludedContactIds:[]
                    }
                };
                if(phase.broadcastTemplate&&phase.broadcastTemplate.broadcastContacts){
                    var contacts = phase.broadcastTemplate.broadcastContacts;
                    phase.appsData.contactsAppModelData.contactsCount = (contacts.contactIds&&contacts.contactIds.length)||0;
                    phase.appsData.contactsAppModelData.groupsCount = (contacts.groupIds&&contacts.groupIds.length)||0;
                    phase.appsData.contactsAppModelData.filtersCount = (contacts.filterIds&&contacts.filterIds.length)||0;
                    phase.appsData.contactsAppModelData.selectedGroupIds = (contacts.groupIds||[]).join(",");
                }
                phase.additionalData = phase.additionalData ||{};
                if(phase.additionalData.contactsAdditionalData){
                    phase.appsData.contactsAppModelData.IndividualGroupFilterData={
                        contacts:phase.additionalData.contactsAdditionalData.contacts||[],
                        groups:phase.additionalData.contactsAdditionalData.groups||[],
                        filters:phase.additionalData.contactsAdditionalData.filters||[]
                    };
                    phase.appsData.contactsAppModelData.UniverseAppData = phase.additionalData.contactsAdditionalData.map || {};
                    phase.appsData.contactsAppModelData.shapesCount = (phase.appsData.contactsAppModelData.UniverseAppData.shapesCount)||0;
                    var filterRules = phase.appsData.contactsAppModelData.UniverseAppData.filterRules;
                    if(filterRules && filterRules.length){
                        filterRules = JSON.stringify(filterRules);
                    }else{
                        filterRules="";
                    }
                    phase.appsData.contactsAppModelData.UniverseAppData.filterRules=filterRules;
                }
                phase.appsData.settingAppModelData = phase.additionalData.settingAdditionalData;
                //hand setting data
                phase.additionalData = phase.additionalData ||{};
                if(phase.additionalData.settingAdditionalData){
                    phase.additionalData.settingAdditionalData.bcTemplate = phase.broadcastTemplate;
                }
                phase.appsData.settingAppModelData = phase.additionalData.settingAdditionalData;
                data.phaseTemplate = phase;
                return data;
            }
        },
        PhaseTemplateView:{
            subApps:{},
            tagName:"div",
            jDom:{},
            template:{},
            initialize:function(){
                $.templates({
                    incidentCreateAppPhaseTemplate: $("#incidentCreateAppPhaseTemplate").html(),
                    incidentCreateAppVariableValsDisplayTemplate: $("#incidentCreateAppVariableValsDisplayTemplate").html()
                });
                this.template.incidentCreateAppPhaseTemplate = $.render.incidentCreateAppPhaseTemplate;
                this.template.incidentCreateAppVariableValsDisplayTemplate = $.render.incidentCreateAppVariableValsDisplayTemplate;
                this.model.on("change:load",this.render,this);
                this.model.on("change:display",this.renderDisplay,this);
                this.model.on("change:_onlyText",this.dealMessageTypeChange, this);
                this.model.on("change:loadCompleted", this.loadComplete, this);
                this.model.on("change:_notificationType", this.dealChangeNotificationType, this);
                this.model.fetch();
            },
            render:function(){
                this.model.set("isClosePhase",this.options.additionalData.phaseId=="1003");
                this.$el.html(this.template.incidentCreateAppPhaseTemplate(this.getIdSuffixModelJSON()));
                var view = this;
                EB_Common.validation.validate(this.$("#step1Form"),{submitHandler:function(){view.next();}});
                EB_Common.validation.validate(this.$("#step2Form"),{submitHandler:function(){
                    if(view.subApps.messageApp.onlyHasText() && view.subApps.settingApp.hasVoicePath()){
                        EB_Common.dialog.confirm(i18n['notification.new.checkvoice'],'',function(){
                        	view.send();
                        });
                    }else if(view.subApps.messageApp.onlyHasVoice() && view.subApps.settingApp.hasTextPath()){
                        EB_Common.dialog.alert(i18n['notification.text.textPath.voiceOnly.waring']);
                        return false;
                    }else{
                        view.send();
                    }

                }});
                this.jDom.step1Form = this.$("#step1Form");
                this.jDom.step2Form = this.$("#step2Form");
                this.jDom.variableContainer = this.$("#variableContainver");
                this.jDom.variableValueListContainer = this.$("#variableValueListContainer");
                this.jDom.messageContainer = this.$("#bc_message_li");
                this.jDom.contactSelectContainer = this.$("#bc_contacts_li");
                this.jDom.settingContainer = this.$("#bc_settings_li");

                var phaseTemplate = this.model.toJSON().phaseTemplate;
                var isEdit=((phaseTemplate.messageFlag & 2)== 2);
                if(!isEdit){
                    this.$("#subject").prop("disabled",true);
                    this.$("#preMessage").prop("disabled",true);
                    this.$("#postMessage").prop("disabled",true);
                }
                this.loadSuccess();
                this.$el.siblings().hide();
                this.model.set("loadCompleted",true);
                return this;
            },
            next:function(){
            	var me = this;
            	var variables = $.extend(true,{},this.subApps.variableApp.model.toJSON()).formVariableItems,isUpdated = false;
                $.each(variables,function(i,v){
                	if (!v.prefixName){
                		isUpdated = true;
                		return false;
                	}
                });
                me.parseToken();
                if (!isUpdated && variables.length > 0) {
                	EB_Common.dialog.confirm(i18n['incident.next.warnmessage'],'', function() {
                		me.jDom.step1Form.hide().next().show();
                		me.subApps.messageApp._countTextMessage(true);
                	});
                	return;
                }
                me.jDom.step1Form.hide().next().show();
                me.subApps.messageApp._countTextMessage(true);
            },
            parseToken:function(){
            	var variables = this.subApps.variableApp.model.get("formVariableItems"),messageApp = this.subApps.messageApp.model,title = messageApp&&messageApp.get("title"),preMessage = messageApp&&messageApp.get("preMessage"),postMessage = messageApp&&messageApp.get("postMessage");
            	if (title&&title.match(/{.*?}/g)) {
            		messageApp.set("previousTitle", title);
            		$.each(variables, function(i,v){
            			title = title.replceIgnoreRegex("{" + v.variableName + "}", v.val||"");
            		});
            		messageApp.set("title", title);
            	}
            	
            	if (preMessage&&preMessage.match(/{.*?}/g)) {
            		messageApp.set("previousPreMessage", preMessage);
            		$.each(variables, function(i,v){
            			preMessage = preMessage.replceIgnoreRegex("{" + v.variableName + "}", v.val||"");
            		});
            		messageApp.set("preMessage", preMessage);
            	}
            	
            	if (postMessage&&postMessage.match(/{.*?}/g)) {
            		messageApp.set("previousPostMessage", postMessage);
            		$.each(variables, function(i,v){
            			postMessage = postMessage.replceIgnoreRegex("{" + v.variableName + "}", v.val||"");
            		});
            		messageApp.set("postMessage", postMessage);
            	}
            },
            fetchBackToken:function(){
            	var messageApp = this.subApps.messageApp.model,previousTitle = messageApp&&messageApp.get("previousTitle"),previousPreMessage = messageApp&&messageApp.get("previousPreMessage"),previousPostMessage = messageApp&&messageApp.get("previousPostMessage");
            	if (previousTitle&&previousTitle.match(/{.*?}/g)) {
            		messageApp.set("title", previousTitle);
            	}
            	
            	if (previousPreMessage&&previousPreMessage.match(/{.*?}/g)) {
            		messageApp.set("preMessage", previousPreMessage);
            	}
            	
            	if (previousPostMessage&&previousPostMessage.match(/{.*?}/g)) {
            		messageApp.set("postMessage", previousPostMessage);
            	}
            },
            send:function(){
                if(!this.submitStatus){
                    this.submitStatus = true;
                    this.options.sendCallBack && this.options.sendCallBack.call(this,this.getJsonData());
                }
            },
            variablesChangedCallBack:function(variables){
                if(this.subApps.messageApp)
                    this.subApps.messageApp.$("#variableValueListContainer").html(this.template.incidentCreateAppVariableValsDisplayTemplate(variables));
            },
            getVaribleLength:function(){
            	var varibles = this.subApps.variableApp.getData()||[], text = "";
            	$.each(varibles, function(i,v){
            		text += v.variableName + ":" + (v.val||"") + ",";
            	});
            	text = text.substring(0, text.length -1);
            	return text.length;
            },
            loadSuccess:function(){
                var phase = this.model.toJSON().phaseTemplate;
                var phaseView = this;
                var options = {
                    model:new Backbone.Model(phase.formTemplate),
                    hideUseMessageLink:true,
                    isView: ((phase.messageFlag & 1)== 1),
                    isEdit: ((phase.messageFlag & 2)== 2),
                    container:phaseView.jDom.variableContainer,
                    variablesChangedCallBack:function(variables){
                        phaseView.variablesChangedCallBack(variables);
                    }
                } || {};
                this.subApps.variableApp = EB_View.incidents.apps.VariableApp.getInstance(options);
                if (phase.formTemplate.formVariableItems&&phase.formTemplate.formVariableItems.length == 0) {
                	this.$("#step1Form").children("p").html(i18n['incident.new.step1.emptyVaribleMessage']);
                }
                
                var model = EB_View.notification.app.MessageApp.MessageModel.parse(phase.appsData.messageAppModelData);
                var options={
                    isView: ((phase.messageFlag & 1)== 1),
                    isEdit: ((phase.messageFlag & 2)== 2),
                    sessionId:this.options.sessionId,
                    model:new Backbone.Model(model),
                    container:phaseView.jDom.messageContainer,
                    formApp:this,
                    adaptDom:function(){
                        this.model.set("formVariableItems",phaseView.subApps.variableApp.model.get("formVariableItems"));
                        this.model.set({"includeMessageTemplae":false});
                        this.model.set({"includeSaveAsMessageTemplate":false});
                        this.model.set({"includePreMessage":true});
                        this.model.set({"includePostMessage":true});
                        this.model.set({"includeTextMessage":false});
                        this.model.set({"includeVariable":true});
                    },
                    notificationTypeChangeCallBack:function(type){
                        phaseView.model.set("_notificationType",type);
                    },
                    messageTypeChangeCallback:function(type){
                        phaseView.model.set("_onlyText",type=="None"?true:false);
                    }
                };
                this.subApps.messageApp = EB_View.notification.app.MessageApp.getInstance(options);

                options={
                    model:new Backbone.Model(phase.appsData.contactsAppModelData),
                    container:phaseView.jDom.contactSelectContainer,
                    isView: ((phase.contactsFlag & 1)== 1),
                    isEdit: ((phase.contactsFlag & 2)== 2),
                    loadSuccess:function(){
                        //create the instance of contact app
                        var _contactApp = this;
                        var options2={
                            model:new Backbone.Model(phase.appsData.contactsAppModelData.IndividualGroupFilterData),
                            selectedGroupIds:_contactApp.model.get("selectedGroupIds"),
                            okCallBack:function(){
                                _contactApp.model.set("contactsCount",this.multiselectIndividual.children().length);
                                _contactApp.model.set("groupsCount",this.multiselectGroup.children().length);
                                _contactApp.model.set("filtersCount",this.multiselectFilter.children().length);
                            }
                        } || {};
                        var individualGroupFilter = EB_View.notification.app.ContactApp.SubUnits.IndividualGroupFilter.getInstance(options2);
                        this.subApps.individualGroupFilter = individualGroupFilter;

                        options2 = {
                            url:EB_Common.Ajax.wrapperUrl("/universe/homeAsJson"),
                            originalGisData:phase.appsData.contactsAppModelData.UniverseAppData,
                            isDialog:true,
                            selectButtonCallBack:function(){
                                _contactApp.model.set("shapesCount",this.model.get("tempStorage").shapesCount||0);
                            }
                        } || {};
                        this.subApps.universeApp = EB_View.universe.UniverseApp.getInstance(options2);
                    }
                }||{};
                this.subApps.contactApp = EB_View.notification.app.ContactApp.getInstance(options);


                phase.appsData.settingAppModelData.senderInfoPermission = (phase.settingsFlag & 2)== 2; //this permission value depand on phasetemplate in Matrix
                var model = EB_View.notification.app.SettingApp.settingAppModel.parse(phase.appsData.settingAppModelData);
                model.senderCallerIdSetting.senderCallers = model.senderCallerIdSetting.savedSenderCallers;
                options={
                    model:new Backbone.Model(model),
                    container:phaseView.jDom.settingContainer,
                    isView: ((phase.settingsFlag & 1)== 1),
                    isEdit: ((phase.settingsFlag & 2)== 2)
                };
                this.subApps.settingApp = EB_View.notification.app.SettingApp.getInstance(options);
                
                setInterval(function(){
                	var settingApp = phaseView.subApps.settingApp.getData();
                	var email = settingApp.senderEmailSetting.senderEmail;
                	var senderCallerIdSetting = settingApp.senderCallerIdSetting;
                	phaseView.$("#senderEmail").html(email);
                	var html = "";
                	$.each(senderCallerIdSetting.senderCallers,function(i,v){
                		html +="<div><span>" + v.countryName + "</span>" + v.callerId + "</div>";
                	});
                	html&&phaseView.$("#sendercallid").html(html);
                }, 500);
            },
            renderDisplay:function(){
                if(this.model.get("display"))
                    this.$el.show();
                else
                    this.$el.hide();
            },
            events:function(){
                var events = {
                    "click #next":"eventClickNext",
                    "click #back1":"eventClickBack",
                    "click #back2":"eventClickBack",
                    "click #send":"eventClickSend",
                    "click #cancel":"eventClickCancel"
                    //"click #incidentName":"eventClickNext",
                };
                return this.dealEvents(events,this.cid);
            },
            eventClickNext:function(e){
                this.jDom.step1Form.submit();
                $('#incident_step1').css("display", "none");
                $('#incident_step2').css("display", "block");
                $('#spnStepdesc').text(i18n['incident.new.step2']);
            },
            eventClickBack:function(){
            	this.fetchBackToken();
                this.jDom.step2Form.hide().prev().show();
                $('#incident_step2').css("display", "none");
                $('#incident_step1').css("display", "block");
                $('#spnStepdesc').text(i18n['incident.new.step1']);
            },
            eventClickSend:function(){
                this.jDom.step2Form.submit();
            },
            eventClickCancel:function(){
                window.history.go(-1);
            },
            loadComplete:function(model){
                if(model.get("loadCompleted")){
                    this.dealMessageTypeChange(model);
                    this.dealChangeNotificationType(model);
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
            getJsonData:function(){
                var model = this.model.toJSON();
                var phaseTemplateData = $.extend(true,{},model).phaseTemplate;
                delete phaseTemplateData.appsData;
                delete phaseTemplateData.additionalData;
                phaseTemplateData.formTemplate.formVariableItems = this.subApps.variableApp.getData();
                $.each(phaseTemplateData.formTemplate.formVariableItems,function(i,v){
                    delete v.validation;
                    delete v.variableLiId;
                    if(v.variableItem){
                        delete v.variableItem.validation;
                        $.each(v.variableItem.variableOptions||(v.variableItem.variableOptions=[]),function(i,vo){
                            delete vo.selected;
                        });
                    }
                });
                var incident = {
                    id:model.incidentId,
                    name : $("#incidentName").val()||$("#incidentTemplateName").val(),
                    incidentPhases:[],
                    isCloseIncident:this.$("#closeIncident").prop("checked")
                };
                var incidentPhase = {
                    name:phaseTemplateData.name,
                    phaseDefinition:null,
                    notificationId:-1,
                    phaseTemplate:phaseTemplateData
                } || {};
                var additionalData = this.options.additionalData;
                $.each(phaseTemplateData.phaseDefinitions,function(i,d){
                    if(d.id==additionalData.phaseId){
                        incidentPhase.phaseDefinition = d;
                    }
                });
                this.subApps.messageApp.getJsonData(incidentPhase.phaseTemplate.broadcastTemplate);
                
                if (!incidentPhase.phaseTemplate.broadcastTemplate.message.preMessage&&!incidentPhase.phaseTemplate.broadcastTemplate.message.postMessage&&phaseTemplateData.formTemplate.formVariableItems.length == 0 &&!incidentPhase.phaseTemplate.broadcastTemplate.message.voiceSource) {
                	EB_Common.dialog.alert(i18n["incident.emptyBody.warninfo"],null);
                	this.submitStatus = false;
                	return false;
                }

                phaseTemplateData.formTemplate.subject = incidentPhase.phaseTemplate.broadcastTemplate.message.title;
                phaseTemplateData.formTemplate.preMessage = incidentPhase.phaseTemplate.broadcastTemplate.message.preMessage;
                phaseTemplateData.formTemplate.postMessage = incidentPhase.phaseTemplate.broadcastTemplate.message.postMessage;
                delete incidentPhase.phaseTemplate.broadcastTemplate.message.preMessage;
                delete incidentPhase.phaseTemplate.broadcastTemplate.message.postMessage;


                this.subApps.contactApp.getJsonData(incidentPhase.phaseTemplate.broadcastTemplate);
                this.subApps.settingApp.getJsonData(incidentPhase.phaseTemplate.broadcastTemplate);
                incident.incidentPhases.push(incidentPhase);
                EB_Common.logger.log(incident);
                return incident;
            }

        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.PhaseTemplateModel);
            var phaseTemplateModel = null;
            if(options.url){
                phaseTemplateModel = new Model(null,{url:options.url});
            }else{
                phaseTemplateModel = options.model;
            }
            var View = EB_Common.Backbone.View.extend(this.PhaseTemplateView);
            var view = new View({sessionId:options.sessionId,el:options.container,model:phaseTemplateModel,additionalData:options.additionalData,loadSuccess:options.loadSuccess,sendCallBack:options.sendCallBack});
            return view;
        }
    };
    view.incidents.apps.incidentCreateApp={
        IncidentCreateModel:{
            defaults:function(){
                return {
                    load:false,
                    categorys:[]
                };
            },
            initialize:function () {
                if(arguments && arguments.length>1 && arguments[1].url){
                    this.urlRoot=arguments[1].url;
                }
            },
            parse:function(response){
                var data = {load:true};
                return $.extend(data,response);
            }
        },
        IncidentCreateView:{
            template:{},
            jDom:{},
            subApps:[],
            initialize:function(){
                $.templates({
                    incidentCreateAppCategorysTemplate: $("#incidentCreateAppCategorysTemplate").html(),
                    incidentInfoTemplate:$("#incidentInfoTemplate").html()
                });
                this.template.incidentCreateAppCategorysTemplate = $.render.incidentCreateAppCategorysTemplate;
                this.template.incidentInfoTemplate = $.render.incidentInfoTemplate;
                this.model.on("change:load",this.render,this);
                this.model.on("change:categorys",this.renderCategorys,this);
                if(this.model.urlRoot){
                    this.model.fetch();
                }
                this.collection = new (Backbone.Collection.extend({model:this.options.PhaseTemplateModel}));
                this.collection.on("add",this.collectionAddOne,this);
            },
            render:function(){
            	$("#incident_infobox").html(this.template.incidentInfoTemplate({}));
//            	this.$("#categorysContainer").html($("<div />").html(i18n['incident.template.emptyInfo']).addClass("incident_emptypanle").css("color","#777777"));
            	if (this.model.get("categorys").length == 0){
            		this.$("#templateEmptyInfo p").html(i18n['incident.template.emptyInfo']);
            		this.$("#templateEmptyInfo").parent().css("margin-left", "0px");
            	}
            		
            },
            renderCategorys:function(){
                var categorys = this.model.get("categorys");
                this.$("#categorysContainer").html(this.template.incidentCreateAppCategorysTemplate(categorys));
                if(!this.options.incidentTemplateId){
//                    this.$("#categorysContainer>li:first>div").click().next().find("li:first>div").click();
                }else{
                	var subLi = this.$("#categorysContainer li.subLi[id='"+this.options.incidentTemplateId+"']>div");
                	if (subLi.length) {
                		subLi.click().parent().parent().parent().prev().click();
                	} else {
                		this.$("#templateEmptyInfo p").html("");
                		this.$("#templateEmptyInfo p").html(i18n['incident.template.setdraft']);
                		
                	}
                }
            },
            collectionAddOne:function(model){
                var data = $.extend(true,{},model.toJSON()),incidentCreateApp = this;
                var params ="templateId="+data.incidentTemplateId+"&phaseId="+data.phaseId+"&incidentId="+data.incidentId;
                model.urlRoot = EB_Common.Ajax.wrapperUrl("/incidents/incident/getPhaseTemplate?"+params);
                var options = {
                    model:model,
                    additionalData:data,
                    sessionId:this.options.sessionId,
                    sendCallBack:function(incidentJsonData){
                        incidentCreateApp.options.sendCallBack && incidentCreateApp.options.sendCallBack.call(incidentCreateApp,incidentJsonData);
                    }
                };
                var view = EB_View.incidents.apps.PhaseTempateApp.getInstance(options);
                this.subApps.push(view);
                this.$("#templateEmptyInfo").hide();
                this.$("#phaseTemplateList").append(view.$el);
            },
            events:{
                "click .b-node-level1":"toggleSubMenu",
                "click .b-node-level2":"triggerSubLi",
                "click #editIncident":"eventClickeditIncident",
                "click #saveIncident":"eventClicksaveIncident",
                "click #cancelIncident":"eventClickcancelIncident"
            },
            eventClickeditIncident:function(e){
            	e.preventDefault();
				var el = $(e.target), textEl = el.siblings('div'), cancelEl = el.siblings('a[title="Cancel"]'), saveEl = el.siblings('a[title="Save"]'), inputEl = el.siblings('input[name="incidentname"]');

				el.hide();
				inputEl.show().val(textEl.text());
				cancelEl.show();
				saveEl.show();
				textEl.hide();
            },
            eventClicksaveIncident:function(e){
            	e.preventDefault();
				var el = $(e.target), textEl = el.siblings('div'), editEl = el.siblings('a[title="Edit"]'), cancelEl = el.siblings('a[title="Cancel"]'), inputEl = el.siblings('input[name="incidentname"]');

				var incidentName = $.trim(inputEl.val());
				if (incidentName == "") incidentName = "Incident Name";
				textEl.html($.jgrid.htmlEncode(incidentName));
				textEl.show();
				el.hide();
				inputEl.hide();
				inputEl.val(incidentName);
				editEl.show();
				cancelEl.hide();
            },
            eventClickcancelIncident:function(e){
            	e.preventDefault();
				var el = $(e.target), textEl = el.siblings('div'), editEl = el.siblings('a[title="Edit"]'), saveEl = el.siblings('a[title="Save"]'), inputEl = el.siblings('input[name="incidentname"]');
				el.hide();
				inputEl.hide();
				editEl.show();
				saveEl.hide();
				textEl.show();
            },
            toggleSubMenu:function(e){
                var j = $(e.currentTarget);
                j.toggleClass("b-node-extended").next().toggle();
                if(j.hasClass("b-node-extended")){
                    j.parent().siblings().children("div.b-node-extended").click();
                }
            },
            triggerSubLi:function(e){
                this.$("li.b-node-current").removeClass("b-node-current");
                var j = $(e.currentTarget).parent().addClass("b-node-current"),incidentTemplateId = j.attr("incidentTemplateId");
                var models = this.collection.where({incidentTemplateId:incidentTemplateId});
                if(models.length){
                    this.collection.each(function(model,i){
                        if (model.get("incidentTemplateId") == incidentTemplateId) {
                        	model.set("display",false);
                        	model.set("display",true);
                        } else {
                        	model.set("display",false);
                        }
                    });
                }else{
                    var model = {
                        incidentTemplateId:incidentTemplateId,
                        phaseId:this.options.phaseId,
                        incidentId:this.options.incidentId
                    };
                    this.collection.add([model]);
                }
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.IncidentCreateModel);
            var incidentCreateModel = null;
            if(options.url){
                incidentCreateModel = new Model(null,{url:options.url});
            }else{
                incidentCreateModel = options.model;
            }
            var View = Backbone.View.extend(this.IncidentCreateView);
            var view = new View({
                sessionId:options.sessionId,
                el:options.container,
                incidentId:options.incidentId,
                incidentTemplateId:options.incidentTemplateId,
                phaseId:options.phaseId,
                model:incidentCreateModel,
                PhaseTemplateModel:Backbone.Model.extend(EB_View.incidents.apps.PhaseTempateApp.PhaseTemplateModel),
                sendCallBack:options.sendCallBack
            });
            return view;
        }
    };
})(EB_View);
