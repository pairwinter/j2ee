;(function(view) {
	view.notification = view.notification || {};
	view.notification.app = view.notification.app || {};
    view.notification.app.PublishApp={
        subApps:{
            AlertUsApp:{
                AlertUsView:{
                    events:{
                        "change #alertUsSettings":"clickAlertUsSettings"
                    },
                    initialize:function(){
                        $.templates({
                            alertUsAppTemplate:$("#alertUsAppTemplate").html()
                        });
                        this.alertUsAppTemplate = $.render.alertUsAppTemplate;
                        this.container = this.options.container;
                        this.render();
                        this.model.set("alertUsSettingId",(this.options.modelData && this.options.modelData.alertUsSetting && this.options.modelData.alertUsSetting.id)||"");
                    },
                    render:function(){
                        var data_ = {modelData:this.options.modelData, alterUsDatas:this.options.alertUsDatas};
                        this.container.html(this.$el.html(this.alertUsAppTemplate([data_])));
                        return this;
                    },
                    clickAlertUsSettings:function(e){
                        this.model.set("alertUsSettingId",$(e.currentTarget).val());
                    },
                    getJsonData:function(){
                        return this.model.toJSON();
                    }
                },
                getInstance:function(options){
                    var View = Backbone.View.extend(this.AlertUsView);
                    var model = new Backbone.Model();
                    var view = new View({modelData:options.modelData,alertUsDatas:options.alertUsDatas, container:options.container, model:model});
                    return view;
                }
            },
            NetworkApp:{
                subApps:{
                    RegionLibraryApp:{
                        RegionLibraryModel:{

                        },
                        RegionLibraryView:{
                            initialize:function(){
                                $.templates({
                                    regionLibraryTemplate: $("#regionLibraryTemplate").html()
                                });
                                this.regionLibraryTemplate = $.render.regionLibraryTemplate;
                                this.render();
                            },
                            render:function(){
                                this.$el.html(this.regionLibraryTemplate(this.model.toJSON()));
                                return this;
                            },
                            events:{
                                "click #previewOnMap":"previewOnMap"
                            },
                            previewOnMap:function(e){
                                var searchShapes = this.model.get("shapes");
                                if(!this.showOnMapApp){
                                    this.showOnMapApp = EB_View.universe.showOnMapApp.getInstance({searchShapes:searchShapes});
                                }
                                this.showOnMapApp.open(searchShapes);
                            }
                        }
                    }
                },
                NetworkModel:{
                    defaults:{
                        affectedAreaMethod:"None"
                    }
                },
                NetworkView:{
                    initialize:function(){
                        $.templates({
                            networkTemplate: $("#networkAppTemplate").html()
                        });
                        this.networkTemplate = $.render.networkTemplate;
                        this.RegionLibraryModel = Backbone.Model.extend(view.notification.app.PublishApp.subApps.NetworkApp.subApps.RegionLibraryApp.RegionLibraryModel);
                        var RegionLibraryCollection = Backbone.Collection.extend({model:this.RegionLibraryModel});
                        this.regionLibraryCollection = new RegionLibraryCollection();
                        this.regionLibraryCollection.on("add",this.addRegion,this);
                        this.RegionLibraryView = Backbone.View.extend(view.notification.app.PublishApp.subApps.NetworkApp.subApps.RegionLibraryApp.RegionLibraryView);
                        this.model.on("change:affectedAreaMethod",this.changeAffectedAreaMethod, this);
                        this.model.on("change:shapeFilePath",this.changeShape,this);
                        this.render();
                    },
                    render:function(){
                        var data_ = {hasShapes:(this.options.modelData&&this.options.modelData.affectedAreas) };
                        this.options.container.html(this.$el.html(this.networkTemplate([data_])));
                        if(this.options.modelData && this.options.modelData.affectedAreas){
                            this.$("#shapeRadio1").attr("checked",true);
                            this.model.set("affectedAreaMethod","UploadShape");
                        }else{
                            this.model.set("affectedAreaMethod","None");
                        }
                        this.loadShapeUploader();
                        return this;
                    },
                    events:{
                        "click :radio[name=shapeRadio]":"shapeRadioCheck"
                    },
                    changeAffectedAreaMethod:function(model){
                        if(model.get("affectedAreaMethod")==="None"){
                            this.$("#selectFromRegionLibraryDiv").hide();
                            this.$("#uploadShapDiv").hide();
                        }else if(model.get("affectedAreaMethod")==="UploadShape"){
                            this.$("#selectFromRegionLibraryDiv").show();
                            this.$("#regionLibrayDiv").hide();
                            if(this.$("#div2HasValue").val() == "1" && this.regionLibraryApp)
                                this.$("#regionLibrayDiv2").show();
                            this.$("#uploadShapDiv").show();
                        }else{
                            this.$("#selectFromRegionLibraryDiv").show();
                            this.$("#regionLibrayDiv").show();
                            this.$("#uploadShapDiv").hide();
                            this.$("#regionLibrayDiv2").hide();

                            if(this.$("#div1HasValue").val() == "1" && this.regionLibraryApp){
                                this.$("#regionLibrayDiv").show();
                            }else{
                                this.$("#div1HasValue").val("1");
                                var that = this;
                                var options = {
                                    url:EB_Common.Ajax.wrapperUrl("/universe/fetchRegionLib"),
                                    container:$("#regionLibrayDiv"),
                                    control:this,
                                    loadRegionCallBack:function(region){
                                        that.regionLibraryCollection.update([region]);
                                        this.$el.hide();
                                        that.$("#selectValue").val("1");
                                    }
                                }
                                this.regionLibraryApp = EB_View.universe.apps.RegionLibraryApp.getInstance(options);
                                this.regionLibraryApp.reload();
                                this.createBaseDialog(i18n['publish.region.library'],$("#regionLibrayDiv"));
                            }
                        }
                    },
                    changeShape:function(model){
                        if(model.get("shapeFilePath")){
                            this.$("#affectedAreasExistMessage").hide();
                            this.$("#uploadBtnDiv").hide();
                        }else{
                            this.$("#affectedAreasExistMessage").show();
                            this.$("#uploadBtnDiv").show();
                        }
                    },
                    loadShapeUploader:function(){
                        var that = this;
                        this.uploader = new EB_View.notification.uploader({
                            sessionId : this.options.sessionId,
                            uploadUrl : "/upload/file",
                            container:this.$("#shapeFileContainer"),
                            buttonId:"uploadShape",
                            btnText : i18n["notification.field.pulishMessage.network.uploadShapeBtn"],
                            maxFilesCount : 1,
                            fileTypes : "*.zip;*.KML",
                            fieldName : "uploadedShapes",
                            uploadItemTemplate:$("#uploadItemTemplate"),
                            buttonImageUrl : "/statics/stylesheets/common/img/uploader_bg.png",
                            fileLimit : "2.4 MB",
                            uploadSuccess:function(swfFile,serverFile){
                                serverFile.swfFileId = swfFile.id;
                                serverFile.newFile = true;
                                serverFile.serverFileName = serverFile.fileName + "-" + serverFile.originFileName;
                                serverFile.fileName = swfFile.name;
                                that.model.set({"shapeFilePath":serverFile.serverFileName});
                                //load map
                                that.$("#selectFromRegionLibraryDiv").show();
                                that.$("#regionLibrayDiv").hide();
                                that.$("#regionLibrayDiv2").show();
                                var div = $('<div id="regionLibrayDiv2">');
                                that.$("#regionLibrayDiv2").append(div);
                                if(that.$("#div2HasValue").val() == "1" && that.regionLibraryApp){
                                    that.$("#regionLibrayDiv2").show();
                                }else{
                                    that.$("#div2HasValue").val("1");
                                    var options = {
                                        url:EB_Common.Ajax.wrapperUrl("/settings/network/fetchRegionLib?shapeFilePath=" + serverFile.serverFileName),
                                        container:div,
                                        control:that,
                                        type:'get',
                                        loadRegionCallBack:function(region){
                                            that.regionLibraryCollection.update([region]);
                                            this.$el.hide();
                                            that.$("#selectValue").val("2");
                                        },
                                        eventCompleteCallBack:function(librarys){
                                            if(librarys != null && librarys.length > 0){
                                                that.model.set({"shapeFilePath":librarys[0].regionPath});
                                            }
                                        }
                                    }

                                    that.regionLibraryApp = EB_View.universe.apps.RegionLibraryApp.getInstance(options);
                                    that.regionLibraryApp.reload();
                                    that.createBaseDialog("Region Library",$("#regionLibrayDiv2"));
                                }
                            },
                            uploadError:function(file,data){
                            },
                            removeFile:function(swfFileId){
                                that.model.unset("shapeFilePath");
                                that.regionLibraryApp.remove();
                            }
                        });
                    },
                    removeFile:function(){
                        this.uploader.deleteFile();
                    },
                    shapeRadioCheck:function(e){
                        var jDom = $(e.currentTarget);
                        if(jDom.val()=="None"){
                            this.model.set("affectedAreaMethod","None");
                        }else if(jDom.val()=="UploadShape"){
                            this.model.set("affectedAreaMethod","UploadShape");
                        }else{
                            this.model.set("affectedAreaMethod","SelectRegion");
                        }
                    },
                    addRegion:function(region){
                        var regionLibraryView = new this.RegionLibraryView({model:region});
                        $("#regionLibrarySelected").html(regionLibraryView.$el);
                        this.model.set("regionLibraryId",region.id);
                    },
                    createBaseDialog:function(title){
                        if(!this.regionLibraryApp) return;
                        this.regionLibraryApp.$el.addClass("baseDialogControl").prepend($("#universeAppBaseDialogTemplate").render([{title:title}]));
                        this.regionLibraryApp.$el.draggable({containment:"parent",handle:".baseDialogControlHeader"});
                        var control = this;
                        this.regionLibraryApp.$(".base_dialog_control_close").click(function(){
                        	control.closeRegionLibrary();
                        });
                    },
                    closeRegionLibrary:function(){
                        $("#selectFromRegionLibraryDiv").hide();
                    },
                    getJsonData:function(){
                        return this.model.toJSON();
                    }
                },
                getInstance:function(options){
                    var Model = Backbone.Model.extend(this.NetworkModel);
                    var model = new Model();
                    var View = Backbone.View.extend(this.NetworkView);
                    var view = new View({modelData:options.modelData,model:model,sessionId:options.sessionId,container:options.container});
                    return view;
                }
            },
            IPAWSApp:{
                IPAWSModel:{
                    defaults:{

                    }
                },
                IPAWSView:{
                    initialize:function(){
                        this.container = this.options.container;
//                        this.initSource = this.options.ipawsDatas;
                        $.templates({
                            ipawsTemplate: $("#ipawsAppTemplate").html()
                        });
                        this.ipawsTemplate = $.render.ipawsTemplate;
                        this.messageMaxLength=90;
//                        var geoCodesCollection = new Backbone.Collection();
//                        this.model.set("geoCodes",geoCodesCollection);
//                        this.model.on("change:geoCodes", this.changeGeoCodes, this);
                        this.render();
                    },
                    render:function(){
                        var that = this;
                        var ipawsDatas = this.options.ipawsDatas;


                        this.model.set("trainingMode",false);
                        if(ipawsDatas.senderAgency && ipawsDatas.senderAgency.ipawsFieldValues && ipawsDatas.senderAgency.ipawsFieldValues.length){
                            for(var i=0; i< ipawsDatas.senderAgency.ipawsFieldValues.length; i++){
                                if(ipawsDatas.senderAgency.ipawsFieldValues[i].defaultVal){
                                    this.model.set("sender",ipawsDatas.senderAgency.ipawsFieldValues[i].value);
                                    break;
                                }
                            }
                        }else{
                            ipawsDatas.senderAgency={
                                hidden:false,
                                ipawsFieldValues:[]
                            };
                        }
                        if(ipawsDatas.urgency && ipawsDatas.urgency.ipawsFieldValues && ipawsDatas.urgency.ipawsFieldValues.length){
                            for(var i=0; i< ipawsDatas.urgency.ipawsFieldValues.length; i++){
                                if(ipawsDatas.urgency.ipawsFieldValues[i].defaultVal){
                                    this.model.set("urgency",ipawsDatas.urgency.ipawsFieldValues[i].value);
                                }
                            }
                        }else{
                            ipawsDatas.urgency={
                                hidden:false,
                                ipawsFieldValues:[]
                            };
                        }
                        if(ipawsDatas.severity && ipawsDatas.severity.ipawsFieldValues && ipawsDatas.severity.ipawsFieldValues.length){
                            for(var i=0; i< ipawsDatas.severity.ipawsFieldValues.length; i++){
                                if(ipawsDatas.severity.ipawsFieldValues[i].defaultVal){
                                    this.model.set("severity",ipawsDatas.severity.ipawsFieldValues[i].value);
                                }
                            }
                        }else{
                            ipawsDatas.severity={
                                hidden:false,
                                ipawsFieldValues:[]
                            };
                        }
                        if(ipawsDatas.certainty && ipawsDatas.certainty.ipawsFieldValues && ipawsDatas.certainty.ipawsFieldValues.length){
                            for(var i=0; i< ipawsDatas.certainty.ipawsFieldValues.length; i++){
                                if(ipawsDatas.certainty.ipawsFieldValues[i].defaultVal){
                                    this.model.set("certainty",ipawsDatas.certainty.ipawsFieldValues[i].value);
                                }
                            }
                        }else{
                            ipawsDatas.certainty={
                                hidden:false,
                                ipawsFieldValues:[]
                            };
                        }
                        if(ipawsDatas.expireTime && ipawsDatas.expireTime.ipawsFieldValues && ipawsDatas.expireTime.ipawsFieldValues.length){
                            for(var i=0; i< ipawsDatas.expireTime.ipawsFieldValues.length; i++){
                                if(ipawsDatas.expireTime.ipawsFieldValues[i].defaultVal){
                                    this.model.set("expiredHours",ipawsDatas.expireTime.ipawsFieldValues[i].value);
                                }
                            }
                        }else{
                            ipawsDatas.expireTime={
                                hidden:false,
                                ipawsFieldValues:[]
                            };
                        }
                        if(ipawsDatas.sameCode && ipawsDatas.sameCode.ipawsFieldValues && ipawsDatas.sameCode.ipawsFieldValues.length){
                            var geoCodes = [];
                            for(var i=0; i< ipawsDatas.sameCode.ipawsFieldValues.length; i++){
                                if(ipawsDatas.sameCode.ipawsFieldValues[i].defaultVal){
                                    geoCodes.push(ipawsDatas.sameCode.ipawsFieldValues[i].value)
                                }
                            }
                            this.model.set("geoCodes", geoCodes);
                        }else{
                            ipawsDatas.sameCode={
                                hidden:false,
                                ipawsFieldValues:[]
                            };
                        }
                        var data_ = {modelData:this.options.modelData,ipawsDatas:ipawsDatas};
                        this.container.html(this.$el.html(this.ipawsTemplate([data_])));

                        //update by lzj
//                        if(ipawsDatas.senderAgency &&
//                           ipawsDatas.senderAgency.ipawsFieldValues &&
//                           ipawsDatas.senderAgency.ipawsFieldValues.length == 1){
//                            $('#ipaws_sender').attr("disabled",true);
//                        }

                        if(ipawsDatas.sameCode &&
                           ipawsDatas.sameCode.ipawsFieldValues &&
                           ipawsDatas.sameCode.ipawsFieldValues.length == 1){
                            var sameCodeArray = $(":checkbox[name='geoCodes']:checked");
                            sameCodeArray.each(function(){
                                $(this).attr("disabled",true);
                            });
                        }

                        this.$("#messageCount").text(this.messageMaxLength);
                        this.model.set("eventCode",this.$("select[name=event]").val());
                        this.model.set("event",this.$("select[name=event]>option:selected").text());
                        this.model.set("messageStatus",this.$("select[name=messageStatus]").val());
                        this.model.set("category",this.$("select[name=category]").val());
                        if(ipawsDatas.sameCode && ipawsDatas.sameCode.ipawsFieldValues && ipawsDatas.sameCode.ipawsFieldValues.length){
                            this.$("#ipaws_geoCodes_validator").val("true");
                        }
                        if(ipawsDatas.invalidSetting == false){
                            this.$("#ipaws_privateKey").rules("add",{
                                remote: {
                                    url: EB_Common.Ajax.wrapperUrl("/notifications/check/ipaws"),
                                    type: "get",
                                    data: {
                                        privateKey: function() {
                                            return that.$("#ipaws_privateKey").val();
                                        },
                                        keystorePassword:function(){
                                            return that.$("#ipaws_keystorePassword").val();
                                        }
                                    }
                                },
                                messages:{
                                    remote:i18n['notification.field.pulishMessage.ipaws.keystorePassword.valide.text']
                                }
                            });
                        }
                        return this;
                    },
                    events:{
                        "click #ipaws_isTrainingMode":"clickIsTrainingMode",
                        "change select[name=event]":"selectEvent",
                        "change select[name=messageStatus]":"selectMessageStatus",
                        "change select[name=category]":"selectCategory",
                        "change select[name=urgency]":"selectUrgency",
                        "change select[name=severity]":"selectSeverity",
                        "change select[name=certainty]":"selectCertainty",
                        "change select[name=expiredHours]":"selectExpirationHours",
                        "keyup #ipaws_privateKey":"udpatePrivateKey",
                        "keyup #ipaws_keystorePassword":"udpateKeyPassword",
                        "change #ipaws_sender":"udpateSender",
                        "change .ipaws_geoCodes":"updateGeoCodes",
                        "keyup #ipaws_ipawsMessage":"updateMessage",
                        "blur #ipaws_ipawsMessage":"updateMessage"
//                        "blur #ipaws_privateKey":"checkKeystorePassword",
//                        "blur #ipaws_keystorePassword":"checkPrivateKey"

                    },
                    changeGeoCodes:function(model){
                        if(model.get("geoCodes") && !!model.get("geoCodes").length){

                        }else{

                        }
                    },
                    clickIsTrainingMode:function(e){
                        if($(e.currentTarget).attr("checked")){
                            this.$el.addClass("redborder");
                            this.model.set("trainingMode",true);
                            this.$("#trainingmode_span").addClass("promptred");
                        }else{
                            this.$el.removeClass("redborder");
                            this.model.set("trainingMode",false);
                            this.$("#trainingmode_span").removeClass("promptred");
                        }
                    },
                    selectEvent:function(e){
                        this.model.set("eventCode",$(e.currentTarget).val());
                        this.model.set("event",$(e.currentTarget).find("option:selected").text());
                    },
                    selectMessageStatus:function(e){
                        this.model.set("messageStatus",$(e.currentTarget).val());
                    },
                    selectCategory:function(e){
                        this.model.set("category",$(e.currentTarget).val());
                    },
                    selectUrgency:function(e){
                        this.model.set("urgency",$(e.currentTarget).val());
                    },
                    selectSeverity:function(e){
                        this.model.set("severity",$(e.currentTarget).val());
                    },
                    selectCertainty:function(e){
                        this.model.set("certainty",$(e.currentTarget).val());
                    },
                    selectExpirationHours:function(e){
                        this.model.set("expiredHours",$(e.currentTarget).val());
                    },
                    udpatePrivateKey:function(e){
                        this.model.set("privateKey",$(e.currentTarget).val());
                    },
                    udpateKeyPassword:function(e){
                        this.model.set("keystorePassword",$(e.currentTarget).val());
//                        this.$("#ipaws_privateKey").removeData("previousValue").valid();
                    },
                    udpateSender:function(e){
                        this.model.set("sender",$(e.currentTarget).val());
                    },
                    checkMessageCount:function(e){
                        var length = $(e.currentTarget).val().countLength();
                        var remainedLenth = this.messageMaxLength-length;
                        if(remainedLenth<0){
                            var last = length+remainedLenth;
                            $(e.currentTarget).val($(e.currentTarget).val().substring2(0,last));
                            remainedLenth = 0;
                        }
                        this.$("#messageCount").text(remainedLenth);
                    },
                    updateGeoCodes:function(e){
                        var geoChecked = this.$(":checkbox[name='geoCodes']:checked");
                        var geoCodes = [];
                        if(!!geoChecked && geoChecked.length){
                            geoChecked.each(function(){
                                geoCodes.push($(this).val());
                            });
                        }
                        this.model.set("geoCodes",geoCodes);
                        if(geoCodes.length>0){
                            this.$("#ipaws_geoCodes_validator").val("true").valid();
                        }else{
                            this.$("#ipaws_geoCodes_validator").val("").valid();
                        }
                    },
                    updateMessage:function(e){
                        this.model.set("body",$(e.currentTarget).val());
                        this.checkMessageCount(e);
                    },
                    getJsonData:function(){
                        return this.model.toJSON();
                    }
                },
                getInstance:function(options){
                    var Model = Backbone.Model.extend(this.IPAWSModel);
                    var model = new Model();
                    var View = Backbone.View.extend(this.IPAWSView);
                    var view = new View({model:model,container:options.container,modelData:options.modelData, ipawsDatas:options.ipawsDatas});
                    return view;
                }
            },
            GenericOneWayApp:{
                GenericOneWayView:{
                    initialize:function(){
                        $.templates({
                            genericOneWayAppTemplate:$("#genericOneWayAppTemplate").html()
                        });
                        this.genericOneWayAppTemplate = $.render.genericOneWayAppTemplate;
                        this.container = this.options.container;
                        this.render();
                    },
                    events:{
                        "click :checkbox[name='receiveUrl']":"clickReceiveUrls"
                    },
                    render:function(){
                        var receiveEndPoints =this.options.genericOneWayDatas.receiveEndPoints;
                        var required_receiveUrlVal = "";
                        if( receiveEndPoints&& receiveEndPoints.length){
                            var selectedPoints = (this.options.modelData && this.options.modelData.genericOneWaySetting)?this.options.modelData.genericOneWaySetting.receiveEndPoints||[]:[];
                            for(var i=0; i< receiveEndPoints.length; i++){
                                for(var j =0; j< selectedPoints.length; j++){
                                    if(selectedPoints[j].receiveUrl == receiveEndPoints[i].receiveUrl){
                                        receiveEndPoints[i].checked = true;
                                        required_receiveUrlVal="true";
                                        break;
                                    }
                                }
                            }
                        }
                        var data_ = {modelData:this.options.modelData,required_receiveUrlVal:required_receiveUrlVal,receiveEndPoints:receiveEndPoints};
                        this.container.html(this.$el.html(this.genericOneWayAppTemplate([data_])));
                        return this;
                    },
                    clickReceiveUrls:function(e){
                        if($(e.currentTarget).attr("checked")){
                            this.$("#required_receiveUrl").val("true").valid();
                        }else{
                            if(this.$(":checked").length<1){
                                this.$("#required_receiveUrl").val("").valid();
                            }
                        }
                    },
                    getJsonData:function(){
                        var receiveUrls = [];
                        this.$(":checked").each(function(){
                            receiveUrls.push($(this).val());
                        });
                        return {receiveUrls:receiveUrls};
                    }
                },
                getInstance:function(options){
                    var View = Backbone.View.extend(this.GenericOneWayView);
                    var model = new Backbone.Model();
                    var view = new View({modelData:options.modelData,genericOneWayDatas:options.genericOneWayDatas, container:options.container, model:model});
                    return view;
                }
            }
        },
        PublishModel:{
            defaults:function(){
                return {
                    network:null,
                    ipwas:null,
                    alertus:null,
                    oneway:null
                }
            }
        },
        PublishView:{
            publishTemplate:null,
            subApps:{
                networkApp:null,
                ipawsApp:null
            },
            initialize:function(){
                this.network_permission = EB_Common.Security.protect("NETWORK_EFFECT_showNetworkEffect");
                this.ipaws_permission = EB_Common.Security.protect("TEMPLATE_send_ipaws");
                this.alertus_permission = EB_Common.Security.protect("ALERT_US");
                this.generic_permission = EB_Common.Security.protect("GENERIC_ONE_WAY");
                $.templates({
                    publishTemplate: $("#publishAppTemplate").html()
                });
                this.sourceData = this.options.sourceData;
                this.publishTemplate = $.render.publishTemplate;
                this.checkedCallback = this.options.checkedCallback;
                this.model.on("change:networkChecked",this.dealCheckNetwork, this);
                this.model.on("change:ipawsChecked",this.dealCheckIpaws, this);
                this.model.on("change:alertUsChecked",this.dealCheckAlertUs, this);
                this.model.on("change:genericOneWayChecked",this.dealCheckGeneric, this);
                this.render();
                if(this.model.get("networkEffectMessage")){
                    this.model.set("networkChecked",true);
                }
                if(this.model.get("ipawsMessage") && !this.options.isFollowUp){
                    this.model.set("ipawsChecked",true);
                }
                if(this.model.get("alertUsMessage")){
                    this.model.set("alertUsChecked",true);
                }
                if(this.model.get("genericOneyWayMessage")){
                    this.model.set("genericOneWayChecked",true);
                }
            },
            render:function(){
                if(this.network_permission || this.ipaws_permission || this.alertus_permission || this.generic_permission){
                    var data={
                        hasNetwork:true,
                        isFollowUp:this.options.isFollowUp,
                        hasIpaws:(this.sourceData.ipawsDatas&& (this.sourceData.ipawsDatas.invalidSetting==false))?true:false,
                        hasAlertUs:this.sourceData.alterUsDatas?true:false,
                        hasGeneric:(this.sourceData.genericOneWayDatas && this.sourceData.genericOneWayDatas.receiveEndPoints && this.sourceData.genericOneWayDatas.receiveEndPoints.length)?true:false,
                        publishDatas:this.model.toJSON()
                    };
                    this.$el.html(this.publishTemplate([data]));
                }

                return this;
            },
            events:{
                "click #checkbox_network":"networkChecked",
                "click #checkbox_ipaws":"ipawsChecked",
                "click #checkbox_alertUs":"alertUsChecked",
                "click #checkbox_generic":"genericOneWayChecked"
            },
            isChecked:function(){
                var model = this.model;
                return model.get("networkChecked") || model.get("ipawsChecked") || model.get("alertUsChecked") || model.get("genericOneWayChecked");
            },
            hasIpaws:function(){
                return this.model.get("ipawsChecked");
            },
            onlyHashIpaws:function(){
                return !this.model.get("networkChecked") && this.model.get("ipawsChecked") && !this.model.get("alertUsChecked") && !this.model.get("genericOneWayChecked");
            },
            exceuteCallback:function(){
                if($.isFunction(this.checkedCallback)){
                    this.checkedCallback.call(this,this.isChecked(), this.onlyHashIpaws(), this.hasIpaws());
                }
            },
            dealCheckNetwork:function(model){
                if(!this.network_permission){
                    return;
                }
                if(model.get("networkChecked")){
                    var options={
                        modelData:this.model.get("networkEffectMessage"),
                        sessionId:this.options.sessionId,
                        container:this.$("#div_network")
                    };
                    this.subApps.networkApp = view.notification.app.PublishApp.subApps.NetworkApp.getInstance(options);
                }else{
                    this.subApps.networkApp.remove();
                }
                this.exceuteCallback();
            },
            dealCheckIpaws:function(model){
                if(!this.ipaws_permission){
                    return;
                }
                if(model.get("ipawsChecked")){
                    var options = {
                        ipawsDatas:this.sourceData.ipawsDatas,
                        modelData:this.model.get("ipawsMessage"),
                        container:this.$("#div_ipaws")};
                    this.subApps.ipawsApp = view.notification.app.PublishApp.subApps.IPAWSApp.getInstance(options);
//                    this.$("#ipawsSetting_validate").addClass("required").valid();
                }else{
                    this.subApps.ipawsApp.remove();
//                    this.$("#ipawsSetting_validate").removeClass("required").valid();
                }
                this.exceuteCallback();
            },
            dealCheckAlertUs:function(model){
                if(!this.alertus_permission){
                    return;
                }
                if(model.get("alertUsChecked")){
                    var options={
                        alertUsDatas:this.sourceData.alterUsDatas,
                        modelData:this.model.get("alertUsMessage"),
                        container:this.$("#div_alertUs")};
                    this.subApps.alertUsApp = view.notification.app.PublishApp.subApps.AlertUsApp.getInstance(options);
                }else{
                    this.subApps.alertUsApp.remove();
                }
                this.exceuteCallback();
            },
            dealCheckGeneric:function(model){
                if(!this.generic_permission){
                    return;
                }
                if(model.get("genericOneWayChecked")){
                    var options={
                        genericOneWayDatas:this.sourceData.genericOneWayDatas,
                        modelData:this.model.get("genericOneyWayMessage"),
                        container:this.$("#div_generic")};
                    this.subApps.genericOneWayApp = view.notification.app.PublishApp.subApps.GenericOneWayApp.getInstance(options);
                }else{
                    this.subApps.genericOneWayApp.remove();
                }
                this.exceuteCallback();
            },
            networkChecked:function(e){
                var checkBox = $(e.currentTarget);
                if(checkBox.attr("checked")){
                    this.model.set("networkChecked",true);
                }else{
                    this.model.set("networkChecked",false);
                }
            },
            ipawsChecked:function(e){
                var checkBox = $(e.currentTarget);
                if(checkBox.attr("checked")){
                    this.model.set("ipawsChecked",true);
                }else{
                    this.model.set("ipawsChecked",false);
                }
            },
            alertUsChecked:function(e){
                var checkBox = $(e.currentTarget);
                if(checkBox.attr("checked")){
                    this.model.set("alertUsChecked",true);
                }else{
                    this.model.set("alertUsChecked",false);
                }
            },
            genericOneWayChecked:function(e){
                var checkBox = $(e.currentTarget);
                if(checkBox.attr("checked")){
                    this.model.set("genericOneWayChecked",true);
                }else{
                    this.model.set("genericOneWayChecked",false);
                }
            },
            getJsonData:function(){
                var data={};
                if(this.model.get("networkChecked")===true && this.network_permission && this.subApps.networkApp){
                    data.networkParam = this.subApps.networkApp.getJsonData();
                }
                if(this.model.get("ipawsChecked")===true && this.ipaws_permission && this.subApps.ipawsApp) {
                    data.ipawsParam = this.subApps.ipawsApp.getJsonData();
                }
                if(this.model.get("alertUsChecked")===true && this.alertus_permission && this.subApps.alertUsApp){
                    data.alertUsParam = this.subApps.alertUsApp.getJsonData();
                }
                if(this.model.get("genericOneWayChecked")===true && this.generic_permission && this.subApps.genericOneWayApp){
                    data.genericOneWayParam = this.subApps.genericOneWayApp.getJsonData();
                }
                return data;
            }
        },
        getInstance:function(options){
            var Model = Backbone.Model.extend(this.PublishModel);
            var model = new Model(options.modelData);
            var View = Backbone.View.extend(this.PublishView);

            var options1 = {
                model:model,
                sourceData:options.sourceData,
                el:options.container,
                sessionId:options.sessionId,
                checkedCallback:options.checkedCallback,
                isFollowUp:options.isFollowUp
            };
            var view = new View(options1);
            return view;
        }
    }
})(EB_View);