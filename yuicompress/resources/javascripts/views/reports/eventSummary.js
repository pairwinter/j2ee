(function(view) {
	view.reports = function() {};
	view.reports.eventSummary = function() {};
	view.reports.eventSummary.initPage = function(totalStatus,totalPath, resultMap) {
        Highcharts.setOptions({
            //mono-theme
            colors: EB_Common.Highcharts.piecolors
        });
		if(totalStatus.isEmpty){
    		EB_Common.noData('comfirmationStatus');
		}else{
    		try{
				new Highcharts.Chart({
	                chart: {
	                    renderTo: 'comfirmationStatus',
	                    borderWidth : 0,
	                    plotBorderWidth : 0,
	                    marginLeft : 10,
	                    events : {
	                        load : function() {
	                            // set up the updating of the chart each second
	                            var series = this.series[0];
	                            var data = [];
	                            var recdata = convertI18n(totalStatus.data);
	                            for ( var ele in recdata) {
	                                data.push([ EB_Common.escapeHTML(ele), parseFloat(recdata[ele]) ]);
	                            }
	                            series.setData(data);
	                        }
	                    }
	                },
	                title: {
	                    text: i18n['report.event.totalStatus'],
	                    style:{
	                    	color: '#777777',
	                    	fontSize: '14px',
	                        fontFamily: 'Arial',
                            fontWeight:'bold'
	                    }
	                },
	                credits:{
	                    enabled:false
	                },
	                exporting: { 
	                    enabled: false
	                },
	                tooltip: {
	                	style: {
	                		fontSize:'11px'
	                	},
	                    formatter: function() {
	                        return '<b>'+ this.point.name +'</b>: '+ this.percentage.toFixed(2) +' %';
	                    }
	                },
	                legend: {
	                    enabled: true,
	                    align: 'right',
	                    layout: 'vertical',
	                    verticalAlign: 'top',
	                    x:0,
	                    y:80,
	                    labelFormatter: function() {
	                    	return this.name +': ' + this.y;
	                    },
	    				itemStyle: {
	    					color: '#333333',
	                        fontFamily: 'Arial',
	                        fontSize:'11px'
	    			    }
	                },
	                plotOptions: {
	                    pie: {
                            size :"90%",
	                    	center : [ '40%', '50%' ],
	                        dataLabels: {
	                            enabled: false,
	                            distance: -30,
	                            color:'black',
	                            formatter: function() {
	                                return this.percentage.toFixed(2) +' %';
	                            }
	                        },
	                        point:{
	                        	events: {
	                                legendItemClick: function(event) {
	                                    return false;
	                                }
	                            }
	                        },
	                        showInLegend: true
	                    }
	                },
	                series: [{
	                    type: 'pie',
	                    name: 'Browser share',
	                    data: []
	                }]
	            });
			}catch(err){
				EB_Common.noData('comfirmationStatus');
			}
    	}
    	
		if(totalPath.isEmpty){
    		EB_Common.noData('comfirmationByPath');
		}else{
    		try{
    			new Highcharts.Chart({
	    			chart: {
	                    renderTo: 'comfirmationByPath',
	                    type: 'column',
	                    events : {
	                        load : function() {
	                            // set up the updating of the chart each second
	                            var series = this.series[0];
	                            var recdata = totalPath.data;
	                            var categories = [];
	                            var data = [];
	                            for ( var ele in recdata) {
	                            	categories.push(EB_Common.escapeHTML(ele));
	                            	data.push(parseFloat(recdata[ele]));
	                            }
	                            this.xAxis[0].setCategories(categories);
	                            series.setData(data);
	                        }
	                    }
	                },
	                title: {
	                    text: i18n['report.event.totalByMonth'],
	                    style:{
	                    	color: '#777777',
	                    	fontSize: '14px',
	                        fontFamily: 'Arial',
                            fontWeight:'bold'
	                    }
	                },
	                credits:{
	                    enabled:false
	                },
	                exporting: { 
	                    enabled: false
	                },
	                xAxis: {
	                    categories: [],
	                    title: {
	                        text: null
	                    }
	                },
	                yAxis: {
	                	title: {
	        				text: i18n['report.yaxis.title'],
	        				style: {
	        					color: '#777777'
/*	                            fontFamily: 'Arial',
	                            fontWeight:'normal',
	                            fontSize:'11px'*/
	        			    }
	                    },
	                    allowDecimals: false,
	                    gridLineWidth:1,
	                    lineWidth: 1,
	                    lineColor:'#cccccc',
	                    min : 0,
	                    minRange : 5
	                },
	                tooltip: {
	                    formatter: function() {
	                        return this.x +': '+ this.y ;
	                    }
	                },
	                plotOptions: {
	                	column: {
	                        dataLabels: {
	                            enabled: true,
	                            formatter: function() {
	                            	return this.y;
	                            }
	                        },
	                        showInLegend:false
	                    }
	                },
	                series:[{
	                    type: 'column',
	                    name: 'Path',
	                    data: []
	                }]
	            });
    		}catch(err){
				EB_Common.noData('comfirmationByPath');
			}
    	}
    	
    	setTable(resultMap);
    	
	};
	
	function loadPieChart(container, recdata) {
        if(!recdata || !recdata.length) {
            EB_Common.noData(container);
            return;
        }
        Highcharts.setOptions({
            // mono-theme
            colors : EB_Common.Highcharts.piecolors
        });
        new Highcharts.Chart({
        	chart : {
                renderTo : container,
                height: 120,
                borderWidth : 0,
                plotBorderWidth : 0,
                marginLeft : 10,
                events : {
                    load : function() {
                        // set up the updating of the chart each second
                        var series = this.series[0];
                        var data = [];
                        for ( var i=0; i<recdata.length;i++) {
                            data.push([EB_Common.htmlDecode(recdata[i].name), parseFloat(recdata[i].value) ]);
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
                y : 0,
                labelFormatter : function() {
                	var name = this.name;
                	if(name.length > 20){
                		name = name.substring(0,20) + '...'
                	}
                	return name +': ' + this.y;
                },
                itemStyle : {
                    color : '#333333',
                    fontFamily : 'Arial',
                    fontSize : '11px'
                }
            },
            plotOptions : {
                pie : {
                    size : "100%",
                    center : [ 50, 50 ],
                    allowPointSelect : false,
                    cursor : 'pointer',
                    dataLabels : {
                        enabled : false
                    },
                    showInLegend : true,
                    point : {
                        events : {
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
    }
    
	function loadColumnChart(container, recdata){
		new Highcharts.Chart({
			chart: {
                renderTo: container,
                type: 'column',
                height:120,
                events : {
                    load : function() {
                        // set up the updating of the chart each second
                        var series = this.series[0];
                        var categories = [];
                        var data = [];
                        for ( var ele in recdata) {
                        	categories.push(EB_Common.escapeHTML(ele));
                        	data.push(parseFloat(recdata[ele]));
                        }
                        this.xAxis[0].setCategories(categories);
                        series.setData(data);
                    }
                }
            },
            title: {
                text: ''
            },
            credits:{
                enabled:false
            },
            exporting: { 
                enabled: false
            },
            xAxis: {
                categories: [],
                title: {
                    text: null
                }
            },
            yAxis: {
            	title: {
    				text: i18n['report.yaxis.title'],
    				style: {
    					color: '#777777'
    			    }
                },
                allowDecimals: false,
                gridLineWidth:1,
                lineWidth: 1,
                lineColor:'#cccccc',
                min : 0,
                minRange : 5
            },
            tooltip: {
                formatter: function() {
                    return this.x +': '+ this.y ;
                }
            },
            plotOptions: {
            	column: {
                    dataLabels: {
                        enabled: true,
                        formatter: function() {
                        	return this.y;
                        }
                    },
                    showInLegend:false
                }
            },
            series:[{
                type: 'column',
                name: 'Path',
                data: []
            }]
        });
	}
	
    function convertI18n(data) {
        var chartData = {};
        chartData[i18n['global.chart.confirmed']] = data.confirmedCount ? data.confirmedCount : 0;
        chartData[i18n['global.chart.confirmLate']] = data.confirmedLateCount ? data.confirmedLateCount : 0;
        chartData[i18n['global.chart.unreachable']] = data.unreachableCount ? data.unreachableCount : 0;
        chartData[i18n['global.chart.notConfirmed']] = data.notConfirmedCount ? data.notConfirmedCount : 0;
        return chartData;
    }
    function convertI18n1(data) {
        var chartData = [];
        if(data){
            chartData.push({name:i18n['global.chart.confirmed'], value:data.confirmedCount ? data.confirmedCount : 0});
            chartData.push({name:i18n['global.chart.confirmLate'], value:data.confirmedLateCount ? data.confirmedLateCount : 0});
            chartData.push({name:i18n['global.chart.unreachable'], value:data.unreachableCount ? data.unreachableCount : 0});
            chartData.push({name:i18n['global.chart.notConfirmed'], value:data.notConfirmedCount ? data.notConfirmedCount : 0});
        }
        return chartData;
    }

    function convertResponseData(data) {
        var chartData = [];
        if(data){
            var details = data.pollingDetails;
            if (details) {
                for ( var i = 0; i < details.length; i++) {
                    var detail = details[i];
                    chartData.push({name:detail.responseText, value:detail.count ? detail.count : 0});
                }
            }
        }
        return chartData;
    }
	function setTable(resultMap){
        $(".notificationDataTr").each(function(){
            var notificationId = $(this).attr("notificationId");
            var notificationType =  $(this).attr("notificationType");
            loadPieChart(notificationId+'_status',(notificationType == "Polling" || notificationType == "Quota") ? convertResponseData(resultMap[notificationId]) : convertI18n1(resultMap[notificationId]));
        });
		EB_Common.Ajax.get("/reports/event/summary/data", {eventId:$("#eventName").attr('name')
		}, function(data) {
//			var notificationPies = data.notificationPies;
//			var length = notificationPies.length;
//    		for(var i = 0; i < length; i++){
//    			var notificationVo = notificationPies[i];
//    			var key = notificationVo.notificationId;
//				if(notificationVo.isEmpty){
//					EB_Common.noData(key.toString()+'_status');
//				}else{
//					try{
//						loadPieChart(key.toString()+'_status',notificationVo.type == "Polling" || notificationVo.type == "Quota" ? notificationVo.data : convertI18n(notificationVo.data));
//					}catch(err){
//						EB_Common.noData(key.toString()+"_status");
//					}
//				}
//    		}
    		
    		var notificationColumns = data.notificationColumns;
			var length = notificationColumns.length;
    		for(var i = 0; i < length; i++){
    			var notificationVo = notificationColumns[i];
    			var key = notificationVo.notificationId;
				if(notificationVo.empty){
					EB_Common.noData(key.toString()+'_path');
				}else{
					try{
						loadColumnChart(key.toString()+'_path',notificationVo.data);
					}catch(err){
						EB_Common.noData(key.toString()+"_path");
					}
				}
    		}
		});
	}
})(EB_View);