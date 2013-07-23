/**
 * Detailed Notification Analysis 
 * 
 * @author Linder Wang
 */
(function(view) {
    view.reports = view.reports || {};
    var pub = {
        initList: function(context) {
            $(".gbqfb").click(function() {
                _reloadGrid("notification_gridTable");
            });
            $("#search").keydown(function(event) {
                if (event.which == 13) {
                    event.preventDefault();
                    _reloadGrid("notification_gridTable");
                }
            })
            function _reloadGrid(gridId) {
                $("#" + gridId).jqGrid('setGridParam', {
                    postData : {
                        messageTitle : $("#search").val()
                    }
                }).trigger("reloadGrid");
            }
            $('#notification_gridTable').jqGrid({
                url: EB_Common.Ajax.wrapperUrl("/reports/notification/grid"),
                datatype: 'json',
                mtype: 'get',
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
                pager: '#notification_gridPager',
                scrollOffset: 0,
                prmNames: {
                    page: 'pageNo',
                    totalrows: 'totalrows'
                },
                colNames : [ i18n['activebroadcast.field.messagetitle'],
                             i18n['activebroadcast.field.eventname'], i18n['activebroadcast.field.startdate'],
                             i18n['notification.advanced.createdName']
                ],
                colModel: [{
                        name: 'message.title',
                        index: 'message.title',
                        width: 100,
                        formatter: function(val, rec, rowObject) {
                            return '<a  href="' + EB_Common.Ajax.wrapperUrl("/reports/notification/view/"+rowObject.id) + '">' + $.jgrid.htmlEncode(val) + '</a>';
                        }
                    }, {
                        name : 'event.name',
                        index : 'event.name',
                        colGetLength : false,
                        sortable : true,
                        width : 120,
                        formatter : function(value, rec) {
                            return value ? $.jgrid.htmlEncode(value) : '';
                        },
                        width: 80
                    }, {
                        name: 'startDate',
                        index: 'startDate',
                        width: 80
                    }, {
                        name: 'createdName',
                        index: 'createdName',
                        width: 80
                    }],
                sortname : 'startDate',
                sortorder : 'desc',
                rowNum: 10,
                multiselect : false
            });
        },
        initView: function(context, chartData, pathAttemptIntegral) {

            this.loadResultsChart(chartData.callResultData);
            this.loadAttemptsChart(chartData.attemptData, pathAttemptIntegral);

            $('#showResults,#showAttempts').click(function(e) {
                e.preventDefault();
                var el = $(this),
                    next = el.next();
                next.toggle();
                if(next.is(':hidden')){
                    el.text(i18n['dashboard.report.link']);
                }else{
                    el.text(i18n['report.notification.analysis.hide.details']);
                }
            });
        },
        loadResultsChart: function(callResultData) {
            var total = 0;
            for (var i = 0, len = callResultData.length; i < len; i++) {
                total += callResultData[i][1];
            }
            if(total<=0){
//                $("#resultsChart").text(i18n['dashboard.noData']);
                EB_Common.noData("resultsChart");
                return;
            }
            new Highcharts.Chart({
                chart: {
                    renderTo: 'resultsChart',
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                    //margin: [0, 0, 0, 0]

                },
                colors : EB_Common.Highcharts.piecolors,
                title: {
                    text: i18n['report.notification.detailed.chart.pie.text'],
                    align: 'left',
                    style: {
                        color: '#777777',
                        fontSize: '14px',
                        fontFamily: 'Arial',
                        fontWeight: 'bold'
                    }
                },
                tooltip: {
                    formatter: function() {
                        return '<b>' + this.point.name + '</b>: ' + this.percentage.toFixed(2) +'%';

                    }
                },
                credits: {
                    enabled: false
                },
                exporting: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: false,
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true,
                        events: {
                            legendItemClick: function(event) {
                                return false;
                            }
                        }
                    }
                },
                legend: {
                    enabled:true,
                    align: 'right',
                    itemLength:350,
                    layout:"vertical",
                    verticalAlign: 'middle',
                    x: -200,
                    y: 10,
                    labelFormatter: function() {
                        var data = this.series.data,
                                total = 0,
                                num = this.y;

                        var percentage = total == 0 ? 0 : (num * 100 / total);
                        var retStr = num + ' (' + percentage.toFixed(2) + '%) ' + this.name;
                        return retStr;
                    }
                },
                series: [{
                        size : "80%",
                        center:[120,80],
                        type: 'pie',
                        name: 'Call Results',
                        data: callResultData
                    }]
            });
        },
        loadAttemptsChart: function(chartData, pathAttemptIntegral) {
            if(!chartData.data || !chartData.data.length){
//                $("#attemptsChart").text(i18n['dashboard.noData']);
                EB_Common.noData("attemptsChart");
                if('false' == pathAttemptIntegral){
                    $('#attemptsChart').hide();
                    $('#showAttempts').hide();
                }

                return;
            }

            new Highcharts.Chart({
                chart: {
                    renderTo: 'attemptsChart',
                    type: 'spline'
                },
                title: {
                    text: i18n['report.notification.detailed.chart.spline.text'],
                    align: 'left',
                    style: {
                        color: '#777777',
                        fontSize: '14px',
                        fontFamily: 'Arial',
                        fontWeight: 'bold'
                    }
                },
               /* tooltip: {
                    formatter: function() {
                        return false;
                    }
                },*/
                credits: {
                    enabled: false
                },
                exporting: {
                    enabled: false
                },
                plotOptions: {
                    spline: {
                        showInLegend: false,
                        lineWidth: 4
                    }
                },
                xAxis: {
                    categories: chartData.categories,
                    labels : {
                        align: 'right',
                        rotation: -45
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: ''
                    },
                    lineWidth: 1,
                    formatter: function() {
                        return this.value;
                    }
                },
                series: [{
                        name: 'Attempts',
                        data: chartData.data
                    }]
            });
        }
    };
    view.reports.notification = pub;

})(EB_View);
