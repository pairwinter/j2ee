(function(view) {
    view.notifications = {
        refreshBroadcastData:function(){
            $('body').everyTime('30s', 'refreshBroadcastData',function() {
                EB_View.notifications.refreshCounter();
                if($.isFunction(EB_View.notifications.reloadGrid)){
                    EB_View.notifications.reloadGrid("active_gridTable");
                }
            });
        }
    };

    view.notifications.initializeTabs = function(hrefParent, tabContainer) {
        $('#' + hrefParent + ' a').click(function(e) {
            e.preventDefault();
            try{
                $("#sendfollowup").dialog("destory");
                $("#sendfollowup").remove();
            }catch(e){}
            var href = $(this).attr('href');
            $('#' + hrefParent + ' a').removeClass('mouse_out');
            $(this).addClass('mouse_out');
            EB_Common.Ajax.load($('#' + tabContainer).empty(), href);

            var roboHelpIndex = 2,
                tabId = $(this).attr("id");
            tabId = tabId.substring(tabId.length - 1 ,tabId.length);
            switch(parseInt(tabId)){
                case 1 :
                    roboHelpIndex =2;
                    break;
                case 2 :
                    roboHelpIndex =5;
                    break;
                case 3 :
                    roboHelpIndex =3;
                    break;
                case 4 :
                    roboHelpIndex =4;
                    break;
            }
            $("#help_AN1").attr("roboHelpIndex",roboHelpIndex );
        });
        $(location.hash || ("#" + $('#' + hrefParent + ' a:first-child').attr("id"))).click();
        
        //sound preview
        $('.sound_preview').click(function(e){
            e.preventDefault();
            var el = $(this),
                title = el.parent().prev().text(),
                path = el.attr('sourceUrl');
            title = title.substring(0,title.indexOf('('));
            var audioPlay = $('#audioPlay');
                if(audioPlay.length == 0){
                    audioPlay = $('<div id="audioPlay"/>').appendTo(document.body);
                    audioPlay.dialog({
                        title : title,
                        autoOpen: false,
                        minWidth : 440,
                        minHeight : 130,
                        resizable : false,
                        modal : true,
                        zIndex : 2300,
                        create: function(event, ui){
                            $('#audioPlay').parent().css('overflow', 'visible');
                        },
                        close: function() {
                             $('#eb_audio').remove();
                             $(this).dialog('close');
                        }
                    });
                }
                audioPlay.append('<div id="eb_audio" />');
                EB_Common.audio.play({
                    path : path,
                    container : '#eb_audio'
                });
                audioPlay.dialog('open');
        });
    };

    view.notifications.listenTabs = function() {
        EB_View.notifications.initializeTabs("main_tabs", "tab_container");

        $("#a_inprogress").click(function() {
            loadHistoryNotifications("Inprogress");
        });
        $("#a_lastweek").click(function() {
            loadHistoryNotifications("LastWeek");
        });
        $("#a_lastmonth").click(function() {
            loadHistoryNotifications("LastMonth");
        });
    };

    view.notifications.listenSearch = function(gridId) {
        $(".gbqfb").click(function() {
            _reloadGrid(gridId);
        });
        $("#search").keydown(function(event) {
            if (event.which == 13) {
                event.preventDefault();
                _reloadGrid(gridId);
            }
        })
    }

    view.notifications.refreshCounter = function() {
        EB_Common.Ajax.get(EB_Common.Ajax.wrapperUrl("/notifications/status"), {
            t : Math.random()
        }, function(data) {
            $("#inprogress").html(data.inprogress);
            $("#lastweek").html(data.lastweek);
            $("#lastmonth").html(data.lastmonth);
        }, "json");
    }

    view.notifications.reloadGrid = function(gridId) {
        _reloadGrid(gridId);
    }

    view.notifications.onServerSuccess = function(data, index, btnId, refreshCounter) {
        if (data.success) {
            if (refreshCounter) {
                view.notifications.refreshCounter();
            }
            window.location = EB_Common.Ajax.wrapperUrl("/") + "notifications#ui-tabs-" + index;
        } else {
            $("#" + btnId).show();
            $("#cancel").show();
            if(data.message=="10000"){
                EB_Common.dialog.alert("upload error,please try again later.");
            }else{
                if(i18n[data.message]){
                    EB_Common.dialog.alert(i18n[data.message]);
                }else{
                    EB_Common.dialog.alert(data.message);
                }
            }

        }
    }

    function _reloadGrid(gridId) {
        $("#" + gridId).jqGrid('setGridParam', {
            postData : {
                messageTitle : $("#search").val()
            }
        }).trigger("reloadGrid");
    }

    function loadHistoryNotifications(status) {
        $('#main_tabs a').removeClass('mouse_out');
        $("#ui-tabs-1").addClass('mouse_out');
        EB_Common.Ajax.load($("#tab_container").empty(), '/histories/' + status);
    }
})(EB_View);
