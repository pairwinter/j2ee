(function(view) {
    window.editGrid=$('#editGrid').clone(true);
    topicNameSpace = {};
    var addValidator, updateValidator;
    var itemTmplUpdate = '<li><input type="text" name="topicTitleUpdate" maxlength="40" class="input_long {required:true,maxlength:40}" value="{{topicTitleUpdate}}"/>\n\
			   <input type="hidden" name="topicIdUpdate" class="input_long" value="{{topicIdUpdate}}"/>\n\
			   <a class="icn_trash_16" href="#" title="'+i18n['button.delete']+'"></a></li>',
        tmplRe = /\{\{([\w-]+)\}\}/g;

    var addItems = function(e) {
        var containerId = '#itemsContainer_add';
        if (!$(containerId).is(':visible')) {
            $(containerId).show();
        }
        var htmlStr = '<input type="text" name="topicTitle" maxlength="40" class="input_long {required:true,maxlength:40}"/>'
            + '<input type="hidden" name="topicId" value="0" class="input_long"/>'
            + '<a class="icn_trash_16" href="javascript:void(0);" title="'+i18n['button.delete']+'"></a>';
        var action = $('<li class="liAdded"/>').html(htmlStr).appendTo(containerId);

        $('#itemsContainer_add').find('a.icn_trash_16').show();

        action.find('a').click(function(e) {
            var input = $(e.target).parent().children('input'),
                inputVal = input.val(),
                inputs = $(e.target).closest('ul').find('input').not(input);
            if ($('#itemsContainer_add').find('a.icn_trash_16').size() <= 2) {
                $('#itemsContainer_add').find('a.icn_trash_16').hide();
            }
            $(this).closest('li').remove();
            if ($(containerId).children().length == 0) {
                $(containerId).hide();
            }

            if($.trim(inputVal) != ''){
                var repeatInputs = [];
                inputs.each(function(index, element){
                    if($.trim($(this).val()) == inputVal){
                        repeatInputs.push(element);
                        return false;
                    }
                });
                if(repeatInputs.length > 0){
                    $(repeatInputs[0]).valid();
                }
            }
        });
    };

    var addItemsUpdate = function(e) {
        //test
//        var containerId = '#itemsContainer';
//        var values = {topicIdUpdate: '0'};
//        for (var i = 2; i <= 500; i++) {
//            values.topicTitleUpdate = i + '';
//            var html = itemTmplUpdate.replace(tmplRe, function(m,name){
//                return values[name] !== undefined ? values[name] : '';
//            });
//            $(html).appendTo(containerId);
//        }

        var containerId = '#itemsContainer';
        var values = {topicTitleUpdate: '',topicIdUpdate: '0'};
        var html = itemTmplUpdate.replace(tmplRe, function(m,name){
            return values[name] !== undefined ? values[name] : '';
        });
        var action = $(html).appendTo(containerId);
        action.find('a').click(function() {
            if ($('#itemsContainer').find('a.icn_trash_16').size() <= 2) {
                $('#itemsContainer').find('a.icn_trash_16').hide();
            }
            $(this).closest('li').remove();
        });
        $('#itemsContainer').find('a.icn_trash_16').show();
    };

    var topicCategoryTypeChange = function(e) {
        $("#form_add_subscription").find("label.error").remove();
        $("#form_add_subscription").find("input").removeClass("error");
        var weatherTr = $('#form_add_subscription').find('tr[type^="weather"]');
        var customizedTr = $('#form_add_subscription').find('tr[type="customized"]');
        if ($("#topicCategoryType").val() == "Weather") {
            weatherTr.show();
            customizedTr.hide();
            $('#heading').show();
            $('#topicGroupName').addClass("{required:true}");
        } else {
            weatherTr.hide();
            customizedTr.show();
            $('#heading').hide();
            $('#topicGroupName').removeClass("{required:true}");
        }
    };

    function initGroupSelector(id,value){
        EB_Common.Ajax.get("/settings/contact/subscription/listTopicGroups", {}, function(data) {
            var length = data.length;
            var combox = $('#'+id);
            $("#"+id+" option[value!='']").remove();
            for ( var i = 0; i < length; i++) {
                var group = data[i];
                var selected = "'>";
                if(group.name == value){
                    selected = "' selected='selected'>";
                }
                combox.append("<option value='"+ group.name + selected + group.name + "</option>");
            }
            combox.combobox({
                selected: function(event, ui) {
                    if(id == "topicGroup"){
                        $("#topicCategoryTitle").removeData("previousValue").valid();
                    }else{
                        $("#topicCategoryTitleUpdate").removeData("previousValue").valid();
                    }
                }
            }).addClass("input_long");

            if(id == "topicGroup"){
                $('#form_add_subscription').find('input.ui-combobox-input').focusout(function(){
                    $("#topicCategoryTitle").removeData("previousValue").valid();
                });
            }else{
                $('#updateForm').find('input.ui-combobox-input').focusout(function(){
                    $("#topicCategoryTitleUpdate").removeData("previousValue").valid();
                });
            }

        });
    }

    function init() {
        $('#addItems_add_subscription').die();
        $('#addItems_add_subscription').bind('click', addItems);
        $('#addItems_subscription').die();
        $('#addItems_subscription').live('click', addItemsUpdate);
        $("#topicCategoryType").die();
        $("#topicCategoryType").live('change', topicCategoryTypeChange);

        $('tr[type="weatherType"]').find('a').click(function(){
            var me = $(this), subContainer = me.next(),icon = me.prev();;
            if(subContainer.is(':hidden')){
                subContainer.show();
                icon.addClass('expand');
            }else{
                subContainer.hide();
                icon.removeClass('expand');
            }
        });

        $('#addSubscription').click(function() {
            var form_add_subscription = $('#form_add_subscription');
            if (form_add_subscription.attr("style") != 'undefined') {
                form_add_subscription[0].reset();
                $('#topicGroupName').val('');
                $('#form_add_subscription').removeAttr("style");
                $("#topicCategoryType").val('');
                $("#topicCategoryTitle").val('');
                form_add_subscription.find("label.error").remove();
                $('.error-right').hide();
                $("#topicCategoryTitle").removeClass("error");
                $('#itemsContainer_add').find('a').click(function() {
                    if ($('#itemsContainer_add').find('a.icn_trash_16').size() <= 2) {
                        $('#itemsContainer_add').find('a.icn_trash_16').hide();
                    }
                    $(this).closest('li').remove();
                });

                initGroupSelector('topicGroup','');
            }

            var count = 1;
            $('#itemsContainer_add').find('li').each(function(){
                if(count > 1){
                    $(this).remove();
                }else{
                    $(this).find('a').hide();
                }
                count = count + 1;
            });

            addValidator = $('#form_add_subscription').validate({
                rules : {
                    'topicCategoryTitle' : {
                        required : true,
                        maxlength : 40,
                        remote : {
                            url : EB_Common.Ajax.wrapperUrl('/settings/contact/subscription/exists'),
                            type : "POST",
                            data : {
                                name : function() {
                                    return $.trim($("#topicCategoryTitle").val());
                                },
                                groupName : function() {
                                    return $.trim($("#topicGroupName").val());
                                },
                                topicCategoryId : function() {
                                    return $('#topicCategoryId').val();
                                }
                            }
                        }
                    },
                    'topicTitle':{
                        required : true,
                        maxlength : 40,
                        duplicateNameItem: true
                    }
                },
                messages : {
                    'topicCategoryTitle' : {
                        remote : i18n['setting.contact.subscriptionFields.name.duplicate']
                    }
                },
                submitHandler : function(form) {
                    saveTopicCategory();
                }
            });

            $("#insertRow").remove();
        });
        $('#cancel').click(function() {
            $('#form_add_subscription').attr("style", "display:none");
            $("#addItems_add_subscription").show();

            //reset Leave Page State
            EB_Common.LeavePage.resetState();
        });

        topicNameSpace.topicGrid = $('#topicTable');
    }

    function initTable() {
        topicNameSpace.topicGrid.jqGrid({
            autoencode : true,
            url : EB_Common.Ajax.wrapperUrl('/settings/contact/subscription/list'),
            height : "auto",
            datatype : 'json',
            emptyDataCaption : i18n['global.grid.emptyDataCaption'],
            autowidth : true,
            colNames : [ i18n['setting.contact.subscriptionFields.group'],i18n['setting.contact.subscriptionFields.name'],
                i18n['setting.contact.subscriptionFields.topicCategoryType'], '' ],
            colModel : [
                {
                    name : 'group.name',
                    index : 'group.name',
                    sortable : false,
                    formatter : function(value, rec) {
                        return (value != null && value != '')? value:'--';
                    }
                },
                {
                    name : 'name',
                    index : 'name',
                    sortable : false,
                    formatter : function(value, rec) {
                        return (value != null && value != '')? value:'--';
                    }
                },
                {
                    name : 'type',
                    index : 'type',
                    sortable : false
                },

                {
                    name : 'id',
                    index : 'id',
                    sortable : false,
                    formatter : function(value, rec) {
                        return '<span class="icn_edit_16" title="'+i18n['button.edit']+'"></span>' +
                            '<span class="icn_trash_16" title="'+i18n['button.delete']+'" onclick="return topicNameSpace.removeTopicCategory(this,'
                            + value + ',event);">&nbsp;</span>';
                    }
                }],
            rowNum : "totalCount",
            jsonReader : {
                root : "data",
                page : "currentPageNo",
                total : "totalPageCount",
                records : "totalCount",
                repeatitems : false
            }
        });

        //init edit event
        $('#topicTable').on('click', '.icn_edit_16', function() {
            $('#form_add_subscription').hide();
            var row = $(this).closest('tr');
            var id = row.attr('id');
            var updateForm;
            if (row.next().attr('name') == 'insertRow') {
                updateForm = row.next().remove();
                return;
            } else {
                $("#insertRow").remove();

                window.editGrid_new=window.editGrid.clone();
                $("#editGrid").remove();
                var eg = window.editGrid_new;

                var tr = $("<tr name='insertRow' id='insertRow' style='background:#FAECDF'><td colspan='5' style='border-bottom:1px solid #DDDDDD'></td></tr>");
                tr.find("td").append(eg);
                updateForm = tr.insertAfter(row);

                initCacheElement();
                $('#insertRow').find('label.error').hide();
                $("#topicCategoryTitleUpdate").removeClass("error");
                updateValidator = $('#updateForm').validate({
                    rules : {
                        'name' : {
                            required : true,
                            maxlength : 40,
                            remote : {
                                url : EB_Common.Ajax.wrapperUrl('/settings/contact/subscription/exists'),
                                type : "POST",
                                data : {
                                    name : function() {
                                        return $.trim($("#topicCategoryTitleUpdate").val());
                                    },
                                    groupName : function() {
                                        return $.trim($("#topicGroupName_edit").val());
                                    },
                                    topicCategoryId : function() {
                                        return $('#topicCategoryIdUpdate').val();
                                    }
                                }
                            }
                        },
                        'topicTitleUpdate':{
                            required : true,
                            maxlength : 40,
                            duplicateNameItem: true
                        }
                    },
                    messages : {
                        'name' : {
                            remote : i18n['setting.contact.subscriptionFields.name.duplicate']
                        }
                    },
                    submitHandler : function(form) {
                        updateTopicCategory();
                    }
                });

            }

            $('#itemsContainer').empty();
            EB_Common.Ajax.get("/settings/contact/subscription/"+id,{time : new Date().getTime()},
                function(data) {
                    if (data.status == "yes") {
                        var topicCategory = data.topicCategory;
                        var name = topicCategory.name, group = topicCategory.group.name, type = topicCategory.type;
                        var weatherTr = updateForm.find('tr[type^="weather"]');
                        var customizedTr = updateForm.find('tr[type="customized"]');
                        updateForm.find('div tr:eq(1) td:eq(1)').html(type);
                        updateForm.find("#topicCategoryIdUpdate").val(id);
                        updateForm.find("#topicCategory").val(type);
                        updateForm.find("#topicGroupName_edit").val(group);
                        initGroupSelector('topicGroup_edit',group);

                        if (type == "Weather") {
                            weatherTr.show();
                            customizedTr.hide();
                            $('#topicGroupName_edit').addClass("{required:true}");
                            $('#updateHeading').show();
                        } else {
                            $('#updateHeading').hide();
                            $('#topicGroupName_edit').removeClass("{required:true}");
                            updateForm.find('input[name="name"]').val(name);
                            weatherTr.hide();
                            customizedTr.show();
                            var topics = topicCategory.topics;
                            var html = '';
                            for ( var i = 0; i < topics.length; i++) {
                                var values = {topicTitleUpdate:topics[i].title,topicIdUpdate:topics[i].id};
                                html += itemTmplUpdate.replace(tmplRe, function(m,name){
                                    return values[name] !== undefined ? values[name] : '';
                                });
                            }
                            var action = $(html).appendTo('#itemsContainer');
                            action.find('a').click(function() {
                                if ($('#itemsContainer').find('a.icn_trash_16').size() <= 2) {
                                    $('#itemsContainer').find('a.icn_trash_16').hide();
                                }
                                $(this).closest('li').remove();
                            });
                            if (topics.length <= 1) {
                                $('#itemsContainer').find('a.icn_trash_16').hide();
                            }
                            $("#addItems_subscription").show();
                        }
                        $('.b-tooltip').tooltip();
                    } else {
                        EB_Common.dialog.alert(data.status);
                    }
                    $(eg).show();
                });
        });
    }

    function initCacheElement() {
        topicNameSpace.topicCategoryTitle = $('#topicCategoryTitle');
        topicNameSpace.topicCategoryTitleUpdate = $('#topicCategoryTitleUpdate');
        topicNameSpace.topicCategoryIdText = $('#topicCategoryId');
        topicNameSpace.topicCategoryIdTextUpdate = $('#topicCategoryIdUpdate');
        topicNameSpace.saveTopicButton = $('#saveTopic');
        topicNameSpace.updateTopicButton = $('#updateSubscriptionField');
        topicNameSpace.topicTitle = $('#topicTitle');
        topicNameSpace.topicId = $('#topicId');

    }

    function saveTopicCategoryClicked() {
        $('#form_add_subscription').submit();
    }

    function saveTopicCategory() {
        topicCategory = {};
        topicCategory.topics = new Array();
        topicCategory.name = $.trim(topicNameSpace.topicCategoryTitle.val());
        topicCategory.id = '0';
        topicCategory.group={};
        topicCategory.group.name=$.trim($("#topicGroupName").val());
        topicCategory.type = $("#topicCategoryType").val();
        var i = 0;

        $("input[name=topicTitle]").each(function() {
            var topicTitle = $(this).val();
            if (topicTitle != '') {
                topic = {};
                topic.title = topicTitle;
                topicCategory.topics[i] = topic;
                i++;
            }
        });
        sendSave(topicCategory);
    }

    function updateTopicCategoryClicked() {
        $("#updateForm").submit();
    }

    function updateTopicCategory() {
        topicCategory = {};
        topicCategory.topics = new Array();

        topicCategory.name = $.trim(topicNameSpace.topicCategoryTitleUpdate.val());
        topicCategory.id = topicNameSpace.topicCategoryIdTextUpdate.val();
        topicCategory.type = $("#topicCategory").val();
        topicCategory.group={};
        topicCategory.group.name=$.trim($("#topicGroupName_edit").val());
        var i = 0;
        $("input[name=topicTitleUpdate]").each(function() {
            var topicTitle = $(this).val();
            var topicId = $(this).next().val();
            if (topicTitle != '') {
                topic = {};
                topic.title = topicTitle;
                topic.id = topicId;
                topicCategory.topics[i] = topic;
                i++;
            }
        });
        sendSave(topicCategory);
    }

    function sendSave(topicCategory) {
        EB_Common.Ajax.post("/settings/contact/subscription/saveTopicCategory", {
            topicCategory : EB_Common.json.stringify(topicCategory)
        }, function(data) {
            if (data.status != "yes") {
                EB_Common.dialog.alert(i18n[data.status], i18n['dialog.title.warning']);
            } else {
                topicNameSpace.topicGrid.jqGrid().trigger("reloadGrid");
                cleanEditPanel();

                if (topicCategory.type == "Weather") {
                    var weatherTr = $('#form_add_subscription').find('tr[type^="weather"]');
                    var customizedTr = $('#form_add_subscription').find('tr[type="customized"]');
                    weatherTr.hide();
                    customizedTr.show();
                    $("#weatherOption").remove();
                    $("#addItems_add_subscription").show();
                }

                window.editGrid.hide();
                //reset Leave Page State
                EB_Common.LeavePage.resetState();
            }
        }, "json");
    }

    function cleanEditPanel() {
        topicNameSpace.topicCategoryTitle.val('').removeData().attr('disabled', false);
        topicNameSpace.topicCategoryIdText.val('');
        $("input[name=topicTitle]").val('');
        $("#form_add_subscription").hide();
    }

    topicNameSpace.editTopic = function(value) {
        EB_Common.Ajax.get("/settings/contact/subscription/"+value, {}, function(data) {
            if (data.status == "yes") {
                var topicCategory = data.topicCategory;
            } else {
                EB_Common.dialog.alert(data.status);
            }
        }, "json");
    };

    topicNameSpace.removeTopicCategory = function(obj, value, e) {
        var tr = $(obj).parent().parent();
        EB_Common.dialog.confirm(i18n['setting.delete.subscriptionField'],
            i18n['global.threshold.delete.comfirmtitle'], function() {
                $(this).dialog("close");
                EB_Common.Ajax.remove("/settings/contact/subscription", {
                    topicCategoryId : value
                }, function(data) {
                    if (data.status != "yes") {
                        EB_Common.dialog.alert(i18n[data.status], i18n['dialog.title.warning']);
                    } else {
                        if (tr.next().attr('name') == 'insertRow') {
                            tr.next().remove();
                        }

                        if (data.type == 'Weather') {
                            $('<option id="weatherOption" value="Weather">'+i18n['setting.contact.subscriptionFields.weather']+'</option>').insertAfter(
                                '#customizedOption');
                        }

                        tr.remove();
                        cleanEditPanel();

                    }
                });
            });
        if (window.event) {
            window.event.cancelBubble = true;
        } else {
            e.stopPropagation();
        }

    };

    function repaintEditPanel(topic) {
        topicNameSpace.topicCategoryTitle.val(topic.name).attr('disabled', false);
        topicNameSpace.topicCategoryIdText.val(topic.id);
        topicNameSpace.topicCategory.attr('value', topic.type);
    }

    topicNameSpace.initPage = function() {
        init();
        initTable();
        initCacheElement();
        $('#saveTopic').die();
        $('#saveTopic').live('click', saveTopicCategoryClicked);
        $('#updateSubscriptionField').die();
        $('#updateSubscriptionField').live('click', updateTopicCategoryClicked);
        $('#collapsedBtn').die();
        $('#collapsedBtn').live('click', function() {
            $("#insertRow").remove();

            //reset Leave Page State
            EB_Common.LeavePage.resetState();
        });
        if (parseInt($("#weatherSubscriptionNum").val()) > 0) {
            $("#weatherOption").remove();
        }

        $('#form_add_subscription').on('change','input[name="topicTitle"]',function(){
            addValidator.element('input[name="duplicateForAdd"]');
        });
        $('#updateForm').on('change','input[name="topicTitleUpdate"]',function(){
            updateValidator.element('input[name="duplicateForUpdate"]');
        });

    };

    view.topic = topicNameSpace;

})(EB_View);