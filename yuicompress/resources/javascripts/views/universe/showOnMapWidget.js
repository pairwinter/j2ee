(function(view){
    view.universe.showOnMapApp={
        ShowOnMapModel:{
            urlRoot:EB_Common.Ajax.wrapperUrl("/universe/gisLayerInformation"),
            defaults:{
                defaultZoomLevel:"",
                latlon_proj:new OpenLayers.Projection("EPSG:4326"),
                spherical_mercator_proj:new OpenLayers.Projection("EPSG:900913")
            },
            initialize:function(){

            },
            parse:function(data){
                var latlon_proj = new OpenLayers.Projection("EPSG:4326");
                var spherical_mercator_proj = new OpenLayers.Projection("EPSG:900913");
                var settings = {
                    defaultZoomLevel: "",
                    latlon_proj: latlon_proj,
                    spherical_mercator_proj: spherical_mercator_proj
                };
                settings = $.extend(settings, data);
                return settings;
            }
        },
        ShowOnMapView:{
            tagName:"div",
            initialize:function(){
                this.model.fetch({async:false});
                this.render();
            },
            render:function(){
                this.$el.html('<div id="showOnMapDiv_'+this.model.cid+'"></div>');
                this.setDialog();
            },
            open:function(searchShapes){
                this.$el.dialog("open");
                if(searchShapes){
                    this.model.set("searchShapes",searchShapes);
                    EB_View.universe.loadMapData(this.model.toJSON(), this.$el[0]);
                }
            },
            setDialog:function(){
                var that = this;
                this.$el.dialog({
                    autoOpen : false,
                    title : '',
                    width : 1000,
                    height : 600,
                    modal : true,
                    resizable : false,
                    open:function(){
                    },
                    buttons : {
//                        Ok : {
//                            click : function() {
//                                $(this).dialog("close");
//                            },
//                            'class' : 'orange',
//                            text : i18n['global.dialog.button.ok']
//                        },
                        Cancel : {
                            click : function() {
                                $(this).dialog("close");
                            },
                            'class' : 'gray',
                            text : 'Close'
                        }
                    },
                    close: function(event, ui) {
                        that.$el.empty();
                    }
                });
            }
        },
        getInstance:function(options){
            var Model = Backbone.Model.extend(this.ShowOnMapModel);
            var model = new Model();
            var View = Backbone.View.extend(this.ShowOnMapView);
            var view = new View({model:model});
            return view;
        }
    }
})(EB_View);