(function(view) {

    view.histories = function() {
    };
    view.histories.charts=[];
    view.histories.loadchart = function(container, recdata, showLegend, title) {
        Highcharts.setOptions({
            // mono-theme
            colors : EB_Common.Highcharts.piecolors
        });
        var myChart = new Highcharts.Chart({
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
                        for ( var i=0; i<recdata.length;i++) {
                            data.push({name:EB_Common.htmlDecode(recdata[i].name), y:parseFloat(recdata[i].value), param: recdata[i].param });
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
                    return '<b>' + this.point.name + '</b>: ' + this.percentage.toFixed(2) +'%';
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
                                        //width:200,
                                        events : {

                                            load : function() {
                                                // set up the updating of the chart each second
                                                var series = this.series[0];
                                                var data = [];
                                                for ( var i=0; i<recdata.length;i++) {
                                                    data.push([ EB_Common.htmlDecode(recdata[i].name), parseFloat(recdata[i].value) ]);
                                                }
                                                series.setData(data);
                                            }

                                        }
                                    },

                                    title: {
                                        style:{
                                          fontSize: '14px'
                                        },
                                        text: title||'Report'
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
                                       // maxHeight: '270',
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
                                        },
                                        useHTML:false
                                    },
                                    series : [ {
                                        type : 'pie',
                                        name : 'bigChart'
                                    } ]};
                                new Highcharts.Chart(params);
                                $("#showBigChart .highcharts-legend .highcharts-legend-item text").each(function(i){
                                    $(this).attr("title",recdata[i].name).tooltip({hide:false,position: { my: "left+15 center", at: "right center" }});
                                });
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
        view.histories.charts.push(myChart);
    };
    view.histories.loadchart1 = function(container, recdata, notificationId) {

        Highcharts.setOptions({
            // mono-theme
            colors : EB_Common.Highcharts.piecolors
        });
        var chartVar =new Highcharts.Chart({
            chart : {
                renderTo : container,
                borderWidth : 0,
                plotBorderWidth : 0,
//                marginLeft : 0,
                margin: [0, 0, 0, 0],
//                width:60,
                events : {

                    load : function() {
                        // set up the updating of the chart each second
                        var series = this.series[0];
                        var data = [];
                        for ( var i=0; i<recdata.length;i++) {
                            data.push({name:EB_Common.htmlDecode(recdata[i].name), y:parseFloat(recdata[i].value), param: recdata[i].param });
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
                enabled:true,
                formatter : function() {
                    return '<b>' + this.point.name + '</b>: ' + this.percentage + ' %';
                }
            },
            legend : {
                enabled : true,
                align : 'right',
                floating: true,
                layout : 'vertical',
                maxHeight: '260',
                verticalAlign : 'top',
                /*heigh: 243,*/
                x : -30,
                y : 0,
                labelFormatter : function() {
                    return (this.name.length>20?(this.name.substring2(0,20)+"..."):this.name) + ': ' + this.y;
                },
                itemStyle : {
                    color : '#333333',
                    fontFamily : 'Arial',
                    fontSize : '11px'
                },
                useHTML:false
            },
            plotOptions : {
                pie : {
                    size : "40%",
                    center : [ 60, 60 ],
                    allowPointSelect : false,
                    cursor : 'pointer',
                    dataLabels : {
                        enabled : false
                    },
                    showInLegend : true,
                    point : {
                        events : {
                            legendItemClick : function(event) {
                                console.log(this);
                                if(this.y>0){
                                    export_csv(notificationId,this.param);
                                }
                                return false;
                            },
                            click:function(event){
//                                console.log(event.point);
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
        $("#"+container+" .highcharts-legend .highcharts-legend-item text").each(function(i){
            $(this).attr("title",recdata[i].name).tooltip({hide:false,position: { my: "left+15 center", at: "right center" }});;
        });
    };
    view.histories.list = function(status) {
        var publish_permission = EB_Common.Security.protect(["NETWORK_EFFECT_showNetworkEffect","TEMPLATE_send_ipaws","ALERT_US","GENERIC_ONE_WAY"]);
        var quickReport_permission = EB_Common.Security.protect("QUICK_REPORT_view");
        $("#active_gridTable").jqGrid(
            {
                autoencode : true,
                url : EB_Common.Ajax.wrapperUrl("/histories/list/" + status),
                datatype : "json",
                emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                gridGetLength : true,
                jsonReader : {
                    root : "data",
                    page : "currentPageNo",
                    total : "totalPageCount",
                    records : "totalCount",
                    repeatitems : false
                },
                height : "auto",
                autowidth : true,
                colNames : [ '',i18n['global.status'],
                    i18n['notification.field.publish'],
                    i18n['activebroadcast.field.messagetitle'],
                    i18n['activebroadcast.field.eventname'],
                    i18n['activebroadcast.field.startdate'],
                    i18n['activebroadcast.field.sendby'],
                    i18n['activebroadcast.field.sentto'],
                    i18n['activebroadcast.field.charts'] ],
                colModel : [
                    {
                        name : '',
                        index : '',
                        colGetLength : false,
                        sortable : true,
                        width :5
                    },

                    {
                        name : 'notificationStatus',
                        index : 'notificationStatus',
                        colGetLength : false,
                        sortable : false,
                        width : 80,
                        title: false,
                        align : "left",
                        formatter : function(value, rec, row) {
                            var data_=[{status:value,
                                id:row.id,
                                hasPublismessage:row.hasPublishMessage,
                                onlyHasPublishmessage:row.onlyHasPublishMessage,
                                hasIpawsMessage:row.hasIpawsMessage,
                                notConfirmedCount:(row.notificationResult?row.notificationResult.notConfirmedCount:0),
                                unreachableCount: (row.notificationResult?row.notificationResult.unreachableCount:0)}];
                            var tempVar = $("<div>");
                            $( "#statusBtnTemplate" ).tmpl( data_).appendTo(tempVar);
                            return tempVar.html();
                        }
                    } ,
                    {
                        name : 'hasPublishMessage',
                        colGetLength : false,
                        title: false,
                        width: 50,
                        align : "left",
                        sortable:false,
                        hidden:!publish_permission,
                        index : 'hasPublishMessage',
                        formatter : function(value, rec, row) {
                            if(!value){
                                return "";
                            }
                            var tips =[];
                            if(row.hasNetworkMessage){
                                tips.push(i18n["notification.field.publishMessage.networkEffectMessage"]);
                            }
                            if(row.hasIpawsMessage){
                                tips.push(i18n["notification.field.publishMessage.ipawsMessage"]);
                            }
                            if(row.hasAlertUsMessage){
                                tips.push(i18n["notification.field.publishMessage.alertUsMessage"]);
                            }
                            if(row.hasGenericeMessage){
                                tips.push(i18n["notification.field.publishMessage.genericOneWayMessage"]);
                            }
                            var data_=[{tip:tips.join(", ")}];
                            var tempVar = $("<div>");
                            $( "#publishMessageImagTemplate" ).tmpl( data_).appendTo(tempVar);
                            return tempVar.html();
                        }
                    },
                    {
                        name : 'message.title',
                        colGetLength : false,
                        index : 'message.title',
                        formatter : function(value, rec, row) {
                            return (row.priority == 'Priority' ? '<i class="icn_priority_hover_16"></i>' : '')+'<a style="width:100px" href="'
                                + EB_Common.Ajax.wrapperUrl('/histories/report/' + row.id)
                                + '#ui-tabs-1"  title="">'
                                + $.jgrid.htmlEncode(value) + '</a>';
                        }
                    },
                    {
                        name : 'event.name',
                        index : 'event.name',
                        colGetLength : false,
                        sortable : true,
                        width : 120,
                        formatter : function(value, rec,row) {
                            if(quickReport_permission && value){
                                return '<a href="'+EB_Common.Ajax.wrapperUrl("/reports/event/summary?eventId="+row.event.id)+'">'+$.jgrid.htmlEncode(value)+'</a>';
                            }else if(value){
                                return $.jgrid.htmlEncode(value);
                            }
                            return '';
                        }
                    },
                    {
                        name : 'startDate',
                        index : 'startDate',
                        colGetLength : false,
                        width : 125,
                        sorttype : "datetime",
                        formatter : function(value, rec, row) {
                            if (row.notificationStatus == 'Inprogress') {
                                return value ;
                            } else {
                                return value;
                            }
                        }
                    },
                    {
                        name : 'createdName',
                        index : 'createdName',
//                        colGetLength : false,
                        sorttype : "string"
                    },
                    {
                        name : 'notificationResult.totalCount',
                        index : 'notificationResult.totalCount',
                        width : 80,
                        sorttype : "number",
                        colGetLength : false,
                        sortable : true,
                        formatter : function(value, rec, row) {
                            if(row.onlyHasPublishMessage){
                                return i18n['notification.advanced.publishedOnly'];
                            }
                            return value?'<a href="javascript:void(0)" class="export_csv" alt="'+i18n["notification.field.sendto.tooltip"]+'" title="'+i18n["notification.field.sendto.tooltip"]+'" notificationId="'+row.id+'">'+value+'</a>':'';
                        }
                    },
                    {
                        name : 'chart',
                        index : 'chart',
//                                width : 280,
                        sortable : false,
                        colGetLength : false,
                        formatter : function(id, rec, row) {
                            if(row.onlyHasPublishMessage){
                                return i18n['notification.advanced.publishedOnly'];
                            }
                            return '<div title="" style="max-width: 280px; min-width: 240px; height: 40px; line-height: 40px;"></div>';
                        }
                    }],
                afterInsertRow : function(id, rowdata, rowele) { // display chart  after insert
                    if(rowele.onlyHasPublishMessage){
                        return;
                    }
                    var chart_cell = jQuery("#active_gridTable").getInd(id, true);

                    if (chart_cell && chart_cell.cells) {
                        var chart_container = chart_cell.cells[chart_cell.cells.length-1].childNodes[0];
                        var ret = rowele.notificationResult;

                        var chartDatas = (rowele.type == "Polling"||rowele.type == "Quota") ? convertResponseData(ret) : convertI18n(ret);
                        if (chartDatas && chartDatas.length>0) {

                            var colors = EB_Common.Highcharts.piecolors;
                            var data_ = {resultDatas:chartDatas, colors:colors};
                            var tooltipHtml = $("#chartTooltipTmpl").render([data_]);
                            $(chart_container).tooltip({
                                position: { my: "left top+15", at: "left center", collision: "flipfit" },
                                content : tooltipHtml
                            });
                            EB_View.notifications.histories.loadchart(chart_container,chartDatas,false, rowdata["message.title"]);
                        }else{
                            if (chart_container) {
                                $(chart_container).text(i18n['dashboard.noData']);
                            }
                        }
                    }
                },
                // shrinkToFit: false,
                sortname : 'startDate',
                sortorder : 'desc',
                viewrecords : true,
                pager : "#active_gridPager",
                multiselect : false,
                prmNames : {
                    page : "pageNo", //
                    totalrows : "totalrows" //
                },
                loadComplete : function(data) {
                    $(".btnSelect").click(function(e){
                        e.preventDefault();
                        e.stopPropagation();
                        var el = $(this),
                            pos = $(this).offset(),
                            height = $(this).height();
                        var data_=[{id:el.attr("dataId"),notConfirmedCount:el.attr("notConfirmedCount"), unreachableCount:el.attr("unreachableCount"), status:el.attr("notificationStatus")}];
                        $("#reSendAndFollowupBtn").remove();
                        $( "#statusSubBtnTemplate" ).tmpl( data_).appendTo($(document.body)).css({left: pos.left, top: (pos.top + height)}).show().click(function(e){
                            e.stopPropagation();
                        }).mouseleave(function(){
                                $("#reSendAndFollowupBtn").remove();
                            });
                        var notifications = data.data;
                        var dataMap = {};
                        for(var i=0;i<notifications.length;i++){
                            dataMap[notifications[i].id]=notifications[i];
                        }
                        $(".stop_noti_btn").click(function() {
                            stopNotification($(this).attr('href').match(/\d+/), 1);
                        })
                        $(".resend_noti_btn").click(function() {
                            resendNotification($(this).attr('href').match(/\d+/), 1);
                        });
                        $(".follow_noti_btn").click(function(){
                            var notificationId = $(this).attr('href').match(/\d+/);
                            var notification = dataMap[notificationId];
                            var followupForm = $( "#sendfollowupTmpl" ).tmpl([{id:notification.id,type:notification.type,notificationResult:notification.notificationResult||{}}]).appendTo($(document.body));
                            followupForm.dialog({
                                autoOpen : true,
                                width : 425,
                                height : "auto",
                                modal : true,
                                title: i18n["activebroadcast.button.followup"],
                                resizable : false,
                                buttons : {
                                    Ok : {
                                        click : function() {
                                            if($("#followUpForm_"+notificationId).find(":checked").length>0) {
                                                $("#followUpForm_"+notificationId).submit();
                                            }
                                        },
                                        'class' : 'orange',
                                        text : i18n['global.dialog.button.next']
                                    },
                                    Cancel : {
                                        click : function() {
                                            $(this).dialog("close");
                                        },
                                        'class' : 'gray',
                                        text : i18n['global.dialog.button.cancel']
                                    }

                                },
                                open:function(){
                                    var that = $(this);
                                    EB_Common.validation.validate("followUpForm_"+notificationId, {
                                        submitHandler:function (form) {
                                            form.submit();
//                                            that.dialog("close");
                                        }
                                    });
                                },
                                close:function(){
                                    $(this).dialog( "destroy" );
                                    followupForm.remove();
                                }

                            });
                        });
                    });
                    $(".export_csv").click(function(e){
                        e.preventDefault();
                        export_csv($(this).attr("notificationId"));
                    });
                },
                beforeProcessing:function(){
                    var charts = view.histories.charts;
                    if(charts && charts.length>0){
                        for(var i=0; i< charts.length; i++){
                            var currentChart = charts[i];
                            currentChart.destroy();
                        }
                        view.histories.charts = [];
                    }
                }
            });

        view.listenSearch("active_gridTable");
        $('#showBigChart').prev().click(function(){
            $(this).parent().hide();
            $(this).children().remove();
        });


    };
    view.histories.chart = function(notificationId, notificationType, confirmChartData,isCrossOrg,orgId) {
        $('#sendfollowup').dialog({
            autoOpen : false,
            width : 425,
            height : "auto",
            modal : true,
            resizable : false,
            buttons : {
                Ok : {
                    click : function() {
                        if ($("input[type='checkbox']:checked").length > 0) {
//                            var action = EB_Common.Ajax.wrapperUrl("/notifications/follow/" + notificationId);
//                            $('#activehistory').attr("action", action);
//                            $('#activehistory').ajaxSubmit({
//                                success : function(data) {
//                                    window.location = EB_Common.Ajax.wrapperUrl("/bcTemplates/new/4");
//                                }
//                            });
                            $("#sendfollowup> form").submit();
                            $(this).dialog("close");
                        }
                    },
                    'class' : 'orange',
                    text : i18n['button.send']
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
        $(".polling_res_chbox").click(function(){
            var elem = $(this);
            if(elem.attr("checked")) {
                $(".polling_chbox_"+elem.attr("data-index")).attr("checked", "checked");
            } else {
                $(".polling_chbox_"+elem.attr("data-index")).removeAttr("checked");
            }
        })
        $('#sendfollowup_link').click(function() {
            if($('#sendfollowup_link').data("hasClicked")){
                return;
            }
            $('#sendfollowup_link').data("hasClicked",true);
            var url = '/histories/chart/' + notificationId + '/confirmation';
            EB_Common.Ajax.get(url, {}, function(data) {
                var followupForm = $( "#sendfollowupTmpl" ).tmpl([{id:notificationId,type:notificationType,notificationResult:data||{}}]).appendTo($(document.body));
                followupForm.dialog({
                    autoOpen : true,
                    width : 425,
                    height : "auto",
                    modal : true,
                    title: i18n["activebroadcast.button.followup"],
                    resizable : false,
                    buttons : {
                        Ok : {
                            click : function() {
                                if($("#followUpForm_"+notificationId).find(":checked").length>0) {
                                    $("#followUpForm_"+notificationId).submit();
                                }
                            },
                            'class' : 'orange',
                            text : i18n['global.dialog.button.next']
                        },
                        Cancel : {
                            click : function() {
                                $(this).dialog("close");
                            },
                            'class' : 'gray',
                            text : i18n['global.dialog.button.cancel']
                        }

                    },
                    open:function(){
                        var that = $(this);

                        EB_Common.validation.validate("followUpForm_"+notificationId, {
                            submitHandler:function (form) {
                                form.submit();
//                                            that.dialog("close");
                            }
                        });
                    },
                    close:function(){
                        $('#sendfollowup_link').data("hasClicked",false);
                        $(this).dialog( "destroy" );
                        followupForm.remove();
                    }

                });

            }, 'json')
//            $('#sendfollowup').dialog('open');
//            sendfollowupTmpl
        });

        $("#report_stopbroadcast").click(function() {
            stopNotification($("#notificationid").val(), 2);
        });

        $("#report_resend").click(function() {
            resendNotification($("#notificationid").val(), 2);
        });

        $("#confirmationrate").click(function() {
            var url = '/histories/chart/' + notificationId + '/confirmation';
            if(isCrossOrg==true){
                url +='?isCrossOrg=true&orgId='+orgId;
            }
            loadPieChart("reportChart", url,notificationType,"confirmation", notificationId);
        });

        $("#confirmationcontact").click(function() {
            var url = '/histories/chart/' + notificationId + '/path';
            if(isCrossOrg==true){
                url +='?isCrossOrg=true&orgId='+orgId;
            }
            loadPieChart("reportChart", url,notificationType,"path", notificationId);
        });
        $("#reportTable").click(function() {
            var url = '/histories/chart/' + notificationId + '/confirmation';
            if(isCrossOrg==true){
                url +='?isCrossOrg=true&orgId='+orgId;
            }
            $("#reportChart").removeClass("con_results");
            EB_Common.Ajax.get(url, {}, function(data) {
                $("#reportChart").empty();
                if(!data || !data.showChart){
                    $("#reportChart").empty().text(i18n['dashboard.noData']);
                    return;
                }
                $("#reportChart").html($("#reportTableTmpl").render([{pollingDetails:data.pollingDetails,quotaNeeded:data.quotaNeeded}]));
            }, 'json');
        });

//        $("#pollingpie").click(function() {
//            EB_View.notifications.histories.loadchart1("reportChart", convertResponseData(confirmChartData));
//        });

        $("#confirmationrate").trigger("click");
    };
    view.histories.loadDetails = function(notificationId, notificationType, selectedGroups, isCrossOrg, orgId) {
        var falseIcn_url = EB_Common.Ajax.wrapperUrl("/statics/stylesheets/notification/img/icn_square_10.png");
        //<i class="icn_square_10"></i>  ;
        var trueIcn_url = EB_Common.Ajax.wrapperUrl("/statics/stylesheets/common/img/icn_success_16.png");
        //<i class="icn_success_16"></i> ;
        var hasPathValueColumn=false;
        if(EB_Common.Security.protect(["CONTACT_add_edit_delete_view_list_download_addToGroup_saveAsRule"])){
            hasPathValueColumn=true
        }
        $("#detail_gridTable")
            .jqGrid(
            {
                autoencode : true,
                url : EB_Common.Ajax.wrapperUrl("/histories/details/" + notificationId),
                datatype : "json",
                emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                gridGetLength : true,
                postData:{
                    isCrossOrg:isCrossOrg,
                    orgId:orgId
                },
                jsonReader : {
                    root : "data",
                    page : "currentPageNo",
                    total : "totalPageCount",
                    records : "totalCount",
                    repeatitems : false
                },
                height : "auto",
                autowidth : true,
                colNames : [ '',
                    i18n['reportLog.model.confirmed'],
                    i18n['reportLog.model.contact.name'],
                    i18n['reportLog.model.confirmed.path'],
                    i18n['reportLog.model.confirmed.pathValue'],
//                                i18n['callResultByPath.model.confirm'],
                    i18n['reportLog.model.confirmation.date'],
                    i18n['reportLog.model.first.attempt.time'],
                    i18n['contact.tab.groups'],
//                    'Rule',
                    i18n['reportLog.model.responseTextMessage']
                ],
                colModel : [
                    {
                        name:'contactId',
                        index:'contactId',
                        hidden:true,
                        width : 10,
                        colGetLength : false
                    },
                    {
                        name : 'isConfirmed',
                        index : 'isConfirmed',
                        width : 50,
                        colGetLength : false,
                        formatter:function(value, rec, row){
                            if(row.isConfirmed===true){
                                return '<span class="txt_green">Y</span>';
                            }
                            return '<span>N</span>';
                        }
                    },
                    {
                        name : 'firstName',
                        index : 'firstName',
                        width : 120,
                        formatter:function(value, rec, row){
                            return row.firstName+' '+row.lastName;
                        }
                    },
                    {
                        name : 'confirmedPath',
                        index : 'confirmedPath',
                        width : 125,
                        colGetLength : false,
                        sortable : true
                    },
                    {
                        name : "confirmedPathValue",
                        index : "confirmedPathValue",
                        width : 120,
                        colGetLength : false,
                        sortable : false,
                        hidden:hasPathValueColumn?false:true,
                        formatter:function(value, rec, row){
                            if(value && row.phoneExt){
                                return value+"-"+ row.phoneExt;
                            }
                            return value?value:"";
                        }
                    },
                    /*{
                     name : 'isConfirmed',
                     index : 'isConfirmed',
                     width : 120,
                     formatter:function(value, rec, row){
                     return row.confirmed;
                     }
                     },*/
                    {
                        name:'confirmedDate',
                        index:'confirmedDate',
                        width:160
                    },
                    {
                        name : 'firstAttemptTime',
                        index : 'firstAttemptTime',
                        width : 160,
                        sortable : false
                    },
                    {
                        name : 'selectedByGroupNames',
                        index : 'selectedByGroupNames',
                        // width : 150,
                        hidden:(selectedGroups.length<=2)?true:false,
                        sortable : true
                    },
//                    {
//                        name : 'broadcastContacts.filterNames',
//                        index : 'broadcastContacts.filterNames',
//                        // width : 150,
//                        sortable : true
//                    },
                    {
                        name : 'responseTextMessage',
                        index : 'responseTextMessage',
                        width : 250,
                        hidden: (notificationType=='Polling'||notificationType=='Quota')?false:true,
                        sortable : true,
                        colGetLength : false,
                        formatter : function(value, rec, row) {
                            if (row.confirmedPathId && row.confirmedPathId==14402) {
                                return (value?value:"")
                                    + ' <a href="javascript:void(0);" class="viewDetails" rowId="'+ row.id + '"notificationId="'+row.notificationId+'" contactId="'+row.contactId+'"' +
                                    'contactName="'+row.firstName+' '+row.lastName+'" index="'
                                    + i
                                    + '">View Details</a>';
                            }
                            return value?value:"";
                        }
                    }
                ],
                sortname : 'firstAttemptTime',
                sortorder : 'asc',
                viewrecords : true,
                pager : "#detail_gridPager",
                multiselect : false,
                subGrid : true,
                subGridRowExpanded: function(subgrid_id, row_id) {
                    // we pass two parameters
                    // subgrid_id is a id of the div tag created whitin a table data
                    // the id of this elemenet is a combination of the "sg_" + id of the row
                    // the row_id is the id of the row
                    // If we wan to pass additinal parameters to the url we can use
                    // a method getRowData(row_id) - which returns associative array in type name-value
                    // here we can easy construct the flowing
                    var subgrid_table_id, pager_id;
                    subgrid_table_id = subgrid_id+"_t";
                    pager_id = "p_"+subgrid_table_id;
                    var rowObject=$("#detail_gridTable").jqGrid('getRowData',row_id);
                    $("#"+subgrid_id).html('<div class="jqgrid subgrid"><table id="'+subgrid_table_id+'" class="table_list"></table></div>');
                    jQuery("#"+subgrid_table_id).jqGrid({
                        url:EB_Common.Ajax.wrapperUrl("/histories/callResult?notificationId=" + notificationId+"&contactId="+rowObject.contactId),
                        datatype: "json",
                        jsonReader : {
                            root : "data",
                            page : "currentPageNo",
                            total : "totalPageCount",
                            records : "totalCount",
                            repeatitems : false
                        },
                        postData:{
                            isCrossOrg:isCrossOrg,
                            orgId:orgId
                        },
                        colNames: [/*'Contact Name','Confirmed',*/
                            i18n['callResultByPath.model.attempt'],
                            i18n['callResultByPath.model.path'],
                            i18n['callResultByPath.model.pathValue'],
                            i18n['callResultByPath.model.callResult'],
                            i18n['callResultByPath.model.attempt.time']],
                        colModel: [
                            /*{name:"contactName",index:"firstName",width:100,sortable:false},
                             {name:"isConfirmed",index:"isConfirmed",width:100,sortable:false},*/
                            {name:"attemptOrder",index:"attemptOrder",width:50,sortable:false},
                            {name:"path",index:"path",width:100,sortable:false},
                            {name : "value",index : "value",width : 120,colGetLength : false,sortable : false,hidden:hasPathValueColumn?false:true,
                                formatter:function(value, rec, row){
                                    if(value && row.phoneExt){
                                        return value+"-"+ row.phoneExt;
                                    }
                                    return value?value:"";
                                }},
                            {name:"callResult",index:"callResult",width:100,sortable:false},
                            {name:"attemptTime",index:"attemptTime",width:100,sortable:false}
                        ],

                        rowNum:-1,
//                        pager: pager_id,
                        sortname: 'firstName',
                        sortorder: "asc",
                        height: '100%'
                    });
//                    jQuery("#"+subgrid_table_id).jqGrid('navGrid',"#"+pager_id,{edit:false,add:false,del:false})
                },
                subGridRowColapsed: function(subgrid_id, row_id) {
                    // this function is called before removing the data
                    var subgrid_table_id;
                    subgrid_table_id = subgrid_id+"_t";
                    jQuery("#"+subgrid_table_id).remove();
                },
                prmNames : {
                    page : "pageNo", //
                    totalrows : "totalrows" //
                },
                loadComplete : function(data) {
                    $('.viewDetails').click(function(e) {
                        e.stopPropagation();
                        var notificationId = $(this).attr("notificationId");
                        var contactId = $(this).attr("contactId");
                        var contactName = $(this).attr("contactName");
                        $("#showRecipAppDetails").remove();
                        EB_Common.Ajax.get('/histories/recipient/details',{notificationId:notificationId, contactId:contactId},function(response){
                            var data = response.data;

                            var hasData = false;
                            if(data && data.length){
                                for(var i= 0; i<data.length; i++){
                                    if(data[i].summary || data[i].images){
                                        hasData=true;
                                        break;
                                    }
                                }
                            }
                            var showRecipAppDetails = $('<div id="showRecipAppDetails" style="padding:0;overflow:auto; max-height: 350px " />').html($("#RecipientappMessagesTemplate").render([{content:data, hasData:hasData}]));
                            showRecipAppDetails.dialog({
                                title:$.format(i18n['notification.solicited.message.title'], contactName),
                                maxHeight:350,
                                height:'auto',
                                width : 550,
                                resizable : false,
                                modal : true,
                                zIndex : 2300,
                                close: function() {
                                    $(this).dialog("destroy");
                                }
                            });
                        },'json');

                    });

                }


            });
    };
    $(document).bind('click', function(e) {
        $('.recip_details').remove();
        $("#reSendAndFollowupBtn").remove();
        // if(!$(e.target).parentsUntil('.recip_details').is(".recip_details")){
        // $('.recip_details').remove();
        // }
    });
    function resendNotification(notificationId, source) {
        EB_Common.dialog.confirm(i18n['global.dialog.content.notification.resend.confirm'],
            i18n['global.dialog.title.rebroadcastconfirm'], function() {
                var dialog = $(this);
                EB_Common.Ajax.get("/notifications/resend/" + notificationId, {}, function(data) {
                    dialog.dialog("close");
                    if (data.success) {
                        // go to active page
                        if (source == 1) {
                            view.reloadGrid("active_gridTable");
                            EB_Common.Ajax.get(EB_Common.Ajax.wrapperUrl("/notifications/status"), {
                                t : Math.random()
                            }, function(data) {
                                $("#inprogress").html(data.inprogress);
                                $("#lastweek").html(data.lastweek);
                                $("#lastmonth").html(data.lastmonth);
                            }, "json");
                        } else {
                            window.location = EB_Common.Ajax.wrapperUrl("/notifications");
                        }
                    } else {
                        EB_Common.dialog.alert(data.message, 'alert', function() {
                            $(this).dialog('close');
                        });
                    }
                })
            },'',i18n['global.button.rebroadcastnow'],i18n['global.dialog.button.cancel'],{width:400});
    }

    function stopNotification(notificationId, source) {
        EB_Common.dialog.confirm(i18n['global.dialog.content.notification.stop.confirm'],
            i18n['global.dialog.title.confirm'], function() {
                var dialog = $(this);
                EB_Common.Ajax.get("/notifications/stop/" + notificationId, {}, function(data) {
                    dialog.dialog("close");
                    if (data.success) {
                        // go to active page
                        if (source == 1) {
                            view.reloadGrid("active_gridTable");
                            var old = $("#inprogress").text();
                            old = parseInt(old);
                            if(old){
                                $("#inprogress").text(old-1);
                            }
                        } else {
//                                window.location = EB_Common.Ajax.wrapperUrl("/notifications#ui-tabs-3");
                            window.location.reload();
                        }
                    } else {
                        EB_Common.dialog.alert(data.message, 'alert', function() {
                            $(this).dialog('close');
                        });
                    }
                })
            });
    }

    function loadPieChart(containerId, url, notificationType,type, notificationId) {
        $("#reportChart").addClass("con_results");
        EB_Common.Ajax.get(url, {}, function(data) {
            if(!data || data.showChart===false){
                $("#reportChart").empty().text(i18n['dashboard.noData']);
                return;
            }
            if(type=="confirmation"){
                if(notificationType == "Polling" || notificationType == "Quota" )
                {
                    EB_View.notifications.histories.loadchart1(containerId,convertResponseData(data), notificationId);
                }else{
                    EB_View.notifications.histories.loadchart1(containerId, convertI18n(data), notificationId);
                }
            }else{
                EB_View.notifications.histories.loadchart1(containerId, convertPathData(data), notificationId);
            }

        }, 'json')
    }
    function convertPathData(data) {
        var chartData = [];
        if(data){

            if (data) {
                for ( var key in data) {
                    chartData.push({name:key, value:data[key] ? data[key] : 0});
                }
            }
        }
        return chartData;
    }
    function convertI18n(data) {
        var chartData = [];
        if(data){
            if(!data.confirmedCount && !data.confirmedLateCount && !data.unreachableCount && !data.notConfirmedCount){
                return [];
            }
            chartData.push({name:i18n['global.chart.confirmed'], value:data.confirmedCount ? data.confirmedCount : 0, param:'CONFIRMED'});
            chartData.push({name:i18n['global.chart.confirmLate'], value:data.confirmedLateCount ? data.confirmedLateCount : 0, param:'CONFIRMEDLATE'});
            chartData.push({name:i18n['global.chart.unreachable'], value:data.unreachableCount ? data.unreachableCount : 0, param:'UNREACHABLE'});
            chartData.push({name:i18n['global.chart.notConfirmed'], value:data.notConfirmedCount ? data.notConfirmedCount : 0, param:'NOTCONFIRMED'});
        }
        return chartData;
    }

    function convertResponseData(data) {
        var chartData = [];
        var hasData = false;
        if(data){
            var details = data.pollingDetails;
            if (details) {
                for ( var i = 0; i < details.length; i++) {
                    var detail = details[i];
                    if(detail.count){
                        hasData = true;
                    }
                    var param = detail.responseText;
                    if(detail.responseText=="Not confirmed contacts") {
                        param = "Not Confirmed";
                    }else if(detail.responseText=="Unreachable contacts"){
                        param = "Unreachable";
                    }
                    chartData.push({name:detail.responseText, value:detail.count ? detail.count : 0, param: param});
                }
            }
        }
        if(!hasData){
            return [];
        }
        return chartData;
    }

//    $("#export_csv").click();
    function export_csv(notificationId, paramStr){
        var param = notificationId+"?statusOrResponse="+(paramStr?paramStr:"");
        var settings = {
            downloadAsyncUrl:EB_Common.Ajax.wrapperUrl("/histories/csv/async/"+param),
            downloadSyncUrl:EB_Common.Ajax.wrapperUrl("/histories/csv/"+param),
            downloadCheckUrl:EB_Common.Ajax.wrapperUrl("/histories/download/check/threshold/"+param),
            downloadForm:$("#downloadIframe")
        };
        var downloadCsvApp = EB_View.downloadApp.getInstance(settings);
        downloadCsvApp.execute({});

    }

})(EB_View.notifications);