(function(view){
    view.crossOrgNotification={}
    view.crossOrgNotification.mainApp={
        MainView:{
            events:{
                "click #newNotificationBtn":"clickNewNotification",
                "click .notificationStatusBtns>li":"clickSearchByStatus"
            },
            initialize:function(){
                this.tabModel = new Backbone.Model();
                this.tabModel.on("change:tabId", this.changeTab,this);
                this.render();
            },
            render:function(){
                var that = this;
                var tabView = new view.crossOrgNotification.TabView({model:this.tabModel,el:this.$("#ttab")});
                this.$("#notificationStatusBtns_ul").everyTime('30s', function() {
                    that.loadCounter();
                    if($.isFunction(that.addRefreshExtension)){
                        that.addRefreshExtension();
                    }
                });
            },
            loadCounter:function(){
                var that = this;
                EB_Common.Ajax.get(EB_Common.Ajax.wrapperUrl("/crossOrgNotifications/count/status"), {
                    t : Math.random()
                }, function(response) {
                    if(response.data){
                        that.$("#inprogress").html(response.data.inprogress);
                        that.$("#lastweek").html(response.data.lastweek);
                        that.$("#lastmonth").html(response.data.lastmonth);
                    }
                }, "json");
            },
            clickNewNotification:function(e){
                var url =EB_Common.Ajax.wrapperUrl("/crossOrgNotifications/new");
                var from = this.$("#main_tabs > .mouse_out ").attr("id");
                window.location = url+"#"+from;
            },
            clickSearchByStatus:function(e){
                var status = $(e.currentTarget).attr("notificationStatus");
                $("#ui-tabs-1").attr("href","/crossOrgNotifications/history/list/"+status);
                $("#ui-tabs-1").click();
            },
            changeTab:function(model){
                var roboHelpIndex = 2,
                    tabId = model.get("tabId");
                tabId = tabId.substring(tabId.length - 1 ,tabId.length);
                switch(parseInt(tabId)){
                    case 1 :
                        roboHelpIndex =2;
                        break;
                    case 2 :
                        roboHelpIndex =3;
                        break;
                    case 3 :
                        roboHelpIndex =4;
                        break;
                }
                this.$("#help_AN1").attr("roboHelpIndex",roboHelpIndex );
            }
        },
        getInstance:function(options){
            var View = Backbone.View.extend(this.MainView);
            var view = new View({el:options.el});
            return view;
        }
    },
    view.crossOrgNotification.TabView = Backbone.View.extend({
        target:'tab_container',
        initialize:function(){
            var hash = window.location.hash;
            this.render(hash?$(hash):$(this.el).find("a:first"));
        },
        render:function(tab){
            this.$(".my_tab_a").removeClass("mouse_out");
            tab.addClass("mouse_out");
            EB_Common.Ajax.load($('#'+this.target).empty(), $(tab).attr("href"));
            return this;
        },
        events:{
            "click .my_tab_a":"changeTab"
        },
        changeTab:function(e){
            e.preventDefault();
            this.model.set("tabId",$(e.currentTarget).attr("id"));
            this.render($(e.currentTarget));
        }
    });
})(EB_View)