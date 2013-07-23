(function(view){
    view.incidents.page = view.incidents.page || {};
    view.incidents.page.templateCreateOrUpdate={
        initialize:function(){
            var sessionId = $("#pageCreate").attr("sessionId");
            $.validator.setDefaults({
                ignore:".ignore"
            });
            var options = {
                container:$("#incidentTemplateContainer"),
                saveOrUpdate:function(incidentTemplate,isCopy){
                	$("#lblMessage").text("");
                    var incidentTemplateApp = this;
                    var url = EB_Common.Ajax.wrapperUrl("/incidents/template/create");
                    if(incidentTemplateApp.jDom.incidentTemplateName.attr("incidentTemplateId")){
                        url = EB_Common.Ajax.wrapperUrl("/incidents/template/update");
                    }
                    EB_Common.Ajax.post(url,{incidentTemplateJson:incidentTemplate},function(data){
                        if(data.jsonStatus){
                            //EB_Common.dialog.alert("Save Success","Incident Template");
                        	$("#lblMessage").text(i18n["incident.incidenttemplate.sucessmsg"]);
                            if(isCopy){
                            	incidentTemplateApp.jDom.incidentTemplateName.removeAttr("incidentTemplateId");
                                incidentTemplateApp.jDom.incidentTemplateName.val(incidentTemplateApp.jDom.incidentTemplateName.val()+"-" + i18n['button.new.copy']).focus();
                            }                            
                            else{
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
                loadSuccess:function(){
                    var incidentTemplateApp = this;
                    var options={};

                    options = {
                        addVariableSuccessCallBack:function(){
                            $.each(incidentTemplateApp.subApps.mangePhasesApp.templateApps,function(i,templateApp){
                                templateApp.subApps.formApp.loadJQgridData();
                            });
                        }
                    }
                    this.subApps.newVariableApp = EB_View.incidents.app.TemplateApp.subApp.NewVariableApp.getInstance(options);
                    var defaultPhases =[{
                        name:i18n["incidenttemplate.phase.all"],
                        phaseTemplateId:0,
                        newChecked:true,
                        updateChecked:true,
                        closeChecked:true
                    }];
                    options={
                        sessionId:sessionId,
                        model:new Backbone.Model({phases:defaultPhases}),
                        container:$("#manageTemplateContainer")
                    }
                    this.subApps.mangePhasesApp = EB_View.incidents.app.TemplateApp.subApp.MangePhasesApp.getInstance(options);
                }
            }
            window.incidentTemplateApp = EB_View.incidents.app.TemplateApp.getInstance(options);
        }
    };
})(EB_View)