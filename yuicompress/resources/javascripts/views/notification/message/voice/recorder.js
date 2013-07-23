(function(view) {
    view.notification.app.RecorderApp={
        RecorderModel:{
            "defaults":function(){
                return {
                    load:false,
                    saveUrl:EB_Common.Ajax.wrapperUrl("/voices/write")
                };
            }
        },
        RecorderAppView:{
            jDom:{},
            template:{},
            uploader:{},
            initialize:function () {
                this.recorder = EB_Common.getRecorderInstance();
                this.recorder.initialize({
                    swfSrc: EB_Common.Ajax.wrapperUrl("/statics/javascripts/views/notification/message/voice/recorder.swf")
                });
                this.render();
            },
            dealInitData:function(){  //add by daniel.
                this.model.set({"webRecorder_validate":null});
                this.model.set({"landLine_validate":null});
                this.model.set({"webUploader_validate":null});
            },
            render:function(){
                this.$el.html('<div><a href="javascript:record()" id="record'+this.cid+'">Record</a><a href="javascript:stop()" id="stop'+this.cid+'">Stop</a><a href="javascript:upload()" id="upload'+this.cid+'">Upload to SoundCloud</a></div>');
                return this;
            },
            timecode:function(ms) {
                var hms = {
                    h: Math.floor(ms/(60*60*1000)),
                    m: Math.floor((ms/60000) % 60),
                    s: Math.floor((ms/1000) % 60)
                };
                var tc = []; // Timecode array to be joined with '.'
                if (hms.h > 0) {
                    tc.push(hms.h);
                }
                tc.push((hms.m < 10 && hms.h > 0 ? "0" + hms.m : hms.m));
                tc.push((hms.s < 10  ? "0" + hms.s : hms.s));
                return tc.join(':');
            },
            events:function(){
                var events = {
                    "click #recorder":"recordingStart",
                    "click #stop":"recordingStop",
                    "click #upload":"upload"
                };
                if(this.options.isEdit===false){
                    events={};
                }
                return this.dealEvents(events,this.cid);
            },
            recordingStart:function(){
                var view = this;
                this.recorder.record({
                    start: function(){
                        //alert("recording starts now. press stop when youre done. and then play or upload if you want.");
                    },
                    progress: function(milliseconds){
                        document.getElementById("time").innerHTML = view.timecode(milliseconds);
                    }
                });
            },
            recordingStop:function(){
                this.recorder.stop();
            },
            upload:function(){
                this.recorder.upload({
                    url:EB_Common.Ajax.wrapperUrl("/voices/write"),
                    audioParam: "your_file",
                    success: function(){
                        alert("your file was uploaded!");
                    }
                });
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.RecorderModel);
            var View = EB_Common.Backbone.View.extend(this.RecorderAppView);
            return new View({
                el:options.container,
                model:new Model()
            });
        }
    };
})(EB_View);



