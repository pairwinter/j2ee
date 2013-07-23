(function(view) {
    view.launchPolicy = function() {

    };
    view.launchPolicy.initialize = function() {
        $("#launch_policy_gridTable")
                .jqGrid(
                        {
                            autoencode:true,
                            url : EB_Common.Ajax.wrapperUrl("/launchPolicies/list"),
                            datatype : "json",
                            mtype : 'GET',
                            emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                            gridGetLength : true,
                            jsonReader : {
                                root : "data",
                                page : "currentPageNo",
                                total : "totalPageCount",
                                records : "totalCount",
                                repeatitems : false
                            },
                            height : "auto",
                            title:false,
                            autowidth : true,
                            colNames : [ '', '',
                                    i18n['schedule.field.messagetitle'],
                                    i18n['schedule.field.eventname'],
                                    i18n['schedule.field.type'],
//                                    i18n['broadcasttemplate.field.category'],
                                    i18n['schedule.field.createdate'],
                                    i18n['schedule.field.createby'],
                                    i18n['schedule.field.scheduledate'] ],

                            colModel : [
                                    {
                                        width : 10,
                                        colGetLength : false
                                    },
                                    {
                                        hidden : false,
                                        name : 'id',
                                        colGetLength : false,
                                        index : 'id',
                                        width : 80,
                                        align : "center",
                                        sortable : false,
                                        formatter : function(value, rec, row) {
                                            return '<a href="javascript:void(' + row.id
                                                    + ')" class="icn_edit_16 bc_edit_btn" title="'
                                                    + i18n['button.update'] + '"></a><a href="javascript:void('
                                                    + row.id + ')" class="icn_trash_16 bc_del_btn" title="'
                                                    + i18n['button.delete'] + '"> </a>';
                                        }
                                    },
                                    {
                                        name : 'notification.message.title',
                                        index : 'notification.message.title',
                                        colGetLength : false,
                                        width : 120,
                                        formatter : function(value, rec, row) {
                                            if(row.notification && row.notification.message){
                                                return ((row.notification.priority == 'Priority') ? '<i class="icn_priority_hover_16"></i>' : '')+$.jgrid.htmlEncode(value);
                                            }
                                            return '';
                                        }
                                    },
                                    {
                                        name : 'notification.event.name',
                                        index : 'notification.event.name',
                                        width : 120,
                                        sortable : true
                                    },
                                    {
                                        name : 'type',
                                        index : 'type',
                                        width : 125,
                                        sorttype : "string"
                                    },
//                                    {
//                                        name : 'category.name',
//                                        index : 'category.name',
//                                        sortable : true
//                                    },
                                    {
                                        name : 'createdDate',
                                        index : 'createdDate',
                                        width : 125,
                                        sortable : true,
                                        sorttype : "datetime"
                                    },
                                    {
                                        name : 'createdName',
                                        index : 'createdName',
                                        width : 125,
                                        sorttype : "string"
                                    },
                                    {
                                        name : 'launchSetting',
                                        index : 'launchSetting',
                                        colGetLength : false,
                                        width : 125,
                                        sortable : false,
                                        formatter : function(value, rec, row) {
                                            return (row.type == 'Schedule' ? '<i class="icn_scheduled"></i>'
                                                    : '<i class="icn_recurring"></i>')
                                                    + formatLaunchSetting(row);
                                        }
                                    } ],
                            sortname : 'createdDate',
                            sortorder : 'desc',
                            viewrecords : true,
                            pager : "#launch_policy_gridPager",
                            multiselect : false,
                            prmNames : {
                                page : "pageNo", // 
                                totalrows : "totalrows" //
                            },
                            loadComplete : function() {
                                //EB_Common.toolTip.initialize();
                                $('.b-tooltip').tooltip();
                                $("#launch_policy_gridTable .bc_edit_btn").click(function() {
                                    var bcId = $(this).attr("href").match(/\d+/)[0];
                                    window.location.href = EB_Common.Ajax.wrapperUrl("/launchPolicies/edit/" + bcId);
                                });
                                $("#launch_policy_gridTable .bc_del_btn").click(
                                        function() {
                                            var bcId = $(this).attr("href").match(/\d+/)[0];
                                            EB_Common.dialog.confirm(i18n['global.dialog.content.confirm'], i18n['global.dialog.title.confirm'],
                                                    function() {
                                                        $(this).dialog("close");
                                                        // send delete request
                                                        EB_Common.Ajax.remove('/launchPolicies/delete/' + bcId, {},
                                                                function(data) {
                                                                    if (data.success) {
                                                                        view.reloadGrid("launch_policy_gridTable");
                                                                    }
                                                                })
                                                    });
                                        });
                            }
                        });
        view.listenSearch("launch_policy_gridTable");
    };

    function formatLaunchSetting(launchPolicy) {
        var str = "";
        if (launchPolicy && launchPolicy.launchSetting) {
            var launchSetting = launchPolicy.launchSetting;
            if (launchPolicy.type == 'Schedule') {
                str = launchSetting.startDate;
            } else {
                var msgMap = {
                    'daily' : 'days',
                    "weekly" : 'weeks',
                    "monthly" : "months",
                    "yearly" : 'years'
                };
                var tips = i18n['notification.title.setting.schedule.startFrom'] + ": "+ launchSetting.startDate + "\n";
                tips += i18n['notification.title.setting.schedule.ends'] + ": " + launchSetting.endDate + "\n";
                tips += i18n['notification.title.setting.schedule.repeatEvery'] + ": " + launchSetting.repeatNumber + " "
                        + i18n['notification.title.setting.schedule.' + msgMap[launchSetting.repeatType.toLowerCase()]]
                        + "\n";
                var repeatStr = "";
                switch (launchSetting.repeatType) {
                case 'DAILY':
                    repeatStr = launchSetting.hourMinutes;
                    break;
                case 'WEEKLY':
                    repeatStr = launchSetting.hourMinutes + "\nOn: " + launchSetting.weekDays.join(", ");
                    break;
                case 'MONTHLY':
                    repeatStr = launchSetting.hourMinutes + " of day " + (launchSetting.day > 10 ? launchSetting.day : "0" + launchSetting.day);
                    break;
                case 'YEARLY':
                    repeatStr = launchSetting.hourMinutes + " of day " + (launchSetting.month > 10 ? launchSetting.month : "0" + launchSetting.month) + "-"
                            + (launchSetting.day > 10 ? launchSetting.day : "0" + launchSetting.day);
                    break;
                }
                tips += i18n['notification.title.setting.schedule.repeatAt'] + ": " + repeatStr;
                str = '<a href="javascript:void(0)" class="b-tooltip" title="' + tips + '">'
                        + launchSetting.repeatType + '</a>';
            }
        }
        return str;
    }
})(EB_View.notifications);