(function(view){
    view.universe= view.universe || {};
    view.universe.loadMapData=function(customSetting, container){
        var modelData = {scheme:"https"};
        OpenLayers.Layer.Bing.processMetadata = function(metadata) {
            if(metadata){
                if(metadata.brandLogoUri) metadata.brandLogoUri = metadata.brandLogoUri.replace(/http:/,modelData.scheme+":");
                if(metadata.resourceSets = metadata.resourceSets || []){
                    for(var i=0;i<metadata.resourceSets.length;i++){
                        var resourceSet = metadata.resourceSets[i] || {};
                        var resources = resourceSet.resources || [];
                        for(var j=0;j<resources.length;j++){
                            var resource = resources[j];
                            if(resource.imageUrl)
                                resource.imageUrl = resource.imageUrl.replace(/http:/,modelData.scheme+":");
                        }
                    }
                }
            }
            this.metadata = metadata;
            this.initLayer();
            var script = document.getElementById(this._callbackId);
            script.parentNode.removeChild(script);
            window[this._callbackId] = undefined; // cannot delete from window in IE
            delete this._callbackId;
        };
        OpenLayers.Util.extend(OpenLayers.Layer.Bing.prototype,{
            loadMetadata: function() {
                this._callbackId = "_callback_" + this.id.replace(/\./g, "_");
                // link the processMetadata method to the global scope and bind it
                // to this instance
                window[this._callbackId] = OpenLayers.Function.bind(
                    OpenLayers.Layer.Bing.processMetadata, this
                );
                var params = OpenLayers.Util.applyDefaults({
                    key: this.key,
                    jsonp: this._callbackId,
                    include: "ImageryProviders"
                }, this.metadataParams);
                var url = modelData.scheme+"://dev.virtualearth.net/REST/v1/Imagery/Metadata/" +
                    this.type + "?" + OpenLayers.Util.getParameterString(params);
                var script = document.createElement("script");
                script.type = "text/javascript";
                script.src = url;
                script.id = this._callbackId;
                document.getElementsByTagName("head")[0].appendChild(script);
            }
        });

        var options ={defaultLayer:null,
                   polygons:null };
        var data = $.extend(options,customSetting);
        var layers = [];
        var defaultLayer = null;
        var layer_obj = data.defaultLayer;
        var allLayers = data.allLayers;
        if(layer_obj.type == ("GMAP") && (!window.google)|| (!window.google.maps)||(!window.google.maps.MapTypeId)){
            if(allLayers && allLayers.length){
                for(var i=0; i< allLayers.length; i++){
                    if(allLayers[i].type=="BING"){
                        layer_obj = allLayers[i];
                        break;
                    }
                }
            }
        }
        if (layer_obj.type == ("GMAP")) {
            if (layer_obj.provider && layer_obj.provider.parameters && layer_obj.provider.parameters.type) {
                var type = null;
                switch (layer_obj.provider.parameters.type) {
                    case "street" : type = window.google.maps.MapTypeId.ROADMAP;break;
                    case "terrain" :type = window.google.maps.MapTypeId.TERRAIN; break;
                    case "hybrid" :type = window.google.maps.MapTypeId.HYBRID;break;
                    case "satellite" :type = window.google.maps.MapTypeId.SATELLITE;
                }
                if (type) {
                    defaultLayer = new OpenLayers.Layer.Google(layer_obj.description, {
                        'type': type, 'isBaseLayer': layer_obj.baseLayer, 'buffer': 1, 'visibility': layer_obj.visible, 'animationEnabled' : false
                    });
                }
            }
        } else if (layer_obj.type == "OSM") {
            defaultLayer = new OpenLayers.Layer.OSM(null, null, {'visibility': layer_obj.visible});
        } else if (layer_obj.type == "ESRI") {
            var center = layer_obj.bounds.center;
            if (layer_obj.provider && layer_obj.provider.parameters && layer_obj.provider.parameters.url) {
                defaultLayer =new OpenLayers.Layer.XYZ(layer_obj.description, layer_obj.provider.parameters.url,{'sphericalMercator':true, 'buffer': 1, 'isBaseLayer': layer_obj.baseLayer, 'visibility': layer_obj.visible});
            }
        } else if (layer_obj.type == "BING") {
            if (layer_obj.provider && layer_obj.provider.parameters && layer_obj.provider.parameters.key) {
                defaultLayer = new OpenLayers.Layer.Bing({'isBaseLayer': layer_obj.baseLayer, 'key': layer_obj.provider.parameters.key, 'visibility': layer_obj.visible});
            }
        } else if (layer_obj.type === "XYZ") {
            defaultLayer = new OpenLayers.Layer.XYZ(layer_obj.description, layer_obj.url,{'sphericalMercator':true, 'buffer': 1, 'isBaseLayer': layer_obj.baseLayer, 'visibility': layer_obj.visible});
            defaultLayer.serverResolutions = default_server_resolutions;
            if (layer_obj.provider.name === 'mapnik') {
                // If this layer contains a UTF layer, make sure it gets added as an overlay
                if (layer_obj.utflayer) {
                    var utf_url = layer_obj.utflayer.url;
                    var utf_layer = new OpenLayers.Layer.UTFGrid({
                        url: utf_url,
                        utfgridResolution: 4,
                        displayInLayerSwitcher: false,
                        useJSONP: true
                    });
                    utf_layer.serverResolutions = default_server_resolutions;
                    layers.push(utf_layer);
                    utf_added = true;
                }
            }
        }
        var eb_zoom_level_to_real = {
            0: 3,
            1: 6,
            2: 9,
            3: 12,
            4: 15
        };
        var mapOption={
            div: container?container:"map",
            theme:"",
            allOverlays: false,
            controls:[],
            layers: layers,
            numZoomLevels:19,
//            maxExtent:'auto',
            maxResolution: "auto",
            minResolution: "auto",
//            zoom: eb_zoom_level_to_real[data.defaultZoomLevel+""],
            projection: data.spherical_mercator_proj
        };
        var map = new OpenLayers.Map(mapOption);
        layers.push(defaultLayer);
        var selectStyle = new OpenLayers.Style({
            fillColor:"blue",fillOpacity: 0.3
        });
        var colors = ["#ee9900", "#4b62bf"];
        var context = {
            getColor: function(feature) {
                if(feature.isInclude)
                    return colors[0];
                else
                    return colors[1];
            }
        };
        var template = {
            fillColor: "${getColor}",// using context.getColor(feature)
            fillOpacity: 0.3,
            pointRadius:3,
            strokeWidth: 1,
            strokeColor:"#ee9900"
        };
        var style = new OpenLayers.Style(template, {context: context});
//        var polygonStyleOptions = new OpenLayers.StyleMap({"Point": {pointRadius: 5},'select': selectStyle});
        var polygonsLayer = new OpenLayers.Layer.Vector("PolygonsLayer",{styleMap:new OpenLayers.StyleMap(style)});
        layers.push(polygonsLayer);
        map.addLayers(layers);
        map.setBaseLayer(defaultLayer);
        map.addControls([new OpenLayers.Control.Navigation(),new OpenLayers.Control.Zoom()]);
        map.features = [];
        var max_x;
        var max_y;
        var min_x;
        var min_y;
        if(!data.searchShapes)
            return;
        for (var i=0; i<data.searchShapes.length; i++) {
            var include = data.searchShapes[i].include;
            var shape = data.searchShapes[i].shape;
            var points = shape.points;
            var shape_points=[];

            for (var j=0; j<points.length; j++) {
                var point = new OpenLayers.Geometry.Point(points[j].x, points[j].y);
                if(!max_x || max_x<points[j].x )max_x= points[j].x;
                if(!max_y || max_y<points[j].y )max_y= points[j].y;
                if(!min_x || min_x>points[j].x )min_x= points[j].x;
                if(!min_y || min_y>points[j].y )min_y= points[j].y;

                point.transform(data.latlon_proj, map.getProjectionObject());
                shape_points.push(point);
            }
            var linear_ring = new OpenLayers.Geometry.LinearRing(shape_points);
            var polygon = new OpenLayers.Geometry.Polygon([linear_ring]);
            var polygon_feature = new OpenLayers.Feature.Vector(polygon);
            polygon_feature.isInclude = include;
            map.features.push(polygon_feature);
        }
        polygonsLayer.addFeatures(map.features);
        map.zoomToExtent(new OpenLayers.Bounds(min_x,min_y,max_x,max_y).transform(data.latlon_proj, map.projection));
    };
})(EB_View);