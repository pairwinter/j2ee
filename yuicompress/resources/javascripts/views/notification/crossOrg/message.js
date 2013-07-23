(function(view){
    view.crossOrgNotification={};
    view.crossOrgNotification.message={};
    view.crossOrgNotification.message.formApp={
        FormView:{
            events:{
                "click #btnsave":"clickSaveBtn",
                "click #cancel":"clickCancelBtn",
                "keydown #textMessage":"countTextMessage"
            },
            initialize:function(){
                EB_Common.validation.validate("form0");
            },
            render:function(){

            },
            clickSaveBtn:function(e){
                this.$("#form0").submit();
            },
            clickCancelBtn:function(e){
                window.location=EB_Common.Ajax.wrapperUrl("/crossOrgNotifications#ui-tabs-3");
            },
            countTextMessage:function() {
                var max1 = 2500;
                var max2 = 120;
                var textMessage = $("#textMessage");
                var title = $("#messageTitle");
                if(!(textMessage.length && title.length)) return;
                var textLen = textMessage.val().length;
                var titleLen = title.val().length;
                var len = textLen + titleLen;
                if (textLen > max1 - titleLen) {
                    textMessage.val(textMessage.val().substring(0, max1 - titleLen));
                    textMessage.scrollTop(100000);
                    return;
                }
                max1 = max1 - len;
                max2 = max2 - (len % 120);
                var count2 = parseInt(len / 120) + 1;
                $("#tipTextMessage").html($.validator.format(i18n['notification.text.smsmessage'], max1.toString(), max2, count2));
            }
        },
        getInstance:function(options){
            var View = Backbone.View.extend(this.FormView);
            var settings = {
                el:options.el
            }
            var view = new View(settings);
            return view;
        }
    }
})(EB_View)