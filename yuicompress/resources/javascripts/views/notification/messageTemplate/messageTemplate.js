(function(view) {
    view.notification = view.notification || {};
    view.notification.app = view.notification.app || {};
    view.notification.app.SimpleMessageApp={
        SimpleMessageModel:{
            "defaults":{
                load:false,
                title:"",
                textMessage:""
            },
            initialize:function () {
                if(arguments && arguments.length>1 && arguments[1].url)
                    this.urlRoot=arguments[1].url;
            },
            parse:function(response){
                var messageTemplate={load:true};
                $.extend(messageTemplate,response.msgTemplate);
                var categories = response.categories || [];
                if(response.msgTemplate && response.msgTemplate.category){
                    $.each(categories,function(i,cateogry){
                        cateogry.selected = cateogry.name== response.msgTemplate.category.name;
                    })
                };
                messageTemplate.categories = categories;
                //hand audio file
                messageTemplate.voiceData = {};
                if(messageTemplate.audio){
                    var file = $.extend(true,{},messageTemplate.audio);
                    file.index = 1;
                    file.hideProgress = true;
                    file.swfFileId=1;
                    file.fileName = file.name;
                    messageTemplate.audioFiles = [file];
                    messageTemplate.voiceData = {audioFiles:messageTemplate.audioFiles,audioKey:messageTemplate.audio.audioKey,voiceSource:messageTemplate.voiceSource};
                }
                return messageTemplate;
            }
        },
        SimpleMessageAppView:{
            jDom:{},
            template:{},
            subApps:{},
            initialize:function () {
                $.templates({
                    simpleMessageTemplate: $("#simpleMessageTemplate").html()
                });
                this.template.simpleMessageTemplate = $.render.simpleMessageTemplate;
                this.model.on("change:load",this.render,this);
                if(this.model.urlRoot){
                    this.model.fetch();
                }else{
                    this.render();
                }
            },
            render:function(){
                this.$el.html(this.template.simpleMessageTemplate(this.getIdSuffixModelJSON()));

                var view = this;
                EB_Common.validation.validate(this.$("#messageTemplateForm"),{submitHandler:function(form){
                    view.save(form);
                }});
                this.jDom.form = this.$("#messageTemplateForm");
                this.jDom.voiceContainer = this.$("#voiceContainer");
                this.jDom.messageTitle = this.$("#messageTitle");
                this.jDom.textMessage = this.$("#textMessage");
                this.jDom.tipTextMessage = this.$("#tipTextMessage");
                this.jDom.typeInDom = this.$("#messageTitle");
                var messageApp = this;
//                setInterval(function(){
//                    messageApp._countTextMessage();
//                },100);
                this.loadVoice();
                this.jDom.categorySelect = this.$("#category");
                //set the datepicker;
                this.jDom.categorySelect.combobox({
                    comboboxWidth : true
                });
                this._countTextMessage(true);
                return this;
            },
            save:function(form){
                this.options.saveCallBack.call(this,form);
            },
            loadVoice:function(){
                var that = this;
                this.subApps.voiceApp = EB_View.notification.app.VoiceApp.getInstance({
                    sessionId: this.options.sessionId,
                    modelData:this.model.get("voiceData"),
                    container:this.jDom.voiceContainer,
                    isView:true,
                    isEdit:true,
                    changeVoiceTypeCallback:function(voiceType){
                        that.ignoreTextmessage(voiceType==="None"?false:true);
                    }
                });
            },
            ignoreTextmessage:function(isIgnored){
                if(isIgnored){
                    this.$("#textMessage").removeClass("required").valid();
                }else{
                    this.$("#textMessage").addClass("required");
                }
            },
            _countTextMessage:function(execute){
                var max1 = 2500,max2 = 120;
                if(!(this.jDom.textMessage.length || this.jDom.messageTitle.length)) return;
                var textLen = this.jDom.textMessage.val().countLength(),titleLen = this.jDom.messageTitle.val().countLength();

                if(this.jDom.typeInDom || execute){
                    var dom = this.jDom.typeInDom;
                    if(execute){
                        dom = this.jDom.messageTitle;
                    }
                    var val = dom.val();
                    var len = titleLen+textLen;
                    var last = 0;
                    if(dom.attr("id").indexOf("messageTitle")>-1){
                        last = max1-textLen;
                        if(titleLen>last){
                            dom.val(val.substring2(0,last));
                        }
                    }else if(dom.attr("id").indexOf("textMessage")>-1){
                        last = max1-titleLen;
                        if(textLen>last){
                            dom.val(val.substring2(0,last));
                        }

                    }
                    //dom.scrollTop(100000);
                    max1 = max1 - len;
                    max2 = max2 - (len % 120);
                    if(max1<0||max2<0)return;
                    var count2 = parseInt(len / 120) + 1;
                    this.jDom.tipTextMessage.html($.validator.format(i18n['notification.text.smsmessage'], max1.toString(), max2, count2));
                }
            },
            events:function(){
                var events = {
                    "focus .message-content":"eventFocusMessageContent",
                    "keyup #messageTitle":"eventChangeMessageTitle",
                    "keyup #textMessage":"eventChangeTextMessage",
                    "blur #textMessage":"eventChangeTextMessage"
                }
                return this.dealEvents(events,this.cid);
            },
            eventFocusMessageContent:function(e){
                var j = $(e.target);
                this.jDom.typeInDom = j;
            },
            eventChangeMessageTitle:function(e){
                this.model.set({title:$.trim(e.target.value)},{silent:true});
                this._countTextMessage();
            },
            eventChangeTextMessage:function(e){
                this.model.set({textMessage:e.target.value},{silent:true});
                this._countTextMessage();
            },
            getData:function(){
                var model = this.model.toJSON();
                model.load = false;
                return $.extend(true,{},model);
            },
            getJsonData:function(parentObj){
                var data = this.getData();
                if(data.id){
                    parentObj.id = data.id;
                }
                this.subApps.voiceApp.getJsonData(parentObj);
                parentObj.title = data.title;
                parentObj.textMessage = data.textMessage;
                var categoryName = $.trim(this.$("#categoryName").val());
                if(categoryName){
                    parentObj.category={name:categoryName}
                }
                return parentObj;
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.SimpleMessageModel);
            var View = EB_Common.Backbone.View.extend(this.SimpleMessageAppView);
            var model = new Model(options.modelData);
            if(options.url){
                model = new Model(null,{url:options.url});
            }
            return new View({el:options.container,model:model,saveCallBack:options.saveCallBack,sessionId:options.sessionId,voiceFlashObject:options.voiceFlashObject});
        }
    };
})(EB_View);