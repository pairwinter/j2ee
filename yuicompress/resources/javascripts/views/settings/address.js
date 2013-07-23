(function(view){
	view.settings = view.settings || {};
	view.settings.configer = {
		latDefault:37.09024,
        lngDefault:-95.712891	
	};
	        
	view.settings.template = {
		AddressApp:{
            AddressModel:Backbone.Model.extend({
                "default":function () {
                    return {
                        id:0,
                        streetAddress:"",
                        suite:"",
                        city:"",
                        state:"",
                        postalCode:"",
                        country:"",
                        locationName:"",
                        lon:"",
                        lat:"",
                        isSelected:false,
                        stateTypeInput:true
                    };
                }
            }),
            AddressCollection:Backbone.Collection.extend({
                parse: function(response) {
                    var addresses = response.addressList;
                    $.each(addresses,function(i,address){
                        address.expose=expose;
                        address.mandatory=mandatory;
                        address.editable=editable;
                        address.countries = response.countries;
                        address.states = response.states;
                        address.isSelected = false;
                        if(address.country=="US"){
                            address.stateTypeInput=false;
                        }else{
                            address.stateTypeInput=true;
                        }
                    });
                    return addresses;
                }
            }),
            AddressView:Backbone.View.extend({
                initialize:function () {
                    $.templates({addressInfoTemplate: $("#addressInfoTemplate").html()});
                    this.addressInfoTemplate = $.render.addressInfoTemplate;
                    this.infoRenderElement = $("#orgAddressCt");
                    this.model.on('change', this.render, this);
                    this.model.on('change:isSelected', this.renderSelected, this);
                },
                events:{
                    "click a.icn_close_12" : "removeAddress",
                },
                render:function () {
                    this.$el.html(this.addressInfoTemplate([this.model.toJSON()]));
                    return this;
                },
                renderSelected:function(){
                    if(this.model.get("isSelected")){
                        this.$el.addClass("selected");
                    }else{
                        this.$el.removeClass("selected");
                    }
                    return this;
                },
                showInfo:function(){
                    var address = this.model.toJSON();
                    //this.model.set({"isSelected":true});
                    var selectedModels = this.model.collection.where({"isSelected":true});
                    if(selectedModels.length>0){
                        for(var i=0;i<selectedModels.length;i++){
                            if(selectedModels[i].cid!=this.model.cid){
                                selectedModels[i].set({"isSelected":false});
                            }
                        }
                    }
                    var isSelected = false; // this.model.get("isSelected");
                    this.model.set({"isSelected":!isSelected});
                    if(isSelected){
                        address = {
                            editable:true,
                            countries:this.model.collection.expandData.countries,
                            states:$.merge([],this.model.collection.expandData.states)
                        };
                    }
                    address.stateCode=address.state;
                    this.infoRenderElement.html(this.addressInfoTemplate([address]));
                    this.infoRenderElement.find("#locateInMap").data("address",address);
                    if(address.stateTypeInput){
                        this.infoRenderElement.find("#state input").prop("disabled",false).show();
                        this.infoRenderElement.find("#state select").prop("disabled",true).hide();
                    }else{
                        this.infoRenderElement.find("#state input").prop("disabled",true).hide();
                        this.infoRenderElement.find("#state select").prop("disabled",false).show();
                    }
                    $("#addressAppAdd").removeClass("button").removeClass("display_none").addClass("display_none");
                    $("#addressAppNext").removeClass("button").removeClass("display_none").addClass("button");
                    
                    $("#addressAppSave").removeClass("display_none").addClass("button");
                    $("#addressAppSave1").removeClass("display_none").addClass("button");
                    $("#locationSubTitle").text("Edit a Location");
                },
                removeAddress:function(e){
                    e.stopPropagation();
                    var me = this;
                    var address = this.model;
                    me.model.destroy();
                    me.$el.remove();
                }

            }),
            AddressAppView:Backbone.View.extend({
            	geoLastSearch:{},
            	briefContext:null,
                collection:null,
                el:$("#addressApp"),
                initialize:function () {
                	this.briefContext = this.options.briefContext;
                    if(EB_View.ssp.configer.isRegister){
                        this.$("#addressAppNext").show();
                    }
                    $.templates({addressInfoTemplate: $("#addressInfoTemplate").html()});
                    this.addressInfoTemplate = $.render.addressInfoTemplate;
                    this.form = this.$("#addressApp_form");
                    this.form.data("app",this);
                    EB_Common.validation.validate(this.form,{submitHandler:this.save});
                    this.collection.on("add",this.addOne,this);
                    this.collection.on("reset",this.addAll,this);
                    var app = this;
                    this.collection.fetch({success:function(collection,response){
                        collection.expandData = {countries:$.merge([],response.countries),states:$.merge([],response.states),mandatory:response.mandatory, addresses:response.addressList};
                        app.render();
                    }});
                    EB_Common.Ajax.ajax({
                        url : EB_Common.Ajax.wrapperUrl('/address/mapcenter'),
                        data : {
                            orgId : EB_View.ssp.configer.orgId
                        },
                        type : 'get',
                        dataType : 'json',
                        success : function(resData){
                        	if (resData != null){
                        		EB_View.settings.configer.latDefault = resData.latitude;
                        		EB_View.settings.configer.lngDefault = resData.longitude;
                        	}
                        }
                    });


                },
                events:{
                    "blur input":"blurInput",
                    "blur select":"blurInput",
                    "change select[name='country']":"changeCountry",
                    "change select[id='selectGeo']":"changeGeo",
                    "click #locateInMap":"locateInMap",
                    "click #btnClear":"reRenderBrief"
                },
                blurInput:function(e){
                	this.getGeoCoding();
                },
                getGeoCoding:function(e){
                	var addressModel = this.getFormDataFroGeoCoding();
                	if(addressModel.country && addressModel.streetAddress){
                	    var geoSearchAddress={};
                	    geoSearchAddress.country = addressModel.country;
                	    geoSearchAddress.adminDistrict = addressModel.state;
                	    geoSearchAddress.addressLine = addressModel.streetAddress+" "+addressModel.suite+" "+addressModel.city;
                	    geoSearchAddress.postalCode = addressModel.postalCode;
                        isSameAsLast = this.checkGeoSearch(-1,addressModel.country+" "+addressModel.state+" "+ addressModel.streetAddress+" "+addressModel.suite+" "+addressModel.city+" "+addressModel.postalCode);
                        if(isSameAsLast){
                             return ;
                        }
                        var json = JSON.stringify(geoSearchAddress).encode64();
                		EB_Common.Ajax.post('/address/getgeo/json?version='+new Date().getMilliseconds()+Math.random(),{
	        	            rs:json
	        	        },function(data){
	        	        	$("#selectGeo").find("option:gt(0)").remove();
	        	            if(data && data.length>0){
	        	                $(data).each(function(i,e){
	        	                    var option = $("<option>").attr("lon",e.longitude)
	        	                            .attr("lat",e.latitude)
	        	                            .text(e.addressLine+" "+ e.country);
	        	                    $("#selectGeo").append(option);
	        	                });
	        	            }
	        	        },'json'); 
                	}
                },
            	checkGeoSearch:function(key,val){
            	    if(!this.geoLastSearch['"'+key+'"']){
            	        this.geoLastSearch['"'+key+'"']="";
            	    }
            	    if(this.geoLastSearch['"'+key+'"'] !=val){
            	        this.geoLastSearch['"'+key+'"'] = val;
            	        return false;
            	    }
            	    return true;
            	},
                render:function(){
                    var data={
                        editable:true,
                        countries:this.collection.expandData.countries,
                        states:$.merge([],this.collection.expandData.states)
                    };
                    this.$("#addressApp_ul").html(this.addressInfoTemplate([data]));
                },
                changeGeo:function(e){
            	    if($(e.target).val()){
            	        var option = $(e.target).find("option:selected");
            	    	var lonVal = option.attr("lon");
                        var latVal = option.attr("lat");
                        if(lonVal && latVal){
            	   	        $("#lon").val(lonVal);
            	   	    	$("#lat").val(latVal);
                        }
            	    }
                },
                changeCountry:function(e){
                    var select = $(e.target);
                    if(select.val()=="US"){
                        this.$("#state input").prop("disabled",true).hide();
                        this.$("#state select").prop("disabled",false).show();
                    }else{
                        this.$("#state input").prop("disabled",false).show();
                        this.$("#state select").prop("disabled",true).hide();
                    }
                },
                clearClick:function(){
                	this.clearFormData();
                },
                getFormDataFroGeoCoding:function(){
                    var addressVo ={};
                    this.form.find("input[name],select[name]").each(function(){
                        var input = $(this);
                        if(input.attr("name") && (!input.prop("disabled"))){
                            var val ="";
                            val = input.val();
                            if (input.attr("name") == "country")
                            	val = input.find("option:selected").text();
                            addressVo[input.attr("name")] = val;
                        }
                    });
                    return addressVo;
                },
                getFormData:function(){
                    var addressVo ={};
                    this.form.find("input[name],select[name]").each(function(){
                        var input = $(this);
                        if(input.attr("name") && !input.prop("disabled") && input.is(':visible')){
                            var val ="";
                            if(input.valid()){
                                val = input.val();
                            }
                            addressVo[input.attr("name")] = val;
                        }
                    });
                    return addressVo;
                },
                clearFormData:function(){
                	$(".my_disabled").removeAttr("disabled");
                	$("#selectGeo").find("option:gt(0)").remove();
                	this.form.find("input[name],select[name]").each(function(){
                		var input = $(this);
                		if ( input.attr("name") && !input.prop("disabled")) {
                    		input.val("");                			
                		}
                	});
                	$(".my_disabled").attr("disabled","disabled");
                },
                reRenderBrief:function(){
                	this.renderBrief();
                },
                addOne:function(address){
                    var addressView = new EB_View.ssp.app.AddressApp.AddressView({model:address});
                    this.$("#addressApp_list").append(addressView.render().el);
                },
                addAll:function(){
                    this.$("#addressApp_list").empty();
                    this.collection.each(this.addOne);
                    this.renderBrief();
                },
                locateInMap:function(e){
                    e.preventDefault();
                    var addressModel = this.getFormData();
                    //count latitude and longitude
                    var latitude = EB_View.settings.configer.latDefault,longitude = EB_View.settings.configer.lngDefault,contryAddress,isAddress;
                    if(addressModel.streetAddress != '' || addressModel.city != '' || addressModel.state != '' || addressModel.country != '' || addressModel.postalCode != ''){
                        contryAddress = addressModel.streetAddress + ',' + addressModel.city + ',' + addressModel.state + ',' + addressModel.country + ',' + addressModel.postalCode;
                        isAddress = true;
                    }
                    var regions = {
                        country : addressModel.country,
                        city : addressModel.city,
                        state : addressModel.state,
                        address : addressModel.streetAddress,
                        postalCode : addressModel.postalCode,
                        latitude : latitude,
                        longitude : longitude,
                        contryAddress : contryAddress,
                        isAddress : isAddress
                    };
                    var me = this;
                    EB_Common.gmaps.initialize({
                        callbackFn : me.mapCallback,
                        regions: regions
                    });
                },
                mapCallback:function(ct,data){
                    if(!data){
                        return;
                    }
                    var app =  EB_View.ssp.app.AddressApp.view;
                    var oldAddress = app.getFormData();
                    var address = {};
                    address.id = oldAddress.id;
                    address.locationName = oldAddress.locationName;
                    address.editable = true;
                    address.country = data.country;
                    address.city = data.city;
                    address.state = data.state;
                    address.stateCode = EB_Common.gmaps.stateMap[data.stateCode];
                    address.streetAddress = data.address;// ? data.address.substring(0, data.address.lastIndexOf(',')) : '',
                    address.lat = data.latitude;
                    address.lon = data.longitude;
                    address.postalCode = data.postalCode;
                    if(address.country=="US"){
                        address.stateTypeInput = false;
                    }else{
                        address.stateTypeInput = true;
                    }
                    address.countries = app.collection.expandData.countries;
                    address.states = app.collection.expandData.states;
                    app.$("#addressApp_ul").html(app.addressInfoTemplate([address]));
                }
            }),
            run:function(){
                if(!this.view){
                    this.collection = new this.AddressCollection({model:this.AddressModel});
                    this.view = new this.AddressAppView({collection:this.collection, briefContext:$("#addressAppBrief")});
                    
                }else{
                	if (EB_View.ssp.configer.isShowContainer) this.view.$el.show();
                }
            }
        }	
	};
})(EB_View);