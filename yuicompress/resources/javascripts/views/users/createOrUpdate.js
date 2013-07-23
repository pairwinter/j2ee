/**
 * Create User JavaScript.
 * User: tonyzhai
 * Date: 7/11/12
 * Time: 2:34 PM
 */
(function(view){
    view.user=function(){};
    view.user.createOrUpdate = function(){};
    view.user.createOrUpdate.initPage=function(context){
        var doDelete=this.doDelete;

        EB_Common.validation.validate("validation-form",{rules: {}});

        function initAccountLevelRole(){
            EB_Common.Ajax.get("/users/roleLevel/account",{},function(result){
                var selectHtml='<select id="accountLevelRoleSelect" class="input_width143"><option value="'+result.id+'">'+result.name+'</option></select>';
                $("#levelSpan").append(selectHtml).show();
            },"json");
        }

        if(roleItemOrganizationId > 0){
            $("#accountLevelOption").remove();
            initOrganizationAndDoChange();
        }else if(userId > 0){
            initAccountLevelRole();
            $("#roleLi").hide();
        }else{
            initAccountLevelRole();
        }
        initDefaultRoleTr();
        function initOrganization(){
            $("#organizationLevelRoleSpan").empty();
            EB_Common.Ajax.get("/users/roleLevel/organization",{},function(result){
                var selectHtml='<select id="organizationSelect" class="input_width183">';
                for(var i=0;i<result.data.length;i++){
                    selectHtml+='<option value="'+result.data[i].id+'">'+result.data[i].name+'</option>';
                }
                selectHtml+='</select>';
                $("#levelSpan").append(selectHtml).show();
                bindOrganizationSelectChangeEvent();
                var organizationId=$("#organizationSelect").find("option").first().val();
                EB_Common.Ajax.get("/users/organizationRoleLevel/"+organizationId,{},function(data){
                    var selectHtml='<select id="organizationLevelRoleSelect" class="select_width250">';
                    for(var i=0;i<data.length;i++){
                        selectHtml+='<option value="'+data[i].id+'">'+data[i].name+'</option>';
                    }
                    selectHtml+='</select>';
                    $("#organizationLevelRoleSpan").append(selectHtml).show();
                    $("#roleLi").append('<div class="txt999 margin5-T margin5_L" id="organizationLabel">'+i18n["user.createOrUpdate.organization.role.tip"]+'</div>');
                },"json");
            },"json");
        }

        function bindOrganizationSelectChangeEvent(){
            $("#organizationSelect").change(function(){
                $("#organizationLevelRoleSelect").remove();
                var organizationId=$(this).val();
                EB_Common.Ajax.get("/users/organizationRoleLevel/"+organizationId,{},function(data){
                    var selectHtml='<select id="organizationLevelRoleSelect" class="select_width250">';
                    for(var i=0;i<data.length;i++){
                        selectHtml+='<option value="'+data[i].id+'">'+data[i].name+'</option>';
                    }
                    selectHtml+='</select>';
                    $("#organizationLevelRoleSpan").append(selectHtml).show();
                },"json");
            });
        }

        function initOrganizationAndDoChange(){
            $("#organizationLevelRoleSpan").empty();
            EB_Common.Ajax.get("/users/roleLevel/organization",{},function(result){
                var selectHtml='<select id="organizationSelect" class="input_width183">';
                for(var i=0;i<result.data.length;i++){
                    selectHtml+='<option value="'+result.data[i].id+'">'+result.data[i].name+'</option>';
                }
                selectHtml+='</select>';
                $("#levelSpan").append(selectHtml).show();
                bindOrganizationSelectChangeEvent();
                $("#organizationSelect").change();
            },"json");
        }

        $("#roleLevelSelect").change(function(){
            $("#accountLevelRoleSelect").remove();
            $("#organizationSelect").remove();
            $("#organizationLabel").remove();
            if($(this).val() == "account"){
                $("#organizationLevelRoleSpan").hide();
                initAccountLevelRole();
            }else if($(this).val() == "organization"){
                initOrganization();
            }
        });

        $("#add_role").click(function(){
            $("#defaultRoleTr").remove();
            var index=$("#roleTable").children().eq(0).children().length;
            var roleLevel = $("#roleLevelSelect").val();
            if(roleLevel == "account"){
                var roleId=$("#accountLevelRoleSelect").val();
                if(roleId){
                    var trId=roleId+"-account"
                    var newTr='<tr id="'+trId+'">'
                        +'<td></td>'
                        +'<td>'+$("#accountLevelRoleSelect option:selected").text()+'</td><input role="role" name="roleIds['+(index-1)+']" type="hidden" value="'+roleId+'">'
                        +'<td><a onClick=EB_View.user.createOrUpdate.initPage.doDelete("'+trId+'") class="icn_trash_16" href="javascript:void(0)"></a></td></tr>';
                    $("#roleTable").append(newTr);
                    $("#roleLi").hide();
                }
            }else{
                $("#accountLevelOption").remove();
                var organizationId=$("#organizationSelect").val();
                var flag=false;
                $(":hidden[organization='organization']").each(function(){
                    if($(this).val()==organizationId){
                        EB_Common.dialog.alert(i18n['user.org_selected_message']);
                        flag=true;
                        return;
                    }
                });
                if(flag){
                    return;
                }
                var roleId=$("#organizationLevelRoleSelect").val();
                if(organizationId && roleId){
                    var trId=roleId+"-organization"
                    var newTr='<tr id="'+trId+'">'
                        +'<td>'+$("#organizationSelect option:selected").text()+'</td><input name="orgIds['+(index-1)+']" type="hidden" organization="organization" value="'+organizationId+'">'
                        +'<td>'+$("#organizationLevelRoleSelect option:selected").text()+'</td><input role="role" name="roleIds['+(index-1)+']" type="hidden" value="'+roleId+'">'
                        +'<td><a onClick=EB_View.user.createOrUpdate.initPage.doDelete("'+trId+'") class="icn_trash_16" href="javascript:void(0)"></a></td></tr>';
                    $("#roleTable").append(newTr);
                }
            }
        });

        $("#gridTable").jqGrid({
            url:context+"/users/link/json",
            datatype: "json",
            mtype:"get",
            autoencode:true,
            postData:{orgId:orgId},
            contentType: "application/json",
            emptyDataCaption : i18n['global.grid.emptyDataCaption'],
            jsonReader : {
                root: "data",
                page: "currentPageNo",
                total: "totalPageCount",
                records: "totalCount",
                repeatitems: false
            },
            height: "auto",
            autowidth : true,
            rowNum: 10,
            rowList: [10],

            colNames:['',
                      i18n['contact.field.firstName'],
                      i18n['contact.field.lastName'],
                      i18n['contact.field.externalId']],
            colModel:[
                      {name:'id',index:'id', width:20,sortable:false,formatter:function(firstname,rec,rowObject){
                            return '<input type="radio" value="'+rowObject.id+'" name="contactRecord">';
                      }},
                      {name:'firstName',index:'firstName', width:150,sortable:false},
                      {name:'lastName',index:'lastName', width:150,sortable:false},
                      {name:'externalId',index:'externalId',width:150,sortable:false}
            ],
            sortname:'firstname',
            sortorder:'asc',
            viewrecords:true,
            pager:"#gridPager",
            multiselect:false,
            prmNames : {
                page:"pageNo",
                totalrows:"rows"
            }
        });

        $("#contactOrgSelect").change(function(){
            orgId=$(this).val();
        });

        $("#orgSearch").click(function(){
            if($("#contactOrgSelect").val()==""){
                EB_Common.dialog.alert(i18n['user.create.select_org.label']);
                return;
            }
            var queryString=$("#queryString").val();
            $("#gridTable").jqGrid('setGridParam',{postData:{firstName:queryString,orgId:orgId}}).trigger("reloadGrid");
        });
        
        $('#orgSearchForm').submit(function(e){
            e.preventDefault();
            $('#orgSearch').click();
        });

//        function replaceSpecialCharacter(data){
//            data=data.replaceAll("<","&lt;");
//            data=data.replaceAll(">","&gt;");
//            data=data.replaceAll("\"","&quot;");
//            data=data.replaceAll("\'","&#39;");
//            return data;
//        }
        EB_Common.dialog.dialog('dialog',{
            autoOpen: false,
            width:625,
            height:"auto",
            modal:true,
            buttons: {
                    Link: {
                        click: function() {
                            var isSelected=false;
                            var contactId="";
                            var firstName="";
                            var lastName="";
                            var externalId="";
                            $("input[name='contactRecord']").each(function(){
                                if($(this).attr("checked")=="checked"){
                                    isSelected=true;
                                    contactId=$(this).val();
                                    firstName=$(this).parents().next().html();
                                    lastName=$(this).parents().next().next().html();
                                    externalId=$(this).parents().next().next().next().html();
                                }
                            });
                            if(!isSelected){
                                EB_Common.dialog.alert(i18n['user.create.contact.least']);
                                return;
                            }
                            $("#contactId").val(contactId);
                            $("#contactOrgId").val(orgId);
                            var titles = [];
                            titles.push(i18n["user.create.contact.firstname"]+":"+firstName);
                            titles.push(i18n["user.create.contact.lastname"]+":"+lastName);
                            titles.push(i18n["user.create.contact.external"]+":"+externalId);
                            var htmlStr='<div id="contactDiv" class="contact_hidden nowrap"><span id="contactName"/><a  href="javascript:void(0)" id="btn_delete_contact" class="icn_trash_16"  ></a></div>';
                            $("#dialog_link").hide();
                            $("#dialog_link").after(htmlStr);
//                            $("#contactName").attr("title",titles.join("<br/>")).tooltip({hide:false,position: { my: "left+15 center", at: "right center" }}).html(firstName);
                            $("#contactName").html(firstName+" "+lastName+", "+externalId);
                            $("#btn_delete_contact").click(function(){
                                $("#contactId").val("");
                                $("#contactOrgId").val("");
                                $("#contactDiv").remove();
                                $("#dialog_link").show();
                            });
                            $(this).dialog("close");

                        },
                        'class':'orange',
                        text:i18n['global.dialog.button.link']

                    }  ,
                Cancel : {
                    click : function() {
                        $(this).dialog("close");
                    },
                    'class' : 'gray',
                    text : i18n['global.dialog.button.cancel']
                }
            }

        });

        $('#dialog_link').click(function(){
            $('#dialog').dialog('open');
            $('#launch_tb').show();
            $('#sender_tb').show();
            $('#throttling_tb').show();
            $('#delivery_tb').show();
            $('#methods_tb').show();
            return false;
        });

        $("#btn_switch_status").click(function(){
            var li=$("#btn_switch_status").children().eq(0);
            if($.trim($(li).attr("class"))=="class_active"){
                EB_Common.dialog.confirm(i18n['user.list.confirm.disable'],i18n['user.list.warning'],
                    function(){
                        EB_Common.Ajax.post("/users?switch",{_method:'PUT',id:userId},function(data){
                            if(data.status=='onlineOrSelf'){
                                EB_Common.dialog.alert("You can not disable this online user or yourself.");
                                return;
                            }else{
                                $("#gridTable").trigger("reloadGrid");
                                $(li).attr("class","class_inactive");
                            }
                        },"json");

                        $(this).dialog("close");

                    },function(){
                        return;
                    }
                );
            }else{
                EB_Common.dialog.confirm(i18n['user.list.confirm.enable'],i18n['user.list.warning'],
                    function(){
                        EB_Common.Ajax.post("/users?switch",{_method:'PUT',id:userId},function(data){
                            if(data.status=='onlineOrSelf'){
                                EB_Common.dialog.alert("You can not enable this online user or yourself.");
                                return;
                            }else{
                                $("#gridTable").trigger("reloadGrid");
                                $(li).attr("class","class_active");
                            }
                        },"json");
                        $(this).dialog("close");
                    },function(){
                        return;
                    }
                );
            }
        });


        $("#btn_delete_user").click(function(){
            EB_Common.dialog.confirm(i18n['user.list.confirm.delete'],i18n['user.list.warning'],
                function(){
                    EB_Common.Ajax.post("/users/"+userId,{_method:'DELETE'},function(data){
                        if(data.status=='onlineOrSelf'){
                            EB_Common.dialog.alert("You can not delete this online user or yourself.");
                        }else{
                            location.href=context+"/users/list";
                        }
                    },"json");
                    $(this).dialog("close");
                },function(){
                    return;
                }
            );
        });

        $("#btn_delete_contact").click(function(){
            $("#contactId").val("");
            $("#contactOrgId").val("");
            var htmlStr='<a href="javascript:void(0)" id="dialog_link" class="a_link" >'+i18n["user.create.contact.link.label"]+'</a>';
            $("#contactDiv").after(htmlStr);
            $("#contactDiv").remove();
            $("#linkedContactId").remove();
            $("#linkedContactOrgId").remove();
            $('#dialog_link').click(function(){
                $('#dialog').dialog('open');
                $('#launch_tb').show();
                $('#sender_tb').show();
                $('#throttling_tb').show();
                $('#delivery_tb').show();
                $('#methods_tb').show();
                return false;
            });
        });

        $("#btn_send_mail").click(function(){
            EB_Common.Ajax.post("/users/mail",{id:userId},function(data){
                if(data.status!=""){
                    $("#inviteDate").html(data.inviteDate);
                    $("#expirationDate").html(data.expirationDate);
                    EB_Common.dialog.alert(i18n['user.list.mail.success']);
                }else{
                    EB_Common.dialog.alert(i18n['user.list.mail.fail']);
                }
            },"json");
        });

        $("#btn_send_forgot_password_email").click(function(){
            EB_Common.Ajax.post("/users/forgotPassword/mail",{id:userId},function(data){
                if(data.status!=""){
                    EB_Common.dialog.alert(i18n['user.list.mail.success']);
                }else{
                    EB_Common.dialog.alert(i18n['user.list.mail.fail']);
                }
            },"json");
        });

        $("#btn_save").click(function(){
            if($("#validation-form").valid()){
                var contactId=$("#contactId").val();
                var organizationId=$("#contactOrgId").val();
                if(contactId && organizationId){
                    EB_Common.Ajax.get("/users/checkContactLinked",{contactId:contactId,organizationId:organizationId},function(linked){
                        if(!linked){
                            doSubmit();
                        }else{
                            EB_Common.dialog.alert(i18n["user.createOrUpdate.link.contact.tip"]);
                            return false;
                        }
                    },"json")
                }else{
                    doSubmit();
                }
            }
        });
        $("#contactName").tooltip({hide:false,position: { my: "left+15 center", at: "right center" }});
    };

    function doSubmit(){
        if($(":hidden[role='role']").length>0){
            if($("#btn_save").attr("hadSubmit")=="true"){
                return false;
            }
            $("#btn_save").attr("hadSubmit","true");
            $(":hidden[role='role']").each(function(index){
                $(this).attr("name","roleIds["+index+"]");
            });
            $(":hidden[organization='organization']").each(function(index){
                $(this).attr("name","orgIds["+index+"]");
            });
            if($("#linkedContactId").val() && $("#linkedContactOrgId").val()){
                $("#contactId").val($("#linkedContactId").val());
                $("#contactOrgId").val($("#linkedContactOrgId").val());
            }
            $("#validation-form").submit();
        }else{
            EB_Common.dialog.alert(i18n['user.create.select_role_label']);
            return;
        }
    }

    function initDefaultRoleTr(){
        if($(":hidden[organization ='organization']").length==0 && $(":hidden[role ='role']").length==0){
            $("#roleTable").append('<tr id="defaultRoleTr"><td colspan="3"><span class="xing">*</span>'+i18n["user.role.table.default.label"]+'</td></tr>');
        }
    }

    view.user.createOrUpdate.initPage.doDelete=function(id){
        $("tr[id="+id+"]").remove();
        var trId=id.split("-");
        if(trId[1]=="account"){
            $("#roleLi").show();
        }else if(trId[1]=="organization"){
            if($(":hidden[organization ='organization']").length==0){
                $("#roleLevelSelect").prepend('<option id="accountLevelOption" value="account">'+i18n["user.create.role.level.account"]+'</option>');
            }
        }
        initDefaultRoleTr();
    }


})(EB_View)