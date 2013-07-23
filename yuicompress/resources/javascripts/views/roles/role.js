(function(view) {
    function initBroadcastTemplateTree(organizationId, role) {
        EB_Common.Ajax.get("/roles/broadcastTemplate/tree", {orgId: organizationId}, function(data) {
            var zSetting = {
                check: {
                    enable: true,
                    chkStyle: "checkbox",
                    chkboxType: {"Y": "s", "N": "s"}
                },
                data: {
                    keep: {
                        leaf: false,
                        parent: false
                    },
                    key: {
                        checked: "checked",
                        children: "bcTemplates",
                        name: "name",
                        id: "id",
                        title: ""
                    }
                },
                view: {
                    selectedMulti: true
                }
            };
            var zNodes = data;
            var zRootNode = {id: -1, name: i18n["role.page.restriction.broadcast.template"], bcTemplates: zNodes, open: true,"nocheck":true};
            var selectTreeObj = $.fn.zTree.init($("#bcTemplateTree").show(), zSetting, zRootNode);
            var bcTemplateTreeObj = $.fn.zTree.getZTreeObj("bcTemplateTree");
            if (bcTemplateTreeObj != null) {
                if (role.roleDataScope) {
                    var bcTemplateIds = role.roleDataScope.broadcastTemplateIds;
                    if (bcTemplateIds) {
                        for (var j = 0; j < bcTemplateIds.length; j++) {
                            var node = bcTemplateTreeObj.getNodesByParam("id", bcTemplateIds[j], null);
                            if (node != null && node.length > 0) {
                                node[0].checked = true;
                            }
                        }
                    }
                }
                bcTemplateTreeObj.refresh();
            }
        }, "json");
    }

    function initIncidentTemplateTree(organizationId, role) {
        EB_Common.Ajax.get("/roles/incidentTemplate/tree", {orgId: organizationId}, function(data) {
            var zSetting = {
                check: {
                    enable: true,
                    chkStyle: "checkbox",
                    chkboxType: {"Y": "s", "N": "s"}
                },
                data: {
                    keep: {
                        leaf: false,
                        parent: false
                    },
                    key: {
                        checked: "checked",
                        children: "incidentTemplates",
                        name: "name",
                        id: "id",
                        title: ""
                    }
                },
                view: {
                    selectedMulti: true
                }
            };
            var zNodes = data;
            var zRootNode = {id: -1, name: i18n["role.page.restriction.incident.template"], incidentTemplates: zNodes, open: true,"nocheck":true};
            var selectTreeObj = $.fn.zTree.init($("#incidentTemplateTree").show(), zSetting, zRootNode);
            var incidentTemplateTreeObj = $.fn.zTree.getZTreeObj("incidentTemplateTree");
            if (incidentTemplateTreeObj != null) {
                if (role.roleDataScope) {
                    var incidentTemplateIds = role.roleDataScope.incidentTemplateIds;
                    if (incidentTemplateIds != null) {
                        for (var j = 0; j < incidentTemplateIds.length; j++) {
                            var node = incidentTemplateTreeObj.getNodesByParam("id", incidentTemplateIds[j], null);
                            if (node != null && node.length > 0) {
                                node[0].checked = true;
                            }
                        }
                    }
                }
                incidentTemplateTreeObj.refresh();
            }
        }, "json");
    }
    function initGroupTree(organizationId, role) {
        EB_Common.Ajax.get("/roles/group/tree", {orgId: organizationId}, function(data) {
            var zSetting = {
                check: {
                    enable: true,
                    chkStyle: "checkbox",
                    chkboxType: { "Y" : "s", "N" : "p" }
                },
                data: {
                    keep: {
                        leaf: false,
                        parent: false
                    },
                    key: {
                        checked: "checked",
                        children: "groups",
                        name: "name",
                        id: "id",
                        title: ""
                    }
                },
                callback:{
                    onCheck:dealCheckEvent
                },
                view: {
                    selectedMulti: true
                }
            };

            function dealCheckEvent(event, treeId, treeNode){
                if(!treeNode.checked){
                    unCheckParentNode(treeNode);
                }
                $.fn.zTree.getZTreeObj("groupTree").refresh();
            }
            function unCheckParentNode(treeNode){
                var parentNode=treeNode.getParentNode();
                if(parentNode!=null){
                    treeNode.getParentNode().checked=false;
                    return unCheckParentNode(parentNode);
                }
            }
            var zNodes = data;
            var zRootNode = {id: -1, name: i18n["role.page.restriction.group"], groups: zNodes, open: true,"nocheck":true};
            var selectTreeObj = $.fn.zTree.init($("#groupTree").show(), zSetting, zRootNode);
            var groupTreeObj = $.fn.zTree.getZTreeObj("groupTree");
            if (groupTreeObj != null) {
                if (role.roleDataScope) {
                    var groupIds = role.roleDataScope.groupIds;
                    if (groupIds != null) {
                        for (var j = 0; j < groupIds.length; j++) {
                            var node = groupTreeObj.getNodesByParam("id", groupIds[j], null);
                            if (node != null && node.length > 0) {
                                node[0].checked = true;
                            }
                        }
                    }
                }
                groupTreeObj.refresh();
            }
        }, "json");
    }
    function initRuleTree(organizationId, role) {
        EB_Common.Ajax.get("/roles/rule/tree", {orgId: organizationId}, function(data) {
            var zSetting = {
                check: {
                    enable: true,
                    chkStyle: "radio",
                    chkboxType: {"Y": "s", "N": "s"}
                },
                data: {
                    keep: {
                        leaf: false,
                        parent: false
                    },
                    key: {
                        checked: "checked",
                        children: "rules",
                        name: "name",
                        id: "id",
                        title: ""
                    }
                },
                view: {
                    selectedMulti: false
                }
            };
            var zNodes = data;
            var zRootNode = {id: -1, name: i18n["role.page.restriction.dynamic.group"], rules: zNodes, open: true,"nocheck":true};
            var selectTreeObj = $.fn.zTree.init($("#ruleTree").show(), zSetting, zRootNode);
            var ruleTreeObj = $.fn.zTree.getZTreeObj("ruleTree");
            if (ruleTreeObj != null) {
                if (role.roleDataScope) {
                    var node = ruleTreeObj.getNodesByParam("id", role.roleDataScope.ruleId, null);
                    if (node != null && node.length > 0) {
                        node[0].checked = true;
                    }
                }
                ruleTreeObj.refresh();
            }
        }, "json");
    }

    view.deleteRule=function(id){
        EB_Common.dialog.confirm(
            function () {
                EB_Common.Ajax.post("/contacts/filters/json/" + id, {_method:'DELETE', isCrossOrg:true, orgId:$("#currentOrgId").val()}, function (data) {
                    if (data.result == 'error') {
                        EB_Common.dialog.alert("Dlete error.");
                    } else {
                        $("#dynamicGroup_gridTable").jqGrid('setGridParam', {postData:{isCrossOrg:true, orgId:$("#currentOrgId").val(), contactFilterType:"DataScope"}, page:1}).trigger("reloadGrid");
                    }
                }, "json");
            }, function () {
                return;
            }
        );
    }

    view.editRule=function(id,orgId,roleId){
        EB_Common.Ajax.ajax({
            url:  '/roles/update/'+id+'?isCrossOrg=true&orgId=' + orgId + '&roleId=' + roleId,
            success:function(data){
                $("#dynamicGroupEdit").html(data);
                $("#dynamicGroupGrid").hide();
                $("#dynamicGroupEdit").show();
            }
        });
    }

    function bindCreateDynamicGroup(organizationId,context) {
        var roleId = $("#currentRoleId").val();
        $('#createDynamicGroup').data('organizationId',organizationId);
        $('#createDynamicGroup').click(function() {
            EB_Common.dialog.dialog('dynamicGroupDialog', {
                title: i18n['universe.contactslayers.dynamicgroups'],
                autoOpen: false,
                width: 800,
                height: 500,
                create: function() {
                    $('#colorPickerAttach').colorpicker({
                        defaultColor: '#881133',
                        success: function(value) {
                            $('#colorPickerAttach').css('background-color', value);
                            $('#fillColor').val(value);
                        }
                    });
                    $("#dynamicGroup_gridTable").jqGrid({
                        url: context + "/contacts/filters/json?orgId=" + organizationId + "&isCrossOrg=true&contactFilterType=DataScope",
                        datatype: "json",
                        autoencode: true,
                        emptyDataCaption: i18n['global.grid.emptyDataCaption'],
                        height: "auto",
                        autowidth: true,
                        colNames: ['',
                            i18n['contact.field.rulename'],
                            i18n['role.page.dynamic.group.color'],
                            i18n['contact.field.lastModifiedDate'],
                            i18n['contact.field.lastModifiedName']],
                        colModel: [
                            {name: 'id', index: 'id', width: 60, align: "center", sortable: false, formatter: function(value, rec, rowObject) {
                                var returnHtml='<a class="icn_edit_16 filter_jqgridEditRowBtn" customValue="'+value+'" title="' + i18n['button.update'] + '" href="javascript:void(0)" recordId="' + rowObject.id + '"></a>';
                                if(rowObject.used){
                                    returnHtml+='<a class="icn_trash_16_gray filter_jqgridDeleteRowBtn" used style="cursor: default" title="' + i18n['button.delete.invalid'] + '"></a>';
                                }else{
                                    returnHtml+='<a class="icn_trash_16 filter_jqgridDeleteRowBtn" customValue="'+value+'" title="' + i18n['button.delete'] + '" href="javascript:void(0);" recordId="' + rowObject.id + '"></a>';
                                }
                                return returnHtml;
                            }},
                            {name: 'name', index: 'name', width: 100, sorttype: "string"},
                            {name: 'fillColor', index: 'fillColor', width: 100, formatter: function(value, rec, rowObject) {
                                return '<input type="text" name="colorPickerAttach" class="colorpicker-source" style="background-color:' + value + '" readonly="readonly" color="${' + value + '}"/>' +
                                    '<input type="hidden" originalValue="${fillColor}" value="${fillColor}" name="colorPicker"/>';
                            }},
                            {name: 'lastModifiedDate', index: 'lastModifiedDate', width: 120},
                            {name: 'lastModifiedName', index: 'lastModifiedName', width: 100, sorttype: "string"}
                        ],
                        jsonReader: {
                            root: "data",
                            page: "currentPageNo",
                            total: "totalPageCount",
                            records: "totalCount",
                            repeatitems: false
                        },
                        sortname:'lastModifiedDate',
                        sortorder:'desc',
                        viewrecords: true,
                        pager: "#dynamicGroup_gridPager",
                        multiselect: false,
                        prmNames: {
                            page: "pageNo",
                            rows: "rows"
                        },
                        gridComplete:function(){
                            $("#dynamicGroup_gridTable").on('click','a.filter_jqgridEditRowBtn',function(e){
                                console.info($('#createDynamicGroup').data('organizationId'));
                                var customValue = $(e.currentTarget).attr('customValue');
                                EB_View.editRule(customValue,$('#createDynamicGroup').data('organizationId'),roleId);
                            });

                            $("#filter_jqgridDeleteRowBtn").on('click','a.filter_jqgridDeleteRowBtn',function(e){
                                var el = $(e.currentTarget);
                                if(el.attr('used')){
                                   return;
                                }else{
                                    var customValue = el.attr('customValue');
                                    EB_View.deleteRule(customValue);
                                }
                            });
                        }
                    });

                    $('#dynamicGroupSave').click(function() {
                        $('#dynamicGroupEdit').hide();
                    });
                    $('#dynamicGroupCancel').click(function() {
                        $('#dynamicGroupGrid').show();
                        $('#dynamicGroupEdit').hide();
                    });

                },
                buttons: {
                    Ok: {
                        click: function() {
                            $(this).dialog("close");
                            if($("#rule_res").attr("checked") == "checked"){
                                $("#rule_res").click();
                            }
                        },
                        'class': 'orange',
                        text: i18n['global.dialog.button.ok']
                    },
                    Cancel: {
                        click: function() {
                            $(this).dialog("close");
                        },
                        'class': 'gray',
                        text: i18n['global.dialog.button.cancel']
                    }
                }
            });
            $("#dynamicGroupEdit").hide();
            $("#dynamicGroupGrid").show();
            $(this).data('dialoged', true);
            $('#dynamicGroupDialog').dialog('open');
            $("#addDynamicGroup").click(function() {
//                window.location.href = context + '/roles/create?isCrossOrg=true&orgId=' + $("#currentOrgId").val() + '&roleId=' + $("#currentRoleId").val();
                EB_Common.Ajax.ajax({
                    url:  '/roles/create?isCrossOrg=true&orgId=' + $("#currentOrgId").val() + '&roleId=' + $("#currentRoleId").val(),
                    async : false,
                    success:function(data){
                        $("#dynamicGroupEdit").empty().html(data);
                        $("#dynamicGroupGrid").hide();
                        $("#dynamicGroupEdit").show();
                    }
                });
            });
            return false;
        });
        $("#dynamicGroup_gridTable").jqGrid('setGridParam', {url: context + "/contacts/filters/json?orgId=" + organizationId + "&isCrossOrg=true&contactFilterType=DataScope", page: 1}).trigger("reloadGrid");
    }

    function destroyAllTree(){
        destroyTree("bcTemplateTree");
        destroyTree("incidentTemplateTree");
        destroyTree("groupTree");
        destroyTree("ruleTree");
    }

    function destroyTree(id){
        var treeObj=$.fn.zTree.getZTreeObj(id);
        if (treeObj != null) {
            var nodes = treeObj.getNodes();
            if(nodes!=null && nodes.length>0){
                treeObj.removeNode(nodes[0]);
            }
        }
    }

    function bindTreeEvent(organizationId, role) {
        $("#broa_res").click(function() {
            initBroadcastTemplateTree(organizationId, role);
        });

        $("#broa_nores").click(function() {
            $("#bcTemplateTree").hide().empty();
            destroyTree("bcTemplateTree");
        });

        $("#incident_res").click(function() {
            initIncidentTemplateTree(organizationId, role);
        });

        $("#incident_nores").click(function() {
            $("#incidentTemplateTree").hide().empty();
            destroyTree("incidentTemplateTree");
        });

        $("#gro_res").click(function() {
            initGroupTree(organizationId, role);
        });

//        $("#gro_nores").click(function() {
//            $("#groupTree").hide().empty();
//            destroyTree("groupTree");
//        });

        $("#rule_res").click(function() {
            initRuleTree(organizationId, role);
        });

//        $("#rule_nores").click(function() {
//            $("#ruleTree").hide().empty();
//            destroyTree("ruleTree");
//        });
    }

    function initUpdateButton(context){
        $("#b-role-rightpanel").append('<input type="button" value="' + i18n['button.save'] + '" class="button orange createOrUpdate margin10-T" id="updateBtn"/>');
        $("#updateBtn").click(function(){
            doSaveOrUpdate(context);
        });
    }
    function checkRestrictions(role, organizationId, isNewRecord,context) {
        $("#ui-tabs-1").show();
        $("#updateBtn").remove();
        if(role.roleTemplate!='ORGANIZATION_ADMIN'){
            initUpdateButton(context);
        }
        if (role.roleRestrictions != null) {
            $("#saveDiv").show();
            $("#restrictionBoxDiv").empty();
            $("#ui-tabs-1").after($("#restrictionTab").render());
            $("#restrictionBoxDiv").append($("#restrictionContent").render([{role: role}]));
            $("#ui-tabs-2").click(function() {
                $(".Permission_Box").css("display", "none");
                $(".userAssignedBox").hide();
                $("#ui-tabs-1").removeClass("mouse_out");
                $("#ui-tabs-1").addClass("graytab");
                $("#ui-tabs-3").removeClass("mouse_out");
                $("#ui-tabs-3").addClass("graytab");
                $(".Restricted_Box").css("display", "block");
                $(this).addClass("mouse_out");
                $(this).removeClass("graytab");
            });
            bindTreeEvent(organizationId, role);
            bindCreateDynamicGroup(organizationId,context);
//            if(filterRoleId){
//                $('#createDynamicGroup').click();
//            }
            if (role.roleDataScope && role.roleDataScope.broadcastTemplateIds) {
                $("#broa_res").attr("checked", "checked");
                initBroadcastTemplateTree(organizationId, role);
            }
            if (role.roleDataScope && role.roleDataScope.incidentTemplateIds) {
                $("#incident_res").attr("checked", "checked");
                initIncidentTemplateTree(organizationId, role);
            }
//            if (role.roleDataScope && role.roleDataScope.ruleId > 0) {
            $("#rule_res").attr("checked", "checked");
            initRuleTree(organizationId, role);
//            }
//            if (role.roleDataScope && role.roleDataScope.groupIds) {
            $("#gro_res").attr("checked", "checked");
            initGroupTree(organizationId, role);
//            }
            if (!isNewRecord) {
                $("#ui-tabs-2").after($("#userAssignedTab").render([role]));
            }
        } else {
            if (!isNewRecord) {
                $("#ui-tabs-1").after($("#userAssignedTab").render([role]));
            }
            $("#ui-tabs-1").click();
        }
    }
    function initRight(roleId, organizationId, newRecord,context) {
        EB_Common.Ajax.get("/roles/" + roleId, {organizationId:organizationId}, function(role) {
            if (role != null) {
                $("#updateRoleDiv").remove();
                if(!newRecord && role.roleTemplate != 'ORGANIZATION_ADMIN'){
                    $("#addRoleDiv").hide();
                    $("#b-role-rightpanel").prepend($("#updateRoleTemplate").render([{role: role}]));

                    $("#updateRoleName").rules("add",{
                        remote: {
                            url: EB_Common.Ajax.wrapperUrl("/roles?validateRoleName"),
                            type: "get",
                            data: {
                                name:function(){
                                    return $("#updateRoleName").val();
                                },
                                organizationId:function(){
                                    return $("#currentOrgId").val();
                                },
                                id:function(){
                                    return $("#currentRoleId").val();
                                }
                            }
                        },
                        messages:{
                            remote:i18n['role.name.unique']
                        }
                    });
//                    $("#updateRoleName").blur(function(e){
//                        checkRoleNameWhenUpdate();
//                    });
                }
                $("#roleCurrentTemplate").val(role.roleTemplate);
                checkRestrictions(role, organizationId, newRecord,context);
                bindUserAssignedClickEvent(role.id,context);
                initPermissionTableForOrganizationLevel(roleId, organizationId);
                if ($("#ui-tabs-2").css("display") != "none") {
                    $("#ui-tabs-2").click();
                } else {
                    $("#ui-tabs-1").click();
                }
            } else {
                EB_Common.dialog.alert(i18n["error.business.-1"]);
            }
        }, "json");
    }

    function checkRoleNameWhenUpdate(){
        var roleName= e.currentTarget.value;
        var organizationId=$("#currentOrgId").val();
        var roleId=$("#currentRoleId").val();
        EB_Common.Ajax.post("/roles?validateRoleName",{name:roleName,organizationId:organizationId,id:roleId},function(data){
            $("#uniqueSpan").remove();
            if(!data){
                $("#updateRoleName").after('<span id="uniqueSpan" style="color:red">'+i18n["role.name.unique"]+'</span>')
            }
        },"json")
    }

    function initRoleMap() {
        $("#permissionBoxDiv").empty();
        $("#restrictionBoxDiv").empty();
        $("#ui-tabs-2").remove();
        $("#ui-tabs-3").remove();
    }

    function addRoleToLeft(role) {
        var roleLabel = $("#" + role.roleTemplate);
        if (roleLabel && $(roleLabel).attr("id")) {
            $(roleLabel).after($("#roleTr").render([role]));
        } else {
            $("#leftRoleTable").append($("#roleLabel").render([role]));
            $("#" + role.roleTemplate).after($("#roleTr").render([role]));
        }

    }

    function initAccount(context) {
        hideAddDiv();
        initRoleMap();
        $("#leftRoleTable").empty();
        var roleId;
        EB_Common.Ajax.get("/roles/accountLevel", {}, function(role) {
            if (role != null) {
                addRoleToLeft(role);
                $("#currentRoleId").val(role.id);
                $("#ui-tabs-1").after($("#userAssignedTab").render([role]));
                bindUserAssignedClickEvent(role.id,context);
                $(".role_link").parent().parent().addClass("highlight_bg");
                $(".role_link").click(function() {
                    hideAddDiv();
                });
                roleId = role.id;
            } else {
                EB_Common.dialog.alert(i18n["error.business.-1"]);
            }
        }, "json");
        initPermissionTableForAccountLevel();
    }

    function initPermissionTableForAccountLevel() {
        $("#permissionBoxDiv").empty();
        EB_Common.Ajax.get("/roles/account/modules", {}, function(data) {
            if (data != null) {
                $("#permissionBoxDiv").append($("#featureTable").render([{role: data[0], modules: data[1]}]));
            } else {
                EB_Common.dialog.alert(i18n["error.business.-1"]);
            }
        }, "json");
    }
    function initPermissionTableForOrganizationLevel(roleId, organizationId) {
        $("#permissionBoxDiv").empty();
        EB_Common.Ajax.get("/roles/organization/modules", {roleId: roleId, organizationId: organizationId}, function(data) {
            if (data != null) {
                $("#permissionBoxDiv").append($("#featureTable").render([{role: data[0], modules: data[1]}]));
            } else {
                EB_Common.dialog.alert(i18n["error.business.-1"]);
            }
        }, "json");
    }
    var rowsToColor = [];
    function bindUserAssignedClickEvent(roleId,context) {

        $("#ui-tabs-3").click(function(e) {
            e.preventDefault();
            $(".Permission_Box").hide();
            $(".Restricted_Box").hide();
            $("#ui-tabs-1").removeClass("mouse_out");
            $("#ui-tabs-1").addClass("graytab");
            $("#ui-tabs-2").removeClass("mouse_out");
            $("#ui-tabs-2").addClass("graytab");
            $(".userAssignedBox").show();
            var el = $(this);
            el.addClass("mouse_out");
            el.removeClass("graytab");
            $("#userAssigned_gridTable").jqGrid({
                url: context + "/roles/userAssigned/" + roleId,
                datatype: "json",
                autoencode: true,
                emptyDataCaption: i18n['global.grid.emptyDataCaption'],
                height: "auto",
                autowidth: true,
                colNames: [i18n['user.list.model.firstname'], i18n['user.list.model.lastname'], i18n['user.list.model.lastModifiedDate'], i18n['user.list.model.lastModifiedBy'], i18n['user.list.model.status']],
                colModel: [
                    {name: 'firstname', index: 'firstname', width: 200},
                    {name: 'lastname', index: 'lastname', width: 200},
                    {name: 'lastModifiedDate', index: 'lastModifiedDate', width: 200},
                    {name: 'lastModifiedName', index: 'lastModifiedName', width: 200, sortable: true},
                    {name: 'userStatus', index: 'userStatus', width: 200, formatter: function(userStatus, rec, rowObj) {
                        if (userStatus == 'Inactive') {
                            rowsToColor[rowsToColor.length] = rec.rowId;
                            return "Inactive";
                        } else if (rowObj.userStatus == "NotRegistered") {
                            return "Not registered";
                        } else {
                            return "Active";
                        }
                    }}
                ],
                jsonReader: {
                    root: "data",
                    page: "currentPageNo",
                    total: "totalPageCount",
                    records: "totalCount",
                    repeatitems: false
                },
                viewrecords: true,
                pager: "#userAssigned_gridPager",
                multiselect: false,
                prmNames: {
                    page: "page",
                    rows: "size"
                },
                gridComplete: function() {
                    for (var i = 0; i < rowsToColor.length; i++) {
                        var status = $("#" + rowsToColor[i]).find("td").eq(4).html();
                        if (status == "Inactive") {
                            $("#" + rowsToColor[i]).find("td").css("color", "#cccccc");
                        }
                    }
                }
            });
            $("#userAssigned_gridTable").jqGrid('setGridParam', {url: context + '/roles/userAssigned/' + roleId, page: 1}).trigger("reloadGrid");
        });
    }

    function hideAddDiv() {
        $("#rolename").val("");
        $("#roletemplate > option:first").attr("selected", "selected");
        $("#div_addRole").hide();
        $("#addRoleDiv").hide();
    }

    function doSaveOrUpdate(context){
        $(":hidden[temp=true]").remove();
        if (!$("#validation-form").valid()) {
            return;
        }


        var isGroupDisplay = false;
        var groupRadio = $("#gro_res");
        if (groupRadio && groupRadio.css("display") && groupRadio.css("display") != "none") {
            isGroupDisplay = true;
        }

        if(isGroupDisplay){
            var isGroupChecked = false;
            var isRuleChecked = false;
            //init groups tree hidden
            var treeObj = $.fn.zTree.getZTreeObj("groupTree");
            if (treeObj != null) {
                var nodes = treeObj.getCheckedNodes(true);
                if (nodes != null && nodes.length > 0) {
                    isGroupChecked = true;
                    for (var i = 0; i < nodes.length; i++) {
                        $("#validation-form").append('<input type="hidden" temp="true" name="roleDataScope.groupIds[' + i + ']" value="' + nodes[i].id + '"/>');
                    }
                }
            }

            //init rule tree hidden
            treeObj = $.fn.zTree.getZTreeObj("ruleTree");
            if (treeObj != null) {
                nodes = treeObj.getCheckedNodes(true);
                if (nodes != null && nodes.length > 0) {
                    isRuleChecked = true;
                    $("#validation-form").append('<input type="hidden" temp="true" name="roleDataScope.ruleId" value="' + nodes[0].id + '"/>');
                }
            }

            if($("#roleCurrentTemplate").val()!='DISPATCHER'){
                if (!isRuleChecked && !isGroupChecked) {
                    $(":hidden[temp=true]").remove();
                    EB_Common.dialog.alert(i18n["role.page.dynamic.group.tip"]);
                    return;
                }
            }
        }

        //init bc template tree hidden
        treeObj = $.fn.zTree.getZTreeObj("bcTemplateTree");
        if (treeObj != null) {
            nodes = treeObj.getCheckedNodes(true);
            if (nodes != null && nodes.length > 0) {
                for (var i = 0; i < nodes.length; i++) {
                    $("#validation-form").append('<input type="hidden" temp="true" name="roleDataScope.broadcastTemplateIds[' + i + ']" value="' + nodes[i].id + '"/>');
                }
            }
        }

        //init incident template tree hidden
        treeObj = $.fn.zTree.getZTreeObj("incidentTemplateTree");
        if (treeObj != null) {
            nodes = treeObj.getCheckedNodes(true);
            if (nodes != null && nodes.length > 0) {
                for (var i = 0; i < nodes.length; i++) {
                    $("#validation-form").append('<input type="hidden" temp="true" name="roleDataScope.incidentTemplateIds[' + i + ']" value="' + nodes[i].id + '"/>');
                }
            }
        }

        var options = {
            url: context + "/roles",
            success: function(data) {
                if (data.status == "roleNameNotUnique") {
                    EB_Common.dialog.alert(i18n["role.name.unique"]);
                    $(":hidden[temp=true]").remove();
                    $("#updateBtn").attr("hadSubmit","false");
                    return null;
                }
                var role = data;
                if (role != null) {
                    addRoleToLeft(role);
                    var roleId = role.id;
                    $("#roleId").val(roleId);
                    var organizationId = $("#currentOrgId").val();
                    $("#" + roleId).click(function() {
                        destroyAllTree();
                        hideAddDiv();
                        $("#ui-tabs-2").remove();
                        $("#ui-tabs-3").remove();
                        $("#roleId").val(roleId);
                        $("#currentRoleId").val(roleId);
                        $(".role_link").parent().parent().removeClass("highlight_bg");
                        $(this).parent().parent().addClass("highlight_bg");
                        initRight(roleId, organizationId,false,context);
                        $("#ui-tabs-1").click();
                    });
                    $(":hidden[temp=true]").remove();
                    $('#div_addRole').hide().find(':input:not(":button)').val('');
                    //highlight
                    $("#" + roleId).closest('tr').addClass("highlight_bg").siblings().removeClass('highlight_bg');
//                    initUpdateButton(context);
                    $("#" + roleId).click();
                    $("#updateBtn").attr("hadSubmit","false");
                    EB_Common.LeavePage.setState(false);
                } else {
                    EB_Common.dialog.alert(i18n["error.business.-1"]);
                }
            }
        };
        if ($("#roleId").val()) {
            options = {
                url: context + "/roles/update",
                data: {orgId: $("#currentOrgId").val(),updateRoleName:$("#updateRoleName").val()},
                success: function(role) {
                    if (role) {
                        $(":hidden[temp=true]").remove();
                        hideAddDiv();
                        $("#saveDiv").show();
                        $("#"+role.id).text(role.name);
                        $("#updateBtn").attr("hadSubmit","false");
                        EB_Common.LeavePage.setState(false);
                    } else {
                        $(":hidden[temp=true]").remove();
                        EB_Common.dialog.alert(i18n["role.name.unique"]);
                        $("#updateBtn").attr("hadSubmit","false");
                    }
                }
            };
        }
        if($("#updateBtn").attr("hadSubmit")=="true"){
            $(":hidden[temp=true]").remove();
            return false;
        }
        $("#updateBtn").attr("hadSubmit","true");
        $("#validation-form").ajaxForm(options).submit();
    }

    var pub = {
        initPage: function(context, filterRoleId, filterOrgId) {
            var me = this;
            EB_Common.validation.validate("validation-form");
            $("#createBtn").click(function() {
                doSaveOrUpdate(context);
            });

            $('#cancelBtn').click(function(){
                if (EB_Common.LeavePage.changeState()) {
                    EB_Common.dialog.leavePage(function() {
                        EB_Common.LeavePage.setState(false);
                        hideAddDiv();
                        $(me.currentLink).click();
                    });
                } else {
                    hideAddDiv();
                    $(me.currentLink).click();
                }
            });

            $("#ui-tabs-1").click(function() {
                $(".Restricted_Box").css("display", "none");
                $(".userAssignedBox").hide();
                $("#ui-tabs-2").removeClass("mouse_out");
                $("#ui-tabs-2").addClass("graytab");
                $("#ui-tabs-3").removeClass("mouse_out");
                $("#ui-tabs-3").addClass("graytab");

                $(".Permission_Box").css("display", "block");
                $(this).addClass("mouse_out");
                $(this).removeClass("graytab");
            });

            // operate: edit delete statr
            $("#leftRoleTable").on('mouseenter', 'tr', function(e) {
                var delegateEl = $(e.delegateTarget),
                    list = delegateEl.find('tr');
                for (var i = 0, len = list.length; i < len; i++) {
                    if ($(list[i]).data('editable') === false) {
                        return;
                    }
                }
                var roleId=$(this).find('a').attr("roleId");
                var that=$(this);
                if(roleId){
                    var settings={
                        url:"/roles/check/assigned/"+roleId,
                        async:false,
                        success:function(isAssigned){
                            if(!isAssigned){
                                that.find('[name="operateCt"]').show();
                            }else{
                                that.find('[name="operateCtGray"]').show();
                            }
                        }
                    }
                    EB_Common.Ajax.ajax(settings);
                }
            });
            $("#leftRoleTable").on('mouseleave', 'tr', function(e) {
                var delegateEl = $(e.delegateTarget),
                    list = delegateEl.find('tr');
                for (var i = 0, len = list.length; i < len; i++) {
                    if ($(list[i]).data('editable') === false) {
                        return;
                    }
                }
                $(this).find('[name="operateCt"]').hide();
                $(this).find('[name="operateCtGray"]').hide();
            });

            $("#leftRoleTable").on('click', '.icn_trash_16', function(e) {
                EB_Common.dialog.confirm(i18n['user.list.confirm.delete'], i18n['user.list.warning'],
                    function() {
                        var el = $(e.target),
                            rowEl = el.closest('tr'),
                            textEl = rowEl.find('a[name="roleNameLabel"]'),
                            roleId = textEl.attr("roleid");

                        EB_Common.Ajax.post("/roles/delete/" + roleId, {orgId: $("#currentOrgId").val(), _method: 'DELETE'}, function(data) {
                            if (data.status == 'success') {
                                if(rowEl.hasClass("highlight_bg")){
                                    $("#updateBtn").hide();
                                    $("#updateRoleDiv").remove();
                                    $("#ui-tabs-1").hide();
                                    initRoleMap();
                                }
                                var prevRow=rowEl.prev();
                                var nextRow=rowEl.next();
                                if(nextRow.attr("name")!="subRole" && prevRow.attr("name")!="subRole"){
                                    $(prevRow).remove();
                                }
                                rowEl.remove();
                            } else {
                                EB_Common.dialog.alert(i18n["role.page.delete.failed"]);
                            }
                        }, "json");
                        $(this).dialog("close");
                    }, function() {
                        return;
                    }
                );

            });

            $("#leftRoleTable").on('click', '.icn_edit_16', function(e) {
                var el = $(this),
                    rowEl = el.closest('tr'),
                    delegateEl = $(e.delegateTarget),
                    list = delegateEl.find('tr');
                for (var i = 0, len = list.length; i < len; i++) {
                    if ($(list[i]).data('editable') === false) {
                        return;
                    }
                }
                var textEl = rowEl.find('a[name="roleNameLabel"]'),
                    cancelEl = rowEl.find('a.icn_cancel_16'),
                    saveEl = rowEl.find('a.icn_save_16'),
                    deleteEl = rowEl.find('a.icn_trash_16'),
                    inputEl = rowEl.find('input[name="roleName"]');

                el.hide();
                inputEl.val(textEl.text()).show();
                cancelEl.show();
                saveEl.show();
                textEl.hide();
                deleteEl.hide();
                rowEl.data('editable', false);

                //set valid
                inputEl.errorCancel().rules("remove","remote");
//                inputEl.rules("add", {
//                    remote: {
//                        url: EB_Common.Ajax.wrapperUrl("/roles/checkRoleName?organizationId="+me.organizationId),
//                        type: "get"
//                    },
//                    messages: {
//                        remote:i18n['setting.error.items.duplicated']
//                     }
//                });

                return false;
            });

            $("#leftRoleTable").on('click', '.icn_save_16', function(e) {
                e.preventDefault();
                if (!$("#validation-form").valid()) {
                    return;
                }
                var el = $(this),
                    rowEl = el.closest('tr'),
                    textEl = rowEl.find('a[name="roleNameLabel"]'),
                    editEl = rowEl.find('a.icn_edit_16'),
                    cancelEl = rowEl.find('a.icn_cancel_16'),
                    inputEl = rowEl.find('input[name="roleName"]'),
                    deleteEl = rowEl.find('a.icn_trash_16'),
                    roleId = textEl.attr("roleid");

                EB_Common.Ajax.ajax({
                    url: EB_Common.Ajax.wrapperUrl("/roles/rename/" + roleId),
                    type: "POST",
                    dataType: "json",
                    data: {
                        orgId: $("#currentOrgId").val(),
                        _method: "PUT",
                        name: inputEl.val()
                    },
                    success: function(data) {
                        if (data.status == 'success') {
                            el.hide();
                            inputEl.hide();
                            editEl.show();
                            cancelEl.hide();
                            deleteEl.show();
                            textEl.text(inputEl.val()).show();
                            rowEl.removeData('editable');
                            inputEl.errorCancel().rules("remove","remote");
                        }else{
                            EB_Common.dialog.alert(i18n['setting.error.items.duplicated']);
                            EB_Common.LeavePage.setState(false);
                        }
                    }
                });
            });

            $("#leftRoleTable").on('click', '.icn_cancel_16', function(e) {
                e.preventDefault();
                var el = $(this),
                    rowEl = el.closest('tr'),
                    textEl = rowEl.find('a[name="roleNameLabel"]'),
                    editEl = rowEl.find('a.icn_edit_16'),
                    saveEl = rowEl.find('a.icn_save_16'),
                    deleteEl = rowEl.find('a.icn_trash_16'),
                    inputEl = rowEl.find('input[name="roleName"]');

                el.hide();
                inputEl.hide();
                editEl.show();
                saveEl.hide();
                textEl.show();
                deleteEl.show();
                rowEl.removeData('editable');
                inputEl.errorCancel().rules("remove","remote");
                EB_Common.LeavePage.setState(false);

            });
            // operate: edit delete end

            $('#create').click(function() {
                var fn = function(){
//                    $('#div_addRole').show();
                    $("#currentRoleId").val("");
//                    $("#saveDiv").show();
//                    $("#b-role-rightpanel").prepend($("#addRoleTemplate").render());
                    $("#ui-tabs-1").hide();
                    $("#updateRoleDiv").remove();
                    initRoleMap();
                    $("#rolenametd").remove();
                    $("#rolenametr").append('<td id="rolenametd"><input type="text" maxlength="30" id="rolename" name="name" class="{required:true} input_long"/></td>');
//                    var date=$("#rolename").attr("date");
                    $("#addRoleDiv").show();
                    $('#leftRoleTable a.icn_cancel_16:visible').click();
                    $('#leftRoleTable [name="operateCt"]:visible').mouseleave();
                    $('#leftRoleTable [name="operateCtGray"]:visible').mouseleave();
                };
                if (EB_Common.LeavePage.changeState()) {
                    EB_Common.dialog.leavePage(function() {
                        EB_Common.LeavePage.setState(false);
                        fn();
                    });
                } else {
                    fn();
                }
            });

            $("#organizationRadio").click(function() {
                EB_Common.LeavePage.setState(false);
                $("#selectOrg > option:first").attr("selected", "selected");
                $("#selectOrg").show();
                $("#saveDiv").hide();
                $("#ui-tabs-1").click();
            });

            $("#accountRadio").click(function() {
                EB_Common.LeavePage.setState(false);
                $("#selectOrg").hide();
                $("#updateBtn").hide();
                $("#updateRoleDiv").remove();
                $("#addButtonDiv").hide();
                $("#saveDiv").hide();
                initAccount(context);
                $("#ui-tabs-1").click();
            });

            $("#selectOrg").change(function() {
                EB_Common.LeavePage.setState(false);
                hideAddDiv();
                initRoleMap();
                $("#leftRoleTable").empty();
                $("#addButtonDiv").hide();
                $("#updateRoleDiv").remove();
                var roleId;
                var organizationId = $(this).val();
                me.organizationId = organizationId;
                $("#currentOrgId").val(organizationId);
                if (organizationId != "") {
                    EB_Common.Ajax.get("/roles/organizationLevel/" + organizationId, {}, function(data) {
                        var roles=data[0];
                        var roleTemplates=data[1];
                        if (roles != null) {
                            for (var i = 0; i < roles.length; i++) {
                                addRoleToLeft(roles[i]);
                                if (roles[i].roleTemplate == "ORGANIZATION_ADMIN") {
                                    //add highlight for organization admin when change select
                                    $(".role_link").eq(0).parent().parent().addClass("highlight_bg");
                                    roleId = roles[i].id;
                                    $("#currentRoleId").val(roleId);
                                    checkRestrictions(roles[i], organizationId,false,context);
                                    bindUserAssignedClickEvent(roleId,context);
                                }
                            }
                            initPermissionTableForOrganizationLevel(roleId, organizationId);
                        } else {
                            EB_Common.dialog.alert(i18n["error.business.-1"]);
                        }

                        //bind create role template
                        $("#roletemplate").empty();
                        $("#roletemplate").append('<option value="" selected="selected">'+i18n["role.template.select"]+'</option>');
                        $(roleTemplates).each(function(index,role){
                            if(role.roleTemplate != 'ACCOUNT_ADMIN' && role.roleTemplate != 'ORGANIZATION_ADMIN')
                                $("#roletemplate").append('<option value="'+role.id+'" template="'+role.roleTemplate+'">'+i18n[role.roleTemplate]+'</option>');
                        });

                        $(".role_link").click(function() {
                            destroyAllTree();
                            var self = this;
                            me.currentLink = this;
                            var fn = function() {
                                hideAddDiv();
                                $("#ui-tabs-2").remove();
                                $("#ui-tabs-3").remove();
                                var roleId = $(this).attr("roleId");
                                $("#currentRoleId").val(roleId);
                                $("#roleId").val(roleId);
                                $(".role_link").parent().parent().removeClass("highlight_bg");
                                $(this).parent().parent().addClass("highlight_bg");
                                initRight(roleId, organizationId,false,context);
                                $('#leftRoleTable a.icn_cancel_16:visible').click();
                                $('#leftRoleTable [name="operateCt"]:visible').mouseleave();
                                $('#leftRoleTable [name="operateCtGray"]:visible').mouseleave();
                                $("#ui-tabs-1").click();
                            };

                            if (EB_Common.LeavePage.changeState()) {
                                EB_Common.dialog.leavePage(function() {
                                    EB_Common.LeavePage.setState(false);
                                    fn.call(self);
                                });
                            } else {
                                fn.call(self);
                            }
                        });

                    }, "json");
                    $("#addButtonDiv").show();
                }
                $("#ui-tabs-1").click();

            });

            $("#roletemplate").change(function() {
                if ($(this).val() != "") {
                    destroyAllTree();
                    $("#currentRoleTemplate").val($("#roletemplate >option:selected").attr("template"));
                    initRoleMap();
                    var roleId = $(this).val();
                    var organizationId = $("#currentOrgId").val();
                    $("#currentRoleId").val("");
                    $("#roleId").val("");
                    initRight(roleId, organizationId, true,context);
                    $("#rolename").rules("add",{
                        remote: {
                            url: EB_Common.Ajax.wrapperUrl("/roles/checkRoleName"),
                            type: "get",
                            data: {
                                roleName:function(){
                                    return $("#rolename").val();
                                },
                                organizationId:function(){
                                    return $("#currentOrgId").val();
                                }
                            }
                        },
                        messages:{
                            remote:i18n['role.name.unique']
                        }
                    });
                }
            });

            if (filterRoleId && filterOrgId) {
                $("#organizationRadio").click();
                $("#selectOrg").val(filterOrgId);
                $("#selectOrg").change();
            } else {
                initAccount(context);
            }

            EB_Common.LeavePage.addListener({caontainer:'contentPanel',one:false});

            $.views.helpers({
                getI18nMessage: function(code) {
                    return i18n[code];
                },
                contains: function(restrictions, targetRestriction) {
                    for (var i = 0; i < restrictions.length; i++) {
                        if (restrictions[i] == targetRestriction) {
                            return true;
                        }
                    }
                    return false;
                }
            });

            $('#leftRoleTable').on('click', 'tr[name="parentRole"]',function(){
                $(this).nextUntil('tr[name="parentRole"]').toggle();
            });
        }
    };
    view.role = view.role || {};
    view.role.main = pub;

})(EB_View);