(function(view) {
	var subscription = {};
	//select value's checkbox when name's checkbox selected
	function ckClicked(e) {
		
		var clickMiddleLevel=function(tr,checkbox_td_type,isMiddleLevelChecked){
			tr.nextAll().each(function(){
				var tr2 = $(this);
				var span = tr2.find("span.icon_arrow_expand");
				if(span.length>0){
					return false;
				}
				tr2.children().each(function(){
					var td2= $(this);
					td2.each(function(){
						var td = $(this);
						if(td.attr("aria-describedby")==checkbox_td_type){
							td.find(":checkbox").not(":disabled").prop("checked",isMiddleLevelChecked);
						}
						if(checkbox_td_type=="subscriptionsTable_expose"){
							if(td.attr("aria-describedby")=="subscriptionsTable_mandatory"){
								if(isMiddleLevelChecked)
									td.find(":checkbox").prop("disabled",false);
								else{
									td.find(":checkbox").prop("checked",false).prop("disabled",true);
								}
							}
						}
					});
				});
			});
			var otherMiddleLevelTr=[tr];
			var groupParentTr=null
			tr.prevAll().each(function(){
				var tr=$(this);
				var span = tr.find("span.icon_arrow_expand");
				if(span.length>0 && span.attr("group")){
					groupParentTr = tr;
					return false;
				}
				otherMiddleLevelTr.push(tr);
			});
			tr.nextAll().each(function(){
				var tr=$(this);
				var span = tr.find("span.icon_arrow_expand");
				if(span.length>0 && span.attr("group")){
					return false;
				}
				otherMiddleLevelTr.push(tr);
			});
			
			var isCheckedArray=[];
			for(var i=0;i<otherMiddleLevelTr.length;i++){
				var tr = otherMiddleLevelTr[i];
				tr.find("td").each(function(){
					var td = $(this);
					if(td.attr("aria-describedby")==checkbox_td_type){
						if(td.find(":checked").length>0){
							isCheckedArray.push(true);
						}
						return false;
					}
				});
			}
			if(groupParentTr){
				groupParentTr.find("td").each(function(){
					var td = $(this);
					var isChecked = isCheckedArray.length>0;
					if(td.attr("aria-describedby")==checkbox_td_type){
						td.find(":checkbox").not(":disabled").prop("checked",isChecked);
					}
					if(checkbox_td_type=="subscriptionsTable_expose"){
						if(td.attr("aria-describedby")=="subscriptionsTable_mandatory"){
							if(isChecked)
								td.find(":checkbox").prop("disabled",false);
							else{
								td.find(":checkbox").prop("checked",false).prop("disabled",true);
							}
						}
					}
				});
			}
		}
		var clickMinLevel=function(tr,checkbox_td_type){
			var trSibligs = [tr];
			var parentTr=null;
			tr.nextAll().each(function(){
				var tr2 = $(this);
				var span = tr2.find("span.icon_arrow_expand");
				if(span.length>0){
					return false;
				}
				trSibligs.push(tr2);
			});
			tr.prevAll().each(function(){
				var tr2 = $(this);
				var span = tr2.find("span.icon_arrow_expand");
				if(span.length>0){
					parentTr = tr2;
					return false;
				}
				trSibligs.push(tr2);
			});
			var isCheckedArray=[];
			for(var i=0;i<trSibligs.length;i++){
				var tr = trSibligs[i];
				tr.find("td").each(function(){
					var td = $(this);
					if(td.attr("aria-describedby")==checkbox_td_type){
						if(td.find(":checked").length>0){
							isCheckedArray.push(true);
						}
						return false;
					}
				});
			}
			parentTr.find("td").each(function(){
				var td = $(this);
				var isChecked = isCheckedArray.length>0;
				if(td.attr("aria-describedby")==checkbox_td_type){
					td.find(":checkbox").prop("checked",isChecked);
				}
				if(checkbox_td_type=="subscriptionsTable_expose"){
					if(td.attr("aria-describedby")=="subscriptionsTable_mandatory"){
						if(isChecked)
							td.find(":checkbox").prop("disabled",false);
						else{
							td.find(":checkbox").prop("checked",false).prop("disabled",true);
						}
					}
				}
			});
			
			var otherMiddleLevelTr=[parentTr];
			var groupParentTr=null
			parentTr.prevAll().each(function(){
				var tr=$(this);
				var span = tr.find("span.icon_arrow_expand");
				if(span.length>0 && span.attr("group")){
					groupParentTr = tr;
					return false;
				}
				otherMiddleLevelTr.push(tr);
			});
			parentTr.nextAll().each(function(){
				var tr=$(this);
				var span = tr.find("span.icon_arrow_expand");
				if(span.length>0 && span.attr("group")){
					return false;
				}
				otherMiddleLevelTr.push(tr);
			});
			
			isCheckedArray=[];
			for(var i=0;i<otherMiddleLevelTr.length;i++){
				var tr = otherMiddleLevelTr[i];
				tr.find("td").each(function(){
					var td = $(this);
					if(td.attr("aria-describedby")==checkbox_td_type){
						if(td.find(":checked").length>0){
							isCheckedArray.push(true);
						}
						return false;
					}
				});
			}
			if(groupParentTr){
				groupParentTr.find("td").each(function(){
					var td = $(this);
					var isChecked = isCheckedArray.length>0;
					if(td.attr("aria-describedby")==checkbox_td_type){
						td.find(":checkbox").prop("checked",isChecked);
					}
					if(checkbox_td_type=="subscriptionsTable_expose"){
						if(td.attr("aria-describedby")=="subscriptionsTable_mandatory"){
							if(isChecked)
								td.find(":checkbox").prop("disabled",false);
							else{
								td.find(":checkbox").prop("checked",false).prop("disabled",true);
							}
						}
					}
				});
			}
		}
		
		var tr = $(this).parents("tr").eq(0);
		var td=$(this).parent();
		var isExposeCheckbox= false;
		var exposeCheckbox = null;
		var mandatoryCheckbox = null;
		if(td.attr("aria-describedby")=="subscriptionsTable_expose"){
			isExposeCheckbox = true;
			exposeCheckbox = $(this);
		}else{
			mandatoryCheckbox = $(this);
		}
		//click expose checkbox
		if(isExposeCheckbox){
			tr.find("td").each(function(){
				var jTd = $(this);
				if(jTd.attr("aria-describedby")=="subscriptionsTable_mandatory"){
					mandatoryCheckbox =jTd.find(":checkbox");
				}
			});
			var isExposeCheckboxChecked=exposeCheckbox.prop("checked")
			if(isExposeCheckboxChecked){
				mandatoryCheckbox.prop("disabled",false);
			}else{
				mandatoryCheckbox.prop("checked",false).prop("disabled",true);
			}
			//click group level
			var span = tr.find("span.icon_arrow_expand");
			if(span.length>0 && span.attr("group")){
				tr.nextAll().each(function(){
					var tr2 = $(this);
					var span = tr2.find("span.icon_arrow_expand");
					if(span.length>0&&span.attr("group")){
						return false;
					}
					tr2.children().each(function(){
						var td2= $(this);
						td2.each(function(){
							var td = $(this);
							if(td.attr("aria-describedby")=="subscriptionsTable_expose"){
								td.find(":checkbox").not(":disabled").prop("checked",isExposeCheckboxChecked)
							}else if(td.attr("aria-describedby")=="subscriptionsTable_mandatory"){
								td.find(":checkbox").prop("checked",false).prop("disabled",!isExposeCheckboxChecked)
							}
						});
					});
				});
			}else if(span.length>0){//click middle level
				clickMiddleLevel(tr,"subscriptionsTable_expose",isExposeCheckboxChecked);
			}else{//click min level
				clickMinLevel(tr,"subscriptionsTable_expose");
			}
		}else{
			var isMandatoryCheckboxChecked=mandatoryCheckbox.prop("checked")
			//click group level
			var span = tr.find("span.icon_arrow_expand");
			if(span.length>0 && span.attr("group")){
				tr.nextAll().each(function(){
					var tr2 = $(this);
					var span = tr2.find("span.icon_arrow_expand");
					if(span.length>0&&span.attr("group")){
						return false;
					}
					tr2.children().each(function(){
						var td2= $(this);
						td2.each(function(){
							var td = $(this);
							if(td.attr("aria-describedby")=="subscriptionsTable_mandatory"){
								td.find(":checkbox").not(":disabled").prop("checked",isMandatoryCheckboxChecked);
							}
						});
					});
				});
			}else if(span.length>0){
				clickMiddleLevel(tr,"subscriptionsTable_mandatory",isMandatoryCheckboxChecked);
			}else{//click min level
				clickMinLevel(tr,"subscriptionsTable_mandatory");
			}
		}
		e.stopPropagation();
	}
	
	//toggle value when name clicked
	function trClicked(e) {
		var tr = $(this);
		var span = tr.find("span.icon_arrow_expand");
		if(span.length>0 && span.attr("group")){
			var activeSpan = $(span[0]);
			var show = activeSpan.hasClass("collapsed");
			tr.nextAll().each(function(){
				var tr2 = $(this);
				var span = tr2.find("span.icon_arrow_expand");
				if(span.length>0&&span.attr("group")){
					return false;
				}
				if(show){
					tr2.show();
					span.removeClass("collapsed");
				}else{
					tr2.hide();
				}
			});
			activeSpan.toggleClass("collapsed");
		}else if(span.length>0){//click middle level
			var activeSpan = $(span[0]);
			var show = activeSpan.hasClass("collapsed");
			tr.nextAll().each(function(){
				var tr2 = $(this);
				var span = tr2.find("span.icon_arrow_expand");
				if(span.length>0){
					return false;
				}
				if(show){
					tr2.show();
				}else{
					tr2.hide();
				}
			});
			activeSpan.toggleClass("collapsed");
		}
	}
	
	subscription.handleCheckboxClick =function() {
		$("#subscriptionsTable").delegate(":checkbox", "click", ckClicked);
	};
	subscription.handleNameClick =function() {
		$("#subscriptionsTable").delegate("tr", "click", trClicked);
	};

	subscription.init = function(quietPeriodSetting) {
		subscription.sspType = 'Subscriptions';
		subscription.saveButton = 'subscriptionsSaveBtn';
        subscription.quitePeriodSetting = quietPeriodSetting;

		this.initTable();
		
		$('#autoAlertStatus').change(function(){
        	var me = $(this);
        	EB_Common.Ajax.post("/settings/sspconfig/changeAutoAlertStatus", {
        		changeAutoAlertStatus : me.is(':checked')
            }, function(data) {
            	EB_Common.LeavePage.resetState();
            });
        });
		
		$("#subscriptionsSaveBtn").bind('click', {buttonId:subscription.saveButton},bindSave);
		
		$('#enableAll').change(function(){
			var enabled = $(this).is(':checked');
			if(enabled){
				$('#override').show();
				$('#quietPeriodTime').show();
			}else{
				$('#override').hide();
				$('#quietPeriodTime').hide();
			}
		});
		
		$('#override input[type="checkbox"]').change(function(){
			var me = $(this), enabled = me.is(':checked'), name = me.attr('name')/*closest('li').find('div')*/;
			if('category' == name){
				var div = me.closest('li').find('div');
				var inputs = div.find(':checkbox');
				if(enabled){
					if(inputs.filter(':checked').length == 0){
						inputs.attr('checked',true);
					}
					div.show();
				}else{
					div.hide();
				}
			}else{
				var div = me.closest('div');
				if(div.find(':checkbox').filter(':checked').length == 0){
					div.closest('li').find(':checkbox:first').attr('checked',false);
					div.hide();
				}
			}
			
		});
		
	};

    subscription.initTable = function() {
		var group = 1;
        var me = this;
		subscription.sspTable = $('#subscriptionsTable');
		subscription.sspTable.jqGrid({
			autoencode:true,
			url : EB_Common.Ajax.wrapperUrl('/settings/sspconfig/listSspOptions?type=Subscriptions'),
			datatype : "json",
			emptyDataCaption : i18n['global.grid.emptyDataCaption'],
			height : "auto",
			autowidth:true,
			title:true,
			colNames : ['', i18n['setting.contact.subscriptionFields.group'],'', i18n['sspconfig.field.name'],
					i18n['sspconfig.field.expose'],
					i18n['sspconfig.field.mandatory'],
					'New',
                    'All Clear',
					i18n['sspconfig.field.externalobject'] ],
			colModel : [ 
             {
				name : 'type',
				index : 'expandIcon',
				width : 10,
				classes:'txt_top',
				sortable : false,
				formatter : function(value, rec) {
					if(value == 'TopicGroup')
						return '<span group=group_' + group++ + ' class="icon_arrow_expand" style="margin:0px;"></span>';
					else return '';
				}
			},{
				name : 'externalObject',
				index : 'itemName',
				width : 150,
				sortable : false,
				formatter : function(value, rec,rowObject) {
					if(value.length == 3){
						if(value[0] == 'TopicCategory'){
							return '</span><b>--</b>';
						}else{
							return '</span><b>' + $.jgrid.htmlEncode(value[1]) + '</b><div class="margin10-B"><a id="quietPeriod" title="'+ i18n['weatherthreshold.quietPeriodSetting'] + '" href="javascript:void(0)">'+ i18n['weatherthreshold.quietPeriodSetting'] + '</a></div>'
						}
						
					}else{
						if(value[0] == 'TopicGroup'){
							return '</span><b>' + $.jgrid.htmlEncode(value[1]) + '</b>';
						}else{
							return '';
						}
					}
					
				}
			},{
				name : 'type',
				index : 'expandIcon',
				width : 10,
				sortable : false,
				formatter : function(value, rec) {
					if(value == 'TopicCategory')
						return '<span class="icon_arrow_expand"></span>';
					else return '';
				}
			},{
				name : 'itemName',
				index : 'itemName',
				width : 280,
			//	align : "left",
				sortable : false,
				formatter : function(value, rec) {
					value = $.jgrid.htmlEncode(value);
					if(value==$.trim(value))
						return '</span><b>' + value + '</b>';
					else return value;
				}
			},{
				name : 'expose',
				index : 'expose',
				width : 80,
				editable : true,
				edittype : 'checkbox',
				sortable : false,
				editoptions : {
					value : "true:false"
				},
				formatter :"checkbox",
				formatoptions : {
					disabled : false
				}
			}, {
				name : 'mandatory',
				index : 'mandatory',
				editable : true,
				edittype : 'checkbox',
				sortable : false,
				editoptions : {
					value : "true:false"
				},
				formatter : "checkbox",
				formatoptions : {
					disabled : false
				}
			},{
                name : 'newActionStatus',
                index : 'newActionStatus',
                width : 80,
                editable : true,
                sortable : false,
                formatter : function(value, rec) {
                    var startDiv = '';
                    if (value == "Active") {
                        startDiv += '<b class="b-grid-status" onclick="EB_View.ssp.changeWeatherTopicStatus(this,' + rec.rowId + ',\'new\');"></b>';
                    } else if(value == "Inactive"){
                        startDiv += '<b class="b-grid-status off" onclick="EB_View.ssp.changeWeatherTopicStatus(this,' + rec.rowId + ',\'new\');"></b>';
                    }
                    return startDiv;
                }
			},{
                name : 'allClearActionStatus',
                index : 'allClearActionStatus',
                width : 80,
                editable : true,
                sortable : false,
                formatter : function(value, rec, rowObject) {
                    var startDiv = '';
                    if (value == "Active") {
                        startDiv += '<b class="b-grid-status" onclick="EB_View.ssp.changeWeatherTopicStatus(this,' + rec.rowId + ',\'allClear\');"></b>';
                    } else if(value == "Inactive"){
                        startDiv += '<b class="b-grid-status off" onclick="EB_View.ssp.changeWeatherTopicStatus(this,' + rec.rowId + ',\'allClear\');"></b>';
                    }
                    return startDiv;
                }
            },{
				name : 'externalObject',
				index : 'externalObject',
				hidden : true,
				width : 100,
				hidden : true,
				sortable : false
			} ],
			rowNum:"totalCount",
			jsonReader : {
				root : "data",
				page : "currentPageNo",
				total : "totalPageCount",
				records : "totalCount",
				repeatitems : false
			},
			
			loadComplete: function() {
				var i=getColumnIndexByName('expose');
                var exposeChecckboxes = $("tbody > tr.jqgrow > td:nth-child("+(i+1)+") > input");
                
                var indexOfMandatory=getColumnIndexByName('mandatory');
                var mandatoryChecckboxes = $("tbody > tr.jqgrow > td:nth-child("+(indexOfMandatory+1)+") > input");
                
                $(mandatoryChecckboxes).each(function(index,item){
                	var rowIndex =mandatoryChecckboxes.index(item);
                	var exposeCheckbox = exposeChecckboxes.get(rowIndex);
                	var checked = $(exposeCheckbox).attr('checked');
                	if(checked!='checked'){
                		$(item).attr('disabled',true);
                	}else{
                		$(item).attr('disabled',false);
                	}
                });
                $(exposeChecckboxes,this).click(function(e) {
                	var rowIndex = exposeChecckboxes.index(this);
                	var mandatoryCheckbox = mandatoryChecckboxes.get(rowIndex);
                	var checked = $(this).is(':checked');
                	if(checked==false){
                		$(mandatoryCheckbox).attr('disabled',true).attr('checked',false);
                	}else{
                		$(mandatoryCheckbox).attr('disabled',false).attr('checked',false);
                	}
                });

                var tr = $('#quietPeriod').closest('tr');
                if(tr && tr.length > 0){
                    var rowId = tr.attr('id');
                    subscription.sspTable.setCell(rowId,1,'','',{'title':subscription.sspTable.getRowData(rowId).externalObject.split(',')[1]});
                }

        		$('#quietPeriod').click(function(e) {
        			e.stopPropagation();
                    if (!me.pubDialogOpen) {
                        EB_Common.dialog.dialog('quietPeriodSetting', {
                            autoOpen: false,
                            title: i18n['Quiet Period Settings'],
                            height:680,
                            buttons : {
                                Ok : {
                                    click : function() {
                                    	var quietPeriodSetting = {};
                                    	var enableAll =  $('#enableAll').is(':checked');
                                    	quietPeriodSetting.enabled = enableAll;
                                    	var quietPeriods = [];
                                		if(enableAll){
                                			var inputs = $('input[name="category"]').filter(':checked');
                                			inputs.each(function() {
                                				var quietPeriod = {};
                                				var me = $(this), container = me.closest('li').find('div');
                                				quietPeriod.weatherType ={};
                                				quietPeriod.weatherType.id = me.next().attr('name');
                                				quietPeriod.newEnabled = container.find('input[type="checkbox"]:eq(0)').is(':checked');
                                				quietPeriod.allClearEnabled = container.find('input[type="checkbox"]:eq(1)').is(':checked');
                                				quietPeriods.push(quietPeriod);
                                            });
                                			quietPeriodSetting.overrides = quietPeriods;

                                            var quietPeriod = {};
                                            quietPeriod.timeZoneId = $('#timeZone option:selected').val();
                                            quietPeriod.startHours = $('#startTime option:selected').val();
                                            quietPeriod.endHours = $('#endTime option:selected').val();
                                            quietPeriod.startMeridiem = $('#startMeridiem option:selected').val();
                                            quietPeriod.endMeridiem = $('#endMeridiem option:selected').val();
                                            quietPeriodSetting.organizationQuietPeriod = quietPeriod;
                                        }


                                		var json = EB_Common.json.stringify(quietPeriodSetting);
                                		EB_Common.Ajax.post("/settings/sspconfig/subScriptions/quietPeriod", {
                                			quietPeriodSetting : json
                                		}, function(data) {
                                            subscription.quitePeriodSetting = data;
                                        },"json");
                                		$(this).dialog("close");
                                    },
                                    'class' : 'orange',
                                    text : i18n['button.save']
                                },
                                Cancel : {
                                    click : function() {
                                        $(this).dialog("close");
                                    },
                                    'class' : 'gray',
                                    text : i18n['global.dialog.button.cancel']
                                }

                            },
                            open: function(event, ui) {

                            }
                        });
                        me.pubDialogOpen = true;
                    }
                    subscription.initQuietPeriodSetting();
                    $('#quietPeriodSetting').dialog('open');
                });
            }
		});
	}

    subscription.isEmpty = function (obj) {
        for (var enabled in obj) {
            return false;
        }
        return true;
    };

    subscription.initQuietPeriodSetting = function () {
        var quietPeriodSetting = subscription.quitePeriodSetting;
        if (subscription.isEmpty(quietPeriodSetting)) {
            return;
        }
        $('#override').find('input[type="checkbox"]').attr('checked',false);
        $('#override').find('li').each(function(){
            var li =$(this);
            li.find('input[type="checkbox"]').attr('checked',false);
            li.find('div').hide();
        });

        $('#enableAll').attr('checked',quietPeriodSetting.enabled);
        if(!quietPeriodSetting.enabled) {
            $('#override').hide();
            $('#quietPeriodTime').hide();
            return;
        }
        $('#quietPeriodTime').show();
        $('#override').show();
        var overrides = quietPeriodSetting.overrides;
        var length = overrides.length;
        for (var i=0; i<length; i++){
            var override= overrides[i];
            var span = $('#'+override.weatherType.id);
            if(override.newEnabled || override.allClearEnabled){
                span.find('div').show();
            }
            var inputs = span.find('input[type="checkbox"]');
            $(inputs[0]).attr('checked',override.newEnabled || override.allClearEnabled);
            $(inputs[1]).attr('checked',override.newEnabled);
            $(inputs[2]).attr('checked',override.allClearEnabled);
        }
        var quietPeriod = quietPeriodSetting.organizationQuietPeriod;
        $('#timeZone').val(quietPeriod.timeZoneId);
        $('#startTime').val(quietPeriod.startHours);
        $('#endTime').val(quietPeriod.endHours);
        $('#startMeridiem').val(quietPeriod.startMeridiem);
        $('#endMeridiem').val(quietPeriod.endMeridiem);
    };

	subscription.changeWeatherTopicStatus = function(element, id,type) {
        var me = $(element);
        var weatherGroupId;
        if(type == 'new'){
            weatherGroupId = me.closest('td').next().next().attr("title").split(",")[1];
        } else{
            weatherGroupId = me.closest('td').next().attr("title").split(",")[1];
        }
        EB_Common.Ajax.post("/settings/contact/subscription/modifyStatus", {
        	weatherGroupId : $.trim(weatherGroupId),
            type:type
        }, function(data) {
            if (data.status == "yes") {
                me.toggleClass("off");
            } else {
                EB_Common.dialog.alert(i18n[data.status],i18n['dialog.title.warning']);
            }
        });
    };

	getColumnIndexByName = function(columnName) {
        var cm = subscription.sspTable.jqGrid('getGridParam','colModel'),i=0,l=cm.length;
        for (; i<l; i++) {
            if (cm[i].name===columnName) {
                return i;
            }
        }
        return -1;
    };
    
	function bindSave(button) {
		var rows = subscription.sspTable.getGridParam("reccount");
		var rowDatas = [];
		for ( var count = 1; count < rows + 1; count++) {
			var sspConfigItem = {};
			rowdata = subscription.sspTable.jqGrid('getRowData', count);
			sspConfigItem.itemName = rowdata["itemName"];
			sspConfigItem.expose = rowdata["expose"];
			sspConfigItem.mandatory = rowdata["mandatory"];
			sspConfigItem.enabled = rowdata["enabled"];
			sspConfigItem.editable = rowdata["editable"];
			sspConfigItem.externalObject = rowdata["externalObject"];
			rowDatas[count - 1] = sspConfigItem;
		}
		if (rowDatas.length == 0) {
			return;
		}

		var json = EB_Common.json.stringify(rowDatas);
		EB_Common.Ajax.post("/settings/sspconfig/saveSSPOptions", {
			rs : json,
			type : subscription.sspType,
			time:new Date()
		}, function(data) {
			if (data.status != "yes") {
				EB_Common.dialog.alert(i18n[data.status],i18n['dialog.title.warning']);
			} else {
				EB_Common.ToolPrompt.show(button.data.buttonId,i18n['glocal.savesuccess']);
				subscription.sspTable.trigger("reloadGrid");
				EB_Common.LeavePage.resetState();
			}
		}, "json");
	}
	view.ssp = subscription;
})(EB_View);