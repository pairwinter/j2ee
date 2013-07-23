(function(view) {
    view.settings = {};
    view.settings.menu = {};
    view.settings.menu.initPage = function(isTwitter, isWeather) {
        var pMenu = view.settings.menu.loadMenu(isTwitter, isWeather);
        //pMenu.setCurrentMenu('level1_1', 'level1_1_1', EB_Common.Ajax.wrapperUrl('/settings/organization/baseInfo/'));
        //view.settings.menu.setTableHighlight();
    };

    view.settings.menu.loadMenu = function(isTwitter, isWeather) {
        var menuData = [];
        if(EB_Common.Security.protect('ORGANIZATION_SETTING_setting')){
	        menuData.push({
	            id: 'level1_1',
	            text: i18n['setting.menu.org'],
	            children: [{
	                    id: 'level1_1_1',
	                    text: i18n['setting.menu.org.baseInfo'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/organization/baseInfo/')
	                }, {
	                    id: 'level1_1_2',
	                    text: i18n['setting.menu.org.loginMsg'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/organization/loginMsg/')
	                }]
	        });
        }
        if(EB_Common.Security.protect('GIS_setting')){
	        menuData.push({
	            id: 'level1_2',
	            text: i18n['setting.menu.gis'],
	            children: [{
	                    id: 'level1_2_1',
	                    text: i18n['setting.menu.gis.default'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/gis/default/')
	                }, {
	                    id: 'level1_2_2',
	                    text: i18n['setting.menu.gis.shape'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/gis/region/'),
                        leavePageRegion: 'gisRegionForm'
	                }, {
	                    id: 'level1_2_3',
	                    text: i18n['setting.menu.gis.layer'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/gis/layer/'),
	                    leavePageRegion: 'layerForm'
	                }]
	        });
        }

        if(EB_Common.Security.protect('IV_setting')){
	        var childrenMenu = [];
	        if(EB_Common.Security.protect('WEATHER_showWeatherWidget')){
		        childrenMenu.push({
		            id: 'level1_3_1',
		            text: i18n['setting.menu.iv.weather'],
		            url: EB_Common.Ajax.wrapperUrl('/settings/iv/weatherThreshold'),
		            minWidth: 900,
                    ignoreInput: 'input[colindex]'
		        });
	        }
	        if(EB_Common.Security.protect('TWITTER_showTwitterWidget')){
		        childrenMenu.push({
		            id: 'level1_3_2',
		            text: i18n['setting.menu.iv.twitter'],
		            url: EB_Common.Ajax.wrapperUrl('/settings/iv/twitterThreshold'), //twitterThreshold/0
		            minWidth: 900
		        });
	        }
	        if(EB_Common.Security.protect('MEMBER_APP_showMemberApp')){
		        childrenMenu.push({
		            id: 'level1_3_4',
		            text: i18n['setting.menu.iv.recipient'],
		            url: EB_Common.Ajax.wrapperUrl('/settings/iv/recipientAppThreshold')
		        });
	        }
	        if(childrenMenu.length>0){
                menuData.push({
                    id: 'level1_3',
                    text: i18n['setting.menu.iv'],
                    children: childrenMenu
                });
            }
        }
        
        //Everbridge Network - Participant Settings
        var publish = ['NETWORK_EFFECT_showNetworkEffect','ALERT_US','TEMPLATE_send_ipaws','GENERIC_ONE_WAY'];
        var childrenMenu = [];
        if(EB_Common.Security.protect('NETWORK_EFFECT_showNetworkEffect')){
        	childrenMenu.push({
                id: 'level1_8_1',
                text: i18n['notification.field.pulishMessage.network'],
                children : [{
                    id: 'level1_8_1_1',
                    text: i18n['setting.publish.network.item1'],
                    url: EB_Common.Ajax.wrapperUrl('/settings/network/orgIdentity')
                }, {
                    id: 'level1_8_1_2',
                    text: i18n['setting.publish.network.item2'],
                    url: EB_Common.Ajax.wrapperUrl('/settings/network/subscribe')
                }]
            });
        }
        
        if(EB_Common.Security.protect('TEMPLATE_send_ipaws')){
        	childrenMenu.push({
                id: 'level1_8_2',
                text: i18n['notification.field.pulishMessage.ipaws'],
                children : [{
                    id: 'level1_8_2_1',
                    text: i18n['setting.publish.cmas_wea.item1'],
                    url: EB_Common.Ajax.wrapperUrl('/settings/network/ipaws/')
                }, {
                    id: 'level1_8_2_2',
                    text: i18n['setting.publish.cmas_wea.item2'],
                    url: EB_Common.Ajax.wrapperUrl('/settings/network/samecodes'),
                    ignoreInput: 'input[name="isDefault"]'
                },{
                    id: 'level1_8_2_3',
                    text: i18n['setting.publish.cmas_wea.item3'],
                    url: EB_Common.Ajax.wrapperUrl('/settings/network/senderagencyname'),
                    ignoreInput: 'input[name="isDefault"]'
                }, {
                    id: 'level1_8_2_4',
                    text: i18n['setting.publish.cmas_wea.item4'],
                    url: EB_Common.Ajax.wrapperUrl('/settings/network/cmasfields')
                }]
            });
        }
        
        if(EB_Common.Security.protect('ALERT_US')){
        	childrenMenu.push({
                id: 'level1_8_3',
                text: i18n['notification.field.pulishMessage.alertUs'],
                url: EB_Common.Ajax.wrapperUrl('/settings/network/alertus')
            });
        }
        if(EB_Common.Security.protect('GENERIC_ONE_WAY')){
        	childrenMenu.push({
                id: 'level1_8_4',
                text: i18n['notification.field.pulishMessage.generic'],
                url: EB_Common.Ajax.wrapperUrl('/settings/network/generic')
            });
        }
        if(EB_Common.Security.protect(publish)){
	        menuData.push({
	            id: 'level1_8',
	            text: i18n['global.feature.category.publish.option'],
	            children: childrenMenu
	        });
        }
        
        if(EB_Common.Security.protect('BROADCAST_SETTING_setting')){
	        menuData.push({
	            id: 'level1_4',
	            text: i18n['setting.menu.broadcast'],
	            children: [{
	                    id: 'level1_4_1',
	                    text: i18n['setting.menu.broadcast.default'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/broadcast/default/')
	                }, {
	                    id: 'level1_4_2',
	                    text: i18n['setting.menu.broadcast.sender'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/broadcast/senderInfo/')
	                }, {
	                    id: 'level1_4_3',
	                    text: i18n['setting.menu.broadcast.delivery'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/broadcast/deliveryMethods/')
	                }, {
	                    id: 'level1_4_4',
	                    text: i18n['setting.menu.broadcast.throttling'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/broadcast/throttling/')
	                }, {
	                    id: 'level1_4_5',
	                    text: i18n['setting.menu.broadcast.greetings'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/broadcast/greetingLib/')
	                }, {
	                    id: 'level1_4_6',
	                    text: i18n['setting.menu.broadcast.conference'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/broadcast/conferenceBridge/')
	                }, {
	                    id: 'level1_4_7',
	                    text: i18n['setting.menu.broadcast.email'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/broadcast/emailTemplate/')
	                }]
	        });
        }
        
        if(EB_Common.Security.protect('CONTACT_GROUP_setting')){
	        menuData.push({
	            id: 'level1_5',
	            text: i18n['setting.menu.contact'],
	            children: [{
	                    id: 'level1_5_1',
	                    text: i18n['setting.menu.contact.record'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/contact/recordType/')
	                }, {
	                    id: 'level1_5_2',
	                    text: i18n['setting.menu.contact.custom'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/contact/customField/')
	                }, {
	                    id: 'level1_5_3',
	                    text: i18n['setting.menu.contact.subscription'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/contact/subscription')
	                }, {
	                    id: 'level1_5_4',
	                    text: i18n['setting.menu.contact.secure'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/contact/secureFtp/'),
	                    leavePage: false
	                }]
	
	        });
        }
        
        if(EB_Common.Security.protect('MEMBER_PORTAL_setting')){
	        menuData.push({
	            id: 'level1_7',
	            text: i18n['setting.menu.ssp'],
	            children: [
	                {
	                    id: 'level7_1',
	                    text: i18n['setting.menu.ssp.options'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/sspconfig/sspOptions')
	                }, {
	                    id: 'level7_2',
	                    text: i18n['setting.menu.ssp.profile'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/sspconfig/userProfileSetting')
	                }, {
	                    id: 'level7_3',
	                    text: i18n['setting.menu.ssp.subscriptions'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/sspconfig/subScriptions')
	                }, {
	                    id: 'level7_4',
	                    text: i18n['setting.menu.ssp.custom'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/sspconfig/customerFields')
	                }, {
	                    id: 'level7_5',
	                    text: i18n['setting.menu.ssp.location'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/sspconfig/location')
	                }, {
	                    id: 'level7_6',
	                    text: i18n['setting.menu.ssp.path'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/sspconfig/contactPath')
	                }, {
	                    id: 'level7_7',
	                    text: i18n['setting.menu.ssp.banner'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/sspconfig/banner')
	                }, {
	                    id: 'level7_8',
	                    text: i18n['setting.menu.ssp.home'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/sspconfig/homePage')
	                }, {
	                    id: 'level7_9',
	                    text: i18n['setting.menu.ssp.faq'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/sspconfig/faq')
	                }, {
	                    id: 'level7_10',
	                    text: i18n['setting.menu.ssp.overview'],
	                    url: EB_Common.Ajax.wrapperUrl('/settings/sspconfig/overView')
	                }]
	        });
        }

        var nodeId = document.location.hash;
        if(nodeId){
            nodeId = nodeId.substring(1);
        }
        $('#menuCt').treepanel({
            nodesData: menuData,
            activeNode : nodeId,
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
                    var leavePageRegion = node.attributes.leavePageRegion || 'contentPanel';
                    var ignoreInput = node.attributes.ignoreInput;
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
                                EB_Common.LeavePage.addListener({
                                    container: leavePageRegion,
                                    ignore: ignoreInput
                                });
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

    view.settings.menu.setTableHighlight = function() {
        $('.b-grid-single-table tbody tr').live('mouseover', function() {
            $(this).addClass('highlight');
        }).live('mouseout', function() {
            $(this).removeClass('highlight');
        }).live('click', function() {
            $(this).parent().children('tr').removeClass('selected');
            $(this).addClass('selected');
        });
    };

    //$("#level1_3_3").remove();
})(EB_View);