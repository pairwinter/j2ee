(function(view){
    view.message={};
    view.message.listApp={

        ItemView:{
            templateStr : '<a class="icn_edit_16 edit_msg_btn" title="'
                + i18n['button.update'] + '" href="javascript:void(0)"></a>' +
                '<a  title="'+ i18n['button.delete'] + '" class="icn_trash_16 del_msg_btn" href="javascript:void(0)"> </a>',
            events:{
                "click .edit_msg_btn":"clickEdit",
                "click .del_msg_btn":"clickDelete"
            },
            initialize:function(){
                this.render();
            },
            render:function(){
                this.$("td[aria-describedby$=operator]").html(this.templateStr);
                this.delegateEvents();
            },
            clickEdit:function(e){
                window.location.href = EB_Common.Ajax.wrapperUrl("/crossOrgMessageTemplates/"+ this.model.get("id"));
            },
            clickDelete:function(e){
                var that =this;
                EB_Common.dialog.confirm(i18n['global.dialog.content.confirm'], i18n['global.dialog.title.confirm'], function() {
                    $(this).dialog("close");
                    // send delete request
                    var postData = [that.model.get("id")];
                    EB_Common.Ajax.remove('/crossOrgMessageTemplates', {id:postData}, function(data) {
                        if (data.success) {
                            $("#messagetemplate_gridTable").jqGrid('setGridParam',{postData:{quickSearchValue:''}}).trigger("reloadGrid");
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
                "click #addMessageTemplate": "clickAddMessageTemplate",
                "click #simpleSearch":"clickSearch",
                "keypress #search":"keypressSearch"
            },
            initialize:function(){
                this.container = this.options.container;
                this.collection = new Backbone.Collection();
                this.ItemView = Backbone.View.extend(view.message.listApp.ItemView);
                this.render();
            },
            render:function(){
                this.grid = $("#messagetemplate_gridTable");
                this.loadGrid();
            },
            addItem:function(options){
                var model = new Backbone.Model(options.data);
                this.collection.add(model);
                var subView = new this.ItemView({model:model,el:options.el});
            },
            clearItems:function(){
                this.collection.update();
            },
            clickAddMessageTemplate:function(e){
                window.document.location = EB_Common.Ajax.wrapperUrl("/crossOrgMessageTemplates/new");
            },
            clickSearch:function(e){
                this.grid.jqGrid('setGridParam',{postData:{messageTitle:this.$("#search").val()}}).trigger("reloadGrid");
            },
            keypressSearch:function(e){
                if(e.keyCode==13){

                    this.grid.jqGrid('setGridParam',{postData:{messageTitle:this.$("#search").val()}}).trigger("reloadGrid");
                }
            },
            loadGrid:function(){
                var that = this;
                this.grid.jqGrid(
                    {
                        autoencode:true,
                        url : EB_Common.Ajax.wrapperUrl("/crossOrgMessageTemplates/json"),
                        datatype : "json",
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
                        autowidth : true,
                        colNames : [ 'id', '',i18n['messagetemplate.field.messagetitle'],
                            i18n['messagetemplate.field.category'],
                            i18n['messagetemplate.field.voicetext'],
                            i18n['messagetemplate.field.createby'],
                            i18n['messagetemplate.field.createddate'] ],
                        colModel : [
                            {
                                name:"id",
                                index:"id",
                                hidden:true,
                                width : 55,
                                colGetLength : false
                            },
                            {
                                name : 'operator',
                                index : 'operator',
                                colGetLength : false,
                                width : 80,
                                align : "center",
                                sortable : false
                            },
                            {
                                name : 'title',
                                index : 'title',
                                width : 120
                            },
                            {
                                name : 'accountMessageTemplateCategory.name',
                                index : 'accountMessageTemplateCategory.name',
                                width : 125
                            },
                            {
                                name : 'contentType',
                                index : 'contentType',
                                width : 125
                            },

                            {
                                name : 'createdName',
                                index : 'createdName',
                                width : 125,
                                sorttype : "string"
                            },
                            {
                                name : 'createdDate',
                                index : 'createdDate',
                                width : 125,
                                sorttype : "datetime"
                            } ],
                        sortname : 'createdDate',
                        sortorder : 'desc',
                        viewrecords : true,
                        pager : "#messagetemplate_gridPager",
                        multiselect : false,
                        prmNames : {
                            page : "pageNo", //
                            totalrows : "totalrows" //
                        },
                        afterInsertRow:function(rowid, rowdata, rowelem){
                            var settings = {el:that.grid.getInd(rowid, true),data:rowdata};
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