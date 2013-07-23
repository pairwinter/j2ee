(function(view,i18n){
    view.universe.apps = {};
    view.universe.apps.GisPanelApp={
        GisPanelView : {
            jDom:{},
            initialize:function(){
                $.templates({
                    universeAppToolPanelTemplate: $("#universeAppToolPanelTemplate").html(),
                    universeAppToolPanelLiTemplate: $("#universeAppToolPanelLiTemplate").html()
                });
                this.universeAppToolPanelTemplate = $.render.universeAppToolPanelTemplate;
                this.universeAppToolPanelLiTemplate = $.render.universeAppToolPanelLiTemplate;
                this.model.on("change:controls",this.renderControls,this);
                this.render();
            },
            render:function(){
                this.model.set("isDialog",this.options.control.universeApp.model.get("isDialog"));
                this.$el.html(this.universeAppToolPanelTemplate(this.getIdSuffixModelJSON()));
                this.jDom.ul = this.$("#everbridge_gis_panel_body_ul");
                return this;
            },
            renderControls:function(){
                var controls = this.model.get("controls");
                var lis = [];
                for (var i = 0; i < controls.length; i++) {
                    var c=controls[i];
                    if (!((typeof c.displayInPanel) == "undefined" || c.displayInPanel)) {
                        continue;
                    }else{
                        lis.push({
                            placeholder:c.placeholder || false,
                            controlId:c.id,
                            text:c.text,
                            _class : c.displayClass+"Li "+ c.displayClass+"ItemInactive"
                        });
                    }

                }
                this.jDom.ul.html(this.universeAppToolPanelLiTemplate(lis));
                this.jDom.excludeContactNumDom = this.jDom.ul.find(".olControlExcludeContactsLi").children().eq(0);
                // map.addControl() has already been called on the panel
                var map  = this.options.control.map;
                if (map) {
                    for (var i = 0; i < controls.length; i++) {
                        map.addControl(controls[i]);
                        controls[i].deactivate();
                    }
                }
            },
            renderExcludeContactsNum:function(num){
                var text = this.jDom.excludeContactNumDom.text();
                this.jDom.excludeContactNumDom.text(text=text.replace(/\d+/,num||0));
            },
            events:function(){
                var events = {
                    "click #everbridge_gis_panel_open_close":"eventClickGisPanelOpenClose",
                    "click #triggerSelectContacts":"eventClickSelectContacts",
                    "click #send_notification_btn":"eventClickSendNotification",
                    "click #selectHasChanged":"eventClickSelectHasChanged",
                    "click #everbridge_gis_panel_body_ul>li":"eventClickControlLi"
                }
                return this.dealEvents(events,this.cid);
            },
            eventClickGisPanelOpenClose:function(e){
                var head= $(e.currentTarget);
                if(head.hasClass("everbridge_gis_panel_open")){
                    head.removeClass("title-tri_white_down").addClass("title-tri_white_up");
                    head.removeClass("everbridge_gis_panel_open");
                    this.$("#everbridge_gis_panel_body").hide();
                }else{
                    head.removeClass("title-tri_white_up").addClass("title-tri_white_down");
                    head.addClass("everbridge_gis_panel_open");
                    this.$("#everbridge_gis_panel_body").show();
                }
            },
            eventClickControlLi:function(e){
                var j = $(e.currentTarget),controlId = j.attr("controlId");
                var controls = this.model.get("controls");
                $.each(controls,function(i,control){
                    if(control.id==controlId){
                        control.activate();
                    }else{
                        control.deactivate();
                    }
                });
            },
            eventClickSelectContacts:function(){
                this.options.control.modelData.tempStorage.controls.everbridgeSelectedContacts.activate();
            },
            eventClickSendNotification:function(){
                this.options.control.universeApp.newNotificationButtonCallBack();
            },
            eventClickSelectHasChanged:function(){
                this.options.control.universeApp.closeDialog();
                this.options.control.universeApp.syncData();
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var View = EB_Common.Backbone.View.extend(this.GisPanelView);
            return new View({el:options.container,model:options.model,control:options.control});
        }
    };
    view.universe.apps.BaseMapLayerSwitcherApp={
        BaseMapLayerSwitcherView:{
            jDom:{},
            initialize:function(){
                $.templates({
                    universeAppBaseMapLayerSwitcherTemplate: $("#universeAppBaseMapLayerSwitcherTemplate").html(),
                    universeAppBaseMapLayerSwitcherUlTemplate: $("#universeAppBaseMapLayerSwitcherUlTemplate").html()
                });
                this.universeAppBaseMapLayerSwitcherTemplate = $.render.universeAppBaseMapLayerSwitcherTemplate;
                this.universeAppBaseMapLayerSwitcherUlTemplate = $.render.universeAppBaseMapLayerSwitcherUlTemplate;
                this.model.on("change:layers",this.renderLayers,this);
                this.render();
            },
            render:function(){
                this.$el.html(this.universeAppBaseMapLayerSwitcherTemplate(this.getIdSuffixModelJSON()));
                this.jDom.ul = this.$("#basemapUl");
                return this;
            },
            renderLayers:function(){
                var layers = this.model.get("layers");
                this.jDom.ul.html(this.universeAppBaseMapLayerSwitcherUlTemplate(layers));
            },
            events:function(){
                var events = {
                    "change #basemapUl input":"eventChangeBaseLayer"
                }
                return this.dealEvents(events,this.cid);
            },
            eventChangeBaseLayer:function(e){
                var j = $(e.target),layerId = j.attr("layerId"),layers = this.model.get("layers"),view=this;
                $.each(layers,function(i,layer){
                    if(layer.id==layerId){
                        view.options.control.map.setBaseLayer(layer);
                    }
                });
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var baseMapLayerSwitcher = options.model;
            var View = EB_Common.Backbone.View.extend(this.BaseMapLayerSwitcherView);
            return new View({el:options.container,model:baseMapLayerSwitcher,control:options.control});
        }
    };
    view.universe.apps.DisplayLayerSwitcherApp={
        DisplayLayerSwitcherView:{
            jDom:{},
            initialize:function(){
                $.templates({
                    universeAppDisplayLayerTemplate: $("#universeAppDisplayLayerTemplate").html()
                });
                this.universeAppDisplayLayerTemplate = $.render.universeAppDisplayLayerTemplate;
                this.render();
            },
            render:function(){
                this.$el.html(this.universeAppDisplayLayerTemplate(this.getIdSuffixModelJSON()));
                this.jDom.layersTree = this.$("#layersTree");
                this.loadLayersTree();
                return this;
            },
            loadLayersTree:function(){
                var view = this,referenceResources=this.model.get("referenceResources");
                var setting = {
                    check:{enable : true,chkStyle : "checkbox",chkboxType : { "Y" : "s", "N" : "s" }},
                    data:{
                        keep:{ leaf : false, parent : false},
                        key : {checked : "checked", children : "layers", name : "name", id : "id",title : ""}
                    },
                    edit:{  enable : false, drag : {  isCopy : false,isMove : true} },
                    view:{selectedMulti : true,autoExpand : true,showLine:false},
                    callback:{
                        onCheck : function(event, treeId, treeNode) {
                            view.clickLayerCallBack(treeNode);
                        }
                    }
                } || {};
                view.treeObj = $.fn.zTree.init(view.jDom.layersTree,setting,referenceResources);
            },
            clickLayerCallBack:function(treeNode){
                var isLayer = "Layer"==treeNode.type;
                var checked = treeNode.checked,map = this.options.control.map;
                var view = this;
                if(isLayer){
                    var id = treeNode.id;
                    var displayLayers = this.model.get("displayLayers")||[];
                    $.each(displayLayers,function(i,displayLayer){
                        if(displayLayer.sourceId==id){
                            view._changeLayerVisibility(map,displayLayer,checked);
                        }
                    });
                }else{
                    var layerIds = treeNode.layerIds;
                    for(var i= 0,l = layerIds.length;i<l;i++){
                        var id = layerIds[i];
                        var displayLayers = this.model.get("displayLayers")||[];
                        $.each(displayLayers,function(i,displayLayer){
                            if(displayLayer.sourceId==id){
                                view._changeLayerVisibility(map,displayLayer,checked);
                            }
                        });
                    }
                }
            },
            _changeLayerVisibility:function(map,layer,visibity){
                if(visibity && (!layer.xyzLayerId)){
                    map.addLayers(EB_View.universe.openlayers.tool.buildXYZLayers(layer));
                }
                var mapLayer = map.getLayer(layer.xyzLayerId);
                mapLayer && mapLayer.setVisibility(visibity);
            },
            events:function(){
                var events = {
                    "change #displayLayerUl input":"eventChangeDisplayLayer"
                }
                return this.dealEvents(events,this.cid);
            },
            eventChangeDisplayLayer:function(e){
                var id = e.target.value;
                var layer =this.options.control.map.getLayer(id);
                layer.setVisibility(e.target.checked);
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var model = options.model;
            var View = EB_Common.Backbone.View.extend(this.DisplayLayerSwitcherView);
            return new View({el:options.container,model:model,control:options.control});
        }
    };
    view.universe.apps.ContactsLayerSwitcherApp={
        ContactsLayerSwitcherView:{
            jDom:{},
            initialize:function(){
                $.templates({
                    universeAppContactsLayerTemplate: $("#universeAppContactsLayerTemplate").html()
                });
                this.universeAppContactsLayerTemplate = $.render.universeAppContactsLayerTemplate;
                this.model.on("change:contactsLayerType",this.renderContactsLayerType,this);
                this.model.on("change:groupIds",this.renderGroupIds,this);
                this.model.on("change:filterIds",this.renderFilterIds,this);
                this.model.on("change:recordTypeIds",this.renderRecordTypeIds,this);
                this.isShow = true;
                this.render();
            },
            render:function(){
                this.$el.html(this.universeAppContactsLayerTemplate(this.getIdSuffixModelJSON()));
                this.jDom.groupsTree = this.$("#groupsTree");
                var recordTypeIds = this.model.get("recordTypeIds")||[],groupIds = this.model.get("groupIds")||[],filterIds = this.model.get("filterIds")||[];
                this.loadGroupTree();
                if(this.model.get("isShowAllContacts")){
                    if(recordTypeIds.length){
                        if(!(groupIds.length || filterIds.length)){
                            this.model.trigger("change:recordTypeIds")
                        }
                    }else{
                        if(!(groupIds.length || filterIds.length)){
                            var contactRecordTypes =this.model.get("contactRecordTypes") || [];
                            var recordTypeIds2 = [];
                            $.each(contactRecordTypes,function(i,type){
                                recordTypeIds2.push(type.id);
                            });
                            if(contactRecordTypes.length){
                                this.model.set("recordTypeIds",recordTypeIds2);
                            }
                        }
                    }
                }
                return this;
            },
            showCheckedLayers:function(isShow){
                this.isShow = isShow;
                if(isShow){
                    var recordTypeIds = this.model.get("recordTypeIds")||[],groupIds = this.model.get("groupIds")||[],filterIds = this.model.get("filterIds")||[];
                    if(recordTypeIds.length){
                        this.model.trigger("change:recordTypeIds");
                    }else{
                        if(groupIds.length){
                           this.model.trigger("change:groupIds");
                        }
                        if(filterIds.length){
                            this.model.trigger("change:filterIds");
                        }
                    }
                }else{
                    var map = this.options.control.map;
                    $.each(map.layers,function(i,layer){
                        if(layer.CLASS_NAME=="OpenLayers.Layer.XYZ"){
                            layer.setVisibility(false);
                        }
                    });
                }
            },
            renderContactsLayerType:function(){
                var type = this.model.get("contactsLayerType") || "all";
                var map = this.options.control.map;
                if(type == "all"){
                    this.$("#recordTypeUl input").prop("disabled",false);
                    this.$("#allContacts").prop("checked",true);
                    this.$("#speContacts").prop("checked",false);
                    if(this.treeObj){
                        this.treeObj.checkAllNodes(false);
                        var nodes = this.treeObj.getNodes();
                        for (var i=0, l=nodes.length; i < l; i++) {
                            this.treeObj.setChkDisabled(nodes[i], true);
                        }
                    }
                    this.$("#contactFiltersUl :checkbox").prop("disabled",true).prop("checked",false);
                    this.model.set({"groupIds":[]});
                    this.model.set({"filterIds":[]});
                }else if(type=="specific"){
                    this.model.set({"recordTypeIds":[]});
                    this.$("#recordTypeUl input").prop("disabled",true);
                    if(this.model.get("isShowAllContacts")){
                        this.$("#allContacts").prop("checked",false);
                        var contactRecordTypes = this.model.get("contactRecordTypes") || [];
                        $.each(contactRecordTypes,function(i,type){
                            var layers = type.layers || [];
                            $.each(layers,function(j,layer){
                                if(layer.xyzLayerId){
                                    var mapLayer = map.getLayer(layer.xyzLayerId);
                                    mapLayer && mapLayer.setVisibility(false);
                                }
                            });
                        });
                    }
                    this.$("#speContacts").prop("checked",true);
                    var nodes = this.treeObj.getNodes();
                    for (var i=0, l=nodes.length; i < l; i++) {
                        this.treeObj.setChkDisabled(nodes[i], false);
                    }
                    this.$("#contactFiltersUl :checkbox").prop("disabled",false);
                }
            },
            renderRecordTypeIds:function(){
                var view =this,recordTypeIds = this.model.get("recordTypeIds") || [],map = this.options.control.map;
                this.$("#recordTypeUl :checkbox").each(function(){
                    this.checked = ($.inArray(parseInt(this.value),recordTypeIds)>-1);
                });
                if(!this.isShow) return;
                var recordTypeLayers = this.model.get("recordTypeLayers");
                $.each(recordTypeLayers,function(j,layer){
                    var visibity = $.inArray(layer.sourceId,recordTypeIds)>-1;
                    view._changeLayerVisibility(map,layer,visibity);
                });
            },
            renderGroupIds:function(){
                var view = this,treeObj =this.treeObj,groupIds = this.model.get("groupIds")||[],map = this.options.control.map;
                if(treeObj){
                    treeObj.checkAllNodes(false);
                    $.each(groupIds,function(i,id){
                        treeObj.checkNode(treeObj.getNodeByParam("id",id,null),true,false,false);
                    });
                }
                if(!this.isShow) return;
                var layers = this.model.get("groupLayers");
                $.each(layers,function(i,layer){
                    var visibity = $.inArray(layer.groupId,groupIds)>-1
                    view._changeLayerVisibility(map,layer,visibity);
                });
            },
            renderFilterIds:function(){
                var view = this,filterIds = this.model.get("filterIds")||[],map = this.options.control.map;
                this.$("#contactFiltersUl input[name=contactFilter]").each(function(){
                    this.checked = $.inArray(parseInt(this.value),filterIds)>-1;
                });
                if(!this.isShow) return;
                var contactFilters = this.model.get("contactFilters");
                $.each(contactFilters,function(i,filter){
                    var isShow = $.inArray(filter.id,filterIds)>-1;
                    var layers = filter.layers || [];
                    $.each(layers,function(j,layer){
                        view._changeLayerVisibility(map,layer,isShow);
                    });
                });
            },
            _changeLayerVisibility:function(map,layer,visibity){
                if(visibity && (!layer.xyzLayerId)){
                    map.addLayers(EB_View.universe.openlayers.tool.buildXYZLayers(layer));
                }
                var mapLayer = map.getLayer(layer.xyzLayerId);
                mapLayer && mapLayer.setVisibility(visibity);
            },
            loadGroupTree:function(){
                if(this.treeObj) return;
                var view = this;
                EB_Common.Ajax.get("/contacts/groups/tree/json", {"selectedGroupIds":""}, function(data) {
                    var setting = {
                        check:{enable : true,chkStyle : "checkbox",chkboxType : { "Y" : "s", "N" : "" }},
                        data:{
                            keep:{ leaf : false, parent : false},
                            key : {checked : "checked", children : "groups", name : "name", id : "id",title : ""}
                        },
                        edit:{  enable : false, drag : {  isCopy : false,isMove : true} },
                        view:{selectedMulti : true,autoExpand : true},
                        callback:{
                            onCheck : function(event, treeId, treeNode) {
                                view.clickGroupCallBack(treeNode);
                            }
                        }
                    } || {};
                    view.treeObj = $.fn.zTree.init(view.jDom.groupsTree,setting, data);
                    var nodes = view.treeObj.getNodes();
                    var groupIds = view.model.get("groupIds")||[],filterIds = view.model.get("filterIds")||[];
                    if(view.model.get("isShowAllContacts")){
                        if(groupIds.length || filterIds.length){
                            view.model.set("contactsLayerType","specific");
                            view.model.trigger("change:groupIds");
                            view.model.trigger("change:filterIds");
                        }else{
                            for (var i=0, l=nodes.length; i < l; i++) {
                                view.treeObj.setChkDisabled(nodes[i], true);
                            }
                        }
                    }else{
                        if(groupIds.length || filterIds.length){
                            view.model.set("contactsLayerType","specific");
                            this.$("#contactFiltersUl :checkbox").prop("disabled",false);
                            view.model.trigger("change:groupIds");
                            view.model.trigger("change:filterIds");
                        }else{
                            view.treeObj.checkAllNodes(true);
                            view.clickGroupCallBack();
                            var filterIds = [];
                            view.$("#contactFiltersUl :checkbox").each(function(){
                                $(this).prop("disabled",false);
                                filterIds.push(parseInt(this.value));
                            });
                            view.model.set("filterIds",filterIds);
                        }
                    }

                }, 'json');
            },
            clickGroupCallBack:function(treeNode){
                var groupIds=[],map = this.options.control.map;
                var nodes = this.treeObj.getCheckedNodes(true);
                for(var i=0;i<nodes.length;i++){
                    if(nodes[i].checked){
                        groupIds.push(nodes[i].id);
                    }
                }
                this.model.set({"groupIds":groupIds});
                if(treeNode && treeNode.checked){
                    var groupLayers = this.model.get("groupLayers") || [];
                    var contactFilters = this.model.get("contactFilters") || [];
                    var raiseSize = contactFilters.length + groupLayers.length;
                    $.each(groupLayers,function(i,layer){
                        if(layer.groupId == treeNode.id){
                            if(layer.xyzLayerId){
                                var mapLayer = map.getLayer(layer.xyzLayerId);
                                mapLayer && map.raiseLayer(mapLayer,raiseSize);
                            }
                            if(layer.utfLayerId){
                                var mapUtfLayer = map.getLayer(layer.utfLayerId);
                                mapUtfLayer && map.raiseLayer(mapUtfLayer,raiseSize);
                            }
                            map.resetLayersZIndex();
                        }
                    });
                }
                if(treeNode){
                    this.options.contactSearchConditionChangeCallBack && this.options.contactSearchConditionChangeCallBack.call(this);
                }
            },
            events:function(){
                var events = {
                    "change input[name^=recordType]":"eventChangeRecordType",
                    "change input[name=contactsLayerType]":"eventChangeContactsLayerType",
                    "change input[name=contactFilter]":"eventChangeContactFilter"
                }
                return this.dealEvents(events,this.cid);
            },
            eventChangeContactsLayerType:function(e){
                this.model.set("contactsLayerType", e.target.value);
                this.options.contactSearchConditionChangeCallBack && this.options.contactSearchConditionChangeCallBack.call(this);
            },
            eventChangeRecordType:function(e){
                this.model.set("sendRequest",true);
                var recordTypeIds = [];
                this.$("#recordTypeUl input:checked").each(function(){
                    recordTypeIds.push(parseInt(this.value));
                });
                this.model.set("recordTypeIds", recordTypeIds);
                this.options.contactSearchConditionChangeCallBack && this.options.contactSearchConditionChangeCallBack.call(this);
            },
            eventChangeContactFilter:function(e){
                var filterIds = [],id = e.target.value,map = this.options.control.map;
                this.$("#contactFiltersUl input[name=contactFilter]").each(function(){
                    if(this.checked){
                        filterIds.push(parseInt(this.value));
                    }
                });
                this.model.set("filterIds",filterIds);
                if(e.target.checked){
                    var groupLayers = this.model.get("groupLayers") || [];
                    var contactFilters = this.model.get("contactFilters") || [];
                    var raiseSize = contactFilters.length + groupLayers.length;
                    $.each(contactFilters,function(i,filter){
                        if(filter.id == id){
                            var layers = filter.layers || [];
                            $.each(layers,function(j,layer){
                                if(layer.xyzLayerId){
                                    var mapLayer = map.getLayer(layer.xyzLayerId);
                                    mapLayer && map.raiseLayer(mapLayer,raiseSize);
                                }
                                if(layer.utfLayerId){
                                    var mapUtfLayer = map.getLayer(layer.utfLayerId);
                                    mapUtfLayer && map.raiseLayer(mapUtfLayer,raiseSize);
                                }
                                map.resetLayersZIndex();
                            });
                            return false;
                        }
                    });
                }
                this.options.contactSearchConditionChangeCallBack && this.options.contactSearchConditionChangeCallBack.call(this);
            },
            getJsonData:function(){
                var contactSearchCondition = {};
                var modelData = this.model.toJSON();
                var groupIds = modelData.groupIds || [];
                var filterIds = modelData.filterIds || [];
                var recordTypeIds = modelData.recordTypeIds || [];
                var filters=[];
                if(recordTypeIds.length && (!(groupIds.length || filterIds.length))){
                    $.each(recordTypeIds,function(i,id){
                        var rules = [];
                        var o = {
                            type:"SYSTEM",
                            contactFieldId:9,
                            columnName:"recordTypeId",
                            dataType:"NUMBER",
                            columnValue:id,
                            contactFilterOption:"E"
                        };
                        rules.push(o);
                        filters.push(rules);
                    });
                    contactSearchCondition.filters = filters;
                }

                if(groupIds.length){
                    contactSearchCondition.groupIds = groupIds
                }
                if(filterIds.length){
                    contactSearchCondition.filterIds = filterIds
                }


//                if(this.$("#speContacts").prop("checked")){
//                    if(groupIds.length==0 && filterIds.length==0){
//                        contactSearchCondition.error = true;
//                    }
//                }else{
//                    if(!filters.length){
//                        contactSearchCondition.error = true;
//                    }
//                }

                if(recordTypeIds.length==0 && groupIds.length==0 && filterIds.length==0){
                    contactSearchCondition.error = true;
                }

                return contactSearchCondition
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var model = options.model;
            var View = EB_Common.Backbone.View.extend(this.ContactsLayerSwitcherView);
            return new View({
                el:options.container,
                model:model,
                control:options.control,
                contactSearchConditionChangeCallBack:options.contactSearchConditionChangeCallBack
            });
        }
    };
    view.universe.apps.SearchContactApp={
        SearchContacModel:{
            defaults:function(){
                return {
                    load:false,
                    contactFilters:[],
                    contactFilterRules:[],
                    filterRules:[]//array ,the filterRules that ware saved in the server silde.
                }
            },
            initialize:function(){
                if(arguments && arguments.length>1 && arguments[1].url){
                    this.urlRoot=arguments[1].url;
                }
            },
            parse:function(data){
                var d = {load:true};
                data.contactFilters = data.contactFilters || {};
                data.contactFilters = data.contactFilters.data || {};
                return $.extend(d,data);
            }
        },
        SearchContactView:{
            template:{},
            searchType:0,
            jDom:{},
            initialize:function(){
                $.templates({
                    universeAppSearchContactsTemplate: $("#universeAppSearchContactsTemplate").html(),
                    universeAppContactPointInfoTemplate: $("#universeAppContactPointInfoTemplate").html()
                });
                this.universeAppSearchContactsTemplate = $.render.universeAppSearchContactsTemplate;
                this.universeAppContactPointInfoTemplate = $.render.universeAppContactPointInfoTemplate;
                this.model.on("change:load",this.render,this);
                if(this.model.urlRoot){
                    this.model.fetch();
                }else{
                    this.model.set({load:false},{silent:true});
                    this.model.set({load:true});
                }
            },
            render:function(){
                var view = this;
                this.$el.addClass("everbridge_gis_search_contact").append(this.universeAppSearchContactsTemplate(this.getIdSuffixModelJSON()));
                this.jDom.ruleSelect = this.$("#ruleSelect");
                this.jDom.reviewFilter = this.$("#reviewFilter");
                this.renderFilterRules();
                return this;
            },
            renderPointInfo:function(contactPoint){
                return this.universeAppContactPointInfoTemplate([contactPoint]);
            },
            renderFilterRules:function(){
                var filterRules = this.model.get("filterRules")||[];
                if(!filterRules.length) return;
                this.$("#searchTypeContainer input:last").prop("checked",true).trigger("change");
                this.options.submitCallBack && this.options.submitCallBack.call(this,EB_Common.json.stringify(filterRules));
            },
            events:function(){
                var events = {
                    "change #searchTypeContainer input":"eventChangeSearchType",
                    "change #ruleSelect":"eventChangeRule"
                }
                return this.dealEvents(events,this.cid);
            },
            eventChangeSearchType:function(e){
                var view = this;
                var index = $(e.target).attr("data-index");
                this.searchType = parseInt(index);
                var currentDiv = this.$("#filerRuleContainer>div").eq(parseInt(index));
                currentDiv.show().siblings().hide();
                var filterRules = this.model.get("filterRules")||[];
                if(this.searchType==1 && !view.advancedSearchApp){
                    view.advancedSearchApp = EB_View.contact.advancedSearchApp.getInstance({
                        container:currentDiv,
                        exsitFilterRules:filterRules,
                        showSavedAsRule:false,
                        autoOpen:true,
                        needCloseBtn:false,
                        backgroupdColor:"#333333",
                        needForm:true,
                        callback:{
                            search:function(conditions,isFilterVal,filterName){
                                view.options.submitCallBack && view.options.submitCallBack.call(view,EB_Common.json.stringify(conditions));
                            },reset:function(conditions){
                                view.options.resetCallBack && view.options.resetCallBack.call(view);
                            }
                        }
                    });
                }
            },
            eventChangeRule:function(e){
                if(e.target.value=="0"){
                    this.jDom.reviewFilter.hide();
                    return;
                }
                this.jDom.reviewFilter.show();
                var view = this;
                if(view.advancedSearchFilterApp){
                    view.advancedSearchFilterApp.remove();
                }
                EB_Common.Ajax.get("/universe/fetchRulesByFilterId",{filterId:e.target.value},function(data){
                    view.advancedSearchFilterApp = EB_View.contact.advancedSearchApp.getInstance({
                            container:view.jDom.reviewFilter,
                            exsitFilterRules:data.contactFilterRules||[],
                            showSavedAsRule:false,
                            autoOpen:true,
                            needCloseBtn:false,
                            backgroupdColor:"#333333",
                            needForm:true,
                            callback:{
                                search:function(conditions,isFilterVal,filterName){
                                    view.options.submitCallBack && view.options.submitCallBack.call(view,EB_Common.json.stringify(conditions));
                                },reset:function(conditions){
                                    view.options.resetCallBack && view.options.resetCallBack.call(view);
                                }
                            }
                        });
                },"json");
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.SearchContacModel);
            var searchContacModel = null;
            if(options.url)
                searchContacModel = new Model(null,{url:options.url});
            else
                searchContacModel = options.model;
            var View = EB_Common.Backbone.View.extend(this.SearchContactView);
            return new View({el:options.container,model:searchContacModel,submitCallBack:options.submitCallBack,resetCallBack:options.resetCallBack});
        }
    };
    view.universe.apps.SearchLocationApp={
        SearchLocationModel:{
            defaults:function(){
                return {
                    load:false
                }
            }
        },
        SearchLocationView:{
            template:{},
            searchType:0,//address
            jDom:{},
            submitHandler:function(){
                var url = (this.searchType==0)?"/universe/searchLocationByAddress":"/universe/searchLocationByContact";
                var params = {};
                var contactSearchCondition = this.options.control.modelData.tempStorage.controls.everbridgeContactsLayerSwitcher.view.getJsonData();
                if(contactSearchCondition.error){
                    return;
                }else{
                    params.contactSearchCondition = JSON.stringify(contactSearchCondition);
                }
                if(this.searchType==0){
                    var value = $.trim(this.$("#location_input").val());
                    if(!value){
                        this.$("#location_input").focus();
                        return;
                    }
                    params.addressLine=value;
                }else{
                    var newFilters = [];
                    var firstName = this.$("input[name=firstName]").val();
                    var lastName = this.$("input[name=lastName]").val();
                    firstName = $.trim(firstName);
                    lastName = $.trim(lastName);
                    if(!firstName || !lastName){
                        return;
                    }
                    newFilters.push({columnName: "firstName",contactFieldId: "1",dataType: "STRING",displayFieldName: "First Name",displayName: "First Name",fieldName: "firstName",fieldValue: firstName,operator: "E",showType: "TEXT",type: "SYSTEM"});
                    newFilters.push({columnName: "lastName",contactFieldId: "2",dataType: "STRING",displayFieldName: "Last Name",displayName: "Last Name",fieldName: "lastName",fieldValue: lastName,operator: "E",showType: "TEXT",type: "SYSTEM"});
                    params.filterRules = EB_Common.json.stringify(newFilters);
                }
                var view = this;
                EB_Common.Ajax.post(EB_Common.Ajax.wrapperUrl(url),params,function(data){
                    var result={hasName:true}, resultsData =[];
                    if(view.searchType==0){
                        result.hasName=false;
                        if(data && data.addressDataPage){
                            resultsData = data.addressDataPage.data;
                            $.each(resultsData,function(i,r){
                                r.id = i;
                                r.address=r.addressLine;
                                r.originalInfo = r;
                            });
                        }
                    }else{
                        var contacts=data.contactDataPage.data;
                        $.each(contacts,function(i,contact){
                            var addresses=contact.address;
                            $.each(addresses||[],function(j,address){
                                if(address.gisLocation && address.gisLocation.lat && address.gisLocation.lon){
                                    address.contactName = contact.firstName+' '+contact.lastName;
                                    var addressInfo = [];
                                    address.streetAddress && addressInfo.push(address.streetAddress);
                                    address.suite && addressInfo.push(address.suite);
                                    address.city && addressInfo.push(address.city);
                                    address.state && addressInfo.push(address.state);
                                    address.postalCode && addressInfo.push(address.postalCode);
                                    address.country && addressInfo.push(address.country);
                                    resultsData.push({
                                        id:i+""+j,
                                        hasName:true,
                                        name:contact.firstName+' '+contact.lastName,
                                        "address":addressInfo.join(" "),
                                        originalInfo:address
                                    });
                                }
                            });
                        });
                    }
                    view.model.set("addresses",resultsData);
                    if(!resultsData.length){
                        view.$("#location_form_show").trigger("click");
                        view.$("#results_notexists").show().nextAll().hide();
                        return;
                    }
                    view.$("#results_notexists").hide().nextAll().show();
                    result.addresses=resultsData;
                    view.jDom.locationResultTable.html(view.universeAppSearchLocationResultTemplate([result]));
                    view.$("#location_form_show").trigger("click");
                    view.jDom.locationResultTable.find("tbody>tr:first").trigger("click");
                });
            },
            initialize:function(){
                $.templates({
                    universeAppSearchLocationTemplate: $("#universeAppSearchLocationTemplate").html(),
                    universeAppSearchLocationResultTemplate: $("#universeAppSearchLocationResultTemplate").html()
                });
                this.universeAppSearchLocationTemplate = $.render.universeAppSearchLocationTemplate;
                this.universeAppSearchLocationResultTemplate = $.render.universeAppSearchLocationResultTemplate;
                this.render();
            },
            render:function(){
                var view = this;
                this.$el.addClass("everbridge_gis_search_location").append(this.universeAppSearchLocationTemplate(this.getIdSuffixModelJSON()));
                this.jDom.locationForm = this.$("#location_form");
                this.jDom.locationResult = this.$("#location_result");
                this.jDom.locationResultTable = this.$("#location_result_table");
                return this;
            },
            events:function(){
                var events = {
                    "click #location_form_show":"eventClickShowForm",
                    "change #locationSearchTypeContainer>input":"eventChangeSearchType",
                    "keypress #location_input":"eventKeypressSearch",
                    "focus #location_input":"eventFocusSearch",
                    "blur #location_input":"eventBlurSearch",
                    "click #location_submit":"eventClickSearch",
                    "click #location_contact_submit":"eventClickSearch",
                    "keyup #location_contact_div input":"eventContactNameKeyup",
                    "blur #location_contact_div input":"eventContactNameKeyup",
                    "click #location_result_table tr":"eventClickResultTr",
                    "change input[name='locSearchMarker']":"listenSearchMarkerChange",
                    "keyup input[name='radius']":"listenRadiusChange",
                    "click #showLocationButton":"eventClickShow"
                }
                return this.dealEvents(events,this.cid);
            },
            eventClickShowForm:function(e){
                var j = $(e.currentTarget);
                if(this.jDom.locationForm.is(":hidden")){
                    j.html("&or;");
                    this.jDom.locationForm.show();
                    this.jDom.locationResult.hide();
                }else{
                    j.html("&and;");
                    this.jDom.locationForm.hide();
                    this.jDom.locationResult.show();
                }
            },
            eventChangeSearchType:function(e){
                this.searchType = (e.target.value=="address")?0:1;
                if(this.searchType==0){
                    this.$("#location_search_div").show().next().hide();
                }else{
                    this.$("#location_search_div").hide().next().show();
                }
                this.$("#searchTypeLable").html((e.target.value=="address")?i18n["universe.control.searchlocation.address"]:i18n["universe.control.searchlocation.contact"]);
            },
            eventClickSearch:function(){
                this.submitHandler();
            },
            eventKeypressSearch:function(e){
                if(e.keyCode==13){
                    this.submitHandler();
                }
            },
            eventFocusSearch:function(e){
                EB_Common.logger.log(e);
            },
            eventBlurSearch:function(e){
                EB_Common.logger.log(e);
            },
            eventContactNameKeyup:function(e){
                var firstName = this.$("input[name=firstName]").val();
                var lastName = this.$("input[name=lastName]").val();
                if($.trim(firstName) && $.trim(lastName)){
                    this.$("#location_contact_submit").addClass("orange").removeClass("gray").prop("disabled",false);
                }else{
                    this.$("#location_contact_submit").addClass("gray").removeClass("orange").prop("disabled",true);
                }
            },
            eventClickResultTr:function(e){
                var tr = $(e.currentTarget);
                var address = tr.find("input")[0];
                address.checked = true;
                this.addressId = address.value;
            },
            listenSearchMarkerChange:function(e){
                var markType= e.target.value;
                if(markType == "polygon"){
                    this.listenRadiusChange({target:{value:this.$("input[name='radius']").val()}});
                }else{
                    this.$("#showLocationButton").addClass("orange").removeClass("gray").prop("disabled",false);
                }
            },
            radiusReg : /^(([1-9][0-9]*)(\.[0-9]{1,2})?)$|^(0\.([1-9][0-9]?|[0-9][1-9]))$/,
            listenRadiusChange:function(e){
                var radius= e.target.value,reg = this.radiusReg;
                var markType=this.$("#location_actions input[name=locSearchMarker]:checked").val();
                if(markType == "polygon"){
                    if((!radius || !(reg.test(radius))) || !this.addressId){
                         this.$("#showLocationButton").addClass("gray").removeClass("orange").prop("disabled",true);
                    }else{
                        this.$("#showLocationButton").addClass("orange").removeClass("gray").prop("disabled",false);
                    }
                }else{
                    if(!this.addressId){
                        this.$("#showLocationButton").addClass("orange").removeClass("gray").prop("disabled",false);
                    }
                }
            },
            eventClickShow:function(e){
                var addresses=this.model.get("addresses"),address=null,view = this;
                if(!view.addressId){
                    return;
                }
                var radius = this.$("input[name='radius']").val(),reg = this.radiusReg;
                var markType=this.$("#location_actions input[name=locSearchMarker]:checked").val(), radius_units=this.$("select[name=radius_units]").val();
                if(markType == "polygon" && (!radius || !(reg.test(radius)))){
                    EB_Common.dialog.alert(i18n["universe.searchlocation.radiuserror"]);
                    return;
                }
                $.each(addresses,function(i,r){
                    if(r.id == view.addressId){
                        address = r.originalInfo;
                        return false;
                    }
                });
                if(address){
                    if(address.longitude && address.latitude){
                        address.gisLocation = {
                            lon : address.longitude,
                            lat :  address.latitude
                        }
                    }
                }
                address.location = $("#universeAppSearchLocationAddressInofTemplate").render([address]);

                var obj = {
                    markType:markType,
                    radius:radius,
                    radius_units:radius_units,
                    address : address
                }
                if(obj.markType=="polygon" &&!obj.radius){
                    return;
                }
                this.options.showCallBack && this.options.showCallBack.call(this,obj);
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.SearchLocationModel);
            var View = EB_Common.Backbone.View.extend(this.SearchLocationView);
            return new View({el:options.container,model:new Model(),control:options.control,showCallBack:options.showCallBack});
        }
    };
    view.universe.apps.PolygonToolApp={
        PolygonToolModel:{
            defaults:function(){
                return {
                    load:false
                }
            }
        },
        PolygonToolView:{
            template:{},
            jDom:{},
            initialize:function(){
                $.templates({
                    universeAppPolygonToolsTemplate: $("#universeAppPolygonToolsTemplate").html()
                });
                this.universeAppPolygonToolsTemplate = $.render.universeAppPolygonToolsTemplate;
                this.render();
            },
            render:function(){
                var view = this;
                this.$el.addClass("everbridge_gis_polygon_tools").append(this.universeAppPolygonToolsTemplate(this.getIdSuffixModelJSON()));
                return this;
            },
            events:function(){
                var events = {
                    "click .tool":"eventClickToolControl",
                    "click .paintbrush_size":"eventClickPaintbrushSize"
                }
                return this.dealEvents(events,this.cid);
            },
            eventClickToolControl:function(e){
                var j = $(e.currentTarget);
                this.options.clickFeatureControlCallBack && this.options.clickFeatureControlCallBack.call(this,j);
            },
            eventClickPaintbrushSize:function(e){
                var j = $(e.currentTarget);
                if(j.parents(".tool").hasClass("on")){
                    e.stopPropagation();
                }
                j.addClass("on").siblings().removeClass("on");
                this.options.clickPaintbrushSizeCallBack && this.options.clickPaintbrushSizeCallBack.call(this, j.attr("size"));
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.PolygonToolModel);
            var View = EB_Common.Backbone.View.extend(this.PolygonToolView);
            return new View({el:options.container,model:new Model(),clickFeatureControlCallBack:options.clickFeatureControlCallBack,clickPaintbrushSizeCallBack:options.clickPaintbrushSizeCallBack});
        }
    };
    view.universe.apps.RegionLibraryApp={
        RegionLibraryModel:{
            defaults:function(){
                return {
                    load:false
                }
            },
            initialize:function(){
                if(arguments && arguments.length>1 && arguments[1].url){
                    this.urlRoot=arguments[1].url;
                }
            },
            parse:function(data){
                var d = {load:true,library:null,regionLibrary:null},regionLibrary = data.regionLibraryDataPage.data;
                var allRegions = [];
                $.each(regionLibrary,function(i,library){
                    if(library.fileType=="FOLDER"){
                        library.folder=true;
                        library.regions = library.regions || [];
                        allRegions = allRegions.concat(library.regions);
                    }else{
                        library.region = true;
                        allRegions.push(library);
                    }
                });
                d.library = regionLibrary;
                d.allRegions = allRegions;
                return d;
            }
        },
        RegionLibraryView:{
            template:{},
            jDom:{},
            initialize:function(){
                $.templates({
                    universeAppRegionLibraryTemplate: $("#universeAppRegionLibraryTemplate").html()
                });
                this.universeAppRegionLibraryTemplate = $.render.universeAppRegionLibraryTemplate;
                this.model.on("change:load",this.render,this);
//                if(this.model.urlRoot){
//                    this.model.fetch();
//                }else{
//                    this.model.set({load:false},{silent:true});
//                    this.model.set({load:true});
//                }
            },
            render:function(){
                var view = this;
                this.$("#gis_region_library").remove();
                this.$el.addClass("everbridge_gis_region_library").append(this.universeAppRegionLibraryTemplate(this.getIdSuffixModelJSON()));

                view.options.eventCompleteCallBack && view.options.eventCompleteCallBack.call(view,view.model.get("library"));

                return this;
            },
            reload:function(){
                this.model.set({load:false},{silent:true});
                this.model.fetch();
            },
            events:function(){
                var events = {
                    "click a.expand_a":"eventClickExpand",
                    "click a.load":"eventClickLoad"
                }
                return this.dealEvents(events,this.cid);
            },
            eventClickExpand:function(e){
                var j = $(e.currentTarget);
                j.next().toggle();
            },
            eventClickLoad:function(e){
                var view = this,
                    j = $(e.currentTarget),
                    region=null,
                    regionId = j.attr("regionId"),
                    regionPath = j.attr("regionPath"),
                    regionType = j.attr("regionType"),
                    regions = this.model.get("allRegions");

                if(regionPath && regionType == 'Temporary Preview'){
                    EB_Common.Ajax.get("/settings/network/fetchRegionLibWithPolygons",{shapeFilePath:regionPath},function(data){
                        var region = data.regionLibrary;
                        view.options.loadRegionCallBack && view.options.loadRegionCallBack.call(view,region);
                    },"json");
                }else{
                    EB_Common.Ajax.get("/universe/fetchRegionLibWithPolygons",{regionId:regionId},function(data){
                        var region = data.regionLibrary;
                        view.options.loadRegionCallBack && view.options.loadRegionCallBack.call(view,region);
                    },"json");
                }

            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.RegionLibraryModel);
            var regionLibraryModel = null;
            if(options.url)
                regionLibraryModel = new Model(null,{url:options.url});
            else
                regionLibraryModel = options.model || (new Model());
            var View = EB_Common.Backbone.View.extend(this.RegionLibraryView);
            return new View({el:options.container,model:regionLibraryModel,loadRegionCallBack:options.loadRegionCallBack, eventCompleteCallBack: options.eventCompleteCallBack});
        }
    };
    view.universe.apps.SelectedContactsApp={
        SelectedContactsModel:{
            defaults:function(){
                return {
                    load:false,
                    polygonContactsNum:[],
                    librarys:[],
                    excludeContactNum:0
                }
            },
            initialize:function(){
                if(arguments && arguments.length>1 && arguments[1].url){
                    this.urlRoot=arguments[1].url;
                }
            },
            parse:function(data){
                var d = {load:true,polygonContactsNum:data.polygonCounts};
                return d;
            }
        },
        SelectedContactsView:{
            jDom:{},
            template:{},
            initialize:function(){
                $.templates({
                    universeAppSelectedContactsTemplate: $("#universeAppSelectedContactsTemplate").html(),
                    universeAppSelectedContactsPolygonsListTemplate: $("#universeAppSelectedContactsPolygonsListTemplate").html(),
                    universeAppSelectedContactsSaveToRegionTemplate: $("#universeAppSelectedContactsSaveToRegionTemplate").html()
                });
                this.template.universeAppSelectedContactsTemplate = $.render.universeAppSelectedContactsTemplate;
                this.template.universeAppSelectedContactsPolygonsListTemplate = $.render.universeAppSelectedContactsPolygonsListTemplate;
                this.template.universeAppSelectedContactsSaveToRegionTemplate = $.render.universeAppSelectedContactsSaveToRegionTemplate;
                this.model.on("change:load",this.renderPolygons,this);
                this.model.on("change:librarys",this.renderSaveTolibrary,this);
                this.model.on("change:excludeContactNum",this.renderExcludeContactNum,this);
                this.render();
            },
            render:function(){
                this.$el.addClass("everbridge_gis_selected_contacts").append(this.template.universeAppSelectedContactsTemplate(this.getIdSuffixModelJSON()));
                return this;
            },
            renderPolygons:function(){
                this.$("#polygonsListContainer").show().siblings().hide();
                var view = this;
                var polygonsInfo=[],polygonContactsNum=this.model.get("polygonContactsNum") || [],count= 0,gisPolygons = this.options.control.modelData.tempStorage.gisPolygons;
                $.each(gisPolygons,function(n,polygon){
                    //Polygons marked invalid should be skipped since they were not sent to the server in the first place
                    if (polygon.isInvalid) {
                        return;
                    }
                    polygonsInfo.push({polyName:polygon.polygonName+(count+1),polyId:n,numContacts:polygonContactsNum[count],isInclude:polygon.polygonType == "include"});
                    count++;
                });
                this.model.set({"polygonsInfo":polygonsInfo},{silent:true});
                this.$("#polygonsListContainer").empty().append(this.template.universeAppSelectedContactsPolygonsListTemplate(this.getIdSuffixModelJSON()));
                return this;
            },
            renderSaveTolibrary:function(){
                this.$("#polygonSaveToLibraryContainer").html(this.template.universeAppSelectedContactsSaveToRegionTemplate(this.getIdSuffixModelJSON()));
                this.$("#folderlist").combobox({
                    comboboxWidth : true
                });
                return this;
            },
            renderExcludeContactNum:function(){
                this.$("#openExcludeContactsController>span").text(this.model.get("excludeContactNum")||0);
            },
            removeAllPolygons:function(){
                this.$("#polygonsListTbody").empty();
                this.eventClickPolygonCheckbox();
                this.options.polygonRemoveCallBack && this.options.polygonRemoveCallBack.call(this.control);
            },
            events:function(){
                var events = {
                    "click #clearAll":"eventChangeClearAll",
                    "change input[name=selectAll]":"eventChangeSelectAll",
                    "change input[name=polygon]":"eventClickPolygonCheckbox",
                    "change select[name=polytype]":"eventChangePolygonType",
                    "click div.delete":"eventClickRemovePolygon",
                    "click a.polygon_contacts_info":"eventClickPolygonContactsInfo",
                    "click .backPolygonsList":"eventClickBack",
                    "click #polygonsListActions":"eventClickSaveToLibrary",
                    "click #saveLibrary":"eventClickSaveLibrary",
                    "click #openExcludeContactsController":"eventClickOpenExcludeContactsController"
                }
                return this.dealEvents(events,this.cid);
            },
            eventChangeClearAll:function(e){
                var view = this;
                EB_Common.dialog.confirm("Do you confirm to remove all polygons?","",function(){
                    view.removeAllPolygons();
                });
            },
            eventChangeSelectAll:function(e){
                this.$("input[name=polygon]").prop("checked", e.target.checked);
                if(!this.$("input[name=polygon]:checked").length){
                    this.$("#polygonsListActions").addClass("gray").removeClass("orange").prop("disabled",true);
                }else{
                    this.$("#polygonsListActions").removeClass("gray").addClass("orange").prop("disabled",false);
                }
            },
            eventClickPolygonCheckbox:function(){
                var length1=this.$("input[name=polygon]").length,length2=this.$("input[name=polygon]:checked").length
                this.$("input[name=selectAll]").prop("checked",(length1==length2)&&length2!=0);
                if(!length2){
                    this.$("#polygonsListActions").addClass("gray").removeClass("orange").prop("disabled",true);
                }else{
                    this.$("#polygonsListActions").removeClass("gray").addClass("orange").prop("disabled",false);
                }
            },
            eventChangePolygonType:function(e){
                var j = $(e.currentTarget);
                var isInclude = e.currentTarget.value=="include",featureId = j.attr('data-polyId');
                this.options.polygonTypeChangeCallBack && this.options.polygonTypeChangeCallBack.call(this.control,featureId,isInclude);
            },
            eventClickRemovePolygon:function(e){
                var j = $(e.currentTarget),featureId = j.attr('data-polyId');
                j.parent().parent().parent().remove();
                this.eventClickPolygonCheckbox();
                this.options.polygonRemoveCallBack && this.options.polygonRemoveCallBack.call(this.control,[featureId]);
            },
            eventClickOpenExcludeContactsController:function(){
                this.options.control.modelData.tempStorage.controls.everbridgeExcludeContacts.activate();
                this.options.control.modelData.tempStorage.controls.everbridgeExcludeContacts.view.openListTab();
            },
            eventClickBack:function(e){
                this.$("#polygonsListContainer").show().siblings().hide();
            },
            eventClickPolygonContactsInfo:function(e){
                this.$("#polygonContactsListContainer").show().siblings().hide();
                var j = $(e.currentTarget),featureId = j.attr('data-polyId');
                var params = {},url=EB_Common.Ajax.wrapperUrl("/universe/fetchPolygonContacts");
                params = $.extend({},this.options.control.modelData.tempStorage.controls.everbridgeSearchContact.lastSearchParams||{});
                var points = [],_points=this.options.control.modelData.tempStorage.gisPolygons[featureId].components,len = _points.length;
                for(var i = 0 ; i<len;i++){
                    var lonLat = new OpenLayers.LonLat( _points[i].x ,_points[i].y ).transform(this.options.control.map.getProjectionObject(),this.options.control.modelData.latlon_proj);
                    points.push({x:lonLat.lon,y:lonLat.lat});
                }
                params.polygon = EB_Common.json.stringify(points);
                delete params.polygons;
                delete params.polygonIsIncludes;
                delete params.excludedContactIds;

                if(params.contactSearchCondition){
                    params.contactSearchCondition = JSON.stringify(params.contactSearchCondition);
                }
                if(!this.loadJqgrid){
                    this.$("#polygonContactsListGrid").jqGrid({
                        url:url,
                        mtype:"post",
                        postData: params,
                        datatype: "json",
                        emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                        contentType: "application/json",
                        jsonReader : {
                            root: "polygonContactsDataPage.data",
                            page: "polygonContactsDataPage.currentPageNo",
                            total: "polygonContactsDataPage.totalPageCount",
                            records: "polygonContactsDataPage.totalCount",
                            repeatitems: false
                        },
                        autowidth : true,
                        rowNum: 10,
                        rowList: [10],
                        colNames:[i18n["universe.userinfo.firstName"],i18n["universe.userinfo.lastName"], i18n["universe.userinfo.address"]],
                        colModel:[
                            {name:'firstName',sortable:false,width:150},
                            {name:'lastName',sortable:false,width:130},
                            {name:'geoSearchAddress.0.streetAddress',sortable:false,width:238}
                        ],
                        autoWidth:false,
                        height:250,
                        monitorResize:false,
                        viewrecords:true,
                        sortable:false,
                        pager:"#polygonContactsListGridPager"+this.cid,
                        caption: "",
                        prmNames : {
                            page:"pageNo",
                            rows:"pageSize"
                        }
                    });
                    this.loadJqgrid=true;
                    $("#polygonContactsListGrid").jqGrid('setGridWidth', 530);
                }else{
                    this.$("#polygonContactsListGrid").clearGridData();
                    this.$("#polygonContactsListGrid").jqGrid('setGridParam',{url:url,postData:params}).trigger("reloadGrid",[{page:1}]);
                }
            },
            eventClickSaveToLibrary:function(e){
                var view = this;
                EB_Common.Ajax.get("/universe/fetchRegionLib",null,function(data){
                    var regionLibrary = data.regionLibraryDataPage.data,allFolders = [];
                    $.each(regionLibrary,function(i,library){
                        if(library.fileType=="FOLDER"){
                            allFolders.push(library);
                        }
                    });
                    if(!allFolders.length){
                        view.model.trigger("change:librarys");
                    }else{
                        view.model.set("librarys",allFolders);
                    }
                    view.$("#polygonSaveToLibraryContainer").show().siblings().hide();
                },"json");
            },
            eventClickSaveLibrary:function(e){
                var view = this;
                var polygon_points = [],is_includes = [],gisPolygons = this.options.control.modelData.tempStorage.gisPolygons,map = this.options.control.map,latlon_proj = this.options.control.modelData.latlon_proj;
                this.$("input[name=polygon]:checked").each(function(){
                    var poly_id = $(this).val();
                    var _points = gisPolygons[poly_id].components;
                    var len = _points.length;
                    var points = [];
                    for(var i = 0 ; i<len;i++){
                        var lonLat = new OpenLayers.LonLat( _points[i].x ,_points[i].y ).transform(map.getProjectionObject(),latlon_proj);
                        points.push({x:lonLat.lon,y:lonLat.lat});
                    }
                    polygon_points.push(points);
                    is_includes.push(gisPolygons[poly_id].polygonType == 'include' ? true : false);
                });
                var data = {
                    regionName: $.trim(this.$("input[name=regionName]").val()),
                    folderName: $.trim(this.$("input[name=folderName]").val()),
                    polygons : EB_Common.json.stringify(polygon_points),
                    polygonIsIncludes: EB_Common.json.stringify(is_includes)
                };
                if(!data.regionName){
                    EB_Common.dialog.alert(i18n["universe.regionlibrary.saveerror"]);
                    return;
                }
                EB_Common.Ajax.post("/universe/saveRegion",data,function(data){
                    if(data.jsonResult.success){
                        view.$("#polygonsListContainer").show().siblings().hide();
                        view.options.saveRegionCallBack && view.options.saveRegionCallBack.call();
                    }else{
                        EB_Common.dialog.alert(data.jsonResult.message);
                    }
                },"json");
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.SelectedContactsModel);
            var selectedContactsModel = null;
            if(options.url)
                selectedContactsModel = new Model(null,{url:options.url});
            else
                selectedContactsModel = options.model || (new Model());
            var View = EB_Common.Backbone.View.extend(this.SelectedContactsView);
            return new View({
                el:options.container,
                model:selectedContactsModel,
                control:options.control,
                polygonTypeChangeCallBack:options.polygonTypeChangeCallBack,
                polygonRemoveCallBack:options.polygonRemoveCallBack,
                saveRegionCallBack:options.saveRegionCallBack
            });
        }
    };
    view.universe.apps.ExcludeContactApp={
        ExcludeContactModel:{
            defaults:function(){
                return {
                    load:false,
                    excludedContactIds:[],
                    isSubmit:true
                }
            }
        },
        ExcludeContactView:{
            template:{},
            jDom:{},
            initialize:function(){
                $.templates({
                    universeAppExcludeContactsTemplate: $("#universeAppExcludeContactsTemplate").html()
                });
                this.template.universeAppExcludeContactsTemplate = $.render.universeAppExcludeContactsTemplate;
                this.model.on("change:excludedContactIds",this.changeExcludedContactIdsTrigger,this);
                this.render();
            },
            render:function(){
                var view = this;
                this.$el.addClass("everbridge_gis_exclude_contacts").append(this.template.universeAppExcludeContactsTemplate(this.getIdSuffixModelJSON()));
                this.jDom.contactsGrid = this.$("#exclude_contacts_grid");
                this.jDom.excludedContactsGrid = this.$("#excluded_contacts_list_grid");
                return this;
            },
            changeExcludedContactIdsTrigger:function(){
                var excludedContactIds = this.model.get("excludedContactIds") ||[];
                this.options.control.modelData.tempStorage.gisPanelControl.view.renderExcludeContactsNum(excludedContactIds.length);
                this.options.control.modelData.tempStorage.controls.everbridgeSelectedContacts.view.model.set("excludeContactNum",excludedContactIds.length);
                if(!this.model.get("isSubmit")){
                    this.model.set("isSubmit",true);
                    this.loadExcludedContactsGrid();
                    return;
                }
                this.options.excludedContactIdsChangeCallBack && this.options.excludedContactIdsChangeCallBack.call(this);
                this.loadContactsGrid();
                this.loadExcludedContactsGrid();
            },
            reset:function(){
                this.model.set({excludedContactIds:[]},{silent:true});
                this.options.control.modelData.tempStorage.gisPanelControl.view.renderExcludeContactsNum(0);
                this.options.control.modelData.tempStorage.controls.everbridgeSelectedContacts.view.model.set("excludeContactNum",0);
                this.$("#exclude_contacts_input").val("");
                if(this.jDom.contactsGrid.hasLoad){
                    this.jDom.contactsGrid.jqGrid("clearGridData", false);
                }
                if(this.jDom.excludedContactsGrid.hasLoad){
                    this.jDom.excludedContactsGrid.jqGrid("clearGridData", false);
                }
                this.$("#exclude_button").addClass("gray").removeClass("orange").prop("disabled",true);
                this.$("#include_button").addClass("gray").removeClass("orange").prop("disabled",true);

            },
            updateExcludedContactsNum:function(){
                var excludedContactIds = this.model.get("excludedContactIds") ||[];
                this.options.control.modelData.tempStorage.gisPanelControl.view.renderExcludeContactsNum(excludedContactIds.length);
                this.options.control.modelData.tempStorage.controls.everbridgeSelectedContacts.view.model.set("excludeContactNum",excludedContactIds.length);
            },
            openListTab:function(){
                var j = this.$("#a_excluded_list_tab").addClass("mouse_out");
                j.siblings().removeClass("mouse_out");
                this.$("#"+ j.attr("tab")).show().siblings().hide();
            },
            events:function(){
                var events = {
                    "click #exclude_tab>a":"eventClickTab",
                    "click #exclude_contacts_submit":"eventClickSearchContact",
                    "keypress #exclude_contacts_input":"eventKeypressSearchContact",
                    "click #exclude_button":"eventClickExcludeButton",
                    "click #include_button":"eventClickIncludeButton",
                    "change #exclude_contact_search_type":"eventChangeSearchType"
                }
                return this.dealEvents(events,this.cid);
            },
            eventChangeSearchType:function(e){
                var type = e.target.value;
                if(type == "fullName"){
                    this.$("#searchhintaddress").hide();
                    this.$("#searchhintfullname").show();
                }else{
                    this.$("#searchhintaddress").show();
                    this.$("#searchhintfullname").hide();
                }
            },
            eventClickTab:function(e){
                var j = $(e.target).addClass("mouse_out");
                j.siblings().removeClass("mouse_out");
                this.$("#"+ j.attr("tab")).show().siblings().hide();
            },
            eventClickSearchContact:function(e){
                var type = this.$("#exclude_contact_search_type").val(),val = this.$("#exclude_contacts_input").val();
                var data = $.extend({},this.options.control.modelData.tempStorage.controls.everbridgeSearchContact.lastSearchParams||{});
                if(!$.trim(val)){
                    EB_Common.dialog.alert(i18n["universe.excludecontacts.inputemptyerror"]);
                    return;
                }
                if(!data.polygons){
                    EB_Common.dialog.alert(i18n["universe.excludecontacts.inputerror"]);
                    return;
                }
                var contactSearchCondition = data.contactSearchCondition;
                if(contactSearchCondition.error){
                    return;
                }else{
                    data.contactSearchCondition = JSON.stringify(contactSearchCondition);
                }
                var newFilters = [];
                if(type == "fullName"){
                    val = val.replace(/\s/," ");
                    val = $.trim(val);
                    var index = val.lastIndexOf(" ");
                    if(index==-1){
                        newFilters.push({columnName: "firstName",contactFieldId: "1",dataType: "STRING",displayFieldName: "First Name",displayName: "First Name",fieldName: "firstName",fieldValue: val,operator: "LIKE",showType: "TEXT",type: "SYSTEM"});
                    }else{
                        var firstName = val.substring(0,index);
                        firstName = $.trim(firstName);
                        newFilters.push({columnName: "firstName",contactFieldId: "1",dataType: "STRING",displayFieldName: "First Name",displayName: "First Name",fieldName: "firstName",fieldValue: firstName,operator: "LIKE",showType: "TEXT",type: "SYSTEM"});
                        var lastName = val.substring(index);
                        lastName = $.trim(lastName);
                        newFilters.push({columnName: "lastName",contactFieldId: "2",dataType: "STRING",displayFieldName: "Last Name",displayName: "Last Name",fieldName: "lastName",fieldValue: lastName,operator: "LIKE",showType: "TEXT",type: "SYSTEM"});
                    }
                }else{
                    newFilters.push({"type":"SYSTEM_OBJECT","contactFieldId":"104","columnName":"streetAddress","embeddedColumnName":"address","showType":"TEXT","dataType":"STRING","displayName":"Address-Street Address","displayFieldName":"address.streetAddress","fieldName":"address.streetAddress","operator":"LIKE","fieldValue":val});
                }

                if(data && data.filterRules){
                    var oldFilters = $.parseJSON(data.filterRules);
                    for(var i =0;i<newFilters.length;i++){
                        oldFilters.push(newFilters[i]);
                    }
                    data.filterRules = EB_Common.json.stringify(oldFilters);
                }else{
                    data.filterRules = EB_Common.json.stringify(newFilters);
                }
                this.loadContactsGrid(data);
                this.$("#exclude_contacts_grid_div").show();
            },
            eventKeypressSearchContact:function(e){
                if(e.keyCode != 13) return;
                this.eventClickSearchContact(e);
            },
            eventClickExcludeButton:function(e){
                var contactIds = this.jDom.contactsGrid.jqGrid('getGridParam','selarrrow')||[],excludedContactIds =[] ;
                for(var i = 0;i<contactIds.length;i++){
                    contactIds[i] = parseInt(contactIds[i]);
                }
                $.merge(excludedContactIds,this.model.get("excludedContactIds"));
                $.merge(excludedContactIds,contactIds);
                $.unique(excludedContactIds);
                for(var i=0;i<contactIds.length;){
                    this.jDom.contactsGrid.jqGrid( 'delRowData' , contactIds[i]);
                }
                this.model.set({"excludedContactIds":excludedContactIds});
                this.$("#exclude_button").addClass("gray").removeClass("orange").prop("disabled",true);
            },
            eventClickIncludeButton:function(e){
                var contactIds = this.jDom.excludedContactsGrid.jqGrid('getGridParam','selarrrow');
                var excludedContactIds = $.merge([],this.model.get("excludedContactIds"));
                excludedContactIds = jQuery.grep(excludedContactIds, function(n, i){
                    return $.inArray(n+"",contactIds)==-1;
                });
                this.model.set({"excludedContactIds":excludedContactIds});
            },
            loadContactsGrid:function(data){
                var view = this;
                if(this.jDom.contactsGrid.hasLoad){
                    if(data){
                        this.jDom.contactsGrid.jqGrid('setGridParam',{postData:data}).trigger("reloadGrid");
                    }else{
                        this.jDom.contactsGrid.trigger("reloadGrid");
                    }
                    return;
                }
                this.jDom.contactsGrid.jqGrid({
                    url:EB_Common.Ajax.wrapperUrl("/universe/filterContactsFromSearchedContacts"),
                    mtype:"post",
                    datatype: "json",
                    postData:data,
                    emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                    contentType: "application/json",
                    jsonReader : {
                        root: "contactsDataPage.data",
                        page: "contactsDataPage.currentPageNo",
                        total: "contactsDataPage.totalPageCount",
                        records: "contactsDataPage.totalCount",
                        repeatitems: false
                    },
                    autowidth : true,
                    rowNum: 10,
                    rowList: [10,25,50,100,200],
                    colNames:[i18n["universe.userinfo.firstName"],i18n["universe.userinfo.lastName"],i18n["universe.userinfo.address"],i18n["universe.userinfo.suite"],i18n["universe.userinfo.city"],i18n["universe.userinfo.postcode"]],
                    colModel:[
                        {name:'firstName',sortable:false,width:150},
                        {name:'lastName',sortable:false,width:150},
                        {name:'geoSearchAddress.0.streetAddress',sortable:false,width:200},
                        {name:'geoSearchAddress.0.suite',sortable:false,width:200},
                        {name:'geoSearchAddress.0.city',sortable:false,width:100},
                        {name:'geoSearchAddress.0.postalCode',sortable:false,width:100}
                    ],
                    autoWidth:false,
                    height:250,
                    monitorResize:false,
                    viewrecords:true,
                    multiselect:true,
                    sortable:false,
                    pager:"#exclude_contacts_grid_pager"+this.cid,
                    caption: "",
                    prmNames : {
                        page:"pageNo",
                        rows:"pageSize"
                    },
                    afterInsertRow:function(id){
                        var check_cell = view.jDom.contactsGrid.getInd(id, true),excludedContactIds = view.model.get("excludedContactIds");
                        if (check_cell && check_cell.cells) {
                            var check_container = check_cell.cells[0].childNodes[0];
                            if($.inArray(parseInt(id),excludedContactIds)>-1){
                                $(check_container).prop("disabled",true).parent().parent().addClass("ui-state-disabled");
                            }
                        }
                    },
                    beforeSelectRow: function(id, e) {
                        var check_cell = view.jDom.contactsGrid.getInd(id, true);
                        if (check_cell && check_cell.cells) {
                            var check_container = check_cell.cells[0].childNodes[0];
                            var cc = $(check_container);
                            if(cc.prop("disabled")){
                                return false;
                            }
                        }
                        return true;
                    },
                    onSelectRow:function(id,status){
                        if(status){
                            view.$("#exclude_button").addClass("orange").removeClass("gray").prop("disabled",false);
                        }
                        else{
                            var contactIds = view.jDom.contactsGrid.jqGrid('getGridParam','selarrrow');
                            if(contactIds && contactIds.length>0){
                                view.$("#exclude_button").addClass("orange").removeClass("gray").prop("disabled",false);
                            }else{
                                view.$("#exclude_button").addClass("gray").removeClass("orange").prop("disabled",true);
                            }
                        }
                    },
                    onSelectAll:function(ids,status){
                        if(!status){
                            view.$("#exclude_button").addClass("gray").removeClass("orange").prop("disabled",true);
                        }else{
                            var contactIds = view.jDom.contactsGrid.jqGrid('getGridParam','selarrrow');
                            if(contactIds && contactIds.length>0){
                                view.$("#exclude_button").addClass("orange").removeClass("gray").prop("disabled",false);
                            }else{
                                view.$("#exclude_button").addClass("gray").removeClass("orange").prop("disabled",true);
                            }
                        }
                    }
                });
                view.jDom.contactsGrid.jqGrid('setGridWidth', 700);
                this.jDom.contactsGrid.hasLoad = true;
            },
            loadExcludedContactsGrid:function(){
                var view = this,excludedContactIds=this.model.get("excludedContactIds"),data = $.extend({},this.options.control.modelData.tempStorage.controls.everbridgeSearchContact.lastSearchParams||{});
                this.$("#include_button").addClass("gray").removeClass("orange").prop("disabled",true);;
                if(excludedContactIds.length==0 || (!data.polygons)) {
                    this.jDom.excludedContactsGrid.clearGridData();
                    this.model.set("excludedContactIds",[]);
                    return;
                };
                data.excludedContactIds = excludedContactIds;
                if(this.jDom.excludedContactsGrid.hasLoad){
                    var oldData = this.jDom.excludedContactsGrid.jqGrid('getGridParam');
                    if(oldData.postData && oldData.postData.excludedContactIds)
                        delete oldData.postData.excludedContactIds;
                    this.jDom.excludedContactsGrid.jqGrid('setGridParam',{postData:data}).trigger("reloadGrid");
                    return;
                }
                this.jDom.excludedContactsGrid.jqGrid({
                    url:EB_Common.Ajax.wrapperUrl("/universe/searchExcludeContacts"),
                    mtype:"post",
                    datatype: "json",
                    postData:data,
                    emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                    contentType: "application/json",
                    jsonReader : {
                        root: "contactsDataPage.data",
                        page: "contactsDataPage.currentPageNo",
                        total: "contactsDataPage.totalPageCount",
                        records: "contactsDataPage.totalCount",
                        repeatitems: false
                    },
                    autowidth : true,
                    multiselect:true,
                    rowNum: 10,
                    rowList: [10],
                    colNames:[i18n["universe.userinfo.firstName"],i18n["universe.userinfo.lastName"],i18n["universe.userinfo.address"],i18n["universe.userinfo.city"],i18n["universe.userinfo.state"]],
                    colModel:[
                        {name:'firstName',sortable:false,width:150},
                        {name:'lastName',sortable:false,width:150},
                        {name:'geoSearchAddress.0.streetAddress',sortable:false,width:200},
                        {name:'geoSearchAddress.0.city',sortable:false,width:100},
                        {name:'geoSearchAddress.0.state',sortable:false,width:100}
                    ],
                    autoWidth:false,
                    height:250,
                    monitorResize:false,
                    viewrecords:true,
                    sortable:false,
                    pager:"#excluded_contacts_list_grid_pager"+this.cid,
                    caption: "",
                    prmNames : {
                        page:"pageNo",
                        rows:"pageSize"
                    },
                    loadComplete:function(data){
                        var excludedContactIds = [];
                        if(data && data.excludedContactIds){
                            excludedContactIds = data.excludedContactIds;
                        }
                        view.model.set({"excludedContactIds":excludedContactIds},{silent:true});
                        view.updateExcludedContactsNum();
                    },
                    onSelectRow:function(id,status){
                        if(status){
                            view.$("#include_button").addClass("orange").removeClass("gray").prop("disabled",false);
                        }
                        else{
                            var contactIds = view.jDom.excludedContactsGrid.jqGrid('getGridParam','selarrrow');
                            if(contactIds && contactIds.length>0){
                                view.$("#include_button").addClass("orange").removeClass("gray").prop("disabled",false);
                            }else{
                                view.$("#include_button").addClass("gray").removeClass("orange").prop("disabled",true);
                            }
                        }
                    },
                    onSelectAll:function(ids,status){
                        if(!status){
                            view.$("#include_button").addClass("gray").removeClass("orange").prop("disabled",true);
                        }else{
                            var contactIds = view.jDom.excludedContactsGrid.jqGrid('getGridParam','selarrrow');
                            if(contactIds && contactIds.length>0){
                                view.$("#include_button").addClass("orange").removeClass("gray").prop("disabled",false);
                            }else{
                                view.$("#include_button").addClass("gray").removeClass("orange").prop("disabled",true);
                            }
                        }
                    }
                });
                this.jDom.excludedContactsGrid.hasLoad = true;
                this.jDom.excludedContactsGrid.jqGrid('setGridWidth', 700);
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.ExcludeContactModel);
            var View = EB_Common.Backbone.View.extend(this.ExcludeContactView);
            return new View({el:options.container,control:options.control,model:new Model(),excludedContactIdsChangeCallBack:options.excludedContactIdsChangeCallBack});
        }
    };

})(EB_View,i18n);