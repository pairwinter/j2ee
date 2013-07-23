(function(view){
    view.downloadApp = {
        ConfirmView:{
            initialize:function(){
//                $.templates({
//                    downloadConfirmTmpl:$("#downloadConfirmTmpl").html()
//                });
                this.container = this.options.container;
//                this.template = $.render.downloadConfirmTmpl;
                this.downloadAsyncUrl = this.options.downloadAsyncUrl;
                this.downloadSyncUrl = this.options.downloadSyncUrl;
                this.downloadCheckUrl = this.options.downloadCheckUrl;
                this.downloadCheckPostData = this.options.downloadCheckPostData;
                this.downloadForm = this.options.downloadForm;
                this.originalDownloadFunc = this.options.originalDownloadFunc;

            },
            events:{
                "click .downloadMethodRadio":"changeDownloadMedthod"
            },
            render:function(){
//                this.$el.html(this.template(datas));
                return this;
            },
            changeDownloadMedthod:function(e){
                this.model.set("sendEmail",$(e.currentTarget).val());
            },
            execute:function(postData){
                postData.version = new Date();
                var that = this;
                var settings = {
                    type:"post",
                    url:this.downloadCheckUrl,
                    data:postData,
                    success:function(data){
                        that.dealSuccess(data);
                    },
                    dataType:"json"
                };
                $.ajax(settings);
            },
            dealSuccess:function(response){
                if(response.success){
                    if($.isFunction(this.originalDownloadFunc)){
                        this.originalDownloadFunc.call(this);
                    }else{
                        this.downloadForm.attr("action",this.downloadSyncUrl);
                        this.downloadForm.ajaxFormUnbind().submit();
                    }
                }else{
                    var that = this;
                    this.download_options = {
                        url:this.downloadAsyncUrl,
                        type:'post',
                        data:{version:new Date()},
                        success: function(data) {
                            if(data.success){
                                EB_Common.dialog.alert(i18n['download.file.email.tip']);
                            }
                            that.remove();
                        },
                        error:function(){
                            that.remove();
                        }
                    };
                    this.downloadForm.ajaxForm(this.download_options).submit();
                }
            }
        },
        getInstance:function(options){
            var settings = {
                container:options.container,
                model:new Backbone.Model(),
                downloadAsyncUrl:options.downloadAsyncUrl,
                downloadSyncUrl:options.downloadSyncUrl,
                downloadCheckUrl:options.downloadCheckUrl,
                downloadCheckPostData:options.downloadCheckPostData,
                downloadForm:options.downloadForm,
                originalDownloadFunc:options.originalDownloadFunc
            }
            var View = Backbone.View.extend(this.ConfirmView);
            var view = new View(settings);
            return view;
        }
    }
})(EB_View)