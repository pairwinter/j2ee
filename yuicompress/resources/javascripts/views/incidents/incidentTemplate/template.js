/**
 * incident create
 *
 * @author Damon liu
 */
(function(view) {
    view.incidents = view.incidents || {};
    view.incidents.app = {};
    view.incidents.app.TemplateApp={
        subApp:{},
        TemplateAppModel:{
            defaults:function(){
                return {
                    load:false
                };
            },
            initialize:function () {
                if(arguments && arguments.length>1&&arguments[1].url)
                    this.urlRoot=arguments[1].url;
            },
            parse:function(response){
                EB_Common.logger.log("templateAppData");
                EB_Common.logger.log(response);
                if(response){
                    response.phaseTemplates = response.phaseTemplates ||[];
                    $.each(response.phaseTemplates,function(i,phase){
                        phase.id=phase.id || i;
                        //hand phaseList
                        phase.isHideNew = i!=0;
                        phase.phaseTemplateId = i;
                        phase.name = phase.name||("default"+i);
                        $.each(phase.phaseDefinitions||[],function(i,definition){
                            if(definition.id==1001){
                                phase.newChecked = true;
                            }else if(definition.id==1002){
                                phase.updateChecked = true;
                            }else if(definition.id==1003){
                                phase.closeChecked = true;
                            }
                        });
                    });
                }
                return response;
            }
        },
        TemplateAppView:{
            jDom:{},
            template:{},
            subApps:{
                mangePhasesApp:null
            },
            initialize:function(){
                this.model.on("change",this.render,this);
                if(this.model.urlRoot){
                   this.model.fetch();
                }else{
                    this.render();
                }
                var me=this;
                setInterval(function(){
                	me.checkValidation();
                },  1000);
            },
            render:function(){
                var app = this;
                this.jDom.form = this.$("#incidentForm");
                this.jDom.incidentTemplateName = this.$("#incidentTemplateName").val(this.model.get("name"));
                this.$("#incidentStatusContainer input").each(function(){
                    if(this.value == app.model.get("incidentStatus")){
                        this.checked = true;
                    }
                });
                this.jDom.selIncidentCategory = this.$("#selIncidentCategory");
                this.jDom.selIncidentCategory.val(this.model.get("incidentCategoryId")).combobox({
                    comboboxWidth : true,
                    isDuleSwcript:true
                });
                var incidentCategoryId = this.model.get("incidentCategoryId");
                this.jDom.selIncidentCategory.children().each(function(){
                	if(parseInt(incidentCategoryId)>0 && (this.value == incidentCategoryId)){
                		app.$("#incidentCategoryName").val($(this).text());
                	}
                });
                EB_Common.validation.validate(this.$("#incidentForm"),{submitHandler:function(){
                    var templates = app.subApps.mangePhasesApp.templateApps;
                    $.each(templates,function(i,templateApp){
                        templateApp.validStatus = false;
                    });
                    $.each(templates,function(i,templateApp){
                        if(templateApp.subApps.settingApp.model.get("contactsFlag")&2==2){
                            templateApp.subApps.contactApp.model.set("ignore",true);
                        }
                        templateApp.submitHandler=function(){
                            var allValid = true;
                            $.each(templates,function(j,t){
                                if(!t.validStatus){allValid = false;}
                            });
                            if(allValid){app.save();}
                        };
                        templateApp.$el.submit();
                    });
                }});
                this.jDom.incidentTemplateName.on("blur", function(){
                	app.addDefaultSubject();
                }).rules("add",{
                    remote:{
                        url:EB_Common.Ajax.wrapperUrl('/incidents/template/checkTemplateName'),
                        data:{
                            name:function(){return app.jDom.incidentTemplateName.val();},
                            id:function(){return app.jDom.incidentTemplateName.attr("incidentTemplateId")||-1}
                        }

                    },
                    messages:{
                        remote:"The Incident Template name has exist!"
                    }
                });
                this.options.loadSuccess && this.options.loadSuccess.call(this);
                return this;
            },
            save:function(){
                var phaseListData = this.subApps.mangePhasesApp.subApps.phasesListApp.getJsonData(),me = this;
                var templates = this.subApps.mangePhasesApp.templateApps;
                var incidentTemplate = {
                    id : this.jDom.incidentTemplateName.attr("incidentTemplateId")||-1,
                    name:this.$("#incidentTemplateName").val(),
                    incidentStatus:this.$("#incidentStatusContainer input:checked").val(),
                    //Commented by 
                    //incidentCategory:{name:this.$("#incidentCategoryName").val()},
                    incidentCategory:{
                        name:$.trim(this.$("#incidentCategoryName").val())
                    },
                    incidentCategoryId:this.$("#selIncidentCategory").val()||"-1",                  
                    phaseTemplates : []
                };
                if(incidentTemplate.incidentCategoryId!="-1"){
                    var valid = false;
                    this.$("#selIncidentCategory>option").each(function(){
                        if(this.value==incidentTemplate.incidentCategoryId){
                            var optionText = $.trim($(this).text());
                            if(incidentTemplate.incidentCategory.name==optionText){
                                valid=true;
                            }
                            return false;
                        }
                    });
                    if(!valid){
                        incidentTemplate.incidentCategoryId="-1";
                    }
                }
                var warnInfos = [],tokensMessage = [];
                $.each(templates,function(i,templateApp){
                    var phaseTemplateObj ={
                        formTemplate:{},
                        broadcastTemplate:{}
                    };
                    var phaseTemplate = templateApp.getJsonData(phaseTemplateObj);
                    var warnInfo = {};
                    phaseTemplate.formTemplate.subject = $.trim(phaseTemplate.broadcastTemplate.message.title&&phaseTemplate.broadcastTemplate.message.title);
                    phaseTemplate.formTemplate.postMessage = $.trim(phaseTemplate.broadcastTemplate.message.postMessage&&phaseTemplate.broadcastTemplate.message.postMessage);
                    phaseTemplate.formTemplate.preMessage = $.trim(phaseTemplate.broadcastTemplate.message.preMessage&&phaseTemplate.broadcastTemplate.message.preMessage);
                    $.each(phaseListData,function(i,phase){
                        if(phaseTemplate.phaseTemplateId == phase.phaseTemplateId ){
                            phaseTemplate.name = phase.name;
                            phaseTemplate.name = phase.name;
                            var phaseDefinitions = [];
                            phase.newChecked && phaseDefinitions.push({id:1001,name:i18n["manage.phase.new"]});
                            phase.updateChecked && phaseDefinitions.push({id:1002,name:i18n["manage.phase.update"]});
                            phase.closeChecked && phaseDefinitions.push({id:1003,name:i18n["manage.phase.close"]});
                            if(phase.newChecked || phase.updateChecked || phase.closeChecked){
                                phaseTemplate.phaseDefinitions =  phaseDefinitions;
                            }
                            delete phaseTemplate.phaseTemplateId;
                        }
                    });
                    
                    var msg = [],tokens=[];
                    if((phaseTemplate.messageFlag&2)!=2) {
	                    if (phaseTemplate.formTemplate.formVariableItems.length == 0 &&!phaseTemplate.broadcastTemplate.message.postMessage && !phaseTemplate.broadcastTemplate.message.preMessage&&!phaseTemplate.broadcastTemplate.message.voiceSource){
	                    	warnInfo.phaseName = phaseTemplate.name;
	                    	msg.push(" body, voice file ");
	                    } else if (phaseTemplate.formTemplate.formVariableItems.length == 0 &&!phaseTemplate.broadcastTemplate.message.postMessage && !phaseTemplate.broadcastTemplate.message.preMessage&&!!phaseTemplate.broadcastTemplate.message.voiceSource){
	                    	if (phaseTemplate.broadcastTemplate.broadcastSettings.deliverPathsType != "PHONE") {
	                    		warnInfo.phaseName = phaseTemplate.name;
	                    		msg.push(" have selected text delivery methods. Please enter a text message or de-select text delivery methods.");
	                    		warnInfo.code = "1";
	                    	}
	                    }
	                    
                    }
                    
                    // deal with the invalid tokens
                    tokens = tokens.concat(phaseTemplate.broadcastTemplate.message.title&&phaseTemplate.broadcastTemplate.message.title.match(/{.*?}/g) || []);
                    tokens = tokens.concat(phaseTemplate.broadcastTemplate.message.postMessage&&phaseTemplate.broadcastTemplate.message.postMessage.match(/{.*?}/g)||[]);
                    tokens = tokens.concat(phaseTemplate.broadcastTemplate.message.preMessage&&phaseTemplate.broadcastTemplate.message.preMessage.match(/{.*?}/g)||[]);
                	var variableNames = [], allVariables = (phaseTemplate.formTemplate.formVariableItems||[]).concat(phaseTemplate.formTemplate.sysVariables||[]);
                	if (tokens.length) {
                		$.each(allVariables,function(i,item){
                			variableNames.push("{" + item.variableName + "}");
                		});
                		
                		$.each(tokens, function(i,v){
                    		if ($.inArray(v,variableNames) < 0) {
                    			tokensMessage.push(phaseTemplate.name);
                    			return false;
                    		}
                    	});
                	}
                    
	                if (!phaseTemplate.broadcastTemplate.broadcastSettings.senderCallerInfos  || phaseTemplate.broadcastTemplate.broadcastSettings.senderCallerInfos.length == 0) {
	                		warnInfo.phaseName = phaseTemplate.name;
	                    	msg.push(" Sender Caller ID ");
	                }
                    
                    if (msg.length > 0) {
                    	warnInfo.msg = msg;
                    	warnInfos.push(warnInfo);
                    }
                    delete phaseTemplate.broadcastTemplate.message.preMessage;
                    delete phaseTemplate.broadcastTemplate.message.postMessage;
                    delete phaseTemplate.formTemplate.sysVariables;
                    incidentTemplate.phaseTemplates.push(phaseTemplate);
                });
                if (tokensMessage.length&&!me.ignoreInvalidToken) {
                	EB_Common.dialog.confirm(tokensMessage.join(", ")+ i18n['incidenttemplate.invalidTokenInfo'],null,function(){
                		me.saveOption(warnInfos, incidentTemplate);
                		me.ignoreInvalidToken = true;
                    });
                } else {
                	me.saveOption(warnInfos, incidentTemplate);
                }
                
            },
            saveOption:function(warnInfos, incidentTemplate){
            	if (warnInfos.length == 0){
                	this.options.saveOrUpdate.call(this,JSON.stringify(incidentTemplate),this.copyEvent);
                } else {
                	var info = "";
                	$.each(warnInfos,function(i,v){
                		if (v.code == "1") {
                			info += v.phaseName + v.msg+ "<br />";
                		} else {
                			info += v.phaseName + "'s " + (v.msg&&v.msg.join(" and ")||"") + " are all empty, please fill the information.<br />";
                		}
                	});
                	EB_Common.dialog.alert(info,null);
                }
            },
            
            events:{
                "click #formSave":"eventClickFormSave",
                "click #fromSaveCopy":"eventClickFormSaveCopy",
                "click #cancel":"eventClickCancel"
            },
            eventClickFormSave:function(){
            	var me = this;
            	me.copyEvent = false;
            	//clear message label
            	$("#lblMessage").text("");
                me.$("#incidentForm").submit();
            },
            checkValidation:function(){//popup the error icon from validation                
            	var phaseForms = $('#template_form_tabs form');
            	var me = this;
            	//check whether there are error in phase form
            	for(var i=0;i<phaseForms.length;i++) {
            		var frm = phaseForms[i];
            		var errObjs = $(frm).find('input.error');
            		if(errObjs.length>0) {
            			me.popupErrorByForm(frm, errObjs,i);
            		}else { //no validation error found
            			me.hideErrorByForm(frm,i);
            		}
            	}
            },
            popupErrorByForm:function(frm, errObjs,frmIdx) {
            	//LEFT Nav bar     
            	var navFlag=0;
            	for(var i=0;i<errObjs.length;i++) {
            		var closest = $(errObjs[i]).closest('div[templateContainer]');
            		var name = closest.attr('name');
            		var navObj = null;            		
            		switch(name) {
            		case "formNotification":
            			if(this.subApps.mangePhasesApp.templateApps[frmIdx].subApps.permissionApp.model.get("me")&&$(errObjs[i]).attr("name")=="message.title") {
            				$(errObjs[i]).removeClass('error').next('label.error').remove();
            				return;
            			} else {
	            			var msgTab = $(frm).find('li[name="outgoing"]').find("label[wf='messageTab']")[0];
	            			if(msgTab && $(msgTab).css("display")!="") {
	                			$(msgTab).css("display","");
	                		}
	            			navObj = $(frm).find("a.nav_notifications").find("label[wf='message']")[0];
	            			if((navFlag&1)!=1)
	            				navFlag+=1;
            			}
            			//message = "Please configure required items in Form & Message before saving this template.";
            			break;
            		case "contacts":   
            			if(this.subApps.mangePhasesApp.templateApps[frmIdx].subApps.permissionApp.model.get("ce")) {
            				$(errObjs[i]).removeClass('error').next('label.error').remove();
            				return;
            			} else {
            				navObj = $(frm).find("a.nav_contacts").find("label[wf='contacts']")[0];
            				if((navFlag&2)!=2)
	            				navFlag+=2;
            			}
            			//message = "You have set Permissions to edit contacts to OFF. Please pre-define at least one contact before saving this template, or give operators permission to edit Contacts.";
            			break;
            		case "settingPermissions":
            			if(this.subApps.mangePhasesApp.templateApps[frmIdx].subApps.permissionApp.model.get("se")) {
            				$(errObjs[i]).removeClass('error').next('label.error').remove();
            				return;
            			} else {
            				navObj = $(frm).find("a.nav_settings").find("label[wf='settingPermissions']")[0];
            				if((navFlag&4)!=4)
	            				navFlag+=4;
            			}
            			//message = "You have set Permissions to edit settings to OFF. Please configure settings before saving this template, or give operators permission to edit Settings.";
            			break;
            		}
            		if(navObj && $(navObj).css("display")!="") {
            			$(navObj).css("display","");
            		}
            	}
            	//Phase tab
            	var tabs = $('#template_tabs_span a[phasetemplateid]');
            	if(tabs.length>0) {
            		var curTab = tabs[frmIdx];
            		var errObj = $(curTab).find('label[wf="templatePhase"]')[0];
            		if($(errObj).css("display")!="")
            			$(errObj).css("display","");
            	}
            	//hide nav error if there is no error for componenet
            	var navObj;
            	if((navFlag&1)!=1) {
            		var msgTab = $(frm).find('li[name="outgoing"]').find("label[wf='messageTab']")[0];
        			if(msgTab && $(msgTab).css("display")!="none") {
            			$(msgTab).css("display","none");
            		}
                	navObj = $(frm).find("a.nav_notifications").find("label[wf='message']")[0];
                	if(navObj && $(navObj).css("display")!="none") {
            			$(navObj).css("display","none");
            		}
            	}
            	if((navFlag&2)!=2) {
            		navObj = $(frm).find("a.nav_contacts").find("label[wf='contacts']")[0];
                	if(navObj && $(navObj).css("display")!="none") {
            			$(navObj).css("display","none");
            		}
            	}
            	if((navFlag&4)!=4) {
            		navObj = $(frm).find("a.nav_settings").find("label[wf='settingPermissions']")[0];
                	if(navObj && $(navObj).css("display")!="none") {
            			$(navObj).css("display","none");
            		}
            	}
            },
            hideErrorByForm:function(frm, frmIdx){
            	var msgTab = $(frm).find('li[name="outgoing"]').find("label[wf='messageTab']")[0];
    			if(msgTab && $(msgTab).css("display")!="none") {
        			$(msgTab).css("display","none");
        		}
            	var navObj = $(frm).find("a.nav_notifications").find("label[wf='message']")[0];
            	if(navObj && $(navObj).css("display")!="none") {
        			$(navObj).css("display","none");
        		}
            	navObj = $(frm).find("a.nav_contacts").find("label[wf='contacts']")[0];
            	if(navObj && $(navObj).css("display")!="none") {
        			$(navObj).css("display","none");
        		}
            	navObj = $(frm).find("a.nav_settings").find("label[wf='settingPermissions']")[0];
            	if(navObj && $(navObj).css("display")!="none") {
        			$(navObj).css("display","none");
        		}
            	var tabs = $('#template_tabs_span a[phasetemplateid]');
            	if(tabs.length>0) {
            		var curTab = tabs[frmIdx];
            		var errObj = $(curTab).find('label[wf="templatePhase"]')[0];
            		if($(errObj).css("display")!="none")
            			$(errObj).css("display","none");
            	}               	
            },
            addDefaultSubject:function(){
            	var templateApps = this.subApps.mangePhasesApp.templateApps;
            	$.each(templateApps,function(k,template){
            		var form = template.subApps.formApp;
            		if(!form.subApps.messageApp.$("#messageTitle").val()) {
            			form.subApps.messageApp.$("#messageTitle").val($.trim($("#incidentTemplateName").val()));
            			form.subApps.messageApp.model.set("title", $.trim($("#incidentTemplateName").val()));
            			form.subApps.messageApp.$("#messageTitle").blur();
                	}
            	});
            },
            eventClickFormSaveCopy:function(){
                this.copyEvent = true;
                this.addDefaultSubject();
                $("#lblMessage").text("");
                this.$("#incidentForm").submit();
            },
            eventClickCancel:function(){
                EB_Common.dialog.confirm(i18n["weatherthreshold.dialog.canceleditdata"],null,function(){
                    window.history.go(-1);
                });
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.TemplateAppModel);
            var templateAppModel = new Model(null,{url:options.url});
            var View = Backbone.View.extend(this.TemplateAppView);
            return new View({el:options.container,model:templateAppModel,saveOrUpdate:options.saveOrUpdate,loadSuccess:options.loadSuccess});
        }
    };

    view.incidents.app.TemplateApp.subApp.NewVariableApp={
        NewVariableAppView:{
            jDom:{},
            template:{},
            initialize:function(){
            	$.validator.addMethod('itemsduplicate', function(value, element, param) {
            		var values = {},
            		inputs = $(element).closest('ul').find('input').not(element),
            		lastRepeatValue = $(element).prop('lastRepeatValue'),
            		repeatInputs = [];
            		$(element).prop('lastRepeatValue', $.trim(value));
            		inputs.each(function(index, element) {
            			values[$.trim($(this).val())] = true;
            			if ($.trim($(this).val()) == lastRepeatValue) {
            				repeatInputs.push(element);
            			}
            		});
            		//console.info(repeatInputs);
            		// remove validation info
            		if (lastRepeatValue != $.trim(value) && repeatInputs.length == 1) {
            			$(repeatInputs[0]).removeClass('error').next('label.error').remove();
            		}
            		
            		if (values[$.trim(value)]) {
            			return false;
            		} else {
            			return true;
            		}
            		
            	}, i18n['setting.error.items.duplicated']);
            	
                $.templates({
                    newVariableTemplate: $("#newVariableTemplate").html(),
                    newVariableItemsTemplate: $("#newVariableItemsTemplate").html()
                });
                this.template.newVariableTemplate = $.render.newVariableTemplate;
                this.template.newVariableItemsTemplate = $.render.newVariableItemsTemplate;
                this.render();
                
            },
            render:function(){
                this.$el.html(this.template.newVariableTemplate([{}]));
                this.jDom.formVariables = this.$("#form_variables");
                this.jDom.variableType = this.$("#variableType");
                this.jDom.optionLable = this.$("#optionLable");
                this.jDom.itemsContainer = this.$("#itemsContainer");
                this.jDom.addItems = this.$("#addItems");
                this.jDom.itemsContainer.html(this.template.newVariableItemsTemplate([{Single:true}]));
                var newVariableApp = this;
                newVariableApp.isAdding = false;
                EB_Common.validation.validate(this.jDom.formVariables,{
                	onkeyup: false,
                	rules: {
                		name: {
                			remote: {
                				url: EB_Common.Ajax.wrapperUrl("/incidents/variableItem/checkVariableName"),
                				type: "post",
                				data: {
                					id: function() {
                						return $("#variableItemId").val();
                					}
                				}
                			}
                		}
                	},
                	messages: {
                		name: {
                			remote: i18n['setting.error.region.duplicatedName']
                		}
                	},
                	submitHandler:function(form){
                		newVariableApp.save(form);
                	}
                });
                this.dialog();
                return this;
            },
            save:function(form){
                var newVariableApp = this;
                if (newVariableApp.isAdding)return;
                newVariableApp.isAdding = true;
                this.jDom.itemsContainer.children().each(function(i){
                    $(this).find("input").each(function(){
                        var j = $(this);
                        if(j.attr("type")=="radio" || j.attr("type")=="checkbox"){
                            j.attr("name","variableOptions["+i+"].isSelected");
                        }else{
                            j.attr("name","variableOptions["+i+"].val");
                        }
                    });
                });
                $(form).ajaxSubmit({
                    success:function(data){
                    	newVariableApp.isAdding = false;
                        $(form).clearForm();
                        $("#name").removeData("previousValue");
                        $('#variableType').val('Single').change();
                        newVariableApp.$el.dialog("close");
                        newVariableApp.options.addVariableSuccessCallBack && newVariableApp.options.addVariableSuccessCallBack.call(newVariableApp);
                    },
                    failure: function(data) {
                        console.info(data);
                        newVariableApp.isAdding = false;
                    },
                    type:"post",
                    dataType:"json"
                });
            },
            events:function(){
                var events = {
                    "change #variableType":"eventChangeVariableType",
                    "click #addItems":"eventClickAddItems",
                    "click a.icn_trash_16":"eventClickRemoveItems"
                };
                return events;
            },
            eventChangeVariableType:function(e){
                var v = e.target.value;
                var lis = [];
                this.jDom.addItems.hide();
                this.jDom.optionLable.hide();
                if(v == "Single"){
                    lis.push({Single:true});
                    this.jDom.addItems.show();
                }else if(v == "Multiple"){
                    lis.push({Multiple:true});
                    lis.push({Multiple:true});
                    this.jDom.addItems.show();
                }else if(v == "Textarea"){
                    lis.push({Textarea:true});
                }else if(v == "Date"){
                    lis.push({Date:true});
                }
                lis.length&&this.jDom.optionLable.show();
                this.jDom.itemsContainer.html(this.template.newVariableItemsTemplate(lis));
            },
            eventClickAddItems:function(){
                var type = this.jDom.variableType.val();
                var o = {};
                o[type] = true;
                this.jDom.itemsContainer.append(this.template.newVariableItemsTemplate([o]));
                if(this.jDom.itemsContainer.children().length>2){
                    this.$("a.icn_trash_16").show();
                }else{
                    this.$("a.icn_trash_16").hide();
                }
            },
            eventClickRemoveItems:function(e){
                $(e.target).parent().remove();
                if(this.jDom.itemsContainer.children().length>2){
                    this.$("a.icn_trash_16").show();
                }else{
                    this.$("a.icn_trash_16").hide();
                }
            },
            okCallBack:function(){
                this.jDom.formVariables.submit();
            },
            dialog:function(){
                var me = this;
                this.$el.dialog({
                    autoOpen : false,
                    title : i18n["incident.informationvariables.new"],
                    width : 438,
                    height: 'auto',
                    modal : true,
                    resizable : false,
                    open:function(){
//                        me.openCallBack();
                    },
                    buttons : {
                        Ok : {
                            click : function() {
                                me.okCallBack&&me.okCallBack.call(me);
                            },
                            'class' : 'orange',
                            text : i18n['global.dialog.button.ok']
                        },
                        Cancel : {
                            click : function() {
                                $(this).dialog("close");
                                me.cancelCallBack&&me.cancelCallBack.call(me,true);
                            },
                            'class' : 'gray',
                            text : i18n['global.dialog.button.cancel']
                        }
                    },
                    close: function(event, ui) {
                        if(event.bubbles){
//                            me.cancelCallBack&&me.cancelCallBack.call(me,false);
                        }
                    }
                });
                
                var inputs = this.jDom.itemsContainer.find('input[type="text"]');
                if (inputs.length > 0) {
                	inputs.rules('add', {
                		itemsduplicate: true
                	});
                }
                
                var options = this.jDom.itemsContainer.find("input[type='radio']");
                if (options.length > 0) {
                	this.jDom.itemsContainer.on("click", "input[type='radio']", function(){
                		if($(this).val()==1){  
                	        $(this).attr("value","0");  
                	        $(this).removeAttr("checked");  
                	    } else {  
                	        $(this).val("1");  
                	        $(this).attr("checked","checked");  
                	    }   
                	});
                }
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var View = Backbone.View.extend(this.NewVariableAppView);
            return new View({model:new Backbone.Model(),addVariableSuccessCallBack:options.addVariableSuccessCallBack});
        }
    };
    view.incidents.app.TemplateApp.subApp.MangePhasesApp={
        MangePhasesAppView:{
            jDom:{},
            template:{},
            subApps:{
                phasesListApp:null
            },
            templateApps:[],
            initialize:function(){
                this.render();
            },
            render:function(){
                this.jDom.templateFormTabs = this.$("#template_form_tabs");
                this.jDom.tabNav = this.$("#template_tabs_span");
                if(this.options.loadSuccess){
                    this.options.loadSuccess.call(this);
                }else{
                    this.loadSuccess();
                }
                return this;
            },
            events:function(){
                var events = {
                    "click #manageVersion":"eventClickManageVersion",
                    "click #template_tabs .templateTab":"eventClickTab"
                };
                return events;
            },
            eventClickManageVersion:function(e){
                this.subApps.phasesListApp&&this.subApps.phasesListApp.$el.dialog("open");
            },
            eventClickTab:function(e){
                var a = $(e.currentTarget);
                a.siblings().removeClass("current");
                a.addClass("current");
                var phaseTemplateId = a.attr("phaseTemplateId");
                this.showTemplateView(phaseTemplateId);
            },
            showTemplateView:function(phaseTemplateId){
                $.each(this.templateApps,function(i,view){
                    view.$el.hide();
                    if(view.model.get("phaseTemplateId")==phaseTemplateId){
                        view.$el.show();
                        view.adjustjqGridWidth();
                    }
                });
            },
            loadSuccess:function(){
                var mangePhasesApp = this,model = this.model.toJSON(),options={}||{};
                options={
                    model:new Backbone.Model(model),
                    phaseListOkCallBack:function(phases){
                        $.each(phases,function(i,phase){
                            if(phase.isDelete){
                                mangePhasesApp.removeApps([phase.phaseTemplateId]);
                            }else{
                                if(phase.isCopy){
                                    mangePhasesApp.copyApp(phase.srcPhaseId,phase);
                                }
                            }
                        });
                        mangePhasesApp.$("#template_tabs_span>a").each(function(){
                            var j = $(this),phaseTemplateId = j.attr("phasetemplateid");
                            var name = "";
                            $.each(phases,function(i,phase){
                                if(phaseTemplateId == (phase.phaseTemplateId+"")){
                                    name = phase.name;
                                }
                            });
                            j.text(name);
                            j.append('<label wf="templatePhase" class="errorTab" style="display:none"></label>');
                        });
                    },
                    removeCallBack:function(ids){
                        mangePhasesApp.removeApps(ids);
                    }
                };
                this.subApps.phasesListApp = EB_View.incidents.app.TemplateApp.subApp.PhaseListApp.getInstance(options);
                $.each(model.phases,function(i,phase){
                    phase.radioName = mangePhasesApp.cid;
                    var div = $("<form/>");
                    var a = $("<a/>").attr("phaseTemplateId",phase.phaseTemplateId).addClass("templateTab").attr("href","javascript:void(0)").text(phase.name);
                    if(i==0){
                        a.addClass("current");
                    }else{
                        div.hide();
                    }
                    //added for validation popup to phase tabs
                    a.append('<label wf="templatePhase" class="errorTab" style="display:none"></label>');
                    mangePhasesApp.jDom.tabNav.append(a);
                    mangePhasesApp.jDom.templateFormTabs.append(div);
                    var options={
                        sessionId:mangePhasesApp.options.sessionId,
                        model:new Backbone.Model(phase),
                        container:div
                    };
                    mangePhasesApp.templateApps.push(EB_View.incidents.app.TemplateApp.subApp.PhaseTemplateApp.getInstance(options));
                });
            },
            copyApp:function(phaseTemplateId,phase){
                var app = this;
                var view = null;
                $.each(this.templateApps,function(i,v){
                    if(v.model.get("phaseTemplateId") == phaseTemplateId){
                        view = v;
                        return false;
                    }
                });
                view = view || this.templateApps[0];
                if(view){
                    var div = $("<form/>");
                    var a = $("<a/>").attr("phaseTemplateId",phase.phaseTemplateId).addClass("templateTab").attr("href","javascript:void(0)").text(phase.name).addClass("current");
                    app.jDom.tabNav.children().removeClass("current");
                    a.append('<label wf="templatePhase" class="errorTab" style="display:none"></label>');
                    app.jDom.tabNav.append(a);
                    app.jDom.templateFormTabs.children().hide();
                    app.jDom.templateFormTabs.append(div);
                    var formData = view.subApps.formApp.getData();
                    var contactData = view.subApps.contactApp.getData();
                    var settingData = view.subApps.settingApp.getData();
                    settingData.loadCompleted = false;
                    var deliverPathSetting = settingData.deliverPathSetting&&settingData.deliverPathSetting.orgPaths||[];
                    var mobileSettings = settingData.mobileSettings||{};
                    $.each(deliverPathSetting,function(i,v){    //should add it in setting.js
                    	if (v.type == "RECIP") {
                    		mobileSettings.requestLocationDisabled = !v.checked;
                            mobileSettings.requestImageDisabled = !v.checked;
                            mobileSettings.requestCommentDisabled = !v.checked;
                            return false;
                    	}
                    });
                    var permissionData = view.subApps.permissionApp.getData();
                    var options = {
                        model:new Backbone.Model($.extend(true,{loadCompleted:false},phase)),
                        container:div,
                        loadSuccess:function(){
                        	var phaseTemplate = this;
                            //create form app
                            var options={
                                sessionId:app.options.sessionId,
                                parentApp:phaseTemplate,
                                model:new Backbone.Model(formData.variableData),
                                notificationTypeChangeCallBack:function(type){
                                	phaseTemplate.model.set("_notificationType",type);
                                },
                                container:this.jDom.formNotificationContainer,
                                loadSuccess:function(){
                                	var formApp = this;
                                	formData.messageData.attachmentFiles&&formData.messageData.attachmentFiles.length&&$.each(formData.messageData.attachmentFiles,function(i,v){
                                		v.index = i + 1;
                                	});
                                    var options={
                                    	formApp:this,
                                    	apply:"incidentTemplate",
                                        sessionId:this.options.sessionId,
                                        hideUseMessageLink:true,
                                        model:new Backbone.Model(formData.messageData),
                                        container:this.jDom.messageContainer,
                                        notificationTypeChangeCallBack:formApp.options.notificationTypeChangeCallBack,
                                        adaptDom:function(){
                                            this.model.set({"includeSaveAsMessageTemplate":false});
                                            this.model.set({"includePreMessage":true});
                                            this.model.set({"includePostMessage":true});
                                            this.model.set({"includeTextMessage":false});
                                            this.model.set({"includeVariable":true});
                                        }
                                    };
                                    var messageApp = EB_View.notification.app.MessageApp.getInstance(options);
                                    messageApp.subApps.templateApp = EB_View.notification.app.MessageTemplateApp.getInstance({
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
                                    
                                    this.subApps.messageApp = messageApp;
                                }

                            }||{};
                            this.subApps.formApp = EB_View.incidents.app.TemplateApp.subApp.FromApp.getInstance(options);
                            //create the instance of contact app
                            options={
                                modelData:contactData.numData,
                                container:this.jDom.contactsContainer,
                                isCrossOrg:false,
                                loadSuccess:function(){
                                    //create the instance of contact app
                                    var _contactApp = this;
                                    var options2={
                                        model:new Backbone.Model(contactData.contactsData),
                                        selectedGroupIds:_contactApp.model.get("selectedGroupIds"),
                                        okCallBack:function(){
                                            _contactApp.model.set("contactsCount",this.multiselectIndividual.children().length);
                                            _contactApp.model.set("groupsCount",this.multiselectGroup.children().length);
                                            _contactApp.model.set("filtersCount",this.multiselectFilter.children().length);
                                        }
                                    } || {};
                                    var individualGroupFilter = EB_View.notification.app.ContactApp.SubUnits.IndividualGroupFilter.getInstance(options2);
                                    this.subApps.individualGroupFilter = individualGroupFilter;
                                    if(contactData.gisModelData.load){
                                        this.subApps.universeAppOptions = {
                                            model:new Backbone.Model(contactData.gisModelData),
                                            isDialog:true,
                                            selectButtonCallBack:function(){
                                                _contactApp.model.set("shapesCount",this.model.get("tempStorage").shapesCount||0);
                                            }
                                        };
                                    }else{
                                        this.subApps.universeAppOptions = {
                                            url:EB_Common.Ajax.wrapperUrl("/universe/homeAsJson"),
                                            originalGisData:contactData.gisContactsData,
                                            isDialog:true,
                                            selectButtonCallBack:function(){
                                                _contactApp.model.set("shapesCount",this.model.get("tempStorage").shapesCount||0);
                                            }
                                        };
                                    }

                                }
                            };
                            this.subApps.contactApp = EB_View.notification.app.ContactApp.getInstance(options);
                            //create instance of Setting
                            options={
                                model:new Backbone.Model(settingData),
                                container:this.jDom.settingContainer,
                                loadCompleteCallback:function(){
                                	phaseTemplate.model.set("_settingLoadCompleted",true);
                                }
                            };
                            this.subApps.settingApp = EB_View.notification.app.SettingApp.getInstance(options);

                            //create instance of Permission
                            options={
                                model:new Backbone.Model(permissionData),
                                container:this.jDom.permissionContainer,
                                templateApp: this
                            };
                            this.subApps.permissionApp = EB_View.incidents.app.TemplateApp.subApp.PermissionApp.getInstance(options);
                            
                            var templateApp = this;
                            formData.messageData&&formData.messageData.notificationTypes&&$.each(formData.messageData.notificationTypes||[], function(i,v){
                            	if (v.checked) {
                            		var type = v.name;
                            		templateApp.subApps.settingApp.subApps.confirmApp.model.set({"pollingOrConference":(type=="Polling" || type=="Quota" || type=="Conference")});
                            		if(templateApp.subApps.settingApp && templateApp.subApps.settingApp.subApps.voiceMailApp){
                                        var pollingOrConference = {"polling":(type=="Polling" || type=="Quota"), "conference" : (type=="Conference")};
                                        templateApp.subApps.settingApp.subApps.voiceMailApp.adjustVisibleByNotificationType(pollingOrConference);
                                    }
                            	}
                            });
                        }
                    };
                    app.templateApps.push(EB_View.incidents.app.TemplateApp.subApp.PhaseTemplateApp.getInstance(options));
                }
            },
            removeApps:function(ids){
                $.each(ids,function(i,id){
                    ids[i] = ids[i] + "";
                });
                var newTemplateApps = [];
                $.each(this.templateApps,function(i,view){
                	var id = view.model.get("phaseTemplateId") + "";
                    if($.inArray(id,ids)>-1){
                        view.model.unset("id");
                        view.model.destroy();
                    }else{
                        newTemplateApps.push(view);
                    }
                });
                this.templateApps = newTemplateApps;
                var removeClassCurrent = false;
                this.$(".templateTab").each(function(){
                    var a = $(this);
                    if($.inArray(a.attr("phaseTemplateId"),ids)>-1){
                        if(a.hasClass("current")) removeClassCurrent = true;
                        a.remove();
                    }
                });
                if(removeClassCurrent){
                    this.$(".templateTab").eq(0).trigger("click");
                }
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var View = Backbone.View.extend(this.MangePhasesAppView);
            return new View({model:options.model,el:options.container,sessionId:options.sessionId,loadSuccess:options.loadSuccess});
        }
    };
    view.incidents.app.TemplateApp.subApp.PhaseListApp={
        SinglePhaseModel:{
            defaults:function(){
                return {
                    srcPhaseId:0,
                    isHideNew : false,
                    phaseTemplateId:"",
                    radioName:"",
                    name:""
                };
            }
        },
        SinglePhaseModelView:{
            tagName:"tr",
            template:{},
            initialize:function(){
                $.templates({singlePhaseListTemplate: $("#singlePhaseListTemplate").html()});
                this.template.singlePhaseListTemplate = $.render.singlePhaseListTemplate;
                this.model.on("change",this.modelSelected,this);
                this.render();
            },
            render:function(){
                this.$el.html(this.template.singlePhaseListTemplate(this.getIdSuffixModelJSON()));
                return this;
            },
            events:function(){
                var events = {
                    "dblclick td.phasename":"eventDbClickPhaseName",
                    "blur td.phasename>input":"eventBlurPhaseNameInput",
                    "keyup td.phasename>input":"eventKeyupPhaseNameInput",
                    "click td>input[name='copy']":"eventClickCopy",
                    "change td>input:radio":"eventChangeRadio"
                };
                
                return this.dealEvents(events,this.cid);
            },
            modelSelected:function(v){
            	var update = this.$el.find("input[value='update']"),closed = this.$el.find("input[value='close']"),model = this.model;
            	if(model.get("updateChecked")) {
            		$(update[0]).attr("checked", "checked");
            	}
            	if(model.get("closeChecked")) {
            		$(closed[0]).attr("checked", "checked");
            	}
            },
            eventDbClickPhaseName:function(e){
                var j = $(e.target);
                var name = j.text();
                j.data("oldVal",name);
                var input = $("<input type='text' maxlength='18'/>");
                j.empty().append(input);
                input.val(name);
                input.focus();
            },
            eventBlurPhaseNameInput:function(e){
                var j = $(e.target);
                var td = j.parent();
                var oldName = j.parent().data("oldVal");
                var name = j.val()|| oldName;
                var me = this,isHave = false;
                this.model.collection.each(function(m,i){
                	if (name == m.get("name")) {
                		isHave = true;
                        return false;
                	}
                });
                if (isHave) {
                	td.text(oldName);
                	me.model.set(oldName);
                } else {
                	td.text(name);
                	this.model.set("name",name);
                }
            },
            eventKeyupPhaseNameInput:function(e){
                if(e.keyCode==13){
                    var j = $(e.target),td = j.parent();
                    var name = j.val()|| j.parent().data("oldVal");
                    td.text(name);
                    this.model.set("name",name);
                }
            },
            eventChangeRadio:function(e){
                var phaseTemplateId=this.model.get("phaseTemplateId"),updateChecked = false,closeChecked = false;
                if(e.target.value == "update"){
                    updateChecked = true;
                    this.model.set({"updateChecked":updateChecked});
                }
                if(e.target.value == "close"){
                    closeChecked = true;
                    this.model.set({"closeChecked":closeChecked});
                }
                this.model.collection.each(function(model,i){
                    if(model.get("phaseTemplateId") != phaseTemplateId){
                        if(updateChecked){
                            model.set("updateChecked",false);
                        }
                        if(closeChecked){
                            model.set("closeChecked",false);
                        }
                    }
                });
            },
            eventClickCopy:function(e){
                var k=1;
                var modelCount = 0;
                this.model.collection.each(function(p){
                	if (!p.get('isDelete')) {
                		modelCount ++;
                	}
                });
                if(modelCount>=3) return;
                var model = this.model.toJSON();
                var newSinglePhase = $.extend(true,{},model);
                newSinglePhase.id = Math.random();
                newSinglePhase.isCheckbox = false;
                newSinglePhase.isHideNew = true;
                newSinglePhase.newChecked = false;
                newSinglePhase.srcPhaseId=model.phaseTemplateId;
                newSinglePhase.phaseTemplateId=Math.random()+"";
                newSinglePhase.name=model.name+"-" + i18n['button.new.copy'];
                newSinglePhase.isCopy = true;
                newSinglePhase.updateChecked = false;
                newSinglePhase.closeChecked = false;
                this.model.collection.each(function(m,i){
                	if (newSinglePhase.name == m.get("name")) {
                		newSinglePhase.name += ++k;
                		return false;
                	}
                });
                this.model.collection.add([newSinglePhase]);
                if(++modelCount>=3){
                    this.$el.parent().children().find("input[name='copy']").prop("disabled",true);
                    this.$el.parent().children().find("input[name='copy']").addClass("gray").removeClass("orange");
                }
                this.$el.parent().children(":last").children().eq(1).trigger("dblclick");
            }
        },
        PhaseListAppView:{
            jDom:{},
            template:{},
            subApps:[],
            initialize:function(){
                $.templates({notificationPhasesListTemplate: $("#notificationPhasesListTemplate").html()});
                this.template.notificationPhasesListTemplate = $.render.notificationPhasesListTemplate;
                this.collection.on("add",this.collectionAddOne,this);
                this.collection.on("all",this.collectionChange,this);
                this.render();
            },
            render:function(){
                var model = this.getIdSuffixModelJSON()[0];
                var len =  model.phases.length;
                var cid = this.cid;
                $.each(model.phases,function(i,p){
                    if(i==0){
                        p.isCheckbox = true;
                        p.newChecked = true;
                    }
                    p.radioName = cid;
                    p.copyDisabled = len==3;
                });
                this.$el.html(this.template.notificationPhasesListTemplate([model]));
                this.dialog();
                return this;
            },
            collectionAddOne:function(singlePhase){
                var view = new this.options.singlePhaseModelView({model: singlePhase});
                this.$("#notificationPhasesTbody").append(view.render().el);
            },
            collectionChange:function(){

            },
            dialog:function(){
                var me = this;
                this.$el.dialog({
                    autoOpen : false,
                    title : i18n["manage.phase.dialog"],
                    width : 800,
                    height :360,
                    modal : true,
                    resizable : false,
                    open:function(){
                        me.openCallBack();
                    },
                    buttons : {
                        Ok : {
                            click : function() {
                                me.okCallBack&&me.okCallBack.call(me);
                                $(this).dialog("close");
                            },
                            'class' : 'orange',
                            text : i18n['global.dialog.button.ok']
                        },
                        Cancel : {
                            click : function() {
                                $(this).dialog("close");
                                me.cancelCallBack&&me.cancelCallBack.call(me,true);
                            },
                            'class' : 'gray',
                            text : i18n['global.dialog.button.cancel']
                        }
                    },
                    close: function(event, ui) {
                        if(event.bubbles){
                            me.cancelCallBack&&me.cancelCallBack.call(me,false);
                        }
                    }
                });
            },
            openCallBack:function(){
            	var me = this;
            	me.oldCollection = me.collection.toJSON();
                $.each(this.oldCollection,function(i,v){
                	v.copyDisabled = me.oldCollection&&me.oldCollection.length == 3;
                });
            },
            okCallBack:function(){
                this.oldCollection = null,me = this;
                var phases=[],_phases = this.collection.toJSON();
                $.each(_phases,function(i,phase){
                    phases.push($.extend(true,{},phase));
                });
                var toDeletePhases = [];
                this.collection.each(function(phase,i){
                    if(phase.get("isDelete")){
                        toDeletePhases.push(phase);
                        phase.unset("isDelete");
                    }
                    if(phase.get("isCopy")){
                        phase.unset("isCopy");
                    }
                });
                $.each(toDeletePhases,function(i,phase){
                    phase.unset("id");
                    phase.destroy();
                    me.collection.remove(phase);
                });
                this.options.phaseListOkCallBack.call(this,phases);
            },
            cancelCallBack:function(){
                this.$("#notificationPhasesTbody").empty();
                if(this.oldCollection){
                    this.collection.reset([]);
                    this.collection.add(this.oldCollection);
                }
            },
            events:function(){
                var events = {
                    "change input[type='checkbox']":"eventChangeCheckbox",
                    "click #deleteTemplate":"eventClickDeleteTemplate"
                };
                return this.dealEvents(events,this.cid);
            },
            eventChangeCheckbox:function(){
                var cs = this.$("input[type='checkbox']");
                if(cs.filter(":checked").length){
                    this.$("#deleteTemplate").prop("disabled",false).addClass("orange").removeClass("gray");
                }else{
                    this.$("#deleteTemplate").prop("disabled",true).addClass("gray").removeClass("orange");
                }
            },
            eventClickDeleteTemplate:function(){
                var cs = this.$("input[type='checkbox']:checked");
                var templateIds = [];
                cs.each(function(){
                    templateIds.push(this.value);
                    $(this).parent().parent().remove();
                });
                this.$("#deleteTemplate").prop("disabled",true).addClass("gray").removeClass("orange");
                if(this.$("#notificationPhasesTbody>tr").length>=3){
                    this.$("input[name='copy']").prop("disabled",true);
                    this.$("input[name='copy']").addClass("gray").removeClass("orange");
                }else{
                    this.$("input[name='copy']").prop("disabled",false);
                    this.$("input[name='copy']").addClass("orange").removeClass("gray");
                }
                var collection = this.collection;
                collection.each(function(phaseTemplate,i){
                    if($.inArray(phaseTemplate.get("phaseTemplateId")+"",templateIds)>-1){
                    	phaseTemplate.set({"isDelete":true},{silent:true}); 
                    	var model = phaseTemplate;
                    	if (model.get("updateChecked")) {
                    		collection.models[0].set("updateChecked",true);
                    	}
                    	if (model.get("closeChecked")) {
                    		collection.models[0].set("closeChecked",true);
                    	}
                    }
                });
                this.collection = collection;
            },
            getJsonData:function(){
                return this.collection.toJSON();
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var SinglePhaseModel = Backbone.Model.extend(this.SinglePhaseModel);
            var Collection = Backbone.Collection.extend({model:SinglePhaseModel});
            var collection = new Collection();
            var SinglePhaseModelView = EB_Common.Backbone.View.extend(this.SinglePhaseModelView);
            var View = EB_Common.Backbone.View.extend(this.PhaseListAppView);
            var view = new View({model:options.model,collection:collection,singlePhaseModelView:SinglePhaseModelView,phaseListOkCallBack:options.phaseListOkCallBack,removeCallBack:options.removeCallBack});
            view.collection.add(options.model.get("phases"));
            return view;
        }
    };
    view.incidents.app.TemplateApp.subApp.PhaseTemplateApp={
        PhaseTemplateModel:{
            defaults:function(){
                return {
                    load:false
                };
            },
            initialize:function () {
                if(arguments && arguments.length>1&&arguments[1].url)
                    this.urlRoot=arguments[1].url;
            },
            parse:function(response){
                var phase = response;
                phase.id=phase.id;
                //hand phaseList
                phase.isHideNew = phase.id!=0;
                phase.phaseTemplateId = phase.id;
                phase.name = phase.name||("default"+phase.id);
                $.each(phase.phaseDefinitions||[],function(i,definition){
                    if(definition.id==1001){
                        phase.newChecked = true;
                    }else if(definition.id==1002){
                        phase.updateChecked = true;
                    }else if(definition.id==1003){
                        phase.closeChecked = true;
                    }
                });
                //hand variable
                phase.formAppModelData={
                    variables:[]
                };
                phase.formTemplate = phase.formTemplate || {};
                phase.formTemplate.formVariableItems = phase.formTemplate.formVariableItems||[];
                phase.formAppModelData.variables = phase.formTemplate.formVariableItems;
                $.each(phase.formAppModelData.variables,function(i,variable){
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
                });
                //hand message
                phase.additionalData = phase.additionalData ||{};
                if(phase.additionalData.messageAdditionalData){
                    phase.broadcastTemplate.message.preMessage=phase.formTemplate.preMessage;
                    phase.broadcastTemplate.message.postMessage=phase.formTemplate.postMessage;
                    phase.additionalData.messageAdditionalData.bcTemplate = phase.broadcastTemplate;
                }
                phase.messageAppModelData = phase.additionalData.messageAdditionalData;
                //hand contacts
                phase.contactsAppModelData={
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
                };
                if(phase.broadcastTemplate&&phase.broadcastTemplate.broadcastContacts){
                    var contacts = phase.broadcastTemplate.broadcastContacts;
                    phase.contactsAppModelData.contactsCount = (contacts.contactIds&&contacts.contactIds.length)||0;
                    phase.contactsAppModelData.groupsCount = (contacts.groupIds&&contacts.groupIds.length)||0;
                    phase.contactsAppModelData.filtersCount = (contacts.filterIds&&contacts.filterIds.length)||0;
                    phase.contactsAppModelData.selectedGroupIds = (contacts.groupIds||[]).join(",");
                }
                phase.additionalData = phase.additionalData ||{};
                if(phase.additionalData.contactsAdditionalData){
                    phase.contactsAppModelData.IndividualGroupFilterData={
                        contacts:phase.additionalData.contactsAdditionalData.contacts||[],
                        groups:phase.additionalData.contactsAdditionalData.groups||[],
                        filters:phase.additionalData.contactsAdditionalData.filters||[]
                    };
                    phase.contactsAppModelData.UniverseAppData = phase.additionalData.contactsAdditionalData.map || {};
                    phase.contactsAppModelData.shapesCount = (phase.contactsAppModelData.UniverseAppData.shapesCount)||0;
                    var filterRules = phase.contactsAppModelData.UniverseAppData.filterRules;
                    if(filterRules && filterRules.length){
                        filterRules = JSON.stringify(filterRules);
                    }else{
                        filterRules="";
                    }
                    phase.contactsAppModelData.UniverseAppData.filterRules=filterRules;
                }
                phase.settingAppModelData = phase.additionalData.settingAdditionalData;
                //hand setting data
                phase.additionalData = phase.additionalData ||{};
                if(phase.additionalData.settingAdditionalData){
                    phase.additionalData.settingAdditionalData.bcTemplate = phase.broadcastTemplate;
                }
                phase.settingAppModelData = phase.additionalData.settingAdditionalData;

                //hand permission Data
                phase.permissionAppModelData = {
                    messageFlag : phase.messageFlag,
                    contactsFlag : phase.contactsFlag,
                    settingsFlag : phase.settingsFlag
                };
                phase.load = true;
                return phase;
            }
        },
        PhaseTemplateAppView:{
            validStatus:false,
            jDom:{},
            template:{},
            subApps:{},
            initialize:function(){
                $.templates({phaseTemplate: $("#phaseTemplate").html()});
                this.template.phaseTemplate = $.render.phaseTemplate;
//                this.model.on("change",this.render,this);
                this.model.on('destroy', this.remove, this);
                this.model.on("change:_onlyText",this.dealMessageTypeChange, this);
                this.model.on("change:loadCompleted", this.loadComplete, this);
                this.model.on("change:_notificationType", this.dealChangeNotificationType, this);
                this.model.on("change:_settingLoadCompleted",this.dealMessageAppChange,this);
                this.model.on("change:load",this.render,this);
                if(this.model.urlRoot){
                    this.model.fetch();
                }else{
                    this.render();
                }
            },
            render:function(){
                this.$el.html(this.template.phaseTemplate(this.getIdSuffixModelJSON()));
                var app = this;
                EB_Common.validation.validate(this.$el,{submitHandler:function(){
                    app.validStatus=true;
                    app.submitHandler();
                }});
                this.jDom.formNotificationContainer = this.$("#formNotificationContainer");
                this.jDom.contactsContainer = this.$("#contactsContainer");
                this.jDom.settingPermissionContainer = this.$("#settingPermissionContainer");
                this.jDom.settingContainer = this.$("#settingContainer");
                this.jDom.permissionContainer = this.$("#permissionContainer");
                if(this.options.loadSuccess){
                    this.options.loadSuccess.call(this);
                }else{
                    this.loadSuccess();
                }
                this.model.set("loadCompleted",true);
                return this;
            },
            adjustjqGridWidth:function(){
                //when window size changed ,the jqgrid will changed.
                $(window).trigger("resize");
            },
            loadSuccess:function(){
                var bcId="0",source="1",navIndex=11,options={}||{},me = this;
                //create form app
                options={
                    sessionId:this.options.sessionId,
                    model:new Backbone.Model({variables:[]}),
                    container:this.jDom.formNotificationContainer,
                    parentApp:me,
                    messageTypeChangeCallback:function(type){
                        me.model.set("_onlyText",type=="None"?true:false);
                    },
                    notificationTypeChangeCallBack:function(type){
                        me.model.set("_notificationType",type);
                    }
                };
                this.subApps.formApp = EB_View.incidents.app.TemplateApp.subApp.FromApp.getInstance(options);
                //create the instance of contact app
                var contactData={
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
                };
                options={
                    model:new Backbone.Model(contactData),
                    container:this.jDom.contactsContainer,
                    loadSuccess:function(){
                        //create the instance of contact app
                        var _contactApp = this;
                        var options2={
                            model:new Backbone.Model(contactData.IndividualGroupFilterData),
                            selectedGroupIds:_contactApp.model.get("selectedGroupIds"),
                            okCallBack:function(){
                                _contactApp.model.set("contactsCount",this.multiselectIndividual.children().length);
                                _contactApp.model.set("groupsCount",this.multiselectGroup.children().length);
                                _contactApp.model.set("filtersCount",this.multiselectFilter.children().length);
                            },
                            closeDialogCallBack:function(){
                                _contactApp.model.trigger("change");
                            }
                        };
                        var individualGroupFilter = EB_View.notification.app.ContactApp.SubUnits.IndividualGroupFilter.getInstance(options2);
                        this.subApps.individualGroupFilter = individualGroupFilter;
                        this.subApps.universeAppOptions = {
                            url:EB_Common.Ajax.wrapperUrl("/universe/homeAsJson"),
                            originalGisData:contactData.UniverseAppData,
                            isDialog:true,
                            selectButtonCallBack:function(){
                                _contactApp.model.set("shapesCount",this.model.get("tempStorage").shapesCount||0);
                            }
                        };
                    },
                    selectContactCallback:function(val){
                    }
                };
                this.subApps.contactApp = EB_View.notification.app.ContactApp.getInstance(options);
                //create instance of Setting
                options={
                    url:EB_Common.Ajax.wrapperUrl("/bcTemplates/loadSettingsAsJson/" + bcId + "/" + source +"?navIndex="+navIndex),
                    container:this.jDom.settingContainer,
                    loadCompleteCallback:function(){
                    	//create instance of Permission
                    	options={
                    			model:new (Backbone.Model.extend(EB_View.incidents.app.TemplateApp.subApp.PermissionApp.PermissionAppModel)),
                    			container:me.jDom.permissionContainer,
                    			templateApp:me
                    	};
                    	me.subApps.permissionApp = EB_View.incidents.app.TemplateApp.subApp.PermissionApp.getInstance(options);
                        me.model.set("_settingLoadCompleted",true);
                    }
                };
                this.subApps.settingApp = EB_View.notification.app.SettingApp.getInstance(options);
            },
            events:function(){
                var events = {
                    "click .phaseTemplateLi":"eventClickPhaseTemplateLi"
                };
                return this.dealEvents(events,this.cid);
            },
            eventClickPhaseTemplateLi:function(e){
//                var j = $(e.target);
                var j = $(e.currentTarget);
                j.addClass("bcdark").siblings().removeClass("bcdark");
//                if(j.is("a")) j = j.parent();
//                if(j.is("i") || j.is("div")) j = j.parent().parent();
                j.children("i").addClass("arrows");
                j.siblings().children("i").removeClass("arrows");
                this.jDom[j.attr("appContainer")].show().siblings().hide();

            },
            loadComplete:function(model){
                if(model.get("loadCompleted")){
                    this.dealMessageAppChange(model);
                    this.dealChangeNotificationType(model);
                }
            },
            dealMessageAppChange:function(model){
                if(model.get("loadCompleted") && model.get("_settingLoadCompleted")){
                    this.subApps.settingApp.languageApp.model.set("_onlyText",model.get("_onlyText"));
                }
            },
            dealChangeNotificationType:function(model){
                if(model.get("loadCompleted") && model.get("_settingLoadCompleted")){
                    var type = model.get("_notificationType");
                    var pollingOrConference = {"polling":(type=="Polling" || type=="Quota"), "conference" : (type=="Conference")};
                    this.subApps.settingApp.subApps.confirmApp.model.set("pollingOrConference", $.extend({},pollingOrConference));
                    if(this.subApps.settingApp && this.subApps.settingApp.voiceMailApp){
                        this.subApps.settingApp.voiceMailApp.adjustVisibleByNotificationType($.extend({},pollingOrConference));
                        this.subApps.settingApp.deliveryMethodApp.renderTTYStatus(type=="Conference");
                    }
                }
            },
            getFormData:function(namePrefixs){
                var settingFormData = this.subApps.settingApp.getFormData(namePrefixs.broadcastTemplate);
                var contactFormData = this.subApps.contactApp.getFormData(namePrefixs.broadcastTemplate);
                return settingFormData+contactFormData;
            },
            getJsonData:function(parentObj){
                parentObj.phaseTemplateId = this.model.get("phaseTemplateId");
                this.subApps.formApp.getJsonData(parentObj);
                this.subApps.contactApp.getJsonData(parentObj.broadcastTemplate);
                this.subApps.settingApp.getJsonData(parentObj.broadcastTemplate);
                this.subApps.permissionApp.getJsonData(parentObj);
                return parentObj;
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var View = EB_Common.Backbone.View.extend(this.PhaseTemplateAppView);
            var phaseTemplateModel = null;
            if(options.url){
                var Model = Backbone.Model.extend(this.PhaseTemplateModel);
                phaseTemplateModel = new Model(null,{url:options.url});
            }else{
                phaseTemplateModel = options.model;
            }
            return new View({el:options.container,model:phaseTemplateModel,sessionId:options.sessionId,loadSuccess:options.loadSuccess});
        }
    };
    view.incidents.app.TemplateApp.subApp.FromApp={
        FromAppView:{
            subApps:{},
            jDom:{},
            template:{},
            initialize:function(){
                $.templates({formMessageTemplate: $("#formMessageTemplate").html()});
                this.template.formMessageTemplate = $.render.formMessageTemplate;
                this.model.on("change:variables",this.renderChangeVariables,this);
//                this.model.on("change:timerFunctions",this.timerCallbacks,this);
                this.model.on("change:targetInput",this.targetInputChangeHandler,this);
                this.render();
            },
            targetInputChangeHandler:function(){
            	var me = this;
            	if(this.model.get("targetInput")) {
            		this.jDom.variableGrid.find("a.tokenEnable").removeClass("icon_addvariable_off_16").addClass("icon_addvariable_on_16");
            	} else {
            		me.jDom.variableGrid.find("a.tokenEnable").removeClass("icon_addvariable_on_16").addClass("icon_addvariable_off_16");
            	}
            },
            timerCallbacks:function(){
            	EB_Common.logger.log("change");
            	var me = this,timerFunctions = me.model.get("timerFunctions");
            	if (timerFunctions.length == 0) {
            		me.timer&&clearInterval(me.timer);
            		me.timer = null;
            		me.serverTime = null;
            	} else {
            		if (!me.timer){
            			me.timer = setInterval(function(){
            				me.updateSystemTime();
            			}, 1000);
            		}
            	}
            },
            render:function(){
                var cid = this.cid;
                var models = this.getIdSuffixModelJSON();
                $.each(models,function(i,model){
                	model.variables.sort(function(a,b){
                		return (a.seq > b.seq)?1:-1;
                	});
                    $.each(model.variables,function(j,v){
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
                });
                this.$el.html(this.template.formMessageTemplate(this.getIdSuffixModelJSON()));
                this.jDom.variableGrid = this.$("#variableGrid");
                this.jDom.variableContainer = this.$("#variableContainer");
                this.jDom.messageContainer = this.$("#messageContainer");
                this.addDatePicker();
                this.clearDatePicker();
                this.sortableVariable();
                this.loadJQgrid();                
                this.loadJQgridData();
                if(this.options.loadSuccess){
                    this.options.loadSuccess.call(this);
                }else{
                    this.loadSuccess();
                }
                this.renderChangeVariables();
//                this.initSystemTime();
                var app = this;
                this.$el.on("click", function(e){
                	if (e.target.className == 'cbox') return;
                	var targetInput = app.model.get("targetInput");
                	app.addTokenFromList = false;
                	targetInput&&targetInput.blur();
                });
                return this;
            },
            renderChangeVariables:function(){
                var variables = this.model.get("variables");
                var view = this;
                $.each(variables,function(i,v){
                    view.syncLocalRowDataToGrid(v.variableId, v.val);
                });
                this.previewButtonManage();
                this.subApps.messageApp.messageBlur();
            },
            previewButtonManage:function(tab){
            	if (tab == "variableContainer"||!tab) {
            		var container = this.$("#variableContainer");
            		var lis = container.children("li");
            		if (lis.length > 0) {
            			container.children("div").remove();
            			container.sortable( "enable" );
            		} else {
            			var emptyInfoDiv = $("<div />").addClass("no-select-grid").append($("<p />").addClass("emptyvariable")).append($("<p />").html(i18n["incidenttemplate.variables.emptyInfo"]));
            			container.empty();
            			container.append(emptyInfoDiv);
            			container.sortable( "disable" );
            		}
            	} else {
            		this.$("#iTemplateTest").show();
            	}
            },
            //clear the value of datepicker
            clearDatePicker: function() {
            	this.jDom.variableContainer.on("click", "a.icon_clear_auto", function(e){
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
                context = context || this.jDom.variableContainer;
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
                            timeFormat: 'HH:mm:ss',
                            stepHour: 1,
                            stepMinute: 1,
                            stepSecond: 1,
                            minDate: '-10y',
                            buttonText:  i18n['button.calendar.tooltip'],
                            changeMonth : true,
                            changeYear : true,
                            onSelect : function(dateStr,ui) {
                                ui.input.valid();
                                ui.input.trigger("change");
                            }
                        });
                        if(j.val()){
                            var date = new Date(j.val().replace(/-/g,"/"));
                            j.datetimepicker("setDate",date);
                        }
                    }else{
                        j.attr("readonly","readonly").datepicker({
                            dateFormat: "mm-dd-yy",
                            minDate: '-10y',
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
            createVariableDom:function(data){
//            	if (data.isSys) {
//                	EB_Common.Ajax.ajax({
//                		url:EB_Common.Ajax.wrapperUrl("/incidents/incident/getServerVaribleValues"),
//                		type: "get",
//                		dataType: "json",
//                		async:false,
//                		success:function(response) {
//                			(data.id == 10003 || data.id == 10004) &&(view.serverTime=new Date(response.currentTime));
//                			data.id == 10001 &&(data.val= [response.messageSender]);
//                			data.id == 10002 &&(data.val= ["NEW"]);
//                		}
//                	});
//                }
            	
                var j = $($("#variableTemplate").render([data]));
                //append clear function
                return j;
            },
            sortableVariable:function(){
                var app = this;
                this.jDom.variableContainer.sortable({
                    axis: "y",
                    cursor:'move',
                    forcePlaceholderSize: true,
                    delay: 100,
                    opacity: 0.8,
                    scroll:true,
                    update:function( event, ui ){
                        app.updateVariableItemIndex();
                        app.varibleDisplay();
                    }
                });
            },
            updateVariableItemIndex:function(){
                var app = this;
                var variables = app.model.get("variables");
                this.jDom.variableContainer.children("li").each(function(i){
                    var j = $(this).find(".index");
                    j.text(i+1);
                    $.each(variables, function(index, v){
                    	if (v.variableId == j.attr("variableId")) {
                    		v.seq = i + 1;
                    	}
                    });
                    variables.length&&variables.sort(function(a,b){
                		return (a.seq > b.seq)?1:-1;
                	});
                    app.syncLocalRowDataToGrid(j.attr("variableId"),{seq:i+1});
                });
            },            
            loadJQgridData:function(variableName){
                var app = this;
                EB_Common.Ajax.get(EB_Common.Ajax.wrapperUrl("/incidents/template/loadVariables"),{variableName:variableName||""},function(data){
                    data = data||[];
                    $.each(data,function(i,d){
                        d.id = d.variableId;
                        d.originalVariableItem = $.extend(true,{},d);
                    });
                    app.jDom.variableGrid.clearGridData();
                    app.jDom.variableGrid.jqGrid('setGridParam', {rowNum:data.length,data: data}).trigger('reloadGrid');
                    app.jDom.variableGrid.jqGrid('resizeGrid');
                },"json");
            },
            loadJQgrid:function(variableName){
                var data=[];
                var app = this;
                app.jDom.variableGrid.jqGrid({
                    data: data,
                    loadonce: true,
                    sortable: true,
                    datatype: "local",
                    autoencode: true,
                    emptyDataCaption: i18n['global.grid.emptyDataCaption'],
                    height: 340,
                    autowidth: true,
                    viewrecords: true,
                    multiselect : true,
                    colNames: [i18n['variable.column.req'],'',i18n['variable.column.variablename']],
                    colModel: [{
                        name: 'isRequired',
                        index: 'isRequired',
                        width: 80,
                        sortable:false,
                        formatter: function(val, rec, rowObject) {
                            return rowObject.isSys ? ' ':'<input type="checkbox" name="require" value="'+rowObject.variableId+'">';
                        }
                    },{
                        width: 40,
                        sortable:false,
                        formatter: function(val, rec, rowObject) {
                            return '<a href="javascript:void(0)" class="addToken icon_addvariable_off_16" style="text-decoration:none;"></a>';
                        }
                    }, {
                        name: 'variableName',
                        index: 'variableName',
                        width: 450,
                        sortable:true
                    }],
                    //pager: app.$("#variableGridPager"),
                    onSelectRow : function(rowId, status) {
                        var chart_cell = app.jDom.variableGrid.getInd(rowId, true);
                        if (chart_cell && chart_cell.cells && !status) {
                            var chart_container = chart_cell.cells[1].childNodes[0];
                            chart_container&&(chart_container.checked = status);
                        }
                        var data = app.jDom.variableGrid.getLocalRow(rowId),tokenA = $(chart_cell).find("a.addToken");
                        data.isUsed = status;
                        app.syncDataFromGrid(app.jDom.variableGrid,[rowId]);
                        if (data.isSys||status) {
                        	tokenA.removeClass("tokenEnable").addClass("tokenEnable");
                        	if (app.model.get("targetInput")) {
                        		tokenA.removeClass("icon_addvariable_off_16").addClass("icon_addvariable_on_16");
                        		app.addTokenFromList = true;
                        	}
                        } else {
                        	tokenA.removeClass("tokenEnable").removeClass("icon_addvariable_on_16").addClass("icon_addvariable_off_16");
                        }
                    },
                    afterInsertRow : function(id, rowdata, rowele) { // display chart after insert
                        var chart_cell = app.jDom.variableGrid.getInd(id, true);
                        var data = app.jDom.variableGrid.getLocalRow(id);
                        if (chart_cell && chart_cell.cells) {
                            var chart_container = chart_cell.cells[1].childNodes[0];
                            chart_container && $(chart_container).on("change", function(){
                            	var status = $(this).parent().parent().attr("aria-selected")=="true";
                            	data.isRequired = this.checked;
                            	if(this.checked && !status){
                            		app.jDom.variableGrid.setSelection(this.value, true);
                            		data.isUsed = true;
                            	}else{
                            		app.syncDataFromGrid(app.jDom.variableGrid,[id]);
                            	}
                            	
                            });
                        }
                        
                        var addToken = $(chart_cell).find("a.addToken");
                        $(addToken).on("click", function(e){
                        	var targetInput = app.model.get("targetInput"),name = data.variableName,index = targetInput&&window.targetIndex||0,value = targetInput&&targetInput.val(),target = $(e.currentTarget),
                        		messageApp = app.subApps.messageApp.model,textLength = 2500 - (messageApp.get("title")||"").length - (messageApp.get("postMessage")||"").length - (messageApp.get("preMessage")||"").length - app.getVaribleLength();
                        	if (textLength < name.length + 2) {
                        		EB_Common.dialog.alert(i18n['incidenttemplate.wordlimits'],null);
                        		return;
                        	}
                        	
                        	if (target.prop("className").indexOf("icon_addvariable_off_16") != -1) return;
                        	if (value) {
                        		var value1 = value.substring(0,index),value2 = value.substring(index, value.length);
                        		targetInput.val(value1 + "{" + name + "}" + value2);
                        	} else {
                        		targetInput.val("{" + name + "}");
                        	}
//                        	EB_Common.position(targetInput, index + name.length + 2);  //TODO this code
                        	window.targetIndex = index + name.length + 2;
                        	app.addTokenFromList = true;
                        	if (targetInput.valid()){
                        		targetInput.blur();
                        	}
                        	e.stopPropagation();
                        });
                        if (data.isSys) {
                        	addToken.addClass("tokenEnable");
                        	var sysVariables = app.model.get("sysVariables");
                        	if (sysVariables) {
                        		sysVariables.push(data);
                        	} else {
                        		app.model.set("sysVariables", [data]);
                        	}
                        }
                       
                        if (data.variableItem&&data.variableItem.variableOptions) {
                        	var options = data.variableItem.variableOptions, val = [];
                        	$.each(options, function(i,v) {
                        		if (v.isSelected) {
                        			val.push(v.val);
                        		}
                        	});
                        	data.val = val;
                        	data.originalVariableItem.val = val;
                        }
                    },
                    onSelectAll:function(ids,status){
                        for(var i = 0;i<ids.length;i++){
                            var chart_cell = app.jDom.variableGrid.getInd(ids[i], true);
                            var data = app.jDom.variableGrid.getLocalRow(ids[i]),tokenA = $(chart_cell).find("a.addToken");;
                            data.isUsed = status;
                            if (chart_cell && chart_cell.cells && !status) {
                                var chart_container = chart_cell.cells[2].childNodes[0];
                                var required_checked = chart_cell.cells[1].childNodes[0];
                                chart_container&&$(chart_container).attr("checked", status);
                                required_checked&&$(required_checked).attr("checked", status);
                                data.isRequired = status;
                            }
                            
                            if (data.isSys||status) {
                            	tokenA.removeClass("tokenEnable").addClass("tokenEnable");
                            	if (app.model.get("targetInput")) {
                            		tokenA.removeClass("icon_addvariable_off_16").addClass("icon_addvariable_on_16");
                            		app.addTokenFromList = true;
                            	}
                            } else {
                            	tokenA.removeClass("tokenEnable").removeClass("icon_addvariable_on_16").addClass("icon_addvariable_off_16");
                            }
                        }
                        app.syncDataFromGrid(app.jDom.variableGrid,ids);
                    },
                    gridComplete:function(){
                        app.syncDataToGrid(app.jDom.variableGrid);                     
                    }
                });
            },
            loadSuccess:function(){
                var app = this;
                var options={
                	formApp:app,
                	apply:"incidentTemplate",
                    sessionId:this.options.sessionId,
                    hideUseMessageLink:true,
                    url:EB_Common.Ajax.wrapperUrl("/bcTemplates/loadMessageAsJson/" + 0 + "/" + 1 +"?navIndex="+11),
                    container:app.jDom.messageContainer,
                    
                    adaptDom:function(){
                        this.model.set({"includeSaveAsMessageTemplate":false});
                        this.model.set({"includePreMessage":true});
                        this.model.set({"includePostMessage":true});
                        this.model.set({"includeTextMessage":false});
                        this.model.set({"includeVariable":true});
                    },
                    messageTypeChangeCallback:app.options.messageTypeChangeCallback,
                    notificationTypeChangeCallBack:app.options.notificationTypeChangeCallBack
                };
                var messageApp = EB_View.notification.app.MessageApp.getInstance(options);
                messageApp.subApps.templateApp = EB_View.notification.app.MessageTemplateApp.getInstance({
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
                this.subApps.messageApp = messageApp;
            },
            updateSystemTime:function(){
                var view = this;
                if((view.jDom.systemDateDom || view.jDom.systemCurrentTimeDom)&&view.serverTime){
                	view.serverTime.setSeconds(view.serverTime.getSeconds()+1);
                    var dateTime =view.serverTime.date2str("MM-dd-yyyy hh:mm:ss"),date = dateTime.split(" ")[0],time = dateTime.split(" ")[1],dateItem = view.jDom.systemDateDom && view.jDom.systemDateDom.find("input"),
                    currentTimeItem = view.jDom.systemCurrentTimeDom && view.jDom.systemCurrentTimeDom.find("input");
                    $(dateItem).val(date).change();
                    $(currentTimeItem).val(time).change();
                    
                    view.varibleDisplay();
                }
                
            },
            initSystemTime:function(){
            	var view = this,formVariableItems = view.model.get("variables");
            	var timerFunctions = [];
                $.each(formVariableItems,function(i,item){
                    if(item.isSys && (item.variableId=="10003"||item.variableId=="10004")){
                    	timerFunctions.push(item.variableId);
                    }
                });
                if (timerFunctions.length) {
                	view.$("li[variableId]").each(function(){
                		var j = $(this),variableId = j.attr("variableId");
                		if(variableId=="10003"){
                			view.jDom.systemCurrentTimeDom = j;
                		}else if(variableId=="10004"){
                			view.jDom.systemDateDom = j;
                		}
                	});
                	EB_Common.Ajax.ajax({
                		url:EB_Common.Ajax.wrapperUrl("/incidents/incident/getServerTime"),
                		type: "get",
                		dataType: "json",
                		async:false,
                		success:function(data) {
                			view.serverTime=new Date(data);
                			//$('#manageCategoriesForm').valid();
                		}});
                	this.model.set("timerFunctions", timerFunctions);
                }
            },
            getVaribleLength:function(){
            	var model = this.model, varibles = model.get("variables")||[], text = "";
            	$.each(varibles, function(i,v){
            		text += v.variableName + ":" + (v.val||"") + ",";
            	});
            	text = text.substring(0, text.length -1);
            	return text.length;
            },
            getVaribleValues:function(){
            	var me = this,message = me.subApps.messageApp,broadcastSettings =me.options.broadcastTemplate&&me.options.broadcastTemplate.broadcastSettings,variables = me.model.get("variables");
            	me.dataobj = {};
            	me.dataobj['formVariableItems'] = variables;
            	me.dataobj['title'] = $.jgrid.htmlEncode(message.model.get("title"));
            	me.dataobj['postMessage'] = $.jgrid.htmlEncode(message.model.get("postMessage"));
            	me.dataobj['preMessage'] = $.jgrid.htmlEncode(message.model.get("preMessage"));

            	if (!broadcastSettings) {
            		var settingApp =  view.incidents.app.TemplateApp.TemplateAppView.subApps.mangePhasesApp.templateApps[0].subApps.settingApp.model;
            		var settingAppData = view.incidents.app.TemplateApp.TemplateAppView.subApps.mangePhasesApp.templateApps[0].subApps.settingApp.getData();
            		var broadcastSettings = settingApp.get("senderCallerIdSetting");
            		me.dataobj['from'] = (settingAppData.senderEmailSetting&&settingAppData.senderEmailSetting.senderEmail)||$.jgrid.htmlEncode(settingApp.get("senderEmail"));
            		broadcastSettings&&$.each(broadcastSettings.senderCallers||[],function(i,v){
            			if (v.isDefault) me.dataobj['callerId'] = v.callerId;
            		});
            	} else {
            		var settingAppData =  view.incidents.app.TemplateApp.TemplateAppView.subApps.mangePhasesApp.templateApps[0].subApps.settingApp.getData();
                    me.dataobj['from'] = (settingAppData.senderEmailSetting&&settingAppData.senderEmailSetting.senderEmail)||$.jgrid.htmlEncode(broadcastSettings&&broadcastSettings.senderEmail);
                    $.each((broadcastSettings&&broadcastSettings.senderCallerInfos)||[],function(i,v){
                        if (v.isDefault) me.dataobj['callerId'] = v.callerId;
                    });
            	}
            	return variables.length;
            },
            events:function(){
                var events = {
                    "keyup #quickSearchValue":"eventKeyupQuickSearchValue",
                    "click #iTemplateTest":"eventCickFromPreview",
                    "click #simpleSearch":"eventClickSimpleSearch",
                    "click #newVariable":"eventClickNewVariable",
                    "click #previewEditTab>li":"eventClickTabLi",
                    "change #variableContainer input":"eventChangeVariableInput",
                    "change #variableContainer textarea":"eventChangeVariableInput",
                    "change #variableContainer select":"eventChangeVariableSelect"
                };
                return this.dealEvents(events,this.cid);
            },
            eventCickFromPreview:function(){
            	var me  = this, el, message = me.subApps.messageApp,parentApp = me.options.parentApp.model,status = parentApp.get("newChecked") ? "New":(parentApp.get("updateChecked") ? "Update":(parentApp.get("closeChecked")?"Close":"empty"));;
            	me.getVaribleValues();
            	message.messageBlur();
            	
            	me.parseToken();
            	var params = [],validIds = [],varibles = me.model.get("variables"),sysVariables = me.model.get("sysVariables");
            	varibles = varibles.concat(sysVariables);
            	$.each(sysVariables, function(k, v){
            		validIds.push(v.variableId);
            	});
            	me.dataobj.title&&params.push({'text':'Title', 'value':me.dataobj.title.replace(/{Notification Status}/g, status)});
            	me.dataobj.postMessage&&params.push({'text':'IntroductionText', 'value':me.dataobj.postMessage.replace(/{Notification Status}/g, status)});
            	me.dataobj.preMessage&&params.push({'text':'ClosingText', 'value':me.dataobj.preMessage.replace(/{Notification Status}/g, status)});
            	
            	EB_Common.Ajax.ajax({
            		url:EB_Common.Ajax.wrapperUrl("/incidents/variableItem/parseToken"),
            		type: "POST",
            		dataType: "json",
            		data:{
            			"messages":JSON.stringify(params),
            			"validIds":validIds
            		},
            		success:function(response) {
            			me.dataobj.title = response.Title&&response.Title.replace(/\n/g, "<br />");
                    	me.dataobj.preMessage = response.IntroductionText&&response.IntroductionText.replace(/\n/g, "<br />");
                    	me.dataobj.postMessage = response.ClosingText&&response.ClosingText.replace(/\n/g, "<br />");
            			
            			el = $($('#template_preview_tmpl').render(me.dataobj));
            			EB_Common.dialog.dialog(el,{
            				title:i18n["button.new.test"],
            				height:500,
            				buttons : {
            					Ok : {
            						click : function() {
            							$(this).dialog("close");
            						},
            						'class' : 'orange',
            						text : i18n['global.dialog.button.ok']
            					}
            				}
            			});
            		}
            	});
            },
            parseToken:function(){
            	var me = this, variables = me.model.get("variables");
            	if (me.dataobj.title&&me.dataobj.title.match(/{.*?}/g)) {
            		$.each(variables, function(i,v){
            			if (!v.isSys)me.dataobj.title = me.dataobj.title.replceIgnoreRegex("{" + EB_Common.htmlEncode(v.variableName) + "}", EB_Common.htmlEncode(v.val||""));
            		});
            		if (me.dataobj.title.length > 80) me.dataobj.title = me.dataobj.title.substring(0, 80);
            	}
            	
            	if (me.dataobj.postMessage&&me.dataobj.postMessage.match(/{.*?}/g)) {
            		$.each(variables, function(i,v){
            			if (!v.isSys)me.dataobj.postMessage = me.dataobj.postMessage.replceIgnoreRegex("{" + EB_Common.htmlEncode(v.variableName) + "}", EB_Common.htmlEncode(v.val||""));
            		});
            	}
            	
            	if (me.dataobj.preMessage&&me.dataobj.preMessage.match(/{.*?}/g)) {
            		$.each(variables, function(i,v){
            			if (!v.isSys)me.dataobj.preMessage = me.dataobj.preMessage.replceIgnoreRegex("{" + EB_Common.htmlEncode(v.variableName) + "}", EB_Common.htmlEncode(v.val||""));
            		});
            	}
            },
            
            eventKeyupQuickSearchValue:function(e){
                if(e.keyCode==13){
                    this.eventClickSimpleSearch();
                }
            },
            eventClickSimpleSearch:function(){
                var j = this.$("#quickSearchValue");
                var value = j.val();
                if(value == j.data("oldValue")){
                    return;
                }
                this.loadJQgridData(value);
                j.data("oldValue",value);
            },
            eventClickNewVariable:function(e){
                window.incidentTemplateApp.subApps.newVariableApp.$el.dialog("open");
            },
            eventClickTabLi:function(e){
                var j = $(e.target),me=this;
                j.addClass("current").siblings().removeClass("current");
                me.$("#"+ j.attr("tab")).show().siblings().hide();
                if (j.attr("tab") == "variableContainer"){
                	me.$("#variableContainerInfo").show();
                } else {
                	me.$("#variableContainerInfo").hide();                	
                }
                me.varibleDisplay();
                me.previewButtonManage($(j).attr("tab"));
            },
            varibleDisplay:function(){
            	this.getVaribleValues();
            	this.subApps.messageApp.$("#variableValueListContainer").empty();
                if (this.dataobj.formVariableItems.length) {
                	var html = $("#incident_variables_message_tmpl").render(this.dataobj.formVariableItems);
                	this.subApps.messageApp.$("#variableValueListContainer").html(html);
                } else {
        			var emptyInfoDiv = $("<div />").addClass("no-select-grid").append($("<p />").addClass("emptyvariable")).append($("<p />").html(i18n["incidenttemplate.variables.emptyInfo"]));
        			this.subApps.messageApp.$("#variableValueListContainer").append(emptyInfoDiv);
                }
            },
            eventChangeVariableInput:function(e){
                var variables = this.model.get("variables"),isContinue = true;
                var j = $(e.target),li = j.parent(),variableId = li.attr("variableId"),view = this;
                $.each(variables,function(i,v){
                    if((v.variableId+"")==variableId){
                        v.val = [$.trim(j.val())];
                        if (v.isSys){
                        	isContinue = false;
                        } else {
                        	view.syncLocalRowDataToGrid(variableId,{val:v.val});
                        }
                    }
                });
                isContinue&&this.subApps.messageApp._countTextMessage(true);
            },
            eventChangeVariableSelect:function(e){
                var variables = this.model.get("variables");
                var j = $(e.target),li = j.parent(),variableId = li.attr("variableId"),view = this;
                $.each(variables,function(i,v){
                    if((v.variableId+"")==variableId){
                        var val = j.val();
                        if(val&&val.join){
                            v.val = j.val();
                        }else{
                            v.val = [j.val()];
                        }
                        view.syncLocalRowDataToGrid(variableId,{val:v.val});
                    }
                });
                this.subApps.messageApp._countTextMessage(true);
            },
            syncDataFromGrid:function(grid,ids){
                var app = this;
                var cid = this.cid;
                if(!ids || !ids.length) return;
                var variables = this.model.get("variables");
                var newVariables = [],modifiedVariables=[],removedVariableIds=[];
                $.each(ids,function(i,id){
                    var data = grid.getLocalRow(id);
                    data.variableLiId = data.variableId+cid;
//                    var li = app.$("#"+data.id);   //TODO throw error in ie9.
                    var li = $("#"+data.variableLiId);
                    if(data.isUsed){
                        if(data.variableItem){
                            if(data.variableItem.varType=="Single"){
                                $.each(data.variableItem.variableOptions||(data.variableItem.variableOptions=[]),function(i,vo){
                            		vo.selected = $.inArray(vo.val,data.val||[])>-1;
                            		vo.isSelected = $.inArray(vo.val,data.val||[])>-1;
                                });
                            }else if(data.variableItem.varType=="Multiple"){
                                $.each(data.variableItem.variableOptions||(data.variableItem.variableOptions=[]),function(i,vo){
                                	vo.selected = $.inArray(vo.val,data.val||[])>-1;
                            		vo.isSelected = $.inArray(vo.val,data.val||[])>-1;
                                });
                            } else if (data.variableItem.organizationId==-1) {
                              if((!data.val) || (data.val.length==0)){
                            	  data.val = [data.variableItem.variableOptions[0].val];
                              }
                            }
                        }
                        
                        var variableDom = app.createVariableDom(data);
                        if (data.id == 10003) app.jDom.systemCurrentTimeDom = variableDom;
                        if (data.id == 10004) app.jDom.systemDateDom = variableDom;
                        if(li.length){
                        	modifiedVariables.push(data);
                        	li.replaceWith(variableDom);
                        }else{
                            app.$("#variableContainer").append(variableDom);
                            newVariables.push(data);
                        }
                    	data.variableItem.varType=='Date'&&app.addDatePicker(variableDom);
                    }else{
                        li.remove();
                        removedVariableIds.push(data.variableId+"");
                        data.isRequired = data.originalVariableItem.isRequired;
                        data.val=data.originalVariableItem.val;
                        data.variableItem = $.extend(true,{},data.originalVariableItem.variableItem);
                    }
                });
                var retainVariables=[];
                $.each(variables,function(i,v){
                    $.each(modifiedVariables,function(j,mv){
                        if(v.variableId == mv.variableId){
                            v = mv;
                        }
                    });
                    if($.inArray(v.variableId+"",removedVariableIds)==-1){
                        retainVariables.push(v);
                    }
                });
                $.merge(retainVariables,newVariables);
                app.updateVariableItemIndex();
                app.model.set("variables",retainVariables);
                app.varibleDisplay();
                app.subApps.messageApp._countTextMessage(true);
            },
            syncDataToGrid:function(grid){
                var app = this;
                grid.resetSelection();
                var variables = this.model.get("variables");
                var ids= grid.jqGrid("getDataIDs");
                $.each(variables,function(i,v){
                    if($.inArray(v.variableId+"",ids)>-1){
                        var id = v.variableId+"";
                        grid.jqGrid('setSelection',id,false);
                        var chart_cell = grid.getInd(id, true);
                        if(v.isRequired){
                            if (chart_cell && chart_cell.cells) {
                                var chart_container = chart_cell.cells[1].childNodes[0];
                                chart_container.checked = true;
                            }
                        }
                        $(chart_cell).find("a.addToken").addClass("tokenEnable");
                        app.syncLocalRowDataToGrid(id,{isUsed:true,isRequired:v.isRequired,val:v.val});
                    }
                });
            },
            syncLocalRowDataToGrid:function(rowId,newData){
                var data = this.jDom.variableGrid.getLocalRow(rowId);
                for(var d in newData){
                    data[d] = newData[d];
                }
            },
            getData:function(){
                var variableData = this.model.toJSON(),view = this;
                $.each(variableData.variables,function(i,variable){
                    if(variable.variableItem){
                        if(variable.variableItem.varType=="Single"){
                        	if (variable.val){
                        		$.each(variable.variableItem.variableOptions||(variable.variableItem.variableOptions=[]),function(i,vo){
                        			vo.selected = ($.inArray(vo.val,variable.val||[])>-1);
                        			vo.isSelected = vo.selected;
                        		});
                        	} else {
                        		variable.val = [];
                        		$.each(variable.variableItem.variableOptions||(variable.variableItem.variableOptions=[]),function(i,vo){
                        			if (vo.isSelected) variable.val.push(vo.val);
                        		});
                        	}
                        }else if(variable.variableItem.varType=="Multiple"){
                        	if (variable.val){ 
                        		$.each(variable.variableItem.variableOptions||(variable.variableItem.variableOptions=[]),function(i,vo){
                        			vo.selected = ($.inArray(vo.val,variable.val||[])>-1);
                        			vo.isSelected = vo.selected;
                        		});
                        	} else {
                        		variable.val = [];
                        		$.each(variable.variableItem.variableOptions||(variable.variableItem.variableOptions=[]),function(i,vo){
                        			if (vo.isSelected) variable.val.push(vo.val);
                        		});
                        	}
                        }
                    }
                    
                    variable.variableId == 10003&&view.jDom.systemCurrentTimeDom&&(variable.val = [$(view.jDom.systemCurrentTimeDom.find("input")).val()]);
                    variable.variableId == 10004&&view.jDom.systemDateDom&&(variable.val = [$(view.jDom.systemDateDom.find("input")).val()]);
                });
                var messageData = this.subApps.messageApp.getData();
                var data = {
                    variableData : variableData,
                    messageData : messageData
                };
                return $.extend(true,{},data);
            },
            getJsonData:function(parentObject){
                var data = this.getData();
                var formVariableItems = [];
                $.each(data.variableData.variables,function(i,v){
                    formVariableItems.push({
                        variableId:v.variableId,
                        val:v.val,
                        seq:v.seq,
                        isUsed:v.isUsed,
                        isRequired:v.isRequired,
                        variableName:v.variableName
                    });
                    
                    
                    
                });
                parentObject.formTemplate.formVariableItems = formVariableItems;
                parentObject.formTemplate.sysVariables = data.variableData.sysVariables;
                this.subApps.messageApp.getJsonData(parentObject.broadcastTemplate);
                return parentObject;
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var View = EB_Common.Backbone.View.extend(this.FromAppView);
            return new View({el:options.container,model:options.model,sessionId:options.sessionId,
                loadSuccess:options.loadSuccess,broadcastTemplate:options.broadcastTemplate,
                messageTypeChangeCallback:options.messageTypeChangeCallback,
                notificationTypeChangeCallBack:options.notificationTypeChangeCallBack,parentApp:options.parentApp});
        }
    };

    view.incidents.app.TemplateApp.subApp.PermissionApp={
        PermissionAppModel:{
            defaults:function(){
                return {
                    mv:true,
                    me:false,
                    cv:false,
                    ce:false,
                    sv:false,
                    se:false,
                    messageFlag:1,
                    contactsFlag:1,
                    settingsFlag:1
                };
            }
        },
        PermissionAppView:{
            jDom:{},
            template:{},
            initialize:function(){
                $.templates({permissionTemplate: $("#permissionTemplate").html()});
                this.template.permissionTemplate = $.render.permissionTemplate;
                this.render();
            },
            render:function(){
                this.model.set("mv",true);
                this.model.set("cv",(this.model.get("contactsFlag")&1)==1);
                this.model.set("sv",(this.model.get("settingsFlag")&1)==1);
                this.model.set("me",(this.model.get("messageFlag")&2)==2);
                this.model.set("ce",(this.model.get("contactsFlag")&2)==2);
                this.model.set("se",(this.model.get("settingsFlag")&2)==2);
                this.$el.html(this.template.permissionTemplate(this.getIdSuffixModelJSON()));
                this.options.templateApp&&this.options.templateApp.subApps.contactApp.ignoreValidate(this.model.get("ce"));
                this.options.templateApp&&this.options.templateApp.subApps.formApp.subApps.messageApp.ignoreValidate2(this.model.get("me"));
                this.options.templateApp&&this.options.templateApp.subApps.settingApp.ignoreValidate(this.model.get("se"));
                return this;
            },
            events:function(){
                var events = {
                    "change input:checkbox":"eventChangeCheckbox"
                };
                return this.dealEvents(events,this.cid);
            },
            eventChangeCheckbox:function(e){
        		this.model.set(e.target.value, e.target.checked);
        		$(e.target).val() == 'me'&&this.options.templateApp&&this.options.templateApp.subApps.formApp.subApps.messageApp.ignoreValidate(e.target.checked);
        		$(e.target).val() == 'ce'&&this.options.templateApp&&this.options.templateApp.subApps.contactApp.ignoreValidate(e.target.checked);
        		$(e.target).val() == 'se'&&this.options.templateApp&&this.options.templateApp.subApps.settingApp.ignoreValidate(e.target.checked, true);
        		this.getJsonData({});
        		if(/e$/.test(e.target.value) && e.target.checked){
        			$(e.target).parent().prev().children().prop("checked",true).trigger("change");
        		}
        		if(/v$/.test(e.target.value) && (!e.target.checked)){
        			$(e.target).parent().next().children().prop("checked",false).trigger("change");
        		}                
            },
            getData:function(){
                var model = this.model.toJSON();
                model.mv = model.mv?1:0;
                model.cv = model.cv?1:0;
                model.sv = model.sv?1:0;
                model.me = model.me?2:0;
                model.ce = model.ce?2:0;
                model.se = model.se?2:0;
                model.messageFlag = model.mv|model.me;
                model.contactsFlag = model.cv|model.ce;
                model.settingsFlag = model.sv|model.se;
                return $.extend(true,{},model);
            },
            getJsonData:function(parentObj){
                var data = this.getData();
                parentObj.messageFlag = data.messageFlag;
                parentObj.contactsFlag = data.contactsFlag;
                parentObj.settingsFlag = data.settingsFlag;
                return parentObj;
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var View = EB_Common.Backbone.View.extend(this.PermissionAppView);
            return new View({el:options.container,model:options.model,sessionId:options.sessionId,loadSuccess:options.loadSuccess,templateApp:options.templateApp});
        }
    };
})(EB_View);