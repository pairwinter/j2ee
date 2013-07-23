(function(view){
    view.role={app:{}};

    view.role.app.RoleApp={
        RoleAppModel:{
            defaults:function(){
                return {
                    name:"",
                    identity:"",
                    features:"",
                    modules:""
                }
            },
            initialize:function(){
                if(arguments && arguments.length>1 && arguments[1].url){
                    this.urlRoot = url;
                }
            },
            parse:function(data){


                return data;
            }
        },
        RoleAppView:{
            template:{},
            initialize:function(){
                $.templates({
                    roleCreateUpdateTemplate: $("#roleCreateUpdateTemplate").html()
                });
                this.template.roleCreateUpdateTemplate = $.render.roleCreateUpdateTemplate;
                this.model.on("change:name",this.modelChangeName,this);

                if(this.model.urlRoot){
                    this.model.fetch();
                }else{
                    this.render();
                }
            },
            render:function(){
                this.$el.html(this.template.roleCreateUpdateTemplate(this.getIdSuffixModelJSON()));
                var view = this;
                EB_Common.validation.validate(this.$("#validationForm"),{
                    submitHandler:function(form){
                        view.submit();
                    }
                })
            },
            modelChangeName:function(){

            },
            modelChangeUri:function(){

            },
            events:function(){
                var events = {
                    "change input[name=name]":"eventChangeName",
                    "change input[name=uri]":"eventChangeUri",
                    "click #btn_save":"save",
                    "click #btn_cancel":"cancel"
                }
                return this.dealEvents(events,this.cid);
            },
            eventChangeName:function(e){
                this.model.set({"name": e.target.value},{silent:true});
            },
            eventChangeUri:function(e){
                this.model.set({"uri": e.target.value},{silent:true});
            },
            save:function(e){
                this.$("#validationForm").submit();
            },
            cancel:function(e){
                this.$("#validationForm").submit();
            },
            submit:function(){
                var data = this.model.toJSON();
                EB_Common.Ajax.post("/roles/saveOrUpdate",data,function(data){
                    alert(data);
                },"json");
            }

        },
        getInstance:function(options){
            var options = $.extend(true,{},options);
            var Model = Backbone.Model.extend(this.roleAppModel);
            var model = null;
            if(options.identity){
                model = new Model(null,{identity:options.identity});
            }else{
                if(!options.model){
                    model = new Model();
                }else{
                    model = options.model;
                }
            }
            var mode = new Model(null,{})
            var View = EB_Common.Backbone.View.extend(this.roleAppView);
            var view = new View({
                el:options.container,
                model:model
            })

        }

    }

})(EB_View)
