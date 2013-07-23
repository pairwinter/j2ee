(function(view){
    view.MenuApp={
        MenuModel:{
            obj:{}
        },
        MenuModelView:{
            initialize:function(){
                $.templates({
                    incidentCreateAppCategorysTemplate:$("#incidentCreateAppCategorysTemplate").html()
                });
                this.incidentCreateAppCategorysTemplate = $.render.incidentCreateAppCategorysTemplate;
            },
            render:function(){

            }
        },
        MenuAppView:{
            template:{},
            initialize:function(){
                this.collection.on("add",this.collectionAddMenu,this);
            },
            collectionAddMenu:function(menu){
                this.$el.append();
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var menus = options.menu
            var collection=new Backbone.Collection;
            var View = EB_Common.Backbone.View.extend(this.MenuAppView);
            var view = new View({el:options.container,collection:collection});
            $.each(menus,function(menu){
                collection.add(menu);
            });
        }
    };
})(EB_View)