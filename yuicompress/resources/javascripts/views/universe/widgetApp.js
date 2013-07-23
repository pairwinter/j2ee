(function(view){
    view.universe.WidgetApp = {
        WidgetAppModel:{},
        WidgetAppView:{
            jDom:{},
            subApps:{},
            template:{},
            initialize:function(){
                $.templates({twitterAppTemplate: $("#twitterAppTemplate").html()});
                this.template.twitterAppTemplate = $.render.twitterAppTemplate;
                this.render();
            },
            render:function(){
                this.jDom.twitterAppContainer = this.$("#widget_twitter");
                this.jDom.recipientAppContainer = this.$("#widget_recipientapp");
                this.jDom.weatherAppContainer = this.$("#widget_weather");
                this.jDom.networkAppContainer = this.$("#widget_network");
                this.sortable();
                this.loadTwitterApp();
                this.loadWeatherApp();
                this.loadRecipientApp();
                this.loadNetworkApp();
            },
            sortable:function(){
                this.$(".column").sortable({
                    connectWith:this.$(".column"),
                    placeholder:'widget-placeholder',
                    handle: '.widget-header',
                    cursor:'move',
                    forcePlaceholderSize: true,
                    revert: 300,
                    delay: 100,
                    opacity: 0.8,
                    scroll:false,
                    zIndex:10000,
                    //  use a helper-clone that is append to 'body' so is not 'contained' by a pane
                    helper:function (evt, ui) {
                        return $(ui).clone().appendTo('body').show();
                    }
                });
            },
            loadTwitterApp:function(){
                var options = {
                    container:this.jDom.twitterAppContainer,
                    layers:this.options.layers
                }
                this.subApps.twitterApp = EB_View.universe.widgetApps.TwitterApp.getInstance(options);
            },
            loadRecipientApp:function(){
                var options = {
                    url:EB_Common.Ajax.wrapperUrl("/universe/widget/listUnsolicitedCategorys"),
                    container:this.jDom.recipientAppContainer,
                    layers:this.options.layers
                }
                this.subApps.recipientApp = EB_View.universe.widgetApps.RecipientApp.getInstance(options);
            },
            loadWeatherApp:function(){
                var options = {
                    container:this.jDom.weatherAppContainer,
                    layers:this.options.layers
                }
                this.subApps.weatherApp = EB_View.universe.widgetApps.WeatherApp.getInstance(options);
            },
            loadNetworkApp:function(){
                var options = {
                    url:EB_Common.Ajax.wrapperUrl("/universe/widget/loadNetworkAdditionalData"),
                    container:this.jDom.networkAppContainer,
                    layers:this.options.layers
                }
                this.subApps.networkApp = EB_View.universe.widgetApps.NetworkApp.getInstance(options);
            },
            events:{
                "click #hide_show_widgets_nav":"eventClickHideShow",
                "click #widgets_list_ul a":"eventClickWidget",
                "click #universe_layout a":"eventClickLayout"
            },
            eventClickHideShow:function(){
                this.options.hideShowCallBack.call(this);
            },
            eventClickWidget:function(e){
                var widget = $(e.target).attr("widget");
                if(widget=="twitter"){
                    this.subApps.twitterApp.active();
                }else if(widget=="recipientapp"){
                    this.subApps.recipientApp.active();
                }else if(widget=="weather"){
                    this.subApps.weatherApp.active();
                }else if(widget=="network"){
                    this.subApps.networkApp.active();
                }
                if(this.$el.hasClass("close")){
                    this.$("#hide_show_widgets_nav").trigger("click");
                }
            },
            eventClickLayout:function(e){
                var layout = $(e.target).attr("layout");
                $(e.target).addClass("selected").siblings().removeClass("selected");
                layout = parseInt(layout);
                if(layout==2){
                    this.$("#universe_widget_column_sub>div").width("100%").eq(1).hide();
                    this.$("#universe_widget_column_sub2").children().appendTo($("#universe_widget_column_sub1"));
                }if(layout==3){
                    this.$("#universe_widget_column_sub>div").width("50%").show();
                }
                this.options.layoutChangeCallBack && this.options.layoutChangeCallBack.call(this,layout);
            }
        },
        getInstance:function(_options){
            var options = $.extend({},_options||{});
            var model = new Backbone.Model();
            var View = Backbone.View.extend(this.WidgetAppView);
            return new View({
                el:options.container,
                model:model,
                layers:options.layers,
                hideShowCallBack:options.hideShowCallBack,
                layoutChangeCallBack:options.layoutChangeCallBack
            });
        }
    }
})(EB_View);