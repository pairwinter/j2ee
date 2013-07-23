/**
 * Created with IntelliJ IDEA.
 * User: carl
 * Date: 11/8/12
 * Time: 2:43 PM
 * To change this template use File | Settings | File Templates.
 */
(function (view) {
    view.contactCreate = {};
    view.contactCreate.init = function (context,orgPathsStr,orgAttrsStr,showSubscription,contactSubscriptionList,callingsStr,id, saveSuccessed) {
//        new EB_Common.toolTip();
        if(!id){
            $("#firstName").focus();
        }
        EB_Common.validation.validate("form0", {
            submitHandler:function (form) {
                // some other code
                // maybe disabling submit button
                // then:
                beforeSubmit();
                $("#formBut0").attr("disabled", true);
                form.submit();
            },
            rules:{
                externalId:{
                    required:true,
                    remote:{
                        url:context+"/contacts/check/externalId/json",
                        type:"post",
                        data:{
                            externalId:$("#externalId").val(),
                            id:id
                        }

                    }

                }

            },
            messages:{
                externalId:{
                    remote:i18n['global.valid.text.checkExternalId']
                }
            }
        });

        var orgPaths = $.parseJSON(orgPathsStr);
        var orgAttrs = $.parseJSON(orgAttrsStr);
        var callings = $.parseJSON(callingsStr);
        var contactSubscriptionList = $.parseJSON(contactSubscriptionList);
        var datepickSetting = {
            dateFormat:'yy-mm-dd',
            showOn:"button",
            buttonImage:context+"/statics/stylesheets/common/img/icn_calendar_16.png",
            buttonImageOnly:true,
            changeMonth:true,
            changeYear:true,
            buttonText: i18n['button.calendar.tooltip'],
            onClose:function (dateStr) {
                $(this).valid();
            }
        };
        $(".datepicker_attr").datepicker(datepickSetting);
        $.validator.addMethod('locationName', function (value, element) {
            var isNotSame = true;
            $('.locationName').not(element).each(function () {
                if ($(this).val() == value) {
                    isNotSame = false;
                    return;
                }
            });
            return isNotSame;
        }, i18n['global.valid.text.locationName']);

        $.validator.addMethod('customPostalCode', function (value, element) {
            var contryCode = $(element).parents('.contact_address_div').find('select[name="address[x].country"]').val();
            if (contryCode == "US") {
                return !value || /^\d{5}$|^\d{5}-?\d{4}$/.test(value);
            } else {
                return !value || value.length <= 10;
            }
        }, i18n['global.valid.text.postalCode']);

//        $.validator.addMethod('selectForGeoLocation', function (value, element) {
//            if ($(element).find("option:gt(0)").size() > 0) {
//                return value != -1;
//            }
//            return true;
//        }, i18n['global.valid.text.selectGisLocation']);
        $("a[name^='removeaddr']").click(function () {
            EB_Common.LeavePage.setState(true);
            initGeoLastSearch();
            $(this).parent().parent().remove();
            if ($("#address_div > div").size() == 0) {
                $("#add_adress_btn").hide();
                $("#enterAddressInfo").show();
            } else {
                $('#add_adress_btn').show();
            }
        });
        $("select[name='address[x].country']").change(function () {
            if ($(this).val() == 'US') {
                var newSelect = $('<select name="address[x].state" class="select_long searchForGeoAddress">');
//            var newSelect = document.createElement("select");
                var options = [];
                $("#selectStates_select option").each(function (i, n) {
//                options[options.length] = new Option(n.text(),n.val(),true,true);
                    newSelect.append($(this).clone(true, true));
                });
//            newSelect.append(options);
//            newSelect.options = options;
                $(this).parent().parent().parent().find("input[name='address[x].state']").replaceWith(newSelect);
            } else {
                $(this).parent().parent().parent().find("select[name='address[x].state']").replaceWith($('<input name="address[x].state" type="text" class="input_long searchForGeoAddress {maxlength:40}">'));
            }

        });
        $("#addNewAddress").click(function () {
            var newTable = $("#clone_tb div:first").clone(true, true);
            var select = newTable.find("select[name='address[x].country']");
            var options = $("#selectCountries_select > option").clone();
            select.append(options);
            $("#address_div").append(newTable);
            if ($("select[name='country']").val() != '') {
                select.val($("select[name='country']").val());
            }
            select.change();
            if ($("#address_div >div").size() >= 5) {
                $('#add_adress_btn').hide();
            }
        });

        $("#enterAddressInfo").click(function () {
            if ($("#add_adress_btn").is(":hidden")) {
                $("#add_adress_btn").show();
                $("#addNewAddress").click();
                $(this).hide();
            }
        });
        /**
         Start--Contact path select functions
         */

        $('.path_div_tmp').each(function () {
            if (callings[$(this).find('select[name^="paths"][name$="countryCode"]').val()] == "1") {
                if($(this).val()){
                    var val = $(this).find('.customPhone').val().replace(/[^0-9]/ig, "");
                    $(this).find('.customPhone').val(val.substring(0, 3) + '-' + val.substring(3, 6) + '-' + val.substring(6));
                }
            }
        });
        function getOrgPathFromMap(key) {
            for (var i = 0; i < orgPaths.length; i++) {
                if ((orgPaths[i].pathId) == key) {
                    return orgPaths[i];
                }
            }
        }

        $.validator.addMethod('phoneExt', function (value, element) {
            return !value || (/^\d+(,\d+)?$/.test(value));
        }, i18n['global.valid.text.extensionPhone']);


        $.validator.addMethod('customPhone', function (value, element) {
            var contryCode = $(element).parents('.path_div_tmp').find('select[name$=".countryCode"]').val();
            value = $.trim(value);
            var formatValue = value.replace(/[^0-9]/ig, "");
            if (callings[contryCode] == "1") {
                $.validator.messages['customPhone'] =  i18n['global.valid.text.phone.nanp'];
                if (/^911|^411|^900|^000|^976|^011|^611/.test(value)) {
                    return false;
                }
                return formatValue.length == 10 && /^\d{3}(-?)\d{3}\1\d{4}$/.test(value);
            } else {
                $.validator.messages['customPhone'] =  i18n['global.valid.text.phone.nonanp'];
                return formatValue.length >= 4 && formatValue.length <= 20 && /^(\d+|(\(\d+\)))(\d*(\(\d+\))*\s*-*)*\d+$/.test(value);
            }
        }, i18n['global.valid.text.phone']);
        $('select[name^="paths"][name$="countryCode"]').change(function () {
            var path_div = $(this).parents('.path_div_tmp');
            if (callings[$(this).val()] == "1") {
                path_div.find('input[name="paths[x].value"]').attr("placeholder", "555-555-5555");
            } else {
                path_div.find('input[name="paths[x].value"]').attr("placeholder", "");
            }
            if (path_div.find('.customPhone').size() > 0) {
                path_div.find('.customPhone').valid();
            }
        });

        if ($('#path_select>option[value!=""]').size() == 0) {
            $('#path_select_div').hide();
        }

        path_remove_function = function () {
            EB_Common.LeavePage.setState(true);
            $(this).parent().parent().parent().parent().parent().remove();
            var pathId = ($(this).attr("id").split("_"))[1];
            var orgPath = getOrgPathFromMap(pathId);
            var pathName = orgPath.prompt;
            var options = $("#path_select >option");
            var size = options.size();
            for (var i = 0; i < size; i++) {
                if ($(options[i]).attr("seq") > orgPath.seq) {
                    $(options[i]).before($("<option>").val(pathId).text(pathName).attr("seq", orgPath.seq));
                    break;
                } else if (i == size - 1) {
                    $(options[i]).after($("<option>").val(pathId).text(pathName).attr("seq", orgPath.seq));
                    break;
                }
            }
            if ($("#h_slectPath_items > div").size() == 0) {
                $("#path_table_header").hide();
            }
            sortRows();
            $('#path_select_div').show();
        };
        $("#path_select").change(function () {
            if ($("#path_table_header").is(":hidden")) {
                $("#path_table_header").show();
            }
            var orgPath = getOrgPathFromMap($(this).val());
            var newDiv = $("#path_clone >div").clone(true, true);
            newDiv.find('input[name="paths[x].pathId"]').val(orgPath.pathId);
            newDiv.find('.path_table_td_name').text(orgPath.prompt);
            var validateClass = "{required:true,maxlength:40}";
            if (orgPath.type == "EMAIL") {
                newDiv.find('input[name="paths[x].value"]').attr("placeholder", "someone@example.com");
                validateClass = "email {required:true,maxlength:80} input_width250";
                newDiv.find('select[name="paths[x].countryCode"]').prev("span").remove();
                newDiv.find('select[name="paths[x].countryCode"]').remove();
//            newDiv.find('select[name="paths[x].countryCode"]')
            } else {
                newDiv.find('select[name="paths[x].countryCode"]').append($("#selectCountries_select > option").clone());
                if ($("select[name='country']").val() != '') {
                    newDiv.find('select[name="paths[x].countryCode"]').val($("select[name='country']").val());

                }
                newDiv.find('select[name="paths[x].countryCode"]').change();
            }
            if (orgPath.type == "PHONE" || orgPath.type == "SMS" || orgPath.type=="FAX" || orgPath.type == "TA" ||orgPath.type == "PAGER"  ||orgPath.type == "TTYTDD") {
                validateClass = "customPhone {required:true}";
            }
            if (orgPath.type == "TTYTDD") {
                newDiv.find('select[name="paths[x].countryCode"] > option:not([value="US"],[value="CA"])').remove();
            }
            newDiv.find('input[name="paths[x].value"]').val(orgPath.value).addClass(validateClass);
            if(orgPath.type!="PHONE"){
                newDiv.find('.waitTimeSpan').remove();
            }else{
                newDiv.find(".advance").click(function(){
                    newDiv.find('.waitTimeToShow').show();
                    $(this).remove();
                });
            }
            if(orgPath.extPrompt!="Ext"){
                newDiv.find('.extSpan').remove();
            }
            if(orgPath.extPrompt!="Pin"){
                newDiv.find('.pinSpan').remove();
            }

            if($.browser.msie && $.browser.version=="7.0"){
                var newDelA = document.createElement("a");
                newDelA.id = 'pathRemoveRow_' + orgPath.pathId;
                var nnDelA = $(newDelA).addClass("icn_trash_16").attr("href","javascript:void(0);").attr("name","attr_remove_row");
                nnDelA.bind("click",path_remove_function);
                newDiv.find('a[name="path_remove_row"]').replaceWith(nnDelA);

                var moveDown = document.createElement("a");
                moveDown.id = 'pathDownRow_' + orgPath.pathId;
                var nnmoveDown = $(moveDown).addClass("icn_down").attr("href","javascript:void(0);").attr("name","path_down_row");
                nnmoveDown.bind("click",function () {
                    if($(this).hasClass("disabled")) return;
                    var currentDiv = $(this).parent().parent().parent().parent().parent();
                    currentDiv.before(currentDiv.next());
                    sortRows();
                });
                newDiv.find('a[name="path_down_row"]').replaceWith(nnmoveDown);

                var moveUp = document.createElement("a");
                moveUp.id = 'pathUpRow_' + orgPath.pathId;
                var nnmoveUp = $(moveUp).addClass("icn_up").attr("href","javascript:void(0);").attr("name","path_up_row");
                nnmoveUp.bind("click",function () {
                    if($(this).hasClass("disabled")) return;
                    var currentDiv = $(this).parent().parent().parent().parent().parent();
                    currentDiv.after(currentDiv.prev());
                    sortRows();
                });
                newDiv.find('a[name="path_up_row"]').replaceWith(nnmoveUp);
            }else{
                newDiv.find('a[name="path_remove_row"]').attr('id', 'pathRemoveRow_' + orgPath.pathId);
                newDiv.find('a[name="path_down_row"]').attr('id', 'pathDownRow_' + orgPath.pathId);
                newDiv.find('a[name="path_up_row"]').attr('id', 'pathUpRow_' + orgPath.pathId);
            }

            if (orgPath.type && orgPath.type == "RECIP") {
                newDiv.find('input[name="paths[x].value"]').prev("span").remove();
                newDiv.find('input[name="paths[x].value"]').replaceWith('<input type="hidden" name="input[name=\"paths[x].value\"]">' + i18n['contact.text.enable']);
                newDiv.find('select[name="paths[x].countryCode"]').prev("span").remove();
                newDiv.find('select[name="paths[x].countryCode"]').remove();
            }

            $("#h_slectPath_items").append(newDiv);
            sortRows();
            $(this).find("option:selected").remove();
            $(this).val("");
            if ($('#path_select>option[value!=""]').size() == 0) {
                $('#path_select_div').hide();
            }
        });

        // delete row
        $("a[name='path_remove_row']").click(path_remove_function);

        //up
        $("a[name='path_up_row']").click(function () {
            var currentDiv = $(this).parent().parent().parent().parent().parent();
            currentDiv.after(currentDiv.prev());
            sortRows();
        });
        //down
        $("a[name='path_down_row']").click(function () {
            var currentDiv = $(this).parent().parent().parent().parent().parent();
            currentDiv.before(currentDiv.next());
            sortRows();
        });
        /**
         End--Contact path select functions
         */


        /**
        * Attributes and Subscription MultiSelectFunction
        */

        var addMultiSelectFunction = function () {
            var id = $(this).attr('id').split('_');
            if (id[1] == 'all') {
                if ($.browser.msie ) {
                    var select1 = document.getElementById('select1_' + id[2]);
                    var select2 = document.getElementById('select2_' + id[2]);
                    moveAllForIE(select1, select2);

                } else {
                    $('#select1_' + id[2] + ' option').remove().appendTo('#select2_' + id[2]);
                }
            } else {
                if ($.browser.msie ) {
                    var select1 = document.getElementById('select1_' + id[2]);
                    var select2 = document.getElementById('select2_' + id[2]);
                    moveLeftOrRightForIE(select1, select2);

                } else {
                    $('#select1_' + id[2] + ' option:selected').remove().appendTo('#select2_' + id[2]);
                }
            }
            $('#select2_' + id[2]).valid();
            return false;
        };
        $('div[name="two_selection"] > a[name^="add"]').click(addMultiSelectFunction);
        var removeMultiSelectFunction = function () {
            var id = $(this).attr('id').split('_');
            if (id[1] == 'all') {
                if ($.browser.msie ) {
                    var select1 = document.getElementById('select1_' + id[2]);
                    var select2 = document.getElementById('select2_' + id[2]);
                    moveAllForIE(select2, select1);

                } else {
                    $('#select2_' + id[2] + ' option').remove().appendTo('#select1_' + id[2]);
                }

            } else {
                if ($.browser.msie ) {
                    var select1 = document.getElementById('select1_' + id[2]);
                    var select2 = document.getElementById('select2_' + id[2]);
                    moveLeftOrRightForIE(select2, select1);

                } else {
                    $('#select2_' + id[2] + ' option:selected').remove().appendTo('#select1_' + id[2]);
                }
            }
            $('#select2_' + id[2]).valid();
            return false;
        };
        $('div[name="two_selection"] > a[name^="remove"]').click(removeMultiSelectFunction);
        $(".advance").click(function(){
            $(this).next().show();
            $(this).remove();
        });
        var mutSelectMoveToRightFun = function () {
            var id = $(this).attr('id').split('_');
            if ($.browser.msie ) {
                var select1 = document.getElementById('select1_' + id[1]);
                var select2 = document.getElementById('select2_' + id[1]);
                moveLeftOrRightForIE(select1, select2);

            } else {
                $('#select1_' + id[1] + ' option:selected').remove().appendTo('#select2_' + id[1]);
            }
            $('#select2_' + id[1]).valid();
        };
        var mutSelectMoveToLeftFun = function () {
            var id = $(this).attr('id').split('_');
            if ($.browser.msie ) {
                var select1 = document.getElementById('select1_' + id[1]);
                var select2 = document.getElementById('select2_' + id[1]);
                moveLeftOrRightForIE(select2, select1);

            } else {

                $('#select2_' + id[1] + ' option:selected').remove().appendTo('#select1_' + id[1]);
            }
            $('#select2_' + id[1]).valid();
        };
        $(".fromMutiSelect").dblclick(mutSelectMoveToRightFun);
        function moveLeftOrRightForIE(fromObj, toObj) {
            var fromObjOptions = fromObj.options;
            for (var i = 0; i < fromObjOptions.length; i++) {
                if (fromObjOptions[i].selected) {
                    var op = document.createElement("option");
                    op.value = fromObjOptions[i].value;
                    op.text = fromObjOptions[i].text;
                    toObj.options.add(op);
                    fromObj.remove(i);
                    i--;
                }
            }
        }

        function moveAllForIE(fromObj, toObj) {
            var fromObjOptions = fromObj.options;
            for (var i = 0; i < fromObjOptions.length; i++) {
                var op = document.createElement("option");
                op.value = fromObjOptions[i].value;
                op.text = fromObjOptions[i].text;
                toObj.options.add(op);
                fromObj.remove(i);
                i--;
            }
        }

        $(".toMutiSelect").dblclick(mutSelectMoveToLeftFun);
        function getOrgAttrFromMap(key) {
            for (var i = 0; i < orgAttrs.length; i++) {
                if ((orgAttrs[i].id) == key) {
                    return orgAttrs[i];
                }
            }
        }

        $.validator.addMethod('checkMultipleSelect', function (value, element) {
            return ($(element).find("option").size() > 0);
        }, 'This field is required.');


        /**
         Start--Contact Attributes select functions
         */

        if ($('#attr_select >option[value!=""]').size() == 0) {
            $("#attr_select_div").hide();
        }

        attr_remove_function = function () {
            EB_Common.LeavePage.setState(true);
            var attrId = ($(this).attr("id").split("_"))[1];
            var attrName = ($(this).attr("id").split("_"))[2];
            var orgAttr = getOrgAttrFromMap(attrId);
            var options = $("#attr_select >option");
            var size = options.size();
            for (var i = 0; i < size; i++) {
                if ($(options[i]).val() > orgAttr.id) {
                    $(options[i]).before($("<option>").val(orgAttr.id).text(orgAttr.name));
                    break;
                } else if (i == size - 1) {
                    $(options[i]).after($("<option>").val(orgAttr.id).text(orgAttr.name));
                    break;
                }
            }
            $(this).parent().parent().parent().parent().parent().remove();
            if ($("#h_slectAttribute_items > div").size() == 0) {
                $("#attr_table_header").hide();
            }

            $("#attr_select_div").show();
        };

        $("#attr_select").change(function () {
            if ($("#attr_table_header").is(":hidden")) {
                $("#attr_table_header").show();
            }
//        var newDiv = $("#attrTemp_" + $(this).val());
            var newDiv = $("#attr_clone>div").clone(true, true);
            var orgAttr = getOrgAttrFromMap($(this).val());
            newDiv.attr('attrOrgId',  orgAttr.id);
            newDiv.find('.attr_table_td_name').text(orgAttr.name);
            newDiv.find('input[name="contactAttributes[x].orgAttrId"]').val(orgAttr.id);
            newDiv.find('input[name="contactAttributes[x].name"]').val(orgAttr.name);
            var td = newDiv.find(".attr_table_td_value");
            switch (orgAttr.displayFormat) {
                case 'S':
                    var div1 = $('<div class="div_panel">');
                    var select1 = $('<select multiple="multiple">').attr('id', 'select1_' + orgAttr.id)
                        .addClass('select-multiple fromMutiSelect').dblclick(mutSelectMoveToRightFun);
                    for (var i = 0; i < orgAttr.definedValues.length; i++) {
                        select1.append($('<option>').val(orgAttr.definedValues[i]).text(orgAttr.definedValues[i]));
                    }
                    div1.append(select1);
                    var div2 = $('<div class="two_selection" name="two_selection">');

                    var a1 = $(document.createElement('a')).addClass("icon_arrowa").attr('id', 'add_one_' + orgAttr.id).attr('name', 'add_one').attr('href', 'javascript:void(0)').click(addMultiSelectFunction);
                    var a2 = $(document.createElement('a')).addClass("icon_arrowb").attr('id', 'remove_one_' + orgAttr.id).attr('name', 'remove_one').attr('href', 'javascript:void(0)').click(removeMultiSelectFunction);
                    var a3 = $(document.createElement('a')).addClass("icon_arrowc").attr('id', 'add_all_' + orgAttr.id).attr('name', 'add').attr('href', 'javascript:void(0)').click(addMultiSelectFunction);
                    var a4 = $(document.createElement('a')).addClass("icon_arrowd").attr('id', 'remove_all_' + orgAttr.id).attr('name', 'remove').attr('href', 'javascript:void(0)').click(removeMultiSelectFunction);
                    div2.append(a1).append(a2).append(a3).append(a4);
                    var div3 = $('<div class="div_panel">');
                    var select3 = $('<select multiple="multiple">').attr('id', 'select2_' + orgAttr.id).attr("name", "checkMultipleSelect")
                        .addClass('select-multiple toMutiSelect checkMultipleSelect').dblclick(mutSelectMoveToLeftFun);
                    var subDiv3 = $('<div>').attr('id', 'multipleValues_' + orgAttr.id);
                    div3.append(subDiv3).append(select3);
                    td.append(div1).append(div2).append(div3);
                    break;
                case 'L':
                    var select = $('<select name="contactAttributes[x].values[0]" class="select_long">').addClass('{required:true}');
                    select.append($('<option>').val('').text('Select...'));
                    for (var i = 0; i < orgAttr.definedValues.length; i++) {
                        select.append($('<option>').val(orgAttr.definedValues[i]).text(orgAttr.definedValues[i]));
                    }
                    td.append(select);
                    break;
                default:
                    var input = $('<input type="text" class="input_width250" name="contactAttributes[x].values[0]">');
                    td.append(input);
                    if (orgAttr.dataType == 'DATE') {
                        input.addClass('datepicker_attr required').attr("readonly", true).datepicker(datepickSetting);
                    } else if (orgAttr.dataType == 'NUMBER') {
                        input.addClass('{required:true, number:true, min:-9999999999,max:9999999999}');
                    }else{
                        input.addClass('{required:true, maxlength:40}');
                    }
                    break;
            }
            if($.browser.msie && $.browser.version =="7.0"){
                var newDelA = document.createElement("a");
                newDelA.id = 'attrRemoveRow_' + orgAttr.id + '_' + orgAttr.name;
                var nnDelA = $(newDelA).addClass("icn_trash_16").attr("href","javascript:void(0);");
                nnDelA.bind("click",attr_remove_function);
                newDiv.find('a[name="attr_remove_row"]').replaceWith(nnDelA);
            }else{
                newDiv.find('a[name="attr_remove_row"]').attr('id', 'attrRemoveRow_' + orgAttr.id + '_' + orgAttr.name).attr("title",orgAttr.id );
            }
            $("#h_slectAttribute_items").append(newDiv);
            $(this).find("option:selected").remove();
            $(this).val("");
            if ($('#attr_select >option[value!=""]').size() == 0) {
                $("#attr_select_div").hide();
            }
        });

        $("a[name='attr_remove_row']").click(attr_remove_function);

        /**
         end--Contact Attributes select functions
         */

        $("#formBut0").click(function () {
            $("#form0").submit();
        });

        function beforeSubmit() {
            var reg = new RegExp("\\[x\\]", "gm");
            $("#h_slectPath_items > div").each(function (n) {
                $(this).find("input,select").each(function (i) {
                    var name = $(this).attr("name");
                    if (name) {
                        if ($.browser.msie && ($.browser.version == "7.0"))   //is IE?
                        {
                            var dom1 = $(this)[0];
                            dom1.name = name.replace(reg, "[" + n + "]");

                        } else {
                            $(this).attr("name", name.replace(reg, "[" + n + "]"));
                        }
                    }
//                if (name)
//                    $(this).attr("name", name.replace(reg, "[" + n + "]"));

                });
            });
            $("#address_div > div").each(function (n) {
                $(this).find("input,select").each(function () {
                    var name = $(this).attr("name");
                    if (name) {
                        if ($.browser.msie && ($.browser.version == "7.0")) //is IE?
                        {
                            var dom1 = $(this)[0];
                            dom1.name = name.replace(reg, "[" + n + "]");

                        } else {
                            $(this).attr("name", name.replace(reg, "[" + n + "]"));
                        }
                    }
//                if (name)
//                    $(this).attr("name", name.replace(reg, "[" + n + "]"));
                });
            });

            var attrId;
            var hiddenInput;
            $("#h_slectAttribute_items > div").each(function (n) {
                attrId = $(this).attr("attrOrgId");
                $("#multipleValues_" + attrId).empty();
                $('#select2_' + attrId + ' option').each(function (i) {
// 					hiddenInput =$("input[type=hidden]").attr("name","contactAttributes[x].values["+i+"]").val($(this).val());
                    hiddenInput = $("<input type='hidden' name='contactAttributes[x].values[" + i + "]'>").val($(this).val());
// 					alert(hiddenInput.html());
                    $("#multipleValues_" + attrId).append(hiddenInput);
                });
                $(this).find("input,select").each(function () {
                    var name = $(this).attr("name");
                    if (name) {
                        $(this).attr("name", name.replace(reg, "[" + n + "]"));
                    }
                });
            });

            var topicIds = $('#subscriptionData').val().split(',');
            for(var i = 0; i < topicIds.length; i++){
                if(topicIds[i] == '') continue;
                $("#multipleValuesSubscription").append($("<input type='hidden' name='topics[" + i + "]'>").val(topicIds[i]));
            }

            $(".customPhone").each(function () {
                if($(this).val()){
                    $(this).val($(this).val().replace(/[^0-9]/ig, ""));
                }
            });

            return true;
        }

        var sortRows = function () {
            var totalRows = $("#h_slectPath_items > div").size();
            var rowCount = 0;
            $("#h_slectPath_items div tbody tr").each(function(index, element){
                $(element).children().eq(1).text(++index);
                rowCount ++;
            });
            $("#h_slectPath_items > div").each(function (i) {
//                $(this).find("table tr td:first-child").text(i + 1);
                $(this).attr("id", $(this).attr("name") + "_" + (i + 1));
// 				$(this).find("table tr td:first-child > input[name='paths[x].seq']").val(i+1);
                var up = $(this).find("a[name='path_up_row']"),
                    down = $(this).find("a[name='path_down_row']");
                up.removeClass("disabled");
                down.removeClass("disabled");

                if (i == 0) {
                    up.addClass("disabled");
                }

                if (i == (totalRows - 1)) {
                    down.addClass("disabled");
                }

            });
        };
        $("#cancel").click(function () {
            if (EB_Common.LeavePage.changeState()) {
                EB_Common.dialog.leavePage(function() {
                    window.location = context+"/contacts/manage#ui-tabs-1";
//                  $("#returnToListForm").submit();
                });
            }
            else
                window.location = context+"/contacts/manage#ui-tabs-1";
//                $("#returnToListForm").submit();
        });

        // menu click
        $('#contact_info h3[name="menu"]').click(function () {
            var menus = $('#contact_info h3[name="menu"]');
            var menu = $(this),
                menu_a = menu.find('a div');
            if (!menu_a.hasClass('select_bg')) {
                menus.each(function (i) {
                    var me = $(this);
                    me.find('a div').removeClass('select_bg');
                    me.next().hide();
                });
                menu_a.addClass('select_bg');
                menu.next().show();
            }
        });

        var geoLastSearch = {};

        function checkGeoSearch(key, val) {
            if (!geoLastSearch[key]) {
                geoLastSearch[key] = "";
            }
            if (geoLastSearch[key] != val) {
                geoLastSearch[key] = val;
                return false;
            }
            return true;
        }

        initGeoLastSearch = function () {
            var tables = $("#address_div > table");
            geoLastSearch = {};
            tables.each(function (i) {
                var contry = $(this).find(":input[name$='.country']").val();
                var streetAddress = $(this).find(":input[name$='.streetAddress']").val();
                var suite = $(this).find(":input[name$='.suite']").val();
                var city = $(this).find(":input[name$='.city']").val();
                var state = $(this).find(":input[name$='.state']").val();
                var postalCode = $(this).find(":input[name$='.postalCode']").val();
                geoLastSearch['"' + i + '"'] = contry + " " + state + " " + streetAddress + " " + suite + " " + city + " " + postalCode;
            });
        };
        initGeoLastSearch();


        $.validator.addMethod('searchForGeoAddress', function (value, element) {
            return !(/[\[\]\!\@\$\%\^\&\*\?\<\>\\\:]/.test(value));
        }, i18n['global.valid.text.addressInfo']);

        function getHandlerAndRemoveOption(select) {
            if (select.prop) {
                var options = select.prop('options');
            }
            else {
                var options = select.attr('options');
            }
            $('option', select)[0].selected = true;
            select.trigger('change');
            $('option', select).remove();

            return options;
        }

        $(".searchForGeoAddress").blur(function () {
            var isSameAsLast = true;
            var parentTable = $(this).parent().parent().parent();
            var isValid = $(parentTable).find('select[name$=".country"]').valid() &&
                $(parentTable).find(':input[name$=".streetAddress"]').valid() &&
                $(parentTable).find(':input[name$=".suite"]').valid() &&
                $(parentTable).find(':input[name$=".city"]').valid() &&
                $(parentTable).find(':input[name$=".state"]').valid() &&
                $(parentTable).find(':input[name$=".postalCode"]').valid();

            if (!isValid) {
                return;
            }
            var tableIndex = $("#address_div").find(".table_address").index(parentTable.parent());
            var contry = parentTable.find("select[name$='.country'] >option:selected").attr("countryfullname");
            var streetAddress = parentTable.find(":input[name$='.streetAddress']").val();
            var suite = parentTable.find(":input[name$='.suite']").val();
            var city = parentTable.find(":input[name$='.city']").val();
            var state = parentTable.find(":input[name$='.state']").val();
            var postalCode = parentTable.find(":input[name$='.postalCode']").val();

            isSameAsLast = checkGeoSearch(tableIndex, contry + " " + state + " " + streetAddress + " " + suite + " " + city + " " + postalCode) && isSameAsLast;

            if (isSameAsLast) {
                return;
            }
            var selectGeo = parentTable.find(".selectForGeoLocation");
            var options = getHandlerAndRemoveOption(selectGeo);
            options[options.length] = new Option(i18n['contact.field.geo.options.input_address_for_searching'], '-1', true, true);
            if (contry && streetAddress) {

                //parentTable.find(":input[name$='.gisLocation.lon']").val("");
                //parentTable.find(":input[name$='.gisLocation.lat']").val("");
                //selectGeo.find("option:eq(0)").text("Geocoding is in progress...").val("-1");
                //selectGeo.valid();
                EB_Common.Ajax.post('/contacts/getgeo/json?version=' + new Date().getMilliseconds(), {
                    country:contry,
                    adminDistrict:state,
                    addressLine:streetAddress + " " + suite + " " + city,
                    postalCode:postalCode
                }, function (data) {
                    var val = "-1";
                    if (data && data.length > 0) {
                        //var options = getHandlerAndRemoveOption(selectGeo);
                        //options[options.length] = new Option(i18n['contact.field.geo.options.select_geo_address'], '-1', true, true);
                        $(data).each(function (i, e) {
                            var option = new Option(e.addressLine + " " + e.country, i);
                            options[options.length] = option;
//                        $('<option value="'+i+'" lon="'+ e.longitude+'" lat="'+ e.latitude+'">'+e.addressLine+''+ e.country+'</option>');
                            $(option).attr("lon", e.longitude).attr("lat", e.latitude);
                            //parentTable.find(".tr_geo_location_alertmessage").hide();
                            //parentTable.find(".tr_geo_location").hide();
                            parentTable.find(":input[name$='.gisLocation.lon']").removeClass('error');
                            parentTable.find(":input[name$='.gisLocation.lat']").removeClass('error');
                            parentTable.find(":input[name$='.gisLocation.lon']").next('label.error').remove();
                            parentTable.find(":input[name$='.gisLocation.lat']").next('label.error').remove();
                        });
                    } else {
                        //var options = getHandlerAndRemoveOption(selectGeo);
                        //options[options.length] = new Option(i18n['contact.field.geo.options.no_data'], '-2', true, true);
                        //val = "-2";
//                    selectGeo.find("option:eq(0)").text("No data!");
                        //parentTable.find(".tr_geo_location_alertmessage").show();
                        //parentTable.find(".tr_geo_location").show();
                        parentTable.find(":input[name$='.gisLocation.lon']").removeClass('error');
                        parentTable.find(":input[name$='.gisLocation.lat']").removeClass('error');
                        parentTable.find(":input[name$='.gisLocation.lon']").next('label.error').remove();
                        parentTable.find(":input[name$='.gisLocation.lat']").next('label.error').remove();
                    }
                    //selectGeo.val(val);
                    //selectGeo.valid();
                }, 'json');
            }
        });
        $(".selectForGeoLocation").change(function () {
            var parentTable = $(this).parent().parent().parent();
            var lon = parentTable.find(":input[name$='.gisLocation.lon']");
            var lat = parentTable.find(":input[name$='.gisLocation.lat']");

            if ($(this).val() && $(this).val() != -1) {
                var option = $(this).find("option:selected");
                parentTable.find(".tr_geo_location").show(); //error-right
                var lonVal = option.attr("lon");
                var latVal = option.attr("lat");
                if(lonVal && latVal){
	                /*if(/./.test(lonVal) && lonVal.split('.')[1].length > 6){
			        	 lonVal = new Number(lonVal).toFixed(6);
			        }
			        
			        if(/./.test(latVal) && latVal.split('.')[1].length > 6){
			        	latVal = new Number(latVal).toFixed(6);
			        }*/
	                lon.val(lonVal);
	                lat.val(latVal);
                }
                lon.removeClass("error");
                lat.removeClass("error");
                lon.next(".error-right").remove();
                lat.next(".error-right").remove();
            }else{
                lon.val('');
                lat.val('');
            }
        });
        
        // locate the region
        var latDefault = 37.09024,
        	lngDefault = -95.712891,
        	callbackFn = function(ct, data){
        		if(!data){
        			return;
        		}
        		var country = data.country,
        		    city = data.city,
        		    state = data.state,
                    stateCode = EB_Common.gmaps.stateMap[data.stateCode],
        			address = data.address,// ? data.address.substring(0, data.address.lastIndexOf(',')) : '',
        			latitude = data.latitude,
		        	longitude = data.longitude,
		        	postalCode = data.postalCode;
		        ct.find('select[name*="country"]').val(country);
		        ct.find('input[name*="city"]').val(city);
		        ct.find('select[name*="country"]').change();
		        if(country == 'US'){
		        	ct.find('select[name*="state"]').val(stateCode);
		        }else{
		        	ct.find('input[name*="state"]').val(state);
		        }
		    	ct.find('input[name*=streetAddress]').val(address);
		    	ct.find('input[name*=postalCode]').val(postalCode);

        	    try{
        	    	ct.find('input[name$="streetAddress"]').blur();
        	    }catch(e){}

                ct.find('input[name*="gisLocation.lon"]').val(longitude);
                ct.find('input[name*="gisLocation.lat"]').val(latitude);
        	};
		EB_Common.Ajax.ajax({
        	url : '/settings/gis/mapcenter',
        	type : 'get',
        	dataType : 'json',
        	success : function(resData){
                if(resData){
                    latDefault = resData.latitude;
                    lngDefault = resData.longitude;
                }
        	}
        });
        
        $('#address_div').on('click', 'a[name="locateInMap"]', function(e){
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
		    
		    if(country.val() == ''){
		    	country = '';
		    }else{
		    	country = country[0].options[country[0].selectedIndex].text;
		    }
		    
		    latVal = latE.valid() ? latE.val() : '';
		    lngVal = lngE.valid() ? lngE.val() : '';
		    
		    //count latitude and longitude
		    var latitude = latDefault,
		    	longitude = lngDefault,
		        contryAddress,
		        isAddress;
//		    if(latVal != '' && lngVal != ''){
//		    	latitude = latVal;
//		    	longitude = lngVal;
//		    // address + city + state + country + postalCode
//		    }else 
		    if(address != '' || city != '' || state != '' || country != '' || postalCode != ''){
		    	contryAddress = address + ',' + city + ',' + state + ',' + country + ',' + postalCode;
		    	isAddress = true;
		    }
		    
		    var regions = {
		        locationName : locationName,
		        country : country,
        		city : city,
        		state : state,
        		address : address,
		        postalCode : postalCode,
		        latitude : latitude,
				longitude : longitude,	
		    	contryAddress : contryAddress,
				isAddress : isAddress
		    };
		    
            EB_Common.gmaps.initialize({
                callbackFn: callbackFn,
		    	locatedCt: ct,
                regions: regions
		    });
        });
        
        $('#editSubscription').click(function(){
            $('#editSubscriptionDialog').dialog('open');
        });

        if('true' == showSubscription){
            $('#editSubscriptionCt').show();
            var subscriptionFn = function(){
                var datas = [];
                var weatherDatas = 0;
                var saveDatas = [];
                var fn = function(node){
                    if(node.isLeaf() && node.attributes.checked){
                        if(node.attributes.weather){
                            weatherDatas++;
                        }else{
                            var parentNode = node.parentNode.parentNode;
                            var heading;
                            if(!parentNode.isRoot){
                                heading = parentNode.attributes.text;
                            }
                            datas.push({
                                id: node.id,
                                checked: node.checked,
                                text: node.attributes.text,
                                heading: heading
                            });
                        }

                        saveDatas.push(node.id);
                    }
                };
                $('#subscriptionMenu').treepanel('getNodesData',fn);
                var subscriptionList = $('#subscriptionList');
                subscriptionList.children(':gt(0)').remove();
                subscriptionList.find('li:first span').text(weatherDatas);
                for (var i = 0, len = datas.length; i < len; i++) {
                    subscriptionList.append('<li>' + datas[i].text + (datas[i].heading ? ' (' + datas[i].heading + ')' : '') + '</li>');
                }

                $('#subscriptionData').val(saveDatas.join(','));
                //cheked nodes
                //console.log(datas);
            };



            var editSubscriptionDialog = $('#editSubscriptionDialog');
            if(editSubscriptionDialog.length == 0){
                $('<div id="editSubscriptionDialog"><div id="subscriptionMenu"/></div>').appendTo(document.body);
                EB_Common.dialog.dialog('editSubscriptionDialog',{
                    autoOpen: false,
                    title : 'Edit subscription',
                    width:700,
                    height:500,
                    okBtnText: 'Save'
                },subscriptionFn);

                $('#subscriptionMenu').treepanel({
                    nodesData: contactSubscriptionList,
                    baseCls : 'b-treepanel-contacts',
                    width: 'auto',
                    drawer: false,
                    multiple : true
                });
            }

            subscriptionFn();
        }
        if(saveSuccessed==='true'){
            EB_Common.ToolPrompt.show('cancel',i18n['glocal.savesuccess']);
//            window.location.hash = "ui-tabs-1"
        }
        EB_Common.LeavePage.addListener({
            container: '#main'
        });
	};
})(EB_View);