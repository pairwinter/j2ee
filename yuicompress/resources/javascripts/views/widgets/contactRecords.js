(function(view) {
    view.dashboard = function() {};
    view.dashboard.widgets = function() {};
    view.dashboard.widgets.contactRecords = function() {};
    view.dashboard.widgets.contactRecords.initPage = function(records) {
        Highcharts.setOptions({
            //mono-theme
            colors: EB_Common.Highcharts.piecolors
        });
        if(records.isEmpty){
    		EB_Common.noData('contactRecords');
		}else{
			try{
    			var chart = new Highcharts.Chart({
	                chart: {
	                	height: 250,
	                    renderTo: 'contactRecords',
	                    events : {
	                        load : function() {
	                            // set up the updating of the chart each second
	                            var series = this.series[0];
	                            var data = [];
	                            var recdata = records.data;
	                            var colors = records.colors;
	                            for ( var ele in recdata) {
	                                data.push({name:EB_Common.escapeHTML(ele), y:parseFloat(recdata[ele]),color: colors[ele] });
	                            }
	                            series.setData(data);
	                        }
	                    }
	                },
	                title: {
	                    text: null
	                },
	                credits:{
	                    enabled:false
	                },
	                exporting: { 
	                    enabled: false
	                },
	                tooltip: {
	                    formatter: function() {
	                        return '<b>'+ this.point.name +'</b>: '+this.y +' / '+ this.percentage.toFixed(2) +' %';
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
	                    	var name = this.name;
	                    	if(name.length > 20){
	                    		name = name.substring(0,20) + '...';
	                    	}
	                    	return name +': ' + this.y;
	                    },
	    				itemStyle: {
	    					color: '#333333',
	                        fontFamily: 'Arial',
	                        fontWeight:'normal',
	                        fontSize:'11px'
	    			    }
	                },
	                plotOptions: {
	                    pie: {
	                        dataLabels: {
	                            enabled: false
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
                
                var el = $('#contactRecords');
                chart.setSize(el.width(), el.height(), false);
                chart.hasUserSize = null; 
			}catch(err){
				EB_Common.noData('contactRecords');
			}
    	}
    };
})(EB_View);