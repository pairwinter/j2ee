(function(common){
    common.Backbone = {};

	common.Backbone.View = Backbone.View.extend({
        $:function(selector){
            var regex = /(#[\w\-]+)/;
            selector = selector.replace(regex, "$1"+this.cid);
            return Backbone.View.prototype.$.call(this,selector);
        },
        reset$id:function(id){
            return id + this.cid;
        },
        dealEvents:function(events,cid){
            var regex = /(#[\w\-]+)/;
            var newEvents = {};
            if(events){
                for(var e in events){
                    var ev = events[e];
                    e = e.replace(regex, "$1"+this.cid);
                    newEvents[e] = ev;
                }
            }
            return newEvents;
        },
        getIdSuffixModelJSON:function(){
            var model = this.model.toJSON();
            model.idSuffix = this.cid;
            return [model];
        },
        getIdSuffixCollectionJSON:function(){
            var cid = this.cid;
            var models = this.collection.models.toJSON||[];
            $.each(models,function(i,model){
                model.idSuffix = cid;
            });
            return models;
        }
    });
    common.Backbone.View.extend=function(){
        arguments[0] = $.extend(true, {}, arguments[0]);
        return Backbone.View.extend.apply(this,arguments);
    }
})(EB_Common);