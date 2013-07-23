/**
 * Created with IntelliJ IDEA.
 * User: carl
 * Date: 7/14/12
 * Time: 2:21 PM                                    idArray[i].trim()
 * To change this template use File | Settings | File Templates.
 */
(function(view){

    view.contact.list = function(){};


    view.contact.list.initPage = function(context, orgId, isPrivate, searchParam) {
		EB_Common.validation.validate("contactListform");
		var me = this;
        var contact_permission = EB_Common.Security.protect("CONTACT_add_edit_delete_view_list_download_addToGroup_saveAsRule");
        var group_permission = EB_Common.Security.protect("GROUP_Edit_view_list_removeContactFromGroup");
        $("#contacts_gridTable").jqGrid({
            autoencode:true,
            url:context+"/contacts/json",
            datatype: "json",
            mtype:"post",
            contentType: "application/json",
            emptyDataCaption : i18n['global.grid.emptyDataCaption'],
            jsonReader : {
                root: "data",
                page: "currentPageNo",
                total: "totalPageCount",
                records: "totalCount",
                repeatitems: false
            },
            height: "auto",
            autowidth : true,
            colNames:['',i18n['contact.field.id'],
                i18n['contact.field.firstName'],
                i18n['contact.field.middleInitial'],
                i18n['contact.field.lastName'],
                i18n['contact.field.suffix'],
                i18n['contact.field.externalId'],
                i18n['contact.field.recordTypeId'],
                i18n['contact.field.lastModifiedDate'],
                i18n['contact.field.lastModifiedName']],
            colModel:[{name:'id', index:'id', width:40,align:"center", sortable:false, formatter:function(value,rec,rowObject){
                var btnText = '<a class="icn_edit_16 contact_jqgridEditRowBtn" title="'+i18n['button.update']+'"  href="javascript:void(0);" recordId="'+rowObject.id+'"></a>';
                    if(isPrivate=="true"){
                        if(!rowObject.userId && !rowObject.individualAccountId){
                            btnText = btnText + '<a class="icon_sendregis_red contact_jqgridSendToSSPBtn" href="javascript:void(0)" recordId="'+value+'" style="visibility: visible;"></a>';
                        }else{
                            btnText = btnText + '<a class="icon_sendregis_red" style="visibility: hidden;"></a>';
                        }
                    }
                    return btnText;

                }},{name:'id',index:'id', hidden:true},
                {name:'firstName',index:'firstName', width:100, sorttype:"string",formatter:function(val,rec,rowObject){
                    return '<a class="show_detail" recordId="'+rowObject.id+'" href="javascript:void(0);">'+
                        $.jgrid.htmlEncode(val)+'</a>';
                }},
                {name:'middleInitial',index:'middleInitial', width:60},
                {name:'lastName',index:'lastName', width:90},{
                    name : 'suffix',
                    index : 'suffix',
                    width : 50
                },
                {name:'externalId',index:'externalId', width:90},
                {name:'recordTypeName',index:'recordTypeName', width:90,sortable:false},
                {name:'lastModifiedDate',index:'lastModifiedDate', width:120},
                {name:'lastModifiedName',index:'lastModifiedName', width:100, sorttype:"string" }
            ],
            sortname: (searchParam && searchParam.columnName)||'lastName',
            sortorder:(searchParam && searchParam.orderDirection)||'asc',
            viewrecords:true,
            pager:"#contacts_gridPager",
            multiselect:true,
            multiselectWidth : 30,
            scrollOffset : 0,
            page:(searchParam && searchParam.pageNo>0)?searchParam.pageNo :1,
            rowNum: (searchParam && searchParam.rows>0)?searchParam.rows:25,
            postData:{quickSearchValue:(searchParam && searchParam.quickSearchValue)||"", cacheSearching:"yes"},
            prmNames : {
                page:"pageNo", //
                totalrows:"totalrows" //
            },
            onSortCol:function(index, iCol, sortorder){
                var postData = $("#contacts_gridTable").getGridParam("postData");
                postData.isSort = true;
                $("#contacts_gridTable").jqGrid('setGridParam',{postData:postData});
            },
            onSelectAll:function(aRowids,status){
                if(aRowids && aRowids.length>0 && status){
                    $(".canDisabled").removeAttr("disabled").removeClass("btn_disabled");
                    $(".canDisabled").find('i').removeClass("icn_gray");
                }else{
                    $(".canDisabled").attr("disabled",true).addClass("btn_disabled");
                    $(".canDisabled").find('i').addClass("icn_gray");
                }
            },
            onSelectRow:function(rowid,status){
                if(status){
                    $(".canDisabled").removeAttr("disabled").removeClass("btn_disabled");
                    $(".canDisabled").find('i').removeClass("icn_gray");
                    //update by lzj
//                    var selectIds = $('#ids').val() + ",";
//                    if(selectIds.indexOf(',' + rowid + ',') == -1)
//                        $('#ids').val($('#ids').val() + ',' + rowid)
                }else{
                    var selr = $('#contacts_gridTable').jqGrid('getGridParam','selarrrow');
                    if(!selr||selr.length==0){
                        $(".canDisabled").attr("disabled",true).addClass("btn_disabled");
                        $(".canDisabled").find('i').addClass("icn_gray");
                    }
                    //update by lzj
//                    var idArray = $('#ids').val().split(',');
//                    $('#ids').val("");
//                    for(var i = 0; i < idArray.length; i++){
//                        var id = idArray[i].trim();
//                        if(id != "" && id != rowid)
//                            $('#ids').val($('#ids').val() + ',' + id);
//                    }
                }
            },
            loadComplete:function(dataStr){
                if($('#contacts_gridTable').getGridParam('records')>0){
                    $("#contact_downloadn_Btn").removeAttr("disabled").removeClass("btn_disablehttp://timfeng.tumblr.com/post/41288794039/dixiatielu-invited");
                    $("#contact_downloadn_Btn").find('i').removeClass("icn_gray");
                    $("#contact_sendEmail_Btn").removeAttr("disabled").removeClass("btn_disabled");
                    $("#contact_sendEmail_Btn").find('i').removeClass("icn_gray");
                }else{
                    $("#contact_downloadn_Btn").attr("disabled",true).addClass("btn_disabled");
                    $("#contact_downloadn_Btn").find('i').addClass("icn_gray");
                    $("#contact_sendEmail_Btn").attr("disabled",true).addClass("btn_disabled");
                    $("#contact_sendEmail_Btn").find('i').addClass("icn_gray");
                }
                $(".canDisabled").attr("disabled",true).addClass("btn_disabled");
                $(".canDisabled").find('i').addClass("icn_gray");

                //update by lzj
//                var rowIdArray = $('#contacts_gridTable').jqGrid('getDataIDs');
//                var selectIds = $('#ids').val() + ",";
//                for(var i = 0; i < rowIdArray.length; i++){
//                    var rowId = "," + rowIdArray[i] + ",";
//                    if(selectIds.indexOf(rowId) >= 0) $('#contacts_gridTable').setSelection(rowIdArray[i],true);
//                }
            },
            gridComplete:function(){
                $(".contact_jqgridDeleteRowBtn").click(function(event){
                    event.stopPropagation();
                    var id = $(this).attr("recordId");
                    EB_Common.dialog.confirm(
                        function(){
                            EB_Common.Ajax.remove("/contacts/"+id+"?version="+new Date().getMilliseconds()+Math.random(),null,
                                function(data){
                                    $("#contacts_gridTable").trigger("reloadGrid");
                                },null,
                                "json");
                            $(this).dialog("close");
                        },function(){
                            $(this).dialog("close");
                            return;
                        });
                });

                $(".contact_jqgridEditRowBtn").click(function(event){
                    event.stopPropagation();
                    window.location=context+'/contacts/update/'+$(this).attr("recordId");
                });
                $(".show_detail").click(function(event){
                    event.stopPropagation();
                    location=context+'/contacts/show/'+$(this).attr("recordId");
                });

                $(".contact_jqgridSendToSSPBtn").click(function(event){
                    event.stopPropagation();
                    var contactId = $(this).attr("recordId");
                    EB_Common.dialog.confirm(i18n['contact.text.ssp.email.alert'],"warning",
                        function(){
                            EB_Common.Ajax.get("/sendemail/ssp/"+orgId+"/"+contactId+"?version="+new Date().getMilliseconds()+Math.random(), null,
                                function(data) {
                                    if ( data.status=="-2"){
                                        EB_Common.dialog.alert(i18n['contact.text.contactpath.null']);
                                        return;
                                    }else
                                    if (data.status=="0") {
                                        EB_Common.dialog.alert(i18n['contact.text.ssp.email.false']);
                                        return;
                                    }else
                                    if (data.status=="1"){
                                        EB_Common.dialog.alert(i18n['contact.text.ssp.email.success']);
                                        return;
                                    }
                                });
                            $(this).dialog("close");
                        } );
                });
            },
            onPaging:function(pgButton){
                if(pgButton != "records"){
                    $('#ids').val('')
                }
            }
        });

        $("#simpleSearch").click(function(){
            var quickSearchValue = $("#quickSearchValue").val();
            $("#contacts_gridTable").jqGrid("clearGridData");
            $("#contacts_gridTable").jqGrid('setGridParam',{postData:{quickSearchValue:$.trim(quickSearchValue),filterRules:'',isFilter:"false"},page:1})
                .trigger("reloadGrid");
        });
        $("#quickSearchValue").keypress(function(event){
            if(event.keyCode==13){
                $('#simpleSearch').click();
            }
        });

        $("#addBut").click(function(){
            document.location=context+"/contacts/create";
        });
        $("#contacts_deleteBatch").click(function(){
            var selr = jQuery('#contacts_gridTable').jqGrid('getGridParam','selarrrow');
            if(selr.length==0){
                EB_Common.dialog.alert("Please select one contact at least!","Error");
                return false;
            }
            EB_Common.dialog.confirm(
                function(){
                    EB_Common.Ajax.remove('/contacts/batchdelete/json?version='+new Date().getMilliseconds()+Math.random(),{ids:selr},function(){
                        $("#contacts_gridTable").trigger("reloadGrid");
                    },null,'json');
                    $(this).dialog("close");
                },function(){return;});
        });
        $('#contacts_clear_search').click(function(){
            $('#quickSearchValue').val('');
            $("#simpleSearch").click();
        });

        var advancedSearch = null;
        $('#forAdvanceSearch').click(function(){
            if(!advancedSearch){
                advancedSearch = EB_View.contact.advancedSearchApp.getInstance({container:$('#advancedsearch_div'),
//                    exsitFilterRules: (searchParam && $.parseJSON(searchParam.filterRuleStr))||[],
                    showSavedAsRule:true,
                    autoOpen:true,
                    callback:{
                        search:function(conditions,isFilterVal,filterName){
                            $('#contacts_gridTable').jqGrid('setGridParam',{datatype:'json',postData:{quickSearchValue:'',
                                filterRules:EB_Common.json.stringify(conditions),isFilter:isFilterVal,filterName:filterName, isSort:false}}).trigger("reloadGrid");
                        },close:function(){
                            $('#contacts_clear_search').click();
                        }
                    }
                    }
                    );
//                $('#advancedsearch_div').show();
            }else{
                if(advancedSearch.isHidden()){
                    advancedSearch.open();
                }else{
                    advancedSearch.close();
                }
            }

        });
        if(searchParam && searchParam.filterRuleStr){
            advancedSearch = EB_View.contact.advancedSearchApp.getInstance({container:$('#advancedsearch_div'),
                    exsitFilterRules:$.parseJSON(searchParam.filterRuleStr)||[],
                    showSavedAsRule:true,
                    autoOpen:true,
                    callback:{
                        search:function(conditions,isFilterVal,filterName){
                            $('#contacts_gridTable').jqGrid('setGridParam',{datatype:'json',postData:{quickSearchValue:'',
                                filterRules:EB_Common.json.stringify(conditions),isFilter:isFilterVal,filterName:filterName, isSort:false}}).trigger("reloadGrid");
                        },
                        close:function(){
                            $('#contacts_clear_search').click();
                        },
                        afterComplete:function(){
                            this.search();
                        }
                    }
                }
            );
//            $('#forAdvancedSearch').click();
//            advancedSearch.search();
        }
        var downloadApp;
        $("#contact_downloadn_Btn").click(function(){
            var postData={};
            if(advancedSearch && !advancedSearch.isHidden()){
                postData.filterRules= EB_Common.json.stringify(advancedSearch.getConditions());
            }
            postData.quickSearchValue = $("#quickSearchValue").val();
            var selr = $('#contacts_gridTable').jqGrid('getGridParam','selarrrow');
            $("#contactDownloadForm").find('input[name="ids"]').remove();
            var ids = [];
            if(selr&&selr.length>0){
                for(var i=0;i<selr.length;i++){
                    $("#contactDownloadForm").append($('<input name="ids" type="hidden">').val(selr[i]));
                    ids.push(selr[i]);
                }
            }
            $("#contactDownloadForm").find('input[name="filterRules"]').val(postData.filterRules);
            $("#contactDownloadForm").find('input[name="quickSearchValue"]').val(postData.quickSearchValue);
            $("#contactDownloadForm").find('input[name="sidx"]').val(postData.sidx);
            $("#contactDownloadForm").find('input[name="sord"]').val(postData.sord);
            var _postData = {
                filterRules:postData.filterRules||[],
                quickSearchValue:postData.quickSearchValue||'',
                sidx:postData.sidx,
                sord:postData.sord,
                ids:ids||[]
            };
            if(!downloadApp){
                var settings = {
                    container:$("#download_div"),
                    downloadAsyncUrl:context+'/contacts/download/async',
                    downloadSyncUrl:context+"/contacts/download",
                    downloadCheckUrl:context+"/contacts/download/check/threshold",
                    downloadForm:$("#contactDownloadForm")
                };
                downloadApp = EB_View.downloadApp.getInstance(settings);
            }
            downloadApp.execute(_postData);
        });

        $("#contact_sendEmail_Btn").click(function(event){
            event.stopPropagation();
            var postData={};
            if(advancedSearch && !advancedSearch.isHidden()){
                postData.filterRules= EB_Common.json.stringify(advancedSearch.getConditions());
            }
            postData.quickSearchValue = $("#quickSearchValue").val();
            var selr = $('#contacts_gridTable').jqGrid('getGridParam','selarrrow');
            var ids = [];
            if(selr&&selr.length>0){
                for(var i=0;i<selr.length;i++){
                    ids.push(selr[i]);
                }
            }
            postData.contactIds = ids;
            EB_Common.Ajax.post("/contacts/checkContactsNumForRegister/json", postData,
                function(result) {
                    if ( result.data>0){
                        EB_Common.dialog.confirm(jQuery.validator.format(i18n['contact.text.sendRegister.email.alert'], result.data),"",
                            function(){
                                EB_Common.Ajax.post("/contacts/sendEmailForRegister/json", postData,
                                    function(data) {
                                        EB_Common.dialog.alert(i18n['contact.text.ssp.email.success']);
                                    });
                                $(this).dialog("close");
                            } );
                        return;
                    }else{
                        EB_Common.dialog.alert(i18n['contact.text.sendRegister.email.noContacts']);
                        return;
                    }
                },null,i18n['contact.text.sendRegister.email.confirm.ok']);
        });

        $("#addToGroupBut").click(function(){
            var selr = jQuery('#contacts_gridTable').jqGrid('getGridParam','selarrrow');
            if(selr.length==0){
                EB_Common.dialog.alert("Please select one contact at least!","Error");
                return false;
            }

            var settings = {
                autoOpen : false,
                modal: true,
                resizable: false,
                width:400,
                height:315,
                buttons: {
                    Ok : {
						click : function() {
							if ($("#groupId").val() == "") {
								EB_Common.dialog.alert(
										"Please select a group!", "Error");
								return false;
							}
							$.ajax({
								url : context + '/contacts/addtogroup/json?version='+new Date().getMilliseconds()+Math.random(),
								data : {
									ids : selr,
									groupId : $("#groupId").val()
								},
								type : 'post',
								dataType : 'json',
								success : function(data) {
									if (data.result == "success") {
										$("#selectGroupForm").dialog("close");
									} else {
										EB_Common.dialog
												.alert(
														i18n['contact.error.add.to.group.failed'],
														'Error');
									}
								}
							});
						},
						'class' : 'orange',
						text : i18n['global.dialog.button.ok']
					},
                    Cancel : {
						click : function() {
							$(this).dialog("close");
						},
						'class' : 'gray',
						text : i18n['global.dialog.button.cancel']
					}
                },
                
                open: function() {
		             $buttonPane = $(this).next();
		
		             /*$buttonPane.find('button:first').addClass('accept').addClass('ui-priority-primary');
		
		             $buttonPane.find('button:last').addClass('cancel').addClass('ui-priority-secondary');*/
		
		          },
                close:function(){
                    $("#groupName").text("");
                    $("#groupId").val("");
                    $("#contacts_gridTable").jqGrid('resetSelection');
                    //update by lzj
//                    $('#ids').val('');

                    $(".canDisabled").attr("disabled",true).addClass("btn_disabled");
                    $(".canDisabled").find('i').addClass("icn_gray");
                    $(this).dialog('destroy');
                }
            };
            $("#selectGroupForm").attr('title',i18n['contact.text.add.to.group']).dialog(settings);
            
            if(!me.loadGroupTree){// no loading
               var zSetting = {
		            data : {
		                keep : {
		                    leaf : false,
		                    parent : false
		                },
		                key : {
		                    checked : "checked",
		                    children : "groups",
		                    name : "name",
		                    id:"id",
		                    title : ""
		                }
		            },
		            view: {
		                selectedMulti: false
		            },
		            callback: {
		                onClick: zTreeOnlClick
		            }
		        };
            	$.ajax({
	                url:context+'/contacts/groups/tree/json?version='+new Date().getMilliseconds()+Math.random(),
	                dataType:'json',
                    async:true,
	                success: function(data){
	                    var zNodes = data;
	                    var zRootNode = {id:-1,name:i18n['contact.text.all.contact.group'],groups:zNodes, open:true};
	                    $.fn.zTree.init($("#contact_grouptree"), zSetting, zRootNode);
	                    $( "#selectGroupForm" ).dialog( "open" );
	                }
	            });
	            $("#showGroup").show();
            }else{
            	$( "#selectGroupForm" ).dialog( "open" );
            }
        });
        
        function zTreeOnlClick(event, treeId, treeNode) {
            if(treeNode.id==-1){
                var treeObj = $.fn.zTree.getZTreeObj(treeId);
                treeObj.cancelSelectedNode(treeNode);
                return false;
            }
            $("#groupName").text(treeNode.name);
            $("#groupId").val(treeNode.id);
        };
    };

})(EB_View)

