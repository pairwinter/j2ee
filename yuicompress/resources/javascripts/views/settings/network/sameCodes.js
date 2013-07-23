/**
 * Settings Publishing Options CMAS/WEA SAME Codes
 * 
 */
(function(view) {
    
    var re = /\{([\w-]+)\}/g;
    var applyTemplate = function(template, values) {
        return template.replace(re, function(m, name) {
            return values[name] !== undefined ? values[name] : '';
        });
    };

    
    var pub = {
        colModel: [{
                name: 'sequence'
            }, {
                name: 'value',
                editable: true,
                validRule: {
                    required: true,
                    digits: true,
                    digitslength:6,
                    maxlength:6
                }
            }, {
                name: 'desc',
                editable: true,
                validRule: {
                    required: true,
                    maxlength: 30
                }
            },{}],
        
        initPage: function(){
            // row template
            this.rowTemplate = '<tr id={id} name="data">\n\
                            <td><a href="#" title="DOWN" name="operte_down" class="icn_down_16"></a> <a href="#" title="UP" name="operte_up" class="icn_up_16"></a> <span class="margin10-L txt_middle">{order}</span></td>\n\
                            <td>{value}</td>\n\
                            <td>{desc}</td>\n\
                            <td>\n\
                                <a href="#" title="Edit" name="operte_edit" class="icn_edit_16"></a>\n\
                                <a href="#" title="Save" name="operte_save" class="icn_save_16" style="display:none;"></a>\n\
                                <a href="#" title="Cancel" name="operte_cancel" class="icn_cancel_16" style="display:none;"></a>\n\
                                <a href="#" title="Delete" name="operte_delete" style="display:inline-block;" class="icn_trash_16"></a>\n\
                            </td>\n\
                        </tr>';
            this.hideDeleteBtn();
            this.resetSequence();
            this.disabledUpAndDown();
            this.validator = EB_Common.validation.validate('eb_form');//,{
//                rules:{
//                    value:{
//                         remote: {
//                             url:''
//                         }
//                    }
//
//                } ,
//                messages:{
//                    value: {
//                        remote : "dfd"
//                    }
//
//                }
//            });
            this.initOperteEvent();
            $('#eb_form').show();
        },
        /**
         * 
         * @returns {}
         */
        initOperteEvent: function() {
            var me = this;
            //Edit
            $('#eb_grid tbody').on('click', 'a[name="operte_edit"]', function(e) {
                e.preventDefault();

                var el = $(this),
                    rowEl = el.closest('tr'),
                    delegateEl = $(e.delegateTarget),
                    list = delegateEl.find('tr');
                for (var i = 0, len = list.length; i < len; i++) {
                    if ($(list[i]).data('editstatus') === true) {
                        return;
                    }
                }
                var cancelEl = rowEl.find('a[name="operte_cancel"]'),
                    deleteEl = rowEl.find('a[name="operte_delete"]'),
                    saveEl = rowEl.find('a[name="operte_save"]');
                el.hide();
                cancelEl.show();
                deleteEl.hide();
                saveEl.show();
                rowEl.data('editstatus', true);
                
                //set editable cols
                rowEl.children().each(function(index,element){
                    var col = me.colModel[index];
                    if(col.editable === true){
                        var $el = $(element);
                        var val = $el.text();
                        $el.empty().data('originalval',val);
                        $('<input type="text" name="' + col.name + '" maxlength="' + col.validRule.maxlength + '" class="width_percent94" value="' + val + '"/>').appendTo($el).rules('add', col.validRule);

                    }
                });
            });

            //Cancel
            $('#eb_grid tbody').on('click', 'a[name="operte_cancel"]', function(e) {
                e.preventDefault();

                var el = $(this),
                    rowEl = el.closest('tr'),
                    editEl = rowEl.find('a[name="operte_edit"]'),
                    saveEl = rowEl.find('a[name="operte_save"]'),
                    deleteEl = rowEl.find('a[name="operte_delete"]');

                el.hide();
                editEl.show();
                saveEl.hide();
                var rows = $('#eb_grid tbody tr');
                var len = rows.length;
                if(len > 1){
                    deleteEl.show();
                }
                rowEl.removeData('editstatus');
                
                //cancel editable cols
                rowEl.children().each(function(index,element){
                    var col = me.colModel[index];
                    if(col.editable === true){
                        var $el = $(element);
                        var val = $el.data('originalval');
                        $el.text(val);
                    }
                });
                
                //reset Leave Page State
                EB_Common.LeavePage.resetState();
            });

            //Update
            $('#eb_grid tbody').on('click', 'a[name="operte_save"]', function(e) {
                e.preventDefault();
                var inputs = $(this).closest('tr').find(':text');
                for (var i = 0, len = inputs.length; i < len; i++) {
                    if(!$(inputs[i]).valid()){
                        return;
                    }
                }
                var el = $(this),
                    rowEl = el.closest('tr'),
                    editEl = rowEl.find('a[name="operte_edit"]'),
                    cancelEl = rowEl.find('a[name="operte_cancel"]'),
                    deleteEl = rowEl.find('a[name="operte_delete"]');
                    
                var parmData = {};
                rowEl.children().each(function(index,element){
                    var col = me.colModel[index];
                    if(col.editable === true){
                        parmData[col.name] = EB_Common.htmlEncode($(element).children().val());
                    }
                });
                parmData["id"] = rowEl.attr("id");
                EB_Common.Ajax.put(
                    "/settings/network/samecodes",
                    parmData,
                    function(data) {
                        if(data == 0){
                            EB_Common.LeavePage.resetState();

                            EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning'],null,{close:function(){
                                $('#level1_8_2_2').click();
                            }});
                            return;
                        }
                        if(data == -1){
                            EB_Common.dialog.alert(i18n["setting.error.sameCode.duplicatedValue"]);
                            return;
                        }
                        if(data == -2){
                            EB_Common.dialog.alert(i18n["setting.error.sameCode.duplicatedDesc"]);
                            return;
                        }
                        el.hide();
                        editEl.show();
                        cancelEl.hide();
                        deleteEl.show();
                        rowEl.removeData('editstatus');
                        
                        rowEl.children().each(function(index,element){
                            var col = me.colModel[index];
                            if(col.editable === true){
                                var $el = $(element);
                                var val = $el.children().val();
                                $el.text(val);
                            }
                        });
                        
                        //reset Leave Page State
                        EB_Common.LeavePage.resetState();
                    }
                );
            });

            //Delete
            $('#eb_grid tbody').on('click', 'a[name="operte_delete"]', function(e) {
                e.preventDefault();
                var el = $(e.target),
                    rowEl = el.closest('tr');
                var parmData = {};
                parmData["id"] = rowEl.attr("id");
                EB_Common.Ajax.remove(
                    "/settings/network/samecodes",
                    parmData,
                    function(data) {
                        if(data == 0){
                            EB_Common.LeavePage.resetState();

                            EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning'],null,{close:function(){
                                $('#level1_8_2_2').click();
                            }});
                            return;
                        }
                        rowEl.remove();
                        me.hideDeleteBtn();
                        me.resetSequence();
                        me.disabledUpAndDown();
                    }
                );
            });
            
            //Up
            $('#eb_grid tbody').on('click', 'a[name="operte_up"]', function(e) {
                e.preventDefault();
                var el = $(e.target);
                if(el.hasClass('disabled')){
                    return;
                }
                if($('#eb_grid').data('moving')){
                    return;
                }
                $('#eb_grid').data('moving', true);
                var tr = el.closest('tr');
                var prevTr = tr.prev();

                var parmData = {};
                parmData["id"] = tr.attr("id");
                parmData["order"] = tr.find("td:eq(0) span").text();
                parmData["targetId"] = prevTr.attr("id");
                parmData["targetOrder"] = prevTr.find("td:eq(0) span").text();

                EB_Common.Ajax.put(
                    "/settings/network/samecodes/move",
                    parmData,
                    function(data) {
                        if(data == 0){
                            EB_Common.LeavePage.resetState();

                            EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning'],null,{close:function(){
                                $('#level1_8_2_2').click();
                            }});
                            return;
                        }
                        tr.insertBefore(prevTr);
                        me.resetSequence();
                        me.disabledUpAndDown();
                        $('#eb_grid').removeData('moving');
                    }
                );
            });
            
            //Down
            $('#eb_grid tbody').on('click', 'a[name="operte_down"]', function(e) {
                e.preventDefault();
                var el = $(e.target);
                if(el.hasClass('disabled')){
                    return;
                }
                if($('#eb_grid').data('moving')){
                    return;
                }
                $('#eb_grid').data('moving', true);
                var tr = el.closest('tr');
                var nextTr = tr.next();

                var parmData = {};
                parmData["id"] = tr.attr("id");
                parmData["order"] = tr.find("td:eq(0) span").text();
                parmData["targetId"] = nextTr.attr("id");
                parmData["targetOrder"] = nextTr.find("td:eq(0) span").text();

                EB_Common.Ajax.put(
                    "/settings/network/samecodes/move",
                    parmData,
                    function(data) {
                        if(data == 0){
                            EB_Common.LeavePage.resetState();

                            EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning'],null,{close:function(){
                                $('#level1_8_2_2').click();
                            }});
                            return;
                        }
                        nextTr.insertBefore(tr);
                        me.resetSequence();
                        me.disabledUpAndDown();
                        $('#eb_grid').removeData('moving');
                    }
                );
            });
            
            //Save
            $('#addButton').click(function(e){
                e.preventDefault();
                var parmData = {};
                var inputs = $(this).closest('tr').find(':text');
                for (var i = 0, len = inputs.length; i < len; i++) {
                    if(!$(inputs[i]).valid()){
                        return;
                    }
                    var $el = $(inputs[i]);
                    parmData[$el.attr('name')] = EB_Common.htmlEncode($el.val());
                }
                parmData["order"] = $('#eb_grid tfoot tr td:eq(0) span').text();
                EB_Common.Ajax.post(
                    "/settings/network/samecodes",
                    parmData,
                    function(data) {
                        if(data == -1){
                            EB_Common.dialog.alert(i18n["setting.error.sameCode.duplicatedValue"]);
                            return;
                        }
                        if(data == -2){
                            EB_Common.dialog.alert(i18n["setting.error.sameCode.duplicatedDesc"]);
                            return;
                        }
                        var html = applyTemplate(me.rowTemplate,data);
                        $('#eb_grid tbody').append(html);
                        inputs.each(function(index, element){
                            $(element).val('');//clear
                        });
                        me.hideDeleteBtn();
                        me.resetSequence();
                        me.disabledUpAndDown();
                        
                        //reset Leave Page State
                        EB_Common.LeavePage.resetState();
                    }
                );
            });
        },
        
        resetSequence: function () {
            var rowCount = 0;
            $("#eb_grid tbody tr").each(function(index, element){
                $(element).find('td:eq(0) span').text(index + 1);
                rowCount ++;
            });
            $('#eb_grid tfoot tr td:eq(0) span').text(rowCount+1);
        },
        
        hideDeleteBtn : function(){
            //List must contain at least one SAME Code.When rows is one, the delete button hide.
            var rows = $('#eb_grid tbody tr');
            var len = rows.length;
            if(len == 1){
                rows.find('a[name="operte_delete"]').hide();
            }else{
                for (var i = 0, len = rows.length; i < len; i++) {
                    $(rows[i]).find('a[name="operte_delete"]')[$(rows[i]).data('editstatus') ? 'hide' : 'show']();
                }
            }
        },
                
        disabledUpAndDown : function(){
            var rows = $('#eb_grid tbody tr');
            var len = rows.length;
            rows.each(function(index,element){
                $(element).find('a[name="operte_up"]')[index == 0 ? 'addClass' : 'removeClass']('disabled');
                $(element).find('a[name="operte_down"]')[index == len -1 ? 'addClass' : 'removeClass']('disabled');
            });
        }
    };

    view.settings.network = view.settings.network || {};
    view.settings.network.sameCodes = pub;
})(EB_View);