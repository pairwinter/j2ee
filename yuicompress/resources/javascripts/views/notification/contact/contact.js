(function(view,i18n){
    view.notification.app.ContactApp={
        SubUnits:{
            IndividualGroupFilter:{
                SelectedContactModel:{
                    defaults:function(){
                        return {
                            load:false,
                            contacts:[],
                            groups:[],
                            filters:[]
                        };
                    },
                    initialize:function () {
                        if(arguments && arguments.length>1 && arguments[1].url){
                            this.urlRoot=arguments[1].url;
                        }
                    },
                    parse:function(response){
                        var selectedContacts = {
                            load:true,
                            contacts:response.contacts||[],
                            groups:response.groups||[],
                            filters:response.filters||[]
                        };
                        return selectedContacts;
                    }
                },
                SelectedContactView:{
                    okCallBack:null,
                    treeObj:null,
                    selectedGroupIds:"",
                    initialize:function () {
                        this.selectedGroupIds = this.options.selectedGroupIds;
                        this.okCallBack = this.options.okCallBack;
                        $.templates({
                            contactSelectTemplate: $("#contactSelectTemplate").html()
                        });
                        this.contactSelectTemplate = $.render.contactSelectTemplate;
                        this.model.on("change:load",this.render,this);
                        if(this.model.urlRoot)
                            this.model.fetch();
                        else
                            this.model.set("load",true);
                    },
                    render:function(){
                        this.$el.html(this.contactSelectTemplate(this.getIdSuffixModelJSON()));
                        this.individualGrid = this.$("#individual_gridTable");
                        this.groupTree = this.$("#groupsTree");
                        this.ruleGrid = this.$("#rule_gridTable");
                        this.multiselectIndividual = this.$("#multiselectIndividual");
                        this.multiselectGroup =  this.$("#multiselectGroup");
                        this.multiselectFilter = this.$("#multiselectFilter");
                        this.advanceSearch = this.$("#forAdvanceSearch");
                        this.dialog();
                        this.loadAdvanceSearch();
                        return this;
                    },
                    renderIndividualContacts:function(){
                        var html = $("#multiselectIndividualTemplate").render(this.model.get("contacts"));
                        this.$("#multiselectIndividual").html(html);
                        this.$("#multiselectIndividualBackup").html(html);
                    },
                    reset:function(){
                        this.model.set("contacts",[]);
                        this.model.set("groups",[]);
                        this.model.set("filters",[]);
                        this.multiselectIndividual.empty();
//                        this.syncDataToGrid(this.multiselectIndividual,this.individualGrid);
                        this.multiselectGroup.empty();
//                        this.syncDataToTree(this.multiselectGroup);
                        this.multiselectFilter.empty();
//                        this.syncDataToGrid(this.multiselectFilter,this.ruleGrid);
                    },
                    events:function(){
                        var events = {
                            "click #main_tabs>a":"eventClickContactType",
                            "click #contacts_del_btn":"deleteContacts",
                            "click #groups_del_btn":"deleteGroups",
                            "click #rules_del_btn":"deleteRules",
                            "click #forAdvanceSearch":"eventClickAdvanceSearch",
                            "click #manageContacts":"eventClickManageContacts"
                        }
                        return this.dealEvents(events,this.cid);
                    },
                    loadAdvanceSearch:function(){
                        var app = this;
                        var searchSettings = {
                            container:$('#advanceSearchContainer'+this.cid),
                            autoOpen:false,
                            showSavedAsRule:false,
                            needForm:true,
                            callback:{
                                search:function(conditions){
                                    app.individualGrid.jqGrid('setGridParam',{datatype:'json',
                                        url : EB_Common.Ajax.wrapperUrl("/contacts/json"),
                                        mtype:"post",
                                        postData:{quickSearchValue:'',
                                        filterRules:EB_Common.json.stringify(conditions)}}).trigger("reloadGrid");
                                },close:function(){
                                    app.individualGrid.jqGrid('setGridParam',{datatype:'json',
                                        url : EB_Common.Ajax.wrapperUrl("/contacts/json"),
                                        mtype:"post",
                                        postData:{quickSearchValue:'',filterRules:null}}).trigger("reloadGrid");
                                }
                            }

                        };
                        this.advancedSearch = EB_View.contact.advancedSearchApp.getInstance(searchSettings);
                    },
                    eventClickContactType:function(e){
                        var tabDiabled = $(e.target).attr("tab-diabled");
                        if(tabDiabled && tabDiabled=="true")return;
                        this.changeContactType(parseInt($(e.target).attr("data-index"))-1);
                    },
                    eventClickManageContacts:function(e){
                        e.stopPropagation();
                        var curIndex = this.$("#main_tabs > .mouse_out").attr("data-index");
                        var tabIndex = "";
                        switch(curIndex){
                            case "1": tabIndex="ui-tabs-1";break;
                            case "2": tabIndex="ui-tabs-3";break;
                            case "3": tabIndex="ui-tabs-4";break;
                            default : tabIndex="ui-tabs-1";break;
                        }
                        EB_Common.dialog.leavePage(function() {
                            window.location = EB_Common.Ajax.wrapperUrl("/contacts/manage#"+tabIndex);
                        });
                    },
                    eventClickAdvanceSearch:function(){
                        if(this.advancedSearch.isHidden()){
                            this.advancedSearch.open();
                        }else{
                            this.advancedSearch.close();
                        }
                    },
                    deleteContacts:function(){
                        this.multiselectIndividual.find("input:checked").each(function(){
                            $(this).parent().parent().remove();
                        });
                        this.syncDataToGrid(this.multiselectIndividual,this.individualGrid);
                    },
                    deleteGroups:function(){
                        this.multiselectGroup.find("input:checked").each(function(){
                            $(this).parent().parent().remove();
                        });
                        this.syncDataToTree(this.multiselectGroup);
                    },
                    deleteRules:function(){
                        this.multiselectFilter.find("input:checked").each(function(){
                            $(this).parent().parent().remove();
                        });
                        this.syncDataToGrid(this.multiselectFilter,this.ruleGrid);
                    },
                    //call back from external
                    changeContactType:function(index){
                        this.$("#main_tabs>a").eq(index).addClass("mouse_out").siblings().removeClass("mouse_out");
                        this.$("#tabContainer").children().hide().eq(index).show();
                        if(this.ruleGrid.is(':visible')){
                            this.ruleGrid.jqGrid('resizeGrid');
                        }
                        if(this.individualGrid.is(':visible')){
                            this.individualGrid.jqGrid('resizeGrid');
                        }
                    },
                    syncDataToGrid:function(select, grid){
                        var checkedCount = 0,selectedOptions = [];
                        grid.resetSelection();
                        select.find("input").each(function(){
                            selectedOptions.push($(this).val());
                        })
                        var ids= grid.jqGrid("getDataIDs");
                        for(var i=0;i<ids.length;i++){
                            if($.inArray(ids[i],selectedOptions)>-1){
                                grid.jqGrid('setSelection',ids[i],false);
                            }
                        }
                    },
                    syncDataFromGrid:function(select,grid) {
                        var ids= grid.jqGrid("getDataIDs");
                        var selectedIds = grid.jqGrid("getGridParam","selarrrow");
                        var findOptions = [];
                        select.find("input").each(function(){
                            if($.inArray(this.value,ids)>-1){
                                findOptions.push(this);
                            }
                        });
                        var existIds = [];
                        $.each(findOptions,function(i,option){
                            if($.inArray(option.value,selectedIds)==-1){
                                $(option).parent().parent().remove();
                            }else{
                                existIds.push(option.value);
                            }
                        });
                        var newOptions=[];
                        $.each(selectedIds,function(i,id){
                            if($.inArray(id,existIds)==-1){
                                newOptions.push(grid.getRowData(id));
                            }
                        });
                        var id = select.attr("id").toLowerCase(),$id = "";
                        if(id.indexOf("individual")>-1) $id = "multiselectIndividualTemplate";
                        if(id.indexOf("group")>-1){ $id = "multiselectGroupTemplate";}
                        if(id.indexOf("filter")>-1){$id = "multiselectFilterTemplate";}
                        select.append($("#"+$id).render(newOptions));
                    },
                    syncDataToTree:function(select) {
                        if(!this.treeObj) return;
                        this.treeObj.checkAllNodes(false);
                        var treeNodes = this.treeObj.transformToArray(this.treeObj.getNodes());
                        var groups =[];
                        select.find("input").each(function(){
                            groups.push($(this).val());
                        });
                        for ( var i = 0; i < treeNodes.length && groups; i++) {
                            var treeNode = treeNodes[i];
                            if ($.inArray(treeNode.id+"",groups) >-1) {
                                this.treeObj.checkNode(treeNode, true, false, false);
                            }
                        }
                        if(groups && groups.length>0 && groups.length==treeNodes.length-1){
                            this.treeObj.checkNode(treeNodes[0], true, false, false);
                        }
                    },
                    syncDataFromTree:function(select) {
                        $('#select_group').empty();
                        var treeNode = this.treeObj.getCheckedNodes(true);
                        var treeNodes = [];
                        if (treeNode && treeNode.length > 0) {
                            for ( var i = 0; i < treeNode.length; i++) {
                                if (treeNode[i].id != -1) {
                                    treeNodes.push($.extend({},treeNode[i]));
                                }
                            }
                        }
                        var id = select.attr("id").toLowerCase(),$id = "";
                        if(id.indexOf("individual")>-1) $id = "multiselectIndividualTemplate";
                        if(id.indexOf("group")>-1){ $id = "multiselectGroupTemplate";}
                        if(id.indexOf("filter")>-1){$id = "multiselectFilterTemplate";}
                        select.empty().html($("#"+$id).render(treeNodes));
                    },
                    resetSelectedData:function(isCover){
                        if(isCover){
                            this.$("#multiselectIndividualBackup").empty().html(this.multiselectIndividual.html());
                            this.$("#multiselectGroupBackup").empty().html(this.multiselectGroup.html());
                            this.$("#multiselectFilterBackup").empty().html(this.multiselectFilter.html());
                        }else{
                            this.multiselectIndividual.empty().html(this.$("#multiselectIndividualBackup").html());
                            this.multiselectGroup.empty().html(this.$("#multiselectGroupBackup").html());
                            this.multiselectFilter.empty().html(this.$("#multiselectFilterBackup").html());
                        }
                        var contacts = [];
                        this.multiselectIndividual.find("input").each(function(){
                            var j = $(this);
                            contacts.push({id:this.value,firstName:j.attr("firstName"),lastName:j.attr("lastName"),externalId:j.attr("externalId")});
                        });
                        this.model.set("contacts",contacts);
                        var groups = [];
                        this.multiselectGroup.find("input").each(function(){
                            var j = $(this);
                            groups.push({id:this.value,name:j.attr("text")});
                        });
                        this.model.set("groups",groups);
                        var filters = [];
                        this.multiselectFilter.find("input").each(function(){
                            var j = $(this);
                            filters.push({id:this.value,name:j.attr("text")});
                        });
                        this.model.set("filters",filters);
                    },
                    dialog:function(){
                        var me = this;
                        this.$el.dialog({
                            autoOpen : false,
                            title : i18n["notification.title.contact"],
                            width : 1000,
                            height : "auto",
                            modal : true,
                            resizable : false,
                            open:function(){
                                me.initContactsData();
                                me.syncDataToGrid(me.multiselectIndividual,me.individualGrid);
                                me.syncDataToGrid(me.multiselectFilter,me.ruleGrid);
                                me.syncDataToTree(me.multiselectGroup);
                            },
                            buttons : {
                                Ok : {
                                    click : function() {
                                        me.resetSelectedData(true);
                                        me.okCallBack.call(me);
                                        $(this).dialog("close");
                                    },
                                    'class' : 'orange',
                                    text : i18n['global.dialog.button.ok']
                                },
                                Cancel : {
                                    click : function() {
                                        $(this).dialog("close");
                                        me.resetSelectedData(false);
                                    },
                                    'class' : 'gray',
                                    text : i18n['global.dialog.button.cancel']
                                }
                            },
                            close: function(event, ui) {
                                me.resetSelectedData(false);
                                me.options.closeDialogCallBack && me.options.closeDialogCallBack.call(me);
                            }
                        });
                    },
                    initContactsData:function(){
                        var selectedContactView = this;
                        this.individualGrid.jqGrid({
                            url : EB_Common.Ajax.wrapperUrl("/bcTemplates/contacts/contact"),
//                            url : EB_Common.Ajax.wrapperUrl("/contacts/json"),
                            datatype : "json",
                            autoencode : true,
                            emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                            mtype : "get",
                            jsonReader : {
                                root : "data",
                                postData : {
                                    quicksearchvalue : ""
                                },
                                page : "currentPageNo",
                                total : "totalPageCount",
                                records : "totalCount",
                                repeatitems : false
                            },
                            height : 275,
                            autowidth: true,
                            colNames : [ i18n['contact.field.firstName'], i18n['contact.field.middleInitial'],i18n['contact.field.lastName'],i18n['contact.field.suffix'], i18n['contact.field.externalId'], "" ],
                            colModel : [
                                {name : 'firstName',index : 'firstName',width : 80},
                                {name : 'middleInitial',index : 'middleInitial',width : 90},
                                {name : 'lastName',index : 'lastName',width : 70},
                                {name : 'suffix',index : 'suffix',width : 50},
                                {name : 'externalId',index : 'externalId',width : 90},
                                {name : 'id',index : 'id',width : 80,hidden : true}
                            ],
                            sortname : 'lastName',
                            sortorder : 'asc',
                            viewrecords : false,
                            pager : selectedContactView.$("#individual_gridPager"),
                            multiselect : true,
                            rowNum : 10,
                            rowList : [ 10,25,50,100,200 ],
                            prmNames : {page : "pageNo",totalrows : "totalrows"},
                            onSelectAll : function(rowIds, status) {
                                selectedContactView.syncDataFromGrid(selectedContactView.multiselectIndividual,selectedContactView.individualGrid);
                            },
                            onSelectRow : function(rowId, status) {
                                selectedContactView.syncDataFromGrid(selectedContactView.multiselectIndividual,selectedContactView.individualGrid);
                            },
                            loadComplete : function() {
                                selectedContactView.syncDataToGrid(selectedContactView.multiselectIndividual,selectedContactView.individualGrid);
                            }
                        });
                        this.ruleGrid.jqGrid({
                            autoencode:true,
                            url : EB_Common.Ajax.wrapperUrl("/bcTemplates/contacts/filter"),
                            datatype : "json",
                            emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                            jsonReader : {root : "data",page : "currentPageNo",total : "totalPageCount",records : "totalCount",repeatitems : false},
                            height : 310,
                            autowidth: true,
                            colNames : [ i18n['contact.field.RuleName'], '' ],
                            colModel : [{name : 'name',index : 'name',width : 80},{name : 'id',index : 'id',width : 80,hidden : true}],
                            sortname : 'name',
                            sortorder : 'asc',
                            viewrecords : true,
                            pager : selectedContactView.$("#rule_gridPager"),
                            multiselect : true,
                            prmNames : {page : "pageNo",totalrows : "totalrows"},
                            onSelectAll : function(rowIds, status) {
                                selectedContactView.syncDataFromGrid(selectedContactView.multiselectFilter,selectedContactView.ruleGrid);
                            },
                            onSelectRow : function(rowId, status) {
                                selectedContactView.syncDataFromGrid(selectedContactView.multiselectFilter,selectedContactView.ruleGrid);
                            },
                            loadComplete : function() {
                                selectedContactView.syncDataToGrid(selectedContactView.multiselectFilter,selectedContactView.ruleGrid);
                            }
                        });
                        if(selectedContactView.treeObj) return;
                        EB_Common.Ajax.get("/contacts/groups/tree/json", {"selectedGroupIds":selectedContactView.selectedGroupIds}, function(data) {
                            var setting = {
                                check:{enable : true,chkStyle : "checkbox",chkboxType : { "Y" : "s", "N" : "s" }},
                                data:{
                                    keep:{ leaf : false, parent : false},
                                    key : {checked : "checked", children : "groups", name : "name", id : "id",title : ""}
                                },
                                edit:{  enable : false, drag : {  isCopy : false,isMove : true} },
                                view:{selectedMulti : true,autoExpand : true},
                                callback:{
                                    onCheck : function(event, treeId, treeNode) {
                                        selectedContactView.syncDataFromTree(selectedContactView.multiselectGroup);
                                    }
                                }
                            } || {};
                            var rootNode = {id : -1,name : "All Contact Groups",groups : data,open : true} || {};
                            selectedContactView.treeObj = $.fn.zTree.init(selectedContactView.groupTree,setting, rootNode);
                            selectedContactView.syncDataToTree(selectedContactView.multiselectGroup);
                        }, 'json');
                    },
                    getData:function(){
                        return this.model.toJSON();
                    }
                },
                getInstance:function(_options){
                    var options = $.extend(true,{},_options||{});
                    var Model = Backbone.Model.extend(this.SelectedContactModel);

                    var selectedContactModel = null;
                    if(options.url){
                        selectedContactModel=new Model(null,{url:options.url});
                    }else{
                        selectedContactModel=options.model;
                    }
                    var View = EB_Common.Backbone.View.extend(this.SelectedContactView);
                    return new View({model:selectedContactModel,selectedGroupIds:options.selectedGroupIds,
                        okCallBack:options.okCallBack,closeDialogCallBack:options.closeDialogCallBack});
                }
            }
        },
        ContactAppModel:Backbone.Model.extend({
            defaults:function(){
                return {
                    load:false,
                    hadOpenDialog:false,
                    contactsCount:0,
                    groupsCount:0,
                    filtersCount:0,
                    shapesCount:0,
                    selectedGroupIds:"",
                    ignore:false
                };
            },
            initialize:function () {
                if(arguments && arguments.length>1 && arguments[1].url){
                    this.urlRoot=arguments[1].url;
                }
            },
            parse:function(response){
                var contactApp = {
                    load:true,
                    contactsCount:response.contactsCount||0,
                    groupsCount:response.groupsCount||0,
                    filtersCount:response.filtersCount||0,
                    shapesCount:response.shapesCount||0,
                    selectedGroupIds:response.selectedGroupIds||""
                };
                return contactApp;
            }
        }),
        ContactAppView:{
            subApps:{individualGroupFilter:null},
            initialize:function () {
                $.templates({
                    contactAppTemplate: $("#contactAppTemplate").html()
                });
                this.contactAppTemplate = $.render.contactAppTemplate;
                this.model.on("change:load",this.render,this);
                this.model.on("change:ignore",this.renderIgnore,this);
                this.model.on("change",this.renderCount,this);
                if(this.model.urlRoot)
                    this.model.fetch();
                else{
                    this.model.set({"load":true,"hadOpenDialog":false});
                }

            },
            render:function(){
                this.model.set("isDialog",this.options.isDialog);
                this.$el.html(this.contactAppTemplate(this.getIdSuffixModelJSON()));
                if(this.options.isView===false){
                    this.$el.hide();
                }
                var contactsCount = this.model.get("contactsCount");
                var groupsCount = this.model.get("groupsCount");
                var filtersCount = this.model.get("filtersCount");
                var shapesCount = this.model.get("shapesCount");
                if(contactsCount || groupsCount || filtersCount || shapesCount){
                    this.$("#errSelContactMessage").val(true);
                }
                this.options.loadSuccess&&this.options.loadSuccess.apply(this);
                if(this.options.lazyLoadUniverseApp){
                    this.subApps.universeApp = EB_View.universe.UniverseApp.getInstance(this.options.lazyLoadUniverseApp);
                }
                return this;
            },
            renderIgnore:function(){
                if(this.model.get("ignore")){
                    this.$("#errSelContactMessage").addClass("ignore");
                }else{
                    this.$("#errSelContactMessage").removeClass("ignore");
                }
            },
            renderCount:function(){
                var contactsCount = this.model.get("contactsCount");
                var groupsCount = this.model.get("groupsCount");
                var filtersCount = this.model.get("filtersCount");
                var shapesCount = this.model.get("shapesCount");
                this.$("#individuals").text(contactsCount);
                this.$("#groups").text(groupsCount);
                this.$("#rule").text(filtersCount);
                this.$("#mapContactsCount").text(shapesCount);
                var hasContacts = false;
                if((!isNaN(contactsCount)&&contactsCount)||(!isNaN(groupsCount)&&groupsCount)||(!isNaN(filtersCount)&&filtersCount)||(!isNaN(shapesCount)&&shapesCount)){
                    hasContacts = true;
                    this.$("#errSelContactMessage").val("true");
                }else{
                    hasContacts = false;
                    this.$("#errSelContactMessage").val("");
                }
                if($.isFunction(this.options.selectContactCallback)){
                    this.options.selectContactCallback.call(this,hasContacts);
                }
                if(!this.model.get("hadOpenDialog")){
                    this.model.set({hadOpenDialog:true},{silent:true});
                    return;
                }
                if(!this.$("#errSelContactMessage").hasClass("ignore"))
                	this.$("#errSelContactMessage").valid();
            },
            events:function(){
                var events = {
                    "click #contactNavContainer>div":"openSelectDialog"
                }
                return this.dealEvents(events,this.cid);
            },
            ignoreValidate:function(isIgnored){
                if(isIgnored===true){
                    this.$("#errSelContactMessage").errorCancel().addClass("ignore").val("");
                }else{
                    var contactsCount = this.model.get("contactsCount");
                    var groupsCount = this.model.get("groupsCount");
                    var filtersCount = this.model.get("filtersCount");
                    var shapesCount = this.model.get("shapesCount");
                    if(contactsCount || groupsCount || filtersCount || shapesCount){
                        this.$("#errSelContactMessage").val(true);
                    }else{
                        this.$("#errSelContactMessage").val("");
                    }
                    if(this.$("#errSelContactMessage").hasClass("ignore")) {
	                    this.$("#errSelContactMessage").removeClass("ignore");
	                    this.$("#errSelContactMessage").valid();
                    }

                }
            },
            openSelectDialog:function(e){
                if(this.options.isEdit===false){
                    return this;
                }
                var j = $(e.target);
                if(!j.is("div")){j = j.parent();}
                if(!(j.attr("id")) || j.attr("id").indexOf("map")==-1){
                    if(this.subApps.individualGroupFilter){
                        var index = parseInt(j.attr("data-index"))-1;
                        EB_Common.logger.log(this.subApps.individualGroupFilter.$el);
                        this.subApps.individualGroupFilter.$el.dialog("open");
                        this.subApps.individualGroupFilter.changeContactType(index);
                    }
                }else{
                    if(!this.subApps.universeApp){
                        var options = this.subApps.universeAppOptions;
                        if(options){
                            if(options.isDialog){
                                options.loadSuccess = function(){
                                    this.$el.dialog("open");
                                };
                            }
                            this.subApps.universeApp = EB_View.universe.UniverseApp.getInstance(options);
                        }
                    }else{
                        if(this.subApps.universeApp.model.get("isDialog")){
                            this.subApps.universeApp.$el.dialog("open");
                        }
                    }
                }
            },
            getData:function(){
                var model = this.model.toJSON();
                model.load = false;
                var data={numData:model,contactsData:{load:false,contacts:[],groups:[],filters:[],gisContactsData:{}}} || {};
                if(this.subApps.individualGroupFilter){
                    data.contactsData = this.subApps.individualGroupFilter.getData();
                    data.contactsData.load = false;
                }
                if(this.subApps.universeApp){
                    data.gisModelData = this.subApps.universeApp.getData();
                    data.gisContactsData = data.gisModelData.tempStorage.selectedData;
                }else if(this.subApps.universeAppOptions){
                    data.gisModelData = $.extend({},this.subApps.universeAppOptions);
                    data.gisContactsData = $.extend({},this.subApps.universeAppOptions.originalGisData||{});
                }
                return $.extend(true,{},data);
            },
            getJsonData:function(parentObj){
                var data = this.getData();
                var cIds = [],gIds=[],fIds=[];
                $.each(data.contactsData.contacts,function(i,c){cIds.push(c.id);});
                $.each(data.contactsData.groups,function(i,g){gIds.push(g.id);});
                $.each(data.contactsData.filters,function(i,f){fIds.push(f.id);});
                parentObj.broadcastContacts = {
                    contactIds:cIds,
                    groupIds:gIds,
                    filterIds:fIds,
                    filterRulesJson:(data.gisContactsData.filterRules &&data.gisContactsData.filterRules.length)?data.gisContactsData.filterRules:"",
                    polygonsJson:data.gisContactsData.polygons||"",
                    polygonIsIncludesJson:data.gisContactsData.polygonIsIncludes||"",
                    excludedContactIds:data.gisContactsData.excludedContactIds||[]
                };
                if(data.gisContactsData.contactSearchCondition){
                    parentObj.broadcastContacts.contactSearchCondition = data.gisContactsData.contactSearchCondition;
                }else{
                    parentObj.broadcastContacts.filterRulesJson = "";
                    parentObj.broadcastContacts.polygonsJson = "";
                    parentObj.broadcastContacts.polygonIsIncludesJson = "";
                    parentObj.broadcastContacts.excludedContactIds = [];
                }
                return parentObj;
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{container:$("body")},_options||{});
            var contactAppModel = null;
            if(options.url){
                contactAppModel = new this.ContactAppModel(null,{url:options.url});
            }else if(options.model){
                contactAppModel = options.model;
            }else if(options.modelData){
                contactAppModel = new this.ContactAppModel(options.modelData);
            }

            var View = EB_Common.Backbone.View.extend($.extend(true,{},this.ContactAppView));
            var view = new View({
                el:options.container,
                model:contactAppModel,
                isDialog:options.isDialog,
                isView:options.isView,
                isEdit:options.isEdit,
                loadSuccess:options.loadSuccess,
                selectContactCallback:options.selectContactCallback
            });
            return view;
        }
    }
})(EB_View,i18n);