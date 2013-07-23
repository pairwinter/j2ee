/**
 * incidents
 * 
 * @author Linder Wang
 */
(function(view) {
    view.incidents = view.incidents || {};
    var pub = {
        initPage: function(context) {
            var me = this;
            this.pageContext = context;
            this.advancedSearch = null;
            this.advancedTempSearch = null;
            $('#main_tabs a').click(function(e) {
                e.preventDefault();
                var element = $(this), tmplId = element.attr('tmplId'), url = element.attr('href');

                element.addClass('mouse_out').siblings().removeClass('mouse_out');
                var hash = window.location.hash||"#incidents", tabHash = "";
                switch (tmplId) {
                    case 'all_incidents_tmpl':
                    	var kvs = hash.split("&"), status = kvs[1]&&kvs[1].split("=");;
                    	kvs[0] = "incidents";
                    	tabHash = kvs.join("&");
                        me.loadAllIncidents(url, tmplId,status? status[1]||"":"Open"); 
                        $('#help_incident').attr('robohelpindex','73');
                        break;
                    case 'incident_templates_tmpl':
                    	tabHash = 'templates';
                        me.loadIncidentTemplates(url, tmplId);  
                        $('#help_incident').attr('robohelpindex','84');
                        break;
                    case 'incident_variables_tmpl':
                    	tabHash = 'variables';
                        me.loadIncidentVariables(url, tmplId);
                        $('#help_incident').attr('robohelpindex','82');
                        break;
                }
                window.location.hash = tabHash;                       
            });
            $(window).bind('hashchange',pub.hashMange);
            
            pub.hashMange();

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
           
           $(document).click(function(e) {
                var target = $(e.target);
                if (target.attr('name') == 'folderSelect' || target.parent().attr('name') == 'folderSelect') {
                    return;
                }
                $('#folderSelectCt').hide();
                e.stopPropagation();
            });
           $('#add_incident').click(function(e){
        	   //${ctx }/incidents/incident/create)
           });
        },
        hashMange:function(){
        	var hash = window.location.hash,kvs = hash.split("&"),tab = kvs[0],status = kvs[1], loadStatus = status? status.split("=")[1]||"" : "Open",index = 0;
        	if (window.location.hash) {
                switch(tab){
                    case '#incidents':
                    	$('#main_tabs a:eq(0)').click();
                        var tabItem = $("#li" + (loadStatus||"All"));
                        if (tabItem.attr("class") != "current") {
                        	$("#li" + (loadStatus||"All")).addClass('current').siblings().removeClass('current');
                        	$("#incidents_gridTable").jqGrid('clearGridData');
                        	$("#incidents_gridTable").jqGrid('setGridParam', {postData: {status: loadStatus}, page: 1}).trigger('reloadGrid');
                        }
                        break;
                    case '#templates':
                        $('#main_tabs a:eq(1)').click();
                        break;
                   case '#variables':
                        $('#main_tabs a:eq(2)').click();
                        break;
                }
            } else {
            	window.location.hash = "#incidents";
                if (("onhashchange" in window) && (typeof(document.documentMode) === "undefined" || (document.documentMode||1)/1 > 7)) {
//                	$(window).bind('hashchange',pub.hashMange);
                } else {
                	pub.hashMange();
                }
            }
        },
        loadAllIncidents: function(url, tmplId,status) {
            $('#add_incident').show().siblings().hide();
            var id = tmplId.substring(0, tmplId.lastIndexOf('_'));
            var tab = $('#' + id);
            $('#tab_container').children().hide();
            if(tab.length > 0 ){
                tab.show();
                $('#incidents_gridTable').jqGrid('resizeGrid');
                return;
            }
            $('#tab_container').append($('#' + tmplId).tmpl().attr('id', id));
            var me = this;
            me.updateStatusSummary("", "");
            me.checkLiveTemplate();
            
            //init advanced search            
            //var isAdvancedSearched = false;
            //var isFirstLoad = true;
            //var advancedSearch = null;
            $('#advanceSearch_incident').click(function(e) {
                if(!me.advancedSearch){
                	if(me.advancedTempSearch){me.advancedTempSearch=null;}
                    me.advancedSearch = EB_View.contact.advancedSearchApp.getInstance({container:$('#ajax_advancedSearch_incidents'),
                        showSavedAsRule:true,
                        autoOpen:true,
                        needForm:true,
                        showSavedAsRule:false,
                        url:EB_Common.Ajax.wrapperUrl("/incidents/incident/getAdvancedSearchItems"),
                        callback:{
                            search:function(conditions,isFilterVal,filterName){                           
                                $('#incidents_gridTable').jqGrid('setGridParam',{datatype:'json',postData:{queryString:'',
                                    conditions:EB_Common.json.stringify(conditions)}}).trigger("reloadGrid");
                                me.updateStatusSummary("", EB_Common.json.stringify(conditions));
                            },close:function(){
                            	var queryString = encodeURIComponent($("#searchName_incident").val());
                            	$("#incidents_gridTable").jqGrid('clearGridData');
                                $("#incidents_gridTable").jqGrid('setGridParam', {postData: {conditions : "", queryString: queryString}, page: 1}).trigger('reloadGrid');                              
                                me.updateStatusSummary(queryString, "");
                            }}
                        }
                        );
                }else{
                    if(me.advancedSearch.isHidden()){
                        me.advancedSearch.open();
                    }else{
                        me.advancedSearch.close();
                    }
                }                
            });
            
            
            
            $('[name="incidents_list_tabs"] li', '#' + id).click(function() {
                var status = $(this).attr('status');
                var hash = window.location.hash;
                if (hash) {
                	if (hash.indexOf("status") > -1 ) {
                		var arr = hash.split("&");
                		$.each(arr, function(i,v){
                			var kv = v.split("=");
                			if (kv[0] == "status") {
                				kv[1] = status;
                				arr[i] = kv.join("=");
                				return false;
                			}
                		});
                		window.location.hash = arr.join("&");
                	} else {
                		window.location.hash = hash + "&status=" + status;
                	}
                }
                
                if (("onhashchange" in window) && (typeof(document.documentMode) === "undefined" || (document.documentMode||1)/1 > 7)) {
//                	$(window).bind('hashchange',pub.hashMange);
                } else {
                	pub.hashMange();
                }
            });
            
            $('#incidents_gridTable').jqGrid({
                url: url,
                datatype: 'json',
                mtype: 'POST',
                postData:{status: status},
                contentType: 'application/json',
                autoencode: true,
                emptyDataCaption: i18n['global.grid.emptyDataCaption'],
                jsonReader: {
                    root: 'data',
                    page: 'currentPageNo',
                    total: 'totalPageCount',
                    records: 'totalCount',
                    repeatitems: false
                },
                height: 'auto',
                autowidth: true,
                viewrecords: true,
                pager: '#incidents_gridPager',
                scrollOffset: 0,
                sortname:'lastModifiedDate',
                sortorder:'desc',
                prmNames: {
                    page: 'pageNo',
                    totalrows: 'totalrows'
                },
                colNames: [i18n['global.status'],
                    i18n['setting.topic.subscriptionFields.name'],
                    i18n['incident.column.openduration'],
                    i18n['incident.column.openedon'],
                    i18n['incident.column.lastupdated'],
                    i18n['incident.column.closedon']],
                colModel: [{
                        name: 'incidentStatus',
                        index: 'incidentStatus',
                        width: 70,
                        title: false,
                        formatter: function(val, rec, rowObject) {
                            var ret = '';
                            if (val == 'Open') {
                                ret = i18n['incident.status.open'];
                                ret = '<span class="green">' + ret + '</span> <a class="b-incidents-normal"  name="folderSelect" href="#"><span recordId="'+rowObject.id+'">' + i18n['incident.action'] + '</span><i class="icon_gray_downarrow"></i></a>';
                            } else if (val == 'Closed') {
                                ret = i18n['incident.status.close'];
                                ret = '<span class="deepgray">' + ret + '</span>';
                            }
                            return ret;
                        }
                    }, {
                        name: 'name',
                        index: 'name',
                        width: 100,
                        formatter: function(val, rec, rowObject) {
                            return '<a  href="'+EB_Common.Ajax.wrapperUrl("/incidents/incident/"+rowObject.id+"/notifications/")+'">' + $.jgrid.htmlEncode(val) + '</a>';
                        }
                    }, {
                        name: 'duration',
                        index: 'duration',
                        width: 80,
                        sortable: false,
                        formatter: function(val, rec, rowObject) {
                           var timeString = me.time_To_dayhhmmss(val); 
                           var arr = timeString.split(":");
                           var durationVal = i18n["incident.list.duration.formatter"].replace("{0}",arr[0]).replace("{1}", arr[1]).replace("{2}",arr[2]).replace("{3}",arr[3]);
                            return durationVal;
                        }
                    }, {
                        name: 'createdDate',
                        index: 'createdDate',
                        width: 80
                    }, {
                        name: 'lastModifiedDate',
                        index: 'lastModifiedDate',
                        width: 80
                    }, {
                        name: 'closeDate',
                        index: 'closeDate',
                        width: 80,
                        formatter:function(val, rec, rowObject){
                        	return !!val?val:"--";
                        }
                    }],
                gridComplete: function() {
                	// call update status summary when the grid load complate
                	//me.updateStatusSummary();
                    $('[name="folderSelect"]', '#' + id).click(function(e) {
                    	var incidentId = $(this).find('span').attr('recordId');
                        if ($('#folderSelectCt').length === 0) {
                            $('<ul id="folderSelectCt" class="show_ul noti_show_ul" style="display: none;">').appendTo(document.body);
                            $('#folderSelectCt').on('click', 'a', function(e) {
                                var actionType = $(this).attr('actionType');
                                var incidentId = $(this).attr('incidentId');
                                /*if (actionType == '3' || actionType == '2') {
                                    EB_Common.dialog.confirm(
                                            'Are you sure you want to close this incident?',
                                            'Close Incident', function() {
                                        //operate
                                    });
                                }*/
                                switch (actionType) {
								case '1':
									window.location.href=EB_Common.Ajax.wrapperUrl("/incidents/incident/send/"+incidentId);
									break;
								case '2':
									EB_Common.dialog.confirm(
                                        i18n['incident.confirm.close'],i18n['global.threshold.delete.comfirmtitle'], function() {
                                            window.location.href=EB_Common.Ajax.wrapperUrl("/incidents/incident/closeWithSend/"+incidentId);
                                    });
									break;
								case '3':
									EB_Common.dialog.confirm(
                                        i18n['incident.confirm.close'],i18n['global.threshold.delete.comfirmtitle'],function() {
                                        	EB_Common.Ajax.put("/incidents/incident/closeWithoutSend/"+incidentId,null,function(data){
                            	                if(data.jsonStatus){
                            	                	$("#incidents_gridTable").jqGrid().trigger("reloadGrid");
                            	                	try {
                            	                		var str = me.advancedSearch_incidents.getConditions();
                            	                		me.updateStatusSummary("", str); //update numbers 
                            	                	} catch(e){
                            	                		var queryString = encodeURIComponent($("#searchName_incident").val());
	                                                    me.updateStatusSummary(queryString, "");
                            	                	}                            	                	
                            	                } else{
                            	                    EB_Common.dialog.alert(data.errMsg,null);
                            	                }
                            	                generating = false;
                            	            });
                                        });
									break;
								default:
									break;
								}
                                	
                                return false;
                            });
                        }

                        var el = $(this),
                            offset = el.offset(),
                            height = el.height(),
                            liTmpl = '';
                    
                        liTmpl += '<li class="nowrap"><a href="#" actionType="1" incidentId="'+ incidentId +'">' + i18n['incident.action.send'] + '</a></li>';
                        liTmpl += '<li class="nowrap"><a href="#" actionType="2" incidentId="'+ incidentId +'">' + i18n['incident.action.closesend'] + '</a></li>';
                        liTmpl += '<li class="nowrap"><a href="#" actionType="3" incidentId="'+ incidentId +'">' + i18n['incident.action.close'] + '</a></li>';
                        
                        var folderSelectCt = $('#folderSelectCt');
                            folderSelectCt.empty().append(liTmpl);
//                        var folderCtH = folderSelectCt.height();
//                        var top = offset.top + height + 5;
//                        if(offset.top + folderCtH > EB_Common.Element.getViewportHeight()){
//                            top = offset.top - folderCtH - height;
//                        }
                        folderSelectCt.css({left: 0, top: 0}).show();
                        folderSelectCt.position({
                             of:e ,
                             my:'left+10 top+10'
                        });
                        return false;
                    });
                    
                }
            });
            
            $("#searchIncidents").click(function(e) {
                e.preventDefault();
                me.quickSearchIncidents();
            });
            
            $("#searchName_incident").keyup(function(e) {            	
                e.preventDefault();
                if(e.keyCode==13) {
                	me.quickSearchIncidents();
                }               
            });
            $("#resetIncident").click(function(e) {
                e.preventDefault();
                $("#searchName_incident").val("");
                me.quickSearchIncidents();
            });
        },
        checkLiveTemplate:function(){
        	$("#add_incident").css("visibility","visible");
//        	EB_Common.Ajax.get("/incidents/template/hasLiveTemplates", null, function(data) {
//        		if(data==true) {
//        			$("#add_incident").css("visibility","visible");
//        		} else {
//        			$("#add_incident").css("visibility","hidden");
//        		}
//        	})
        },
        	
        //open{},close{} and all{}
        updateStatusSummary:function(quickString, advancedVals) {        	
        	var condition = {};
        	if (advancedVals!="") { //advanced search open
        		condition = {conditions: advancedVals};        		
        	} else { // quicksearch        		
        		condition = {queryString: quickString};
        	}
        	
        	EB_Common.Ajax.post("/incidents/incident/getIncidensNumber", condition, function(data) {
                if (data) {    
                	$("#spnNumOpen").text(data.Open);
                	$("#spnNumClosed").text(data.Closed);
                	$("#spnNumAll").text(data.All);  
                	if(advancedVals!="") {
                		$("#liOpen").css("display","none");
                		$("#liClosed").css("display","none");
                	} else {
                		$("#liOpen").css("display","");
                		$("#liClosed").css("display","");
                	}
                	
                } 
            });
        },
        quickSearchIncidents:function(){
       	 	var queryString = encodeURIComponent($("#searchName_incident").val());
            $("#incidents_gridTable").jqGrid('setGridParam', {postData: {queryString: queryString, conditions:''}, page: 1}).trigger("reloadGrid");
            this.updateStatusSummary(queryString, "");
        },
        loadIncidentTemplates: function(url, tmplId) {
           /* $('#add_template').show().siblings().hide();  */
            var id = tmplId.substring(0, tmplId.lastIndexOf('_'));
            var tab = $('#' + id);
            $('#tab_container').children().hide();
            if(tab.length > 0 ){
                tab.show();
                $('#templates_gridTable').jqGrid('resizeGrid');
                return;
            }
            $('#tab_container').append($('#' + tmplId).tmpl().attr('id', id));            
            function getValues(){
            	var dts = $("#initVariableTemplateBox .formitem"), formtItems = [];
            	dts.each(function(i,v) {
            		var key = $(v).attr("key"),value = $(v).val()||"";//$(v).html();
            		formtItems.push({"val":value,"variableName":key});
            	});
            	if (formtItems.length > 0) {
            		me.dataobj['bodyItems'] = formtItems;
            	}
            	
            	var texts = $("#initVariableMsessageBox .formitem");
            	texts.each(function(i,v){
            		var k = $(v).attr("key"),value = $(v).val()||$(v).html();
            		me.dataobj['' + k] = value;
            	});
            	var obj = me.dataobj;
            	obj.title = $.jgrid.htmlEncode(obj.title);
            	obj.premessage = $.jgrid.htmlEncode(obj.premessage);
            	obj.postmessage = $.jgrid.htmlEncode(obj.postmessage);
            	me.dataobj = obj;
            }
            
            //listener event
            $('#template_tabs a').click(function(e){
                var tab = $(this).attr('tab');
                $('#template_tabs a').removeClass('current');
                if(tab){
                    $(this).addClass('current');
                    $('#template_tabs_items').find('[tabName="' + tab + '"]').show().siblings().hide();
                    if(tab == "message") {
                    	getValues();                    	
                    	$("#initVariableMsessageBox").empty();
                    	$("#initVariableMsessageBox").append($("#incident_variables_message_tmpl").render(me.dataobj));
                    	
                    }
                }
                return false;
            });
            $('#templateTest').click(function(){
            	getValues();
            	var obj = me.dataobj;
            	obj.premessage = obj.premessage&&obj.premessage.replace(/\n/g, "<br />");
            	obj.postmessage = obj.postmessage&&obj.postmessage.replace(/\n/g, "<br />");
                var el = $($('#template_preview_tmpl').render(me.dataobj));
                EB_Common.dialog.dialog(el,{
                	title:i18n['button.new.test'],
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
            });
            var me = this;
            
            //init advanced search
            //var isAdvancedSearched = false;
            //var isFirstLoad = true;
            //var advancedTempSearch = null;
            $('#advanceSearch_templates').click(function(e) {
                if(!me.advancedTempSearch){
                	if(me.advancedSearch) {me.advancedSearch = null;}
                	me.advancedTempSearch = EB_View.contact.advancedSearchApp.getInstance({container:$('#ajax_advancedSearch_templates'),
                        showSavedAsRule:true,
                        autoOpen:true,
                        needForm:true,
                        showSavedAsRule:false,
                        url:EB_Common.Ajax.wrapperUrl("/incidents/template/getAdvancedSearchItems"),
                        callback:{
                            search:function(conditions,isFilterVal,filterName){                            	
                                $('#templates_gridTable').jqGrid('setGridParam',{datatype:'json',postData:{queryString:'',
                                    conditions:EB_Common.json.stringify(conditions)}}).trigger("reloadGrid");                               
                            },close:function(){
                            	me.quickSearchTemplates();
                            }}
                        }
                        );
                }else{
                    if(me.advancedTempSearch.isHidden()){
                    	me.advancedTempSearch.open();
                    }else{
                    	me.advancedTempSearch.close();
                    }
                }                
            });
            
            $('#templates_gridTable').jqGrid({
                url: url,
                datatype: 'json',
                mtype: 'POST',
                contentType: 'application/json',
                autoencode: false,
                emptyDataCaption: i18n['global.grid.emptyDataCaption'],
                jsonReader: {
                    root: 'data',
                    page: 'currentPageNo',
                    total: 'totalPageCount',
                    records: 'totalCount',
                    repeatitems: false
                },
                height: 'auto',
                autowidth: true,
                viewrecords: true,
                rowNum:	50,
                rowList: [25,50,75,100,200],
                pager: '#templates_gridPager',
                scrollOffset: 0,
                sortname:'name',
                sortorder:'asc',
                multiselect: true,
                multiselectWidth: 20,
                prmNames: {
                    page: 'pageNo',
                    totalrows: 'totalrows'
                },
                colNames: [i18n['contact.field.id'],
                    '',
                    '',
                    i18n['global.status'],
                    i18n['setting.topic.subscriptionFields.name'],
                    i18n['incidenttemplate.column.category']],
                colModel: [{
                        name: 'id',
                        index: 'id',
                        hidden: true
                    }, {name: 'id', index: 'id', width: 10, align: "left", sortable: false, formatter: function(value, rec, rowObject) {
                            var result = '<a class="icn_edit_16" title="' + i18n['button.update'] + '" name="gdTemplateUpdate" href="javascript:void(0);"  linkUrl="'+ me.pageContext +'/incidents/template?id=' + rowObject.id + '" recordId="' + rowObject.id + '"></a>';
                            return result;
                        }
                    },{name: 'id', index: 'id', width: 10, align: "left", sortable: false, formatter: function(value, rec, rowObject) {
                    var result = '<a class="icn_copy_16" title="' + i18n['button.copy'] + '" name="gdTemplateCopy"  href="javascript:void(0);" recordName="'+rowObject.name+'" recordId="' + rowObject.id + '"></a>';
                    return result;
                }
                }, {
                        name: 'incidentStatus',
                        index: 'incidentStatus',
                        width: 60,
                        align: "center",
                        sorttype: 'int',
                        formatter: function(val, rec, rowObject) {
                            retValue = '<span class="orangestatus">' + i18n['incidenttemplate.status.live'] + '</span>';
                            if (val == 'Draft')
                                retValue = '<span  class="deepgray">' + i18n['incidenttemplate.status.draft'] + '</span>';
                            return retValue;

                        }
                    }, {
                        name: 'name',
                        index: 'name',
                        width: 100,
                        formatter:function(val,rec,rowObject){
		                    return '<a name="gdTemplateView" recordId="'+rowObject.id+'"  href="javascript:void(0)">'+ val+'</a>';
		                }
                    }, {
                        name: 'incidentCategory.name',
                        index: 'incidentCategory.name',
                        sorttype: 'text',
                        width: 80,
                        formatter: function(val, rec, rowObject) {
                            //if(!val) return "---";
                            var val1 = ((!val)||val=="")?"---":$.jgrid.htmlEncode(val);
                            var retStr = '<a href="#" name="folderSelect" categoryId="'+rowObject.incidentCategory.id+'" class="b-incidents-normal"><span recordId="'+rowObject.id+'">' + val1 + '</span><i class="icon_gray_downarrow"></i></a>';
                            return retStr;
                        }

                    }],
                onSelectAll: function(aRowids, status) {
                    if (aRowids && aRowids.length > 0 && status) {
                        $('[name="deleteTemplates"]', '#' + id).removeAttr('disabled').removeClass('btn_disabled');
                        $('[name="deleteTemplates"] i', '#' + id).removeClass('icn_gray');
                    } else {
                        $('[name="deleteTemplates"]', '#' + id).attr('disabled', true).addClass('btn_disabled');
                        $('[name="deleteTemplates"] i', '#' + id).addClass('icn_gray');
                    }
                },
                onSelectRow: function(rowid, status) {
                    if (status) {
                        $('[name="deleteTemplates"]', '#' + id).removeAttr('disabled').removeClass('btn_disabled');
                        $('[name="deleteTemplates"] i', '#' + id).removeClass('icn_gray');
                    } else {
                        var selr = $('#templates_gridTable').jqGrid('getGridParam', 'selarrrow');
                        if (!selr || selr.length == 0) {
                            $('[name="deleteTemplates"]', '#' + id).attr('disabled', true).addClass('btn_disabled');
                            $('[name="deleteTemplates"] i', '#' + id).addClass('icn_gray');
                        }
                    }
                },
                initVariableTemplate:function(a){
                	var obj = {},b = a&&a.phaseTemplates&&a.phaseTemplates[0]&&a.phaseTemplates[0].formTemplate&&a.phaseTemplates[0].formTemplate,c = a&&a.phaseTemplates&&a.phaseTemplates[0]&&a.phaseTemplates[0].broadcastTemplate&&a.phaseTemplates&&a.phaseTemplates[0].broadcastTemplate.broadcastSettings&&a.phaseTemplates[0].broadcastTemplate.broadcastSettings;
                	obj.from =  $.jgrid.htmlEncode(c&&c.senderEmail||"");
                	$.each(c&&c.senderCallerInfos||[],function(i,v){
                		if (v.isDefault) obj.callerId = v.callerId;
                	});
                	obj.title = b&&b.subject||"";
                	obj.premessage = b&&b.preMessage||"";
                	obj.bodyItems = b&&b.formVariableItems||[];
                	obj.postmessage = b&&b.postMessage||"";
                	obj.title = $.jgrid.htmlEncode(obj.title);
                	obj.premessage = ($.jgrid.htmlEncode(obj.premessage)||"");
                	obj.postmessage = ($.jgrid.htmlEncode(obj.postmessage)||"");
                	
                	me.dataobj = obj;
                	obj.bodyItems.length&&obj.bodyItems.sort(function(a,b){
                		return (a.seq > b.seq)?1:-1;
                	});
                	//inputform
                	obj.bodyItems&&$.each(obj.bodyItems,function(i,v){
                		v.seq = i + 1;
                	});
                	$("#initVariableTemplateBox").empty();
                	$("#initVariableTemplateBox").append($("#variableTemplate").render(obj.bodyItems));
                	
                	$("#initVariableMsessageBox").empty();
                	$("#initVariableMsessageBox").append($("#incident_variables_message_tmpl").render(obj));
                },
                
                loadComplete: function(respData) {
                    if(respData.data && respData.data.length > 0){
                        $('#templates_grid').css('width','50%').show();
                        $('#template_edit_ct').show();
                    }else{
                        $('#templates_grid').css('width','100%').show();
                        $('#template_edit_ct').hide();
                        $('#templates_gridTable').jqGrid('resizeGrid');
                    }
                   
                },
                gridComplete: function() {
                	//action for click of template name links                
                	var t = this;
	            	$('[name="gdTemplateView"]', '#' + id).click(function(e){
	            		e.preventDefault();
	            		var el = $(this);
	            		var id=el.attr('recordId');

	            		EB_Common.Ajax.ajax({
	    		        	url:EB_Common.Ajax.wrapperUrl("/incidents/template/")+id+"?ignoreadditional=1",
	    		        	type: "get",
	    		        	dataType: "json",	    		        	
	    			        success:function(data) {
	    			        	tmpjsonData = data;
	    			        	$("#lbl_templatename").text(tmpjsonData.name);
	    			        	$("#lbl_createOn").text(tmpjsonData.strCreatedDate);
	    			        	$("#lbl_updateOn").text(tmpjsonData.strLastModifiedDate);
	    			        	$("#lbl_updateBy").text(tmpjsonData.lastModifiedName);
	    			        	$("#lbl_status").text(i18n['incidenttemplate.status.'+tmpjsonData.incidentStatus.toLowerCase()]);
	    			        	if(tmpjsonData.incidentStatus == "Live") {
	    			        		$("#lbl_status").removeClass("deepgray");
	    			        		$("#lbl_status").addClass("orangestatus");
	    			        	} else {
	    			        		$("#lbl_status").removeClass("orangestatus");
	    			        		$("#lbl_status").addClass("deepgray");
	    			        	}
	    			        	$("#btn_changeStatus").text(i18n['button.new.'+tmpjsonData.incidentStatus.toLowerCase()]);
	    			        	//update className to hover
	    			        	//faild??? ;-(
	    			        	$("#"+id).className="ui-state-hover";
	    			        	t.p.initVariableTemplate(tmpjsonData);
	    			        	
	    			        }});
	            	});//.eq(0).click();
	            	//click update
	            	$('[name="gdTemplateUpdate"]', '#' + id).click(function(e){
	            		e.preventDefault();
	            		var el = $(this);
	            		var id=el.attr('recordId');
	            		var name = el.attr("recordName");
	            		EB_Common.Ajax.get("/incidents/template/isExist", {"templateId":id},function(data){
		                      if(data == true){
		                    	  window.location.href = el.attr("linkUrl");
		                      } else {
		                    	  EB_Common.dialog.alert(i18n['setting.error.resource.notExists'], null); 
		                      }
		                  },"json");

	            	});
	            	
	            	//click copy
	            	$('[name="gdTemplateCopy"]', '#' + id).click(function(e){
	            		e.preventDefault();
	            		var el = $(this);
	            		var id=el.attr('recordId');
	            		var name = el.attr("recordName");
	            		EB_Common.Ajax.get("/incidents/template/isExist", {"templateId":id},function(data){
		                      if(data == true){
		                    	  me.copyIncidentTemplate(id,name);
		                      } else {
		                    	  EB_Common.dialog.alert(i18n['setting.error.resource.notExists'], null); 
		                      }
		                  },"json");

	            	});

                    $('[name="folderSelect"]', '#' + id).click(function(e) {
                        //create folderSelectCt and init event
                        if($('#folderSelectCt').length == 0){
                             $('<ul id="folderSelectCt" class="show_ul noti_show_ul" style="display: none;height: 270px;overflow: auto;">').appendTo(document.body);
                             $('#folderSelectCt').on('click', 'a', function(e) {
                                var el = $(this),
                                    ul = el.closest('ul'),
                                    id = $('#folderSelectCt').attr('recordId');

                                if (el.attr('manage')) {
                                    me.loadManageCategories(ul);
                                } else {
                                    var categoryId = el.attr("categoryId");
                                    if (categoryId) {
                                        EB_Common.Ajax.ajax({
                                            url: EB_Common.Ajax.wrapperUrl("/incidents/template/updateCategory"),
                                            type: "POST",
                                            dataType: "json",
                                            data: {"template_id": id, "category_id": categoryId},
                                            success: function(data) {
                                                tmpjsonData = {};
                                                var queryString = encodeURIComponent($("#searchName_template").val());
                                                $("#templates_gridTable").jqGrid('setGridParam', {postData: {queryString: queryString}, page: 1}).trigger("reloadGrid");
                                            }});
                                        //folderSelect.text(text);
                                    }
                                }
                                ul.hide();
                                return false;
                            });
                        }

                        var el = $(this),
                            offset = el.offset(),
                            height = el.height(),
                            selCategoryId = el.attr("categoryId"),
                            recordId = el.children('span').attr('recordId');
                        $('#folderSelectCt').hide().attr('recordId', recordId);
                        EB_Common.Ajax.ajax({
                            url: EB_Common.Ajax.wrapperUrl("/incidents/category/list"),
                            type: "GET",
                            dataType: "json",
                            async: false,
                            success: function(data) {
                                var liTmpl = "";
                                var ctId, ctName, title;
                                for (var i = 0; i < data.length; i++) {
                                    ctId = data[i].id;
                                    ctName = data[i].name;
                                    if(ctName.length > 30){
                                        title = ctName;
                                        ctName = ctName.substring(0, 20) + '...';
                                    }else{
                                        title = null;
                                    }
                                    if (ctId != selCategoryId) {
                                        liTmpl += '<li class="nowrap"><a href="#" categoryId="' + ctId + '"' + (title ? 'title="' + title + '"': '') + '>' + ctName + '</a></li>';
                                    }
                                }
                                if (selCategoryId != -1) {
                                    liTmpl += '<li class="nowrap"><a class="manage" href="#" categoryId="-1">' + i18n['incidenttemplate.category.nocategory'] + '</a></li>';
                                }
                                liTmpl += '<li class="nowrap"><a class="manage" manage="true" href="#">' + i18n['incidenttemplate.category.Manage'] + '</a></li>';

                                var folderSelectCt = $('#folderSelectCt');
                                folderSelectCt.empty().append(liTmpl);
                                var folderCtH = folderSelectCt.height();
                                var top = offset.top + height + 5;
                                if(offset.top + folderCtH > EB_Common.Element.getViewportHeight()){
                                    top = offset.top - folderCtH - height;
                                }
                                folderSelectCt.css({left: offset.left, top: top}).show();
                            }});
                        return false;
                    });

                  //click the first row when load complete
	            	var anArr = $('[name="gdTemplateView"]');
	            	if(anArr.length>0) {
	            		$(anArr[0]).click();
	            	}
	            	me.checkLiveTemplate();

                }

            });

            var tmpjsonData={};
			$("#btn_changeStatus").click(function(e){
	            e.preventDefault();
	            if (tmpjsonData==null)
	            	return;
	        	var id=tmpjsonData.id;
	        	var status = (tmpjsonData.incidentStatus=="Draft")?"Live":"Draft";
        		EB_Common.Ajax.ajax({
		        	url:EB_Common.Ajax.wrapperUrl("/incidents/template/updateStatus"),
		        	type: "GET",
		        	dataType: "json",
		        	data:{"id":id,"status":status},
		        	async:false,
			        success:function(data) {
			        	 me.checkLiveTemplate();
			        	 tmpjsonData={};
			        	 var queryString=encodeURIComponent($("#searchName_template").val());
				         $("#templates_gridTable").jqGrid('setGridParam',{postData:{queryString:queryString},page:1}).trigger("reloadGrid");
				         
			        }});

	        });
			
            $("#searchTemplate").click(function(e) {
                e.preventDefault();
                me.quickSearchTemplates();
            });
            
            $("#searchName_template").keyup(function(e) {            	
                e.preventDefault();
                if(e.keyCode==13) {
                	me.quickSearchTemplates();
                }               
            });


            $("#resetTemplate").click(function(e) {
                e.preventDefault();
                $("#searchName_template").val("");
                me.quickSearchTemplates();
            });

            $('[name="deleteTemplates"]', '#' + id).click(function(e) {
            	 e.preventDefault();
            	if ($(this).hasClass('btn_disabled')) {
                    return;
                }
            	   var selr = $('#templates_gridTable').jqGrid('getGridParam', 'selarrrow');
                   if (selr.length == 0) {
                       return false;
                   }

               	EB_Common.Ajax.ajax({
		        	url:EB_Common.Ajax.wrapperUrl("/incidents/template/checkReference"),
		        	type: "POST",
		        	data:{"ids":selr},
		        	async:false,
			        success:function(data) {
			        	//no open incidents are using candidate templates, we can remove it.
			        	 if(data.status) {
			        		 var queryString=encodeURIComponent($("#searchName_template").val());
			        		 EB_Common.dialog.confirm(i18n['incidenttemplate.delete.confirm'],i18n['global.threshold.delete.comfirmtitle'],function() {
			        			 EB_Common.Ajax.remove('/incidents/template/delete?version=' + new Date().getMilliseconds() + Math.random(), {ids: selr}, function() {
			        				 $("#templates_gridTable").jqGrid('setGridParam',{postData:{queryString:queryString},page:1}).trigger("reloadGrid");
                               }, null, 'json');
                               $(this).dialog("close");
                           }, function() {
                        	   	return;
                           	 }
			                 );			                
			        	 }
			        	 else {
			        		 var messgeInfo = data.messageInfo,msg,msgDiv = $("<div />");
			        		 $.each(messgeInfo, function(i,v){
			        			 $("<div />").append($("<hr />")).append($("<div />").html(i + ":")).append($("<div />").html(v+"").css("margin-left", "20px")).appendTo(msgDiv);
			        		 });
			        		 EB_Common.dialog.alert(i18n['incidenttemplate.delete.checkreference']+"<br/>"+msgDiv.html(),null,null);
			        	 }

			        }});

            });

        },
        quickSearchTemplates:function(){
        	 var queryString = encodeURIComponent($("#searchName_template").val());
             $("#templates_gridTable").jqGrid('setGridParam', {postData: {conditions:"", queryString: queryString}, page: 1}).trigger("reloadGrid");
        },
        //copy Incident Template
        copyIncidentTemplate: function(id,name) {
            var self = this,isAdding = false;
            $("#templateName").removeData("previousValue");
            $("label.error").remove();
            $(".error").removeClass("error");
            if (!this.incidentTemplateOpen) {
                EB_Common.dialog.dialog('div_incidentTemplate_copy', {
                    autoOpen: false,
                    height: 200,
                    width: 430,
                    buttons : {
                        Ok : {
                            click : function() {
                            	if ($("#form_incidentTemplate_copy").valid()) {
                                    $("#form_incidentTemplate_copy").submit();
                                }
                            },
                            'class' : 'orange',
                            text : i18n['global.dialog.button.ok']
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

                this.incidentTemplateOpen = true;
                EB_Common.validation.validate("form_incidentTemplate_copy", {
                	onkeyup: false,
                    rules: {
                        name: {
                            remote: {
                                url: EB_Common.Ajax.wrapperUrl("/incidents/template/checkTemplateName"),
                                type: "get",
                                data: {
                                    id: function() {
                                        return -1;//$("#incidentTemplate_id").val();
                                    },
                                    name: function() {
                                        return $("#templateName").val();
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
                    submitHandler: function(form) {
                    	if (isAdding) return;
                    	isAdding = true;
                        var options = {
                            url: EB_Common.Ajax.wrapperUrl("/incidents/template/copy"),
                            type: 'POST',
                            dataType: 'json',
                            success: function(data) {
                            	isAdding = false;
                            	$("#div_incidentTemplate_copy").dialog("close");
                                $("#templates_gridTable").trigger("reloadGrid");
                            },
                            failure: function(data) {
                            	isAdding = false;
                                console.info(data);
                            }
                        };

                        $('#form_incidentTemplate_copy').ajaxSubmit(options);
                    }
                });
            };

            $('#div_incidentTemplate_copy').dialog('open');

            var title = '', jsonData = {};
            title = ' ' + i18n['incidenttemplate.copy.title'];
            jsonData.id = id;
            jsonData.name = name + "-" + i18n['button.new.copy'];

            $("#div_incidentTemplate_copy").dialog("option", "title", title);
            this.initIncidentTemplateName(jsonData);
        },

        initIncidentTemplateName: function(values) {
            var me = this;
            $('#templateName').val(values.name);
            $('#originalId').val(values.id);
        },

        loadIncidentVariables: function(url, tmplId) {
           /* $('#add_variable').show().siblings().hide();   */
            var id = tmplId.substring(0, tmplId.lastIndexOf('_'));
            var tab = $('#' + id);
            $('#tab_container').children().hide();
            if(tab.length > 0 ){
                tab.show();
                $("#variables_gridTable").jqGrid('resizeGrid');
                return;
            }
            $('#tab_container').append($('#' + tmplId).tmpl().attr('id', id));

            var me = this;
            $("#variables_gridTable").jqGrid({
                url: url,
                datatype: 'json',
                mtype: 'get',
                contentType: 'application/json',
                autoencode: false,
                emptyDataCaption: i18n['global.grid.emptyDataCaption'],
                jsonReader: {
                    root: 'data',
                    page: 'currentPageNo',
                    total: 'totalPageCount',
                    records: 'totalCount',
                    repeatitems: false
                },
                height: 'auto',
                autowidth: true,
                viewrecords: true,
                pager: '#variables_gridPager',
                scrollOffset: 0,
                sortname:'name',
                sortorder:'asc',
                multiselect: true,
                multiselectWidth: 20,
                prmNames: {
                    page: 'pageNo',
                    totalrows: 'totalrows'
                },
                colNames: [i18n['contact.field.id'],
                    '',
                    '',
                    i18n['setting.topic.subscriptionFields.name'],
                    i18n['variable.type'],
                    i18n['variable.options']],
                colModel: [{
                        name: 'id',
                        index: 'id',
                        hidden: true
                    }, {name: 'id', index: 'id', width: 10, align: "left", sortable: false, formatter: function(value, rec, rowObject) {
                            var result = '<a class="icn_edit_16 edit_record" title="' + i18n['button.update'] + '"  href="#" recordId="' + rowObject.id + '"></a>';
                            return result;
                        }
                    }, {name: 'id', index: 'id', width: 10, align: "left", sortable: false, formatter: function(value, rec, rowObject) {
                    var result ='<a class="icn_copy_16 copy_record" title="' + i18n['button.copy'] + '"  href="#" recordId="' + rowObject.id + '"></a>';
                    return result;
                }
                }, {
                        name: 'name',
                        index: 'name',
                        align:'left',
                        width: 130,
                        formatter: function(value, options, rowObject) {
                        	return $.jgrid.htmlEncode(value);
                        }
                    }, {
                        name: 'varType',
                        index: 'varType',
                        width: 100,
                        formatter: function(value, options, rowObject) {
                            switch (value) {
                                case "Single":
                                    return i18n['variable.type.singleselection'];
                                case "Multiple":
                                    return i18n['variable.type.multiselection'];
                                case "Textbox":
                                    return i18n['variable.type.textbox'];
                                case "Textarea":
                                    return i18n['variable.type.textarea'];
                                case "Date":
                                    return i18n['variable.type.Date'];
                                default:
                                    return '';
                            }

                        }
                    }, {
                        name: 'variableOptions',
                        index: 'variableOptions',
                        formatter: function(value, options, rowObject) {
                            if (value == null) {
                                return '--';
                            } else {
                                var length = value.length;
                                var display = '';
                                for (var index = 0; index < length; index++) {
                                    var option = value[index];
                                    display += $.jgrid.htmlEncode(option.val) + '<br>';
                                }
                                return display;
                            }

                        },
                        width: 80
                    }],
                loadComplete: function(data) {
                    $('a.edit_record', '#' + id).click(function(e) {
                        e.preventDefault();
                        me.createOrUpdateVariable('update', $(this).attr('recordId'));
                    });
                    $('a.copy_record', '#' + id).click(function(e) {
                        e.preventDefault();
                        me.createOrUpdateVariable('copy', $(this).attr('recordId'));
                    });
                },
                onSelectAll: function(aRowids, status) {
                    if (aRowids && aRowids.length > 0 && status) {
                        $('[name="deleteVariable"]', '#' + id).removeAttr('disabled').removeClass('btn_disabled');
                        $('[name="deleteVariable"] i', '#' + id).removeClass('icn_gray');
                    } else {
                        $('[name="deleteVariable"]', '#' + id).attr('disabled', true).addClass('btn_disabled');
                        $('[name="deleteVariable"] i', '#' + id).addClass('icn_gray');
                    }
                },
                onSelectRow: function(rowid, status) {
                    if (status) {
                        $('[name="deleteVariable"]', '#' + id).removeAttr('disabled').removeClass('btn_disabled');
                        $('[name="deleteVariable"] i', '#' + id).removeClass('icn_gray');
                    } else {
                        var selr = $('#variables_gridTable').jqGrid('getGridParam', 'selarrrow');
                        if (!selr || selr.length == 0) {
                            $('[name="deleteVariable"]', '#' + id).attr('disabled', true).addClass('btn_disabled');
                            $('[name="deleteVariable"] i', '#' + id).addClass('icn_gray');
                        }
                    }
                }
            });

            $("#searchVariable").click(function(e) {
                e.preventDefault();
                me.quickSearchVariable();
            });
            $("#searchName").keyup(function(e) {
            	 e.preventDefault();
            	 if(e.keyCode==13)
            		 me.quickSearchVariable();
            });
            //create variable
            $('#add_variable').click(function(e) {
                e.preventDefault();
                me.createOrUpdateVariable('create');
            });
            $('[name="deleteVariable"]', '#' + id).click(function(e) {
                if ($(this).hasClass('btn_disabled')) {
                    return;
                }
                var selr = $('#variables_gridTable').jqGrid('getGridParam', 'selarrrow'),msg = "";
                if (selr.length == 0) {
                    return false;
                } 
                EB_Common.dialog.confirm(i18n["incident.informationvariables.deleteMsg"], null, 
                        function() {
                            EB_Common.Ajax.remove('/incidents/variableItem/delete?version=' + new Date().getMilliseconds() + Math.random(), {ids: selr}, function() {
                                $("#variables_gridTable").trigger("reloadGrid");
                            }, null, 'text');
                            $(this).dialog("close");
                        }, function() {
                        	return;
                        }
                );
            });

        },
        quickSearchVariable:function(){
        	 var queryString = encodeURIComponent($("#searchName").val());
             $("#variables_gridTable").jqGrid('setGridParam', {postData: {queryString: queryString}, page: 1}).trigger("reloadGrid");
        },
        //create update copy variable
        createOrUpdateVariable: function(type, id) {
            var self = this,isAdding = false;
            if (type == 'update') {
                this.variableUrl = EB_Common.Ajax.wrapperUrl("/incidents/variableItem/update") + "?_method=PUT";
            } else {
                this.variableUrl = EB_Common.Ajax.wrapperUrl("/incidents/variableItem/create");
            }
            $("#name").removeData("previousValue");
            $("label.error").remove();
            $(".error").removeClass("error");
            if (!this.variableOpen) {
                EB_Common.dialog.dialog('form_variables_tmpl', {
                    autoOpen: false,
                    width : 430,
                    height: 'auto',
                    buttons : {
                        Ok : {
                            click : function() {
                            	if ($("#form_variables").valid()) {
                                    $("#form_variables").submit();
                                }
                            },
                            'class' : 'orange',
                            text : i18n['global.dialog.button.ok']
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

                this.initVariableEvent();
                this.variableOpen = true;
                EB_Common.validation.validate("form_variables", {
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
                    submitHandler: function(form) {
                    	if (isAdding)return;
                    	isAdding = true;
                        var options = {
                            url: self.variableUrl,
                            type: 'POST',
                            dataType: 'json',
                            success: function(data) {
                                if (data) {
                                	$("#form_variables_tmpl").dialog("close");
                                	$("#variables_gridTable").trigger("reloadGrid");
                                } else {
                                	EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],null,null);
                                }
                                isAdding = false;
                            },
                            failure: function(data) {
                                console.info(data);
                                isAdding = false;
                            }
                        };
                        var reg = new RegExp("\\[x\\]", "gm");
                        $("#itemsContainer > li").each(function(n) {
                            $(this).find("input,select").each(function(i) {
                                var name = $(this).attr("name");
                                if (name) {
                                    if ($.browser.msie && ($.browser.version == "7.0"))   //is IE?
                                    {
                                        var dom1 = $(this)[0];
                                        dom1.name = name.replace(reg, "[" + n + "]");

                                    } else {
                                        $(this).attr("name", name.replace(reg, "[" + n + "]"));
                                    }
                                }
                            });
                        });
                        $('#form_variables').ajaxSubmit(options);
                    }
                });
            }
            var title = '',
                    jsonData = {};
            if (type == 'create') {
                title = i18n['incident.informationvariables.new'];
                jsonData.id = -1;
                $('#form_variables_tmpl').dialog('open');
                $("#form_variables_tmpl").dialog("option", "title", title);
                this.initVariableValue(jsonData, type);
            } else {
            	t = this;
                EB_Common.Ajax.ajax({
                    url: EB_Common.Ajax.wrapperUrl("/incidents/variableItem/") + id,
                    type: "get",
                    dataType: "json",
                    async: false,
                    success: function(data) {
                        if (data.success) {
                        	jsonData = data.item;
                        	if (type == 'update') {
                                title = i18n['incident.informationvariables.edit'];
                            } else {
                                title = i18n['incident.informationvariables.copy'];
                                jsonData.name = "Copy of " + jsonData.name;
                                jsonData.id = -1;
                            }
                        	title += ' ' + i18n['incident.informationvariable'];
                        	$('#form_variables_tmpl').dialog('open');
                            $("#form_variables_tmpl").dialog("option", "title", title);
                            t.initVariableValue(jsonData, type);
                        } else {
                        	EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],null,null);
                        }
                    }
                });
            }
        },
        variableTemplate: {
            singleFieldItemTmpl: '<li><input class="margin5_R" type="radio" name="variableOptions[x].isSelected"><input type="text" name="variableOptions[x].val" class="{required:true}" maxlength="50" style="width:331px;"/>'
                    + '<a title="' + i18n['button.delete'] + '" href="javascript:void(0);" style="display:none;" class="icn_trash_16"></a></li>',
            multiFieldItemTmpl: '<li><input class="margin5_R" type="checkbox" name="variableOptions[x].isSelected"><input type="text" name="variableOptions[x].val" class="{required:true}" maxlength="50" style="width:331px;"/>'
                    + '<a title="' + i18n['button.delete'] + '" href="javascript:void(0);" style="display:none;" class="icn_trash_16"></a></li>',
            textareaTmpl: '<li><select name="rows" class="input_long"><option value="2">' + i18n['variable.options.short'] + '</option><option value="5">' + i18n['variable.options.medium'] + '</option><option  value="10">' + i18n['variable.options.long'] + '</option></select></li>',
            dateTmpl: '<li><select name="formatter" class="input_long"><option value="mm-dd-yy">' + i18n['variable.date.format1'] + '</option><option value="mm-dd-yy hh:mm:ss">' + i18n['variable.date.format2'] + '</option></select></li>'

        },
        initVariableValue: function(values, type) {
            var variableType = values.varType,
                    me = this,
                    itemsContainer = $('#itemsContainer');
            $('#variableType').val(variableType || 'Single').change();
            $('#variableType').attr("disabled", false);

            $('#name').val(values.name);
            $('#tooltip').val(values.tooltip);
            $('#variableItemId').val(values.id);

            var options = values.variableOptions;
            $('#optionLable').show();
            if (variableType == 'Single') {
                if (options == null) {
                    return;
                }
                itemsContainer.empty().show();
                $('#addItems').show();
                var length = options.length;
                for (var index = 0; index < options.length; index++) {
                    var option = options[index];
                    var li = $(me.variableTemplate.singleFieldItemTmpl);
                    li.find("input[type='radio']").attr("checked", option.isSelected);
                    li.find("input[type='text']").val(option.val);
                    itemsContainer.append(li);
                }
                this.showItemDelBtn();
            } else if (variableType == 'Multiple') {
                if (options == null) {
                    return;
                }
                itemsContainer.empty().show();
                $('#addItems').show();
                var length = options.length;
                for (var index = 0; index < options.length; index++) {
                    var option = options[index];
                    var li = $(me.variableTemplate.multiFieldItemTmpl);
                    li.find("input[type='checkbox']").attr("checked", option.isSelected);
                    li.find("input[type='text']").val(option.val);
                    itemsContainer.append(li);
                }
                this.showItemDelBtn();
            } else if (variableType == 'Textarea') {
                var option = values.extProperties;
                if (option == null) {
                    return;
                }
                itemsContainer.empty().show();
                $('#addItems').hide();
                var li = $(me.variableTemplate.textareaTmpl);
                li.find("select").val(option.rows);
                itemsContainer.append(li);
            } else if (variableType == 'Textbox') {
                $('#addItems').hide();
                itemsContainer.hide();
                $('#optionLable').hide();
            } else {
                var option = values.extProperties;
                if (option == null) {
                    return;
                }
                $('#addItems').hide();
                var li = $(me.variableTemplate.dateTmpl);
                li.find("select").val(option.formatter);
                itemsContainer.empty().show().append(li);
            }
        },
        showItemDelBtn: function() {
            var containerItems = $('#itemsContainer'),varialbeType = containerItems.attr("variableType"), length = varialbeType == "single" ? 1 : 2;
            if (containerItems.children('li').length == length) {
                containerItems.find('a.icn_trash_16').hide();
            } else {
                containerItems.find('a.icn_trash_16').show();
            }
        },
        initVariableEvent: function() {
            var me = this;

            $('#variableType').change(function(e) {
                var value = $(this).val();
                $('#itemsContainer').empty();
                $('#optionLable').show();
                if (value == 'Single') {
                    $('#addItems').show();
                    $('#itemsContainer').show().append(me.variableTemplate.singleFieldItemTmpl).attr("variableType", "single");//Default with one option inputs.
                    $('#itemsContainer').on('click', 'a.icn_trash_16', function(e) {
                        $(this).closest('li').remove();
                        me.showItemDelBtn();
                    });
                } else if (value == 'Multiple') {
                    $('#addItems').show();
                    $('#itemsContainer').show().append(me.variableTemplate.multiFieldItemTmpl).append(me.variableTemplate.multiFieldItemTmpl).attr("variableType", "multiple");//Default with two option inputs.
                    $('#itemsContainer').on('click', 'a.icn_trash_16', function(e) {
                        $(this).closest('li').remove();
                        me.showItemDelBtn();
                    });
                } else if (value == 'Textarea') {
                    $('#addItems').hide();
                    $('#itemsContainer').show().append(me.variableTemplate.textareaTmpl);
                } else if (value == 'Textbox') {
                    $('#addItems').hide();
                    $('#itemsContainer').hide();
                    $('#optionLable').hide();
                } else {
                    $('#addItems').hide();
                    $('#itemsContainer').show().append(me.variableTemplate.dateTmpl);
                }

                var inputs = $('#itemsContainer input[type="text"]');
                if (inputs.length > 0) {
                    inputs.rules('add', {
                        itemsduplicate: true
                    });
                }
            });
            
            $("#itemsContainer").on("click", 'input[type="radio"]',function(e){
            	e.stopPropagation();
            	if($(this).val()==1){  
            		$(this).attr("value","0");  
            		$(this).removeAttr("checked");  
            	} else {  
            		$(this).val("1");  
            		$(this).attr("checked","checked");  
            	}   
            });

            $('#addItems').click(function(e) {
                var fieldItemTmpl;
                if ($('#variableType').val() == 'Single') {
                    fieldItemTmpl = me.variableTemplate.singleFieldItemTmpl;
                } else {
                    fieldItemTmpl = me.variableTemplate.multiFieldItemTmpl;
                }
                $(fieldItemTmpl).appendTo('#itemsContainer');
                me.showItemDelBtn();
            });
        },
                
        loadManageCategories: function(ct) {
            var me = this;
            if (!this.manageCategories) {
                var el = $('<div id="manageCategories"/>').appendTo(document.body);
                $('#manageCategoriesForm').appendTo(el).show();
                EB_Common.dialog.dialog('manageCategories', {
                    title: i18n['manage.category.manage'],
                    autoOpen: false,
                    buttons: {
                        Ok: {
                            click: function() {
                               $(this).dialog("close");
                            },
                            'class': 'orange',
                            text: i18n['manage.phase.close']
                        }},
                    close : function(){
                        $('#categorieList').empty();
                        $('#addCategoryCt').hide();
                        $('#addCategoryBtnCt').show();
                        me.categoriesEditable = true;
                    }
                });

                 // init manageCategoriesForm
                var isAdding = false;
                EB_Common.validation.validate('manageCategoriesForm', {
                    	onkeyup: false,
                        rules: {
                        	newcategory: {
                                remote: {
                                    url: EB_Common.Ajax.wrapperUrl("/incidents/category/checkCategoryName"),
                                    type: "POST",
                                    data: {
                                        id: function() {
                                            return -1;
                                        },
                                        name: function() {
                                            return $("#newcategory").val();
                                        }
                                    }
                                }
                            },
                            category: {
                                remote: {
                                    url: EB_Common.Ajax.wrapperUrl("/incidents/category/checkCategoryName"),
                                    type: "POST",
                                    data: {
                                        id: function() {
                                            return window['currentDategory'].attr('categoryid');
                                        },
                                        name: function() {
                                            return window['currentDategory'].val();
                                        }
                                    }
                                }
                            }
                        },
                        messages: {
                        	newcategory: {
                                remote: i18n['setting.error.region.duplicatedName']
                            },
                            category: {
                                remote: i18n['setting.error.region.duplicatedName']
                            }
                        },
                        submitHandler:function(){
                        	if (isAdding) return;
                            if($('#manageCategoriesForm').valid()){
                                var newinputs = $('input[name="newcategory"]');
                                if (!newinputs || newinputs.length == 0)
                                	return;
                                var jsonstr = '';
                                for (var i = 0; i < newinputs.length; i++) {
                                	if (jsonstr == '')
                                		jsonstr += '{"id":-1,"name":"' + encodeURIComponent(   $.trim( $(newinputs[i]).attr("value")  )  ) + '"}';
                                	else
                                		jsonstr += ',{"id":-1,"name":"' + encodeURIComponent( encodeURIComponent($.trim($(newinputs[i]).attr("value")))  ) + '"}';
                                }
                                if (jsonstr != "")
                                	jsonstr = '[' + jsonstr + ']';
                                isAdding = true;
                                if (jsonstr != "") {
                                	EB_Common.Ajax.post(EB_Common.Ajax.wrapperUrl("/incidents/category/batchcreate"), {incidentCategoryJson: jsonstr}, function(data) {
                                		newinputs.val('');
                                		//$('#addCategoryCt').hide();
                                		//me.listAllCategories();
                                		var liTmpl = "";
                                		$("#newcategory").removeData("previousValue");
                                		var ctId, ctName;
                                		for (i = 0; i < data.length; i++) {
                                			ctId = data[i].id;
                                			ctName = data[i].name;
                                			liTmpl += '<li class="clearfix">\n\
                                				<span class="left"><input type="text" name="category" maxlength="80" class="{required : true}" categoryid="' + ctId + '" style="display:none;"/> \n\
                                				<span class="margin5-R input-label">' + ctName + '</span></span>\n\
                                				<div class="right"><a option="edit" title="' + i18n['button.edit'] + '" href="#" class="icn_edit_16"></a>\n\
                                				<a style="display:none;" option="Save" title="' + i18n['button.save'] + '" class="icn_save_16" href="#"></a>\n\
                                				<a style="display:none;" option="Cancel"  title="' + i18n['button.cancel'] + '" class="icn_cancel_16" href="#"></a> \n\
                                				<a option="Remove" title="' + i18n['button.remove'] + '" class="icn_trash_16" href="#"></a></div> \n\
                                				</li>';
                                		}
                                		$('#categorieList').prepend(liTmpl);
                                		isAdding = false;
                                	}, "json");
                                }
                            }
                        }
                });
                
                //Edit Category
                $('#categorieList').on('click', 'a.icn_edit_16', function(e) {
                    e.preventDefault();
                    var el = $(e.target),
                        lis = el.closest('ul').children();
                    for (var i = 0, len = lis.length; i < len; i++) {
                        if ($(lis[i]).data('categoriesEditable') === false) {
                            return;
                        }
                    }
                    var li = el.closest('li'),
                        textEl = li.find('span.input-label'),
                        cancelEl = li.find('a.icn_cancel_16'),
                        saveEl = li.find('a.icn_save_16'),
                        inputEl = li.find('input[name="category"]');

                    el.hide();
                    inputEl.show().val(textEl.text());
                    cancelEl.show();
                    saveEl.show();
                    textEl.hide();
                    li.data('categoriesEditable', false);
                    
                    window['currentDategory'] = inputEl;
                });
                //Cancel Category
                $('#categorieList').on('click', 'a.icn_cancel_16', function(e) {
                    e.preventDefault();
                    var el = $(e.target),
                        li = el.closest('li'),
                        textEl = li.find('span.input-label'),
                        editEl = li.find('a.icn_edit_16'),
                        saveEl = li.find('a.icn_save_16'),
                        inputEl = li.find('input[name="category"]');
                    el.hide();
                    inputEl.val(textEl.text()).hide().valid();
                    editEl.show();
                    saveEl.hide();
                    textEl.show();
                    li.removeData('categoriesEditable');
                });
                
                //Save Category
                $('#categorieList').on('click', 'a.icn_save_16', function(e) {
                    e.preventDefault();
                    var el = $(e.target),
                        li = el.closest('li'),
                        textEl = li.find('span.input-label'),
                        editEl = li.find('a.icn_edit_16'),
                        cancelEl = li.find('a.icn_cancel_16'),
                        inputEl = li.find('input[name="category"]');
                        
                    if(!inputEl.valid()){
                        return;
                    }
                    var categoryId = inputEl.attr("categoryid");
                    var categoryName = $.trim(inputEl.val());
                    if(!categoryId) return;
                    if(categoryName=="") return;
                    EB_Common.Ajax.ajax({
                        url:EB_Common.Ajax.wrapperUrl("/incidents/category/update"),
                        type: "post",
                        dataType: "json",
                        data:{"id":categoryId,"name":categoryName},
                        success:function(data) {
                                el.hide();
                                inputEl.hide();
                                editEl.show();
                                cancelEl.hide();
                                textEl.text(inputEl.val()).show();
                                li.removeData('categoriesEditable');
                                $("#templates_gridTable").trigger("reloadGrid");
                                //$('#manageCategoriesForm').valid();
                    }});

                });
 
                //Delete Category
                $('#manageCategoriesForm').on('click', 'a.icn_trash_16', function(e) {
                    e.preventDefault();
                    var el = $(e.target),
                        li = el.closest('li'),
                        inputEl = li.find('input[name="category"]');
                        //remote = el.attr('remote'),
                        categoryId = inputEl.attr("categoryid"),
                        ids = [categoryId];
//                    if(remote === 'false'){
//                        var li = el.parent();
//                        var lis = li.siblings();
//                        li.remove();
//                        lis.each(function(index, element){
//                            $(element).find('.icn_trash_16')[lis.length > 1 ?  'show' : 'hide']();
//                        });
//                        $('#manageCategoriesForm').valid();
//                        return;
//                    }
                    if (ids.length > 0) {
                        EB_Common.dialog.confirm(i18n["incidenttemplate.delcategory.message"], null, function() {
                            EB_Common.Ajax.remove('/incidents/category/delete?version=' + new Date().getMilliseconds() + Math.random(), {ids: ids}, function() {
                                //me.listAllCategories();
                                li.remove();
                                $("#templates_gridTable").trigger("reloadGrid");
                                //$('#manageCategoriesForm').valid();
                            }, null, 'json');
                            $(this).dialog("close");
                        }, function() {
                            return;
                        }
                        );
                    }
                });
                
                $('#manageCategories a[name="addCategory"]').click(function(e) {
                    e.preventDefault();
                    $('#itemsContainer_add input[name="newcategory"]').val('');
                    $('#addCategoryCt').show();
                    $(this).parent().hide();
                });
                
                
                $('#addCategorySubmit').click(function(e){
                	$('#addCategorySubmit').submit();
                });
                
                $('#addCategoryCancel').click(function(){
                    $('#addCategoryCt').hide();
                    $('#manageCategories a[name="addCategory"]').parent().show();
                });
                this.manageCategories = true;
            }

            $('#manageCategories').dialog('open');
            //add data
            this.listAllCategories();
        },
                
        time_To_dayhhmmss:function(seconds){
        	var day,hh,mm,ss;  
    	    if(seconds==null||seconds<0)
    	       return;
    	    day = seconds/3600/24|0;    	    
    	    seconds=parseInt(seconds)-(3600*day*24);
    	    hh=parseInt(seconds/3600)|0;
    	    seconds=parseInt(seconds)-hh*3600;    	      
    	    mm=seconds/60|0; 
    	    ss=parseInt(seconds)-mm*60; 
    	    return day+":"+hh+":"+mm+":"+ss;        	   
        },
        listAllCategories: function() {
            EB_Common.Ajax.ajax({
                url: EB_Common.Ajax.wrapperUrl("/incidents/category/list"),
                type: "GET",
                dataType: "json",
                async: false,
                success: function(data) {
                    var liTmpl = "";
                    var ctId, ctName;
                    for (i = 0; i < data.length; i++) {
                        ctId = data[i].id;
                        ctName = data[i].name;
                        liTmpl += '<li class="clearfix">\n\
		        				<span class="left"><input type="text" name="category" maxlength="80" class="{required : true}" categoryid="' + ctId + '" style="display:none;"/> \n\
		        				<span class="margin5-R input-label">' + ctName + '</span></span>\n\
		        				<div class="right"><a option="edit" title="' + i18n['button.edit'] + '" href="#" class="icn_edit_16"></a>\n\
		        				<a style="display:none;" option="Save" title="' + i18n['button.save'] + '" class="icn_save_16" href="#"></a>\n\
		        				<a style="display:none;" option="Cancel"  title="' + i18n['button.cancel'] + '" class="icn_cancel_16" href="#"></a> \n\
		        				<a option="Remove" title="' + i18n['button.remove'] + '" class="icn_trash_16" href="#"></a></div> \n\
		        				</li>';
                    }
                    $('#categorieList').empty().append(liTmpl);
                }});
        }
        

    };

    view.incidents.list = pub;

})(EB_View);
