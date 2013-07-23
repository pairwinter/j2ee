(function(view) {
    view.bcTemplates = function() {};
    view.bcTemplates.initialize = function() {
        $("#bc_grid_table").jqGrid(
                        {
                            autoencode : true,
                            url : EB_Common.Ajax.wrapperUrl("/bcTemplates/list"),
                            datatype : "json",
                            emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                            gridGetLength : true,
                            mtype : "post",
                            jsonReader : {
                                root : "data",
                                page : "currentPageNo",
                                total : "totalPageCount",
                                records : "totalCount",
                                repeatitems : false
                            },
                            onSelectRow:function(){
                                var s = $("#bc_grid_table").jqGrid('getGridParam','selarrrow');
                                if(s.length>0){
                                    $("#dialog_link").prop("disable",false).addClass("orange").removeClass("gray");
                                }else{
                                    $("#dialog_link").prop("disable",true).addClass("gray").removeClass("orange");
                                }
                            },
                            height : "auto",
                            autowidth : true,
                            colNames : [ '', '',
                                    i18n['notification.field.publish'],
                                    i18n['broadcasttemplate.field.messagetitle'],
                                    i18n['broadcasttemplate.field.type'],
                                    i18n['broadcasttemplate.field.category'],
                                    i18n['broadcasttemplate.field.createdate'],
                                    i18n['broadcasttemplate.field.createby'],
                                    i18n['broadcasttemplate.field.distribution'],
                                    i18n['broadcasttemplate.field.broadcastoptions']],
                            colModel : [
                                    {
                                        width : 40,
                                        colGetLength : false,
                                        name : 'id',
                                        index : 'id',
                                        align : "center",
                                        formatter : function(value, rec, row) {
                                            var bc = row.broadcastContacts;
                                            var bs = row.broadcastSettings
//                                            var integrity = bc.contactIds != null && bc.contactIds.length > 0
//                                                || (bc.groupIds != null && bc.groupIds.length > 0)
//                                                || (bc.filterIds != null && bc.filterIds.length > 0)
//                                                || (bc.filterRules != null && bc.filterRules.length > 0)
//                                                || (bc.searchShapes != null && bc.searchShapes.length > 0);
                                            var bm = row.message;
                                            var integrity = (bc && bs && bc.integral && bs.integral && ($.trim(bm.textMessage) || $.trim(bm.audioKey))) || ($.trim(bm.textMessage) &&row.hasPublishMessage);
//                                            integrity =integrity&&($.trim(bm.textMessage) || $.trim(bm.audioKey));
                                            if (integrity) {
                                                return '<input class="bcChbox" name="broadcasttemplateid" type="checkbox" value="'
                                                    + row.id + '">';
                                            } else {
                                                return '<input title="'
                                                    + i18n['messagetemplate.text.disabled']
                                                    + '" class="bcChbox" name="broadcasttemplateid" type="checkbox" disabled="disabled" value="'
                                                    + row.id + '">';
                                            }
                                        }
                                    },
                                    {
                                        width : 55,
                                        colGetLength : false,
                                        name : 'id',
                                        index : 'id',
                                        align : "center",
                                        sortable : false,
                                        formatter : function(value, rec, row) {
                                            var returnStr = "";
                                            if(EB_Common.Security.protect(["TEMPLATE_edit_delete","TEMPLATE_view"])){
                                                returnStr += '<a href="javascript:void(' + row.id + ')" title="'
                                                    + i18n['button.update']
                                                    + '" class="icn_edit_16 bc_edit_btn"></a>';
                                            }
                                            if(EB_Common.Security.protect("TEMPLATE_edit_delete")){
                                                returnStr += '<a href="javascript:void('
                                                    + row.id + ')" class="icn_trash_16 bc_del_btn" title="'
                                                    + i18n['button.delete'] + '"> </a>';
                                            }
                                            return returnStr;
                                        }
                                    },
                                    {
                                        name : 'hasPublishMessage',
                                        colGetLength : false,
                                        title: false,
                                        width: 50,
                                        sortable:false,
                                        align : "left",
                                        index : 'hasPublishMessage',
                                        formatter : function(value, rec, row) {
                                            if(!value){
                                                return "";
                                            }
                                            var tips =[];
                                            if(row.hasNetworkMessage){
                                                tips.push(i18n["notification.field.publishMessage.networkEffectMessage"]);
                                            }
                                            if(row.hasIpawsMessage){
                                                tips.push(i18n["notification.field.publishMessage.ipawsMessage"]);
                                            }
                                            if(row.hasAlertUsMessage){
                                                tips.push(i18n["notification.field.publishMessage.alertUsMessage"]);
                                            }
                                            if(row.hasGenericeMessage){
                                                tips.push(i18n["notification.field.publishMessage.genericOneWayMessage"]);
                                            }
                                            var data_=[{tip:tips.join(", ")}];
                                            var tempVar = $("<div>");
                                            $( "#publishMessageImagTemplate" ).tmpl( data_).appendTo(tempVar);
                                            return tempVar.html();
                                        }
                                    },
                                    {
                                        name : 'message.title',
                                        index : 'message.title',
                                        colGetLength : false,
                                        formatter : function(value, rec, row) {
                                            return ((row.priority == 'Priority') ? '<i class="icn_priority_hover_16"></i>' : '') +$.jgrid.htmlEncode(value);
                                        }
                                    },
                                    {
                                        name : 'type',
                                        index : 'type',
                                        sorttype : "string",
                                        width : 60
                                    },
                                    {
                                        name : 'category.name',
                                        index : 'category.name',
                                        sortable : true
                                    },
                                    {
                                        width : 180,
                                        name : 'createdDate',
                                        index : 'createdDate',
                                        sorttype : "datetime",
                                        sortable : true
                                    },
                                    {
                                        name : 'createdName',
                                        index : 'createdName',
                                        sorttype : "string"
                                    },
                                    {
                                        name : 'contact_integral',
                                        index : 'contact_integral',
                                        colGetLength : false,
                                        sortable : false,
                                        width : 80,
                                        formatter : function(value, rec, row) {
                                            var bc = row.broadcastContacts;
                                            if(!bc){
                                                return '<i class="icn_dbldash"></i>';
                                            }
                                            if(bc.integral){
                                                return '<i class="icn_yes_16"></i>';
                                            }
                                            return '<i class="icn_dbldash"></i>';
                                        }
                                    },
                                    {
                                        name : 'broadcastoption',
                                        index : 'broadcastoption',
                                        colGetLength : false,
                                        sortable : false,
                                        width : 80,
                                        formatter : function(value, rec, row) {
                                            var bs = row.broadcastSettings;
                                            if(!bs){
                                                return '<i class="icn_dbldash"></i>'
                                            }
                                            var integrity = bs.deliverPaths != null && bs.deliverPaths.length > 0 && bs.senderCallerInfos != null && bs.senderCallerInfos.length > 0 && bs.senderEmail;
                                            if(bs.integral){
                                                return '<i class="icn_yes_16"></i>';
                                            }else{
                                                return '<i class="icn_dbldash"></i>';
                                            }
                                        }
                                    }
                                     ],
                            sortname : 'createdDate',
                            sortorder : 'desc',
                            viewrecords : true,
                            pager : "#bc_grid_pager",
                            multiselect : false,
                            prmNames : {
                                page : "pageNo", // 
                                totalrows : "totalrows" //
                            },
                            loadComplete : function() {
                                $("#bc_grid_table .bc_edit_btn").click(function() {
                                    var bcId = $(this).attr("href").match(/\d+/)[0];
                                    EB_Common.Ajax.get('/bcTemplates/check/isUsedByThreshold/' + bcId, {}, function(data) {
                                        if(data.success) {
                                            window.location.href = EB_Common.Ajax.wrapperUrl("/bcTemplates/edit/" + bcId);
                                        } else {
                                            EB_Common.dialog.confirm(i18n["global.dialog.edit.confirm"]+"<br/>"+i18n["notification.title.bcReference"]+": "+data.message, 
                                                    i18n['global.dialog.title.confirm'], function() {
                                                $(this).dialog("close");
                                                window.location.href = EB_Common.Ajax.wrapperUrl("/bcTemplates/edit/" + bcId);
                                            })
                                        }
                                    });
                                });
                                $(".bcChbox").click(function(){
                                    var checkedBcs = $(".bcChbox:checked");
                                    if (checkedBcs.length > 0) {
                                        $(".canDisabled").removeAttr("disabled").removeClass("btn_disabled");
                                        $(".canDisabled").find('i').removeClass("icn_gray");
                                    }else{
                                        $(".canDisabled").attr("disabled",true).addClass("btn_disabled");
                                        $(".canDisabled").find('i').addClass("icn_gray");
                                    }
                                });
                                $("#bc_grid_table .bc_del_btn").click(
                                        function() {
                                            var bcId = $(this).attr("href").match(/\d+/)[0];
                                            EB_Common.dialog.confirm(i18n['global.dialog.content.confirm'], i18n['global.dialog.title.confirm'],
                                                    function() {
                                                        $(this).dialog("close");
                                                        EB_Common.Ajax.get('/bcTemplates/check/isUsedByThreshold/' + bcId, {},
                                                            function(data) {
                                                                if (data.success) {
                                                                    // send delete request
                                                                    EB_Common.Ajax.remove('/bcTemplates/delete/' + bcId, {},
                                                                        function(data) {
                                                                            if (data.success) {
                                                                                view.reloadGrid("bc_grid_table");
                                                                            } else{
                                                                                EB_Common.dialog.alert(data.message);
                                                                            }
                                                                        })
                                                                }else{
                                                                    EB_Common.dialog.alert(i18n["notification.title.bcReference"]+ ": " +data.message);
                                                                }
                                                            })

                                                    });
                                        })
                            }

                        });
        view.listenSearch("bc_grid_table");
        $("#event").combobox({
            width : 165,
            autoFocus : true
        });
        $("#withEventForm :radio").change(function(){
            if(this.value == "no" && this.checked){
                $("#event_name_div").hide();
            }else{
                $("#event_name_div").show();
            }
        });
        var dialogSetting = {
            autoOpen : true,
            width : 625,
            height : "auto",
            modal : true,
            resizable : false,
            open:function(){
                EB_Common.validation.validate("withEventForm", {
                    submitHandler:function (form) {
                        var checkedBcs = $(".bcChbox:checked");
                        if (checkedBcs.length > 0) {
                            var bcIds = [];
                            checkedBcs.each(function() {
                                bcIds.push($(this).val());
                            });
                        }
                        EB_Common.Ajax.post('/bcTemplates/send', {
                            eventName : $("#eventName").val(),
                            withEvent:$("#yessend").val()==="yes"?true:false,
                            bcIds : bcIds.join("|")
                        }, function(data) {
                            $('#dialog').dialog("close");
                            if (data.success) {
                                EB_View.notifications.refreshCounter();
                                $("#ui-tabs-1").click();
                            }
                        }, 'json').fail(function(jqXhr){
                                $('#dialog').data("submitted", false);
                            });
                    },
                    rules:{
                        event: {
                            required: "#yessend:checked"
                        }

                    }
                });


            },
            close:function(){
                $(this).dialog("destroy");
            },
            buttons : {
                Ok : {
                    click : function() {
                        if(!$(this).data("submitted")){
                            $("#withEventForm").submit();
                            $(this).data("submitted", true);
                        }
                    },
                    'class' : 'orange',
                    text : i18n['button.send']
                },
                Cancel : {
                    click : function() {
                        $(this).dialog("close");
                    },
                    'class' : 'gray',
                    text : i18n['global.dialog.button.cancel']
                }

            }

        };
        $("#dialog_link").unbind().click(function() {
            if ($(".bcChbox:checked").length > 0) {
                $('#dialog').dialog(dialogSetting);
            } else {
                $('#errMessage').html(i18n['broadcasttemplate.text.errmessage']);
            }
            return false;
        });
    };
})(EB_View.notifications);