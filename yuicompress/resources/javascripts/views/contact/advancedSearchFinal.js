/**
 * User: carl
 * Date: 2/17/13
 * Time: 9:15 PM
 */
(function (view) {
    view.contact={};
    view.contact.advancedSearchApp = {
        SearchItemView:{
            initialize:function () {
                this.container = this.options.container;
                this.parent = this.options.parent;
                $.templates({
                    searchItemTemplate:$("#searchItemTemplate").html()
                });
                this.template = $.render.searchItemTemplate;
                var that = this;
                this.datepickSetting = {
                    showOn:"button",
                    //buttonImage:EB_Common.Ajax.wrapperUrl("/") + "/statics/stylesheets/common/img/icn_calendar_16.png",
                    buttonImage:EB_Common.Ajax.wrapperUrl("/statics/stylesheets/common/img/icn_calendar_16.png"),
                    buttonImageOnly:true,
                    changeMonth:true,
                    changeYear:true,
                    buttonText: i18n['button.calendar.tooltip'],
                    altFormat:"yy-mm-dd",
                    dateFormat:"yy-mm-dd",
                    onClose:function (dateStr) {
                        that.model.set("fieldValue", dateStr);
                        $(this).valid();
                    }
                };
                this.model.on("destroy", this.remove, this);
                this.model.on("remove", this.remove, this);
            },
            events:{
                "click .deleteSearch":"deleteItem",
                "change :input[name=operator]":"changeOperator",
                "change .multiple_input":"updateMultipleValue",
                "change .single_input":"updateSingleValue",
                "blur .text_input":"updateSingleValue",
                "keyup .text_input":"search"
            },
            render:function () {
                var that = this;
                this.container.append(this.$el.html(this.template([this.model.toJSON()])));
                if (this.model.get("dataType") == 'DATE') {
                    this.$("input[name=fieldValue]").datepicker(this.datepickSetting);
                }
                this.$(":input").change();

                if(this.model.get("fieldName")=="groups"){
                    this.groupIds =[];
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
                                that.updateGroupValue(treeNode);
                            }
                        }
                    };
                    var rootNode = {id : -1,name : "All Contact Groups",groups : this.model.get("defaultValue"),open : true};
                    this.groupTree = $.fn.zTree.init(this.$("#groupsTree"),setting, rootNode);
                    if(this.model.get("fieldValue")){
                        var nodeIds = this.model.get("fieldValue");
                        for(var i=0; i<nodeIds.length;i++){
                            var node = this.groupTree.getNodeByParam("id",nodeIds[i]);
                            this.groupTree.checkNode(node, true, true, true);
                        }
                    }
                }
                return this;
            },
            deleteItem:function (e) {
                this.collection.remove(this.model);
            },
            changeOperator:function (e) {
                this.model.set("operator", $(e.currentTarget).val());
            },
            updateSingleValue:function (e) {
                this.model.set("fieldValue", $(e.currentTarget).val());
            },
            updateMultipleValue:function (e) {
                var jDom = $(e.currentTarget);
                var vals = $.map(jDom.find("option:selected"), function (element, i) {
                    return $(element).val();
                });
                this.model.set("fieldValue", vals);
            },
            updateGroupValue:function(treeNode){
                if(treeNode.checked && treeNode.id!=-1){
                    this.groupIds.push(treeNode.id);
                }else{
                    for(var i=0;i<this.groupIds.length;i++){
                        if(this.groupIds[i]===treeNode.id){
                            this.groupIds.splice(i,1);
                        }
                    }
                }
                if(this.groupIds && this.groupIds.length){
                    this.$("#groups_validate").val("true").valid();
                    this.$("#groups_operator").val("IN");
                }else{
                    this.$("#groups_validate").val("").valid();
                    this.$("#groups_operator").val("ISNULLARRAY");
                }
                this.model.set("fieldValue",this.groupIds);
            },
            search:function(event){
                if (event.keyCode == 13) {
                    this.updateSingleValue(event);
                    this.parent.search();
                }

            }
        },
        AdvancedSearchModel:{
            orgId:'',
            initialize:function () {
            },
            url:function(){
                if(this.isCrossOrg===true && this.orgId){
                    return  this.urlRoot+"?isCrossOrg="+this.isCrossOrg+"&orgId="+this.orgId;
                }
                return this.urlRoot;
            },
            parse:function (response) {
                return {filterRules:response};
            }
        },
        AdvancedSearchView:{
            container:null,
            callback:{
                search:null,
                close:null
            },
            events:{
                "change #_advancedSearch_select":"addSearchItemFromEvent",
                "click #searchBtn":"search",
                "click #clearBtn":"clearItems",
                "click #closeBtn":"closeWindow",
                "click #isFilterCheck":"clickFilter",
                "blur #filterName":"updateFilterName"
            },
            initialize:function () {
                this.container = this.options.container;
                this.autoOpen = this.options.autoOpen===true?true:false;
                this.needForm = this.options.needForm===true?true:false;
                this.needCloseBtn = this.options.needCloseBtn===false?false:true;
                this.fatchConditionsAsync = this.options.fatchConditionsAsync===false?false:true;
                this.showSavedAsRule = this.options.showSavedAsRule;
                this.showSearchButton = this.options.showSearchButton;
                this.status=this.autoOpen===false?"hidden":"shown";
                this.callback = this.options.callback;
       
                $.templates({
                    advancedSearchAppTemplate:$("#advancedSearchTemplate").html()
                });
                this.template = $.render.advancedSearchAppTemplate;
                this.model.on("sync",this.render,this);
                this.model.fetch({async:this.fatchConditionsAsync});
                if(!this.collection){
                    this.collection = new Backbone.Collection();
                }
                this.collection.on("add", this.addSearchItem, this);
                this.collection.on("sync",this.addSearchItem,this);
            },
            render:function () {
                var datas = [
                    {
                        cid:this.cid,
                        filterRules:this.model.get("filterRules"),
                        showSavedAsRule:this.showSavedAsRule,
                        showSearchButton:this.showSearchButton,
                        needForm:this.needForm,
                        needCloseBtn:this.needCloseBtn,
                        maxHeight:this.options.maxHeight||'200px',
                        backgroupdColor:this.options.backgroupdColor||""
                    }
                ];
                this.$el.html(this.template(datas));
                if(this.status=="hidden"){
                    this.$el.hide();
                }
                this.container.html(this.$el);
                var that = this;
                if(this.needForm===true){
                    EB_Common.validation.validate("advancedSearchForm_"+this.cid);
                }
                $.validator.addMethod('checkConditionNum_'+this.cid, function (value, element) {
                    return that.$("#advance_search_rows > div").size() > 0;
                }, i18n["global.choose.one"]);
                if (this.options.initFilterUrl) {
                    this.collection.url = this.options.initFilterUrl;
                    this.collection.fetch();
                }else if(this.options.exsitFilterRules && this.options.exsitFilterRules.length){
                    this.collection.add(this.options.exsitFilterRules);
                }
                if(this.callback && this.callback.afterComplete){
                    this.callback.afterComplete.apply(this);
                }
                return this;
            },
            addSearchItem:function (model) {
                var View = Backbone.View.extend(EB_View.contact.advancedSearchApp.SearchItemView);
                var view = new View({model:model, parent: this, collection:this.collection, container:this.$("#advance_search_rows")});
                view.render();
                this.$("#advance_search_rows").each( function(){
                    // certain browsers have a bug such that scrollHeight is too small
                    // when content does not fill the client area of the element
                    var scrollHeight = Math.max(this.scrollHeight, this.clientHeight);
                    this.scrollTop = scrollHeight - this.clientHeight;
                });
            },
            addSearchItemFromEvent:function (e) {
                var jDom = $(e.currentTarget);
                var filterIndex = jDom.find("option:selected").attr("filterIndex");
                if (filterIndex >= 0)
                    this.collection.add(this.model.get("filterRules")[filterIndex]);
                jDom.val("");
            },
            search:function (e) {
                var validResult = true;
                this.$(":input:visible").each(function(){
                    var t = $(this).valid();
                    if(validResult){
                        validResult = t;
                    }
                });

                if(!validResult){
                    return;
                }

                if($.isFunction(this.callback.search))
                    this.callback.search.apply(this, [this.getConditions(),this.model.get("isFilterVal"),this.model.get("filterName")]);
            },
            clearItems:function (e) {
                this.collection.update();
                if($.isFunction(this.callback.reset)){
                    this.callback.reset.apply(this, [this.getConditions()]);
                }
            },
            closeWindow:function (e) {
                this.clearItems();
                this.close();
            },
            clickFilter:function (e) {
                if ($(e.currentTarget).attr("checked")) {
                    this.checkFilter();
                } else {
                    this.unchekFilter();
                }
            },
            updateFilterName:function (e) {
                this.model.set("filterName",$(e.currentTarget).val());
            },
            getConditions:function () {
                return this.collection.toJSON();
            },
            isHidden:function () {
                return this.status=="hidden";
            },
            open:function(){
                this.$el.show();
                this.status="shown";
            },
            reload:function(settings){
                if(settings.url){
                    this.model.urlRoot = settings.url;
                }
                if(settings.orgId){
                    this.model.orgId = settings.orgId;
                }
                var oldCollections = this.collection.toJSON();
                var isOldShow = !this.isHidden();
                this.clearItems();
                this.model.fetch({async:false});
                this.delegateEvents();
                if(!this.isHidden()){
                    var filterRules = this.model.get("filterRules");
                    for(var i=0; i< oldCollections.length; i++){
                        var hasItems = false;
                        for(var j=0; j<filterRules.length; j++){
                            if(filterRules[j].contactFieldId == oldCollections[i].contactFieldId
                                && filterRules[j].fieldName == oldCollections[i].fieldName){
                                hasItems = true;
                                break;
                            }
                        }
                        if(!hasItems){
                            oldCollections.splice(i,1);
                        }

                    }
                    this.collection.add(oldCollections);
                }
//                this.render();
            },
            checkFilter:function(){
                this.model.set("isFilterVal",true);
                var that = this;
                this.$("#filterName").rules("add",{
                    remote:{
                        url:EB_Common.Ajax.wrapperUrl("/contacts/filters/check/name/json"),
                        type:"post",
                        async:false,
                        data:{
                            name:function () {
                                return that.$("#filterName").val();
                            }
                        }
                    },
                    messages:{
                        remote:i18n['global.valid.text.checkFilterName']
                    }
                });
                this.$("#filterName_div").show();
            },
            unchekFilter:function(){
                this.model.set("isFilterVal",false);
                this.$("#filterName").val("");
                this.$("#filterName_div").hide();
            },
            close:function () {
                if(this.needCloseBtn){
                    this.$("#isFilterCheck").attr("checked",false);
                    this.unchekFilter();
                    this.$el.hide();
                    this.status="hidden";
                    if($.isFunction(this.callback.close))
                        this.callback.close.apply(this, [this.getConditions()]);
                }
            }
        },
        getInstance:function (options) {
            var defaultUrl = EB_Common.Ajax.wrapperUrl("/contacts/advancedSearchItems");
            var Model = Backbone.Model.extend($.extend(this.AdvancedSearchModel, {urlRoot:options.url || defaultUrl,orgId:options.orgId,isCrossOrg:options.isCrossOrg}));
            var model = new Model();
            var View = Backbone.View.extend(this.AdvancedSearchView);
            var settings = {model:model, container:options.container,
                initFilterUrl:options.initFilterUrl,
                exsitFilterRules:options.exsitFilterRules,
                autoOpen:options.autoOpen,
                callback:options.callback,
                showSavedAsRule:options.showSavedAsRule === true ? true : false,
                showSearchButton:options.showSearchButton === false ? false : true,
                needForm:options.needForm,
                needCloseBtn:options.needCloseBtn===false?false:true,
                fatchConditionsAsync:options.fatchConditionsAsync,
                backgroupdColor:options.backgroupdColor};
            var view = new View(settings);
            return view;
        }
    }
})(EB_View)
