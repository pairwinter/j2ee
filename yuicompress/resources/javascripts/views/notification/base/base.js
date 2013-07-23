(function(view){
    view.notification = {
        uploader:null,
        app:{}
    };
    view.notification.uploader = function(_options){
        var defaults = {
            wavCheck :false
        };
        var options = this.options = $.extend({},_options||{});
        var me = this;
        options.container.delegate(".up_attachment_del_btn", "click", function(){
            var swfFileId = $(this).attr("swfFileId");
            $(this).parent().parent().remove();
            $("#regionLibrayDiv2").html("");
            $("#regionLibrayDiv2").hide();
            $("#div2HasValue").val("0")
            if($("#selectValue").val() == "2")  {
                $("#regionLibrarySelected").html("");
                $("#selectValue").val("0")
            }

            options.removeFile.call(this,swfFileId);
            if(me.uploader && swfFileId){
                me.uploader.cancelUpload(swfFileId);
                me.reduceTotalFileSize(swfFileId);
                me.updateUploadLimit();
            }
            me.reOrderUploadedItem();
        });
        this.deleteFile =function(){
            var swfFileId = options.container.attr("swfFileId");
            $(this).parent().parent().remove();
            options.removeFile.call(this,swfFileId);
            if(me.uploader && swfFileId){
                me.uploader.cancelUpload(swfFileId);
                me.reduceTotalFileSize(swfFileId);
                me.updateUploadLimit();
            }
            me.reOrderUploadedItem();
        },
        this.reduceTotalFileSize=function(swfFileId){
            var fileSize = this.uploader.customSettings.fileSizeMap[swfFileId];
            if(this.uploader.customSettings && this.uploader.customSettings.total_file_size ){
                this.uploader.customSettings.total_file_size -= fileSize;
            }
        }
        this.handlerMethods={
            swfupload_loaded:function(){
                me.loaded = true;
                me.updateUploadLimit();
                var existFiles = options.existFiles;
                if(existFiles && existFiles){
                    for(var i=0; i< existFiles.length; i++){
                        this.customSettings.total_file_size += existFiles[i].size;
                        this.customSettings.fileSizeMap[existFiles[i].swfFileId] = existFiles[i].size;
                    }
                }
            },
            fileDialogStart:function(){
                options.fileDialogStart && options.fileDialogStart.call(this);
            },
            fileQueued : function(file) {
                if(this.customSettings.max_total_file_size){
                    if((this.customSettings.total_file_size+file.size)> (this.customSettings.max_total_file_size*1024*1024)){
                        EB_Common.dialog.alert($.format(i18n['global.file.attaching.maxsize.error.message'], file.name, this.customSettings.max_total_file_size), i18n['global.file.attaching.title']);
                        this.cancelUpload(file.id);
                        return false;
                    }
                }

                options.container.show().parent().show();
                file.index=options.container.children().length+1;
                file.fileName = file.name;
                file.progressId = "progress_"+file.id;
                file.hideProcess = false;
                file.swfFileId = file.id;
                options.container.append(options.uploadItemTemplate.render([file]));
                this.startUpload(file.id);
            },

            fileQueuedError : function(file, errorCode, message) {
                try {
                    switch (errorCode) {
                        case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                            var texts = [file.name,this.settings.file_size_limit];
                            var content = i18n['global.file.attaching.message'].replace(/\{(\d+)\}/g,function(match,index){
                                return  texts[index];
                            });
                            EB_Common.dialog.alert(content,i18n['global.file.attaching.title']);
                            break;
                        case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:

                            if(options.queue_limit_exceeded){
                                EB_Common.dialog.alert(options.queue_limit_exceeded);
                            }else{
                                EB_Common.dialog.alert(i18n["global.file.exceed.max"] + this.settings.file_upload_limit);
                            }
                            break;
                        case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                            EB_Common.dialog.alert(file.name + "&nbsp;"+i18n["global.file.invalid"]
                                + this.settings.file_types);
                            break;
                        case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                            EB_Common.dialog.alert(file.name +"&nbsp;"+ i18n["global.file.empty"]);
                            break;
                        default:
                            EB_Common.dialog.alert(i18n["global.file.theFile"] + file.name +"&nbsp;"+ i18n["global.file.not.allowed"]);
                    }
                } catch (e) {
                    EB_Common.dialog.alert(i18n["global.file.theFile"] + file + i18n["global.file.allowed"]+ e);
                }
            },
            fileDialogComplete : function(numFilesSelected, numFilesQueued) {
                EB_Common.logger.log("numFilesSelected: " + numFilesSelected + ", numFilesQueued: " + numFilesQueued);
                if(numFilesQueued>0){
                    options.filesStartUpload && options.filesStartUpload.call(this,numFilesQueued);
                }
            },
            uploadStart : function(file) {


//                EB_Common.logger.log("file id: " + file.id + ", file name: " + file.name);

            },
            uploadProgress : function(file, bytesLoaded, bytesTotal) {
                try {
                    var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
                    EB_Common.logger.log("percent: " + percent);
                    $("#progress_" + file.id).width(percent+"%");
                } catch (ex) {
                    EB_Common.logger.log(ex);
                }
            },
            uploadSuccess : function(file, serverData) {
                try {

                    var fileDiv = $("#progress_" + file.id).parent();
                    file.container = fileDiv;
                    var ret = $.parseJSON(serverData);
                    if(options.wavCheck){
                        if (ret && ret.success) {
                            options.uploadSuccess.call(this,file,ret);
                        } else {
                            options.uploadError.call(this,file,ret);
                            me.updateUploadLimit();
                            me.reOrderUploadedItem();
                        }
                    }else{
                        options.uploadSuccess.call(this,file,ret);
                    }
                    EB_Common.logger.log("serverData: " + serverData);
                } catch (ex) {
                    EB_Common.logger.log(ex);
                }
            },
            uploadError : function(file, errorCode, message) {
                try {
                    switch (errorCode) {
                        case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                            EB_Common.logger.log("Error Code: HTTP Error, File name: " + file.name + ", Message: "
                                + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                            EB_Common.logger.log("Error Code: Upload Failed, File name: " + file.name + ", File size: "
                                + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                            EB_Common.logger.log("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                            EB_Common.logger.log("Error Code: Security Error, File name: " + file.name + ", Message: "
                                + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                            EB_Common.logger.log("Error Code: Upload Limit Exceeded, File name: " + file.name
                                + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                            EB_Common.logger.log("Error Code: File Validation Failed, File name: " + file.name
                                + ", File size: " + file.size + ", Message: " + message);
                            break;
                        case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                            options.uploadCancel && options.uploadCancel.call(this,file);
                            break;
                        case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                            break;
                        default:
                            EB_Common.logger.log("Error Code: " + errorCode + ", File name: " + file.name + ", File size: "
                                + file.size + ", Message: " + message);
                            break;
                    }
                } catch (ex) {
                    EB_Common.logger.log(ex);
                }
            },
            uploadComplete : function(file) {
                var status = this.getStats();
                if(status && status.in_progress == 0 ){
                    this.customSettings.total_file_size += file.size;
                    this.customSettings.fileSizeMap[file.id]=file.size;
                    options.allUploadComplete && options.allUploadComplete.call(this,file);
                }
            }
        },
        this.updateUploadLimit=function(){
            var existFileCount =this.options.container.children().length;
            if(!this.uploader) return 0;
            var stats = this.uploader.getStats();
            if(!stats){
                return 0;
            }
            stats.successful_uploads=existFileCount-stats.files_queued;
            this.uploader.setStats(stats);
            if(existFileCount == 0){
                this.options.container.parent().hide();
            } else {
                this.options.container.parent().show();
            }
            return existFileCount;
        },
        this.reOrderUploadedItem=function(){
            options.container.children().each(function(i){
                $(this).children().eq(0).children().eq(0).text((i+1)+":");
            });
        };
        if(options.wavCheck === undefined){
            options.wavCheck = false;
        }
        this.uploader = new SWFUpload({
            flash_url : EB_Common.Ajax.wrapperUrl("/statics/swf/swfupload.swf"),
            upload_url : EB_Common.Ajax.wrapperUrl(options.uploadUrl + ";jsessionid=" + options.sessionId),
            post_params : {
                "JSESSIONID" : options.sessionId,
                "wavCheck" : options.wavCheck
            },
            file_size_limit : options.fileLimit,
            file_types : options.fileTypes,
            file_types_description : "All Files",
            file_upload_limit : options.maxFilesCount,
            file_queue_limit : options.maxFilesCount,

            // Button settings
            button_image_url : EB_Common.Ajax.wrapperUrl("/statics/stylesheets/common/img/uploader_bg.png"),
            button_width : options.button_width || 150,
            button_height : 18,
            button_placeholder_id : options.buttonId,
            button_text : '<a class="upFont" href="javascript:void(0)">' + options.btnText + '</a>',
            button_text_style : ".upFont {font-size: 12; font-family:arial; text-align:left;color: #1A77C7;text-decoration: underline; }",
            button_text_top_padding : 0,
            button_text_bottom_padding : 0,
            button_text_left_padding : 0,
            button_text_right_padding : 0,
            button_cursor : SWFUpload.CURSOR.HAND,
            button_window_mode : SWFUpload.WINDOW_MODE.OPAQUE,
            button_window_mode : SWFUpload.WINDOW_MODE.TRANSPARENT,   /* transparant*/

            // The event handler functions are defined in handlers.js
            swfupload_loaded_handler : this.handlerMethods.swfupload_loaded,
            file_dialog_start_handler:this.handlerMethods.fileDialogStart,
            file_queued_handler : this.handlerMethods.fileQueued,
            file_queue_error_handler : this.handlerMethods.fileQueuedError,
            file_dialog_complete_handler : this.handlerMethods.fileDialogComplete,
            upload_start_handler : this.handlerMethods.uploadStart,
            upload_progress_handler : this.handlerMethods.uploadProgress,
            upload_error_handler : this.handlerMethods.uploadError,
            upload_success_handler : this.handlerMethods.uploadSuccess,
            upload_complete_handler : this.handlerMethods.uploadComplete,
            custom_settings : {
                fileSizeMap:{},
                total_file_size : 0,
                max_total_file_size:options.max_total_file_size||0
            }

        });
    };
})(EB_View);