(function(view) {
    view.dashboard = function() {};
    view.dashboard.widgets = function() {};
    view.dashboard.widgets.thresholdTrends = function() {};
    view.dashboard.widgets.thresholdTrends.initPage = function(categories,data) {
        Highcharts.setOptions({
            //mono-theme
           // colors: ['#DCBFB6', '#DF7E67', '#D02029', '#901A1D', '#46232F', '#F4DCCE', '#ESA385', '#D87148', '#A0573A', '#664839', '#BF96A8','#c198aa','#C5559F','#83205B','#605560']
            //multiple-theme
            colors : EB_Common.Highcharts.columncolors
        });
    	var options = {
    			chart: {
                    height: 250,
                    renderTo: 'thresholdTrends',
                    type: 'bar'
                },
                title: {
                    text: i18n['dashboard.thresholdTrends.title']
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
        				text: '%',
        				align: 'high'
                    }
                },
                tooltip: {
                    formatter: function() {
                        return ''+
                            this.series.name +': '+ this.y ;
                    }
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                            	return this.y + '%';
                            }
                        },
                        showInLegend:false
                    }
                },
                series:[]
            };
    	options.xAxis.categories = categories;
    	options.series = data;
    	var chart = new Highcharts.Chart(options);
        var el = $('#thresholdTrends');
        chart.setSize(el.width(), el.height(), false);
        chart.hasUserSize = null; 
    };

})(EB_View);