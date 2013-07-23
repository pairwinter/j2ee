(function(view){
    //global var
	var addValidator,
	    updateValidator,
	    fieldItemTemplete = '<li><input type="text" name="definedValue" class="input_long {required:true}" maxlength="40" value="{{value}}"/>\n\
			   <a title="'+i18n['button.delete']+'" href="#" class="icn_trash_16"></a>\n\
			   <a class="icn_down" href="#" title="'+i18n['button.down']+'"></a><a class="icn_up" href="#" title="'+i18n['button.up']+'"></a></li>',
       tmplRe = /\{\{value\}\}/g;
	if(!view.settings.contact)
		view.settings.contact = {};
	view.settings.contact.customField = {};
	view.settings.contact.customField.initCustomFieldPage = function() {
		
	    // add validation 
		var adding = false;
		addValidator = EB_Common.validation.validate('addForm',{
			rules:{
				name :{
				    remote: {
				    	url:EB_Common.Ajax.wrapperUrl("/settings/contact/checkCustomFieldName"),
                        type: "post"
				    }
				}
			},
			messages:{
				name:{
					remote:i18n['setting.error.customFields.duplicatedName']
				}
			},
			submitHandler:function(){
				if(adding)
    				return;
    			adding = true;
	            var queryString = $('#addDataType, #addDisplayFormat').fieldSerialize(); 
	            var definedValue=[];
	            $('#addForm').find('input[name="definedValue"]').each(function(){
	            	definedValue.push($(this).val());
	            });
	            EB_Common.Ajax.post("/settings/contact/customField?"+queryString,{name:$('#addName').val(),definedValue:definedValue},
	        		function(data){ 
	        		    if($('#emptyData').length > 0){
	        		    	$('#emptyData').remove();
	        		    }
						var str = '<tr name="data" id = "'+ data.id + '" displayformat="'+data.displayFormat+'"><td>'
								+ '</td><td>'
								+ setDataType(data.dataType)
								+ '</td><td>'
								+ setDisplayFormat(data.displayFormat)
								+ '</td><td>'
                                + '<a  title="'+i18n['button.edit']+'" href="#" class="icn_edit_16"></a>'
								+ '<a class="icn_trash_16" href="#" title="'+i18n['button.delete']+'" ></a></td></tr>';
						$('#customFieldBody').prepend(str);
						$('#' + data.id +' td:eq(0)').text(data.name);
						$('#' + data.id + ' td a.icn_trash_16').bind('click',deleteGridItem);
						$('#addCustomField').closest('form').hide();
						$("#addName").removeData("previousValue");
						adding = false;
                        
                        //reset Leave Page State
                        EB_Common.LeavePage.resetState();
	            });
			}
		});

       // update form validation
	   var updating = false;
       updateValidator = EB_Common.validation.validate('updateForm',{
			submitHandler:function(){
				if(updating)
    				return;
				updating = true;
	            var definedValue=[];
	            $('#updateForm').find('input[name="definedValue"]').each(function(){
	            	definedValue.push($(this).val());
	            });
	            EB_Common.Ajax.put("/settings/contact/customField",{id:$('#editGrid').prev().attr('id'),name:$('#updateName').val(),definedValue:definedValue},
		        		function(data){ 
		            	if (data == '-1') {
							EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
							return;
						}
						$('#editGrid').prev().find('td').eq(0).text(data.name);
						$('#editGrid').prev().find('td').css('border-width','1px');
						$('#editGrid').hide();
						updating = false;
                        
                        //reset Leave Page State
                        EB_Common.LeavePage.resetState();
	            });
			}
    	});
        
	    // add new custom field click event
		$('#addCustom').click(function(){
		    $('#editGrid').hide();
	        $('#addForm').show().find(':input').not(':button,:submit').val('');
	    	showFormatItem($('#addDisplayFormat').val());
	    });
	    	
	    $('#addItems,#addItems_add').click(addItems);
	    
	    $('#addDisplayFormat').change(function(){
	        showFormatItem($(this).val());
	        var inputs = $('#itemsContainer_add li input');
	        if(inputs.length){
	        	validDataType(inputs, addValidator, $('#addDataType').val());
	        }
	    });
        
        $('#customFieldBody').on('click', 'tr[name="data"]', function() {
            $(this).addClass('selected').siblings().removeClass('selected');
        });
        
	    // click tr show or hide
        $('#customFieldBody').on('click', '.icn_edit_16', function(event) {
            event.preventDefault();
            var row = $(this).closest('tr');
            $('#addForm').hide();
            var updateForm;
            if (row.next().attr('name') == 'gridSub') {
                updateForm = row.next().toggle();
                //initEditData(row, updateForm);
                return;
            } else {
                updateForm = $('#editGrid').insertAfter(row).show();
            }
           
            $("#updateName").rules("remove", "remote");
            $("#updateName").rules("add", {
                remote: {
                    url: EB_Common.Ajax.wrapperUrl("/settings/contact/checkCustomFieldName?id=" + row.attr("id")),
                    type: "post"
                },
                messages: {
                    remote: i18n['setting.error.customFields.duplicatedName']
                }
            });

            initEditData(row, updateForm);
        });
        
	    $('#customFieldBody tr td a.icn_trash_16').bind('click', deleteGridItem);
	    
	    $('#updateCustomField').click(function(e){
	        var editRow = $('#editGrid'),
	    	    gridRow = editRow.prev(),
	    	    validation = $('#itemsContainer').next().find('span.error');
	    	if(gridRow.attr('displayformat') != 'F'){
	    		if($('#itemsContainer li').length == 0){
		    		validation[0].style.display = 'inline-block';
		    		return false;
		    	}else{
		    		validation.hide();
		    	}
	    	}
	    	
	    });
	    
	    $('#collapsedBtn').click(function(){
	    	$(this).closest('tr').prev().find('td').css('border-width','1px');
	    	$(this).closest('tr').hide();
            
            //reset Leave Page State
            EB_Common.LeavePage.resetState();
	    });
	    $('#cancel').click(function(){
	    	$(this).closest('form').hide();
            
            //reset Leave Page State
            EB_Common.LeavePage.resetState();
	    });
		
		$('#addDataType').change(function(){
			var inputs = $('#itemsContainer_add li input');
			inputs.val('').removeClass('error').siblings('.error-right').remove();
			validDataType(inputs, addValidator, $(this).val());
		});
		
        $('#itemsContainer,#itemsContainer_add').on('click', 'a.icn_trash_16', deleteItem);// All of "li a" are bind the event click;
        $('#itemsContainer,#itemsContainer_add').on('click', 'a.icn_down', {arrow: 'down'}, upOrDown);
        $('#itemsContainer,#itemsContainer_add').on('click', 'a.icn_up', {arrow: 'up'}, upOrDown);
        
        $('#addForm').on('change','input[name="definedValue"]',function(){
            addValidator.element('input[name="duplicateForAdd"]');
        });
        $('#updateForm').on('change','input[name="definedValue"]',function(){
            updateValidator.element('input[name="duplicateForUpdate"]');
        });
	};
	
	function initEditData(row, updateForm){
		var name = row.find('td:eq(0)').text(),
         	datatype = row.find('td:eq(1)').html(),
         	format = row.find('td:eq(2)').html(),
         	id = row.attr("id");
    	updateForm.find('input[name="name"]').val($.trim(name));
    	updateForm.find('table tr:eq(1) td:eq(1)').text($.trim(datatype));
    	updateForm.find('table tr:eq(2) td:eq(1) span:eq(0)').text($.trim(format));
		
    	$('#itemsContainer').empty();
		if (row.attr('displayformat') == 'F') {
            $('#addItemsTr').hide();
        } else {
            $('#addItemsTr').show();
            EB_Common.Ajax.get("/settings/contact/definedValue",{
                  id: id
                },
                function(data) {
                    var html = '';
                    for (var i = 0; i < data.length; i++) {
                        html += fieldItemTemplete.replace(tmplRe, data[i]);
                    }
                    //console.time('demo');
                    $(html).appendTo('#itemsContainer');
                    showItemsSort($('#itemsContainer li'), true);
                    //validation 
                    validDataType($('#itemsContainer li input'), updateValidator, dataTypeCode(datatype));
                    //console.timeEnd('demo');
                });
        }
	}
	
	// Dynamic validation
	/**
     * @param inputs form elements
     * @param validator What is it the validator?
     * @param dataType Data Type Value
    **/
	function validDataType(inputs, validator, dataType){
	    if(!inputs || inputs.length == 0){
	    	return;
	    }
		inputs.removeAttr('readonly').removeAttr('maxlength')
				.datepicker('destroy').rules('remove', 'range');
		inputs.rules('remove', 'number');
	    inputs.rules('add', {
			duplicateNameItem: true
		});
		//console.info(dataType);
		dataType = dataType || 'STRING';
		switch(dataType){
			case 'STRING':
			   inputs.attr('maxlength','40');
			   break;
			
			case 'DATE':
			   inputs.attr('readonly','readonly');
			   inputs.datepicker({
					changeMonth : true,
					changeYear : true,
					dateFormat : 'yy-mm-dd',
					onSelect : function(dateStr) {
					    //console.info(this);
					    validator.element(this);
					}
				});
			   break;
			
			case 'NUMBER':
				inputs.rules("add", {
				     number: true,
					 range: [-9999999999,9999999999]
					});
				inputs.attr('maxlength','11');
			    break;
			
			default:
				break;
		}
	}
	
	function showFormatItem(value){
	    $('#itemsContainer_add').hide().html('');
		if(value == 'F'){
		   $('#addItems_add').hide();
	    }else{
	       $('#addItems_add').show();
	       $('#itemsContainer_add').show().append(fieldItemTemplete.replace(tmplRe, ''));
           showItemsSort($('#itemsContainer_add li'), true);
		}
	}
	
	function deleteGridItem(e){
        e.preventDefault();
    	var tr = $(this).closest('tr'),
    	    tbody = tr.parent(),
    	    id = tr.attr("id");
		EB_Common.dialog.confirm(i18n['setting.delete.customField'], i18n['global.dialog.title.confirm'], function() {
			$(this).dialog("close");
			EB_Common.Ajax.remove("/settings/contact/customField", {
				id : id
			}, function(data) {
				if (data == '-1') {
					EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
					return;
				}
				if(tr.next().is('#editGrid')){
					tr.next().hide();
				}
				tr.remove();
				if(tbody.children('tr').length == 0){
					$('<tr id="emptyData"><td colspan="4"><div class="ui-jqgrid-empty-data" style="margin:13px;">' + i18n['global.grid.emptyDataCaption'] + '</div></td></tr>').appendTo(tbody);
				}
			});
		}, function() {
			return;
		});
		e.stopPropagation();
	}
	
	// add format item
	function addItems(e){
        e.preventDefault();
        //test
//        var id = this.id,
//	        containerId = '#itemsContainer' + (id.indexOf('_add') == -1 ? '' : '_add');
//        for (var i = 2; i < 500; i++) {
//             $(fieldItemTemplete.replace(tmplRe, i)).appendTo(containerId);
//        }
	    var id = this.id,
	        containerId = '#itemsContainer' + (id.indexOf('_add') == -1 ? '' : '_add'),
	        dataType = id.indexOf('_add') == -1 ? dataTypeCode($(this).closest('tbody').find('tr:eq(1) td:eq(1)').text()) : $('#addDataType').val(),
	        containerItems,
	        action = $(fieldItemTemplete.replace(tmplRe, '')).appendTo(containerId);
        
        containerItems = $(containerId + ' li');
        showItemsSort(containerItems);
        //validation
		var inputs = action.find('input');
		validDataType(inputs, (id.indexOf('_add') == -1 ? updateValidator : addValidator), dataType);
	}
	//Fields items sort
    function showItemsSort(containerItems, first) {
        var len = containerItems.length;
        if (len == 1) {
			containerItems.find('a.icn_trash_16').hide();
		} else {
			containerItems.find('a.icn_trash_16').show();
        }
        if(first){
            $(containerItems[0]).children('a.icn_up').addClass('disabled');
            $(containerItems[len -1]).children('a.icn_down').addClass('disabled');
        }else{
            for (var i = 0; i < len; i++) {
                $(containerItems[i]).children('a.icn_up')[i == 0 ? 'addClass' : 'removeClass']('disabled');
                $(containerItems[i]).children('a.icn_down')[i == len -1 ? 'addClass' : 'removeClass']('disabled');
            }
        }
	}
    
    // delete format item
    function deleteItem(e) {
        e.preventDefault();
        // validation
        var input = $(e.target).parent().children('input'),
        	inputVal = input.val(),
        	inputs = $(e.target).closest('ul').find('input').not(input);
        var parentUl = $(this).closest('ul');
        $(this).closest('li').remove();
        showItemsSort(parentUl.children());
        
        if($.trim(inputVal) != ''){
        	var repeatInputs = [];
	        inputs.each(function(index, element){
	    		if($.trim($(this).val()) == inputVal){
	    			repeatInputs.push(element);
	    			return false;
	    		}
	    	});
	    	if(repeatInputs.length > 0){
                if(parentUl.attr('id').indexOf('_add') == -1){
                    updateValidator.element('input[name="duplicateForUpdate"]');
                }else{
                    addValidator.element('input[name="duplicateForAdd"]');
                }
	    		//$(repeatInputs[0]).valid();
	    		//addValidator.element(repeatInputs[0]);
	    	}
        }
    }
	
	// arrow up and down to sort
	function upOrDown(e) {
        e.preventDefault();
        var self = $(this);
        if(self.hasClass('disabled')){
            return;
        }
		var selfP = self.parent(),
		    parentUl = self.closest('ul'),
			siblings;
		if(e.data.arrow == 'up'){
			siblings = selfP.prev();
			siblings.before(selfP);
		}else{
			siblings = selfP.next();
			siblings.after(selfP);
		}
		showItemsSort(parentUl.children());
	}
	
	function setDataType(dataType) {
		var value;
		if (dataType == 'DATE')
			value = i18n['setting.contact.customFields.date'];
		else if (dataType == 'NUMBER')
			value = i18n['setting.contact.customFields.number'];
		else if (dataType == 'STRING')
			value = i18n['setting.contact.customFields.string'];
		else
			value = dataType;
		return value;
	}

    function dataTypeCode(dataType) {
		var value;
		dataType = $.trim(dataType);
		switch(dataType){
			case i18n['setting.contact.customFields.date']:
				value = 'DATE';
				break;
			case i18n['setting.contact.customFields.number']:
				value = 'NUMBER';
				break;
			case i18n['setting.contact.customFields.string']:
				value = 'STRING';
				break;
			default:
				value = 'STRING';
				break;
		}
		return value;
	}
	
	function setDisplayFormat(displayFormat) {
		var value;
		if (displayFormat == 'L')
			value = i18n['setting.contact.customFields.singleList'];
		else if (displayFormat == 'F')
			value = i18n['setting.contact.customFields.textbox'];
		else if (displayFormat == 'S')
			value = i18n['setting.contact.customFields.multiList'];
		else
			value = displayFormat;
		return value;
	}


})(EB_View);