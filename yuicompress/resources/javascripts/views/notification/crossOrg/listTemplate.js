(function(view){
    view.template={};
    view.template.listApp={

        ItemView:{
            templateStr : '<a class="icn_edit_16 bc_edit_btn" title="'
                + i18n['button.update'] + '"  href="javascript:void(0)"></a>' +
                '<a title="' + i18n['button.delete'] + '" class="icn_trash_16 bc_del_btn" href="javascript:void(0)"> </a>',
            events:{
                "click .bc_edit_btn":"clickEdit",
                "click .bc_del_btn":"clickDelete"
            },
            initialize:function(){
                this.render();
            },
            render:function(){
                this.$("td[aria-describedby$=operator]").html(this.templateStr);
                var broadcastTemplate = this.model.get("broadcastTemplate");
                var bs = broadcastTemplate.broadcastSettings;
                var content1 = "";
//                if(!bs){
//                    content1 = '<i class="icn_dbldash"></i>'
//                }
//                console.log(this.model.get("integral"));
                if(bs && bs.integral){
                    content1 = '<i class="icn_yes_16"></i>';
                }else{
                    content1 = '<i class="icn_dbldash"></i>';
                }
                this.$("td[aria-describedby$=broadcastoption]").html(content1);
                var content2 = "";
                var content3 = "";
                if(!this.model.get("integral")){
                    content3 = '<input title="'
                        + i18n['messagetemplate.text.disabled']
                        + '" class="bcChbox" name="broadcasttemplateid" type="checkbox" disabled="disabled" value="'
                        + this.model.get("id") + '">';

                }else{

                    content3 = '<input class="bcChbox" name="broadcasttemplateid" type="checkbox" value="'+ this.model.get("id") + '">';
                }
                this.$("td[aria-describedby$=id]").html(content3);
                var batchNotificationContacts = this.model.get("batchNotificationContacts");
                var contactsIntegral = false;
                if(batchNotificationContacts && batchNotificationContacts.length){
                    contactsIntegral = true;
                    for(var i=0;i<batchNotificationContacts.length;i++){
                        if(!batchNotificationContacts[i].integral){
                            contactsIntegral = false;
                            break;
                        }
                    }
                }
                if(contactsIntegral){
                    content2 = '<i class="icn_yes_16"></i>';
                }else{
                    content2 ='<i class="icn_dbldash"></i>';
                }

                this.$("td[aria-describedby$=contact_integral]").html(content2);

                var content4 = "";
                if (broadcastTemplate.priority == 'Priority') {
                    content4 = '<i class="icn_priority_hover_16"></i>' + broadcastTemplate.message.title;
                } else {
                    content4 = broadcastTemplate.message.title;
                }
                this.$("td[aria-describedby$='broadcastTemplate.message.title']").html(content4);
                this.delegateEvents();
            },
            clickEdit:function(e){
                window.location.href = window.location = EB_Common.Ajax.wrapperUrl("/crossOrgBroadcastTemplates/edit/" + this.model.get("id"));
            },
            clickDelete:function(e){
                var that =this;
                EB_Common.dialog.confirm(i18n['global.dialog.content.confirm'], i18n['global.dialog.title.confirm'], function() {
                    $(this).dialog("close");
                    // send delete request
                    var postData = [that.model.get("id")];
                    EB_Common.Ajax.remove('/crossOrgBroadcastTemplates/delete/'+postData, {}, function(data) {
                        if (data.success) {
                            $("#bc_grid_table").jqGrid('setGridParam',{postData:{quickSearchValue:''}}).trigger("reloadGrid");
                        }
                    })
                });

            }
        },
        ListView:{
            grid:null,
            container:null,
            tableId:null,
            pageId:null,
            events:{
                "click #simpleSearch":"clickSearch",
                "keypress #search":"keypressSearch",
                "click :checkbox[name=broadcasttemplateid]":"clickCheckbox",
                "click #sendBtn":"clickSendBtn"
            },
            initialize:function(){
                this.container = this.options.container;
                this.collection = new Backbone.Collection();
                this.ItemView = Backbone.View.extend(view.template.listApp.ItemView);
                this.checkIdCollection = new Backbone.Collection();
                this.checkIdCollection.on("all",this.checkIdChangeEvent,this);
                this.render();
            },
            render:function(){
                this.grid = $("#bc_grid_table");
                this.loadGrid();
                this.$("#event").combobox({
                    width : 165,
                    autoFocus : true
                });
//                this.loadEventDialog();
            },
            addItem:function(options){
                var model = new Backbone.Model(options.data);
                this.collection.add(model);
                var subView = new this.ItemView({model:model,el:options.el});
            },
            clearItems:function(){
                this.collection.update();
            },
            clickSendBtn:function(e){
                if (this.checkIdCollection.length > 0) {
//                    $('#dialog').dialog('open');
                    this.loadEventDialog();
                } else {
                    $('#errMessage').html(i18n['broadcasttemplate.text.errmessage']);
                }
//                var that = this;
//                EB_Common.dialog.confirm(i18n['notification.dialog.send.content.confirm'], i18n['global.dialog.title.confirm'],

            },
            checkIdChangeEvent:function(model){
                if(this.checkIdCollection && this.checkIdCollection.length>0){
                    this.$("#sendBtn").removeAttr("disabled").removeClass("btn_disabled");
                    this.$("#sendBtn").find('i').removeClass("icn_gray");
                }else{
                    this.$("#sendBtn").attr("disabled",true).addClass("btn_disabled");
                    this.$("#sendBtn").find('i').addClass("icn_gray");
                }
            },
            sendTemplate:function() {
                var dialog = this.eventDialog;
                var checkIds = this.checkIdCollection.toJSON();
                if (checkIds.length > 0) {
                    var bcIds = [];
                    $.each(checkIds,function(i,element) {
                        bcIds.push(element.id);
                    });
                    EB_Common.Ajax.post('/crossOrgBroadcastTemplates/send', {
                        eventName : $("#eventName").val(),
                        withEvent: $(":checked[name='needEvent']").val()==="yes"?true:false,
                        'id[]' : bcIds
                    }, function(data) {
                        if (data.success) {
                            dialog.dialog("close");
                            $("#ui-tabs-1").click();
                        }
                    }, 'json').fail(function(jqXhr){
                            dialog.data("submitted", false);
                        });
                }
            },
            clickCheckbox:function(e){
                if($(e.currentTarget).attr("checked")){
                    this.checkIdCollection.add({id:$(e.currentTarget).val()});
                }else{
                    this.checkIdCollection.remove({id:$(e.currentTarget).val()});
                }
            },
            clickSearch:function(e){
                this.grid.jqGrid('setGridParam',{postData:{messageTitle:this.$("#search").val()}}).trigger("reloadGrid");
            },
            keypressSearch:function(e){
                if(e.keyCode==13){

                    this.grid.jqGrid('setGridParam',{postData:{messageTitle:this.$("#search").val()}}).trigger("reloadGrid");
                }
            },
            loadEventDialog:function(){
                var that = this;

                this.eventDialog =this.$('#dialog').dialog({
                    autoOpen : true,
                    width : 625,
                    height : "auto",
                    modal : true,
                    resizable : false,
                    open:function(){
                        var eventForm = $(this);
                        $(this).find("#withEventForm :radio").change(function(){
                            if(this.value == "no" && this.checked){
                                eventForm.find("#event_name_div").hide();
                            }else{
                                eventForm.find("#event_name_div").show();
                            }
                        });
                        EB_Common.validation.validate("withEventForm", {
                            submitHandler:function (form) {
                                // some other code
                                // maybe disabling submit button
                                // then:
                                that.sendTemplate();
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
//                                $("#withEventForm").submit();
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

                });
            },
            loadGrid:function(){
                var that = this;
                this.grid.jqGrid(
                    {
                        autoencode : true,
                        url : EB_Common.Ajax.wrapperUrl("/crossOrgBroadcastTemplates/list"),
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
                        colNames : [ '', '', i18n['broadcasttemplate.field.messagetitle'],
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
                                align : "center"
                            },
                            {
                                width : 60,
                                colGetLength : false,
                                name : 'operator',
                                index : 'operator',
                                align : "center",
                                sortable : false
                            },
                            {
                                name : 'broadcastTemplate.message.title',
                                index : 'broadcastTemplate.message.title',
                                sorttype : "string",
                                colGetLength : false
                            },
                            {
                                name : 'broadcastTemplate.type',
                                index : 'broadcastTemplate.type',
                                sorttype : "string",
                                width : 60
                            },
                            {
                                name : 'accountMessageTemplateCategory.name',
                                index : 'accountMessageTemplateCategory.name',
                                sorttype : "string",
                                width : 60
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
                                width : 80
                            },
                            {
                                name : 'broadcastoption',
                                index : 'broadcastoption',
                                colGetLength : false,
                                sortable : false,
                                width : 80
                            } ],
                        sortname : 'createdDate',
                        sortorder : 'desc',
                        viewrecords : true,
                        pager : "#bc_grid_pager",
                        multiselect : false,
                        prmNames : {
                            page : "pageNo", //
                            totalrows : "totalrows" //
                        },
                        afterInsertRow:function(rowid, rowdata, rowelem){
                            var settings = {el:that.grid.getInd(rowid, true),data:rowelem};
                            that.addItem(settings);
                        },
                        beforeProcessing:function(){
                            that.clearItems();
                        }
                    });
            }
        },
        getInstance:function(options){
            var View = Backbone.View.extend(this.ListView);
            var settings = {
                el:options.el,
                container:options.container,
                tableId:options.tableId,
                pageId:options.pageId
            }
            var view = new View(settings);
            return view;
        }
    }
})(EB_View.crossOrgNotification)