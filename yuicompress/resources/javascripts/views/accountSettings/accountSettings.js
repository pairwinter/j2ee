(function(view) {
    view.accountSettings = {};
    view.accountSettings.menu = {};
    view.accountSettings.menu.initPage = function() {
        view.accountSettings.menu.loadMenu();
        view.accountSettings.menu.setTableHighlight();
    };

    view.accountSettings.menu.loadMenu = function() {
        var menuData = [];
        
        menuData.push({
            id: 'level1_4',
            text: i18n['setting.menu.broadcast'],
            children: [{
                    id: 'level1_4_1',
                    text: i18n['setting.menu.broadcast.default'],
                    url: EB_Common.Ajax.wrapperUrl('/account/settings/broadcast/default/')
                }, {
                    id: 'level1_4_2',
                    text: i18n['setting.menu.broadcast.sender'],
                    url: EB_Common.Ajax.wrapperUrl('/account/settings/broadcast/senderInfo/')
                }, {
                    id: 'level1_4_3',
                    text: i18n['setting.menu.broadcast.delivery'],
                    url: EB_Common.Ajax.wrapperUrl('/account/settings/broadcast/deliveryMethods/')
                }, {
                    id: 'level1_4_4',
                    text: i18n['setting.menu.broadcast.throttling'],
                    url: EB_Common.Ajax.wrapperUrl('/account/settings/broadcast/throttling/')
                }/*, {
                    id: 'level1_4_5',
                    text: i18n['setting.menu.broadcast.greetings'],
                    url: EB_Common.Ajax.wrapperUrl('/account/settings/broadcast/greetingLib/')
                }, {
                    id: 'level1_4_6',
                    text: i18n['setting.menu.broadcast.conference'],
                    url: EB_Common.Ajax.wrapperUrl('/account/settings/broadcast/conferenceBridge/')
                }, {
                    id: 'level1_4_7',
                    text: i18n['setting.menu.broadcast.email'],
                    url: EB_Common.Ajax.wrapperUrl('/account/settings/broadcast/emailTemplate/')
                }*/]
        });
        menuData.push({
            id: 'level1_5',
            text: i18n['global.menu.contacts'],
            children: [{
                    id: 'level1_5_4',
                    text: i18n['setting.menu.contact.secure'],
                    url: EB_Common.Ajax.wrapperUrl('/account/settings/contact/secureFtp/')
                }]

        });
        
        
        $('#menuCt').treepanel({
            nodesData: menuData,
            //activeNode : 'level1_4_1',
            clicknode: function(event, tree, node){
                var leaf = node.leaf;
                var adjustContainerHeight = function() {
                    var menuHeight = tree.treePanel.height();
                    if (menuHeight < 450) {
                        menuHeight = 450;
                    }
                    $('#contentPanel').css({
                        minHeight: menuHeight - 30
                    });
                };
                if(!leaf){
                    $('#menuArrows').hide();
                    adjustContainerHeight();
                    return;
                }
                
                var fn = function(){
                    var url = node.attributes.url;
                    if(!url){
                        return;
                    }
                    var top = $('#' + node.id).position().top + 8;
                    $('#menuArrows').css({top: top}).show();

                    var minWidth = node.attributes.minWidth;
                    var leavePage = node.attributes.leavePage;
                    $.ajax({
                        url: url,
                        success: function(r, s) {
                            var container = $('#contentPanel');
                            container.html(r);
                            if (minWidth && typeof minWidth == 'number') {
                                container.css('min-width', minWidth);
                            }
                            adjustContainerHeight();
                        },
                        complete: function(r, s) {
                            if (leavePage !== false) {
                                EB_Common.LeavePage.addListener({container:'contentPanel'});
                            }
                        }
                    });
                };
                
                if (EB_Common.LeavePage.changeState()) {
                    EB_Common.dialog.leavePage(function() {
                        EB_Common.LeavePage.removeListener();
                        //when leave page, destroy unify all dialog.
                        EB_Common.dialog.destroyAll();
                        fn.call(null);
                    });
                } else {
                    EB_Common.LeavePage.removeListener();
                    //destroy unify all dialog.
                    EB_Common.dialog.destroyAll();
                    fn.call(null);
                }
            }
        });
    };

    view.accountSettings.menu.setTableHighlight = function() {
        $('.b-grid-single-table tbody tr').live('mouseover', function() {
            $(this).addClass('highlight');
        }).live('mouseout', function() {
            $(this).removeClass('highlight');
        }).live('click', function() {
            $(this).parent().children('tr').removeClass('selected');
            $(this).addClass('selected');
        });
    };

})(EB_View);