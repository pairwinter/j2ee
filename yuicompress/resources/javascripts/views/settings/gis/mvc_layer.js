(function(view){
	view.settings.gis = view.settings.gis || {};
	view.settings.gis.layerPanel = {
		LayerTreeView : {
            jDom:{},
            initialize:function(){
            	this.nodes = this.options.nodes;
            	this.initLayerTree();
            	this.zTree = $.fn.zTree.getZTreeObj("layerTree");
            },
            initLayerTree:function(){
            	this.zTreeSetting.callback.beforeRemove = this.beforeRemove;
            	this.zTreeSetting.callback.beforeRename = this.beforeRename;
            	this.zTreeSetting.callback.onDrop = this.onDrop;
            	$.fn.zTree.init($("#layerTree"), this.zTreeSetting, this.nodes);
            	this.setFolder();
            },
            events:{
                "click #addFolder":"add",
                "click #export":"download"
            },
            zTreeSetting:{
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
					beforeDrag: function(treeId, treeNodes) {
						if(treeNodes[0].type == 'Folder'){
							return false;
						}
						return true;
					},
					beforeDrop: function(treeId, treeNodes, targetNode, moveType) {
						if(targetNode == null){
							return true;
						}else{
							if('Layer' == targetNode.type){
								return false;
							}
						}
					},
					onClick: function(event, treeId, treeNode) {
						if(treeNode.type == 'Layer'){
							$('#export').removeClass('export-grap');
							$('#export i').removeClass('grap');
							$('#export a').removeClass('disable');
						}else{
							$('#export').addClass('export-grap');
							$('#export i').addClass('grap');
							$('#export a').addClass('disable');
						}
					},
					afterCancel:function(treeId, treeNode){
						$('#duplicationName').hide();
					}
				}
            },
            setFolder:function(){
        		var treeObj = $.fn.zTree.getZTreeObj("layerTree");
        		var nodes = treeObj.transformToArray(treeObj.getNodes());
        		for(i=0;i<nodes.length;i++){
        			if(nodes[i].type == 'Folder'){
        				nodes[i].isParent = true;
        				treeObj.updateNode(nodes[i]);
        			}
        		}
            },
            beforeRemove:function(treeId, treeNode) {
       		 EB_Common.Ajax.remove("/settings/gis/layer",
				{id:treeNode.id},function(data){
					if (data == '-1') {
						EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
						return;
					}
					/*var zTree = $.fn.zTree.getZTreeObj("layerTree");
					$("option[value='"+treeNode.id+"']").remove();*/
				});
            },
            beforeRename:function(treeId, treeNode, newName){
        	    $('#duplicationName').hide();
        	    
        		var zTree = $.fn.zTree.getZTreeObj("layerTree");
        		console.log(zTree);
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
        					var newName = treeNode.name;
        					if (data == '-3') {
        						EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
        						return;
        					}
        					
        					if(data == '-2'){
        						zTree.editName(treeNode);
        						$('#duplicationName').show().find('label').text(
        								function(index, value) {
        									return i18n['setting.error.name.duplicated'].replace(/\{([\w-]+)\}/g, newName);
        								});
        					}else{
        						/*if(treeNode.id == '-1'){
        							var option = $('<option value="'+data.id+'"></option>');
        							option.text(newName);
        							$("select[name='parentId']").append(option);
        						}else{
        							$("option[value='"+treeNode.id+"']").text(newName);
        						}*/
        						treeNode.id=data.id;
        						treeNode.name=data.name;
        						treeNode.type=data.type;
        						zTree.updateNode(treeNode);
        						$('#duplicationName').hide();
        						zTree.addFlag = false;
        					}
        		}); 
        	},
        	onDrop:function(event, treeId, treeNodes, targetNode, moveType) {
        		if(moveType != 'inner'){
        			return false;
        		};
        		
        	    var parentId =  null;
        	    if(targetNode == null){
        	    	parentId = -1;
        	    }else{
        	    	parentId = targetNode.id;
        	    }
        	    
        	    EB_Common.Ajax.put("/settings/gis/moveLayer",
    		        {id:treeNodes[0].id,
    	        	parentId:parentId},
    		        function(data){
    	        		if (data == '-1') {
    						EB_Common.dialog.alert(i18n['setting.error.resource.notExists'],i18n['dialog.title.warning']);
    						return;
    					}
    	        	}
    	        );
        	},
        	add:function(e) {
        		var zTree = this.zTree,
        			nodes = zTree.getSelectedNodes(),
        			treeNode = nodes[0];
        		zTree.addFlag = true;
        		treeNode = zTree.addNodes(null, {id:-1, pId:-1, isParent:true, name: i18n['global.ztree.newFolder']});
        		zTree.editName(treeNode[0]);
        	},
        	download:function(e){
        	    if($(this).hasClass('export-grap')){
        	    	return;
        	    }
        		var zTree = this.zTree,
        		nodes = zTree.getSelectedNodes(),
        		treeNode = nodes[0];
        		var url = EB_Common.Ajax.wrapperUrl("/settings/gis/layer/download");
                window.open(url+"?id="+treeNode.id);  
        	}
		},
		LayerApp:{
			LayerModel:{
				defaults:function(){
	                return {
	                    load:false,
	                    nodes:[]
	                }
				}
			},
			LayerView:{
                tagName:"li",
                initialize:function(){
                    if(!$.render.layTemplate){
                        $.templates({
                            layTemplate: $("#uploadTemplate").html()
                        });
                    }
                    this.layTemplate = $.render.layTemplate;
                    this.model.on("destroy",this.remove,this);
                    this.model.on("remove",this.remove,this);

                    this.groupItemsCollection = new Backbone.Collection();
                    this.model.set("groupItemsCollection",this.groupItemsCollection);
                    this.groupItemsCollection.on("add",this.collectionAddOne,this);
                    this.groupItemsCollection.on("remove",this.clearItem,this);
                    this.GroupItemView = EB_Common.Backbone.View.extend(EB_View.notification.app.ContactApp.SubUnits.GroupItemApp.GroupItemView);
                },
                render:function(){
                    this.$el.html(this.orgGroupTemplate(this.getIdSuffixModelJSON()));
                    return this;
                },
                collectionAddOne:function(model){
                    this.model.set("count",this.model.get("count")+1);
                    this.$("#count").text(this.model.get("count"));
                    var view = new this.GroupItemView({model:model});
                    this.$("#orgItemsContainer").append(view.render().el);
                },
                events: {
                    "click .remove": "deleteItem"
                },
                clearItem: function(){
                    this.model.set("count",this.model.get("count")-1);
                    if(this.model.get("count")){
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
                }
			},
			LayerCollection:{
				
			},
			getInstance:function(_options){
				
			}
		},
		getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var View = EB_Common.Backbone.View.extend(this.LayerTreeView);
            return new View({el:options.container,nodes:options.nodes});
        }	
	};
	
})(EB_View);