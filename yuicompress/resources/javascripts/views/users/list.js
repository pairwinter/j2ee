/**
 * List User JavaScript.
 * User: tonyzhai
 * Date: 7/11/12
 * Time: 4:06 PM
 */
(function(view){
    view.user={};
    view.user.list ={};
    view.user.list.initPage={
        ItemView:Backbone.View.extend({
            events:{
                "click .icn_edit_16":"doEdit",
                "click .icn_trash_16":"doDelete",
                "click .icn_undisable_16":"doSwitch",
                "click .icn_disable_16":"doSwitch",
                "click .icn_action_sendmail":"sendMail"
            },
            initialize:function(){
                $.templates({
                    statusTemplate:$("#operatorCol").html()
                });
                this.statusTemplate = $.render.statusTemplate;
                this.render();
            },
            render:function(){
                this.renderFirstName();
                this.renderUserStatus();
                this.renderRoleItem();
                this.renderOperator();
            },
            renderFirstName:function(){
                var firstname=this.model.get("firstname");
                var userStatus=this.model.get("userStatus");
                var onlineStatus=this.model.get("onlineStatus");
                var text;
                if(onlineStatus=='Online'){
                    text= '<i class="icon_user_online"></i>'+$.jgrid.htmlEncode(firstname);
                }else if(userStatus=='NotRegistered'){
                    text= '<i class="icon_notregistereduser"></i>'+$.jgrid.htmlEncode(firstname);
                }else{
                    text= '<i class="icon_user_offline"></i>'+ $.jgrid.htmlEncode(firstname);
                }
                this.$("td[aria-describedby$=firstname]").html(text);
            },
            renderRoleItem:function(){
                var roleItems=this.model.get("roleItems");
                var text="";
                if(roleItems != null){
                    for(var i=0;i<roleItems.length;i++){
                        if(roleItems[i].organization!=null){
                            text+=roleItems[i].role.name+"-"+roleItems[i].organization.name+"</br>";
                        }else{
                            text+=roleItems[i].role.name+"</br>";
                        }
                    }
                }
                this.$("td[aria-describedby$=roleItems]").html(text);
            },
            renderUserStatus:function(){
                var userStatus=this.model.get("userStatus");
                var text;
                if(userStatus == 'Inactive'){
                    this.$("td").css("color", "#cccccc");
                    text="Inactive";
                }else if(userStatus=="NotRegistered"){
                    text="Not registered";
                }else{
                    text="Active";
                }
                this.$("td[aria-describedby$=userStatus]").html(text);
            },
            renderOperator:function(){
                var userStatus=this.model.get("userStatus");
                var onlineStatus=this.model.get("onlineStatus");
                this.$("td[aria-describedby$=id]").html(this.statusTemplate([{userStatus:userStatus,onlineStatus:onlineStatus}]));
            },
            doEdit:function(e){
                window.location.href =this.options.context+ "/users/" + this.model.get("id");
            },
            doDelete:function(e){
                var that=this;
                var id=this.model.get("id");
                EB_Common.dialog.confirm(i18n['user.list.confirm.delete'],i18n['user.list.warning'],
                    function(){
                        EB_Common.Ajax.post("/users/"+id,{_method:'DELETE'},function(data){
                            if(data.status=="failed"){
                                EB_Common.dialog.alert('This user already deleted.');
                            }
                            $("#gridTable").trigger("reloadGrid");
                        },"json");
                        $(this).dialog("close");
                    },function(){
                        return;
                    }
                );
            },
            doSwitch:function(){
                var id=this.model.get("id");
                var userStatus=this.model.get("userStatus");
                var confirmInfo;
                var confirmButton;
                if(userStatus=="Inactive"){
                    confirmInfo=i18n['user.list.confirm.enable'];
                    confirmButton =i18n['button.enable']
                }else{
                    confirmInfo=i18n['user.list.confirm.disable'];
                    confirmButton =i18n['button.disable']
                }
                EB_Common.dialog.confirm(confirmInfo,i18n['user.list.warning'],
                    function(){
                        EB_Common.Ajax.post("/users?switch",{_method:'PUT',id:id},function(data){
                            $("#gridTable").trigger("reloadGrid");
                        },"json");
                        $(this).dialog("close");

                    },function(){
                        return;
                    }, confirmButton,i18n['global.dialog.button.cancel']);
            },
            sendMail:function(){
                var id=this.model.get("id");
                EB_Common.Ajax.post("/users/mail",{id:id},function(data){
                    if(data.status!=""){
                        EB_Common.dialog.alert(i18n['user.list.mail.success']);
                    }else{
                        EB_Common.dialog.alert(i18n['user.list.mail.fail']);
                    }
                },"json");
            }
        }),

        ListView:Backbone.View.extend({
            el:$("#wrapper"),
            initialize:function(){
                this.context=this.options.context;
                this.rowsToColor=[];
                this.collection = new Backbone.Collection();
                this.render();
            },
            events:{
                "click #btn_add":"doAdd",
                "click #search_input":"doSearch",
                "submit #search_form":"doSearchForm"
            },
            addItem:function(options){
                var model = new Backbone.Model(options.data);
                this.collection.add(model);
                new view.user.list.initPage.ItemView({model:model,el:options.el,context:this.context});
            },
            render:function(){
                var that = this;
                $("#gridTable").jqGrid({
                    url:this.context+"/users",
                    datatype: "json",
                    autoencode:true,
                    emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                    height: "auto",
                    autowidth: true,
                    colNames:['',i18n['user.list.model.firstname'],i18n['user.list.model.lastname'],i18n['user.list.model.role'], i18n['user.list.model.lastModifiedDate'], i18n['user.list.model.lastModifiedBy'],i18n['user.list.model.status']],
                    colModel:[{name:'id',index:'id', width:120},
                        {name:'firstname', index:'firstname',  width:180},
                        {name:'lastname',         index:'lastname',         width:180},
                        {name:'roleItems',        index:'roleItems',        width:300, sortable:false},
                        {name:'lastModifiedDate', index:'lastModifiedDate', width:200},
                        {name:'lastModifiedName', index:'lastModifiedName', width:200, sortable:true},
                        {name:'userStatus',       index:'userStatus',       width:200}
                    ],
                    sortname: 'lastname',
                    sortorder:'asc',
                    jsonReader : {
                        root: "data",
                        page: "currentPageNo",
                        total: "totalPageCount",
                        records: "totalCount",
                        repeatitems: false
                    },
                    viewrecords:true,
                    pager:"#gridPager",
                    multiselect:false,
                    afterInsertRow:function(rowid, rowdata, rowelem){
                        var settings = {el:$("#gridTable").getInd(rowid, true),data:rowelem};
                        that.addItem(settings);
                        $('#' + rowid).children('td:eq(1)').addClass('text-word-break');
                    },
                    beforeProcessing:function(){
                        that.clearItems();
                    },
                    prmNames :{
                        page:"page",
                        rows:"size"
                    }
                });
            },
            doSearch:function(e){
                e.preventDefault();
                var queryString=encodeURIComponent($(":input[name='queryString']").val());
                $("#gridTable").jqGrid('setGridParam',{postData:{queryString:queryString},page:1}).trigger("reloadGrid");
            },
            doSearchForm:function(e){
                e.preventDefault();
                $('#search_input').click();
            },
            doAdd:function(){
                window.location.href=this.context+"/users/create";
            },
            clearItems:function(){
                this.collection.update();
            }
        })
    };
})(EB_View)