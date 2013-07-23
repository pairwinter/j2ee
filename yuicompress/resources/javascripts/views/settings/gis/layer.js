(function(view){
	if(!view.settings.gis)
		view.settings.gis = function(){};
	view.settings.gis.initLayerPage = function(zNodes) {	
		var setting = {
				view: {
					selectedMulti: false
				},
				edit: {
					drag: {
						isCopy: false,
		    			isMove: true,
		    			prev:	false,
		    			next:	false
					},
					enable: true,
					showRemoveBtn: true,
					showRenameBtn: true
				},
				data: {
					keep: {
						parent:true,
						leaf:false
					},
					key : {
		                checked : "checked",
		                children : "layers",
		                name : "name",
		                id:"id",
		                parentId:"parentId"
		            }
				},
				callback: {
					beforeRemove: beforeRemove,
					beforeRename: beforeRename,
					beforeDrag: beforeDrag,
					beforeDrop: beforeDrop,
					onDrop: onDrop,
					onClick: zTreeOnClick,
					afterCancel:afterCancel
				}
			};
		
		$.fn.zTree.init($("#layerTree"), setting, zNodes);
		setFolder();
		$("#addFolder").bind("click", add);
		$("#export").bind("click", download);
		
		//add import file
		var i=0;
		$("#import_btn").click(function(){
			var import_ct = $("#import_ct");
			var zTree = $.fn.zTree.getZTreeObj("layerTree");
			var nodes = zTree.getNodesByParam("type", "Folder", null);
			var layer = "name"+i;
			var template = $($("#uploadTemplate").render([{nodes:nodes,layer:layer}]));

			import_ct.append(template);
			template.find('.b-setting-form-del').click(function(){
				$(this).parent().remove();
				if(import_ct.children().length == 0){
					$('#upload').hide();
                    EB_Common.LeavePage.resetState();
				}
			});
			var input = template.find('.checkLayerName');
			input.rules("add", {
				 duplicateName:true,
				 remote: {
					 url : EB_Common.Ajax.wrapperUrl("/settings/gis/layer/checkLayerName"),
					 type: "POST",
					 data:{
						 id:-1,
						 name:function(){return input.val()}
					 }
				 },
				 messages: {
				   remote: i18n['setting.error.region.duplicatedName']
				 }
			});
			if($('#upload:hidden').length > 0){
				$('#upload').show();
			}
			i++;
		});
		
		$.validator.addMethod('duplicateName', function(value, element, param) {
	    	var values = {},
	    		inputs = $(element).closest('form').find('.checkLayerName').not(element),
	    		lastRepeatValue = $(element).prop('lastRepeatValue'),
	    		repeatInputs = [];
	    	
	    	$(element).prop('lastRepeatValue', $.trim(value));
	    	inputs.each(function(index, element){
	    		values[$.trim($(this).val())] = true;
	    		if($.trim($(this).val()) == lastRepeatValue){
	    	        repeatInputs.push(element);
	    	    }
	    	});
	    	//console.info(repeatInputs);
	    	// remove validation info
	    	if(lastRepeatValue != $.trim(value) && repeatInputs.length == 1){
	    		$(repeatInputs[0]).removeClass('error').parent().children('.error-right').remove();
	    	}
		    	
	    	if(values[$.trim(value)]){
	    		return false;
	    	}else{
				return true;
	    	}
			
        }, i18n['setting.error.region.duplicatedName']);
		
		EB_Common.validation.validate("layerForm",{
			messages:{
				regionFile:{
					accept:i18n['setting.error.gis.fileType']
				}
			},
			submitHandler:function(){
				var options = {
					url: EB_Common.Ajax.wrapperUrl("/settings/gis/layer") ,
					type : 'POST',
					dataType : 'json',
					success : function(data) {
//						console.log(data);
						if(!data.success){
							$('#layerForm').find(".b-setting-form-del").show();
							var code = data.resultCode;
							if (code == '-1') {
								EB_Common.dialog.alert("You already have the maximum number of display layers. To create another, you'll need to delete an existing one.",i18n['dialog.title.warning']);
								return;
							}else if(code == "-2"){
								EB_Common.dialog.alert(i18n['setting.error.input.duplicated'],i18n['setting.error']);
								return;
							}else if(code == "-3"){
								EB_Common.dialog.alert(i18n['setting.error.gis.illegalFile'],i18n['setting.error']);
								return;
							}
						}else{
							var zTree = $.fn.zTree.getZTreeObj("layerTree");
							var layers = data.data;
							for(i = 0; i < layers.length; i++){
								var layer = layers[i];
								//console.log(region);
								var targetNode = zTree.getNodeByParam("id",layer.parentId,null);
								treeNode = zTree.addNodes(targetNode, {id:layer.id, name:layer.name,type:layer.type});
								//console.log(treeNode);
							}
							$("#import_ct > div.b-upload_div.margin10-T").each(function(){
								$(this).remove();
							});
							$('#upload').hide();
							EB_Common.LeavePage.resetState();
						}
						
					},
					failure:function(data){
					  $('#layerForm').find(".b-setting-form-del").show();
					  console.info(data);
					}
				};
				
				var names = $('#layerForm').find(".checkLayerName").map(function(index,element){
					return $(element).val();
				}).get().join(',');
				$('#layerForm').find(".b-setting-form-del").hide();
				$("#layerName").val(names);
				$('#layerForm').ajaxSubmit(options);
				//return false;
			}
		});
	};
	
	function setFolder() {
		var treeObj = $.fn.zTree.getZTreeObj("layerTree");
		var nodes = treeObj.transformToArray(treeObj.getNodes());
		for(i=0;i<nodes.length;i++){
			if(nodes[i].type == 'Folder'){
				nodes[i].isParent = true;
				treeObj.updateNode(nodes[i]);
			}
		}
	}
		
	function beforeDrag(treeId, treeNodes) {
		if(treeNodes[0].type == 'Folder'){
			return false;
		}
		return true;
	}
	
	function beforeDrop(treeId, treeNodes, targetNode, moveType) {
		if(targetNode == null){
			return true;
		}else{
			if('Layer' == targetNode.type){
				return false;
			}
		}
	}
	function beforeRemove(treeId, treeNode) {
        EB_Common.dialog.confirm(function(){
            var zTree = $.fn.zTree.getZTreeObj("layerTree");
            zTree.removeNode(treeNode);
            EB_Common.Ajax.remove("/settings/gis/layer",
                    {id: treeNode.id}, function(data) {
                if (data == '-1') {
                    EB_Common.dialog.alert(i18n['setting.error.resource.notExists'], i18n['dialog.title.warning']);
                    return;
                }
                $("option[value='" + treeNode.id + "']").remove();
            });
        });
        return false;
	}

	function add(e) {
		var zTree = $.fn.zTree.getZTreeObj("layerTree"),
			nodes = zTree.getSelectedNodes(),
			treeNode = nodes[0];
		zTree.addFlag = true;
		treeNode = zTree.addNodes(null, {id:-1, pId:-1, isParent:true, name: i18n['global.ztree.newFolder']});
		zTree.editName(treeNode[0]);
	};
	function edit() {
		var zTree = $.fn.zTree.getZTreeObj("layerTree"),
		nodes = zTree.getSelectedNodes(),
		treeNode = nodes[0];
		if (nodes.length == 0) {
			EB_Common.dialog.alert(i18n['setting.error.node.empty']);
			return;
		}
		zTree.editName(treeNode);
	};
	function remove(e) {
		var zTree = $.fn.zTree.getZTreeObj("layerTree"),
		nodes = zTree.getSelectedNodes(),
		treeNode = nodes[0];
		if (nodes.length == 0) {
			EB_Common.dialog.alert(i18n['setting.error.node.empty']);
			return;
		}
	};
	
	function download(e){
	    if($(this).hasClass('export-grap')){
	    	return;
	    }
		var zTree = $.fn.zTree.getZTreeObj("layerTree"),
		nodes = zTree.getSelectedNodes(),
		treeNode = nodes[0];
		var url = EB_Common.Ajax.wrapperUrl("/settings/gis/layer/download");
        window.open(url+"?id="+treeNode.id);  
	}
	
	function move(e){
		var zTree = $.fn.zTree.getZTreeObj("layerTree"),
		nodes = zTree.getSelectedNodes(),
		treeNode = nodes[0];
		if (nodes.length == 0) {
			EB_Common.dialog.alert(i18n['setting.error.node.empty']);
			return;
		}
		
		if(treeNode.type != 'Layer'){
			EB_Common.dialog.alert(i18n['setting.error.node.empty']);
			return ;
		}
	}
	
	function beforeRename(treeId, treeNode, newName){
	    $('#duplicationName').hide();
	    
		var zTree = $.fn.zTree.getZTreeObj("layerTree");
		var parentNode = treeNode.getParentNode();
		var parentId = (parentNode==null)?-1:parentNode.id;
		var oldName = treeNode.name;
		if($.trim(newName) == ""){
			if(treeNode.id == '-1')
				zTree.removeNode(treeNode,false);
			else
				zTree.cancelEditName();
			return false;
		}
		if(treeNode.id!=-1 && treeNode.name==newName){
		    return;
		}
		
		function filter(node) {
		    return (node.level == 0 && $.trim(node.name) == $.trim(newName) && node.type == 'Folder');
		}
		var nodes = zTree.getNodesByFilter(filter);
		console.info(i18n['setting.error.name.duplicated']);
		if(nodes.length > 0){
		    $('#duplicationName').show().find('label').text(
					function(index, value) {
						return i18n['setting.error.name.duplicated'].replace(/\{([\w-]+)\}/g, newName.length > 20 ? newName.substring(0,20) + '...' : newName);
					});
			return false;
		}
        zTree.addFlag = false;
		EB_Common.Ajax.put("/settings/gis/layer",
				{id:treeNode.id,name:newName,parentId:parentId,type:treeNode.type},function(data){
					console.log(data);
					var newName = treeNode.name;
					if (data == '-3') {
						EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
						return;
					}
					
					if(data == '-2'){
						if(treeNode.id == '-1'){
							//zTree.removeNode(treeNode,false);
							//EB_Common.dialog.alert(i18n['setting.error.name.duplicated'],i18n['setting.error']);
						}else{
							treeNode.name=oldName;
							zTree.updateNode(treeNode);
							//EB_Common.dialog.alert(i18n['setting.error.name.duplicated'],i18n['setting.error']);
						}
						
						zTree.editName(treeNode);
						$('#duplicationName').show().find('label').text(
								function(index, value) {
									return i18n['setting.error.name.duplicated'].replace(/\{([\w-]+)\}/g, newName);
								});
					}else{
						if(treeNode.id == '-1'){
							var option = $('<option value="'+data.id+'"></option>');
							option.text(newName);
							$("select[name='parentId']").append(option);
						}else{
							$("option[value='"+treeNode.id+"']").text(newName);
						}
						treeNode.id=data.id;
						treeNode.name=data.name;
						treeNode.type=data.type;
						zTree.updateNode(treeNode);
						$('#duplicationName').hide();
						zTree.addFlag = false;
					}
		}); 
	};
	
	function afterCancel(treeId, treeNode){
		$('#duplicationName').hide();
	}
	
	function onDrop(event, treeId, treeNodes, targetNode, moveType) {
		if(moveType != 'inner'){
			return false;
		};
		
	    var parentId =  null;
	   
	    if(targetNode == null){
	    	parentId = -1;
	    }else{
	    	parentId = targetNode.id;
	    }
	    
	    moveForAjax(treeNodes[0].id, parentId);
	};
	
	function moveForAjax(id,parentId){
	    EB_Common.Ajax.put("/settings/gis/moveLayer",
		        {id:id,
	        	parentId:parentId},
		        function(data){
	        		if (data == '-1') {
						EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
						return;
					}
				});
	};
	
	function zTreeOnClick(event, treeId, treeNode) {
		if(treeNode.type == 'Layer'){
			//export highlight
			$('#export').removeClass('export-grap');
			$('#export i').removeClass('grap');
			$('#export a').removeClass('disable');
		}else{
			$('#export').addClass('export-grap');
			$('#export i').addClass('grap');
			$('#export a').addClass('disable');
		}
	};
		
})(EB_View);