/**
 * Create User JavaScript.
 * User: tonyzhai
 * Date: 7/11/12
 * Time: 2:34 PM
 */
(function(view){
    view.user={

    };
    view.user.createOrUpdate = {};
    view.user.createOrUpdate.initPage={
        User:Backbone.Model.extend({
            id:this.id,
            urlRoot:"/users",
            initialize:function () {
//                this.bind("invalid",function(model,error){
//                    alert(error);
//                });
                if(this.id>0){
                    this.fetch();
                }
            }
//            defaults:{
//                title:"",
//                content:""
//            },
//            validate:function(attributes){
//                if(!attributes.title || attributes.title.length<1){
//                    return "Title must 1 character at least.";
//                }
//                if(!attributes.content || attributes.content.length<10){
//                    return "Title must 10 character at least.";
//                }
//            }
        }),

        FormView:Backbone.View.extend({
            el:$("#validation-form"),
            initialize:function () {
                _.bindAll(this, "render", "changed");
                this.model.bind('change', this.render);
                this.render();
            },
            template:_.template($("#baseInfoTemplate").html()),
            render:function () {
                $(this.el).html(this.template(this.model.toJSON()));
            },
            events:{
                'click #btn_save':"save",
                'click #btn_cancel':"cancel",
                "blur input":"changed"
            },
            save:function () {
                var that=this;
                this.model.save(this.model.toJSON(), {
                    success :function(){
                        that.list();
                    },
                    error: function(){
                        alert("Save failed.");
                    }});

            },
            cancel:function () {
                this.list();
            },
            list:function () {
                window.location.href = EB_Common.wrapperUrl("/users");
            },
            changed:function (e) {
                var target = e.currentTarget;
                var data = {};
                data[target.name] = target.value;
                this.model.set(data);
            }
        }),
        getInstance:function(id){
            var user;
            if(id){
                user=new EB_View.user.createOrUpdate.initPage.User({id:id});
            }else{
                user=new EB_View.user.createOrUpdate.initPage.User({id:null})
            }
            new EB_View.user.createOrUpdate.initPage.FormView({model:user});
        }
    }

})(EB_View)