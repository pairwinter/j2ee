(function(view) {
	view.reports = function() {};
	view.reports.customReportList = function() {};
	view.reports.customReportList.initPage = function(context) {
		if(window.location.hash == '#event'){
			$('#canned').val('event');
			var cannedItem = $('#canned_item');
			cannedItem.children().hide();
			$('#'+$('#canned').val()).show();
		}
		
		$('#canned').change(function() {
			var value = $(this).val();
			var cannedItem = $('#canned_item');
			cannedItem.children().hide();
			$('#'+$(this).val()).show();
		});
		
		$('#view_event').click(function(){
			var eventId = $('#eventId').val();
			//console.log(eventId);
			if(eventId == null)
				return false;
			location.href=EB_Common.Ajax.wrapperUrl('/reports/event/summary?eventId='+eventId);
		});
		
		$('#view_broadcast').click(function(){
			location.href=EB_Common.Ajax.wrapperUrl('/reports/broadcast/history');
		});
        
        $('#view_analysis').click(function(e){
            e.preventDefault();
            location.href=EB_Common.Ajax.wrapperUrl('/reports/notification/list');
        });
        $("#gridTable").jqGrid({
            url:context+"/customReports/json",
            datatype: "json",
            contentType: "application/json",
            autoencode:true,
            emptyDataCaption : i18n['global.grid.report.emptyDataCaption'],
            emptyDataCls : 'report',
            height: "auto",
            autowidth: true,
            colNames:['','ID',
                i18n['report.model.name'],
                i18n['report.model.type'],
                i18n['report.model.created.on'],
                i18n['report.model.created.by'],
                i18n['report.model.last.updated']],
            colModel:[{name:'id', index:'id', width:10,align:"center", sortable:false, formatter:function(value,rec,rowObject){
                 return ''
                    //return '/*<a class="icn_trash_16 customReport_jqgridDeleteRowBtn" title="'+i18n['button.delete']+'"  href="javascript:void(0);" recordId="'+rowObject.id+'"></a>*/';

                }},
                {name:'id', index:'id',hidden:true},
                {name:'name', index:'name',  width:200,formatter:function(val,rec,rowObject){
                    return '<a href="'+context+'/customReports/update/'+rowObject.id+'">'+
                        $.jgrid.htmlEncode(val)+'</a>';

                }},
                {name:'customReportType', index:'customReportType',  width:200,
                	formatter:function(val,rec,rowObject){               		
                		return i18n['customreport.type.'+val];
                	}
                       
                },
                {name:'createdDate', index:'createdDate',  width:200},
                {name:'createdName', index:'createdName',  width:200},
                {name:'lastModifiedDate', index:'lastModifiedDate'}
            ],
            jsonReader : {
                root: "data",
                page: "currentPageNo",
                total: "totalPageCount",
                records: "totalCount",
                repeatitems: false
            },
            sortname:'lastModifiedDate',
            sortorder:'desc',

            viewrecords:true,
            pager:"#gridPager",
            multiselect:true,
            prmNames :{
                page:"page",
                rows:"size"
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
                }else{
                    var selr = $('#gridTable').jqGrid('getGridParam','selarrrow');
                    if(!selr||selr.length==0){
                        $(".canDisabled").attr("disabled",true).addClass("btn_disabled");
                        $(".canDisabled").find('i').addClass("icn_gray");
                    }
                }
            },
            loadComplete:function(dataStr){
                $(".canDisabled").attr("disabled",true).addClass("btn_disabled");
                $(".canDisabled").find('i').addClass("icn_gray");

            },
            gridComplete:function(){
                $(".customReport_jqgridDeleteRowBtn").click(function(event){
                    event.stopPropagation();
                    var id = $(this).attr("recordId");
                    EB_Common.dialog.confirm(
                        function(){
                            EB_Common.Ajax.remove("/customReports/json/"+id+"?version="+new Date().getMilliseconds()+Math.random(),null,
                                function(data){
                                    $("#gridTable").trigger("reloadGrid");
                                },null,
                                "json");
                            $(this).dialog("close");
                        },function(){
                            $(this).dialog("close");
                            return;
                        });
                });
            }
        });

        $("#btn_delete").click(function(){
//            var ids=$("#gridTable").getGridParam('selarrrow');
            var selr = jQuery('#gridTable').jqGrid('getGridParam','selarrrow');
            if(selr.length==0){
                EB_Common.dialog.alert("Please select one contact at least!","Error");
                return false;
            }
            EB_Common.dialog.confirm(
                function(){
                    EB_Common.Ajax.remove('/customReports/batchdelete/json?',{ids:selr},function(){
                        $("#gridTable").trigger("reloadGrid");
                    },null,'json');
                    $(this).dialog("close");
                },function(){return;});
        });
	};
	
})(EB_View);