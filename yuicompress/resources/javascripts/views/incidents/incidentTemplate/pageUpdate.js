(function(view){
    view.incidents.page = view.incidents.page || {};
    view.incidents.page.templateCreateOrUpdate={
        initialize:function(id){
            var sessionId = $("#pageCreate").attr("sessionId");
            $.validator.setDefaults({
                ignore:".ignore"
            });
            var options = {
                url:EB_Common.Ajax.wrapperUrl("/incidents/template/"+id),
                container:$("#incidentTemplateContainer"),
                saveOrUpdate:function(incidentTemplate,isCopy){
                	$("#lblMessage").text("");
                    var incidentTemplateApp = this;
                    var url = EB_Common.Ajax.wrapperUrl("/incidents/template/update");
                    if(!incidentTemplateApp.jDom.incidentTemplateName.attr("incidentTemplateId")){
                        url = EB_Common.Ajax.wrapperUrl("/incidents/template/create");
                    }
                    EB_Common.Ajax.post(url,{incidentTemplateJson:incidentTemplate},function(data){
                        if(data.jsonStatus){
                        	$("#lblMessage").text(i18n["incident.incidenttemplate.sucessmsg"]);
                            if(isCopy){
                                incidentTemplateApp.jDom.form.attr("action",EB_Common.Ajax.wrapperUrl("/incidents/template/create"));
                                incidentTemplateApp.jDom.incidentTemplateName.removeAttr("incidentTemplateId");
                                incidentTemplateApp.jDom.incidentTemplateName.val(incidentTemplateApp.jDom.incidentTemplateName.val()+"-" + i18n['button.new.copy']);
                                incidentTemplateApp.jDom.incidentTemplateName.focus();
                                
                            }                            
                            else{
                            	incidentTemplateApp.jDom.form.attr("action",EB_Common.Ajax.wrapperUrl("/incidents/template/update"));
                            	incidentTemplateApp.jDom.incidentTemplateName.attr("incidentTemplateId",data.templateId);
                            	//stay in edit page after user clicked "save" button.
                                //window.location.href=EB_Common.Ajax.wrapperUrl("/incidents/incident#templates");
                            }
                        }else{
                        	$("#lblMessage").text(i18n["incident.incidenttemplate.failedmsg"]);
                            EB_Common.dialog.alert("Save Error");                            
                        }
                    },"json");
                },
                //load mangePhasesApp
                loadSuccess:function(){
                    var incidentTemplateApp = this;
                    var phases = this.model.get("phaseTemplates");
                    var incidentTemplateId = this.model.get("id");
                    var options={};
                    options = {
                        addVariableSuccessCallBack:function(){
                            $.each(incidentTemplateApp.subApps.mangePhasesApp.templateApps,function(i,templateApp){
                                templateApp.subApps.formApp.loadJQgridData();
                            });
                        }
                    }
                    this.subApps.newVariableApp = EB_View.incidents.app.TemplateApp.subApp.NewVariableApp.getInstance(options);
                    options={
                        sessionId:sessionId,
                        model:new Backbone.Model({phases:phases}),
                        container:$("#manageTemplateContainer"),
                        //load mangePhasesApp
                        loadSuccess:function(){
                            var mangePhasesApp = this,model = this.model.toJSON(),options={};
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
                            }
                            this.subApps.phasesListApp = EB_View.incidents.app.TemplateApp.subApp.PhaseListApp.getInstance(options);
                            $.each(model.phases,function(i,phase){
                                EB_View.incidents.page.templateCreateOrUpdate.loadPhaseTemplateApp(i,phase,mangePhasesApp,incidentTemplateId);
                            });
                        }
                    }
                    this.subApps.mangePhasesApp = EB_View.incidents.app.TemplateApp.subApp.MangePhasesApp.getInstance(options);
                }
            }
            window.incidentTemplateApp = EB_View.incidents.app.TemplateApp.getInstance(options);
        },
        loadPhaseTemplateApp:function(i,phase,mangePhasesApp,incidentTemplateId){
            phase.radioName = mangePhasesApp.cid;
            var div = $("<form/>");
            var a = $("<a/>").attr("phaseTemplateId",phase.phaseTemplateId).addClass("templateTab").attr("href","javascript:void(0)").text(phase.name);
            if(i==0){
                a.addClass("current");
            }else{
                div.hide();
            }
            a.append('<label wf="templatePhase" class="errorTab" style="display:none"></label>');
            mangePhasesApp.jDom.tabNav.append(a);
            mangePhasesApp.jDom.templateFormTabs.append(div);
            var options={
                sessionId:mangePhasesApp.options.sessionId,
//                model:new Backbone.Model(phase),
                url:EB_Common.Ajax.wrapperUrl("/incidents/template/"+incidentTemplateId+"/"+i),
                container:div,
                //load subApps for phaseTemplateApp
                loadSuccess:function(){
                    var phaseTemplateApp = this;
                    var phaseModel = phaseTemplateApp.model.toJSON();
                    var options={};
                    //create form app
                    options={
                        sessionId:this.options.sessionId,
                        model:new Backbone.Model(phaseModel.formAppModelData),
                        broadcastTemplate:phaseModel.broadcastTemplate,
                        container:this.jDom.formNotificationContainer,
                        parentApp:phaseTemplateApp,
                        loadSuccess:function(){
                            var app = this;
                            var ss = phaseModel.messageAppModelData;
                            ss.bcTemplate.message.formVariableItems   = phaseModel.formTemplate.formVariableItems;
                            var model = EB_View.notification.app.MessageApp.MessageModel.parse(phaseModel.messageAppModelData);
                            var options={
                            	formApp:app,
                            	apply:"incidentTemplate",
                                sessionId:this.options.sessionId,
                                hideUseMessageLink:true,
                                model:new Backbone.Model(model),
                                container:app.jDom.messageContainer,
                                adaptDom:function(){
                                    this.model.set({"includeSaveAsMessageTemplate":false});
                                    this.model.set({"includePreMessage":true});
                                    this.model.set({"includePostMessage":true});
                                    this.model.set({"includeTextMessage":false});
                                    this.model.set({"includeVariable":true});
                                },
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
                        notificationTypeChangeCallBack:function(type){
                        	phaseTemplateApp.model.set("_notificationType",type);
                        }
                    }
                    this.subApps.formApp = EB_View.incidents.app.TemplateApp.subApp.FromApp.getInstance(options);
                    options={
                        modelData:phaseModel.contactsAppModelData,
                        container:this.jDom.contactsContainer,
                        loadSuccess:function(){
                            //create the instance of contact app
                            var _contactApp = this;
                            var options2={
                                model:new Backbone.Model(phaseModel.contactsAppModelData.IndividualGroupFilterData),
                                selectedGroupIds:_contactApp.model.get("selectedGroupIds"),
                                okCallBack:function(){
                                    _contactApp.model.set("contactsCount",this.multiselectIndividual.children().length);
                                    _contactApp.model.set("groupsCount",this.multiselectGroup.children().length);
                                    _contactApp.model.set("filtersCount",this.multiselectFilter.children().length);
                                }
                            };
                            var individualGroupFilter = EB_View.notification.app.ContactApp.SubUnits.IndividualGroupFilter.getInstance(options2);
                            this.subApps.individualGroupFilter = individualGroupFilter;

                            this.subApps.universeAppOptions = {
                                url:EB_Common.Ajax.wrapperUrl("/universe/homeAsJson"),
                                originalGisData:phaseModel.contactsAppModelData.UniverseAppData,
                                isDialog:true,
                                selectButtonCallBack:function(){
                                    _contactApp.model.set("shapesCount",this.model.get("tempStorage").shapesCount||0);
                                }
                            }
                        }
                    };
                    this.subApps.contactApp = EB_View.notification.app.ContactApp.getInstance(options);
                    //create instance of Setting
                    var model = EB_View.notification.app.SettingApp.settingAppModel.parse(phaseModel.settingAppModelData);
                    options={
                        model:new Backbone.Model(model),
                        container:this.jDom.settingContainer,
                        loadCompleteCallback:function(){
                        	phaseTemplateApp.model.set("_settingLoadCompleted",true);
                        }
                    }
                    this.subApps.settingApp = EB_View.notification.app.SettingApp.getInstance(options);

                    //create instance of Permission
                    options={
                        model:new Backbone.Model(phaseModel.permissionAppModelData),
                        container:this.jDom.permissionContainer,
                        templateApp:this
                    }
                    this.subApps.permissionApp = EB_View.incidents.app.TemplateApp.subApp.PermissionApp.getInstance(options);
                    
                    var templateApp = this;
                    $.each(phaseModel.messageAppModelData.bcTemplate.message.notificationTypes||[], function(i,v){
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
            }
            mangePhasesApp.templateApps.push(EB_View.incidents.app.TemplateApp.subApp.PhaseTemplateApp.getInstance(options));
        }
    };
})(EB_View)