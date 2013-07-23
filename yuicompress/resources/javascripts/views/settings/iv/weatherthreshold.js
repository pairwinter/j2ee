(function(view) {
    var weatherThreshold = {};

    weatherThreshold.init = function() {
        weatherThreshold.initPage();
        weatherThreshold.initAddThresholdButton();
        weatherThreshold.initWeatherWarningTypes();
        weatherThreshold.initConditions();
        weatherThreshold.initValidationRules();
        $("#weatherEvents").delegate(":checkbox", "click", weatherThreshold.clickEventCheckbox);
        $('#thresholdsTable').jqGrid({
            autoencode : true,
            url : EB_Common.Ajax.wrapperUrl('/settings/iv/weatherThreshold/listThresholds'),
            height : 175,
            datatype : 'json',
            emptyDataCaption : i18n['global.grid.emptyDataCaption'],
            autowidth : true,
            colNames : [ '', i18n['weatherthreshold.field.thresholdname'],
                    i18n['weatherthreshold.field.category'], i18n['weatherthreshold.field.condition'],
                    i18n['weatherthreshold.field.notification'], i18n['global.status'], '' ],
            colModel : [
                    {
                        width : 5
                    },
                    {
                        name : 'name',
                        index : 'name'
                    },
                    {
                    	name : 'weatherServices',
                        index : 'weatherServices',
                        width : 100,
                        sortable : false,
                        formatter : weatherThreshold.renderWarningType
                    },
                    {
                        name : 'actions',
                        index : 'actions',
                        sortable : false,
                        formatter : weatherThreshold.renderConditions
                    },
                    {
                        name : 'notificationTitleContent',
                        index : 'notificationTitleContent',
                        sortable : false
                    },
                    {
                        name : 'thresholdStatus',
                        index : 'thresholdStatus',
                        editable : true,
                        formatter : weatherThreshold.statusRender
                    },
                    {
                        name : 'id',
                        index : 'id',
                        sortable : false,
                        width : 60,
                        formatter : function(value, rec) {
                            return '<a class="icn_edit_16" title="'+i18n['button.edit']+'" onclick="EB_View.weatherThreshold.bindCurrentThresholdTableEditEvent('
                                    + value
                                    + ',this);" href="javascript:void(0);"></a>&nbsp;<a class="icn_trash_16" title="'+i18n['button.delete']+'" onclick="return EB_View.weatherThreshold.bindCurrentThresholdTableRemoveEvent('
                                    + value + ');" href="javascript:void(0);"></a>';
                        }
                    }

            ],
            rowNum : "totalCount",
            jsonReader : {
                root : "data",
                page : "currentPageNo",
                total : "totalPageCount",
                records : "totalCount",
                repeatitems : false
            },
            gridComplete: function(){
                var gridTable = $("#thresholdsTable")[0];
                var headers = gridTable.grid.headers;
                var p = gridTable.p;
                var len = headers.length;
                if($('#setColumnsDiv').length == 0){
                    $('<div class="text-right"><span id="setColumnsDiv" class="b-customized-columns">&nbsp;</span></div>').appendTo(headers[len - 1].el);
                    $('#setColumnsDiv').click(function(){
                        var customizedColDialog = $('#customizedColDialog');
                        if(customizedColDialog.length == 0){
                            var html = '<ul class="b-distance">';
                            customizedColDialog = $('<div id="customizedColDialog"/>').appendTo($('#gridPanel'));
                            for(var i=0;i<p.colNames.length;i++){
                                if(!p.colModel[i].hidedlg && p.colNames[i]) { 
                                    html += "<li><input type='checkbox' colindex='" + i + "' class='margin5-R' id='col_" + p.colModel[i].name + "' class='cbox' value='T' " + 
                                    ((p.colModel[i].hidden===false)?"checked":"") + "/>" +  "<label for='col_" + p.colModel[i].name + "'>" + p.colNames[i] + ((p.colnameview) ? " (" + p.colModel[i].name + ")" : "" )+ "</label></li>";
                                }
                            }
                            html += '</ul>';
                            customizedColDialog.append(html);
                            EB_Common.dialog.dialog('customizedColDialog',{
                                autoOpen: 'false',
                                title: 'Show/Hide Columns',
                                width: 300,
                                height: 'auto',
                                buttons: {
                                    Ok: {
                                        click: function() {
                                            var lis = $(this).find('li');
                                            for (var i = 0; i < lis.length; i++) {
                                                var colEl = $(lis[i]).children('input');
                                                var colindex = colEl.attr('colindex');
                                                if(colEl.attr("checked")) {
                                                    $('#thresholdsTable').jqGrid("showCol",p.colModel[colindex].name);
                                                } else {
                                                    $('#thresholdsTable').jqGrid("hideCol",p.colModel[colindex].name);
                                                }
                                            }
                                            $('#thresholdsTable').jqGrid('resizeGrid');
                                            $(this).dialog("close");
                                        },
                                        'class': 'orange',
                                        text: i18n['global.dialog.button.ok']
                                    },
                                    Cancel: {
                                        click: function() {
                                            $(this).dialog("close");
                                        },
                                        'class': 'gray',
                                        text: i18n['global.dialog.button.cancel']
                                    }
                                }
                            });
                        }
                        $('#customizedColDialog').dialog('open');
                    });
                }
            }
        });
        
        $('#thresholdSaveButton').bind('click', weatherThreshold.bindSaveThreshold);
        $('#launchBroadcast').bind('click', weatherThreshold.checklaunchBroadcast);

        $("#addNewAddress").click(function() {
	        var geoAddressTableCount = $('#address_div .subdiv_graybox .table_infor').size();
	        if (geoAddressTableCount >= 4) {
	            $("#add_adress_btn").hide();
	        }
	
	        var newTable = $("#clone_tb div:first").clone(true, true);
	
	        var select = newTable.find("select[name='address[x].country']");
	        var options = $("#selectCountries_select > option").clone();
	        select.append(options);
	
	        $("#address_div").append(newTable);
	        if (geoAddressTableCount > 0) {
	            $('<strong class="orAddress">'+i18n['setting.weather.widget.address.more']+'</strong>').insertBefore(newTable);
	        }
	    });
	    $("#addNewAddress").click();
	    $("#add_adress_btn").show();
	    $("a[name^='removeaddr']").click(function() {
	        if ($("#address_div > div").size() == 1) {
	            return;
	        }
	        var geoAddressTableCount = $('#address_div .subdiv_graybox .table_infor').size();
	        if (geoAddressTableCount <= 5) {
	            $("#add_adress_btn").show();
	        }
	        if ($(this).parent().parent().prev().is("strong")) {
	            $(this).parent().parent().prev().remove();
	        } else {
	            $(this).parent().parent().next().remove();
	        }
	
	        $(this).parent().parent().remove();
	
	    });
	
	    var geoLastSearch = {};
	    function checkGeoSearch(key, val) {
	        if (!geoLastSearch['"' + key + '"']) {
	            geoLastSearch['"' + key + '"'] = "";
	        }
	        if (geoLastSearch['"' + key + '"'] != val) {
	            geoLastSearch['"' + key + '"'] = val;
	            return false;
	        }
	        return true;
	    };
	    initGeoLastSearch = function() {
	        var tables = $("#address_div > table");
	
	        tables.each(function(i) {
	            var contry = $(this).find(":input[name$='.country']").val();
	            var streetAddress = $(this).find(":input[name$='.streetAddress']").val();
	            //				var suite = $(this).find(":input[name$='.suite']").val();
	            var city = $(this).find(":input[name$='.city']").val();
	            var state = $(this).find(":input[name$='.state']").val();
	            var postalCode = $(this).find(":input[name$='.postalCode']").val();
	            geoLastSearch['"' + i + '"'] = contry + " " + state + " " + streetAddress + " " + city + " "
	                    + postalCode;
	        });
	    };
	    initGeoLastSearch();
	    $(".searchForGeoAddress").blur(function() {
            var isSameAsLast = true;
            var parentTable = $(this).parent().parent().parent();
            var isValid=parentTable.find(':input[name$=".streetAddress"]').valid()&&
                    parentTable.find(':input[name$=".city"]').valid()&&
                    parentTable.find(':input[name$=".state"]').valid()&&
                    parentTable.find(':input[name$=".postalCode"]').valid();
            if(!isValid){
                return;
            }
            var tableIndex = $("#address_div > table").index(parentTable.parent());
            var contry = parentTable.find(":input[name$='.country']").val();
            var streetAddress = parentTable.find(":input[name$='.streetAddress']").val();
            //							var suite = parentTable.find(
            //									":input[name$='.suite']").val();
            var city = parentTable.find(":input[name$='.city']").val();
            var state = parentTable.find(":input[name$='.state']").val();
            var postalCode = parentTable.find(":input[name$='.postalCode']").val();
            /*isSameAsLast = checkGeoSearch(tableIndex, contry + " " + state + " " + streetAddress + " " + city + " " + postalCode) && isSameAsLast;
            if (isSameAsLast) {
                return;
            }*/
            var selectGeo = parentTable.find(".selectForGeoLocation");
            selectGeo.find("option:gt(0)").remove();
            selectGeo.find("option:eq(0)").text(i18n['setting.iv.weather.search']);
            if (contry && streetAddress && city && state) {
                EB_Common.Ajax.post('/settings/iv/weatherThreshold/getgeo/json', {
                    country : contry,
                    adminDistrict : state,
                    addressLine : streetAddress + " " + city,
                    postalCode : postalCode
                }, function(data) {
                    if (data && data.length > 0) {
                        $(data).each(
                                function(i, e) {

                                    var option = $("<option>").attr("lon", e.longitude).attr("lat",
                                            e.latitude).text(e.addressLine + " " + e.country);
                                    selectGeo.append(option);
                                    parentTable.find(".tr_geo_location_alertmessage").hide();
                                });
                    } 
                }, 'json');
            }
        });
	    $(".selectForGeoLocation").change(function() {
	        if ($(this).val()) {
	            var option = $(this).find("option:selected");
	            var parentTable = $(this).parent().parent().parent();
	            parentTable.find(".tr_geo_location").show(); //error-right
	            var lon = parentTable.find(":input[name$='.gisLocation.lon']");
	            var lat = parentTable.find(":input[name$='.gisLocation.lat']");
	            var lonVal = option.attr("lon");
                var latVal = option.attr("lat");
                if(lonVal && latVal){
	                lon.val(lonVal);
	                lat.val(latVal);
                }
	            lon.removeClass("error");
	            lat.removeClass("error");
	            lon.next(".error-right").remove();
	            lat.next(".error-right").remove();
	        }
	    }); 
	    
	    
	    // locate the region 
	    // @author Linder Wang
        var latDefault = 37.09024,
        	lngDefault = -95.712891,
        	callbackFn = function(ct, data){
        		if(!data){
        			return;
        		}
        		var city = data.city,
        		    state = data.state,
        			address = data.address,// ? data.address.substring(0, data.address.lastIndexOf(',')) : '',
        			latitude = data.latitude,
		        	longitude = data.longitude,
		        	postalCode = data.postalCode;
		        ct.find('input[name*="city"]').val(city);
		        ct.find('input[name*="state"]').val(state);
		    	ct.find('input[name*=streetAddress]').val(address);
		    	ct.find('input[name*=postalCode]').val(postalCode);
		        ct.find('input[name*="gisLocation.lon"]').val(longitude).valid();
        	    ct.find('input[name*="gisLocation.lat"]').val(latitude).valid();
        	    
        	    ct.find('input[name$=streetAddress]').blur();
        	    
        	};
		EB_Common.Ajax.ajax({
        	url : '/settings/gis/mapcenter',
        	type : 'get',
        	dataType : 'json',
            async : false,
        	success : function(resData){
        		latDefault = resData.latitude || latDefault;
        		lngDefault = resData.longitude || lngDefault;
        	}
        });
           
        $('#address_div').on('click', 'a[name="locateInMap"]', function(e){
        	e.preventDefault();
        	var ct = $(e.target).closest('table'),
        	    lngE = ct.find('input[name*="gisLocation.lon"]'),
        	    latE = ct.find('input[name*="gisLocation.lat"]'),
        	    country = ct.find('input[name*="country"]').val(),
        	    city = ct.find('input[name*="city"]').val(),
        	    state = ct.find('input[name*="state"]').val(),
		    	address = $.trim(ct.find('input[name*=streetAddress]').val()),
		    	postalCode = $.trim(ct.find('input[name*=postalCode]').val()),
		    	latVal,
		    	lngVal;
		    
		    latVal = latE.valid() ? latE.val() : '';
		    lngVal = lngE.valid() ? lngE.val() : '';
		    
		    //count latitude and longitude
		    var latitude = latDefault,
		    	longitude = lngDefault,
		        contryAddress,
		        isAddress;
		    
		    /*if(latVal != '' && lngVal != ''){
		    	latitude = latVal;
		    	longitude = lngVal;
		    // address + city + state + postalCode
		    }else*/ 
		    
		    if(address != '' || city != '' || state != '' || postalCode != ''){
		    	contryAddress = address + ',' + city + ',' + state + ',' + postalCode;
		    	isAddress = true;
		    }
		    
		    var regions = {
		        country : country,
        		city : city,
        		state : state,
        		address : address,
		        postalCode : postalCode,
		        latitude : latitude,
				longitude : longitude,	
		    	contryAddress : contryAddress,
				isAddress : isAddress
		    };
		    
		    EB_Common.gmaps.initialize({
                limits:'US',
                callbackFn: callbackFn,
		    	locatedCt: ct,
                regions: regions
		    });
        });
    };
    
    
    weatherThreshold.initValidationRules = function() {
        $.validator.addMethod('atLeastOneBroadCastTemplete', function(value, ele) {
            return $('#broadcatTemplates2').find("li").length >= 1;
        }, i18n['twitterthreshold.customer.validatemessage.selectbroadcasttemplate']);

        $.validator.addMethod('atLeastOneService', function(value, ele) {
        	if($('input[name="weatherType"]:checked').val() == 'all'){
        		return true;
        	}else{
        		return $('input[name="weatherService"]:checked').length >= 1;
        	}
        }, i18n['weatherthreshold.customer.validatemessage.selectWarning']);
        $.validator.addMethod('atLeastOneCondition', function(value, ele) {
            return $('#condition').find("input:checked").length >= 1;
        }, i18n['weatherthreshold.customer.validatemessage.selectcondition']);

        var pattern = /^[0-9]{5}((-)?[0-9]{4})?$/;
        $.validator.addMethod('postalcode', function(value, ele) {
            if (value == '')
                return true;
            return pattern.test(value);
        }, i18n['weatherthreshold.customer.validatemessage.postalcode']);
        
        $.validator.addMethod('searchForGeoAddress',function(value,element){
            return !(/[\[\]\!\@\$\%\^\&\*\?\<\>\\\:]/.test(value));
        },i18n['global.valid.text.addressInfo']);

    };

    weatherThreshold.initAddThresholdButton = function() {
        $('#addBtn').click(
                function() {
                    var value = $('#thresholdId').val();
                    if (value.length != 0) {
                        EB_Common.dialog.confirm(i18n['weatherthreshold.dialog.canceleditdata'],
                                i18n['global.dialog.title.confirm'], function() {
                                    $(this).dialog("close");
                                    weatherThreshold.cleanEditPanel();
                                });
                    }

                });
    };

    weatherThreshold.bindStatrtEvent = function() {
        var checked = $("#statrtEvent").attr('checked');
        if (checked == 'checked') {
            $('#statrtEventText').removeAttr('disabled');
            $('#statrtEventText').rules("add", {
                required : true
            });
        } else {
            $('#statrtEventText').attr('disabled', true).val('');
            $('#statrtEventText').val('').removeData().rules("remove");
            $('#statrtEventText').valid();
        }
    };

    weatherThreshold.initPage = function() {
    	$("input[name='weatherType']").change(function(){
    		var weatherWarningTypeTr = $("#weatherWarningTypeTr");
    		if($(this).val() == 'all'){
//    			weatherWarningTypeTr.hide();
    		}else{
//    			weatherWarningTypeTr.show();
    		}
    	});
    	
        $('.b-panel-bwrap .b-panel-title').click(
			function() {
				var me = $(this), container = me.next(),
				    icon = me.find('.icon_tabpanel_expand');                             
				if (icon.hasClass('collapsed')) {
					icon.removeClass('collapsed');
					container.show();
                    container.find('#thresholdsTable').jqGrid('resizeGrid');
				} else {
					icon.addClass('collapsed');
					container.hide();
				}
			});

        $('#addBtn').click(
                function() {
                    var formPanel = $('#formPanel'), title = formPanel.find('.b-panel-title .title');
                    formPanel.show();
                    if (formPanel.hasClass("edit")) {
                        title.text(i18n['weatherthreshold.text.addweatherthreshold']);
                    }
                });

        var weatherGrid = $('#thresholdsTable');
        weatherGrid.find('tbody tr td b.b-grid-status').click(function() {
            var status = $(this);
            if (status.hasClass('off')) {
                status.removeClass('off');
            } else {
                status.addClass('off');
            }
        });

        weatherGrid.find('tbody tr td a.icon_edit').click(function() {
            var formPanel = $('#formPanel'), title = formPanel.find('.b-panel-title .title'), form = formPanel
                    .find('form');
            formPanel.show();
            form[0].reset();
            formPanel.addClass("edit");
            title.text('Edit Threshold');
        });

        $('#panelCollapse').click(function() {
            var collapse = $(this), gridPanel = $('#gridPanel');
            if (collapse.hasClass('extend')) {
                gridPanel.hide();
                collapse.removeClass('extend');
            } else {
                gridPanel.show();
                collapse.addClass('extend');
            }

        });

        $('#searchBroadCastTempleteButton').click(function(e) {
            e.preventDefault();
            weatherThreshold.initBroadcastTemplate();
        });

        $('#statrtEvent').bind('click', weatherThreshold.bindStatrtEvent);

        $('#addWeatherThresholdForm').validate({
            rules : {
                'thresholdTemplateName' : {
                    required : true,
                    maxlength : 120,
                    remote : {
                        url : EB_Common.Ajax.wrapperUrl("/settings/iv/weatherThreshold/exists"),
                        type : "POST",
                        data : {
                            thresholdName : function() {
                                return $.trim($("#thresholdTemplateName").val());
                            },
                            thresholdId : function() {
                                return $('#thresholdId').val();
                            }
                        }
                    }
                }
            },
            messages : {
                'thresholdTemplateName' : {
                    remote : i18n['weatherthreshold.error.name.duplicate']
                }
            },
            submitHandler : function(form) {
                weatherThreshold.saveThreshold();
            }
        });
        
    };

    weatherThreshold.initBroadcastTemplate = function(e) {

        var title = $.trim($('#searchBroadCastTempleteText').val());
        if (title.length == 0)
            return;

        EB_Common.Ajax.get("/settings/iv/weatherThreshold/searchBroadCastList",{title : title},
	        function(data) {
	            if (data.status != "yes") {
	                EB_Common.dialog.alert(i18n[data.status],i18n['dialog.title.warning']);
	            } else {
	                var broadcastTemplates = data.broadcastTemplate;
	                var broadCastTemplateContent = '';
	                $.each(broadcastTemplates,function(index, item) {
                        if(item!=null && item.message!=null) {
                            var bcTemplate = $($("#bcTemplate").render(item));
                            $('#broadcatTemplates').append(bcTemplate) ;
                        }
                    });
	            }
	        });

    };

    weatherThreshold.renderWarningType = function(value, rec, rowObject) {
    	/*var warningTypes = '';
    	var weatherWarningType = $('#weatherEvents');
        for ( var count = 0; count < value.length; count++) {
        	var warningType = weatherWarningType.find('input[value="'+value[count]+'"]').closest('li').text();
        	warningTypes += warningType + '/';
        }
        return warningTypes.substring(0, warningTypes.length - 1);*/
        return "<a href='javascript:void(0);' onclick='EB_View.weatherThreshold.initWeatherEventTypes(\""+ value.join(',') +"\")'>"+ value.length +" weather alert type(s)</a>";
    };

    weatherThreshold.renderConditions = function(value, rec) {
        var conditionsContent = '';
        var arr = new Array();
        for ( var count = 0; count < value.length; count++) {
            var conditionName = i18n[("weatherthreshold.condition." + value[count])];
            if (jQuery.inArray(conditionName, arr) == -1) {
                arr.push(conditionName);
                conditionsContent += conditionName + "/";
            }
        }
        return conditionsContent.substring(0, conditionsContent.length - 1);
    };

    weatherThreshold.statusRender = function(value, rec) {
        var startDiv = '';
        if (value == "Active") {
            startDiv += '<b class="b-grid-status" onclick="EB_View.weatherThreshold.formatUnit(this,' + rec.rowId + ');"></b>';
        } else {
            startDiv += '<b class="b-grid-status off" onclick="EB_View.weatherThreshold.formatUnit(this,' + rec.rowId
                    + ');"></b>';
        }
        return startDiv;
    };

    weatherThreshold.formatUnit = function(element, id) {
        var me = $(element);

        EB_Common.Ajax.post("/settings/iv/weatherThreshold/modifyStatus", {
            thresholdId : id
        }, function(data) {
            if (data.status == "yes") {
                if (me.hasClass('off')) {
                    $(element).removeClass('off');

                } else {
                    $(element).addClass('off');
                }
                weatherThreshold.cleanEditPanel();
                weatherThreshold.getActiveAndInActiveThresholds();
            } else {
                EB_Common.dialog.alert(i18n[data.status],i18n['dialog.title.warning']);
            }
        });

    };

    var getColumnIndexByName = function(columnName) {
        var cm = $('#thresholdsTable').jqGrid('getGridParam', 'colModel'), i = 0, l = cm.length;
        for (; i < l; i++) {
            if (cm[i].name === columnName) {
                return i;
            }
        }
        return -1;
    };

    weatherThreshold.bindCurrentThresholdTableEditEvent = function(value, elem) {
        EB_Common.Ajax.post("/settings/iv/weatherThreshold/changeThresholdStatusToInactive", {
            thresholdId : value
        }, function(data) {
            if (data.status == "yes") {
                var indexOfStatus = getColumnIndexByName('thresholdStatus');
                var indexOfId = getColumnIndexByName('id');
                var idComponents = $("tbody > tr.jqgrow > td:nth-child(" + (indexOfId + 1) + ") > a.icn_edit_16");
                var statusComponents = $("tbody > tr.jqgrow > td:nth-child(" + (indexOfStatus + 1)
                        + ") > b.b-grid-status");
                var rowIndex = idComponents.index(elem);
                var statusComponent = statusComponents.get(rowIndex);
                EB_Common.Ajax.post("/settings/iv/weatherThreshold/getThreshold", {
                    thresholdId : value
                }, function(data) {
                    if (data.status == "yes") {
                        $(statusComponent).addClass('off');
                        var threshold = data.threshold;
                        weatherThreshold.repaintEditPanel(threshold);
                        weatherThreshold.getActiveAndInActiveThresholds();
                        if ($('#wt_tabpanel_expand_add').hasClass('collapsed')) {
                            $('#wt_tabpanel_expand_add').click();
                        }
                        
//                        $('#addWeatherThresholdForm').valid();
                        $("label.error").remove();
                        $(".error").removeClass("error");

                    } else {
                        EB_Common.dialog.alert(i18n[data.status],i18n['dialog.title.warning']);
                    }
                }, "json");

            } else {
                EB_Common.dialog.alert(i18n[data.status],i18n['dialog.title.warning']);
            }
        }, "json");
    };

    weatherThreshold.cleanEditPanel = function() {
        $('#thresholdTemplateName').val('').removeData().attr('disabled', false);
        $("input[name=weatherType][value=all]").attr("checked",true);
        $('#thresholdId').val('');
        $('#weatherEvents').find(':checkbox').attr("checked", false);
        $('#warnings').val('')
        $('#condition').html('');
        weatherThreshold.initConditions();
        $('#actionsTr').show();
        $('#statrtEventText').attr('disabled', true).val('');
        $('#statrtEventText').val('').removeData().rules("remove");
        $('#statrtEventText').valid();
        $('#statrtEvent').removeAttr('checked');
        $('#launchBroadcast').removeAttr('checked');
        $('#broadcatTemplates').html('');
        $('#broadcatTemplates2').html('');
        $('#searchBroadCastTempleteText').val('');
        $('#searchCt').hide();
        $(".toggleHidden").hide();
        $('#addNewTab').html(i18n['weatherthreshold.text.addweatherthreshold']);
        $("#address_div").html('');

        $("#add_adress_btn").show();
        $("#addNewAddress").click();
        $('#addBtn').hide();

    };
    
    weatherThreshold.initWeatherEvent = function(events){
    	var weatherServices = events.split(',');
    	var weatherWarningType = $('#weatherEvents');
    	weatherWarningType.find(':checkbox').attr("checked", false);
    	weatherWarningType.find('input[name="weatherService"]').each(function() {
    		var checkBox = $(this);
            if($.inArray(checkBox.val(),weatherServices) != -1 ){
            	checkBox.attr("checked", true);
            }else{
            	checkBox.attr("checked", false);
            }
        });
    	weatherWarningType.find('input[name="group"]').each(function() {
    		var checkbox = $(this), length = checkbox.closest('li').find(':checked').length;
    		
    		if(length > 0){
    			checkbox.attr("checked",true);
    		}else{
    			checkbox.attr("checked",false);
    		}
    	});
    	weatherThreshold.showOrHideActionList();
    };

    weatherThreshold.repaintEditPanel = function(threshold) {
        $('#addBtn').show();
        $('#addNewTab').text('Edit ' + threshold.name);
        $('#thresholdTemplateName').val(threshold.name).attr('disabled', false);
        $('#thresholdId').val(threshold.id);
        
        var weatherWarningType = $('#weatherEvents');
        var optionAmount = weatherWarningType.find('input[name="weatherService"]').size();
        var weatherServices = threshold.weatherServices
        var weatherTypeAmount = weatherServices.length;
        if(optionAmount == weatherTypeAmount){
        	$("input[name=weatherType][value=all]").attr("checked",true);
        }else{
        	$("input[name=weatherType][value=select]").attr("checked",true);
        	var events = weatherServices.join(',');
        	$('#warnings').val(events);
        	weatherThreshold.initWeatherEvent(events);
        }
        
        var conditions = threshold.actions;
        $('#condition').find('input[type=checkbox]').each(function() {
            var text = $(this).attr("name");
            $(this).attr("checked", false).attr('disabled', false);
            for ( var count = 0; count < conditions.length; count++) {
                if (text == conditions[count]) {
                    $(this).attr("checked", true);
                    break;
                }
            }
        });
        $('#sendDashboardAlert').attr('checked', threshold.alertTriggered);
        var selectBroadcastIds = threshold.broadcastTemplateIds;
        $("#broadcatTemplates").html('');
        weatherThreshold.clearlaunchBroadcast();
        if (threshold.sendingBroadcastEnabled) {
            if (threshold.event !== null && threshold.event.length != 0) {
                $('#statrtEvent').attr('checked', true);
                $('#statrtEventText').removeAttr('disabled');
                $('#statrtEventText').rules("add", {
                    required : true
                });
                $('#statrtEventText').attr('value', threshold.event);
            } else {
                $('#statrtEventText').attr('disabled', true).val('');
                $('#statrtEventText').val('').removeData().rules("remove");
                $('#statrtEventText').valid();
            }
            $('#launchBroadcast').attr('checked', true);
            $(".toggleHidden").removeAttr("style");
        } else {
            $('#launchBroadcast').attr('checked', false);
        }

        thresholdAddresses = threshold.thresholdAddresses;

        if (thresholdAddresses.length != 0) {
            $("#address_div").html('');
            $.each(thresholdAddresses, function(index, item) {
                var newTable = $("#clone_tb div:first").clone(true, true);
                $(newTable).find('input[name="address[x].locationName"]').val(item.locationName);
                $(newTable).find('input[name="address[x].streetAddress"]').val(item.streetAddress);
                $(newTable).find('input[name="address[x].suite"]').val(item.suite);
                $(newTable).find('input[name="address[x].city"]').val(item.city);
                $(newTable).find('input[name="address[x].state"]').val(item.state);
                $(newTable).find('input[name="address[x].postalCode"]').val(item.postalCode);
                $(newTable).find('select[name="address[x].country"]').attr("value", item.country);

                $(newTable).find('input[name="address[x].gisLocation.lon"]').val(item.gisLocation.lon);
                $(newTable).find('input[name="address[x].gisLocation.lat"]').val(item.gisLocation.lat);
                var select = newTable.find("select[name='address[x].country']");
                var options = $("#selectCountries_select > option").clone();
                select.append(options);
                $("#address_div").append(newTable);
                if (index > 0) {
                    $('<strong class="orAddress">'+i18n['setting.weather.widget.address.more']+' </strong>').insertBefore(newTable);
                }
                $(newTable).find(".tr_geo_location").show();

            });
            if (thresholdAddresses.length < 5) {
                $("#add_adress_btn").show();
            } else {
                $("#add_adress_btn").hide();
            }
        }

        if (selectBroadcastIds.length == 0)
            return;
        EB_Common.Ajax.post("/settings/iv/weatherThreshold/searchSelectedBroadCastList",{ids : selectBroadcastIds},
	        function(data) {
	            $("#searchCt").show();
	            if (data.status != "yes") {
	                EB_Common.dialog.alert(i18n[data.status],i18n['dialog.title.warning']);
	            } else {
	                var broadcastTemplates = data.broadcastTemplate;
	                var broadCastTemplateContent = '';
	                $.each(broadcastTemplates,
	                        function(index, item) {
	                                if(item!=null && item.message!=null){
	                                broadCastTemplateContent += "<li><a href='javascript:void(0);' title='Remove' class='icn_trash_16' onclick='EB_View.weatherThreshold.removeBroadCastTemplate(this);' id='"
	                                    + item.id + "'/>" + item.message.title + "</li>";
	                            }
	                        });
	                $('#broadcatTemplates2').html(broadCastTemplateContent);
	                $('#broadcatTemplates2 :checkbox').each(function() {
	                    var id = $(this).attr("id");
	                    $(this).attr("checked", false).attr('disabled', false);
	                    for ( var count = 0; count < selectBroadcastIds.length; count++) {
	                        if (id == selectBroadcastIds[count]) {
	                            $(this).attr("checked", true);
	                            break;
	                        }
	                    }
	                });
	            }
	        });
    };

    weatherThreshold.bindCurrentThresholdTableRemoveEvent = function(value) {
        EB_Common.dialog.confirm(i18n['global.threshold.deletemessage'], i18n['global.threshold.delete.comfirmtitle'],
                function() {
                    $(this).dialog("close");
                    EB_Common.Ajax.post("/settings/iv/weatherThreshold/removeThresholds", {
                        thresholdId : value
                    }, function(data) {
                        if (data.status != "yes") {
                            EB_Common.dialog.alert(i18n[data.status],i18n['dialog.title.warning']);
                        } else {
                            $("#thresholdsTable").jqGrid("setGridParam", {
                                loadComplete : function() {
                                    weatherThreshold.getActiveAndInActiveThresholds();
                                    weatherThreshold.cleanEditPanel();
                                }
                            }).trigger("reloadGrid");
                        }
                    }, "json");
                });
    };

    weatherThreshold.setSelectText = function(el, text) {
        var count = $(el).find('option').length;
        for ( var i = 0; i < count; i++) {
            if ($(el).get(0).options[i].text == text) {
                $(el).get(0).options[i].selected = true;
                $(el).attr('disabled', false);
                break;
            }
        }
    };

    weatherThreshold.bindSelectBoradcastTemplateTableRemoveEvent = function() {
        var selectBroadcastTemplateTable = $('#selectBroadcastTemplate');
        var selectRowId = selectBroadcastTemplateTable.jqGrid('getGridParam', 'selrow');
        if (selectRowId == null)
            return null;
        var rowData = selectBroadcastTemplateTable.jqGrid('getRowData', selectRowId);
        var broadcastTemplateTable = $('#broadcatTemplates');
        broadcastTemplateTable.jqGrid('addRowData', rowData.id, {
            id : rowData.id,
            category : rowData.category
        });
        selectBroadcastTemplateTable.jqGrid('delRowData', selectRowId);
    };

    weatherThreshold.bindBoradcastTemplateTableDoubleClick = function(rowid, iRow, iCol, e) {
        var broadcastTemplateTable = $('#broadcatTemplates');
        var rowData = broadcastTemplateTable.jqGrid('getRowData', rowid);
        var selectBroadcastTemplateTable = $('#selectBroadcastTemplate');
        var rowDatas = selectBroadcastTemplateTable.jqGrid('getRowData');
        if (rowDatas.length == 0) {
            broadcastTemplateTable.jqGrid('delRowData', rowid);
            $('#selectBroadcastTemplate').jqGrid('addRowData', rowData.id, rowData);
            return;
        }
        for ( var count = 0; count < rowDatas.length; count++) {
            if (rowDatas[count].id == rowData.id) {
                broadcastTemplateTable.jqGrid('delRowData', rowid);
                break;
            } else {
                broadcastTemplateTable.jqGrid('delRowData', rowid);
                $('#selectBroadcastTemplate').jqGrid('addRowData', rowData.id, rowData);
                break;
            }
        }

    };

    weatherThreshold.initWeatherWarningTypes = function() {
        var me = this;
        $('.group','#weatherEvents').click(function(){
            var me = $(this), container = me.next(), icon = me.prev();
            if(container.is(':hidden')){
                container.show();
                icon.addClass('expand');
            }else{
                container.hide();
                icon.removeClass('expand');
            }
        });
        $('input[name="weatherType"]').change(function(){
            if($(this).val() == 'all'){
                $('#warnings').valid();
            }
        });
        $('input[name="weatherType"]:eq(1)').next().click(function() {
            if($('input[name="weatherType"]:checked').val() == 'all'){
                return ;
            }

            if (!me.weatherEventOpen) {
                EB_Common.dialog.dialog('weatherEvents', {
                    autoOpen: false,
                    title: 'Weather Event Selection',
                    buttons : {
                        Ok : {
                            click : function() {
                                var inputs = $('input[name="weatherService"]').filter(':checked');
                                var types = [];
                                inputs.each(function() {
                                    types.push($(this).val());
                                });

                                $('#warnings').val(types.join(',')).valid();
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
                me.weatherEventOpen = true;
            }
            weatherThreshold.initWeatherEvent($('#warnings').val());
            $('#weatherEvents').dialog('open');
            return false;
        });
    };

    weatherThreshold.initWeatherEventTypes = function(data) {
        $('#readOnlyWeatherEvents li').hide();
        $('#readOnlyWeatherEvents i.expand').removeClass('expand');
        $('#readOnlyWeatherEvents ul:gt(0)').hide();
        var ids = data.split(',');
        $('#weatherEventsTitle').text('There are '+ ids.length +' weather alert type(s) selected');
        for(var i=0; i<ids.length; i++){
            var li = $('li[name="'+ ids[i] +'"]');
            li.show();
            li.parent().closest('li').show();
        }
        var me = this;

        if (!me.pubDialogOpen) {
            $('.group','#readOnlyWeatherEvents').click(function(){
                var me = $(this), container = me.next(), icon = me.prev();
                if(container.is(':hidden')){
                    container.show();
                    icon.addClass('expand');
                }else{
                    container.hide();
                    icon.removeClass('expand');
                }
            });
            EB_Common.dialog.dialog('readOnlyWeatherEvents', {
                autoOpen: false,
                title: 'Weather Event(s)',
                buttons : {
                    Ok : {
                        click : function() {
                            $(this).dialog("close");
                        },
                        'class' : 'orange',
                        text : i18n['global.dialog.button.ok']
                    }
                },
                open: function(event, ui) {

                }
            });
            me.pubDialogOpen = true;
        }
        $('#readOnlyWeatherEvents').dialog('open');
        return false;
    };


    weatherThreshold.getActiveAndInActiveThresholds = function() {
        EB_Common.Ajax.post("/settings/iv/weatherThreshold/getActiveAndInActiveThresholdNumber", function(data) {
            if (data.status != "yes") {
                EB_Common.dialog.alert(i18n[data.status],i18n['dialog.title.warning']);
            } else {
                $('#activeAndInActiveLabel').text(
                        data.activeNum + ' ' + i18n["weatherthreshold.text.active"] + ' / '
                                + data.inactiveNum + ' ' + i18n["weatherthreshold.text.inactive"]);
            }
        }, "json");
    };
    weatherThreshold.clickEventCheckbox = function(e) {
    	var checkbox = $(this);
    	var isChecked = checkbox.is(':checked');
    	var li = checkbox.closest('li');
    	var ul = li.find('ul');
    	if(checkbox.attr('name') == 'group'){
    		ul.find(':checkbox').attr('checked',isChecked);
    	}else{
    		var ul = li.parent();
    		var checkeds = ul.find(':input:checked');
    		var parentCheckBox = ul.parent().find(':checkbox:first');
    		if(isChecked && checkeds.length > 0){
    			parentCheckBox.attr('checked',true);
    			e.stopPropagation();
    		}
    		if(!isChecked && checkeds.length == 0){
    			parentCheckBox.attr('checked',false);
    		}
    	}
    	weatherThreshold.showOrHideActionList();
    };
    
    weatherThreshold.showOrHideActionList = function(){
    	var groupIds = [], actionsTr = $('#actionsTr');
    	$('input[name="group"]:checked').each(function(){
    		groupIds.push($(this).val());
    	});
    	if(groupIds.length == 1 && 'HAIL AND LIGHTNING' == groupIds[0]){
    		actionsTr.hide();
    	}else{
    		actionsTr.show();
    	}
    };
    
    weatherThreshold.checkboxClicked = function(obj) {
    	var input = $(obj).closest("td").find("input.input-invisible");
    	input.valid();
    };
    weatherThreshold.removeBroadCastTemplate = function(obj) {
        $(obj).parent().remove();
        if ($('#broadcatTemplates2').find("li").length == 0) {
            $('#broadCastTempletes').valid();
        }

    };
    weatherThreshold.searchedCheckboxClicked = function(obj) {
        var id = $(obj).attr('id');
        var name = $(obj).parent().text();
        var selectBroadcastTemplateIds = new Array();
        $('#broadcatTemplates2 a').each(function() {
            var id = $(this).attr("id");
            selectBroadcastTemplateIds.push(id);
        });
        if (jQuery.inArray(id, selectBroadcastTemplateIds) == -1) {
            var bcTemplate = $($("#addedBcTemplate").render({id:id,name:name}));
            $('#broadcatTemplates2').append(bcTemplate) ;
        }
        $('#broadCastTempletes').valid();
    };
    weatherThreshold.initConditions = function() {
        EB_Common.Ajax.get("/settings/iv/weatherThreshold/searchEventAction",
            function(data) {
                if (data.status != "yes") {
                    EB_Common.dialog.alert(i18n[data.status],i18n['dialog.title.warning']);
                } else {
                    var eventActions = data.eventActions;
                    var conditionContent = '';
                    var arr = new Array();
                    for ( var count = 0; count < eventActions.length; count++) {
                        var option = eventActions[count];
                        var optionName = i18n["weatherthreshold.condition." + option.id];
                        if (jQuery.inArray(optionName, arr) == -1) {
                            arr.push(optionName);
                            conditionContent += "<li><input type='checkbox' onclick='EB_View.weatherThreshold.checkboxClicked(this);' name="
                                    + option.id + ">" + optionName + "</input></li>";
                        }
                    }
                    $('#condition').html(conditionContent);
                }
            });
    };

    weatherThreshold.checklaunchBroadcast = function(event) {
        var checked = $(this).attr('checked');
        if (checked == 'checked') {
            $('#broadcatTemplates :checkbox').each(function() {
                $(this).attr('disabled', false);
            });
            $('#statrtEventText').attr('disabled', false);
            $('#statrtEventText').rules("add", {
                required : true
            });
            $('#statrtEvent').attr('checked', true);
            $("#searchCt").show();
			$(".toggleHidden").show();
        } else {
            $('#broadcatTemplates :checkbox').each(function() {
                $(this).attr('disabled', true);
            });
            $("#searchBroadCastTempleteText").val('');
            $('#statrtEventText').attr('disabled', true);
            $('#statrtEventText').removeData().rules("remove");
            $('#statrtEventText').valid();
            $('#statrtEvent').removeAttr('checked');
            $('#searchCt').hide();
            $(".toggleHidden").hide();
        }
    };

    weatherThreshold.clearlaunchBroadcast = function(event) {
        $('#broadcatTemplates :checkbox').each(function() {
            $(this).attr('disabled', true);
        });
        $("#searchBroadCastTempleteText").val('');
        $('#statrtEventText').attr('disabled', true).val('');
        $('#statrtEventText').val('').removeData().rules("remove");
        $('#statrtEventText').valid();
        $('#statrtEvent').removeAttr('checked');
        $('#searchCt').hide();
        $(".toggleHidden").hide();
        $("#broadcatTemplates2").find("li").remove();

    };

    weatherThreshold.bindSaveThreshold = function() {
        $('#addWeatherThresholdForm').submit();

        // reset Leave Page State
        EB_Common.LeavePage.resetState();
    };

    weatherThreshold.saveThreshold = function() {
        var thresholdName = $('#thresholdTemplateName').val();
        var selectConditions = new Array();
        $("#condition li :checked").each(function() {
            var text = $(this).attr("name");
            selectConditions.push(text);
        });
        var threshold = {};
        var selectBroadcastTemplateIds = new Array();
        $('#broadcatTemplates2 a').each(function() {
            var id = $(this).attr("id");
            selectBroadcastTemplateIds.push(id);
        });
        
        var weatherServices = [];
        if($('input[name="weatherType"]:checked').val() == 'all'){
        	$('input[name="weatherService"]').each(function(){
        		weatherServices.push($(this).val());
            });
        }else{
        	$('input[name="weatherService"]:checked').each(function(){
        		weatherServices.push($(this).val());
            });
        }
        threshold.weatherServices = weatherServices;
        threshold.name = thresholdName;
        if ($("#launchBroadcast").attr('checked')) {
            threshold.sendingBroadcastEnabled = true;
            if ($("#statrtEvent").attr('checked')) {
                threshold.event = $('#statrtEventText').val();
            } else {
                threshold.event = "";

            }
            threshold.broadcastTemplateIds = selectBroadcastTemplateIds;

        } else {
            threshold.sendingBroadcastEnabled = false;
            threshold.event = "";
            threshold.broadcastTemplateIds = [];
        }

        var sendDashboardAlert = $('#sendDashboardAlert').attr('checked');

        if (sendDashboardAlert == undefined) {
            threshold.alertTriggered = false;
        } else {
            threshold.alertTriggered = true;
        }

        threshold.actions = selectConditions;
        thresholdAddresses = [];
        $('#address_div .subdiv_graybox .table_infor').each(function(item) {
            thresholdAddress = {};
            thresholdAddress.locationName = $(this).find('input[name="address[x].locationName"]').val();
            thresholdAddress.streetAddress = $(this).find('input[name="address[x].streetAddress"]').val();
            thresholdAddress.suite = $(this).find('input[name="address[x].suite"]').val();
            thresholdAddress.city = $(this).find('input[name="address[x].city"]').val();
            thresholdAddress.state = $(this).find('input[name="address[x].state"]').val();
            thresholdAddress.postalCode = $(this).find('input[name="address[x].postalCode"]').val();
            thresholdAddress.country = "United States";
            thresholdAddress.gisLocation = {};
            thresholdAddress.gisLocation.lon = $(this).find('input[name="address[x].gisLocation.lon"]').val();
            thresholdAddress.gisLocation.lat = $(this).find('input[name="address[x].gisLocation.lat"]').val();

            thresholdAddresses.push(thresholdAddress);
        });
        threshold.thresholdAddresses = thresholdAddresses;
        threshold.id = $('#thresholdId').val();
        EB_Common.logger.log(threshold);
        weatherThreshold.sendSave(threshold);
    };

    weatherThreshold.sendSave = function(threshold) {
        EB_Common.Ajax.post('/settings/iv/weatherThreshold/saveThresholds', {
            threshold : EB_Common.json.stringify(threshold)
        }, function(data) {
            if (data.status != "yes") {
                EB_Common.dialog.alert(i18n[data.status],i18n['dialog.title.warning']);
            } else {
                $('#thresholdId').val('');
                $('#thresholdsTable').jqGrid("setGridParam", {
                    url : EB_Common.Ajax.wrapperUrl("/settings/iv/weatherThreshold/listThresholds"),
                    datatype : "json",
                    emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                    mtype : 'get',
                    loadError : function() {
                        EB_Common.dialog.alert(i18n['dialog.title.warning'], 'load data error');
                    },
                    loadComplete : function() {
                    	weatherThreshold.cleanEditPanel();
                        EB_Common.ToolPrompt.show('thresholdSaveButton', i18n['glocal.savesuccess']);
                        weatherThreshold.getActiveAndInActiveThresholds();
                    }
                }).trigger("reloadGrid");
                var span = $('#gridPanel .b-panel-title'), icon = span.find('.icon_tabpanel_expand'), table = span.next();
                if(icon.hasClass('collapsed')){
                	icon.removeClass('collapsed');
                	table.show();
                }
            }
        });
    };

    view.weatherThreshold = weatherThreshold;
})(EB_View);