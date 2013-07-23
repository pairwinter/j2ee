(function(view){
    view.history={};
    view.history.listApp={
        chart:function(container, recdata, title){
            if(!container){
                return;
            }
            return new Highcharts.Chart({
                chart : {
                    renderTo : container,
                    borderWidth : 0,
                    plotBorderWidth : 0,
                    margin: [0, 0, 0, 0],
                    width:60,
                    height:60,
                    events : {

                        load : function() {
                            // set up the updating of the chart each second
                            var series = this.series[0];
                            var data = [];
                            for ( var i=0; i<recdata.length;i++) {
                                data.push([ recdata[i].name, parseFloat(recdata[i].value) ]);
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
                    enabled : false,
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
                        allowPointSelect : false,
                        cursor : 'pointer',
                        dataLabels : {
                            enabled : false
                        },
                        showInLegend : true,
                        point : {
                            events : {
                                click:function(e){
                                    var view = EB_View.crossOrgNotification.history.listApp.ShowBigChartApp.getInstance();
                                    view.show(title,recdata);
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
        },
        ShowBigChartApp:{
            ShowBigChartView:{
//                el:"#showBigChart_div",
                events:{
//                    "click .icn_close_16":"clickDelete"
                },
                initialize:function(){
                    this.render();
                },
                render:function(){
//                    this.$el.css({left: EB_Common.Element.getViewportWidth()/2-300, top: EB_Common.Element.getViewportHeight()/2-200, width:'600px', position:'fixed',zIndex:2012});
                    return this;
                },
                clickDelete:function(e){
                    this.$el.hide();
                },
                show:function(title, recdata){
                    $("#showBigChart1").remove();
                    var showBigChart = $('<div id="showBigChart1" style="padding:0;" />').appendTo(document.body);
                    $('#showBigChart1').dialog({
                        width : 750,
                        height : 500,
                        resizable : false,
                        modal : true,
                        zIndex : 2300,
                        close: function() {
                            $(this).dialog("destroy");
                        }
                    });
                    var param = {
                        chart : {
                            renderTo : showBigChart[0],
                            borderWidth :0,
                            plotBorderWidth : 0,
                            marginLeft : 0 ,
                            backgroundColor:"#f5f5f5",
                            //                                    width:200,
                            events : {

                                load : function() {
                                    // set up the updating of the chart each second
                                    var series = this.series[0];
                                    var data = [];
                                    for ( var i=0; i<recdata.length;i++) {
                                        data.push([ recdata[i].name, parseFloat(recdata[i].value) ]);
                                    }
                                    series.setData(data);
                                }

                            }
                        },



                        title: {
                            text: title
                        },
                        plotOptions : {
                            pie : {
                                size : "70%",
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
                                return '<b>' + this.point.name + '</b>: ' + this.percentage + ' %';
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
                            name : 'test'
                        } ]};

                    this.$el.show();
                    new Highcharts.Chart(param);
                }
            },
            getInstance:function(options){
                if(!this.view){
                    var BigChartView = Backbone.View.extend(this.ShowBigChartView);
                    this.view = new BigChartView();
                }
                return this.view;
            }
        },

        StatusBtnView:{
            events:{
                "click #rebroadcastBtn":"clickRebroadcastBtn",
                "click #stop_noti_btn":"clickStopNotificationBtn"
            },
            initialize:function(){
                $.templates({
                    statusSubBtnTemplate:$("#statusSubBtnTemplate").html()
                });
                this.statusSubBtnTemplate = $.render.statusSubBtnTemplate;
                this.parentApp = this.options.parentApp;
                this.pos = this.options.pos;
                this.height = this.options.height;
                this.render();
            },
            render:function(){
//                console.log(this.model.toJSON());
                $(document.body).append(this.$el.html(this.statusSubBtnTemplate([this.model.toJSON()])));
                this.show();
                return this;
            },
            show:function(){
                var that = this;

                this.$("#reSendAndFollowupBtn").css({left: this.pos.left, top: (this.pos.top + this.height)}).show().mouseleave(function(){
                    that.$("#reSendAndFollowupBtn").remove();
                });;
                $(document).click(function(e){
                    that.remove();
                });
            },
            clickRebroadcastBtn:function(e){
                var that = this;
                EB_Common.dialog.confirm(i18n['global.dialog.content.notification.resend.confirm'],
                    i18n['global.dialog.title.rebroadcastconfirm'], function() {
                        var dialog = $(this);
                        EB_Common.Ajax.get("/crossOrgNotifications/resend/" + that.model.get("id"), {}, function(data) {
                            dialog.dialog("close");
                            if (data.success) {
                                if(that.options.mainView){
                                    that.options.mainView.loadCounter();
                                }
                                // go to active page
                                that.parentApp.reloadGrid();
                            } else {
                                EB_Common.dialog.alert(data.message, 'alert', function() {
                                    $(this).dialog('close');
                                });
                            }
                        })
                    },'',i18n['global.button.rebroadcastnow'],i18n['global.dialog.button.cancel'],{width:400});
            },
            clickStopNotificationBtn:function(e){
                var that =this;
                EB_Common.dialog.confirm(i18n['global.dialog.content.notification.stop.confirm'],
                    i18n['global.dialog.title.confirm'], function() {
                        var dialog = $(this);
                        EB_Common.Ajax.get("/crossOrgNotifications/stop/" + that.model.get("id"), {}, function(data) {
                            dialog.dialog("close");
                            if (data.success) {
                                // go to active page
                                that.parentApp.reloadGrid({
//                                    postData : {
//                                        messageTitle : $("#search").val()
//                                    }
                                })
                            } else {
                                EB_Common.dialog.alert(data.message, 'alert', function() {
                                    $(this).dialog('close');
                                });
                            }
                        })
                    });

            },
            clickFollowupBtn:function(e){
                e.stopPropagation();
                $( "#sendfollowupTmpl" ).tmpl( [this.model.toJSON()]).dialog({
                    autoOpen : true,
                    width : 425,
                    height : "auto",
                    modal : true,
                    resizable : false,
                    title: i18n["activebroadcast.button.followup"],
                    buttons : {
                        Ok : {
                            click : function() {
                                if($("#followUpForm").find(":checked").length>0) {
                                    $("#followUpForm").submit();
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
            }
        },
        ItemView:{
            events:{
                "click #btnSelect":"clickBtnSelect"
            },
            initialize:function(){
                $.templates({
                    statusBtnTemplate: $("#statusBtnTemplate").html(),
                    chartTooltipTmpl:$("#chartTooltipTmpl").html()
                });
                this.parentApp = this.options.parentApp;
                this.btnTemplate = $.render.statusBtnTemplate;
                this.chartTooltipTmpl = $.render.chartTooltipTmpl;
                this.StatusBtnView = Backbone.View.extend(view.history.listApp.StatusBtnView);
                this.model.on("remove", this.remove, this);

                this.render();
                this.loadChart();
            },
            remove:function(){
                if(this.chart)
                this.chart.destroy();
            },
            render:function(){
                this.renderStatus();
                this.renderTitle();

                this.delegateEvents();
                return this;
            },
            renderStatus:function(){
                this.$("td[aria-describedby$=notificationStatus]").html(this.btnTemplate([this.model.toJSON()]));
                var content=i18n['dashboard.noData'];
                var tip =i18n['dashboard.noData'];
                var id = this.model.get("id");
                if(this.model.get("batchNotificationContacts") && this.model.get("batchNotificationContacts").length){
                    content = $.map(this.model.get("batchNotificationContacts"),function(element,i){
                        return '<a href="'+EB_Common.Ajax.wrapperUrl('/crossOrgNotifications/detail/' +id+'/'+ element.organizationInfo.batchId)+'">'+element.organizationInfo.organizationName+'</a>';
                    }).join('<br>');
                    tip = $.map(this.model.get("batchNotificationContacts"),function(element,i){
                        return element.organizationInfo.organizationName;
                    }).join('\n');
                }
                this.$("td[aria-describedby$=batchNotificationContacts]").html(content);
                this.$("td[aria-describedby$=batchNotificationContacts]").attr("title", tip);

            },
            renderTitle:function(){
                var title = EB_Common.htmlEncode(this.model.get("notification").message.title);
                var priority = this.model.get("notification").priority;
                title = ((priority==="Priority")?'<i class="icn_priority_hover_16"></i>' : '')+ title;
                this.$("td[aria-describedby$='notification.message.title']").html(title);
            },
            clickBtnSelect:function(e){
                e.preventDefault();
                e.stopPropagation();
                if(this.statuBtnView){
                    this.statuBtnView.remove();
                }
                var pos = $(e.currentTarget).offset(),
                    height = $(e.currentTarget).height();
                var notification = this.model.get("notification");
                if(notification.notificationResult){
                    var options={id:this.model.get("id"),notificationResult:notification.notificationResult,
                        notificationStatus:this.model.get("notificationStatus"),
                        pos:pos,height:height };
                    var statusBtnModel = new Backbone.Model({id:options.id,notificationResult:options.notificationResult,type:options.type, notificationStatus:options.notificationStatus});
                    this.statuBtnView = new this.StatusBtnView({model:statusBtnModel, parentApp:this.parentApp,pos:options.pos,height:options.height,mainView:this.options.mainView});
                }
            },
            convertI18n:function () {
                var chartData = [];
                var data = this.model.get("notification").notificationResult;
                if(!data.confirmedCount && !data.confirmedLateCount && !data.unreachableCount && !data.notConfirmedCount){
                    return [];
                }
                if (data) {
                    chartData.push({name:i18n['global.chart.confirmed'], value:data.confirmedCount ? data.confirmedCount : 0});
                    chartData.push({name:i18n['global.chart.confirmLate'], value:data.confirmedLateCount ? data.confirmedLateCount : 0});
                    chartData.push({name:i18n['global.chart.unreachable'], value:data.unreachableCount ? data.unreachableCount : 0});
                    chartData.push({name:i18n['global.chart.notConfirmed'], value:data.notConfirmedCount ? data.notConfirmedCount : 0});
                }
                return chartData;
            },
            convertResponseData:function() {
                var chartData = [];
                var details = this.model.get("notification").notificationResult.pollingDetails;
                var hasData = false;
                if (details) {
                    for ( var i = 0; i < details.length; i++) {
                        var detail = details[i];
                        if(detail.count){
                            hasData = true;
                        }
                        chartData.push({name:detail.responseText, value:detail.count ? detail.count : 0});
                    }
                }
                if(!hasData){
                    return [];
                }
                return chartData;
            },
            getResult:function(){
                return (this.model.get("notification").type == "Polling" || this.model.get("notification").type == "Quota") ? this.convertResponseData() : this.convertI18n();
            },
            loadChart:function(){
                Highcharts.setOptions({
                    // mono-theme
                    colors : EB_Common.Highcharts.piecolors
                });
                var recdata = this.getResult();
                if(recdata && recdata.length>0){
                    var data_ = {resultDatas:recdata, colors:EB_Common.Highcharts.piecolors};
                    var tooltipHtml = this.chartTooltipTmpl([data_]);
                    this.$("td[aria-describedby$=chart]").tooltip({
                        position: { my: "left top+15", at: "left center", collision: "flipfit" },
                        content : tooltipHtml
                    });
                    this.chart =  view.history.listApp.chart(this.$("td[aria-describedby$=chart]")[0],recdata,this.model.get("notification").message.title);
                    var series = this.chart.series;
                    for(var i=0; i < series.length; i++){
                        series[i].show();
                    }
                }else{
                    //this.$("td[aria-describedby$=chart]").append("<span style='line-height: 40px;'>"+i18n['dashboard.noData']+"</span>");
                    this.$("td[aria-describedby$=chart] div").text(i18n['dashboard.noData']);
                }

            }
        },
        ListView:{
            grid:null,
            container:null,
            tableId:null,
            pageId:null,
            events:{
                "click #addMessageTemplate": "clickAddMessageTemplate",
                "click #simpleSearch":"clickSearch",
                "keypress #search":"keypressSearch"
            },
            initialize:function(){
                this.container = this.options.container;
                this.collection = new Backbone.Collection();
                this.ItemView = Backbone.View.extend(view.history.listApp.ItemView);
                this.render();
            },
            render:function(){
                this.grid = $("#active_gridTable");
                this.loadGrid();

            },
            addItem:function(options){
                var model = new Backbone.Model(options.data);
                this.collection.add(model);
                var subView = new this.ItemView({model:model,el:options.el,parentApp:this, mainView:this.options.mainView});
            },
            clearItems:function(){
                this.collection.update();
            },
            clickAddMessageTemplate:function(e){
                window.document.location = EB_Common.Ajax.wrapperUrl("/crossOrgMessageTemplates/new");
            },
            clickSearch:function(e){
                this.reloadGrid({postData:{messageTitle:this.$("#search").val()}});
            },
            keypressSearch:function(e){
                if(e.keyCode==13){
                    this.reloadGrid({postData:{messageTitle:this.$("#search").val()}});
                }
            },
            reloadGrid:function(params){
                this.grid.jqGrid('setGridParam',params).trigger("reloadGrid");
            },
            loadGrid:function(){
                var that = this;
                this.grid.jqGrid(
                    {
                        autoencode : true,
                        url : EB_Common.Ajax.wrapperUrl("/crossOrgNotifications/history/list/json/" + this.model.get("status")),
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
                        colNames : [ '',i18n['global.status'],i18n['activebroadcast.field.messagetitle'],
                            i18n['activebroadcast.field.eventname'],
                            i18n['activebroadcast.field.startdate'],
                            i18n['activebroadcast.field.sendby'],
                            i18n['activebroadcast.field.sentto'],
                            i18n['activebroadcast.field.charts'],i18n['dashboard.organization'] ],

                        colModel : [
                            {
                                name : 'id',
                                index : 'id',
                                hidden:true,
                                width:5
                            },
                            {
                                name : 'notificationStatus',
                                index : 'notificationStatus',
                                colGetLength : false,
                                sortable : false,
                                width : 150,
                                title: false,
                                align : "left"
                            } ,
                            {
                                name : 'notification.message.title',
                                colGetLength : false,
                                index : 'notification.message.title'
                            },
                            {
                                name : 'batchNotificationEvent.name',
                                colGetLength : false,
                                width : 120,
                                index : 'batchNotificationEvent.name'
                            },
                            {
                                name : 'createdDate',
                                index : 'createdDate',
                                colGetLength : false,
                                width : 125,
                                sorttype : "datetime"
                            },
                            {
                                name : 'createdName',
                                index : 'createdName',
                                colGetLength : false,
                                width : 100,
                                sorttype : "string"
                            },
                            {
                                name : 'notification.notificationResult.totalCount',
                                index : 'notification.notificationResult.totalCount',
                                width : 80,
                                sorttype : "number",
                                colGetLength : false,
                                sortable : false
                            },
                            {
                                name : 'chart',
                                index : 'chart',
//                                width : 280,
                                sortable : false,
                                colGetLength : false,
                                formatter : function(val, rec, rowObject) {
                                    return '<div style="max-width: 280px; min-width: 240px; height: 40px;line-height: 40px;"></div>';
                                }
                            },
                            {
                                name:'batchNotificationContacts',
                                index:'batchNotificationContacts',
                                sortable:false,
                                colGetLength : false
                            }
                        ],
                        sortname : 'createdDate',
                        sortorder : 'desc',
                        viewrecords : true,
                        pager : "#active_gridPager",
                        multiselect : false,
                        prmNames : {
                            page : "pageNo", //
                            totalrows : "totalrows" //
                        },
                        afterInsertRow:function(rowid, rowdata, rowelem){
                            var settings = {el:that.grid.getInd(rowid, true),data:rowelem};
                            that.addItem(settings);
                        },
                        beforeProcessing:function(){
                            that.clearItems();
                        }
                    });
                this.options.mainView.addRefreshExtension=function(){
                    that.reloadGrid({postData:{messageTitle:that.$("#search").val()}});
                }
//                $('body').stopTime('refreshHistoryGrid');
//                $('body').everyTime('30s', 'refreshHistoryGrid', function () {
//                    that.reloadGrid({postData:{messageTitle:that.$("#search").val()}});
//
//                });
            }
        },
        getInstance:function(options){
            var View = Backbone.View.extend(this.ListView);
            var model = new Backbone.Model({status:options.status});
            var settings = {
                el:options.el,
                model:model,
                container:options.container,
                tableId:options.tableId,
                pageId:options.pageId,
                mainView:options.mainView
            }
            var view = new View(settings);
            return view;
        }
    }
})(EB_View.crossOrgNotification)