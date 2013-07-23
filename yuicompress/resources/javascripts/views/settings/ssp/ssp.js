(function(view) {
	var externalIdIndex=4;
	var sspNameSpace = {};
	sspNameSpace.init = function(tableName, sspType, saveButton, columnProperty) {
		sspNameSpace.tableName = tableName;
		sspNameSpace.sspType = sspType;
		sspNameSpace.saveButton = saveButton;

		initTable(columnProperty);
		
		$("#" + sspNameSpace.saveButton).bind('click', {buttonId:saveButton},bindSave);
		
	};

	function initTable(columnProperty) {
		var group = 1;
		sspNameSpace.sspTable = $("#" + sspNameSpace.tableName);
		sspNameSpace.sspTable.jqGrid({
			autoencode:true,
			url : EB_Common.Ajax.wrapperUrl('/settings/sspconfig/listSspOptions?type='
					+ sspNameSpace.sspType),
			datatype : "json",
			emptyDataCaption : i18n['global.grid.emptyDataCaption'],
			height : "auto",
			autowidth:true,
			title:true,
			colNames : ['', i18n['setting.contact.subscriptionFields.group'],'', i18n['sspconfig.field.name'],
					i18n['sspconfig.field.expose'],
					i18n['sspconfig.field.editable'],
					i18n['sspconfig.field.enabled'],
					i18n['sspconfig.field.mandatory'],
					i18n['global.status'],
					i18n['sspconfig.field.externalobject'] ],
			colModel : [ 
			             {
				name : 'externalObject',
				index : 'expandIcon',
				hidden : columnProperty.expandIcon,
				width : 10,
				sortable : false,
				formatter : function(value, rec) {
					if(sspNameSpace.tableName=='subscriptionsTable' && value.indexOf('TopicGroup') == 0)
						return '<span group=group_' + group++ + ' class="icon_arrow_expand"></span>';
					else return '';
				}
			},{
				name : 'externalObject',
				index : 'itemName',
				hidden : columnProperty.expandIcon,
				width : 80,
				sortable : false,
				formatter : function(value, rec) {
					value = $.jgrid.htmlEncode(value);
					if(sspNameSpace.tableName=='subscriptionsTable' && value.indexOf('TopicGroup') != -1){
						var values = value.split("#");
						var name;
						if(values.length > 2){
							name = '--';
						}else{
							name = values[1]
						}
						return '</span><b>' + name + '</b>';
					}else return "";
				}
			},{
				name : 'itemName',
				index : 'expandIcon',
				hidden : columnProperty.expandIcon,
				width : 10,
				sortable : false,
				formatter : function(value, rec) {
					if(sspNameSpace.tableName=='subscriptionsTable' && value != "" && value==$.trim(value))
						return '<span class="icon_arrow_expand"></span>';
					else return '';
				}
			},{
				name : 'itemName',
				index : 'itemName',
				width : 280,
				sortable : false,
				formatter : function(value, rec) {
					value = $.jgrid.htmlEncode(value);
					if(sspNameSpace.tableName=='subscriptionsTable' && value==$.trim(value))
						return '</span><b>' + value + '</b>';
					else return value;
				}
			},{
				name : 'expose',
				index : 'expose',
				hidden : columnProperty.expose,
				width : 100,
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
				name : 'editable',
				index : 'editable',
				hidden : columnProperty.editable,
				width : 170,
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
			}, {
				name : 'enabled',
				index : 'enabled',
				hidden : columnProperty.enabled,
				width : 120,
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
			}, {
				name : 'mandatory',
				index : 'mandatory',
				hidden : columnProperty.mandatory,
				width : 100,
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
                name : 'topicStatus',
                index : 'topicStatus',
                editable : true,
                sortable : false,
                hidden : columnProperty.status,
                formatter : function(value, rec) {
                    var startDiv = '';
                    if (value == "Active") {
                        startDiv += '<b class="b-grid-status" onclick="EB_View.ssp.changeWeatherTopicStatus(this,' + rec.rowId + ');"></b>';
                    } else if(value == "Inactive"){
                        startDiv += '<b class="b-grid-status off" onclick="EB_View.ssp.changeWeatherTopicStatus(this,' + rec.rowId
                                + ');"></b>';
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
                var indexOfEditable=getColumnIndexByName('editable');
                var editableChecckboxes = $("tbody > tr.jqgrow > td:nth-child("+(indexOfEditable+1)+") > input");
                $(editableChecckboxes).each(function(index,item){
                	var rowIndex =editableChecckboxes.index(item);
                	var exposeCheckbox = exposeChecckboxes.get(rowIndex);
                	var checked = $(exposeCheckbox).attr('checked');
                	if(checked!='checked'){
                		$(item).attr('disabled',true);
                	}else{
                		$(item).attr('disabled',false);
                	}
                });
                
                
                var indexOfMandatory=getColumnIndexByName('mandatory');
                var mandatoryChecckboxes = $("tbody > tr.jqgrow > td:nth-child("+(indexOfMandatory+1)+") > input");
                $(mandatoryChecckboxes).each(function(index,item){
                	var rowIndex =mandatoryChecckboxes.index(item);
                	var editableCheckbox = editableChecckboxes.get(rowIndex);
                	var checked = $(editableCheckbox).attr('checked');
                	if(checked!='checked'){
                		$(item).attr('disabled',true);
                	}else{
                		$(item).attr('disabled',false);
                	}
                	if(index==externalIdIndex){
                		$(item).attr('disabled',true);
                	}
                });
                
                $(exposeChecckboxes,this).click(function(e) {
                	var rowIndex = exposeChecckboxes.index(this);
                	var editabledCheckbox = editableChecckboxes.get(rowIndex);
                	var mandatoryCheckbox = mandatoryChecckboxes.get(rowIndex);
                	var checked = $(this).is(':checked');
                	if(checked){
                		$(editabledCheckbox).attr('disabled',false).attr('checked',false);
                	}else{
                		$(editabledCheckbox).attr('disabled',true).attr('checked',false);
                		$(mandatoryCheckbox).attr('disabled',true).attr('checked',false);
                	}
                	if(sspNameSpace.sspType=='Contact Path'){
                		sspNameSpace.initSelector(editableChecckboxes, mandatoryChecckboxes);
                	}
                });
                
                $(editableChecckboxes,this).click(function(e) {
                	var rowIndex = editableChecckboxes.index(this);
                	var mandatoryCheckbox = mandatoryChecckboxes.get(rowIndex);
                	var checked = $(this).is(':checked');
                	if(checked){
                		$(mandatoryCheckbox).attr('disabled',false).attr('checked',false);
                	}else{
                		$(mandatoryCheckbox).attr('disabled',true).attr('checked',false);
                	}
                	
                	if(sspNameSpace.sspType=='Contact Path'){
                		sspNameSpace.initSelector(editableChecckboxes, mandatoryChecckboxes);
                	}
                	if(rowIndex==externalIdIndex){
                		$(mandatoryCheckbox).attr('checked',checked);
                		$(mandatoryCheckbox).attr('disabled',true);
                	}
                });
                
                if(sspNameSpace.sspType=='Contact Path'){
                	sspNameSpace.initSelector(editableChecckboxes, mandatoryChecckboxes);
                	 $(mandatoryChecckboxes,this).click(function(e) {
                		 sspNameSpace.initSelector(editableChecckboxes, mandatoryChecckboxes);
                	 });
                }
                
                if(sspNameSpace.sspType=="User Profile Setting"){
                	var trs = $("tbody > tr.jqgrow");
                	for ( var index = 0; index < 2; index++) {
						var tr = $(trs[index]);
						var indexOfExpose=getColumnIndexByName('expose');
						var indexOfEditable=getColumnIndexByName('editable');
						var indexOfMandatory=getColumnIndexByName('mandatory');
						var expose = tr.find("td:nth-child("+(indexOfExpose+1)+") > input");
						var editable = tr.find("td:nth-child("+(indexOfEditable+1)+") > input");
						var mandatory = tr.find("td:nth-child("+(indexOfMandatory+1)+") > input");
						expose.attr('disabled',true).attr('checked',true);
						if(columnProperty.publiced == 'true'){
							editable.attr('disabled',true).attr('checked',true);
						}else{
							editable.attr('disabled',false);
							editable.unbind();
						}
						mandatory.attr('disabled',true).attr('checked',true);
					}
                }
            }
		});
	}
	
	sspNameSpace.initSelector = function(editableChecckboxes, mandatoryChecckboxes){
		var editableCount = editableChecckboxes.filter(':checked').length;
    	var mandatoryCount = mandatoryChecckboxes.filter(':checked').length;
    	var minContactPathNum = parseInt($('#minContactPathNum').val());
    	minContactPathNum = minContactPathNum > editableCount ? editableCount : minContactPathNum;
    	minContactPathNum = minContactPathNum < mandatoryCount ? mandatoryCount :minContactPathNum;
    	var selector = $('#contactPathmax');
    	selector.find('option').remove();
    	for(var i = mandatoryCount; i <= editableCount; i++){
    		var option = $('<option></option>').val(i).text(i);
    		selector.append(option);
    	}
    	selector.val(minContactPathNum);
	};
	
	getColumnIndexByName = function(columnName) {
        var cm = sspNameSpace.sspTable.jqGrid('getGridParam','colModel'),i=0,l=cm.length;
        for (; i<l; i++) {
            if (cm[i].name===columnName) {
                return i;
            }
        }
        return -1;
    };
    
	function bindSave(button) {
		var rows = sspNameSpace.sspTable.getGridParam("reccount");
		var rowDatas = [];
		for ( var count = 1; count < rows + 1; count++) {
			var sspConfigItem = {};
			rowdata = sspNameSpace.sspTable.jqGrid('getRowData', count);
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
		var min = 0;
		if(sspNameSpace.sspType=='Contact Path'){
			min = $('#contactPathmax').val();
		}
		EB_Common.Ajax.post("/settings/sspconfig/saveSSPOptions", {
			min:min,
			rs : json,
			type : sspNameSpace.sspType,
			time:new Date()
		}, function(data) {
			if (data.status != "yes") {
				EB_Common.dialog.alert(i18n[data.status],i18n['dialog.title.warning']);
			} else {
				EB_Common.ToolPrompt.show(button.data.buttonId,i18n['glocal.savesuccess']);
				sspNameSpace.sspTable.trigger("reloadGrid");
				if(sspNameSpace.sspType=='Contact Path'){
					$('#minContactPathNum').val(min);
				}
				EB_Common.LeavePage.resetState();
			}
		}, "json");
	}

	sspNameSpace.fileupload = function() {
		var valid = $('#uploadImgForm').valid();
		if(!valid){
			return;
		}
		var options = {
				url: EB_Common.Ajax.wrapperUrl("/settings/sspconfig/uploadBannerFile") ,
				type : 'POST',
				dataType : 'json',
				success : function(data) {
					if (data.success) {
						EB_Common.ToolPrompt.show('fileLoad',i18n['glocal.savesuccess']);
						d = new Date();
						var src = $("#bannerImg").attr("src");
						$("#bannerImg").attr("src", src+"?t="+d.getTime());
						$('#showImgDiv').show();
						EB_Common.LeavePage.resetState();
					} else {
						EB_Common.dialog.alert(i18n['sspconfig.alert.banner.upload.error'],i18n['dialog.title.warning']);
					}
				},
				failure:function(data){
					EB_Common.dialog.alert(i18n['sspconfig.alert.banner.upload.error'],i18n['dialog.title.warning']);
				}
			};
			$('#uploadImgForm').ajaxSubmit(options);
	};
	
	sspNameSpace.deleteImg = function() {
		EB_Common.Ajax.get(
				"/settings/sspconfig/deleteBannerFile/",{time:new Date()},
				function(data) {
					if (data.status != "yes") {
						EB_Common.dialog.alert(i18n[data.status],i18n['dialog.title.warning']);
					} else {
						d = new Date();
						var src = $("#bannerImg").attr("src");
						$("#bannerImg").attr("src", src+"?t="+d.getTime());
						$('#showImgDiv').hide();
					}
				}, "json");
	};
	
	view.ssp = sspNameSpace;
})(EB_View);