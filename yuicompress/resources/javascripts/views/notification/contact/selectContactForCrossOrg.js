(function(view,i18n){
    view.notification.app.ContactApp={
        SubUnits:{
            ContactItemApp:{
                ContactItemModel:{
                    defaults:function(){
                        return {
                            id:0,
                            firstName:"",
                            lastName:"",
                            content:""
                        };
                    }
                },
                ContactItemView:{
//                    tagName:"li",
                    initialize:function(){
                        if(!$.render.contactAppContactItemTemplate){
                            $.templates({
                                contactAppContactItemTemplate: $("#contactItemTemplate").html()
                            });
                        }
                        this.contactAppContactItemTemplate = $.render.contactAppContactItemTemplate;
                        this.model.on("destroy",this.remove,this);
                        this.model.on("remove",this.remove,this);
                        this.model.on("change:preRemoved",this.changePreRemoved,this);
                    },
                    render:function(){
                        this.$el.html(this.contactAppContactItemTemplate(this.getIdSuffixModelJSON()));
                        return this;
                    },
                    events: {
                        "click .remove": "remove",
                        "click :checkbox": "preRemove"
                    },
                    preRemove:function(e){
                        if($(e.currentTarget).prop("checked")){
                            this.model.set("preRemoved",true);
                        }else{
                            this.model.set("preRemoved",false);
                        }
                    },
                    changePreRemoved:function(model){
                        this.$(":checkbox").prop("checked",model.get("preRemoved"));
                    }

                }
            },
            GroupItemApp:{
                GroupItemModel:{
                    defaults:function(){
                        return {
                            id:0,
                            name:"",
                            content:""
                        };
                    }
                },
                GroupItemView:{
//                    tagName:"li",
                    initialize:function(){
                        if(!$.render.groupAppContactItemTemplate){
                            $.templates({
                                groupAppContactItemTemplate: $("#selectedItemTemplate").html()
                            });
                        }
                        this.groupAppContactItemTemplate = $.render.groupAppContactItemTemplate;
                        this.model.on("destroy",this.remove,this);
                        this.model.on("remove",this.remove,this);
                        this.model.on("change:preRemoved",this.changePreRemoved,this);
                    },
                    render:function(){
                        this.$el.html(this.groupAppContactItemTemplate(this.getIdSuffixModelJSON()));
                        return this;
                    },
                    events: {
                        "click .remove": "remove",
                        "click :checkbox": "preRemove"
                    },
                    preRemove:function(e){
                        if($(e.currentTarget).prop("checked")){
                            this.model.set("preRemoved",true);
                        }else{
                            this.model.set("preRemoved",false);
                        }
                    },
                    changePreRemoved:function(model){
                        this.$(":checkbox").prop("checked",model.get("preRemoved"));
                    }
                }
            },
            FilterItemApp:{
                FilterItemModel:{
                    defaults:function(){
                        return {
                            id:0,
                            name:"",
                            content:""
                        };
                    }
                },
                FilterItemView:{
//                    tagName:"li",
                    initialize:function(){
                        if(!$.render.filterAppFilterItemTemplate){
                            $.templates({
                                filterAppFilterItemTemplate: $("#selectedItemTemplate").html()
                            });
                        }
                        this.filterAppFilterItemTemplate = $.render.filterAppFilterItemTemplate;
                        this.model.on("destroy",this.remove,this);
                        this.model.on("remove",this.remove,this);
                        this.model.on("change:preRemoved",this.changePreRemoved,this);
                    },
                    render:function(){
                        this.$el.html(this.filterAppFilterItemTemplate(this.getIdSuffixModelJSON()));
                        return this;
                    },
                    events: {
                        "click .remove": "remove",
                        "click :checkbox":"preRemove"
                    },
                    preRemove:function(e){
                        if($(e.currentTarget).prop("checked")){
                            this.model.set("preRemoved",true);
                        }else{
                            this.model.unset("preRemoved");
                        }
                    },
                    changePreRemoved:function(model){
                        this.$(":checkbox").prop("checked",model.get("preRemoved"));
                    }

                }
            },
            OrgContactItemsApp:{
                OrgContactItemsModel:{
                    defaults:function(){
                        return {
                            id:0,
                            orgId:0,
                            orgName:"",
                            count:0
                        }
                    }
                },
                OrgContactItemsView:{
//                    tagName:"li",
                    initialize:function(){
                        this.grid = this.options.grid;
                        this.isCrossOrg=this.options.isCrossOrg;
                        if(!$.render.contactAppOrgContactItemsAppTemplate){
                            $.templates({
                                contactAppOrgContactItemsAppTemplate: $("#orgItemsAppTemplate").html()
                            });
                        }
                        this.contactAppOrgContactItemsAppTemplate = $.render.contactAppOrgContactItemsAppTemplate;
                        this.model.on("destroy",this.remove,this);
                        this.model.on("remove",this.remove,this);
                        this.model.on("change:preRemoved",this.preRemove,this);
                        this.model.on("change:count",this.countChange,this);
                        var ContactItemModel = Backbone.Model.extend(EB_View.notification.app.ContactApp.SubUnits.ContactItemApp.ContactItemModel);
                        var ContactItemCollection = Backbone.Collection.extend({model:ContactItemModel});
                        this.contactItemsCollection = new ContactItemCollection();
                        this.model.set("contactItemsCollection",this.contactItemsCollection);
                        this.contactItemsCollection.on("add",this.collectionAddOne,this);
                        this.contactItemsCollection.on("remove",this.clearItem,this);
                        this.contactItemsCollection.on("change:preRemoved",this.dealChirldrenChange,this);
                        this.ContactItemView = EB_Common.Backbone.View.extend(EB_View.notification.app.ContactApp.SubUnits.ContactItemApp.ContactItemView);
                    },
                    render:function(){
                        var renderData = this.getIdSuffixModelJSON();
                        renderData[0].isCrossOrg = this.isCrossOrg;
                        this.$el.html(this.contactAppOrgContactItemsAppTemplate(renderData));
                        return this;
                    },
                    collectionAddOne:function(model){
                        this.model.set("count",this.contactItemsCollection.length);
                        var view = new this.ContactItemView({model:model});
                        this.$("#orgItemsContainer").append(view.render().el);
                    },
                    events: {
                        "click .remove": "deleteItem",
                        "click .org_checkbox":"clickPreRemove"
                    },
                    clearItem: function(){
                        if(this.contactItemsCollection && this.contactItemsCollection.length){
                            this.model.set("count",this.contactItemsCollection.length);
                        }else{
                            this.collection.remove(this.model);
                        }
                    },
                    deleteItem: function(e){
                        var id = $(e.currentTarget).attr("dataId");
                        this.contactItemsCollection.remove({id:id});
                        this.grid.setSelection(id,false);
                    },
                    preRemove:function(model){
                        var checked = model.get("preRemoved");
                        this.contactItemsCollection.each(function(model){
                            model.set("preRemoved",checked);
                        });
                    },
                    clickPreRemove:function(e){
                        var checked =  $(e.currentTarget).prop("checked");
                        this.model.set("preRemoved",checked);
                    },
                    dealChirldrenChange:function(model){
                        if(this.contactItemsCollection.where({preRemoved:true}).length  === this.contactItemsCollection.length){
                            this.model.set({preRemoved:true},{silent:true});
                            this.$("#org_checkbox").prop("checked",true);
                        }else{
                            this.model.set({preRemoved:false},{silent:true});
                            this.$("#org_checkbox").prop("checked",false);
                        }
                    },
                    countChange:function(model){
                        this.$("#count").text(model.get("count"));
                    }
                }
            },
            OrgGroupItemsApp:{
                OrgGroupItemsModel:{
                    defaults:function(){
                        return {
                            id:0,
                            orgId:0,
                            orgName:""
                        }
                    }
                },
                OrgGroupItemsView:{
//                    tagName:"li",
                    initialize:function(){
                        this.ztree = this.options.ztree;
                        this.isCrossOrg = this.options.isCrossOrg;
                        if(!$.render.orgGroupTemplate){
                            $.templates({
                                orgGroupTemplate: $("#orgItemsAppTemplate").html()
                            });
                        }
                        this.orgGroupTemplate = $.render.orgGroupTemplate;
                        this.model.on("destroy",this.remove,this);
                        this.model.on("remove",this.remove,this);
                        this.model.on("change:preRemoved",this.preRemove,this);
                        var GroupItemsModel = Backbone.Model.extend(EB_View.notification.app.ContactApp.SubUnits.GroupItemApp.GroupItemModel);
                        var GrouItemsCollection = Backbone.Collection.extend({model:GroupItemsModel});
                        this.groupItemsCollection = new GrouItemsCollection();
                        this.model.set("groupItemsCollection",this.groupItemsCollection);
                        this.groupItemsCollection.on("add",this.collectionAddOne,this);
                        this.groupItemsCollection.on("remove",this.clearItem,this);
                        this.groupItemsCollection.on("change:preRemoved",this.dealChirldrenChange,this);
                        this.GroupItemView = EB_Common.Backbone.View.extend(EB_View.notification.app.ContactApp.SubUnits.GroupItemApp.GroupItemView);
                    },
                    render:function(){
                        var renderData = this.getIdSuffixModelJSON();
                        renderData[0].isCrossOrg = this.isCrossOrg;
                        this.$el.html(this.orgGroupTemplate(renderData));
                        return this;
                    },
                    collectionAddOne:function(model){
                        this.model.set("count",this.groupItemsCollection.length);
                        this.$("#count").text(this.model.get("count"));
                        var view = new this.GroupItemView({model:model});
                        this.$("#orgItemsContainer").append(view.render().el);
                    },
                    events: {
                        "click .remove": "deleteItem",
                        "click .org_checkbox":"clickPreRemove"
                    },
                    clearItem: function(){
                        if(this.groupItemsCollection && this.groupItemsCollection.length){
                            this.model.set("count",this.groupItemsCollection.length);
                            this.$("#count").text(this.model.get("count"));
                        }else{
                            this.collection.remove(this.model);
                        }
                    },
                    deleteItem: function(e){
                        var id = $(e.currentTarget).attr("dataId");
                        this.model.get("groupItemsCollection").remove({id:id});
                        var ztree = this.ztree;
                        if(ztree && ztree.getNodeByParam("id",id)){
                            ztree.checkNode(ztree.getNodeByParam("id",id),false,true,false);
                        }
                    },
                    preRemove:function(model){
                        var checked = model.get("preRemoved");
                        this.groupItemsCollection.each(function(model){
                            model.set("preRemoved",checked);
                        });
                    },
                    clickPreRemove:function(e){
                        var checked =  $(e.currentTarget).prop("checked");
                        this.model.set("preRemoved",checked);
                    },
                    dealChirldrenChange:function(model){
                        if(this.groupItemsCollection.where({preRemoved:true}).length === this.groupItemsCollection.length){
                            this.model.set({preRemoved:true},{silent:true});
                            this.$("#org_checkbox").prop("checked",true);
                        }else{
                            this.model.set({preRemoved:false},{silent:true});
                            this.$("#org_checkbox").prop("checked",false);
                        }
                    }
                }
            },
            OrgFilterItemsApp:{
                OrgFilterItemsModel:{
                    defaults:function(){
                        return {
                            id:0,
                            orgId:0,
                            orgName:""
                        }
                    }
                },
                OrgFilterItemsView:{
//                    tagName:"li",
                    initialize:function(){
                        this.grid = this.options.grid;
                        this.isCrossOrg = this.options.isCrossOrg;
                        if(!$.render.orgFilterTemplate){
                            $.templates({
                                orgFilterTemplate: $("#orgItemsAppTemplate").html()
                            });
                        }
                        this.orgFilterTemplate = $.render.orgFilterTemplate;
                        this.model.on("destroy",this.remove,this);
                        this.model.on("remove",this.remove,this);
                        this.model.on("change:preRemoved",this.preRemove,this);
                        var FilterItemModel = Backbone.Model.extend(EB_View.notification.app.ContactApp.SubUnits.FilterItemApp.FilterItemModel);
                        var FilterItemCollection = Backbone.Collection.extend({model:FilterItemModel});
                        this.filterItemsCollection = new FilterItemCollection();
                        this.model.set("filterItemsCollection",this.filterItemsCollection);
                        this.filterItemsCollection.on("add",this.collectionAddOne,this);
                        this.filterItemsCollection.on("remove",this.clearItem,this);
                        this.filterItemsCollection.on("change:preRemoved",this.dealChirldrenChange,this);
                        this.FilterItemView = EB_Common.Backbone.View.extend(EB_View.notification.app.ContactApp.SubUnits.FilterItemApp.FilterItemView);
                    },
                    render:function(){
                        var renderData = this.getIdSuffixModelJSON();
                        renderData[0].isCrossOrg = this.isCrossOrg;
                        this.$el.html(this.orgFilterTemplate(renderData));
                        return this;
                    },
                    collectionAddOne:function(model){
                        this.model.set("count",this.filterItemsCollection.length);
                        this.$("#count").text(this.model.get("count"));
                        var view = new this.FilterItemView({model:model});
                        this.$("#orgItemsContainer").append(view.render().el);
                    },
                    events: {
                        "click .remove": "deleteItem",
                        "click .org_checkbox":"clickPreRemove"
                    },
                    clearItem: function(model){
                        if(this.filterItemsCollection && this.filterItemsCollection.length){
                            this.model.set("count",this.filterItemsCollection.length);
                            this.$("#count").text(this.model.get("count"));
                        }else{
                            this.collection.remove(this.model);
                        }
                    },
                    deleteItem: function(e){
                        var id = $(e.currentTarget).attr("dataId");
                        this.filterItemsCollection.remove({id:id});
                        this.grid.setSelection(id,false);
                    },
                    preRemove:function(model){
                        var checked = model.get("preRemoved");
                        this.filterItemsCollection.each(function(model){
                            model.set("preRemoved",checked);
                        });
                    },
                    clickPreRemove:function(e){
                        var checked =  $(e.currentTarget).prop("checked");
                        this.model.set("preRemoved",checked);
                    },
                    dealChirldrenChange:function(model){
                        if(this.filterItemsCollection.where({preRemoved:true}).length === this.filterItemsCollection.length){
                            this.model.set({preRemoved:true},{silent:true});
                            this.$("#org_checkbox").prop("checked",true);
                        }else{
                            this.model.set({preRemoved:false},{silent:true});
                            this.$("#org_checkbox").prop("checked",false);
                        }
                    }
                }
            },
            OrgItemApp:{
                OrgItemModel:{
                    defaults:function(){
                        return {
                            id:"0",
                            organizationInfo:{organizationId:0,
                                organizationName:""},
                            name:"",
                            content:"",
                            contacts:[],
                            groups:[],
                            filters:[]
                        };
                    }
                },
                OrgItemAppView:{
                    initialize:function(){
                        this.isCrossOrg = this.options.isCrossOrg;
                        this.contactContainer = this.options.contactContainer;
                        this.groupContainer = this.options.groupContainer;
                        this.filterContainer = this.options.filterContainer;
                        this.individualGrid=this.options.individualGrid,
                        this.groupTree=this.options.groupTree;
                        this.ruleGrid=this.options.ruleGrid;

                        this.OrgContactItemsView = EB_Common.Backbone.View.extend(view.notification.app.ContactApp.SubUnits.OrgContactItemsApp.OrgContactItemsView);
                        this.OrgContactItemsModel = Backbone.Model.extend(view.notification.app.ContactApp.SubUnits.OrgContactItemsApp.OrgContactItemsModel);
                        this.ContactItemModel = Backbone.Model.extend(view.notification.app.ContactApp.SubUnits.ContactItemApp.ContactItemModel);

                        this.OrgGroupItemsView = EB_Common.Backbone.View.extend(view.notification.app.ContactApp.SubUnits.OrgGroupItemsApp.OrgGroupItemsView);
                        this.OrgGroupItemsModel = Backbone.Model.extend(view.notification.app.ContactApp.SubUnits.OrgGroupItemsApp.OrgGroupItemsModel);
                        this.GroupItemModel = Backbone.Model.extend(view.notification.app.ContactApp.SubUnits.GroupItemApp.GroupItemModel);

                        this.OrgFilterItemsView = EB_Common.Backbone.View.extend(view.notification.app.ContactApp.SubUnits.OrgFilterItemsApp.OrgFilterItemsView);
                        this.OrgFilterItemsModel = Backbone.Model.extend(view.notification.app.ContactApp.SubUnits.OrgFilterItemsApp.OrgFilterItemsModel);
                        this.FilterItemModel = Backbone.Model.extend(view.notification.app.ContactApp.SubUnits.FilterItemApp.FilterItemModel);

                        this.subModelData = {id:this.model.id, orgId:this.model.get("orgId"), orgName:this.model.get("name"),isCrossOrg:this.model.get("isCrossOrg"),count:0};
                        this.model.view = this;
                        this.model.on("change:contactCount",this.dealCountChange,this);
                        this.model.on("change:groupCount",this.dealCountChange,this);
                        this.model.on("change:filterCount",this.dealCountChange,this);
                        var OrgContactItemsCollection = Backbone.Collection.extend({model:this.OrgContactItemsModel});
                        this.orgContactItemsCollcetion = new OrgContactItemsCollection();
                        this.orgContactItemsCollcetion.on("add",this.addOrgContactItems,this);
                        this.orgContactItemsCollcetion.on("remove",this.dealOrgContactItemsRemove,this);
                        this.orgContactItemsCollcetion.on("change:count",this.contactItemsCollectionChange,this);

                        var OrgGroupItemsCollcetion = Backbone.Collection.extend({model:this.OrgGroupItemsModel});
                        this.orgGroupItemsCollcetion = new OrgGroupItemsCollcetion();
                        this.orgGroupItemsCollcetion.on("add",this.addOrgGroupItems,this);
                        this.orgGroupItemsCollcetion.on("remove",this.dealOrgGroupItemsRemove,this);
                        this.orgGroupItemsCollcetion.on("change:count",this.groupItemsCollectionChange,this);

                        var OrgFilterItemsCollcetion = Backbone.Collection.extend({model:this.OrgFilterItemsModel});
                        this.orgFilterItemsCollcetion = new OrgFilterItemsCollcetion();
                        this.orgFilterItemsCollcetion.on("add",this.addOrgRuleItems,this);
                        this.orgFilterItemsCollcetion.on("remove",this.dealOrgFilterItemsRemove,this);
                        this.orgFilterItemsCollcetion.on("change:count",this.filterItemsCollectionChange,this);

                        this.model.set("orgContactItemsCollcetion",this.orgContactItemsCollcetion);
                        this.model.set("orgGroupItemsCollcetion",this.orgGroupItemsCollcetion);
                        this.model.set("orgFilterItemsCollcetion",this.orgFilterItemsCollcetion);
                        if(this.model.get("contacts") && this.model.get("contacts").length){
                            this.addContact(this.model.get("contacts"));
                        }
                        if(this.model.get("groups")&& this.model.get("groups").length){
                            this.addGroup(this.model.get("groups"));
                        }
                        if(this.model.get("filters")&& this.model.get("filters").length){
                            this.addRule(this.model.get("filters"));
                        }
//                        this.render();
                    },
                    render:function(){
                    },
                    addOrgContactItems:function(model){
                        var view = new this.OrgContactItemsView({model:model,collection:this.orgContactItemsCollcetion,grid:this.individualGrid,isCrossOrg:this.isCrossOrg});
                        this.contactContainer.append(view.render().el);
                    },
                    addOrgGroupItems:function(model){
                        var view = new this.OrgGroupItemsView({model:model,collection:this.orgGroupItemsCollcetion,ztree:this.groupTree,isCrossOrg:this.isCrossOrg});
                        this.groupContainer.append(view.render().el);
                    },
                    addOrgRuleItems:function(model){
                        var view = new this.OrgFilterItemsView({model:model,collection:this.orgFilterItemsCollcetion,grid:this.ruleGrid,isCrossOrg:this.isCrossOrg});
                        this.filterContainer.append(view.render().el);
                    },
                    addContact:function(model){
                        if(!this.orgContactItemsCollcetion || !this.orgContactItemsCollcetion.length){
                            var subModel = new this.OrgContactItemsModel(this.subModelData);
                            this.orgContactItemsCollcetion.add(subModel);
                        }
                        this.orgContactItemsCollcetion.at(0).get("contactItemsCollection").add(model);
                        this.model.set("contactCount",this.orgContactItemsCollcetion.at(0).get("contactItemsCollection").length);
                    },
                    addGroup:function(model){
                        if(!this.orgGroupItemsCollcetion || !this.orgGroupItemsCollcetion.length){
                            var subModel = new this.OrgGroupItemsModel(this.subModelData);
                            this.orgGroupItemsCollcetion.add(subModel);
                        }
                        this.orgGroupItemsCollcetion.at(0).get("groupItemsCollection").add(model);
                        this.model.set("groupCount",this.orgGroupItemsCollcetion.at(0).get("groupItemsCollection").length);
                    },
                    addRule:function(model){
                        if(!this.orgFilterItemsCollcetion || !this.orgFilterItemsCollcetion.length){
                            var subModel = new this.OrgFilterItemsModel(this.subModelData);
                            this.orgFilterItemsCollcetion.add(subModel);
                        }
                        this.orgFilterItemsCollcetion.at(0).get("filterItemsCollection").add(model);
                        this.model.set("filterCount",this.orgFilterItemsCollcetion.at(0).get("filterItemsCollection").length);
                    },
                    removeContact:function(model){
                        this.orgContactItemsCollcetion.at(0).get("contactItemsCollection").remove(model);
                        if(this.orgContactItemsCollcetion && this.orgContactItemsCollcetion.length){
                            this.model.set("contactCount",this.orgContactItemsCollcetion.at(0).get("contactItemsCollection").length);
                        }else{
                            this.model.set("contactCount",0);
                        }
                    },
                    removeGroup:function(model){
                        if(model && this.orgGroupItemsCollcetion && this.orgGroupItemsCollcetion.at(0)){
                            this.orgGroupItemsCollcetion.at(0).get("groupItemsCollection").remove(model);
                        }
                    },
                    removeRule:function(model){
                        this.orgFilterItemsCollcetion.at(0).get("filterItemsCollection").remove(model);

                    },
                    dealOrgContactItemsRemove:function(){
                        this.model.set("contactCount",0);
                    },
                    dealOrgGroupItemsRemove:function(){
                        this.model.set("groupCount",0);
                    },
                    dealOrgFilterItemsRemove:function(){
                        this.model.set("filterCount",0);
                    },
                    contactItemsCollectionChange:function(model){
                        if(this.orgContactItemsCollcetion && this.orgContactItemsCollcetion.length){
                            this.model.set("contactCount",model.get("contactItemsCollection").length);
                        }else{
                            this.model.set("contactCount",0);
                        }
                    },
                    groupItemsCollectionChange:function(model){
                        if(this.orgGroupItemsCollcetion && this.orgGroupItemsCollcetion.length){
                            this.model.set("groupCount",this.orgGroupItemsCollcetion.at(0).get("groupItemsCollection").length);
                        }else{
                            this.model.set("groupCount",0);
                        }
                    },
                    filterItemsCollectionChange:function(model){
                        if(this.orgFilterItemsCollcetion && this.orgFilterItemsCollcetion.length){
                            this.model.set("filterCount",this.orgFilterItemsCollcetion.at(0).get("filterItemsCollection").length);
                        }else{
                            this.model.set("filterCount",0);
                        }
                    },
                    dealCountChange:function(){
                        if((!this.model.get("contactCount")||this.model.get("contactCount")<=0)
                            && (!this.model.get("groupCount")||this.model.get("groupCount")<=0)
                            && (!this.model.get("filterCount")||this.model.get("filterCount")<=0) ){
                            this.collection.remove(this.model);
                        }
                    }

                }
            },
            IndividualGroupFilter:{
                SelectedContactApp:{
                    currentOrgId:0,
                    currentOrgName:"",
                    orgContactViews:{},
                    url:'',
                    isCrossOrg:false,
                    organizations:[],
                    okCallBack:null,
                    treeObj:null,
                    selectedGroupIds:"",
                    initialize:function () {
                        this.selectedGroupIds = this.options.selectedGroupIds;
                        this.isCrossOrg = this.options.isCrossOrg;
                        this.organizations = this.options.organizations;
                        this.okCallBack = this.options.okCallBack;
                        $.templates({
                            contactSelectTemplate: $("#contactSelectTemplate").html()
                        });
                        this.contactSelectTemplate = $.render.contactSelectTemplate;
                        this.OrgItemAppView = EB_Common.Backbone.View.extend(view.notification.app.ContactApp.SubUnits.OrgItemApp.OrgItemAppView);
                        var OrgItemAppModel = Backbone.Model.extend(view.notification.app.ContactApp.SubUnits.OrgItemApp.OrgItemModel);
                        var OrgItemAppCollection = Backbone.Collection.extend({model:OrgItemAppModel});
                        this.orgItemAppCollection = new OrgItemAppCollection();
                        this.orgItemAppCollection.on("add",this.addOrgItem,this);
                        this.render();
                    },
                    render:function(){
                        this.$el.html(this.contactSelectTemplate([{isCrossOrg:this.isCrossOrg,organizations:this.organizations,idSuffix:this.cid,data:this.getIdSuffixModelJSON()}]));
                        this.organization_select= this.$("#organization_select");
                        this.currentOrgId = this.organization_select.val()||this.currentOrgId;
                        this.currentOrgName =  this.organization_select.find(":selected").text()||"";
                        this.individualGrid = this.$("#individual_gridTable");
                        this.groupTree = this.$("#groupsTree");
                        this.ruleGrid = this.$("#rule_gridTable");
                        this.multiselectIndividual = this.$("#multiselectIndividual");
                        this.multiselectGroup =  this.$("#multiselectGroup");
                        this.multiselectFilter = this.$("#multiselectFilter");
                        this.advanceSearch = this.$("#forAdvanceSearch");
//                        this.dialog();
                        this.loadAdvanceSearch();

                        var orgContactDatas = this.model.get("orgContactData");
                        if(orgContactDatas && orgContactDatas.length){
                            this.orgItemAppCollection.add(orgContactDatas);
                        }
                        return this;
                    },
                    events:function(){
                        var events = {
                            "change #organization_select":"eventSelectOrganization",
                            "click #main_tabs>a":"eventClickContactType",
                            "click #contacts_del_btn":"deleteContacts",
                            "click #groups_del_btn":"deleteGroups",
                            "click #rules_del_btn":"deleteRules",
                            "click #forAdvanceSearch":"eventClickAdvanceSearch"
                        }
                        return this.dealEvents(events,this.cid);
                    },
                    addOrgItem:function(model){
                        var view = new this.OrgItemAppView({model:model,collection:this.orgItemAppCollection,
                                                    isCrossOrg:this.isCrossOrg,
                                                    contactContainer:this.$("#selected_contact"),
                                                    groupContainer:this.$("#selected_group"),
                                                    filterContainer:this.$("#selected_filter"),
                                                    individualGrid:this.individualGrid,
                                                    groupTree:this.treeObj,
                                                    ruleGrid:this.ruleGrid });
                    },
                    getContactCount:function(){
                        var totalCount = 0;
                        this.orgItemAppCollection.each(function(model){
                            totalCount = totalCount + (model.get("contactCount")?model.get("contactCount"):0);
                        });
                        return totalCount;
                    },
                    getGroupConunt:function(){
                        var totalCount = 0;
                        this.orgItemAppCollection.each(function(model){
                            totalCount = totalCount + (model.get("groupCount")?model.get("groupCount"):0);
                        });
                        return totalCount;
                    },
                    getFilterCount:function(){
                        var totalCount = 0;
                        this.orgItemAppCollection.each(function(model){
                            totalCount = totalCount + (model.get("filterCount")?model.get("filterCount"):0);
                        });
                        return totalCount;
                    },
                    eventSelectOrganization:function(){
                        this.currentOrgId = this.organization_select.val();
                        this.currentOrgName = this.organization_select.find(":selected").text();
                        this.individualGrid.jqGrid('setGridParam',{datatype:'json',postData:{isCrossOrg:this.isCrossOrg,
                                            orgId:this.currentOrgId}}).trigger("reloadGrid");
                        var that = this;
                        EB_Common.Ajax.get("/contacts/groups/tree/json", {"selectedGroupIds":that.selectedGroupIds,
                            isCrossOrg: that.isCrossOrg,
                            orgId:that.currentOrgId}, function(data) {
                            var setting = {
                                check:{enable : true,chkStyle : "checkbox",chkboxType : { "Y" : "s", "N" : "s" },autoCheckTrigger:true},
                                data:{
                                    keep:{ leaf : false, parent : false},
                                    key : {checked : "checked", children : "groups", name : "name", id : "id",title : ""}
                                },
                                edit:{  enable : false, drag : {  isCopy : false,isMove : true} },
                                view:{selectedMulti : true,autoExpand : true},
                                callback:{
                                    onCheck : function(event, treeId, treeNode) {
                                        that.syncDataFromTree(treeNode);
                                    }
                                }
                            };
                            var rootNode = {id : -1,name : "All Contact Groups",groups : data,open : true};
                            that.treeObj = $.fn.zTree.init(that.groupTree,setting, rootNode);
                            that.syncDataToTree(that.multiselectGroup);
                        }, 'json');
                        this.ruleGrid.jqGrid('setGridParam',{datatype:'json',postData:{isCrossOrg:this.isCrossOrg,
                            orgId:this.currentOrgId}}).trigger("reloadGrid");
                        this.advancedSearch.reload({orgId:this.currentOrgId});
                    },
                    loadAdvanceSearch:function(){
                        var app = this;
                        var searchSettings = {
                            container:this.$('#advanceSearchContainer'),
                            autoOpen:false,
                            showSavedAsRule:false,
                            needForm:true,
                            isCrossOrg:this.isCrossOrg,
                            orgId:this.currentOrgId,
                            fatchConditionsAsync:false,
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
                        this.changeContactType(parseInt($(e.target).attr("data-index"))-1);
                    },
                    eventClickAdvanceSearch:function(){
                        if(this.advancedSearch.isHidden()){
                            this.advancedSearch.open();
                        }else{
                            this.advancedSearch.close();
                        }
                    },
                    deleteContacts:function(e){
                        this.orgItemAppCollection.each(function(model){
                            var orgContactItemsCollcetion = model.get("orgContactItemsCollcetion");
                            orgContactItemsCollcetion.each(function(model2){
                                var contactItemsCollection = model2.get("contactItemsCollection");
                                var preRemovedModels = [];
                                contactItemsCollection.each(function(model3){
                                    if(model3.get("preRemoved")){
                                        preRemovedModels.push(model3);
                                    }
                                });
                                contactItemsCollection.remove(preRemovedModels);
                            });
                        });
                        this.syncDataToGrid();
                    },
                    deleteGroups:function(e){
                        var treeObj = this.treeObj;
                        this.orgItemAppCollection.each(function(model){
                            var orgGroupItemsCollcetion = model.get("orgGroupItemsCollcetion");
                            orgGroupItemsCollcetion.each(function(model2){
                                var groupItemsCollection = model2.get("groupItemsCollection");
                                var preRemovedModels = [];
                                groupItemsCollection.each(function(model3){
                                    if(model3.get("preRemoved")){
                                        preRemovedModels.push(model3);
                                    }
                                });
                                groupItemsCollection.remove(preRemovedModels);
                                $.each(preRemovedModels,function(i,n){
                                    var node = treeObj.getNodeByParam("id", n.id)
                                    treeObj.checkNode(node, false, true);
                                })
                            });
                        });
//                        this.syncDataToTree();
                    },
                    deleteRules:function(e){
                        this.orgItemAppCollection.each(function(model){
                            var orgFilterItemsCollcetion = model.get("orgFilterItemsCollcetion");
                            orgFilterItemsCollcetion.each(function(model2){
                                var filterItemsCollection = model2.get("filterItemsCollection");
                                var preRemovedModels = [];
                                filterItemsCollection.each(function(model3){
                                    if(model3.get("preRemoved")){
                                        preRemovedModels.push(model3);
                                    }
                                });
                                filterItemsCollection.remove(preRemovedModels);
                            });
                        });
                        this.syncDataToRuleGrid();
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
                    syncDataToGrid:function(){
                        var model = this.orgItemAppCollection.get(this.currentOrgId);
                        var grid = this.individualGrid;
                        grid.resetSelection();
                        if(model){
                            var ids= grid.jqGrid("getDataIDs");
                            $.each(ids,function(i,n){
                                if(model.get("orgContactItemsCollcetion").at(0) && model.get("orgContactItemsCollcetion")&&
                                    model.get("orgContactItemsCollcetion").at(0).get("contactItemsCollection")&&
                                    model.get("orgContactItemsCollcetion").at(0).get("contactItemsCollection").get(n)){
                                    grid.setSelection(n,false);
                                }
                            });
                        }
                    },
                    syncDataFromGrid:function(rowIds, status) {

                        var orgId = this.currentOrgId,orgName=this.currentOrgName;
                        var model = this.orgItemAppCollection.get(orgId);
                        if(!model && !status){
                            return;
                        }
                        if(!model){
                            this.orgItemAppCollection.add({
                                id:orgId,
                                orgId:orgId,
                                name:orgName,
                                isCrossOrg:this.isCrossOrg,
                                count:0,
                                contactCount:0,
                                groupCount:0,
                                filterCount:0
                            });
                            model = this.orgItemAppCollection.get(orgId);
                        }
                        var grid = this.individualGrid;
                        $.each(rowIds,function(i,rowId){
                            var data =grid.getRowData(rowId);
                            if(status){
                                model.view.addContact({
                                    id:data.id,
                                    contactId:data.id,
                                    "orgId":orgId,
                                    firstName:data.firstName,
                                    lastName:data.lastName,
                                    content: data.firstName+","+data.lastName
                                });
                            }else{
                                model.view.removeContact({id:data.id});
//                                model.get("orgContactItemsAppCollcetion").remove({id:data.id});
                            }
                        });

                    },
                    syncDataToTree:function() {
                        if(!this.treeObj) return;
                        var treeObj = this.treeObj;
                        var model = this.orgItemAppCollection.get(this.currentOrgId);
                        if(model && model.get("orgGroupItemsCollcetion")&&
                            model.get("orgGroupItemsCollcetion").at(0) &&
                            model.get("orgGroupItemsCollcetion").at(0).get("groupItemsCollection")&&
                            model.get("orgGroupItemsCollcetion").at(0).get("groupItemsCollection").length){
                            model.get("orgGroupItemsCollcetion").at(0).get("groupItemsCollection").each(function(n){
                                var node = treeObj.getNodeByParam("id", n.id)
                                treeObj.checkNode(node, true, true);
                            });
                        }else{
                            if(treeObj){
                                treeObj.checkAllNodes(false);
                            }
                        }
                    },
                    syncDataFromTree:function(treeNode) {
                        if(treeNode.id<0)return;
                        var orgId = this.currentOrgId,orgName=this.currentOrgName;
                        var model = this.orgItemAppCollection.get(orgId);
                        if(!model && !treeNode.checked){
                            return;
                        }
                        if(!model){
                            this.orgItemAppCollection.add({
                                id:orgId,
                                orgId:orgId,
                                name:orgName,
                                isCrossOrg:this.isCrossOrg,
                                count:0,
                                contactCount:0,
                                groupCount:0,
                                filterCount:0
                            });
                            model = this.orgItemAppCollection.get(orgId);
                        }
                        if(treeNode.checked){
                            model.view.addGroup({
                                id:treeNode.id,
                                groupId:treeNode.id,
                                "orgId":orgId,
                                name:treeNode.name,
                                content: treeNode.name
                            });
                        }else{
                            model.view.removeGroup({id:treeNode.id});
                        }
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
                        this.multiselectIndividual.children().each(function(){
                            var j = $(this);
                            contacts.push({id:this.value,firstName:j.attr("firstName"),lastName:j.attr("lastName")});
                        });
                        this.collection.at(0).set("contacts",contacts);
                        var groups = [];
                        this.multiselectGroup.children().each(function(){
                            var j = $(this);
                            groups.push({id:this.value,name:j.text()});
                        });
                        this.collection.at(0).set("groups",groups);
                        var filters = [];
                        this.multiselectFilter.children().each(function(){
                            var j = $(this);
                            filters.push({id:this.value,name:j.text()});
                        });
                        this.collection.at(0).set("filters",filters);
                    },
                    syncDataToRuleGrid:function(){
                        var model = this.orgItemAppCollection.get(this.currentOrgId);
                        var grid = this.ruleGrid;
                        grid.resetSelection();
                        if(model){
                            var ids= grid.jqGrid("getDataIDs");
                            $.each(ids,function(i,n){
                                if(model.get("orgFilterItemsCollcetion")&&
                                    model.get("orgFilterItemsCollcetion").at(0) &&
                                    model.get("orgFilterItemsCollcetion").at(0).get("filterItemsCollection")&&
                                    model.get("orgFilterItemsCollcetion").at(0).get("filterItemsCollection").get(n)){
                                    grid.setSelection(n,false);
                                }
                            });
                        }
                    },
                    syncDataFromRuleGrid:function(rowIds, status) {


                        var orgId = this.currentOrgId,orgName=this.currentOrgName;
                        var model = this.orgItemAppCollection.get(orgId);
                        if(!model && !status){
                            return;
                        }
                        if(!model){
                            this.orgItemAppCollection.add({
                                id:orgId,
                                orgId:orgId,
                                name:orgName,
                                isCrossOrg:this.isCrossOrg,
                                count:0,
                                contactCount:0,
                                groupCount:0,
                                filterCount:0
                            });
                            model = this.orgItemAppCollection.get(orgId);
                        }
                        var that = this;
                        var grid = this.ruleGrid;
                        $.each(rowIds,function(i,rowId){
                            var data =grid.getRowData(rowId);
                            if(status){
                                model.view.addRule({
                                    id:data.id,
                                    filterId:data.id,
                                    "orgId":orgId,
                                    name:data.name,
                                    content: data.name
                                });
                            }else{
                                model.view.removeRule({id:data.id});
                            }
                        });

                    },

                    initContactsData:function(){
                        var selectedContactView = this;
                        this.individualGrid.jqGrid({
//                            url : EB_Common.Ajax.wrapperUrl("/bcTemplates/contacts/contact"),
                            url : EB_Common.Ajax.wrapperUrl("/contacts/json"),
                            datatype : "json",
                            autoencode : true,
                            emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                            mtype : "post",
                            postData : {
                                quicksearchvalue : "",
                                isCrossOrg:selectedContactView.isCrossOrg,
                                orgId:selectedContactView.currentOrgId
                            },
                            jsonReader : {
                                root : "data",
                                page : "currentPageNo",
                                total : "totalPageCount",
                                records : "totalCount",
                                repeatitems : false
                            },
                            height : 240,
                            autowidth: true,
                            colNames : [ i18n['contact.field.firstName'], i18n['contact.field.middleInitial'],i18n['contact.field.lastName'],i18n['contact.field.suffix'], i18n['contact.field.externalId'], "","" ],
                            colModel : [
                                {name : 'firstName',index : 'firstName',width : 80},
                                {name : 'middleInitial',index : 'middleInitial',width : 90},
                                {name : 'lastName',index : 'lastName',width : 70},
                                {name : 'suffix',index : 'suffix',width : 50},
                                {name : 'externalId',index : 'externalId',width : 90},
                                {name : 'id',index : 'id',width : 80,hidden : true},
                                {name : 'organizationId',index : 'organizationId',width : 80,hidden : true}
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
                                selectedContactView.syncDataFromGrid(rowIds, status);
                            },
                            onSelectRow : function(rowId, status) {
                                selectedContactView.syncDataFromGrid([rowId], status);
                            },
                            loadComplete : function() {
                                selectedContactView.syncDataToGrid();
                            }
                        });
                        this.ruleGrid.jqGrid({
                            autoencode:true,
//                            url : EB_Common.Ajax.wrapperUrl("/bcTemplates/contacts/filter"),
                            url : EB_Common.Ajax.wrapperUrl("/contacts/filters/json"),
                            datatype : "json",
                            postData : {
                                isCrossOrg:selectedContactView.isCrossOrg,
                                orgId:selectedContactView.currentOrgId
                            },
                            emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                            jsonReader : {root : "data",page : "currentPageNo",total : "totalPageCount",records : "totalCount",repeatitems : false},
                            height : 280,
                            autowidth: true,
//                            width:480,
                            rowNum : 10,
                            rowList : [ 10 ],
                            colNames : [ i18n['contact.field.RuleName'], '' ],
                            colModel : [{name : 'name',index : 'name',width : 80},{name : 'id',index : 'id',width : 80,hidden : true}],
                            sortname : 'id',
                            sortorder : 'asc',
                            viewrecords : true,
                            pager : selectedContactView.$("#rule_gridPager"),
                            multiselect : true,
                            prmNames : {page : "pageNo",totalrows : "totalrows"},
                            onSelectAll : function(rowIds, status) {
                                selectedContactView.syncDataFromRuleGrid(rowIds, status);
                            },
                            onSelectRow : function(rowId, status) {
                                selectedContactView.syncDataFromRuleGrid([rowId], status);
                            },
                            loadComplete : function() {
                                selectedContactView.syncDataToRuleGrid();
                            }
                        });
                        if(selectedContactView.treeObj) return;
                        EB_Common.Ajax.get("/contacts/groups/tree/json", {"selectedGroupIds":selectedContactView.selectedGroupIds,
                            isCrossOrg: selectedContactView.isCrossOrg,
                            orgId:selectedContactView.currentOrgId}, function(data) {
                            var setting = {
                                check:{enable : true,chkStyle : "checkbox",chkboxType : { "Y" : "s", "N" : "s" },autoCheckTrigger:true},
                                data:{
                                    keep:{ leaf : false, parent : false},
                                    key : {checked : "checked", children : "groups", name : "name", id : "id",title : ""}
                                },
                                edit:{  enable : false, drag : {  isCopy : false,isMove : true} },
                                view:{selectedMulti : true,autoExpand : true},
                                callback:{
                                    onCheck : function(event, treeId, treeNode) {
                                        selectedContactView.syncDataFromTree(treeNode);
                                    }
                                }
                            };
                            var rootNode = {id : -1,name : "All Contact Groups",groups : data,open : true};
                            selectedContactView.treeObj = $.fn.zTree.init(selectedContactView.groupTree,setting, rootNode);
                            selectedContactView.syncDataToTree(selectedContactView.multiselectGroup);
                        }, 'json');
                    },
                    getCachedData:function(){
                        var orgDatas = [];
                        if(this.orgItemAppCollection && this.orgItemAppCollection.length ){
                            orgDatas = this.orgItemAppCollection.map(function(orgItemModel){
                                var id=orgItemModel.get("id"),
                                    name=orgItemModel.get("name"),
                                    orgId=orgItemModel.get("id"),
                                    content=orgItemModel.get("name"),
                                    contacts = [],
                                    groups = [],
                                    filters = [],
                                    filterRules = [];

                                if(orgItemModel.get("orgContactItemsCollcetion") &&
                                    orgItemModel.get("orgContactItemsCollcetion").at(0) &&
                                    orgItemModel.get("orgContactItemsCollcetion").at(0).get("contactItemsCollection")){

                                    orgItemModel.get("orgContactItemsCollcetion").at(0).get("contactItemsCollection").each(function(model){
                                        contacts.push({id:model.id,firstName:model.get("firstName"),lastName:model.get("lastName"),content:model.get("content")});
                                    });
                                }
                                if(orgItemModel.get("orgGroupItemsCollcetion") &&
                                    orgItemModel.get("orgGroupItemsCollcetion").at(0) &&
                                    orgItemModel.get("orgGroupItemsCollcetion").at(0).get("groupItemsCollection")){
                                    orgItemModel.get("orgGroupItemsCollcetion").at(0).get("groupItemsCollection").each(function(model){
                                        groups.push({id:model.id,name:model.get("name"),content:model.get("content")});
                                    });
                                }
                                if(orgItemModel.get("orgFilterItemsCollcetion") &&
                                    orgItemModel.get("orgFilterItemsCollcetion").at(0) &&
                                    orgItemModel.get("orgFilterItemsCollcetion").at(0).get("filterItemsCollection")){
                                    orgItemModel.get("orgFilterItemsCollcetion").at(0).get("filterItemsCollection").each(function(model){
                                        filters.push({id:model.id,name:model.get("name"),content:model.get("content")});
                                    });
                                }
                                return {id:id,name:name,orgId:orgId,content:content,
                                        contacts:contacts,
                                        groups:groups,
                                        filters:filters,
                                        filterRules:filterRules
                                    };
                            });
                        }
                        return orgDatas;
                    },
                    getData:function(){
                        var orgDatas = [];
                        if(this.orgItemAppCollection && this.orgItemAppCollection.length ){
                            orgDatas = this.orgItemAppCollection.map(function(orgItemModel){
                                var contactIds = [],
                                    groupIds = [],
                                    groupNames = [],
                                    filterIds = [],
                                    filterNames = [];

                                if(orgItemModel.get("orgContactItemsCollcetion") &&
                                    orgItemModel.get("orgContactItemsCollcetion").at(0) &&
                                    orgItemModel.get("orgContactItemsCollcetion").at(0).get("contactItemsCollection")){

                                    orgItemModel.get("orgContactItemsCollcetion").at(0).get("contactItemsCollection").each(function(model){
                                        contactIds.push(model.id);
                                    });
                                }
                                if(orgItemModel.get("orgGroupItemsCollcetion") &&
                                    orgItemModel.get("orgGroupItemsCollcetion").at(0) &&
                                    orgItemModel.get("orgGroupItemsCollcetion").at(0).get("groupItemsCollection")){
                                    orgItemModel.get("orgGroupItemsCollcetion").at(0).get("groupItemsCollection").each(function(model){
                                        groupIds.push(model.id);
                                        groupNames.push(model.get("name"));
                                    });
                                }
                                if(orgItemModel.get("orgFilterItemsCollcetion") &&
                                    orgItemModel.get("orgFilterItemsCollcetion").at(0) &&
                                    orgItemModel.get("orgFilterItemsCollcetion").at(0).get("filterItemsCollection")){
                                    orgItemModel.get("orgFilterItemsCollcetion").at(0).get("filterItemsCollection").each(function(model){
                                        filterIds.push(model.id);
                                        filterNames.push(model.get("name"));
                                    });
                                }
                                return {organizationInfo:{organizationId:orgItemModel.id,
                                                          organizationName:orgItemModel.get("name")},
                                        broadcastContacts:{
                                            contactIds:contactIds,
                                            groupIds:groupIds,
                                            groupNames:groupNames,
                                            filterIds:filterIds,
                                            filterNames:filterNames
                                        }};
                            });
                        }
                        return orgDatas;
                    }
                },
                getInstance:function(_options){
                    var options = $.extend(true,{},_options||{});
                    var Model = Backbone.Model.extend(this.SelectedContactModel);
                    var selectedContactModel = null;
                    if(options.url){
                        selectedContactModel=new Model({isCrossOrg:options.isCrossOrg});
                    }else{
                        selectedContactModel=options.model;
                    }
                    var View = EB_Common.Backbone.View.extend(this.SelectedContactApp);
                    return new View({model:selectedContactModel,SelectedContactModel:Model,selectedGroupIds:options.selectedGroupIds,
                        okCallBack:options.okCallBack,isCrossOrg:options.isCrossOrg,organizations:options.organizations});
                }
            }
        },
        ContactAppModel:Backbone.Model.extend({
            defaults:function(){
                return {
                    load:false,
                    orgContactData:[]
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
            subApps:{
                individualGroupFilter:null},
            initialize:function () {
                this.isCrossOrg = this.options.isCrossOrg;
                $.templates({
                    contactAppTemplate: $("#contactAppTemplate").html()
                });
                this.contactAppTemplate = $.render.contactAppTemplate;
                this.model.on("change:load",this.render,this);
                this.model.on("change",this.renderCount,this);
                if(this.model.urlRoot)
                    this.model.fetch();
                else{
                    this.model.set({"load":true,"hadOpenDialog":false});
                }

            },
            render:function(){
                var data = this.getIdSuffixModelJSON();
                var that = this;
                $.each(data,function(i,n){
                    n.isCrossOrg = that.isCrossOrg;
                });

                this.$el.html(this.contactAppTemplate(data));
                this.options.loadSuccess&&this.options.loadSuccess.apply(this);
//                this.dialog();
                if(this.options.isView===false){
                    this.$el.hide();
                }
                return this;
            },
            dialog:function(){
                var that = this;
                var options2={
                    model:new Backbone.Model({orgContactData:that.model.get("orgContactData")}),
                    isCrossOrg:that.isCrossOrg,
                    organizations:that.options.organizations,
                    contactApp:that
//                    okCallBack:function(){
//                        that.model.set("contactsCount",this.getContactCount());
//                        that.model.set("groupsCount",this.getGroupConunt());
//                        that.model.set("filtersCount",this.getFilterCount());
//                    }
                };
                this.individualGroupFilter = EB_View.notification.app.ContactApp.SubUnits.IndividualGroupFilter.getInstance(options2);
                var me = this.individualGroupFilter;
                me.$el.dialog({
                    autoOpen : true,
                    title : i18n["notification.title.contact"],
                    width : 1000,
                    height : "auto",
                    modal : true,
                    resizable : false,
                    open:function(){
                        me.initContactsData();
                        //me.syncDataToGrid();
                        //me.syncDataToRuleGrid();
                        //me.syncDataToTree();
                    },
                    buttons : {
                        Ok : {
                            click : function() {
//                                        me.resetSelectedData(true);
//                                me.okCallBack.call(me);
                                that.model.set("contactsCount",me.getContactCount());
                                that.model.set("groupsCount",me.getGroupConunt());
                                that.model.set("filtersCount",me.getFilterCount());
                                that.model.set("orgContactData",me.getCachedData());
                                $(this).dialog("close");
                            },
                            'class' : 'orange',
                            text : i18n['global.dialog.button.ok']
                        },
                        Cancel : {
                            click : function() {
                                $(this).dialog("close");
//                                        me.resetSelectedData(false);
                            },
                            'class' : 'gray',
                            text : i18n['global.dialog.button.cancel']
                        }
                    },
                    close: function(event, ui) {
                        me.remove();
//                        this.destroy();
//                                me.resetSelectedData(false);
                    }
                });
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
                    this.$("#errSelContactMessage").val("");
                }
                if($.isFunction(this.options.selectContactCallback)){
                    this.options.selectContactCallback.call(this,hasContacts);
                }
                if(!this.model.get("hadOpenDialog")){
                    this.model.set({hadOpenDialog:true},{silent:true});
                    return;
                }
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
                    this.$("#errSelContactMessage").addClass("ignore");
                }else{
                    this.$("#errSelContactMessage").removeClass("ignore");
                }
            },
            openSelectDialog:function(e){
                if(this.options.isEdit===false){
                    return this;
                }
                var j = $(e.target);
                if(!j.is("div")){j = j.parent();}
                if(!(j.attr("id")) || j.attr("id").indexOf("map")==-1){
                    this.dialog();

                    if(this.individualGroupFilter){
                        var index = parseInt(j.attr("data-index"))-1;
                        this.individualGroupFilter.changeContactType(index);
//                        this.subApps.individualGroupFilter.$el.dialog("open");
                    }
                }else{
                    if(this.subApps.universeApp.model.get("isDialog")){
                        this.subApps.universeApp.$el.dialog("open");
                    }
                }

            },
            getData:function(){
                var model = this.model.toJSON();
                var data = {
                    load:false,
                    IndividualGroupFilterData:model.orgContactData[0],
                    contactsCount: model.contactsCount,
                    filtersCount: model.filtersCount,
                    groupsCount: model.groupsCount,
                    shapesCount: model.shapesCount
                }
//                var data={numData:model,contactsData:model.contactsData} || {};
//                if(this.subApps.individualGroupFilter){
//                    data.contactsData = this.subApps.individualGroupFilter.getData();
//                    data.contactsData.load = false;
//                }
                if(this.subApps.universeApp){
                    data.gisModelData = this.subApps.universeApp.getData();
                    data.gisContactsData = data.gisModelData.tempStorage.selectedData;
                }
                return $.extend(true,{},data);
            },
            getContactData:function(){
                var orgDatas = [];
                if(this.model.get("orgContactData")){
                    orgDatas = $.map(this.model.get("orgContactData"),function(element,i){
                        var contactIds = [],
                            groupIds = [],
                            groupNames = [],
                            filterIds = [],
                            filterNames = [];
                        if(element.contacts && element.contacts.length){
                            $.each(element.contacts,function(i,data){
                                contactIds.push(data.id);
                            });
                        }
                        if(element.groups && element.groups.length){
                            $.each(element.groups,function(i,data){
                                groupIds.push(data.id);
                                groupNames.push(data.name);
                            });
                        }
                        if(element.filters && element.filters.length){
                            $.each(element.filters,function(i,data){
                                filterIds.push(data.id);
                                filterNames.push(data.name);
                            });
                        }
                        return {organizationInfo:{organizationId:element.id,
                            organizationName:element.name},
                            broadcastContacts:{
                                contactIds:contactIds,
                                groupIds:groupIds,
                                groupNames:groupNames,
                                filterIds:filterIds,
                                filterNames:filterNames,
                                filterRules:element.filterRules
                            }};
                    });
                }
                return orgDatas;
            },
            getJsonData:function(parentObj){
                var orgDatas = this.getContactData();
                if(this.isCrossOrg){
                    return orgDatas;
                }else{
                	parentObj.broadcastContacts = {};
                    if(orgDatas[0]){
                        parentObj.broadcastContacts = orgDatas[0].broadcastContacts;
                        
                    }
                    var data={};
                    if(this.subApps.universeApp){
                        data.gisModelData = this.subApps.universeApp.getData();
                        data.gisContactsData = data.gisModelData.tempStorage.selectedData;
                        if(data.gisContactsData){
                            parentObj.broadcastContacts.filterRulesJson =(data.gisContactsData.filterRules &&data.gisContactsData.filterRules.length)?data.gisContactsData.filterRules:"";
                            parentObj.broadcastContacts.polygonsJson = data.gisContactsData.polygons||"";
                            parentObj.broadcastContacts.polygonIsIncludesJson = data.gisContactsData.polygonIsIncludes||"";
                            parentObj.broadcastContacts.excludedContactIds=data.gisContactsData.excludedContactIds||[];
                        }
                        if(data.gisContactsData.contactSearchCondition){
                            parentObj.broadcastContacts.contactSearchCondition = data.gisContactsData.contactSearchCondition;
                        }else{
                            parentObj.broadcastContacts.filterRulesJson = "";
                            parentObj.broadcastContacts.polygonsJson = "";
                            parentObj.broadcastContacts.polygonIsIncludesJson = "";
                            parentObj.broadcastContacts.excludedContactIds = [];
                        }
                    }
                }
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{container:$("body")},_options||{});
            var contactAppModel = null;
            var OrgItemAppModel = Backbone.Model.extend(EB_View.notification.app.ContactApp.SubUnits.OrgItemApp.OrgItemModel);
            if(options.url){
                contactAppModel = new this.ContactAppModel({isCrossOrg:options.isCrossOrg},{url:options.url});
            }else{
                if(options.isCrossOrg){
                    contactAppModel = new OrgItemAppModel(options.modelData);
                }else{
                    var data_ = {
                        orgContactData:[options.modelData.IndividualGroupFilterData||{}],
                        contactsCount: options.modelData.contactsCount,
                        filtersCount: options.modelData.filtersCount,
                        groupsCount: options.modelData.groupsCount,
                        shapesCount: options.modelData.shapesCount
                    };
                    contactAppModel = new OrgItemAppModel(data_);
                }
            }
            var View = EB_Common.Backbone.View.extend($.extend(true,{},this.ContactAppView));
            var view = new View({el:options.container,model:contactAppModel,loadSuccess:options.loadSuccess, isCrossOrg:options.isCrossOrg,
                organizations:options.organizations,selectContactCallback:options.selectContactCallback,isView:options.isView,isEdit:options.isEdit});
            return view;
        }
    }
})(EB_View,i18n);