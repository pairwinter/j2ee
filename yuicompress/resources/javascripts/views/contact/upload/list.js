/**
 * User: carl
 * Date: 7/14/12
 * Time: 2:57 PM
 * To change this template use File | Settings | File Templates.
 */
(function(view){
    view.contact.upload = function(){};
    view.contact.upload.initPage=function(context,orgId){
        EB_Common.validation.validate("upload_form1");
        $('#upload_file').change(function(){
            $('#upload_method_div').show();
            $('#uploadBtn').removeAttr("disabled").removeClass("gray");
        });
        var upload_options = {
            beforeSend:function(){
                $('#uploadBtn').attr("disabled",true).addClass("gray");
            },
            url:context+'/contacts/upload/process',
//            data:{orgId:orgId},
            type:'post',
            success: function(data) {
                if(data.result=='failed'){
                    EB_Common.dialog.alert(data.error);
                }
                $("#uploadFileForm").dialog( "close" );
                EB_Common.dialog.alert(i18n['contact.upload.text.afterupload']);
                $("#uploads_gridTable").trigger("reloadGrid");
            },
            error:function(){
                $('#uploadBtn').removeAttr("disabled").removeClass("gray");
            }};
        var upload_settings = {
            title:i18n['contact.upload.dialog.title'],
            modal: true,
            height:'auto',
            width:500,
            resizable:false,
            autoOpen:false,
            buttons: {
                Ok: {
                    click:function() {
                        if($(":checked[name='uploadMethodName']").val()=="WITH_RECORD_TYPE" ||
                            $(":checked[name='uploadMethodName']").val()=="DELETE"){
                            EB_Common.dialog.confirm(i18n['contact.upload.option.replaceAndDelete.confirm.tip'],'',function(){
                                $("#upload_form1").ajaxForm(upload_options).submit();
                            });
                        }else{
                            $("#upload_form1").ajaxForm(upload_options).submit();
                        }

                    },
                    'class' : 'orange',
                    text : i18n['button.upload'],
                    id:'uploadBtn'
                },
                Cancel:{
                    click:function() {
                        $(this).dialog( "close" );
                    },
                    'class' : 'gray',
                    text : i18n['global.dialog.button.cancel']
                }

            },
            close:function(){
//                $('#upload_method_div').remove();
                $("#uploadFileForm").empty();
                $("#upload_form1").resetForm();
//                $(this).dialog('destroy');
            },
            open:function(){
                $('#uploadBtn').attr("disabled",true).addClass("gray");

            }
        };
//        var uploadFormDialog = $("#uploadFileForm").dialog(upload_settings);
        EB_Common.Ajax.get("/statics/tmpl/account/upload/uploadDialogTmpl.html", {}, function(data) {
            $.template("uploadTmpl", data);
            $("#buttonUplod").attr("disabled",false);
        }, "html");
        EB_Common.dialog.dialog('uploadFileForm',upload_settings);
        $("#buttonUplod").click(function () {
            var data_ = [{uploadTitle:i18n["contact.field.upload.choose.a.file"],
                option1:i18n['contact.upload.option.insert'],
                option1_description:i18n['contact.upload.option.insert.message'],
                option2: i18n['contact.upload.option.replace'],
                option2_description:i18n['contact.upload.option.replace.message'],
                option3: i18n['contact.upload.option.delete'],
                option3_description:i18n['contact.upload.option.delete.message'],
                orgId:orgId}];
//            $("#uploadFileForm").append($("#uploadTemplate").render(data_));
            $.tmpl("uploadTmpl", data_).appendTo("#uploadFileForm");
            $('#upload_file').change(function(){
                $('#upload_method_div').show();
                $('#uploadBtn').removeAttr("disabled").removeClass("gray");
            });

            $("#uploadFileForm").dialog('open');
        });

        $("#refresh_upload").click(function(){
            $("#uploads_gridTable").trigger("reloadGrid");
        });
        $('#downloadTemplate').click(function(){
            location=context+"/statics/CSVTemplate.csv?"+new Date().getTime();
        });
        var upload_permission = EB_Common.Security.protect("UPLOAD_view_list_uploadToPortal");
        $("#uploads_gridTable").jqGrid({
            autoencode:true,
            url:context+"/contacts/upload/json",
            datatype: "json",
            mtype:"get",
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
            colNames:['',i18n['contact.field.FileName'],
                i18n['contact.field.batch.ID'],
                i18n['contact.field.FileSize'],
                i18n['contact.field.UploadDate'],
                i18n['contact.field.UploadByName'],
                i18n['contact.field.UploadStatus'],
                i18n['contact.field.RecordsReceived'],
                i18n['contact.field.RecordsLoaded'],
                i18n['contact.field.UploadMethod']],
            colModel:[{name:'id', index:'id', width:60,align:"center", sortable:false, formatter:function(value,rec,rowObject){
                    if(upload_permission){
                        return '<a class="icon_view upload_jqgridEditRowBtn"  title="'+i18n['button.view']+'" href="javascript:void(0);" recordId="'+rowObject.id+'"></a>';
                    } else{
                        return '';
                    }
                }},{name:'fileName',index:'fileName', width:100, sorttype:"string"},
                {name:'id',index:'id', width:90, sorttype:"string"},
                {name:'fileSize',index:'fileSize', width:90},
                {name:'createdDate',index:'createdDate', width:120, sorttype:"datetime"},
                {name:'createdName',index:'createdName', width:80},
                {name:'uploadStatus',index:'uploadStatus', width:80,formatter:function(val,rec,rowObject){
                    return i18n['contact.upload.field.UploadStatus.'+val];
                }},
                {name:'receivedNum',index:'receivedNum', width:100},
                {name:'loadNum',index:'loadNum', width:100},
                {name:'uploadMethod',index:'uploadMethod', width:100,formatter:function(value,rec,rowObject){
//                    PARTIAL("PARTIAL"),DELETE("DELETE"),WITH_RECORD_TYPE
                    if(value=="PARTIAL")return "Update";
                    if(value=="WITH_RECORD_TYPE")return "Replace";
                    if(value=="DELETE")return "Delete";
                }}
            ],
            sortname:'createdDate',
            sortorder:'desc',
            viewrecords:true,
            pager:"#uploads_gridPager",
            multiselect:true,
            multiselectWidth : 40,
            scrollOffset : 0,
            prmNames : {
                page:"pageNo", //
                totalrows:"totalrows" //
            },
            gridComplete:function(){
                $(".upload_jqgridEditRowBtn").click(function(event){
                    event.stopPropagation();
                    location=context+'/contacts/upload/'+$(this).attr("recordId");
                });
            }
        });
    };
})(EB_View)

