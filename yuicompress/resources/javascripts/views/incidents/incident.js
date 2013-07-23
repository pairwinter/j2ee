/**
 * incident
 * 
 * @author Linder Wang
 */
(function(view) {

    view.incidents = view.incidents || {};
    var pub = {
        phaseData: {}, //form and settings.
        datepicker: {
            changeMonth: true,
            changeYear: true,
            altFormat: "yy-mm-dd",
            dateFormat: "yy-mm-dd",
            onClose: function(dateStr) {
                $(this).valid();
            }
        },
        initPage: function(context) {
            //Textbox("Textbox"), Textarea("Textarea"), Date("Date"), Single("Single-selection"), Multiple("Multiple-selection");
            incidentInputTmpl = '<dt>{{if require}}<span class="xing">*</span> {{/if}} ${name}</dt><dd>'
                    + '{{if type == "Single"}} <select class="select_long {{if require}} {required:true} {{/if}}"  name="formitem"  key="${name}"  id="${id}">{{each(i, option) options}} <option value="${option.value}">${option.text}</option> {{/each}}</select>{{/if}}'
                    + '{{if type == "Multiple"}} <select class="select_long {{if require}} {required:true} {{/if}}"  name="formitem" key="${name}"  id="${id}" multiple>{{each(i, option) options}} <option value="${option.value}">${option.text}</option> {{/each}}</select>{{/if}}'
                    + '{{if type == "Date"}} <input class="input_long date {{if require}} {required:true} {{/if}}" name="formitem" key="${name}" id="${id}" value="${value}" /> {{/if}}'
                    + '{{if type == "Textarea"}} <textarea class="input_long {{if require}} {required:true} {{/if}}" name="formitem" key="${name}" id="${id}" value="${value}" /> {{/if}}'
                    + '{{if type == "Textbox"}}<input class="input_long {{if require}} {required:true} {{/if}}" {{if isSys}} readonly {{/if}} name="formitem" key="${name}" id="${id}" value="${value}" maxlength="50" /> {{/if}}</dd>';

            $.template('incidentInputTmpl', incidentInputTmpl);
            $('#incident_step2').css("display", "none");
            $('#spnStepdesc').val(i18n["incident.new.step1"]);
            var me = this;
            me.initTemplateMenu('menuCt', 'contentPanel');

            $('#next').click(function() {
                var formInputs = me.getFormInputs();
                $("#inputsTbl").empty();
                for (i = 0; i < formInputs.length; i++) {
                    $('#inputsTbl').append('<tr><td class="bold width_204 txt_top">' + formInputs[i].name + ':</td><td>' + formInputs[i].value + '</td></tr>');
                }
                //$(this).closest('form').submit();
                $('#incident_step1').css("display", "none");
                $('#incident_step2').css("display", "block");
                $('#spnStepdesc').text(i18n['incident.new.step2']);
            });

            $('#back').click(function() {
                //$(this).closest('form').submit();
                $('#incident_step2').css("display", "none");
                $('#incident_step1').css("display", "block");
                $('#spnStepdesc').text(i18n['incident.new.step1']);
            });

            $('#send').click(function() {
                //alert(me.phaseData);
                var incident = {};
                var incidentPhase = {};
                // there is problem for JQuery to get checkbox checked status here. unchecked shows undefined???
                var blClose = document.getElementById('chk_closeIncident').checked; //$('#chk_closeIncident').attr("checked");
                incident.id = $('#txt_incidentId').val();
                incident.name = $('#txt_incidentname').val();
                //IncidentPhase
                incidentPhase.name = "";
                var phaseData = me.phaseData;
                for (i = 0; i < phaseData.phaseDefinitions.length; i++) {
                    if (phaseData.phaseDefinitions[i].id == $('#txt_phaseId').val()) {
                        incidentPhase.phaseDefinition = phaseData.phaseDefinitions[i];
                        incidentPhase.name = phaseData.name;

                        break;
                    }
                }
                //
                incidentPhase.notificationId = -1;
                //phaseData.formTemplate;
                phaseData.formTemplate.subject = $('#subject').val();
                phaseData.formTemplate.preMessage = $('#preMessage').val();
                phaseData.formTemplate.postMessage = $('#postMessage').val();
                var formInputs = me.getFormInputs();
                for (i = 0; i < formInputs.length; i++) {
                    if (phaseData.formTemplate.formVariableItems[i].variableId = formInputs[i].id) {
                        phaseData.formTemplate.formVariableItems[i].val = formInputs[i].value;
                        //phaseData.formTemplate.formVariableItems[i].val.push(formInputs[i].value);
                    }

                }
                //phaseData.formTemplate.formVariableItems = phaseData;
                incidentPhase.phaseTemplate = phaseData;
                incident.incidentPhases = [];
                incident.incidentPhases.push(incidentPhase);
                $("send").attr('disabled',true);
                EB_Common.Ajax.post("/incidents/incident/doIncident", {incidentJson: JSON.stringify(incident), closeIncident: blClose}, function(data) {
                    if (data.jsonStatus) {
                        EB_Common.dialog.alert("Save Success");
                        window.location.href = EB_Common.Ajax.wrapperUrl("/incidents/incident");

                    } else {
                        EB_Common.dialog.alert("Save Error");
                        $("send").attr('disabled',true);
                    }
                });


            });
        },
        getFormInputs: function() {
            var dds = $(":input[name='formitem']");
            var formInputs = [];
            dds.each(function(i, v) {
                var formInput = {};
                formInput.id = $(v).attr("id");
                formInput.name = $(v).attr("key");
                formInput.value = [];
                formInput.value.push($(v).val() || $(v).find("option:selected").val() || "");
                //formtItems.push({"val":value,"variableName":key})
                formInputs.push(formInput);
                //alert(id+","+name+","+value)
            });
            return formInputs;
        },
        showIncidentInput: function(id) {
            var phaseId = $('#txt_phaseId').val();
            var incidentId = $('#txt_incidentId').val();
            var me = this;
            $('#txt_templateId').val(id);
            if (phaseId == 1003) { //close phase, no need to show close option
                $('#div_closeIncident').css("display", "none");
            }
            EB_Common.Ajax.ajax({
                url: EB_Common.Ajax.wrapperUrl("/incidents/incident/getPhaseTemplate"),
                type: "GET",
                data:{"templateId":id,"phaseId":phaseId,"incidentId":incidentId},
                dataType: "json", 
                //async: false,
                success: function(data) {
                    var json = [];
                    me.phaseData = data;
                    if (data !== null) {
                        $('#txt_incidentname').val(data.templateName);
                        var form = data.formTemplate;
                        $('#subject').val(form.subject);
                        $('#preMessage').val(form.preMessage);
                        $('#postMessage').val(form.postMessage);
                        var variables = form.formVariableItems;
                        if (variables && variables.length > 0) {
                            for (i = 0; i < variables.length; i++) {
                                var item = {};
                                item.id = variables[i].variableItem.id;
                                item.name = variables[i].variableItem.name;
                                item.require = variables[i].isRequired;
                                item.type = variables[i].variableItem.varType;
                                if (item.type == "Textbox" && variables[i].val && variables[i].val.length > 0) {
                                    item.value = variables[i].val[0];
                                }
                                item.isSys = variables[i].isSys;
                                if (item.type == "Single" || item.type == "Multiple") {
                                    var options = variables[i].variableItem.variableOptions;
                                    if (options) {
                                        item.options = [];
                                        for (j = 0; j < options.length; j++) {
                                            var option = {};
                                            option.text = options[j].txt;
                                            option.value = options[j].val;
                                            option.isSelected = options[j].isSelected;
                                            item.options.push(option);
                                        }
                                    }
                                }
                                json.push(item);
                            }
                        }
                    }
                    $('#incidents_inputs').empty().append($.tmpl('incidentInputTmpl', json));
                    // init Date type 
                    $('#incidents_inputs input.date').datepicker(me.datepicker);
                }});
        },
        initSendPage: function(context) {
            var id = "";
            $('#send').click(function() {
                document.location.href = context + '/incidents/incident/' + id + '/notifications';
            });
        },
        initTemplateMenu: function(id, container) {
            var menuData = [];
            var me = this;
            EB_Common.Ajax.ajax({
                url: EB_Common.Ajax.wrapperUrl("/incidents/template/getTemplateMenu"),
                type: "GET",
                dataType: "json",
                async: false,
                success: function(data) {
                    for (i = 0; i < data.length; i++) {
                        var menu = {};
                        menu.id = data[i].id;
                        menu.name = data[i].name;
                        if (data[i].children && data[i].children != "null" && data[i].children.length > 0) {
                            menu.children = [];
                            for (j = 0; j < data[i].children.length; j++) {
                                var submenu = {};
                                submenu.id = data[i].children[j].id;
                                submenu.name = data[i].children[j].name;
                                submenu.handler = me.showIncidentInput;
                                submenu.parentId = data[i].id;
                                menu.children.push(submenu);
                            }
                        } else {
                            menu.handler = me.showIncidentInput;
                        }
                        menuData.push(menu);
                    }

                    var conf = {
                        id: id,
                        container: container,
                        data: menuData,
                        scope: me
                    };
                    var pMenu = new $.everbridge.platform.SettingMenu(conf);
                    pMenu.loadMenuLevel1();
                    var _templateId = $('#txt_templateId').val();                  
                    if(_templateId!=-1 &&  _templateId!="") {
                    	 pMenu.setCurrentMenu(_templateId);
                    } else {
                    	 if(menuData[0]) {
                    		  pMenu.setCurrentMenu(menuData[0].children[0].id);
                    	 }
                    }
                   

                }
            });
        },
        initNotificationsPage: function(context, incident) {
            var me = this;
            me.initIncidentInfo(incident);
            $('#notifications_gridTable').jqGrid({
                url: EB_Common.Ajax.wrapperUrl("/incidents/incident/" + $('#incidentId').val()),
                datatype: 'json',
                mtype: 'get',
                contentType: 'application/json',
                autoencode: true,
                emptyDataCaption: i18n['global.grid.emptyDataCaption'],
                jsonReader: {
                    root: 'data',
                    repeatitems: false
                },
                height: 'auto',
                autowidth: true,
                rowNum:-1,
                viewrecords: true,
                pager: '#notifications_gridPager',
                scrollOffset: 0,
                sortname:'startDate',
                sortorder:'desc',
                colNames: ['',i18n['user.list.model.status'],i18n['universe.widget.recipientapp.title'],i18n['notification.advanced.startDate'], i18n['notification.advanced.createdName'],i18n['activebroadcast.field.sentto'], i18n['activebroadcast.field.charts']],
                colModel: [{
                        name: 'id',
                        index: 'id',
                        hidden: true
                    }, {
                        name: 'notificationStatus',
                        index: 'notificationStatus',
                        width: 110,
                        sorttype: 'int',
                        formatter: function(val, rec, rowObject) {
                            if (val == 'Inprogress') {
                                return '<i class="icon_active_21 margin10-R" title=" '+ i18n['notification.field.notificattionStatus.Inprogress'] +'" alt="'+ i18n['notification.field.notificattionStatus.Inprogress'] +'"></i><button class="button orange" recordId="'+rowObject.id+'" name="btnStopNotification" type="button">' + i18n['button.stopbroadcast'] + '</button>';
                            } else if(val == 'Stopped'){
                                return '<i class="icon_stopped_21 margin10-R" title=" '+ i18n['notification.field.notificattionStatus.statusStopped'] +'" alt="'+ i18n['notification.field.notificattionStatus.statusStopped'] +'"></i>';
                            }
                            else{
                                return '<i class="icon_sent_21 margin10-R" title=" '+ i18n['notification.field.notificattionStatus.Sent'] +'" alt="'+ i18n['notification.field.notificattionStatus.Sent'] +'"></i>';
                             }
                        }
                    }, {
                        name: 'message.title',
                        index: 'message.title',
                        width: 150,
                        formatter: function(val, rec, rowObject) {
                            return '<a href="'+EB_Common.Ajax.wrapperUrl("/incidents/incident/notificaitonDetails/"+rowObject.id)+'">' + val + '</a>';
                        }
                    }, {
                    	name: 'startDate',
                        index: 'startDate',
                        width: 100
                    }, {
                        name: 'createdName',
                        index: 'createdName',
                        width: 60
                    }, {
                        name: 'notificationResult.totalCount',
                        index: 'notificationResult.totalCount',
                        width: 60,
                        formatter: function(val, rec, rowObject) {
                        	 return val?'<a href="javascript:void(0)" class="export_csv" alt="'+i18n["notification.field.sendto.tooltip"]+'" title="'+i18n["notification.field.sendto.tooltip"]+'" notificationId="'+rowObject.id+'">'+val+'</a>':'';
                        }
                    },
                    {
                        name : 'chart',
                        index : 'chart',
                        width : 40,
                        sortable : false,
                        colGetLength : false,
                        formatter : function(id, rec, rowObject) {
                            return '<div style="max-width: 280px; min-width: 240px; height: 40px;line-height: 40px;"></div>';
                        }
                    }],
                gridComplete: function() {
					$('[name="btnStopNotification"]').click(function(e){
	            		e.preventDefault();
	            		var el = $(this);
	            		var notificationId=el.attr('recordId');
	            		var name = el.attr("recordName");
		        	      EB_Common.dialog.confirm(i18n['global.dialog.content.notification.stop.confirm'],
		        	                i18n['global.dialog.title.confirm'], function() {
		        	                    var dialog = $(this);
		        	                    EB_Common.Ajax.get("/notifications/stop/" + notificationId, {}, function(data) {
		        	                        dialog.dialog("close");
		        	                        if (data.success) {
		        	                        	$('#notifications_gridTable').trigger("reloadGrid");
		        	                        } else {
		        	                            EB_Common.dialog.alert(data.message, 'alert', function() {
		        	                                $(this).dialog('close');
		        	                            });
		        	                        }
		        	                    });
		        	                });

	            	});
					
					$('[name="showChart"]').click(function(e) {
						var rowId = $(this).attr("rowId");
						var rowdata = jQuery("#notifications_gridTable").getRowData(rowId)
						var id = rowdata.id;
						EB_Common.Ajax.post("/incidents/incident/fetchNotication", {
							"id" : id
						}, function(data) {
							charfun(data)
						}, "json");
					});
					$('#incident_box').on('click','#lnkConsolidatedRpt',function(e) {
						 var id=$('#incidentId').val();
						 var url = EB_Common.Ajax.wrapperUrl("/incidents/report/consolidatedReport?incidentId=" + id+"&ts="+Math.random());						 
						 $(window.parent.document).find("#rptFrame").attr("src",url); 		                 
					});
                },
                afterInsertRow : function(id, rowdata, rowele) { // display
					var chart_cell = jQuery("#notifications_gridTable").getInd(id, true);
					if (chart_cell && chart_cell.cells) {
						var chart_container = chart_cell.cells[chart_cell.cells.length - 1].childNodes[0];
						$(chart_container).attr("rowId", id);
                        var ret = rowele.notificationResult;
                        if (!ret || !ret.showChart) {
                            if (chart_container) {
                                $(chart_container).replaceWith("<span>"+i18n['dashboard.noData']+"</span>");
                            }
                            return;
                        }
                        EB_View.incidents.loadchart(chart_container, rowele.type == "Polling" ? convertResponseData(ret) : convertI18n(ret));
					}
					
				},
				loadComplete : function() {
                    $(".export_csv").click(function(e){
                        e.preventDefault();
                        export_csv($(this).attr("notificationId"));
                    });
                }
            });
            
            $('#showBigChart').prev().click(function(){
                $(this).parent().hide();
                $(this).children().remove();
            });
        },
        incidentAction: function() {
        	var me = this;
        	$('#incident_box [name="incidentUpdate"]').click(function(e) {
        		var incidentId = $(this).attr('recordId');
        		window.location.href = EB_Common.Ajax.wrapperUrl("/incidents/incident/send/" + incidentId);
        	});
        	$('#incident_box').parent().click(function(e) {
        		$('#folderSelectCt').hide();
        	});
            $('#incident_box [name="folderSelect"]').click(function(e) {
                var incidentId = $(this).attr('recordId');
                if ($('#folderSelectCt').length === 0) {
                    $('<ul id="folderSelectCt" class="show_ul noti_show_ul" style="display: none;">').appendTo(document.body);
                    $('#folderSelectCt').on('click', 'a', function(e) {
                        var actionType = $(this).attr('actionType');
                        switch (actionType) {
                            case '1':
                                EB_Common.dialog.confirm(
                                    i18n['incident.confirm.close'],i18n['global.threshold.delete.comfirmtitle'], function() {
                                    window.location.href = EB_Common.Ajax.wrapperUrl("/incidents/incident/closeWithSend/" + incidentId);
                                });
                                break;
                            case '2':
                                EB_Common.dialog.confirm(
                                    i18n['incident.confirm.close'],i18n['global.threshold.delete.comfirmtitle'],function() {
              	                    	EB_Common.Ajax.put("/incidents/incident/closeWithoutSend/" + incidentId, null, function(data) {
	                                        if (data.jsonStatus) {
	                                        	$('#folderSelectCt').hide();
	                                            me.initIncidentInfo(eval(data.incident));
	                                        } else {
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

                liTmpl += '<li class="nowrap"><a href="#" actionType="1">' + i18n['incident.action.closesend2'] + '</a></li>';
                liTmpl += '<li class="nowrap"><a href="#" actionType="2">' + i18n['incident.action.close2'] + '</a></li>';

                var folderSelectCt = $('#folderSelectCt');
                folderSelectCt.empty().append(liTmpl);
//                var folderCtH = folderSelectCt.height();
//                var top = offset.top + height + 5;
//                if (offset.top + folderCtH > EB_Common.Element.getViewportHeight()) {
//                    top = offset.top - folderCtH - height;
//                }
                folderSelectCt.css({left: 0, top: 0}).show();
                folderSelectCt.position({
                    of:e ,
                    my:'left+10 top+10'
                });
                return false;
            });
            
            $("#addBut").click(function() {
                EB_Common.dialog.dialog("div_incidentFormTemplate", {
                    height: "auto",
                    title: i18n['button.newentry'],
                    width: 395,
                    buttons:{
                         Ok : {
                            click : function() {
                            	if ($("#form_incidentFormTemplate").valid()) {
                                    $("#form_incidentFormTemplate").submit();
                                    $(this).dialog("close");
                                } else {
                                    return false;
                                }
                            },
                            'class' : 'orange',
                            text : i18n['global.dialog.button.ok']
                        },
                        Cancel : {
                            click : function() {
                                $(this).dialog("close");
                                $("#incidentJournal").val("");
                                $("#remainingCount").html(500);
                            },
                            'class' : 'gray',
                            text : i18n['global.dialog.button.cancel']
                        }
                	}
                });

                EB_Common.validation.validate("form_incidentFormTemplate", {
                    submitHandler: function(form) {
                    	  var options = {
                              url: EB_Common.Ajax.wrapperUrl("/incidents/incident/addIncidentJournal"),
                              type: 'POST',
                              dataType: 'json',
                              success: function(data) {
                              	me.initIncidentInfo(data);
                              	$("#incidentJournal").val("");
                              }
                          };
                          $('#form_incidentFormTemplate').ajaxSubmit(options);
                    }
                });
                
            });
            
            $("#form_incidentFormTemplate").on("keyup","textarea",function(e){
            	var textval = $(this).val();
            	if (textval.length > 500) {
            		textval = textval.substring(0, 500);
            	}
            	$("#remainingCount").html(500 - (textval.length||0));
            });
            $("#form_incidentFormTemplate").on("keydown","textarea",function(e){
            	var textval = $(this).val();
            	if (textval.length > 499&&e.keyCode != 13 && e.keyCode != 46 && e.keyCode != 8) {
            		return false;
            	}
            });
            
            EB_Common.validation.validate("renameForm");
            
            $('#incidentNameBox').on('click', 'a[option="Edit"]', function(e) {
				e.preventDefault();
				var el = $(e.target), textEl = el.siblings('div'), cancelEl = el.siblings('a[option="Cancel"]'), saveEl = el.siblings('a[option="Save"]'), inputEl = el.siblings('input[name="incidentName"]');
				el.hide();
				inputEl.show().val(textEl.text());
				cancelEl.show();
				saveEl.show();
				textEl.hide();
			});
			// Cancel Category
			$('#incidentNameBox').on('click', 'a[option="Cancel"]', function(e) {
				e.preventDefault();
				var el = $(e.target), textEl = el.siblings('div'), editEl = el.siblings('a[option="Edit"]'), saveEl = el.siblings('a[option="Save"]'), inputEl = el.siblings('input[name="incidentName"]');
				el.hide();
				inputEl.val(textEl.text()).hide().valid();
				editEl.show();
				saveEl.hide();
				textEl.show();
			});

			$('#incidentNameBox').on('click', 'a[option="Save"]', function(e) {
				e.preventDefault();
				var el = $(e.target), textEl = el.siblings('div'), editEl = el.siblings('a[option="Edit"]'), cancelEl = el.siblings('a[option="Cancel"]'), inputEl = el.siblings('input[name="incidentName"]');

				var incidentId = inputEl.attr("incidentId");
				var incidentName = $.trim(inputEl.val());
				if (!incidentId)return;
				if (incidentName == "")
					return;
				
				EB_Common.Ajax.ajax({
					url : EB_Common.Ajax.wrapperUrl("/incidents/incident/rename"),
					type : "POST",
					dataType : "json",
					data : {
						"incidentId" : incidentId,
						"name" : incidentName
					},
					success : function(data) {
						if (data.success) {
							el.hide();
							inputEl.hide();
							editEl.show();
							cancelEl.hide();
							var incident = data.incident;
							incident.name = $.jgrid.htmlEncode(incidentName);
							me.initIncidentInfo(data.incident);
						} else {
							EB_Common.dialog.alert(i18n['setting.error.region.duplicatedName'], null, null);
						}
					}
				});

			});
        },
        initIncidentInfo:function(incident){
        	var tmp = $("#incident_tmpl").render(incident),me = this;
        	 tmp = tmp&&tmp.replace(/<script>/,'&lt;script&gt;').replace(/<\/script>/g, '&lt;/script&gt; ');
        	 $("#incident_box").empty();
             //$(tmp).on("click", "#incident_editor",function(){alert(123)})
             $("#incident_box").append($(tmp));

             if (incident && incident.incidentJournals && incident.incidentJournals.length) {
                 $("#journal_box").empty();
                 famitDate(incident);
                 incident.incidentJournals.sort(function(a,b){//sort by date desc
                	return (a.createdDate < b.createdDate)?1:-1;
                 });
                 $.each(incident.incidentJournals, function(i,v){
                	 v.journalEntry = $.jgrid.htmlEncode(v.journalEntry);
                 });
                 var journalHTMl = $("#incidentJournal_tmpl").render(incident.incidentJournals);
                 $("#journal_box").html(journalHTMl);
             }
             me.incidentAction();
        }
    };
    
    function charfun(rowele) {
		var ret = rowele.notificationResult || {
			"notificationId" : 4402341481559,
			"totalCount" : 1,
			"confirmedCount" : 0,
			"notConfirmedCount" : 1,
			"unreachableCount" : 0,
			"confirmedLateCount" : 0,
			"elapsedTime" : 0,
			"pollingDetails" : null,
			"startAt" : null,
			"endAt" : null
		};
		$('#notification_chart_box').empty().append($("<div/>").attr("id", "chart_content").width(280));
		EB_View.incidents.loadchart("chart_content", rowele.type == "Polling" ? convertResponseData(ret) : convertI18n(ret));
		EB_Common.dialog.dialog($("#notification_chart_box"), {
			height : "auto",
			width :  "auto",
			title : "notification  chart",
			buttons:[]
		});
	}
    
    function famitDate(d) {
        $.each(d.incidentJournals, function(i, e) {			
        	var lastModifiedDate = e.lastModifiedDate, 
                dateStr = lastModifiedDate.split(" "),
                ymd = dateStr[0].split('-'),
        	    date = new Date(parseInt(ymd[0]),parseInt(ymd[1]) - 1,parseInt(ymd[2])), 
                dates = ["January", "February", "March", "April", "May", "June","July", "August", "September", "Octorber","November", "December" ];
			e.month = dates[date.getMonth()].substring(0, 3);
            e.day = date.getDate();
            e.year = date.getFullYear();
		});
    }
    
    function convertI18n(data) {
		var chartData = {};
		if (data) {
			chartData[i18n['global.chart.confirmed']] = data.confirmedCount ? data.confirmedCount : 0;
			chartData[i18n['global.chart.confirmLate']] = data.confirmedLateCount ? data.confirmedLateCount : 0;
			chartData[i18n['global.chart.unreachable']] = data.unreachableCount ? data.unreachableCount : 0;
			chartData[i18n['global.chart.notConfirmed']] = data.notConfirmedCount ? data.notConfirmedCount : 0;
			if (chartData[i18n['global.chart.confirmed']] == 0 && chartData[i18n['global.chart.confirmLate']] == 0 && chartData[i18n['global.chart.unreachable']] == 0) {
				chartData[i18n['global.chart.notConfirmed']] = data.totalCount;
			}
		}
		return chartData;
	}

	function convertResponseData(data) {
		var chartData = {};
		var details = data.pollingDetails;
		if (details) {
			for ( var i = 0; i < details.length; i++) {
				var detail = details[i];
				chartData[detail.responseText] = detail.count ? detail.count : 0;
			}
		}
		return chartData;
	}
	
	view.incidents.loadchart = function(container, recdata, showLegend) {
		
		
        var convertData = [];
        for(var index in recdata) {
        	convertData.push({name:index, value:recdata[index] ? recdata[index] : 0});
        }
        var colors = EB_Common.Highcharts.piecolors;
        var data_ = {resultDatas:convertData, colors:colors};
        
        var tooltipHtml = $("#chartTooltipTmpl").render([data_]);
        $(container).tooltip({
            position: { my: "left top+15", at: "left center", collision: "flipfit" },
            content : tooltipHtml
        });
		
        Highcharts.setOptions({
            // mono-theme
            colors : EB_Common.Highcharts.piecolors
        });
        var myChart =new Highcharts.Chart({
            chart : {
                renderTo : container,
                borderWidth : 0,
                plotBorderWidth : 0,
//                marginLeft : 0,
                margin: [0, 0, 0, 0],
                width:60,
                height:60,
                events : {

                    load : function() {
                        // set up the updating of the chart each second
                        var series = this.series[0];
                        var data = [];
                        for ( var ele in recdata) {
                            data.push([ ele, parseFloat(recdata[ele]) ]);
                        }
                        series.setData(data);
                    }

                }
            },
            title : {
                text : ''
            },
            credits : {
                enabled : false
            },
            exporting : {
                enabled : false
            },
            tooltip : {
                enabled:false,
                formatter : function() {
                    return '<b>' + this.point.name + '</b>: ' + this.percentage + ' %';
                }
            },
            legend : {
                enabled : showLegend?showLegend:false,
                align : 'right',
                layout : 'vertical',
                verticalAlign : 'top',
                x : 0,
                y : 0,
                labelFormatter : function() {
                    return (this.name.length>20?(this.name.substring(0,20)+"..."):this.name) + ': ' + this.y;
                },
                itemStyle : {
                    color : '#333333',
                    fontFamily : 'Arial',
                    fontSize : '11px'
                }
            },
            plotOptions : {
                pie : {
                    size : "90%",
                    center : [ "50%", "10%" ],
                    allowPointSelect : false,
                    cursor : 'pointer',
                    dataLabels : {
                        enabled : false
                    },
                    showInLegend : true,
                    point : {
                        events : {
                            click:function(e){
                                $("#showBigChart").remove();
                                var showBigChart = $('<div id="showBigChart" style="padding:0;" />').appendTo(document.body);
                                $('#showBigChart').dialog({
                                    width : 750,
                                    height : 500,
                                    resizable : false,
                                    modal : true,
                                    zIndex : 2300,
                                    close: function() {
                                         $(this).dialog("destroy");
                                    }
                                });
                                //showBigChart.parent().show();
                                //showBigChart.parent().css({left: EB_Common.Element.getViewportWidth()/2-300, top: EB_Common.Element.getViewportHeight()/2-200, width:'650px', position:'fixed',zIndex:2012});
                                var params={
                                    chart : {
                                        renderTo : showBigChart[0],
                                        borderWidth :0,
                                        //borderColor : "#838385",
                                        plotBorderWidth : 0,
                                        marginLeft : 0 ,
                                        backgroundColor:"#f5f5f5",
    //                                    width:200,
                                        events : {

                                            load : function() {
                                                // set up the updating of the chart each second
                                                var series = this.series[0];
                                                var data = [];
                                                for ( var ele in recdata) {
                                                    data.push([ ele, parseFloat(recdata[ele]) ]);
                                                }
                                                series.setData(data);
                                            }

                                        }
                                    },



                                    title: {
                                        style:{
                                          fontSize: '14px'  
                                        },
                                        text: 'Report'
                                    },
                                    plotOptions : {
                                        pie : {
                                            size : "70%",
//                    center : [ 25, 25 ],
                                            allowPointSelect : false,
                                            cursor : 'pointer',
                                            dataLabels : {
                                                enabled : false
                                            },
                                            showInLegend : true
                                        }
                                    },
                                    tooltip : {
                                        enabled:true,
                                        formatter : function() {
                                            return '<b>' + this.point.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                                        }
                                    },
                                    legend : {
                                        enabled : true,
                                        align : 'right',
                                        layout : 'vertical',
                                        verticalAlign : 'top',
                                        x : 0,
                                        y : 80,
                                        labelFormatter : function() {
                                            return (this.name.length>20?(this.name.substring(0,20)+"..."):this.name) + ': ' + this.y;
                                        },
                                        itemStyle : {
                                            color : '#333333',
                                            fontFamily : 'Arial',
                                            fontSize : '11px'
                                        }
                                    },
                                    series : [ {
                                        type : 'pie',
                                        name : 'bigChart'
                                    } ]};
                                new Highcharts.Chart(params);
//                                var svg = myChart.getSVG({lineWidth:500});
//
//                                e.preventDefault();
//                                var div = $("<div>");
//                                div.css({left: EB_Common.Element.getViewportWidth()/2-250, top: EB_Common.Element.getViewportHeight()/2, width:'500px',height:'500px', position:'absolute',zIndex:2012});
//                                div.append(svg);
//                                $(document.body).append(div);
                            },
                            legendItemClick : function(event) {
                                return false;
                            }
                        }
                    }
                }

            },
            series : [ {
                type : 'pie',
                name : 'test'
            } ]
        });
        var series = myChart.series;
        for(var i=0; i < series.length; i++){
            series[i].show();
        }
    };
    
    //$("#export_csv").click();
    function export_csv(notificationId){

        var settings = {
            downloadAsyncUrl:EB_Common.Ajax.wrapperUrl("/histories/csv/async/"+notificationId),
            downloadSyncUrl:EB_Common.Ajax.wrapperUrl("/histories/csv/"+notificationId),
            downloadCheckUrl:EB_Common.Ajax.wrapperUrl("/histories/download/check/threshold/"+notificationId),
            downloadForm:$("#downloadIframe")
        };
        var downloadCsvApp = EB_View.downloadApp.getInstance(settings);
        downloadCsvApp.execute({});

    }
//    function export_csv(notificationId){
//            EB_Common.Ajax.post("/histories/csv/"+notificationId,{_method:'GET'},function(data){
//                if(data.fileName!=''){
//                    EB_Common.mask.show(i18n["broadcast.details.csv.tip"]);
//                    var csvFileName=data.fileName;
//                    var detectTime=window.setInterval(function(){
//                        if(csvFileName!=""){
//                            EB_Common.Ajax.post("/histories/detect/"+encodeURIComponent(csvFileName),{_method:'GET'},function(data){
//                                if(data.status=='yes'){
//                                    $("#downloadIframe").attr("src",EB_Common.Ajax.wrapperUrl("/histories/download/"+encodeURIComponent(csvFileName)));
//                                    EB_Common.mask.hide();
//                                    csvFileName="";
//                                    window.clearInterval(detectTime);
//                                }
//                            },"json");
//                        }
//                    }, 10000);
//                }
//            },"json");
//        }
    view.incidents.incident = pub;

})(EB_View);
