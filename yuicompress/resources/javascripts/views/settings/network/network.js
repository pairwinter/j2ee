/**
 * Network - Participant
 *
 * @author Linder Wang
 */
(function(view) {
    var pub = {
        initOrgIdentity: function(sessionId) {
            //init form validate
            EB_Common.validation.validate("orgIdentityForm", {
                submitHandler: function() {
                    var shapeType = $('input[name="shapeRadio"]:checked').val();
                    if(shapeType == "UploadShape")
                        $('#shapeFilePath').val($("#regionLibrayDiv2").find("span").attr("regionPath"));

                    if(shapeType === 'UploadShape' && $('#shapeFilePath').val() == '' ){
//                		EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
                        EB_Common.dialog.alert('Please upload a shape file first!',i18n['dialog.title.warning']);
                        return false;
                    }

                    if(shapeType === 'SelectRegion' && ($('#regionLibraryId').val() == '' || $("#selectValue").val() != "1")){
//                		EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
                        EB_Common.dialog.alert('Please select a shape first!',i18n['dialog.title.warning']);
                        return false;
                    }

                    var options = {
                        url: EB_Common.Ajax.wrapperUrl("/settings/network/orgIdentity/save") ,
                        type : 'POST',
                        dataType : 'json',
                        success : function(data) {
                            var setting = data.data;
                            if(setting.displayLogo){
                                $('#logoIcon').attr('src',EB_Common.Ajax.wrapperUrl("/settings/network/orgIdentity/logo?t=" + Date.parse(new Date())));
                                $('#imageDiv').show();
                                $('#fileDiv').hide();
                            }

                            if(setting.responsibilityArea && setting.responsibilityArea.length > 0){
                                $('#shapesDiv').show();
                                $('#networkShape').hide();
                            }
                            EB_Common.ToolPrompt.show('save',i18n['glocal.savesuccess']);
                            EB_Common.LeavePage.resetState();
                        },
                        failure:function(data){
                            console.info(data);
                        }
                    };


                    $('#orgIdentityForm').ajaxSubmit(options);
                    //return false;

                    var val = $('input[name="area"]:checked').val();
                    if(val == 'uploadShape'){
                        $('#uploadShape input').hide();
                        $('#uploadShape div').show();
                    }
                }
            });

            var options={
                sessionId:sessionId,
                container:$("#networkShape")
            };
            var instance = EB_View.notification.app.PublishApp.subApps.NetworkApp.getInstance(options);

            $('#save').click(function(){
                var jsonData =instance.model.toJSON();
                if(jsonData.affectedAreaMethod === 'UploadShape'){
//                    $('#shapeFilePath').val(jsonData.shapeFilePath);
                }else{
                    $('#regionLibraryId').val(jsonData.regionLibraryId);
                }
                $('#orgIdentityForm').submit();
            });

            $('#displayLogo').change(function() {
                var checked = $(this).attr('checked');
                $('#logoCt')[checked ? 'show' : 'hide']();
            });
            $('input[name="area"]').click(function() {
                var val = $(this).val();
                $('#' + val).show().siblings().hide();
            });
            $('#removeShape').click(function(){
                $('#uploadShape input').show();
                $('#uploadShape div').hide();
                return false;
            });
            $('#deleteImg').click(function(){
                $('#imageDiv').hide();
                $('#fileDiv').show();
            });
            $('#deleteShapes').click(function(){
                $('#shapesDiv').hide();
                $('#networkShape').show();
                instance = EB_View.notification.app.PublishApp.subApps.NetworkApp.getInstance(options);
            });
        },

        initRadioAction: function(name, container){
            $('input[name="'+name+'"]').click(function(){
                if($(this).val() == "all"){
                    container.hide();
                }else{
                    container.show();
                }
            });
        },

        initSubscriptions: function() {
            var checkboxs = $('#subCategories');
            checkboxs.find(':checkbox').attr('checked',false);
            $('#subCategoryList > li').each(function(){
                var id = $(this).attr('name');
                checkboxs.find('input[value="'+id+'"]').attr('checked',true);
            });
        },

        initSubscribe: function() {
            var me = this;
            me.initSubscriptions();
            me.initRadioAction('subscription', $("#subCategoryList"));
            me.initRadioAction('address', $("#orgAddressCt"));
            //init form validate
            EB_Common.validation.validate("subScribeForm", {
                submitHandler: function() {
                    var allSubscribeCategories = $('input[name="subscription"]:checked').val() == "all" ? true :false;
                    var allSubscribeAddresses = $('input[name="address"]:checked').val() == "all" ? true :false;
                    var addresses = [];
                    var subscribes = [];
                    if(!allSubscribeCategories){
                        $('#subCategoryList li').each(function(){
                            subscribes.push($(this).attr('name'));
                        });
                    }
                    if(!allSubscribeAddresses){
                        $('#address_div > .subdiv_graybox').each(function(){
                            var container =$(this),  address = {};
                            address = {};
                            address.locationName = container.find('input[name="address[x].locationName"]').val();
                            address.streetAddress = container.find('input[name="address[x].streetAddress"]').val();
                            address.suite = container.find('input[name="address[x].suite"]').val();
                            address.city = container.find('input[name="address[x].city"]').val();
                            address.state = container.find('[name="address[x].state"]').val();
                            address.postalCode = container.find('input[name="address[x].postalCode"]').val();
                            address.country = container.find('select[name="address[x].country"] > option:selected').val();
                            address.gisLocation = {};
                            address.gisLocation.lon = container.find('input[name="address[x].gisLocation.lon"]').val();
                            address.gisLocation.lat = container.find('input[name="address[x].gisLocation.lat"]').val();

                            addresses.push(address);
                        });
                    }
                    EB_Common.Ajax.post("/settings/network/subscribe",
                        {
                            allSubscribeCategories : allSubscribeCategories,
                            allSubscribeAddresses : allSubscribeAddresses,
                            address : EB_Common.json.stringify(addresses),
                            subscribe : EB_Common.json.stringify(subscribes)
                        },
                        function(data){
                            EB_Common.ToolPrompt.show('save',i18n['glocal.savesuccess']);

                            //reset Leave Page State
                            EB_Common.LeavePage.resetState();
                        });

                }
            });

            $('#save').click(function(){
                $('#subScribeForm').submit();
            });

            $.validator.addMethod('searchForGeoAddress', function (value, element) {
                return !(/[\[\]\!\@\$\%\^\&\*\?\<\>\\\:]/.test(value));
            }, i18n['global.valid.text.addressInfo']);

            $.validator.addMethod('postalcode', function(value, element) {
                var contryCode = $(element).closest('table').find('select[name="address[x].country"]').val();
                if (contryCode === "US") {
                    return !value || /^\d{5}-?\d{4}$|^\d{5}$/.test(value);
                } else {
                    return !value || value.length <= 10;
                }
            }, i18n['global.valid.text.postalCode']);

            //Subscriptions specific categories
            $('#updateSubCategories').click(function() {
                if($('input[name="subscription"]:checked').val() == 'all'){
                    return ;
                }
                if (!me.subDialogOpen) {
                    EB_Common.dialog.dialog('subCategories', {
                        autoOpen: false,
                        title: 'Select categories',
                        open: function(event, ui) {

                        }
                    }, function() {
                        var inputs = $('#subCategories dl input').filter(':checked'),
                            categoryList = $('#subCategoryList').empty();

                        inputs.each(function(index, element) {
                            var span =  $(this).next();
                            categoryList.append('<li name="'+ span.attr("name") +'">' + span.text() + '</li>');
                        });
                    });
                    me.subDialogOpen = true;
                }
                me.initSubscriptions();
                $('#subCategories').dialog('open');
                return false;
            });


            $('input[name="effect"]').click(function() {
                var val = $(this).val();
                $('#orgAddressCt')[val == 'all' ? 'hide' : 'show']();
            });

            $("select[name='address[x].country']").change(function() {
                var parentTable = $(this).closest('table');
                if ($(this).val() == 'US') {
                    var selectEL = $('#state_select').clone(true, true);
                    parentTable.find("input[name='address[x].state']").replaceWith(selectEL);
                } else {
                    var inputEl = $('#state_input').clone(true, true);
                    parentTable.find("select[name='address[x].state']").replaceWith(inputEl);
                }

            });

            // Add an address
            $("#addNewAddress").click(function() {
                var newTable = $("#address_clone div:first").clone(true, true);
                $("#address_div").append(newTable);
                if ($("#address_div >div").size() >= 5) {
                    $('#add_address_btn').hide();
                }
            });

            //Remove Address
            $("a[name='removeAddress']").click(function() {
                if ($("#address_div > div").size() == 1) {
                    return false;
                }

                $(this).parent().parent().remove();
                if ($("#address_div > div").size() < 5) {
                    $('#add_address_btn').show();
                }

                return false;
            });

            //Find the Geo Address

            $('.searchForGeoAddress').change(function() {
                var parentTable = $(this).closest('table');
                var country = parentTable.find('select[name$=".country"]'),
                    streetAddress = parentTable.find('input[name$=".streetAddress"]'),
                    suite = parentTable.find('input[name$=".suite"]'),
                    city = parentTable.find('input[name$=".city"]'),
                    state = parentTable.find('input[name$=".state"]'),
                    postalCode = parentTable.find('input[name$=".postalCode"]');
                if(state.length == 0){
                    state = parentTable.find('select[name$=".state"]');
                }
                var isValid = country.valid() && streetAddress.valid() && city.valid() && state.valid() && postalCode.valid();
                if (!isValid) {
                    return;
                }
                var contryVal = country.find('option:selected').attr('countryfullname'),
                    streetAddressVal = streetAddress.val(),
                    suiteVal = suite.val(),
                    cityVal = city.val(),
                    stateVal = state.val(),
                    postalCodeVal = postalCode.val();

                var selectGeo = parentTable.find('select[name="selectForGeoLocation"]');
                if (contryVal && streetAddressVal) {
                    EB_Common.Ajax.post('/contacts/getgeo/json?version=' + new Date().getMilliseconds(), {
                        country: contryVal,
                        adminDistrict: stateVal,
                        addressLine: streetAddressVal + " " + suiteVal + " " + cityVal,
                        postalCode: postalCodeVal
                    }, function(data) {
                        selectGeo.find('option:gt(0)').remove();
                        if (data && data.length > 0) {
                            var options = $(data).map(function(i, element) {
                                return '<option value="' + element.addressLine + '" lon="' + element.longitude + '" lat="' + element.latitude + '">' + element.addressLine + ' ' + element.country + '</option>';
                            }).get().join('');
                            selectGeo.append(options);
                        }
                    }, 'json');
                }
            });

            // Select Address change event
            $('select[name="selectForGeoLocation"]').change(function() {
                var el = $(this),
                    val = el.val();
                if (val && val != -1) {
                    var option = el.find('option:selected');
                    var parentTable = el.closest('table');
                    var lon = parentTable.find(":input[name$='.gisLocation.lon']");
                    var lat = parentTable.find(":input[name$='.gisLocation.lat']");
                    var lonVal = option.attr("lon");
                    var latVal = option.attr("lat");
                    if (lonVal && latVal) {
                        lon.val(lonVal);
                        lat.val(latVal);
                    }
                }
            });
            this.initLocateInMap();
        },
        //init LocateInMap
        initLocateInMap: function() {
            // locate the region
            var latDefault = 37.09024,
                lngDefault = -95.712891;
            var callbackFn = function(ct, data) {
                if (!data) {
                    return;
                }
                var country = data.country,
                    city = data.city,
                    state = data.state,
                    address = data.address,
                    latitude = data.latitude,
                    longitude = data.longitude,
                    postalCode = data.postalCode;
                ct.find('select[name*="country"]').val(country);
                ct.find('input[name*="city"]').val(city);
                ct.find('select[name*="country"]').change();
                if (country == 'US') {
                    ct.find('select[name*="state"]').val(state);
                } else {
                    ct.find('input[name*="state"]').val(state);
                }
                ct.find('input[name*=streetAddress]').val(address);
                ct.find('input[name*=postalCode]').val(postalCode);
                ct.find('input[name*="gisLocation.lon"]').val(longitude);
                ct.find('input[name*="gisLocation.lat"]').val(latitude);
                try {
                    ct.find('input[name$="streetAddress"]').change();
                } catch (e) {
                }
            };
            EB_Common.Ajax.ajax({
                url: '/settings/gis/mapcenter',
                type: 'get',
                dataType: 'json',
                async : false,
                success: function(resData) {
                    latDefault = resData.latitude;
                    lngDefault = resData.longitude;
                }
            });

            $('#address_div').on('click', 'a[name="locateInMap"]', function(e) {
                e.preventDefault();
                var ct = $(this).closest('table'),
                    lngE = ct.find('input[name*="gisLocation.lon"]'),
                    latE = ct.find('input[name*="gisLocation.lat"]'),
                    locationName = ct.find('input[name*="locationName"]').val(),
                    country = ct.find('select[name*="country"]'),
                    city = $.trim(ct.find('input[name*="city"]').val()),
                    stateEl = ct.find('select[name*="state"]'),
                    state = $.trim(stateEl.length == 0 ? ct.find('input[name*="state"]').val() : stateEl.val()),
                    address = $.trim(ct.find('input[name*=streetAddress]').val()),
                    postalCode = $.trim(ct.find('input[name*=postalCode]').val()),
                    latVal,
                    lngVal;

                if (country.val() == '') {
                    country = '';
                } else {
                    country = country[0].options[country[0].selectedIndex].text;
                }

                latVal = latE.valid() ? latE.val() : '';
                lngVal = lngE.valid() ? lngE.val() : '';

                //count latitude and longitude
                var latitude = latDefault,
                    longitude = lngDefault,
                    contryAddress,
                    isAddress;
                if (address != '' || city != '' || state != '' || country != '' || postalCode != '') {
                    contryAddress = address + ',' + city + ',' + state + ',' + country + ',' + postalCode;
                    isAddress = true;
                }

                var regions = {
                    locationName: locationName,
                    country: country,
                    city: city,
                    state: state,
                    address: address,
                    postalCode: postalCode,
                    latitude: latitude,
                    longitude: longitude,
                    contryAddress: contryAddress,
                    isAddress: isAddress
                };
                EB_Common.gmaps.initialize({
                    callbackFn: callbackFn,
                    locatedCt: ct,
                    regions: regions
                });
            });
        },

        /**
         * init alertus module
         * @returns {}
         */
        initAlertUs: function(){
            var me = this;
            me.initAlertUsTable();
            //init form validate
            EB_Common.validation.validate("addAlertUsForm", {
                rules : {
                    'name' : {
                        remote : {
                            url : EB_Common.Ajax.wrapperUrl('/settings/network/alertus/checkName'),
                            type : "POST",
                            data : {
                                id : 0,
                                name : function() {
                                    return $.trim($("#addName").val());
                                }
                            }
                        }
                    }
                },
                messages : {
                    'name' : {
                        remote : i18n['setting.contact.subscriptionFields.name.duplicate']
                    }
                },
                submitHandler: function() {
                    var alertUs = {};
                    alertUs.name = $('#addName').val();
                    alertUs.url = $('#addUrl').val();
                    alertUs.profileId = $('#addProfileId').val();
                    alertUs.profileName = $('#addProfileId').find("option:selected").text();
                    alertUs.alertUsMode = $('#addressMode').find("option:selected").val();
                    var groups = [];
                    if(alertUs.alertUsMode == 'group'){
                        $('#addGroupId').find('option:selected').each(function(){
                            var me = $(this), group ={};
                            group.groupId = me.val();
                            group.groupName = me.text();
                            groups.push(group);
                        });
                    }
                    alertUs.groups = groups;
                    alertUs.duration = $('#duration').val();
                    alertUs.alertUsMode = $('#addressMode').find("option:selected").val();

                    EB_Common.Ajax.post("/settings/network/alertus",{
                        alertUs : EB_Common.json.stringify(alertUs)
                    },function(data){
                        $('#addAlertUsForm').hide();
                        $('#alertUsTable').jqGrid().trigger("reloadGrid");
                        EB_Common.LeavePage.resetState();
                    });
                }
            });

            $('#saveAlertUs').click(function(){
                $('#addAlertUsForm').submit();
            });

        },

        resetAlertUsTable:function(){
            $('#addName').val('');
            $('#addUrl').val('');
            $('#addProfileId').find('option').remove();
            $('#addGroupId').find('option').remove();
        },

        initAlertUsTable:function(){
            var me = this;
            $('#addAlertUs').click(function(){
                me.resetAlertUsTable();
                $('#addAlertUsForm').show();
                $("#insertRow").remove();
            });
            $('#cancel').click(function(){
                $('#addAlertUsForm').hide();
                EB_Common.LeavePage.resetState();
            });
            $('#load').click(function(){
                me.loadAlertUsData($(this));
            });
            me.initAlertMode($('#addAlertUsForm').find('select[name="addressMode"]'));

            $('#alertUsTable').jqGrid({
                autoencode : true,
                url : EB_Common.Ajax.wrapperUrl('/settings/network/alertus/list'),
                height : "auto",
                datatype : 'json',
                emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                autowidth : true,
                colNames : [ i18n['setting.contact.subscriptionFields.name'], i18n['setting.publish.alertus.url'], i18n['user.create.group.label'], i18n['setting.publish.alertus.profile'],'' ],
                colModel: [
                    {
                        name : 'name',
                        index : 'name',
                        sortable : false,
                        width: 40
                    },
                    {
                        name : 'url',
                        index : 'url',
                        sortable : false,
                        width: 80
                    },
                    {
                        name : 'groups',
                        index : 'groups',
                        sortable : false,
                        width: 30,
                        formatter : function(value, rec) {
                            var groups = '';
                            for ( var i = 0; i < value.length; i++) {
                                var group = value[i];
                                if(groups != ''){
                                    groups += '/ ';
                                }
                                groups += group.groupName;
                            }
                            return groups;
                        }
                    },
                    {
                        name : 'profileName',
                        index : 'profileName',
                        sortable : false,
                        width: 30
                    },

                    {
                        name : 'id',
                        index : 'id',
                        sortable : false,
                        width: 20,
                        formatter : function(value, rec) {
                            return '<span class="icn_edit_16" title="'+i18n['button.edit']+'"></span><span class="icn_trash_16"  title="'+i18n['button.delete']+'">&nbsp;</span>';
                        }
                    }

                ],
                rowNum : "totalCount",
                jsonReader : {
                    root : "data",
                    page : "currentPageNo",
                    total : "totalPageCount",
                    records : "totalCount",
                    repeatitems : false
                },
                onSelectRow : function(id) {},
                loadComplete : function() {
                    var edit = false;
                    $('.icn_edit_16').click(function(e){
                        if(edit) return;
                        edit = true;
                        $('form').hide();
                        var row = $(this).closest('tr');
                        var id = row.attr('id');
                        if (row.next().attr('name') == 'insertRow') {
                            $("#insertRow").remove();
                            edit = false;
                            return;
                        } else {
                            $("#insertRow").remove();
                            EB_Common.Ajax.get("/settings/network/alertus/"+id,{time : new Date().getTime()},
                                function(data) {
                                    var updateTable = $($("#updateAlertUs").render(data));
                                    var tr = $("<tr name='insertRow' id='insertRow' style='background:#FAECDF'><td colspan='5' style='border-bottom:1px solid #DDDDDD'></td></tr>");
                                    tr.find("td").append(updateTable);
                                    var updateForm = tr.insertAfter(row);
                                    var groups = data.setting.groups;
                                    $('#updateGroupId').find('option').attr('selected',false);
                                    for ( var i = 0; i < groups.length; i++) {
                                        $('#updateGroupId').find('option[value="'+ groups[i].groupId +'"]').attr('selected',true);
                                    }
                                    me.updateAlertUs(id, updateForm);
                                    me.initAlertMode(updateForm.find('select[name="addressMode"]'));
                                    edit = false;
                                }
                            );
                        }
                    });

                    $('.icn_trash_16').click(function(e){
                        e.stopPropagation();
                        EB_Common.Ajax.remove("/settings/network/alertus",{
                            id:$(this).closest('tr').attr('id')
                        },function(data){
                            $('#alertUsTable').jqGrid().trigger("reloadGrid");
                            EB_Common.LeavePage.resetState();
                        });
                    });
                }

            });
        },

        initAlertMode:function(selector){
            var group = selector.closest('tr').next();
            selector.change(function(){
                if($(this).val() == 'all'){
                    group.hide();
                }else{
                    group.show();
                }
            });
        },

        updateAlertUs:function(id, container){
            container.find('form').validate({
                rules : {
                    'name' : {
                        remote : {
                            url : EB_Common.Ajax.wrapperUrl('/settings/network/alertus/checkName'),
                            type : "POST",
                            data : {
                                id : id,
                                name : function() {
                                    return $.trim($("#updateName").val());
                                }
                            }
                        }
                    }
                },
                messages : {
                    'name' : {
                        remote : i18n['setting.contact.subscriptionFields.name.duplicate']
                    }
                },
                submitHandler : function() {
                    var alertUs = {};
                    alertUs.id = id;
                    alertUs.name = $('#updateName').val();
                    alertUs.url = $('#updateUrl').val();
                    alertUs.profileId = $('#updateProfileId').val();
                    alertUs.profileName = $('#updateProfileId').find("option:selected").text();
                    alertUs.alertUsMode = $('#updateAddressMode').find("option:selected").val();

                    var groups = [];
                    if(alertUs.alertUsMode == 'group'){
                        $('#updateGroupId').find(':selected').each(function(){
                            var me = $(this), group ={};
                            group.groupId = me.val();
                            group.groupName = me.text();
                            groups.push(group);
                        });
                    }
                    alertUs.groups = groups;
                    alertUs.duration = $('#updateDuration').val();

                    EB_Common.Ajax.put("/settings/network/alertus",{
                        alertUs : EB_Common.json.stringify(alertUs)
                    },function(data){
                        $("#insertRow").remove();
                        $('#alertUsTable').jqGrid().trigger("reloadGrid");
                        EB_Common.LeavePage.resetState();
                    });
                }
            });
            container.find('.button.orange').click(function(){
                $('#updateAlertUsForm').submit();
            });
            container.find('.button.gray').click(function(){
                $("#insertRow").remove();
            });
        },

        loadAlertUsData:function(button){
            var me = this,
                url = button.prev().val(),
                table = button.closest('table'),
                profile = table.find('select[name="profileId"]'),
                group = table.find('select[name="groupId"]');
            if(url == '') return;
            EB_Common.Ajax.get("/settings/network/alertus/data",{url : url},
                function(data) {
                    var groups = data.groups,
                        profiles = data.profiles;

                    if(groups){
                        me.initSelector(group, groups);
                    }
                    if(profiles){
                        me.initSelector(profile, profiles);
                    }
                });
        },

        initSelector: function(container, data){
            container.find('option').remove();
            var length = data.length,
                options = [];
            for ( var i = 0; i < length; i++) {
                var d = data[i];
                var id = 'id' in d ? d.id : d.groupId;
                var name = 'name' in d ? d.name : d.groupName;
                name = name == null ? '' : name;
                var option = '<option value='+ id +'>' + name + '</option>';
                options.push(option);
            }
            container.append(options.join(""));
        },

        /**
         * init Generic module
         * @returns {}
         */
        initGeneric: function(){
            var me = this;
            me.initSubscribeUrlTable();
            EB_Common.validation.validate("addUrlForm", {
                submitHandler: function() {
                    EB_Common.Ajax.post("/settings/network/generic",{
                        url:$('#addUrl').val(),
                        displayName:$('#addDisplayName').val(),
                        username:$('#addUsername').val(),
                        password:$('#addPassword').val()
                    },function(data){
                        $('#addUrlForm').hide();
                        $('#subscribeUrlTable').jqGrid().trigger("reloadGrid");
                        EB_Common.LeavePage.resetState();
                    });
                }
            });

            $('#saveUrl').click(function(){
                $('#addUrlForm').submit();
            });

            $('#test').click(function(){
                var url = $(this).closest('td').find('input').val();
                window.open(url);
            });
        },

        initSubscribeUrlTable:function(){
            var me = this;
            $('#addSubscribeUrl').click(function(){
                me.resetSubscribeUrlTable();
                $('#addUrlForm').show();
                $("#insertRow").remove();
            });

            $('#cancel').click(function(){
                $('#addUrlForm').hide();
                EB_Common.LeavePage.resetState();
            });

            $('#subscribeUrlTable').jqGrid({
                autoencode : true,
                url : EB_Common.Ajax.wrapperUrl('/settings/network/generic/list'),
                height : "auto",
                datatype : 'json',
                emptyDataCaption : i18n['global.grid.emptyDataCaption'],
                autowidth : true,
                colNames : [ i18n['setting.publish.alertus.url'], i18n['setting.publish.generic.displayName'], i18n['twitterthreshold.field.username'], i18n['security.login.form.password'],'', '' ],
                colModel : [
                    {
                        name : 'receiveUrl',
                        index : 'receiveUrl',
                        sortable : false,
                        width: 80
                    },
                    {
                        name : 'displayName',
                        index : 'displayName',
                        sortable : false,
                        width: 40
                    },
                    {
                        name : 'credential.userName',
                        index : 'credential.userName',
                        sortable : false,
                        width: 40
                    },
                    {
                        name : 'credential.password',
                        index : 'credential.password',
                        sortable : false,
                        width: 40,
                        formatter : function(value, rec) {
                            return '******';
                        }
                    },
                    {
                        name : 'credential.password',
                        index : 'credential.password',
                        sortable : false,
                        hidden : true
                    },
                    {
                        name : '',
                        index : '',
                        sortable : false,
                        width: 20,
                        formatter : function(value, rec) {
                            return '<span class="icn_edit_16" title="'+i18n['button.edit']+'"></span><span class="icn_trash_16" title="'+i18n['button.delete']+'">&nbsp;</span>';
                        }
                    }

                ],
                rowNum : "totalCount",
                jsonReader : {
                    root : "data",
                    page : "currentPageNo",
                    total : "totalPageCount",
                    records : "totalCount",
                    repeatitems : false
                },
                loadComplete : function() {
                    $('.icn_edit_16').click(function(){
                        $('form').hide();
                        var row = $(this).closest('tr');
                        var id = row.attr('id');
                        if (row.next().attr('name') == 'insertRow') {
                            $("#insertRow").remove();
                            return;
                        }
                        var urlTd = row.find('td:first'), displayNameTd = urlTd.next(), usernameTd = displayNameTd.next(), passwordTd = usernameTd.next().next();
                        $("#insertRow").remove();
                        var updateTable = $($("#updateSubscribeUrl").render({url:urlTd.text(),displayName:displayNameTd.text(),username:usernameTd.text(),password:passwordTd.text()}));
                        var tr = $("<tr name='insertRow' id='insertRow' style='background:#FAECDF'><td colspan='5' style='border-bottom:1px solid #DDDDDD'></td></tr>");
                        tr.find("td").append(updateTable);
                        var updateForm = tr.insertAfter(row);
                        me.updateSubscribeUrl(id, updateForm);
                    });

                    $('.icn_trash_16').click(function(e){
                        e.stopPropagation();
                        EB_Common.Ajax.remove("/settings/network/generic",{
                            id:$(this).closest('tr').attr('id')
                        },function(data){
                            $('#subscribeUrlTable').jqGrid().trigger("reloadGrid");
                            EB_Common.LeavePage.resetState();
                        });
                    });
                }

            });
        },
        updateSubscribeUrl:function(id, container){
            container.find('form').validate({
                submitHandler : function() {
                    EB_Common.Ajax.put("/settings/network/generic",{
                        id:id,
                        url:$('#updateUrl').val(),
                        displayName:$('#updateDisplayName').val(),
                        username:$('#updateUsername').val(),
                        password:$('#updatePassword').val()
                    },function(data){
                        $("#insertRow").remove();
                        $('#subscribeUrlTable').jqGrid().trigger("reloadGrid");
                        EB_Common.LeavePage.resetState();
                    });
                }
            });
            $('#test',container).click(function(e){
                e.preventDefault();
                var td = $(this).closest('td'),
                    url = td.find('input').val();
                window.open(url);
            });

            container.find('.button.orange').click(function(){
                $('#updateSubscribeUrlForm').submit();
            });
            $('#collapsedBtn',container).click(function(){
                $("#insertRow").remove();
                EB_Common.LeavePage.resetState();
            });

        },
        resetSubscribeUrlTable:function(){
            $('#addUrl').val('');
            $('#addDisplayName').val('');
            $('#addUsername').val('');
            $('#addPassword').val('');
        }
    };

    view.settings.network = pub;

})(EB_View);
