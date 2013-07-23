(function(view){
    var markerIndex = 0;
    view.universe.widgetApps={};
    view.universe.widgetApps.TwitterTweetApp={
        TweetModel:{
            defaults:function(){
                return {
                    viewOnMap:false
                }
            }
        },
        TweetView:{
            tagName:"li",
            jDom:{},
            template:{},
            initialize:function(){
                $.templates({tweetsTemplate: $("#tweetsTemplate").html()});
                this.template.tweetsTemplate = $.render.tweetsTemplate;
                this.model.on("change:followed",this.renderFollowed,this);
                this.model.on("change:viewOnMap",this.renderViewOnMap,this);
                this.model.on("change:movePosition",this.renderMovePosition,this);
                this.render();
                this.renderViewOnMap();
            },
            render:function(){
                this.$el.addClass("w-contentblock_box").html(this.template.tweetsTemplate(this.getIdSuffixModelJSON()));
            },
            renderFollowed:function(){
                var followed = this.model.get("followed"),title = "";
                if(followed){
                    title = i18n["universe.widget.twitter.untrack.title"];
                }else{
                    title = i18n["universe.widget.twitter.track.title"];
                }
                this.$("span>a.follow_user").attr("title",title);
            },
            renderViewOnMap:function(){
                var tweet = this.model.toJSON();
                if(!tweet.location){
                    return;
                };
                if(tweet.viewOnMap){
                    this.$(".tweet_viewonmap").addClass('icn_tw_offtweet');
                }else{
                    this.$(".tweet_viewonmap").removeClass('icn_tw_offtweet');
                }
                if(tweet.viewOnMap){
                    this.$(">div").addClass("highlighted_w-contentblock");
                    if(this.marker){
                        this.marker.display(true);
                        this.marker.icon.imageDiv.style.zIndex = ++markerIndex;
                        EB_View.universe.openlayers.tool.topLayerIndex(this.options.markersLayer);
                        return;
                    }
                    var lonLat = new OpenLayers.LonLat( tweet.location.lon ,tweet.location.lat).transform(EB_View.universe.config.latlon_proj, EB_View.universe.universeApp.map.getProjectionObject());
                    var popupContentHTML = $("#tweetMarkerTemplate").render(tweet);
                    if(!tweet.icon){
                        tweet.icon = "univmap_tw_blu-dia.png";
                    }
                    var iconPath = EB_Common.Ajax.ctx+"/statics/stylesheets/settings/img/"+tweet.icon;
                    var size = new OpenLayers.Size(21,25);
                    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
                    var icon = new OpenLayers.Icon(iconPath, size, offset);
                    var setting = {
                        icon: icon
                    };
                    this.marker = EB_View.universe.openlayers.tool.createMarkerForUniverse(this.options.markersLayer,lonLat,popupContentHTML,setting);
                }else{
                    this.$(">div").removeClass("highlighted_w-contentblock");
                    if(this.marker){
                        this.marker.display(false);
                    }
                }
            },
            renderMovePosition:function(){
                if(this.marker){
                    this.options.markersLayer.map.setCenter(this.marker.lonlat);
                }
            },
            followUser:function(){
                if(this.ajaxRequest){
                    this.ajaxRequest.abort();
                }
                var view = this;
                var postData={follow:!this.model.get("followed"),screenName:this.model.get("from").screenName};
                this.ajaxRequest = EB_Common.Ajax.get("/universe/widget/followUser",postData,function(){
                    var follow = postData.follow;
                    view.model.collection.each(function(model,i){
                        var from = model.get("from");
                        if(from && (from.screenName === postData.screenName)){
                            model.set("followed",follow);
                        }
                    });
                },"json");
            },
            events:function(){
                var events = {
                    "click span>a.icn_tw_showtweet":"eventClickViewTweetOnMap",
                    "click span>a.follow_user":"eventClickFollowUser"
                };
                return this.dealEvents(events,this.cid);
            },
            eventClickViewTweetOnMap:function(){
                this.model.set("viewOnMap",!this.model.get("viewOnMap"));
                if(this.model.get("viewOnMap")){
                    this.model.set("movePosition",!this.model.get("movePosition"));
                }
            },
            eventClickFollowUser:function(){
                var view = this,info="", follow = !this.model.get("followed"),screenName = this.model.get("from").screenName;
                if(follow){
                    info = i18n["universe.widget.twitter.track.prompt"]+screenName+"?";
                }else{
                    info = i18n["universe.widget.twitter.untrack.prompt"]+screenName+"?";
                }
                EB_Common.dialog.confirm(info,"",function(){view.followUser();});
            }
        },
        getInstance:function(_options){
            var options = $.extend({},_options||{});
            var Model = Backbone.Model.extend(this.TweetModel);
            var model = null;
            if(options.model){
                model = options.model;
            }else{
                model = new Model();
            }
            var View = EB_Common.Backbone.View.extend(this.TweetView);
            return new View({model:model,markersLayer:options.markersLayer});
        }
    }
    view.universe.widgetApps.TwitterAlertApp={
        AlertModel:{
            defaults:function(){
                return {
                    viewOnMap:false
                }
            }
        },
        AlertView:{
            tagName:"li",
            jDom:{},
            template:{},
            initialize:function(){
                $.templates({twitterThresholdTemplate: $("#twitterThresholdTemplate").html()});
                this.template.twitterThresholdTemplate = $.render.twitterThresholdTemplate;
                this.model.on("change:viewOnMap",this.renderViewOnMap,this);
                this.tweetsCollection = new Backbone.Collection({model:EB_View.universe.widgetApps.TwitterTweetApp.TweetModel});
                this.tweetsCollection.on("add",this.addTweet,this);
                this.render();
            },
            render:function(){
                this.$el.addClass("w-contentblock").html(this.template.twitterThresholdTemplate(this.getIdSuffixModelJSON()));
                this.jDom.tweetsListContainer = this.$("#tweetsListContainer");
                this.jDom.tweetsListUl = this.$("#tweetsList");
            },
            renderViewOnMap:function(){
                var viewOnMap = this.model.get("viewOnMap");
                if(viewOnMap){
                    this.$("#alertsTweetsViewAllOnMap").addClass('icn_showoffmap_16');
                }else{
                    this.$("#alertsTweetsViewAllOnMap").removeClass('icn_showoffmap_16');
                }
                this.tweetsCollection.each(function(model,i){
                    model.set("viewOnMap",viewOnMap);
                    if(viewOnMap && i==0){
                        model.set("movePosition",!model.get("movePosition"));
                    }
                });
            },
            addTweet:function(model){
                model.set("viewOnMap",this.model.get("viewOnMap"));
                model.set("icon",this.model.get("icon"));
                var view =  EB_View.universe.widgetApps.TwitterTweetApp.getInstance({model:model,markersLayer:this.markersLayer});
                this.jDom.tweetsListUl.append(view.$el);
            },
            loadPaginationForTweets:function(currentPageNo,totalPageCount){
                var view = this, pagination = this.$("#tweetsPagination");
                if(totalPageCount!=0){
                    if(pagination.data("jqPagination")){
                        pagination.jqPagination("destroy");
                    }
                    pagination.show().jqPagination({
                        link_string	: 'javascript:void(0)',
                        max_page	: totalPageCount,
                        current_page: currentPageNo,
                        paged: function(page) {
                            view.loadTweets(page);
                        }
                    });
                    pagination.children().removeClass("ui-state-disabled");
                    if(totalPageCount==1){
                        pagination.children().not(".current").addClass("ui-state-disabled");
                    }else if(currentPageNo==1){
                        pagination.children(".first,.previous").addClass("ui-state-disabled");
                    }else if(currentPageNo==totalPageCount){
                        pagination.children(".next,.last").addClass("ui-state-disabled");
                    }
                    pagination.find(".current").text(currentPageNo+"/"+totalPageCount);
                }else{
                    pagination.hide();
                }
            },
            formatAliveMilliSeconds:function(milliSeconds){
                milliSeconds = milliSeconds>0?milliSeconds:0;
                var result = [];
                var seconds = parseInt(milliSeconds/1000);
                var minutes = parseInt(seconds/60) || 1;
                var hours = parseInt(seconds/(60*60));
                var days = parseInt(seconds/(24*60*60));
                if(days){
                    result.push(days + " " + i18n['universe.widget.days']);
                    hours = parseInt((seconds-days*24*60*60)/(60*60));
                    result.push(hours + " " + i18n['universe.widget.hours']);
                    minutes = parseInt((seconds-(days*24*60*60+hours*60*60))/60);
                    result.push(minutes + " " + i18n['universe.widget.minutes']);
                }else if(hours){
                    result.push(hours + " " + i18n['universe.widget.hours']);
                    minutes = parseInt((seconds-hours*60*60)/60);
                    result.push(minutes + " " + i18n['universe.widget.minutes']);
                }else{
                    result.push(minutes + " " + i18n['universe.widget.minutes']);
                }
                return result.join(",");
            },
            loadTweets:function(pageNo){
                if(this.ajaxRequest){
                    this.ajaxRequest.abort();
                }
                this.$("#alertsTweetsViewAllOnMap").show();
                this.tweetsCollection.each(function(model,i){
                    model.set("viewOnMap",false);
                });
                this.tweetsCollection.reset();
                var modelData = this.model.toJSON(),view = this;
                var postData = {
                    pageNo:pageNo,
                    pageSize:30,
                    thresholdId:modelData.threshold.id,
                    alertId:modelData.id,
                    tweetsType:this.options.searchType
                }
                this.ajaxRequest = EB_Common.Ajax.get("/universe/widget/searchTweets",postData,function(data){
                    view.jDom.tweetsListUl.empty();
                    if(data.twitterAlert.alertStatus == 'Completed'){
                        view.$("#activeStatus").removeClass('icon_user_online').addClass('icon_user_offline').attr('title',i18n['universe.widget.twitter.notactivetitle']);
                    }else{
                        view.$("#activeStatus").removeClass('icon_user_offline').addClass('icon_user_online').attr('title',i18n['universe.widget.twitter.activetitle']);
                    }
                    view.$("#lastTweetFormatDate").text(data.twitterAlert.lastTweetFormatDate || 'Have no trigged');
                    view.$("#activeFor").text(view.formatAliveMilliSeconds(data.twitterAlert.aliveMilliSeconds));
                    view.$("#alertTweetsCount").text(data.tweetDataPage.totalCount);
                    view.$("#alertViewTweetsCount").text(data.tweetDataPage.totalCount);
                    view.loadPaginationForTweets(data.tweetDataPage.currentPageNo, data.tweetDataPage.totalPageCount);
                    if(data.tweetDataPage.totalCount==0){
                        view.jDom.tweetsListUl.append($("<li class='li_nodata'>").text(i18n["universe.widget.twitter.nodata"]));
                        return;
                    }
                    view.tweetsCollection.reset();
                    view.tweetsCollection.add(data.tweetDataPage.data);
                },"json");
            },
            events:function(){
                var events = {
                    "click #alertsTweetsViewAllOnMap":"eventClickViewTweetOnMap",
                    "click a.viewTweets":"eventClickShowAlertsTweets",
                    "click a.refresh":"eventClickRefreshAlertsTweets"
                }
                return this.dealEvents(events,this.cid);
            },
            eventClickViewTweetOnMap:function(e){
                this.model.set("viewOnMap",!this.model.get("viewOnMap"));
            },
            eventClickShowAlertsTweets:function(e){
                this.jDom.tweetsListContainer.toggle();
                if(this.load){
                    return;
                }
                this.load = true;
                this.loadTweets(1);
            },
            eventClickRefreshAlertsTweets:function(e){
                this.jDom.tweetsListContainer.show();
                this.load = true;
                this.loadTweets(1);
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.AlertModel);
            var model = null;
            if(options.model){
                model = options.model;
            }else{
                model = new Model();
            }
            var View = EB_Common.Backbone.View.extend(this.AlertView);
            return new View({model:model,markersLayer:options.markersLayer,searchType:options.searchType});
        }
    }
    view.universe.widgetApps.TwitterApp={
        TwitterAppModel:{
            defaults:function(){
                return {
                    alertsType:"all",
                    feedsType:"all",
                    alertsTime:"5 m",
                    feedsTime:"5 m",
                    feedsViewOnMap:false
                }
            }
        },
        TwitterAppView:{
            jDom:{},
            template:{},
            initialize:function(){
                $.templates({twitterAppTemplate: $("#twitterAppTemplate").html()});
                this.template.twitterAppTemplate = $.render.twitterAppTemplate;
                this.model.on("change:feedsViewOnMap",this.renderFeedsViewOnMap,this)
                this.alertsCollection = new Backbone.Collection({model:EB_View.universe.widgetApps.TwitterAlertApp.AlertModel});
                this.alertsCollection.on("add",this.addAlert,this);
                this.feedsCollection = new Backbone.Collection({model:EB_View.universe.widgetApps.TwitterTweetApp.TweetModel});
                this.feedsCollection.on("add",this.addFeedsTweet,this);
                this.render();
            },
            render:function(){
                this.$el.html(this.template.twitterAppTemplate(this.getIdSuffixModelJSON()));
                this.jDom.alertsContainer = this.$("#alertsContainer");
                this.jDom.alertsListUl = this.$("#twitter_threshold_list");
                this.jDom.alertLoading = this.$("#alertLoading");

                this.jDom.feedsTweetsContainer = this.$("#feeds_tweets_container");
                this.jDom.feedsTweetsUl = this.$("#feeds_tweets_list");
                this.jDom.feedsTweetsLoading = this.$("#alertLoading");
                return this;
            },
            renderFeedsViewOnMap:function(){
                var viewOnMap = this.model.get("feedsViewOnMap");
                this.feedsCollection.each(function(model,i){
                    model.set("viewOnMap",viewOnMap);
                    if(viewOnMap && i==0){
                        model.set("movePosition",!model.get("movePosition"));
                    }
                })
            },
            addAlert:function(model){
                var view = EB_View.universe.widgetApps.TwitterAlertApp.getInstance({model:model,searchType:this.model.get("alertsType")});
                view.markersLayer = this.options.layers.widgetMarkersLayer
                this.jDom.alertsListUl.append(view.$el);
            },
            addFeedsTweet:function(model){
                model.set("viewOnMap",this.model.get("feedsViewOnMap"));
                var view = EB_View.universe.widgetApps.TwitterTweetApp.getInstance({model:model,markersLayer:this.options.layers.widgetMarkersLayer});
                this.jDom.feedsTweetsUl.append(view.$el);
            },
            active:function(){
                this.$el.show();
                if(this.load) return;
                this.load = true;
                this.loadTwitterAlertsData(1);
            },
            activeFeeds:function(){
                if(this.loadFeeds) return;
                this.loadFeeds = true;
                this.loadTwitterFeedsTweetsData(1);
            },
            parseSelectTime:function(value){
                var values = value.split(" ");
                if(values[1]=="m"){
                    return (parseInt(values[0])*60*1000);
                }else if(values[1]=="h"){
                    return (parseInt(values[0])*3600*1000);
                }else if(values[1]=="d"){
                    return (parseInt(values[0])*24*3600*1000);
                }
                return 0;
            },
            loadPaginationForAlerts:function(currentPageNo,totalPageCount){
                var view = this, pagination = this.$("#alertsPagination");
                if(totalPageCount!=0){
                    if(pagination.data("jqPagination")){
                        pagination.jqPagination("destroy");
                    }
                    pagination.show().jqPagination({
                        link_string	: 'javascript:void(0)',
                        max_page	: totalPageCount,
                        current_page: currentPageNo,
                        paged: function(page) {
                            view.loadTwitterAlertsData(page);
                        }
                    });
                    pagination.children().removeClass("ui-state-disabled");
                    if(totalPageCount==1){
                        pagination.children().not(".current").addClass("ui-state-disabled");
                    }else if(currentPageNo==1){
                        pagination.children(".first,.previous").addClass("ui-state-disabled");
                    }else if(currentPageNo==totalPageCount){
                        pagination.children(".next,.last").addClass("ui-state-disabled");
                    }
                    pagination.find(".current").text(currentPageNo+"/"+totalPageCount);
                }else{
                    pagination.hide();
                }
            },
            loadPaginationForFeeds:function(currentPageNo,totalPageCount){
                var view = this, pagination = this.$("#feedsPagination");
                if(totalPageCount!=0){
                    if(pagination.data("jqPagination")){
                        pagination.jqPagination("destroy");
                    }
                    pagination.show().jqPagination({
                        link_string	: 'javascript:void(0)',
                        max_page	: totalPageCount,
                        current_page: currentPageNo,
                        paged: function(page) {
                            view.loadTwitterFeedsTweetsData(page);
                        }
                    });
                    pagination.children().removeClass("ui-state-disabled");
                    if(totalPageCount==1){
                        pagination.children().not(".current").addClass("ui-state-disabled");
                    }else if(currentPageNo==1){
                        pagination.children(".first,.previous").addClass("ui-state-disabled");
                    }else if(currentPageNo==totalPageCount){
                        pagination.children(".next,.last").addClass("ui-state-disabled");
                    }
                    pagination.find(".current").text(currentPageNo+"/"+totalPageCount);
                }else{
                    pagination.hide();
                }
            },
            formatAliveMilliSeconds:function(milliSeconds){
                milliSeconds = milliSeconds>0?milliSeconds:0;
                var result = [];
                var seconds = parseInt(milliSeconds/1000);
                var minutes = parseInt(seconds/60) || 1;
                var hours = parseInt(seconds/(60*60));
                var days = parseInt(seconds/(24*60*60));
                if(days){
                    result.push(days + " " + i18n['universe.widget.days']);
                    hours = parseInt((seconds-days*24*60*60)/(60*60));
                    result.push(hours + " " + i18n['universe.widget.hours']);
                    minutes = parseInt((seconds-(days*24*60*60+hours*60*60))/60);
                    result.push(minutes + " " + i18n['universe.widget.minutes']);
                }else if(hours){
                    result.push(hours + " " + i18n['universe.widget.hours']);
                    minutes = parseInt((seconds-hours*60*60)/60);
                    result.push(minutes + " " + i18n['universe.widget.minutes']);
                }else{
                    result.push(minutes + " " + i18n['universe.widget.minutes']);
                }
                return result.join(",");
            },
            loadTwitterAlertsData:function(pageNo){
                if(this.ajaxRequest){
                    this.ajaxRequest.abort();
                }
                this.alertsCollection.each(function(model,i){
                    model.set("viewOnMap",false);
                });
                this.alertsCollection.reset();
                if(this.model.get("feedsViewOnMap")){
                    this.$("#feedsTweetsViewAllOnMap").click();
                }
                var view = this, postData = {
                    pageSize:30,
                    pageNo:pageNo,
                    time:this.parseSelectTime(this.model.get("alertsTime")),
                    tweetsType:this.model.get("alertsType")
                } || {};
                this.ajaxRequest = EB_Common.Ajax.get("/universe/widget/searchTwitterAlerts",postData,function(data){
                    view.jDom.alertsContainer.show();
                    EB_Common.logger.log(data);
                    var t =  data.twitterAlerts;
                    if(t){
                        $.each(t.data || [],function(i,twitterAlert){
                            twitterAlert.activefor = view.formatAliveMilliSeconds(twitterAlert.aliveMilliSeconds);
                            if(twitterAlert.alertStatus == 'Completed'){
                                twitterAlert.activeClass = 'icon_user_offline';
                                twitterAlert.activeTitle = i18n['universe.widget.twitter.notactivetitle'];
                            }else{
                                twitterAlert.activeClass = 'icon_user_online';
                                twitterAlert.activeTitle = i18n['universe.widget.twitter.activetitle'];
                            }
                        });
                    }
                    view.loadPaginationForAlerts(t.currentPageNo, t.totalPageCount);
                    view.$("#t_a_trigger_num").text(t.totalCount);
                    if(t.totalCount==0){
                        view.jDom.alertsListUl.empty().append($("<li class='li_nodata'>").text(i18n["universe.widget.twitter.nodata"]));
                        return;
                    }
                    view.jDom.alertsListUl.empty();
                    view.alertsCollection.reset();
                    view.alertsCollection.add(t.data);
                },"json");
            },
            loadTwitterFeedsTweetsData:function(pageNo){
                if(this.ajaxRequestForFeeds){
                    this.ajaxRequestForFeeds.abort();
                }
                this.feedsCollection.each(function(model,i){
                    model.set("viewOnMap",false);
                });
                this.feedsCollection.reset();
                var view = this, postData = {
                    pageSize:30,
                    pageNo:pageNo,
                    time:this.parseSelectTime(this.model.get("feedsTime")),
                    tweetsType:this.model.get("feedsType")
                } || {};
                this.ajaxRequestForFeeds = EB_Common.Ajax.get("/universe/widget/searchTweets",postData,function(data){
                    view.jDom.feedsTweetsContainer.show();
                    view.jDom.feedsTweetsUl.empty();
                    view.loadPaginationForFeeds(data.tweetDataPage.currentPageNo, data.tweetDataPage.totalPageCount);
                    if(data.tweetDataPage.totalCount==0){
                        view.jDom.feedsTweetsUl.append($("<li class='li_nodata'>").text(i18n["universe.widget.twitter.nodata"]));
                        return;
                    }
                    view.feedsCollection.reset();
                    view.feedsCollection.add(data.tweetDataPage.data);
                },"json");
            },
            events:function(){
                var events = {
                    "click div.contract":"eventClickContract",
                    "click #toSetting":"eventClickToSetting",
                    "click i.widget-remove":"eventClickRemoveWidget",
                    "click #twitterTab a":"eventClickTabLabel",
                    "change #alertsType":"eventChangeAlertsType",
                    "change #feedsType":"eventChangeFeedsType",
                    "change #twitterAlertsTime":"eventChangeAlertsTime",
                    "change #twitterFeedsTime":"eventChangeFeedsTime",
                    "click #twitterAlertsRefresh":"eventClickRefreshAlerts",
                    "click #twitterFeedsRefresh":"eventClickRefreshFeeds",
                    "click #feedsTweetsViewAllOnMap":"eventClickFeedsTweetsViewOnMap"
                }
                return this.dealEvents(events,this.cid);
            },
            eventClickToSetting:function(e){
                var link = $(e.target).attr("link");
                EB_Common.dialog.confirm(i18n["universe.widget.tosetting"],null,function(){
                    window.location.href=link;
                });
            },
            eventClickContract:function(e){
                var j = $(e.currentTarget);
                j.find("i").toggleClass("off");
                j.parent().next().toggle();
            },
            eventClickRemoveWidget:function(e){
                var j = $(e.target);
                j.parent().parent().parent().parent().hide();
            },
            eventClickTabLabel:function(e){
                var j = $(e.target).addClass("mouse_out");
                j.siblings().removeClass("mouse_out");
                var field = j.attr("field");
                if(field=="tweets"){
                    this.activeFeeds();
                }
                this.$("#"+field+"_tab").show().siblings().hide();
            },
            eventChangeAlertsType:function(e){
                this.model.set("alertsType", e.target.value);
                this.loadTwitterAlertsData(1);
            },
            eventChangeAlertsTime:function(e){
                this.model.set("alertsTime", e.target.value);
                this.loadTwitterAlertsData(1);
            },
            eventChangeFeedsType:function(e){
                this.model.set("feedsType", e.target.value);
                this.loadTwitterFeedsTweetsData(1);
            },
            eventChangeFeedsTime:function(e){
                this.model.set("feedsTime", e.target.value);
                this.loadTwitterFeedsTweetsData(1);
            },
            eventClickRefreshAlerts:function(){
                this.loadTwitterAlertsData(1);
            },
            eventClickRefreshFeeds:function(e){
                this.loadTwitterFeedsTweetsData(1);
            },
            eventClickFeedsTweetsViewOnMap:function(e){
                this.model.set("feedsViewOnMap",!this.model.get("feedsViewOnMap"));
                if(this.model.get("feedsViewOnMap")){
                    $(e.target).addClass('icn_showoffmap_16');
                }else{
                    $(e.target).removeClass('icn_showoffmap_16');
                }
            },
            getJsonData:function(parentObj){
                return parentObj;
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.TwitterAppModel);
            var model = new Model();
            var View = EB_Common.Backbone.View.extend(this.TwitterAppView);
            return new View({
                el:options.container,
                model:model,
                layers:options.layers
            });
        }
    };
    view.universe.widgetApps.RecipientMessageApp={
        MessageModel:{
            defaults:function(){
                return {
                    viewOnMap:false
                }
            }
        },
        MessageView:{
            tagName:"li",
            jDom:{},
            template:{},
            initialize:function(){
                $.templates({recipientappMessagesTemplate: $("#recipientappMessagesTemplate").html()});
                this.template.recipientappMessagesTemplate = $.render.recipientappMessagesTemplate;
                this.model.on("change:viewOnMap",this.renderViewOnMap,this);
                this.model.on("change:movePosition",this.renderMovePosition,this);
                this.render();
                this.renderViewOnMap();
            },
            render:function(){
                this.$el.addClass("w-contentblock").html(this.template.recipientappMessagesTemplate(this.getIdSuffixModelJSON()));
            },
            renderViewOnMap:function(){
                var message = this.model.toJSON();
                if(!message.longitude || !message.latitude) return;
                if(message.viewOnMap){
                    this.$el.addClass("highlighted_w-contentblock");
                    this.$("#messageViewOnMap").addClass('icn_showoffmap_16');
                    if(this.marker){
                        this.marker.display(true);
                        return;
                    }
                    var lonLat = new OpenLayers.LonLat( message.longitude ,message.latitude).transform(EB_View.universe.config.latlon_proj, EB_View.universe.universeApp.map.getProjectionObject());
                    var popupContentHTML = "";
                    if(message.unsolicitedMessage){
                        popupContentHTML = $("#unsolicitedMarkerTemplate").render(message);
                    }else{
                        popupContentHTML = $("#solicitedMarkerTemplate").render(message);
                    }
                    var iconName = message.icon || (message.category && message.category.icon);
                    if(!iconName){
                        iconName = "univmap_tw_blu-dia.png";
                    }
                    var iconPath = EB_Common.Ajax.ctx+"/statics/stylesheets/settings/img/"+iconName;
                    var size = new OpenLayers.Size(21,25);
                    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
                    var icon = new OpenLayers.Icon(iconPath, size, offset);
                    var setting = {
                        icon: icon
                    }
                    this.marker = EB_View.universe.openlayers.tool.createMarkerForUniverse(this.options.markersLayer,lonLat,popupContentHTML,setting);
                }else{
                    this.$("#messageViewOnMap").removeClass('icn_showoffmap_16');
                    this.$el.removeClass("highlighted_w-contentblock");
                    if(this.marker){
                        this.marker.display(false);
                    }
                }
            },
            renderMovePosition:function(){
                if(this.marker){
                    this.options.markersLayer.map.setCenter(this.marker.lonlat);
                }
            },
            events:function(){
                var events = {
                    "click #toNotificationContacts":"eventClickToNotification",
                    "click #messageViewOnMap":"eventClickViewOnMap"
                }
                return this.dealEvents(events,this.cid);
            },
            eventClickToNotification:function(){
                var contactId = this.model.get("contactId") ;
                var firstName = this.model.get("contactFirstName");
                var lastName = this.model.get("contactLastName");
                var newContact={
                    id: contactId,
                    firstName: firstName,
                    lastName:  lastName
                }
                var contacts = EB_View.universe.contactApp.subApps.individualGroupFilter.model.get("contacts") || [];
                var hasExist = false;
                $.each(contacts,function(i,contact){
                    if(contact.id == contactId){
                        hasExist = true;
                        return;
                    }
                });
                if(!hasExist){
                    contacts.push(newContact);
                }
                EB_View.universe.contactApp.subApps.individualGroupFilter.model.set("contacts",contacts);
                EB_View.universe.contactApp.subApps.individualGroupFilter.renderIndividualContacts();
                EB_View.universe.contactApp.model.set("contactsCount",contacts.length);
                EB_View.universe.universePageApp.adjustNotificationContainer();
            },
            eventClickViewOnMap:function(){
                this.model.set("viewOnMap",!this.model.get("viewOnMap"));
                if(this.model.get("viewOnMap")){
                    this.model.set("movePosition",!this.model.get("movePosition"));
                }
            }
        },
        getInstance:function(_options){
            var options = $.extend({},_options||{});
            var Model = Backbone.Model.extend(this.TweetModel);
            var model = null;
            if(options.model){
                model = options.model;
            }else{
                model = new Model();
            }
            var View = EB_Common.Backbone.View.extend(this.MessageView);
            return new View({model:model,markersLayer:options.markersLayer});
        }

    };
    view.universe.widgetApps.RecipientApp={
        RecipientAppModel:{
            defaults:function(){
                return {
                    load:false,
                    unsolicitedCategoryList:[],
                    unsolicitedTime:"1 h",
                    categoryId:0,
                    solicitedTime:"1 h",
                    unsolicitedViewOnMap:false,
                    solicitedViewOnMap:false
                }
            },
            initialize:function(){
                if(arguments && arguments.length>1 && arguments[1].url){
                    this.urlRoot = arguments[1].url
                }
            },
            parse:function(response){
                var model = {load:true} || {};
                model.unsolicitedCategoryList = response.unsolicitedCategoryList || [];
                return model;
            }
        },
        RecipientAppView:{
            jDom:{},
            template:{},
            initialize:function(){
                $.templates({widgetRecipientAppTemplate: $("#widgetRecipientAppTemplate").html()});
                this.template.widgetRecipientAppTemplate = $.render.widgetRecipientAppTemplate;
                this.model.on("change:load",this.render,this);
                this.model.on("change:unsolicitedTime",this.renderChangeUnsolicitedTime,this);
                this.model.on("change:unsolicitedCategory",this.renderChangeUnsolicitedCategory,this);
                this.model.on("change:solicitedTime",this.renderChangeSolicitedTime,this);
                this.model.on("change:unsolicitedViewOnMap",this.renderChangeUnsolicitedViewOnMap,this);
                this.model.on("change:solicitedViewOnMap",this.renderChangeSolicitedViewOnMap,this);
                this.unsolicitedCollection = new Backbone.Collection({model:EB_View.universe.widgetApps.RecipientMessageApp.MessageModel});
                this.unsolicitedCollection.on("add",this.unsolicitedCollectionAdd,this);
                this.solicitedCollection = new Backbone.Collection({model:EB_View.universe.widgetApps.RecipientMessageApp.MessageModel});
                this.solicitedCollection.on("add",this.solicitedCollectionAdd,this);
                if(this.model.urlRoot){
                    this.model.fetch();
                }else{
                    this.render();
                }
            },
            render:function(){
                this.$el.html(this.template.widgetRecipientAppTemplate(this.getIdSuffixModelJSON()));
                this.jDom.unsolicitedListContainer =  this.$("#unsolicitedListContainer");
                this.jDom.solicitedListContainer =  this.$("#solicitedListContainer");
                this.jDom.unsolicitedList =  this.$("#unsolicitedList");
                this.jDom.solicitedList =  this.$("#solicitedList");
                return this;
            },
            renderChangeUnsolicitedTime:function(){
                this.loadUnsolicitedMessage(1);
            },
            renderChangeUnsolicitedCategory:function(){
                this.loadUnsolicitedMessage(1);
            },
            renderChangeSolicitedTime:function(){
                this.loadSolicitedMessage(1);
            },
            renderChangeUnsolicitedViewOnMap:function(){
                var viewOnMap = this.model.get("unsolicitedViewOnMap")
                this.unsolicitedCollection.each(function(model,i){
                    model.set("viewOnMap",viewOnMap)
                    if(viewOnMap && i==0){
                        model.set("movePosition",!model.get("movePosition"));
                    }
                });
            },
            renderChangeSolicitedViewOnMap:function(){
                var viewOnMap = this.model.get("solicitedViewOnMap")
                this.solicitedCollection.each(function(model,i){
                    model.set("viewOnMap",viewOnMap);
                    if(viewOnMap && i==0){
                        model.set("movePosition",!model.get("movePosition"));
                    }
                });

            },
            unsolicitedCollectionAdd:function(model){
                model.set("unsolicitedMessage",true);
                model.set("viewOnMap",this.model.get("unsolicitedViewOnMap"));
                var view = EB_View.universe.widgetApps.RecipientMessageApp.getInstance({model:model,markersLayer:this.options.layers.widgetMarkersLayer});
                this.jDom.unsolicitedList.append(view.$el);
            },
            solicitedCollectionAdd:function(model){
                model.set("unsolicitedMessage",false);
                model.set("icon","univmap_tw_grn-circ.png");
                model.set("viewOnMap",this.model.get("solicitedViewOnMap"));
                var view = EB_View.universe.widgetApps.RecipientMessageApp.getInstance({model:model,markersLayer:this.options.layers.widgetMarkersLayer})
                this.jDom.solicitedList.append(view.$el);
            },
            parseSelectTime:function(value){
                var values = value.split(" ");
                if(values[1]=="m"){
                    return (parseInt(values[0])*60*1000);
                }else if(values[1]=="h"){
                    return (parseInt(values[0])*3600*1000);
                }else if(values[1]=="d"){
                    return (parseInt(values[0])*24*3600*1000);
                }
                return 0;
            },
            active:function(){
                this.$el.show();
                if(this.loadUnsolicited) return;
                this.loadUnsolicited = true;
                this.loadUnsolicitedMessage(1);
            },
            activeSolicitedMessage:function(){
                this.$el.show();
                if(this.loadSolicited) return;
                this.loadSolicited = true;
                this.loadSolicitedMessage(1);
            },
            loadPaginationForUnsolicitedMessage:function(currentPageNo,totalPageCount){
                var view = this, pagination = this.$("#unsolicitedPagination");
                if(totalPageCount!=0){
                    if(pagination.data("jqPagination")){
                        pagination.jqPagination("destroy");
                    }
                    pagination.show().jqPagination({
                        link_string	: 'javascript:void(0)',
                        max_page	: totalPageCount,
                        current_page: currentPageNo,
                        paged: function(page) {
                            view.loadUnsolicitedMessage(page);
                        }
                    });
                    pagination.children().removeClass("ui-state-disabled");
                    if(totalPageCount==1){
                        pagination.children().not(".current").addClass("ui-state-disabled");
                    }else if(currentPageNo==1){
                        pagination.children(".first,.previous").addClass("ui-state-disabled");
                    }else if(currentPageNo==totalPageCount){
                        pagination.children(".next,.last").addClass("ui-state-disabled");
                    }
                    pagination.find(".current").text(currentPageNo+"/"+totalPageCount);
                }else{
                    pagination.hide();
                }
            },
            loadPaginationForSolicitedMessage:function(currentPageNo,totalPageCount){
                var view = this, pagination = this.$("#solicitedPagination");
                if(totalPageCount!=0){
                    if(pagination.data("jqPagination")){
                        pagination.jqPagination("destroy");
                    }
                    pagination.show().jqPagination({
                        link_string	: 'javascript:void(0)',
                        max_page	: totalPageCount,
                        current_page: currentPageNo,
                        paged: function(page) {
                            view.loadSolicitedMessage(page);
                        }
                    });
                    pagination.children().removeClass("ui-state-disabled");
                    if(totalPageCount==1){
                        pagination.children().not(".current").addClass("ui-state-disabled");
                    }else if(currentPageNo==1){
                        pagination.children(".first,.previous").addClass("ui-state-disabled");
                    }else if(currentPageNo==totalPageCount){
                        pagination.children(".next,.last").addClass("ui-state-disabled");
                    }
                    pagination.find(".current").text(currentPageNo+"/"+totalPageCount);
                }else{
                    pagination.hide();
                }
            },
            loadUnsolicitedMessage:function(pageNo){
                if(this.ajaxRequest){
                    this.ajaxRequest.abort();
                }
                this.unsolicitedCollection.each(function(model,i){
                    model.set("viewOnMap",false);
                });
                this.unsolicitedCollection.reset();
                var view = this, postData = {
                    pageNo:pageNo,
                    pageSize:30,
                    time:this.parseSelectTime(this.model.get("unsolicitedTime"))
                }||{};
                var unsolicitedCategory = this.model.get("unsolicitedCategory");
                if(unsolicitedCategory && (unsolicitedCategory!=0)){
                    postData.categoryId = unsolicitedCategory;
                }
                this.ajaxRequest = EB_Common.Ajax.get("/universe/widget/searchRecipientappMessages",postData,function(data){
                    EB_Common.logger.log(data);
                    view.jDom.unsolicitedList.empty();
                    view.jDom.unsolicitedListContainer.show();
                    var ums = data.unsolicitedMessages;
                    view.loadPaginationForUnsolicitedMessage(ums.currentPageNo,ums.totalPageCount);
                    if(ums.totalCount==0){
                        view.jDom.unsolicitedList.append($("<li class='li_nodata'>").text(i18n["universe.widget.twitter.nodata"]));
                        return;
                    }
                    view.unsolicitedCollection.reset();
                    view.unsolicitedCollection.add(ums.data);
                },"json");
            },
            loadSolicitedMessage:function(pageNo){
                if(this.ajaxRequestForSolicited){
                    this.ajaxRequestForSolicited.abort();
                }
                this.solicitedCollection.each(function(model,i){
                    model.set("viewOnMap",false);
                });
                this.solicitedCollection.reset();
                var view = this, postData = {
                    pageNo:pageNo,
                    pageSize:30,
                    time:this.parseSelectTime(this.model.get("solicitedTime"))
                }||{};
                this.ajaxRequestForSolicited = EB_Common.Ajax.get("/universe/widget/searchSolicitedMessages",postData,function(data){
                    EB_Common.logger.log(data);
                    view.jDom.solicitedListContainer.show();
                    view.jDom.solicitedList.empty();
                    var cms = data.circumstanceMessages;
                    view.loadPaginationForSolicitedMessage(cms.currentPageNo,cms.totalPageCount);
                    if(!cms || cms.totalCount==0){
                        view.jDom.solicitedList.append($("<li class='li_nodata'>").text(i18n["universe.widget.twitter.nodata"]));
                        return;
                    }
                    view.solicitedCollection.reset();
                    view.solicitedCollection.add(cms.data);
                },"json");
            },
            events:function(){
                var events = {
                    "click div.contract":"eventClickContract",
                    "click #toSetting":"eventClickToSetting",
                    "click i.widget-remove":"eventClickRemoveWidget",
                    "click #selectedRecipiendappType>a":"eventClickTab",
                    "change #unsolicitedTime":"eventChangeUnsolicitedTime",
                    "change #unsolicitedCategoryList":"eventChangeUnsolicitedCategory",
                    "change #solicitedTime":"eventChangeSolicitedTime",
                    "click #refreshUnsolicited":"eventClickRefreshUnsolicited",
                    "click #refreshSolicited":"eventClickRefreshSolicited",
                    "click #unsolicitedViewOnMap":"eventClickUnsolicitedViewOnMap",
                    "click #solicitedViewOnMap":"eventClickSolicitedViewOnMap"
                }
                return this.dealEvents(events,this.cid);
            },
            eventClickContract:function(e){
                var j = $(e.currentTarget);
                j.find("i").toggleClass("off");
                j.parent().next().toggle();
            },
            eventClickToSetting:function(e){
                var link = $(e.target).attr("link");
                EB_Common.dialog.confirm(i18n["universe.widget.tosetting"],null,function(){
                    window.location.href=link;
                });
            },
            eventClickRemoveWidget:function(e){
                var j = $(e.target);
                j.parent().parent().parent().parent().hide();
            },
            eventClickTab:function(e){
                var j = $(e.target);
                j.addClass("mouse_out").siblings().removeClass("mouse_out");
                this.$("#"+ j.attr("field")).show().siblings().hide();
                if(j.attr("field")=="solicitedTabContainer"){
                    this.activeSolicitedMessage();
                }
            },
            eventChangeUnsolicitedTime:function(e){
                this.model.set("unsolicitedTime", e.target.value);
            },
            eventChangeUnsolicitedCategory:function(e){
                this.model.set("unsolicitedCategory", e.target.value);
            },
            eventChangeSolicitedTime:function(e){
                this.model.set("solicitedTime", e.target.value);
            },
            eventClickRefreshUnsolicited:function(e){
                this.loadUnsolicitedMessage(1);
            },
            eventClickRefreshSolicited:function(e){
                this.loadSolicitedMessage(1);
            },
            eventClickUnsolicitedViewOnMap:function(e){
                this.model.set("unsolicitedViewOnMap",!this.model.get("unsolicitedViewOnMap"));
                if(this.model.get("unsolicitedViewOnMap")){
                   // $(e.target).css("opacity","1");
                    $(e.target).addClass('icn_showoffmap_16');
                }else{
                   // $(e.target).css("opacity",".5");
                    $(e.target).removeClass('icn_showoffmap_16');
                }
                if(this.model.get("solicitedViewOnMap")){
                    this.model.set("solicitedViewOnMap",false);
                    //this.$("#solicitedViewOnMap").css("opacity",".5");
                    this.$("#feedsTweetsViewAllOnMap").removeClass('icn_showoffmap_16');
                }else{
                    this.$("#feedsTweetsViewAllOnMap").addClass('icn_showoffmap_16');
                }
            },
            eventClickSolicitedViewOnMap:function(e){
                this.model.set("solicitedViewOnMap",!this.model.get("solicitedViewOnMap"));
                if(this.model.get("solicitedViewOnMap")){
                   // $(e.target).css("opacity","1");
                    $(e.target).addClass('icn_showoffmap_16');
                }else{
                    //$(e.target).css("opacity",".5");
                    $(e.target).removeClass('icn_showoffmap_16');
                }
                if(this.model.get("unsolicitedViewOnMap")){
                    this.model.set("unsolicitedViewOnMap",false);
                    //this.$("#unsolicitedViewOnMap").css("opacity",".5");
                    this.$("#alertsTweetsViewAllOnMap").removeClass('icn_showoffmap_16');
                } else{
                    this.$("#alertsTweetsViewAllOnMap").addClass('icn_showoffmap_16');
                }
            },
            getJsonData:function(parentObj){
                return parentObj;
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.RecipientAppModel);
            var model = new Model(null,{url:options.url});
            var View = EB_Common.Backbone.View.extend(this.RecipientAppView);
            return new View({el:options.container,model:model,layers:options.layers});
        }
    };
    view.universe.widgetApps.WeatherThresholdApp={
        ThresholdModel:{
            defaults:function(){
                return {
                    viewOnMap:false,
                    polygonFeatures:[]
                }
            }
        },
        ThresholdView:{
            tagName:"li",
            ajaxRequests:{},
            jDom:{},
            template:{},
            initialize:function(){
                $.templates({weatherThresholdTemplate: $("#weatherThresholdTemplate").html()});
                this.template.weatherThresholdTemplate = $.render.weatherThresholdTemplate;
                this.model.on("change:viewOnMap",this.renderViewOnMap,this);
                this.model.on("change:polygonFeatures",this.renderPolygonFeatures,this);
                this.render();
            },
            render:function(){
                var addresses = this.model.get("addresses"),newAddresses = [];
                $.each(addresses,function(i,address){
                    var adds = [];
                    address.streetAddress && adds.push(address.streetAddress);
                    address.city && adds.push(address.city);
                    address.state && adds.push(address.state);
                    address.postalCode && adds.push(address.postalCode);
                    address.country && adds.push(address.country);
                    newAddresses.push(adds.join(","));
                });
                this.model.set("addresses",newAddresses);
                var description = this.model.get("description");
                var eventStartDateFormat = this.model.get("eventStartDateFormat");
                var splits = eventStartDateFormat.split(/\s/);
                var date = splits[0] + " " + splits[1];
                var timeZone = splits[2];
                description = description.replace("{eventStartDate}",moment(date).format("LLLL"));
                description = description.replace("{timeZone}",timeZone);
                this.model.set("description",description);
                this.$el.addClass("w-contentblock").html(this.template.weatherThresholdTemplate(this.getIdSuffixModelJSON()));
            },
            renderPolygonFeatures:function(){
                var viewOnMap = this.model.get("viewOnMap");
                var polygonFeatures = this.model.get("polygonFeatures") || [];
                var l = polygonFeatures.length;
                if(viewOnMap){
                    EB_View.universe.layers.polygonsLayer.addFeatures(polygonFeatures);
                    this.$el.addClass("highlighted_w-contentblock");
                }else{
                    if(l>0){
                        var features = polygonFeatures.slice(0);
                        EB_View.universe.layers.polygonsLayer.removeFeatures(features.reverse());
                        this.$el.removeClass("highlighted_w-contentblock");
                    }

                }
                EB_View.universe.layers.polygonsLayer.redraw();
                EB_View.universe.openlayers.tool.zoomToExtent(EB_View.universe.layers.polygonsLayer);
            },
            renderViewOnMap:function(){
                if(this.ajaxRequest){
                    this.ajaxRequest.abort();
                }
                var view=this, threshold = this.model.toJSON();
                if((this.model.get("polygonFeatures") || []).length){
                    this.model.trigger("change:polygonFeatures");
                    return;
                };
                var postData = {weatherAlertId:this.model.get("id")};
                this.ajaxRequest = EB_Common.Ajax.get("/universe/widget/fetchWeatherFeedPolygons",postData,function(data){
                    var polygons = data.geoPolygons;
                    if(polygons == null) return;
                    var searchShapes = [],l = polygons.length;
                    for(var i=0;i<l;i++){
                        searchShapes.push({
                            isInclude:true,
                            polygon:polygons[i].points
                        })
                    }
                    var polygonFeatures = EB_View.universe.openlayers.tool.analysisSearchShapes(searchShapes,EB_View.universe.config.latlon_proj,EB_View.universe.universeApp.map.getProjectionObject(),EB_View.universe.config.polyFillColorDef,EB_View.universe.config.polyFillColorExclude);
                    if(polygonFeatures.length!=0){
                        polygonFeatures[polygonFeatures.length-1].data.submit = true
                        view.model.set("polygonFeatures",polygonFeatures)
                    }
                },"json");
            },
            events:function(){
                var events = {
                    "click #operationsContainer>.weather_newnotification":"eventClickToNotification",
                    "click #operationsContainer>.viewonmap":"eventClickViewOnMap",
                    "click #weather_more":"eventClickMore",
                    "click #weather_less":"eventClickLess"
                }
                return this.dealEvents(events,this.cid);
            },
            eventClickToNotification:function(){
                EB_View.universe.messageApp.model.set({"title":this.model.get("summary")});
                EB_View.universe.messageApp.jDom.messageTitle.valid();
                EB_View.universe.universePageApp.adjustNotificationContainer();
            },
            eventClickViewOnMap:function(){
                this.model.set("viewOnMap",!this.model.get("viewOnMap"));
            },
            eventClickMore:function(e){
                var j = $(e.target);
                j.hide().next().show();
                j.parent().next().show();
            },
            eventClickLess:function(e){
                var j = $(e.target);
                j.hide().prev().show();
                j.parent().next().hide();
            }
        },
        getInstance:function(_options){
            var options = $.extend({},_options||{});
            var Model = Backbone.Model.extend(this.ThresholdModel);
            var model = null;
            if(options.model){
                model = options.model;
            }else{
                model = new Model();
            }
            var View = EB_Common.Backbone.View.extend(this.ThresholdView);
            return new View({model:model,markersLayer:options.markersLayer});
        }
    }
    view.universe.widgetApps.WeatherApp={
        WeatherAppModel:{
            defaults:function(){
                return {
                    load:false,
                    weatherTime:"1 h"
                }
            }
        },
        WeatherAppView:{
            jDom:{},
            template:{},
            initialize:function(){
                $.templates({widgetWeatherAppTemplate: $("#widgetWeatherAppTemplate").html()});
                this.template.widgetWeatherAppTemplate = $.render.widgetWeatherAppTemplate;
                this.model.on("change:weatherTime",this.renderChangeWeatherTime,this);
                this.weatherThresholdCollection = new Backbone.Collection({model:EB_View.universe.widgetApps.WeatherThresholdApp.ThresholdModel});
                this.weatherThresholdCollection.on("add",this.weatherThresholdCollectionAdd,this);
                this.render();
            },
            active:function(){
                this.$el.show();
                if(this.load) return;
                this.load = true;
                this.loadWeathers(1);
            },
            render:function(){
                this.$el.html(this.template.widgetWeatherAppTemplate(this.getIdSuffixModelJSON()));
                this.jDom.weatherListContainer=this.$("#weatherThresholdListContainer");
                this.jDom.weatherListUl=this.$("#weather_threshold_list");
                return this;
            },
            renderChangeWeatherTime:function(){
                this.loadWeathers(1);
            },
            weatherThresholdCollectionAdd:function(model){
                var view = EB_View.universe.widgetApps.WeatherThresholdApp.getInstance({model:model,layers:this.options.layers});
                this.jDom.weatherListUl.append(view.$el);
            },
            parseSelectTime:function(value){
                var values = value.split(" ");
                if(values[1]=="m"){
                    return (parseInt(values[0])*60*1000);
                }else if(values[1]=="h"){
                    return (parseInt(values[0])*3600*1000);
                }else if(values[1]=="d"){
                    return (parseInt(values[0])*24*3600*1000);
                }
                return 0;
            },
            loadPaginationForWeather:function(currentPageNo,totalPageCount){
                var view = this, pagination = this.$("#weatherPagination");
                if(totalPageCount!=0){
                    if(pagination.data("jqPagination")){
                        pagination.jqPagination("destroy");
                    }
                    pagination.show().jqPagination({
                        link_string	: 'javascript:void(0)',
                        max_page	: totalPageCount,
                        current_page: currentPageNo,
                        paged: function(page) {
                            view.loadWeathers(page);
                        }
                    });
                    pagination.children().removeClass("ui-state-disabled");
                    if(totalPageCount==1){
                        pagination.children().not(".current").addClass("ui-state-disabled");
                    }else if(currentPageNo==1){
                        pagination.children(".first,.previous").addClass("ui-state-disabled");
                    }else if(currentPageNo==totalPageCount){
                        pagination.children(".next,.last").addClass("ui-state-disabled");
                    }
                    pagination.find(".current").text(currentPageNo+"/"+totalPageCount);
                }else{
                    pagination.hide();
                }
            },
            loadWeathers : function(pageNo){
                if(this.ajaxRequest){
                    this.ajaxRequest.abort();
                }
                var view=this,postData={
                    pageNo:pageNo,
                    pageSize:30,
                    time : this.parseSelectTime(this.model.get("weatherTime"))
                } || {};
                this.ajaxRequest = EB_Common.Ajax.get("/universe/widget/searchWeatherAlerts",postData,function(data){
                    EB_Common.logger.log(data);
                    view.jDom.weatherListContainer.show();
                    view.jDom.weatherListUl.empty();
                    var cms = data.weatherAlerts;
                    view.loadPaginationForWeather(cms.currentPageNo,cms.totalPageCount);
                    if(!cms || cms.totalCount==0){
                        view.jDom.weatherListUl.append($("<li class='li_nodata'>").text(i18n["universe.widget.twitter.nodata"]));
                        return;
                    }
                    view.weatherThresholdCollection.reset();
                    view.weatherThresholdCollection.add(cms.data);
                },"json");
            },
            events:function(){
                var events = {
                    "click div.contract":"eventClickContract",
                    "click #toSetting":"eventClickToSetting",
                    "click i.widget-remove":"eventClickRemoveWidget",
                    "change #weatherTime":"eventChangeWeatherTime",
                    "click #weahterRefresh":"eventClickWeahterRefresh"
                }
                return this.dealEvents(events,this.cid);
            },
            eventClickContract:function(e){
                var j = $(e.currentTarget);
                j.find("i").toggleClass("off");
                j.parent().next().toggle();
            },
            eventClickToSetting:function(e){
                var link = $(e.target).attr("link");
                EB_Common.dialog.confirm(i18n["universe.widget.tosetting"],null,function(){
                    window.location.href=link;
                });
            },
            eventClickRemoveWidget:function(e){
                var j = $(e.target);
                j.parent().parent().parent().parent().hide();
            },
            eventChangeWeatherTime:function(e){
                this.model.set("weatherTime", e.target.value);
            },
            eventClickWeahterRefresh:function(e){
                this.loadWeathers(1);
            },
            getJsonData:function(parentObj){
                return parentObj;
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.WeatherAppModel);
            var model = new Model();
            var View = EB_Common.Backbone.View.extend(this.WeatherAppView);
            return new View({el:options.container,model:model});
        }
    };

    view.universe.widgetApps.NetworkEffectMessageApp={
        NetworkEffectMessageModel:{
            defaults:function(){
                return {
                    viewOnMap:false,
                    polygonFeatures:[]
                }
            }
        },
        NetworkEffectMessageView:{
            tagName:"li",
            jDom:{},
            template:{},
            initialize:function(){
                $.templates({networkEffectMessageTemplate: $("#networkEffectMessageTemplate").html()});
                this.template.networkEffectMessageTemplate = $.render.networkEffectMessageTemplate;
                this.model.on("change:viewOnMap",this.renderViewOnMap,this);
                this.model.on("change:polygonFeatures",this.renderPolygonFeatures,this);
                this.render();
            },
            render:function(){
                var affectedAreas = this.model.get("affectedAreas") || [];
                if(affectedAreas.length){
                    this.model.set("isGeo",true);
                }
                var body = this.model.get("body") || "";
                if(body.length < 140){
                    this.model.set("hideMore",true);
                }
                this.model.set("random",Math.random());
                this.$el.html(this.template.networkEffectMessageTemplate(this.getIdSuffixModelJSON()));
            },
            renderPolygonFeatures:function(){
                var map = EB_View.universe.layers.filteredPointsAndNetworkPolygonsLayer.map;
                var len = map.popups.length;
                for(var i=0;i<len;i++) {
                    map.popups[i].hide();
                }
                var viewOnMap = this.model.get("viewOnMap");
                var polygonFeatures = this.model.get("polygonFeatures") || [];
                if(viewOnMap){
                    this.$(">div").addClass("highlighted_w-contentblock");
                    EB_View.universe.layers.filteredPointsAndNetworkPolygonsLayer.addFeatures(polygonFeatures);
                    map.raiseLayer(EB_View.universe.layers.filteredPointsAndNetworkPolygonsLayer,map.layers.length);
                    map.resetLayersZIndex();
                }else{
                    this.$(">div").removeClass("highlighted_w-contentblock");
                    EB_View.universe.openlayers.tool.removeFeaturesPopup(polygonFeatures || [],map);
                    EB_View.universe.layers.filteredPointsAndNetworkPolygonsLayer.removeFeatures(polygonFeatures);
                }
                EB_View.universe.layers.filteredPointsAndNetworkPolygonsLayer.redraw();
                EB_View.universe.openlayers.tool.zoomToExtent(EB_View.universe.layers.filteredPointsAndNetworkPolygonsLayer);
            },
            renderViewOnMap:function(){
                var view=this, affectedAreas = this.model.get("affectedAreas") || [];
                if(this.model.get("polygonFeatures")){
                    this.renderPolygonFeatures();
                    return;
                }
                if(affectedAreas.length){
                    var searchShapes = [];
                    $.each(affectedAreas,function(i,area){
                        searchShapes.push({
                            isInclude:true,
                            polygon:area.points
                        });
                    });
                    var polygonFeatures = EB_View.universe.openlayers.tool.analysisSearchShapes(searchShapes,EB_View.universe.config.latlon_proj,EB_View.universe.universeApp.map.getProjectionObject(),EB_View.universe.config.polyFillColorDef,EB_View.universe.config.polyFillColorExclude);
                    if(polygonFeatures && polygonFeatures.length){
                        $.each(polygonFeatures,function(i,feature){
                            var infoDom = view.$("#messageDetail").clone();
                            infoDom.children().eq(2).children(":gt(0)").remove();
                            feature.data.polygonInfo = infoDom.html();
                        });
                        this.model.set("polygonFeatures",polygonFeatures);
                    }
                }
            },
            events:function(){
                var events = {
                    "click #viewOnMap":"eventClickViewOnMap",
                    "click #more":"eventClickMore",
                    "click #less":"eventClickLess"
                }
                return this.dealEvents(events,this.cid);
            },
            eventClickToNotification:function(){
                EB_View.universe.messageApp.model.set({"title":this.model.get("summary")});
                EB_View.universe.messageApp.jDom.messageTitle.valid();
                EB_View.universe.universePageApp.adjustNotificationContainer();
            },
            eventClickViewOnMap:function(){
                this.model.set("viewOnMap",!this.model.get("viewOnMap"));
            },
            eventClickMore:function(e){
                $(e.target).hide();
                this.$("#lessText").hide();
                this.$("#moreText").show();
                this.$("#less").show();
            },
            eventClickLess:function(e){
                $(e.target).hide();
                this.$("#lessText").show();
                this.$("#moreText").hide();
                this.$("#more").show();
            }
        },
        getInstance:function(_options){
            var options = $.extend({},_options||{});
            var Model = Backbone.Model.extend(this.NetworkEffectMessageModel);
            var model = null;
            if(options.model){
                model = options.model;
            }else{
                model = new Model();
            }
            var View = EB_Common.Backbone.View.extend(this.NetworkEffectMessageView);
            return new View({model:model,markersLayer:options.markersLayer});
        }
    }

    view.universe.widgetApps.NetworkApp={
        NetworkAppModel:{
            defaults:function(){
                return {
                    load:false,
                    organizationIds:[],
                    geoTargetOnly:false,
                    networkTime:"1 h",
                    networkEffectCategories:[],
                    organizations:[]
                }
            },
            initialize:function(){
                if(arguments && arguments.length>1 && arguments[1].url){
                    this.urlRoot = arguments[1].url
                }
            },
            parse:function(response){
                var model = {load:true} || {};
                model.networkEffectCategories = response.networkEffectCategories || [];
                return model;
            }

        },
        NetworkAppView:{
            jDom:{},
            template:{},
            initialize:function(){
                $.templates({
                    widgetNetworkAppTemplate: $("#widgetNetworkAppTemplate").html(),
                    networkEffectSettingOrganizationTemplate: $("#networkEffectSettingOrganizationTemplate").html()
                });
                this.template.widgetNetworkAppTemplate = $.render.widgetNetworkAppTemplate;
                this.template.networkEffectSettingOrganizationTemplate = $.render.networkEffectSettingOrganizationTemplate;
                this.model.on("change:load",this.render,this);
                this.model.on("change:organizationIds",this.renderOrganizationIds,this);
                this.model.on("change:networkTime",this.renderListNetworkSettings,this);
                this.model.on("change:categoryId",this.renderListNetworkSettings,this);
                this.networkEffectMessageCollection = new Backbone.Collection({model:EB_View.universe.widgetApps.NetworkEffectMessageApp.NetworkEffectMessageModel});
                this.networkEffectMessageCollection.on("add",this.networkEffectMessageCollectionAdd,this);
            },
            active:function(){
                this.$el.show();
                if(this.load) return;
                if(this.model.urlRoot){
                    this.model.fetch();
                }else{
                    this.render();
                }
                this.load = true;
            },
            render:function(){
                this.$el.html(this.template.widgetNetworkAppTemplate(this.getIdSuffixModelJSON()));
                this.jDom.networkEffectSettingOrganizationContainer=this.$("#networkEffectSettingOrganizationContainer");
                this.jDom.networkEffectMessageListContainer=this.$("#networkEffectMessageListContainer");
                this.jDom.networkEffectMessageList=this.$("#networkEffectMessageList");
                this.renderListNetworkSettings(true);
                return this;
            },
            renderOrganizationIds:function(){
                var  organizationIds = this.model.get("organizationIds")||[];
                if(organizationIds.length){
                    this.$("#update").addClass("orange").removeClass("gray").prop("disabled",false);
                }else{
                    this.$("#update").addClass("gray").removeClass("orange").prop("disabled",true);
                }
            },
            renderListNetworkSettings:function(islistMessages){
                if(this.ajaxRequestSettings){
                    this.ajaxRequestSettings.abort();
                }
                var view = this,time = this.model.get("networkTime"),categoryId = this.model.get("categoryId"),categoryNames = [];
                if(!categoryId){
                    $.each(this.model.get("networkEffectCategories")||[],function(i,category){
                        categoryNames.push(category.name);
                    });
                }else{
                    $.each(this.model.get("networkEffectCategories")||[],function(i,category){
                        if(categoryId == category.id){
                            categoryNames.push(category.name);
                        }
                    });
                }
                this.ajaxRequestSettings = EB_Common.Ajax.post("/universe/widget/listNetworkEffectSettings",{lastHours:this.parseSelectTime(time),categoryNames:categoryNames},function(data){
                    var networkEffectSettings = data.ebNetworkEffectSettings || [];
                    view.jDom.networkEffectSettingOrganizationContainer.html(view.template.networkEffectSettingOrganizationTemplate(networkEffectSettings));
                    if(islistMessages===true){
                        view.$("#checkAllOrganizations").prop("checked",true).trigger("change");
                        view.eventChangeOrganization();
                        view.loadNetworkEffectMessages(1);
                    }else{
                        view.$("#checkAllOrganizations").prop("checked",false).trigger("change");
                    }
                },"json");

            },
            networkEffectMessageCollectionAdd:function(model){
                var view = EB_View.universe.widgetApps.NetworkEffectMessageApp.getInstance({model:model,layers:this.options.layers});
                this.jDom.networkEffectMessageList.append(view.$el);
            },
            parseSelectTime:function(value){
                var values = value.split(" ");
                if(values[1]=="h"){
                    return (parseInt(values[0]));
                }else if(values[1]=="d"){
                    return (parseInt(values[0])*24);
                }
                return 0;
            },
            loadPaginationForMessages:function(currentPageNo,totalPageCount){
                var view = this, pagination = this.$("#networkEffectMessagePagination");
                if(totalPageCount!=0){
                    if(pagination.data("jqPagination")){
                        pagination.jqPagination("destroy");
                    }
                    pagination.show().jqPagination({
                        link_string	: 'javascript:void(0)',
                        max_page	: totalPageCount,
                        current_page: currentPageNo,
                        paged: function(page) {
                            view.loadNetworkEffectMessages(page);
                        }
                    });
                    pagination.children().removeClass("ui-state-disabled");
                    if(totalPageCount==1){
                        pagination.children().not(".current").addClass("ui-state-disabled");
                    }else if(currentPageNo==1){
                        pagination.children(".first,.previous").addClass("ui-state-disabled");
                    }else if(currentPageNo==totalPageCount){
                        pagination.children(".next,.last").addClass("ui-state-disabled");
                    }
                    pagination.find(".current").text(currentPageNo+"/"+totalPageCount);
                }else{
                    pagination.hide();
                }
            },
            loadNetworkEffectMessages : function(pageNo){
                if(this.ajaxRequest){
                    this.ajaxRequest.abort();
                }
                var view=this,postData={
                    pageNo:pageNo,
                    pageSize:30,
                    geoTargetOnly:this.model.get("geoTargetOnly"),
                    lastHours : this.parseSelectTime(this.model.get("networkTime")),
                    organizationIds:this.model.get("organizationIds")||[]
                } || {};
                this.ajaxRequest = EB_Common.Ajax.post("/universe/widget/searchNetworkEffectMessages",postData,function(dataPage){
                    if(dataPage && (dataPage.success===false)){
                        EB_Common.dialog.alert("Server Error!");
                    }
                    view.jDom.networkEffectMessageListContainer.show();
                    view.jDom.networkEffectMessageList.empty();

                    if(!dataPage || dataPage.totalCount==0){
                        dataPage = {data:[],currentPageNo:1,totalPageCount:0};
                        view.jDom.networkEffectMessageList.append($("<li class='li_nodata'>").text(i18n["universe.widget.twitter.nodata"]));
                    }
                    view.loadPaginationForMessages(dataPage.currentPageNo,dataPage.totalPageCount);
                    view.networkEffectMessageCollection.each(function(model,i){
                        model.set("viewOnMap",false);
                    })
                    view.networkEffectMessageCollection.reset();
                    view.networkEffectMessageCollection.add(dataPage.data);
                },"json");
            },
            events:function(){
                var events = {
                    "click div.contract":"eventClickContract",
                    "click #toSetting":"eventClickToSetting",
                    "click i.widget-remove":"eventClickRemoveWidget",
                    "change #networkTime":"eventChangeNetworkTime",
                    "click #subView":"eventClickSubView",
                    "change #subscriptionsCategory":"eventChangeSubscriptionsCategory",
                    "change #checkAllOrganizations":"eventChangeCheckAllOrganization",
                    "change input[name=organizationCheckbox]":"eventChangeOrganization",
                    "change #geoOnly":"eventChangeGeoOnly",
                    "click #update":"eventClickUpdate"
                }
                return this.dealEvents(events,this.cid);
            },
            eventClickContract:function(e){
                var j = $(e.currentTarget);
                j.find("i").toggleClass("off");
                j.parent().next().toggle();
            },
            eventClickToSetting:function(e){
                var link = $(e.target).attr("link");
                EB_Common.dialog.confirm(i18n["universe.widget.tosetting"],null,function(){
                    window.location.href=link;
                });
            },
            eventClickRemoveWidget:function(e){
                var j = $(e.target);
                j.parent().parent().parent().parent().hide();
            },
            eventChangeSubscriptionsCategory:function(e){
                var id = e.target.value;
                this.model.set("categoryId",id);
                this.$("#checkAllOrganizations").prop("checked",false);
            },
            eventChangeCheckAllOrganization:function(e){
                this.$("input[name=organizationCheckbox]").prop("checked", e.target.checked);
                this.eventChangeOrganization();
            },
            eventChangeOrganization:function(){
                var organizationIds = [];
                this.$("input[name=organizationCheckbox]").each(function(){
                    this.checked && organizationIds.push(this.value);
                    if(this.checked){
                        $(this).parent().parent().addClass("tr_checkedselect_bg");
                    }else{
                        $(this).parent().parent().removeClass("tr_checkedselect_bg");
                    }
                });
                this.model.set("organizationIds",organizationIds);
            },
            eventChangeNetworkTime:function(e){
                this.model.set("networkTime", e.target.value);
            },
            eventChangeGeoOnly:function(e){
                this.model.set("geoTargetOnly", e.target.checked);
            },
            eventClickSubView:function(e){
                var j = $(e.target);
                j.toggleClass("hideshow-showing").toggleClass("hideshow-hidden");
                this.$("#subscriptionContainer").toggle();
            },
            eventClickUpdate:function(e){
                this.loadNetworkEffectMessages(1);
            },
            getJsonData:function(parentObj){
                return parentObj;
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.NetworkAppModel);
            var model = new Model(null,{url:options.url});
            var View = EB_Common.Backbone.View.extend(this.NetworkAppView);
            return new View({el:options.container,model:model});
        }
    };
})(EB_View);