(function(view){
    view.universe = view.universe || {};
    view.universe.openlayers={
        controls:{},
        instance:{
            "everbridgeSearchContact":null,
            "everbridgeSelectedContacts":null,
            "everbridgeRegionLibrary":null,
            "everbridgeExcludeContacts":null
        }
    };
    view.universe.openlayers.tool={
        AutoSizeAnchoredMaxSize : OpenLayers.Class(OpenLayers.Popup.Anchored, {'autoSize': true,'minSize': new OpenLayers.Size(100,100)}),
        AutoSizeFramedCloudMaxSize : OpenLayers.Class(OpenLayers.Popup.FramedCloud, {'autoSize': true,'minSize': new OpenLayers.Size(100,100),'maxSize': new OpenLayers.Size(500,300)}),
        WidgetMakerFramedCloud : OpenLayers.Class(OpenLayers.Popup.FramedCloud, {'autoSize': true,'minSize': new OpenLayers.Size(200,120)}),
        buildXYZLayers:function(layer_obj){
            var server_resolutions = [156543.03390625,78271.516953125, 39135.7584765625, 19567.87923828125,9783.939619140625, 4891.9698095703125,2445.9849047851562,1222.9924523925781, 611.4962261962891,305.74811309814453,152.87405654907226,76.43702827453613,38.218514137268066,19.109257068634033,9.554628534317017,4.777314267158508,2.388657133579254,1.194328566789627,0.5971642833948135];
            var layers = [];
            if(layer_obj.url){
                if(layer_obj.url.indexOf("?")>-1){
                    layer_obj.url=layer_obj.url+"&universer="+Math.random();
                }else{
                    layer_obj.url=layer_obj.url+"?universer="+Math.random();
                }
            }
            var xyzLayer = new OpenLayers.Layer.XYZ(layer_obj.description, layer_obj.url,{'sphericalMercator':true, 'buffer': 1, 'isBaseLayer': false, 'visibility': layer_obj.visible});
            xyzLayer.serverResolutions = server_resolutions;
            if (layer_obj.utfLayerUrl) {
                var utf_url = layer_obj.utfLayerUrl;
                var utf_layer = new OpenLayers.Layer.UTFGrid({
                    visibility:layer_obj.visible,
                    url: utf_url,
                    utfgridResolution: 4,
                    displayInLayerSwitcher: false,
                    useJSONP: true
                });
                utf_layer.serverResolutions = server_resolutions;
                xyzLayer.events.register('visibilitychanged', xyzLayer, function (e) {
                    if (xyzLayer.visibility) {
                        utf_layer.setVisibility(true);
                    } else {
                        utf_layer.setVisibility(false);
                    }
                });
                layer_obj.utfLayerId = utf_layer.id;
                layers.push(utf_layer);
            }
            layer_obj.xyzLayerId = xyzLayer.id;
            layers.push(xyzLayer);
            return layers;
        },
        zoomToExtent:function(layer,map,polygons){
            if(layer){
                map = layer.map;
                polygons = [];
                var features = layer.features;
                var bounds = null;
                var isExistPolygon = false;
                for(var i=0;i<features.length;i++){
                    var feature = features[i];
                    if(feature.geometry.CLASS_NAME=='OpenLayers.Geometry.Point'){
                        continue;
                    }
                    var bound = features[i].geometry.getBounds().clone();
                    if(!bounds){
                        bounds = bound;
                        isExistPolygon = true;
                    }else{
                        isExistPolygon = true;
                        if(bounds.left>bound.left) bounds.left = bound.left;
                        if(bounds.bottom>bound.bottom) bounds.bottom = bound.bottom;
                        if(bounds.right<bound.right) bounds.right = bound.right;
                        if(bounds.top<bound.top) bounds.top = bound.top;
                    }
                }
                if(!isExistPolygon) return;
                if(!bounds) return;
                map.zoomToExtent(new OpenLayers.Bounds(bounds.left,bounds.bottom,bounds.right,bounds.top));
            }
        },
        zoomToFeatureExtent:function(map,features){
            var bounds = null;
            var isExistPolygon = false;
            for(var i=0;i<features.length;i++){
                var feature = features[i];
                if(feature.geometry.CLASS_NAME=='OpenLayers.Geometry.Point'){
                    continue;
                }
                var bound = features[i].geometry.getBounds().clone();
                if(!bounds){
                    bounds = bound;
                    isExistPolygon = true;
                }else{
                    isExistPolygon = true;
                    if(bounds.left>bound.left) bounds.left = bound.left;
                    if(bounds.bottom>bound.bottom) bounds.bottom = bound.bottom;
                    if(bounds.right<bound.right) bounds.right = bound.right;
                    if(bounds.top<bound.top) bounds.top = bound.top;
                }
            }
            if(!isExistPolygon) return;
            if(!bounds) return;
            map.zoomToExtent(new OpenLayers.Bounds(bounds.left,bounds.bottom,bounds.right,bounds.top));
        },
        clearPointsLayerData:function(layer){
            var features = layer.features;
            $.each(features,function(i,feature){
                if(feature && feature.geometry && feature.geometry.CLASS_NAME=="OpenLayers.Geometry.Point"){
                    feature.destroy();
                }
            });
        },
        setVisibilityOfPointsLayer:function(visibility,layer){
            layer.setVisibility(visibility);
        },
        analysisSearchShapes:function(searchShapes,latlonProj,projectionObject,polyFillColorDef,polyFillColorExclude){
            var polygonFeatures = [];
            var len = searchShapes.length;
            for(var i=0;i<len;i++){
                var searchShape = searchShapes[i];
                if(searchShape && searchShape.polygon){
                    var points = searchShape.polygon;
                    var shape_points=[];
                    for (var j=0; j<points.length; j++) {
                        var point = new OpenLayers.Geometry.Point(points[j].x, points[j].y);
                        point.transform(latlonProj, projectionObject);
                        shape_points.push(point);
                    }
                    var linear_ring = new OpenLayers.Geometry.LinearRing(shape_points);
                    var polygon = new OpenLayers.Geometry.Polygon([linear_ring]);
                    var polygon_feature = new OpenLayers.Feature.Vector(polygon);
                    var isInclude = searchShape.isInclude;
                    polygon_feature.data.isInclude=searchShape.isInclude;
                    var current_style = polygon_feature.style;
                    var polygon_style = 'include';
                    if (isInclude) {
                        polygon_style = {fillColor: polyFillColorDef}||{};
                    } else {
                        polygon_style = {fillColor: polyFillColorExclude}||{};
                    }
                    if(EB_Common.browser.versions.handleDevice){
                        polygon_style.strokeWidth=2;
                    }
                    var style = null;
                    if (current_style == null) {
                        style = OpenLayers.Util.applyDefaults(polygon_style, OpenLayers.Feature.Vector.style["default"]);
                    } else {
                        style = OpenLayers.Util.applyDefaults(polygon_style, current_style);
                    }
                    polygon_feature.style = style;
                    polygon_feature.polygonType = isInclude ? "include" : "exclude";
                    polygon_feature.data.submit=false;
                    polygonFeatures.push(polygon_feature);
                }
            }
            return polygonFeatures;
        },
        drawWithPolygons:function(layer,polygons){

        },
        removeFeaturesPopup:function(features,map){
            for(var i= 0,l=features.length;i<l;i++){
                var feature =features[i];
                if(feature.popup){
                    map.removePopup(feature.popup);
                    if(feature.popup.destroy){
                        feature.popup.destroy();
                    }
                    feature.popup = null;
                }
            }
        },
        createContactPointForUniverse:function(layer,points){
            var features= [];
            var options = {
                popupClass:EB_View.universe.openlayers.tool.AutoSizeFramedCloudMaxSize,
                closeBox:false,
                overflow:true
            };
            var len =points.length;
            for(var i=0;i<len;i++){
                var point = points[i];
                var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(point.lonlat.lon, point.lonlat.lat));
                feature.popupOptions = options;
                feature.ll = point.lonlat;
                feature.html = point.html;
                feature.contactRecordType = point.contactRecordType||{fillColor:"#881133"};
                features.push(feature);
            }
            layer.addFeatures(features);
            layer.redraw();
            EB_View.universe.openlayers.tool.topLayerIndex(layer);
        },
        createPopupForUniverse:function(layer,ll,popupClass,popupContentHTML,closeBox,overflow){
            var feature = new OpenLayers.Feature(layer, ll);
            feature.closeBox = !!closeBox;
            feature.popupClass = popupClass;
            feature.data.popupContentHTML = popupContentHTML;
            feature.data.overflow = (!!overflow) ? "auto" : "hidden";
            var popup = feature.createPopup(!!closeBox);
            return popup;
        },
        createMarkerForUniverse: function (markerLayer,ll, popupContentHTML,setting) {
            var size = new OpenLayers.Size(7,7);
            var offset = new OpenLayers.Pixel(-(size.w/2), -size.h/2);
            var icon = new OpenLayers.Icon(EB_Common.Ajax.ctx+"/statics/stylesheets/universe/img/point.png", size, offset);
            var options = {
                popupClass:EB_View.universe.openlayers.tool.AutoSizeFramedCloudMaxSize,
                closeBox:false,
                overflow:true,
                icon:icon
            };
            if(setting){
                options = $.extend(options,setting);
            }
            var feature = new OpenLayers.Feature(markerLayer, ll);
            feature.closeBox = options.closeBox;
            feature.popupClass = options.popupClass;
            feature.data.popupContentHTML = popupContentHTML;
            feature.data.overflow = (options.overflow) ? "auto" : "hidden";
            feature.data.icon=options.icon;
            var marker = feature.createMarker();
            marker.events.register("mouseover", feature, this.markerOverOut);
            marker.events.register("mouseout", feature, this.markerOverOut);
            markerLayer.addMarker(marker);
            this.topLayerIndex(markerLayer);
            return marker;
        },
        createGeodesicPolygon : function(latlon, radius, sides, rotation, projection){
            var angle;
            var new_lonlat, geom_point;
            var points = [];

            for (var i = 0; i < sides; i++) {
                angle = (i * 360 / sides) + rotation;
                new_lonlat = OpenLayers.Util.destinationVincenty(latlon, angle, radius);
                new_lonlat.transform(new OpenLayers.Projection("EPSG:4326"), projection);
                geom_point = new OpenLayers.Geometry.Point(new_lonlat.lon, new_lonlat.lat);
                points.push(geom_point);
            }
            var ring = new OpenLayers.Geometry.LinearRing(points);
            return new OpenLayers.Geometry.Polygon([ring]);
        },
        topLayerIndex:function(layer){
            var map = layer.map;
            var markerLayersIndexBase = map.Z_INDEX_BASE.Popup-300;
            if(layer.name=="WidgetMarkersLayer"){
                var markersLayer = map.getLayersByName("MarkersLayer")[0];
                markersLayer.setZIndex(markerLayersIndexBase);
                layer.setZIndex(markerLayersIndexBase+5);
                markersLayer.perZIndex = markerLayersIndexBase;
                layer.perZIndex = markerLayersIndexBase+5;

            }else if(layer.name=="MarkersLayer"){
                var widgetMarkersLayer = map.getLayersByName("WidgetMarkersLayer")[0];
                widgetMarkersLayer.setZIndex(markerLayersIndexBase);
                layer.setZIndex(markerLayersIndexBase+5);
                widgetMarkersLayer.perZIndex = markerLayersIndexBase;
                layer.perZIndex = markerLayersIndexBase+5;
            }
        },
        topMarkerLayers:function(map){
            var markerLayersIndexBase = map.Z_INDEX_BASE.Popup-300;
            var widgetMarkersLayer = map.getLayersByName("WidgetMarkersLayer")[0];
            var markersLayer = map.getLayersByName("MarkersLayer")[0];
            widgetMarkersLayer.setZIndex(widgetMarkersLayer.perZIndex||markerLayersIndexBase);
            markersLayer.setZIndex(markersLayer.perZIndex||(markerLayersIndexBase+5));
        },
        markerOverOut : function (evt) {
            if (this.popup == null) {
                this.popup = this.createPopup(this.closeBox);
                this.marker.map.addPopup(this.popup);
                this.popup.show();
            } else {
                this.popup.toggle();
            }
            OpenLayers.Event.stop(evt);
        },
        escapeXML:function(t){
            if(!this.escapeXMLContainer)
                this.escapeXMLContainer=$("<span>").empty();
            var tt = this.escapeXMLContainer.text(t).html();
            var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            tt = tt.replace(exp,"<a href='$1' target='_blank'>$1</a>");
            return tt;
        },
        disabledButton:function(jButton,isDisabled){
            if(isDisabled){
                jButton.removeClass("orange").addClass("gray").addClass("save_disabled").attr("disabled","disabled");
            }else{
                jButton.removeClass("gray").removeClass("save_disabled").addClass("orange").removeAttr("disabled");
            }
        },
        htmlDecode : function(value){
            if(value && (value=='&nbsp;' || value=='&#160;' || (value.length===1 && value.charCodeAt(0)===160))) { return "";}
            return !value ? value : String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
        },
        htmlEncode : function (value){
            return !value ? value : String(value).replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        },
        displayXYZlayer:function(xyzLayers,display){
            for(var i=0;i<xyzLayers.length;i++){
                if(xyzLayers[i]){
                    xyzLayers[i].setVisibility(display);
                }
            }
        },
        destroyFeaturesPopup:function(features){
            if(!features && features.length==0) return;
            var featuresLength =  features.length;
            for(var i=0;i<featuresLength;i++){
                var popup = features[i].popup;
                if(!popup)
                    continue;
                EB_View.universe.map.removePopup(popup);
                popup.destroy();
            }
        },
        destroyMapPopup:function(map){
            //destroy native popups (i.e. for dots rendered as part of tiles--not dynamically drawn)
            var len = map.popups.length;
            for(var i = 0;i<len;i++){
                map.popups[i].hide();
            }
        },
        handleZoomIn : function(lonlat,universeApp) {
            var modelData = universeApp.model.toJSON();
            if (universeApp.map.baseLayer.id.indexOf("Bing") != -1) {
                var zoomTarget = modelData.next_zoom_level[universeApp.map.zoom+1];
                zoomTarget--;
            } else {
                var zoomTarget = modelData.next_zoom_level[universeApp.map.zoom];
            }
            if(lonlat){
                universeApp.map.setCenter(lonlat);
            }
            universeApp.map.zoomTo(zoomTarget);
        },
        handleZoomOut : function (universeApp) {
            var modelData = universeApp.model.toJSON();
            if (universeApp.map.baseLayer.id.indexOf("Bing") != -1) {
                var zoomTarget = modelData.previous_zoom_level[universeApp.map.zoom+1];
                zoomTarget--;
            } else {
                var zoomTarget = modelData.previous_zoom_level[universeApp.map.zoom];
            }
            universeApp.map.zoomTo(zoomTarget);
        },
        getZoomTarget:function(isIn,universeApp) {
            var modelData = universeApp.model.toJSON();
            var zoomTarget = 0;
            if(isIn){
                if (universeApp.map.baseLayer.id.indexOf("Bing") != -1) {
                    zoomTarget = modelData.next_zoom_level[universeApp.map.zoom+1];
                    zoomTarget--;
                } else {
                    zoomTarget = modelData.next_zoom_level[universeApp.map.zoom];
                }
            }else{
                if (universeApp.map.baseLayer.id.indexOf("Bing") != -1) {
                    zoomTarget = modelData.previous_zoom_level[universeApp.map.zoom+1];
                    zoomTarget--;
                } else {
                    zoomTarget = modelData.previous_zoom_level[universeApp.map.zoom];
                }
            }
            return zoomTarget;
        }
    };
    view.universe.openlayers.controls.Click={
        defaultHandlerOptions: {
            'single': false,
            'double': true,
            'pixelTolerance': 0,
            'stopSingle': false,
            'stopDouble': true
        },
        initialize: function(options) {
            this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.modelData = this.universeApp.model.toJSON();
            this.handler = new OpenLayers.Handler.Click(
                this, {'dblclick': this.dbclickTarget}, this.handlerOptions
            );
        },
        dbclickTarget: function(evt) {
            var currentZoom = this.map.getZoom();
            var newZoom = EB_View.universe.openlayers.tool.getZoomTarget(true,this.universeApp);
            newZoom = Math.max(newZoom, 0);
            newZoom = Math.min(newZoom, this.map.getNumZoomLevels());
            if (newZoom === currentZoom) {
                return;
            }
            var size    = this.map.getSize();
            var deltaX  = size.w/2 - evt.xy.x;
            var deltaY  = evt.xy.y - size.h/2;
            var newRes  = this.map.baseLayer.getResolutionForZoom(newZoom);
            var zoomPoint = this.map.getLonLatFromPixel(evt.xy);
            var newCenter = new OpenLayers.LonLat(
                zoomPoint.lon + deltaX * newRes,
                zoomPoint.lat + deltaY * newRes );
            this.map.setCenter( newCenter, newZoom );
        }
    };
    view.universe.openlayers.controls.MouseWheel={
        wheelUp: function(evt, delta) {
            this.wheelChange(evt, delta || 1);
        },
        wheelDown: function(evt, delta) {
            this.wheelChange(evt, delta || -1);
        },
        wheelChange: function(evt, deltaZ) {
            var currentZoom = this.map.getZoom();
            var newZoom = EB_View.universe.openlayers.tool.getZoomTarget(Math.round(deltaZ)>0,this.universeApp);
            newZoom = Math.max(newZoom, 0);
            newZoom = Math.min(newZoom, this.map.getNumZoomLevels());
            if (newZoom === currentZoom) {
                return;
            }
            var size    = this.map.getSize();
            var deltaX  = size.w/2 - evt.xy.x;
            var deltaY  = evt.xy.y - size.h/2;
            var newRes  = this.map.baseLayer.getResolutionForZoom(newZoom);
            var zoomPoint = this.map.getLonLatFromPixel(evt.xy);
            var newCenter = new OpenLayers.LonLat(
                zoomPoint.lon + deltaX * newRes,
                zoomPoint.lat + deltaY * newRes );
            this.map.setCenter( newCenter, newZoom );
        },
        initialize: function(options) {
            if (!options) options = {};
            this.handlerOptions = OpenLayers.Util.extend(options, this.defaultHandlerOptions);
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.modelData = this.universeApp.model.toJSON();
            this.handler = new OpenLayers.Handler.MouseWheel(
                this,
                {
                    up: this.wheelUp,
                    down:this.wheelDown
                },
                this.handlerOptions
            );
        }
    };
    // remove feature control
    view.universe.openlayers.controls.RemoveFeature={
        geometryTypes: null,
        onDone: function(feature) {},
        layer: null,
        feature: null,
        selectControl: null,
        initialize: function(layer, options) {
            OpenLayers.Control.prototype.initialize.apply(this, [options]);
            this.layer = layer;
            var control = this;
            this.selectControl = new OpenLayers.Control.SelectFeature(layer,
                {geometryTypes: this.geometryTypes,
                    onSelect: function(feature) {
                        control.onSelect.apply(control, [feature]);
                        function onPopupClose(){
                            EB_View.universe.map.removePopup(feature.popup);
                            feature.popup.destroy();
                        }
                        //var html = "<input type='button' value='Remove'/><input type='button' value='Cancel'/>";
                        var html = "<div class='popup_remove_polygon'></div>";
                        var popupId = "popup"+(new Date()).getTime();
                        var popup = new OpenLayers.Popup.Anchored(popupId,feature.geometry.getBounds().getCenterLonLat(),new OpenLayers.Size(16,16),html,null, false, onPopupClose);
                        //                        var layers = this.map.layers;
//                        var maxIndex = 0;
//                        $.each(layers,function(i,layer){
//                            var index = parseInt(layer.getZIndex());
//                            if(index > maxIndex){
//                                maxIndex = index;
//                            }
//                        });
//                        $("#"+popupId).css("zIndex",maxIndex+1000);
                        feature.popup = popup;
                        this.map.addPopup(popup);
                        $(popup.div).css("background","none").css("_background-color","transparent");
                        var dom = popup.contentDiv;
                        $(dom).find(".popup_remove_polygon").click(function(){
                            control.remove(feature);
                        });

                    },
                    onUnselect: function(feature) {
                        control.onUnselect.apply(control, [feature]);
                        this.map.removePopup(feature.popup);
                        feature.popup.destroy();
                    },
                    clickout:true,toggle:false,multiple:false,hover:false});
        },
        destroy: function() {
            this.layer = null;
            this.selectControl.destroy();
            OpenLayers.Control.prototype.destroy.apply(this, []);
        },
        activate: function() {
            return (this.selectControl.activate() &&
                OpenLayers.Control.prototype.activate.apply(this, arguments));
        },
        deactivate: function() {
            // the return from the handler is unimportant in this case
            if(this.feature && this.feature.popup){
                this.map.removePopup(this.feature.popup);
            }
            this.selectControl.unselectAll();
            this.selectControl.deactivate();
            return OpenLayers.Control.prototype.deactivate.apply(this, arguments);
        },
        onSelect: function(feature) {
            this.feature = feature;
        },
        onUnselect: function(feature) {
            this.feature = null;
        },
        remove: function(feature) {
            if(feature.popup)
                this.map.removePopup(feature.popup);
            feature.data.submit=true;
            this.layer.removeFeatures([feature]);
            this.onDone(feature);
            feature.destroy();
        },
        setMap: function(map) {
            this.selectControl.setMap(map);
            OpenLayers.Control.prototype.setMap.apply(this, arguments);
        },
        CLASS_NAME: "OpenLayers.Control.RemoveFeature"
    };
    view.universe.openlayers.controls.GisPanel = {
        defaultControl: null,
        initialize: function(options) {
            OpenLayers.Control.prototype.initialize.apply(this, [options]);
            this.modelData = this.universeApp.model.toJSON();
            this.controls = [];
        },
        destroy: function() {
            OpenLayers.Control.prototype.destroy.apply(this, arguments);
            for(var i = this.controls.length - 1 ; i >= 0; i--) {
                OpenLayers.Event.stopObservingElement(this.controls[i].panel_div);
                this.controls[i].panel_div = null;
            }
        },
        activate: function() {
            if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
                for(var i = 0; i < this.controls.length; i++) {
                    if (this.controls[i] == this.defaultControl) {
                        this.controls[i].activate();
                    }
                }
                return true;
            } else {
                return false;
            }
        },
        deactivate: function() {
            if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
                for(var i = 0; i < this.controls.length; i++) {
                    this.controls[i].deactivate();
                }
                return true;
            } else {
                return false;
            }
        },
        draw: function() {
            this.jqDiv = $("<div style='position:absolute;z-index:5000;top:0;'/>");
            this.jqDiv.appendTo(this.universeApp.jDom.map);
            this.div = this.jqDiv[0];
            OpenLayers.Control.prototype.draw.apply(this, arguments);
            var options = {
                container:this.div,
                control:this,
                model:new Backbone.Model({controls:[]})
            }
            this.view = EB_View.universe.apps.GisPanelApp.getInstance(options);
            this.activate();
            this.div.style.height="40px";
            this.div.style.width="100%";

//            return this.div;
        },
        activateControl: function (control) {
            if (!this.active) { return false; }
            if (control.type == OpenLayers.Control.TYPE_BUTTON) {
                control.trigger();
                return;
            }
            if (control.type == OpenLayers.Control.TYPE_TOGGLE) {
                if (control.active) {
                    control.deactivate();
                } else {
                    control.activate();
                }
                return;
            }
            for (var i = 0; i < this.controls.length; i++) {
                if (this.controls[i] == control) {
                    control.activate();
                } else {
                    if (this.controls[i].type != OpenLayers.Control.TYPE_TOGGLE) {
                        this.controls[i].deactivate();
                    }
                }
            }
        },
        addControls: function(controls) {
            var _controls = this.view.model.get("controls");
            if (!(controls instanceof Array)) {
                controls = [controls];
            }
            _controls = _controls.concat(controls);
            this.view.model.set({"controls":_controls});
        },
        onClick: function (ctrl, evt) {
            OpenLayers.Event.stop(evt ? evt : window.event,true);
            this.activateControl(ctrl);
        },
        ignoreEvent: function(evt) {
            OpenLayers.Event.stop(evt,true);
        },
        mouseDown: function(evt) {
            this.isMouseDown = true;
            this.ignoreEvent(evt);
        },
        mouseUp: function(evt) {
            if (this.isMouseDown) {
                this.isMouseDown = false;
                this.ignoreEvent(evt);
            }
        },
        toolbarClick:function(evt){
            OpenLayers.Event.stop(evt,true);
        },
        CLASS_NAME: "OpenLayers.Control.GisPanel"
    };
    view.universe.openlayers.controls.BaseDialogControl = {
        openControl: function() {
            if(this.view && this.view.$el){
                var gisPanelControl = this.modelData.tempStorage.gisPanelControl;
                $.each(this.modelData.tempStorage.controls,function(n,control){
                    if(control.view){
                        control.view.$el.hide();
                    }
                });
                var left=gisPanelControl.view.$("#everbridge_gis_panel_body").outerWidth()+2;
                if(i18n.getCurrentLanguage()!="ar_SA"){
                    this.view.$el.show().css("left",left+"px").css("top","42px");
                }else{
                    this.view.$el.show().css("right",left+"px").css("top","42px");
                }

                $("#gis_polygon_tools").children(".on").trigger("click");
            }
        },
        closeControl: function() {
            this.view && this.view.$el.hide();
        },
        createBaseDialog:function(title){
            if(!this.view) return;
            this.view.$el.addClass("baseDialogControl").prepend($("#universeAppBaseDialogTemplate").render([{title:title}]));
            this.view.$el.draggable({containment:"parent",handle:".baseDialogControlHeader"});
            var control = this;
            this.view.$(".base_dialog_control_close").click(function(){
                control.closeControl();
            });
            $(this.div).removeAttr("title");
        },
        draw:function(){
            this.jqDiv = $("<div style='position:absolute;z-index:5000;top:0;'/>");
            this.jqDiv.appendTo(this.universeApp.jDom.map);
            this.div = this.jqDiv[0];
            OpenLayers.Control.prototype.draw.apply(this);
        }
    };
    view.universe.openlayers.controls.BaseMapLayerSwitcher={
        activate: function() {
            this.openControl();
        },
        deactivate: function() {
            this.closeControl();
        },
        initialize: function(options) {
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.modelData = this.universeApp.model.toJSON();
        },
        setMap: function(map) {
            OpenLayers.Control.prototype.setMap.apply(this, arguments);
            this.map.events.register("addlayer", this, this.redraw);
            this.map.events.register("changelayer", this, this.redraw);
            this.map.events.register("removelayer", this, this.redraw);
            this.map.events.register("changebaselayer", this, this.redraw);
        },
        draw: function() {
            EB_View.universe.openlayers.controls.BaseDialogControl.draw.apply(this);
            var options = {
                container:this.div,
                control:this,
                model:new Backbone.Model({layers:[]})
            }
            this.view = EB_View.universe.apps.BaseMapLayerSwitcherApp.getInstance(options);
            this.createBaseDialog(this.title);
            this.loadMapLayers();
        },
        loadMapLayers:function(){
            var layers = this.map.layers.slice();
            $.each(layers,function(i,layer){
                var baseLayer = layer.isBaseLayer;
                if (baseLayer && layer.displayInLayerSwitcher) {
                    var checked = (baseLayer) ? (layer == this.map.baseLayer) : layer.getVisibility();
                    layer.checked = checked;
                }
            });
            this.view.model.set({layers:layers});
        },
        CLASS_NAME: "OpenLayers.Control.BaseMapLayerSwitcher"
    };

    view.universe.openlayers.controls.DisplayLayerSwitcher={
        activate: function() {
            this.openControl();
        },
        deactivate: function() {
            this.closeControl();
        },
        initialize: function(options) {
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.modelData = this.universeApp.model.toJSON();
        },
        setMap: function(map) {
            OpenLayers.Control.prototype.setMap.apply(this, arguments);
            this.map.events.register("addlayer", this, this.redraw);
            this.map.events.register("changelayer", this, this.redraw);
            this.map.events.register("removelayer", this, this.redraw);
            this.map.events.register("changebaselayer", this, this.redraw);
        },
        draw: function() {
            EB_View.universe.openlayers.controls.BaseDialogControl.draw.apply(this);
            var options = {
                container:this.div,
                control:this,
                model:new Backbone.Model({displayLayers:this.modelData.displayLayers,referenceResources:this.modelData.referenceResources})
            }
            this.view = EB_View.universe.apps.DisplayLayerSwitcherApp.getInstance(options);
            this.createBaseDialog(this.title);
        },
        CLASS_NAME: "OpenLayers.Control.DisplayLayerSwitcher"
    };

    view.universe.openlayers.controls.ContactsLayerSwitcher={
        activate: function() {
            this.openControl();
        },
        deactivate: function() {
            this.closeControl();
        },
        initialize: function(options) {
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.modelData = this.universeApp.model.toJSON();
        },
        setMap: function(map) {
            OpenLayers.Control.prototype.setMap.apply(this, arguments);
            this.map.events.register("addlayer", this, this.redraw);
            this.map.events.register("changelayer", this, this.redraw);
            this.map.events.register("removelayer", this, this.redraw);
            this.map.events.register("changebaselayer", this, this.redraw);
        },
        draw: function() {
            EB_View.universe.openlayers.controls.BaseDialogControl.draw.apply(this);
            var control = this,modelData = this.modelData,storage = modelData.tempStorage,originalData = storage.selectedData,groupIds,filterIds;
            if(originalData.contactSearchCondition){
                groupIds = originalData.contactSearchCondition.groupIds || [];
                filterIds = originalData.contactSearchCondition.filterIds || [];
            }
            var options = {
                container:this.div,
                control:this,
                model:new Backbone.Model({
                    isShowAllContacts:this.modelData.isShowAllContacts || false,
                    contactRecordTypes:this.modelData.contactRecordTypes,
                    recordTypeLayers:this.modelData.recordTypeLayers,
                    groupLayers:this.modelData.groupLayers,
                    contactFilters:this.modelData.contactFilters,
                    groupIds:groupIds,
                    filterIds : filterIds
                }),
                contactSearchConditionChangeCallBack:function(submit){
                    control.contactSearchConditionChangeCallBack(submit);
                }
            }
            this.view = EB_View.universe.apps.ContactsLayerSwitcherApp.getInstance(options);
            this.createBaseDialog(this.title);
        },
        contactSearchConditionChangeCallBack:function(submit){
            var isSend = this.modelData.tempStorage.controls.everbridgeSearchContact.submitSearchContactsByFilters();
            if(!isSend) this.modelData.tempStorage.controls.everbridgeSearchContact.submitSearchContactNumByPolygons();
        },
        CLASS_NAME: "OpenLayers.Control.ContactsLayerSwitcher"
    };

    view.universe.openlayers.controls.OverLayerSwitcher = {
        activate: function() {
            this.openControl();
        },
        deactivate: function() {
        },
        layerStates: null,
        layersDiv: null,
        dataLayersDiv: null,
        dataLayers: null,
        initialize: function(options) {
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.modelData = this.universeApp.model.toJSON();
            this.layerStates = [];
        },
        destroy: function() {
            OpenLayers.Event.stopObservingElement(this.div);
            OpenLayers.Event.stopObservingElement(this.minimizeDiv);
            OpenLayers.Event.stopObservingElement(this.maximizeDiv);
            this.clearLayersArray("data");
            this.map.events.unregister("addlayer", this, this.redraw);
            this.map.events.unregister("changelayer", this, this.redraw);
            this.map.events.unregister("removelayer", this, this.redraw);
            this.map.events.unregister("changebaselayer", this, this.redraw);
            OpenLayers.Control.prototype.destroy.apply(this, arguments);
        },
        setMap: function(map) {
            OpenLayers.Control.prototype.setMap.apply(this, arguments);
            this.map.events.register("addlayer", this, this.redraw);
            this.map.events.register("changelayer", this, this.redraw);
            this.map.events.register("removelayer", this, this.redraw);
            this.map.events.register("changebaselayer", this, this.redraw);
        },
        draw: function() {
            EB_View.universe.openlayers.controls.BaseDialogControl.draw.apply(this);
            this.createBaseDialog(this.text);
            this.loadContents();
            // set mode to minimize
            if(!this.outsideViewport) { this.closeControl(); }
            // populate div with current info
            this.redraw();
        },
        clearLayersArray: function(layersType) {
            var layers = this[layersType + "Layers"];
            if (layers) {
                for(var i=0; i < layers.length; i++) {
                    var layer = layers[i];
                    OpenLayers.Event.stopObservingElement(layer.inputElem);
                    OpenLayers.Event.stopObservingElement(layer.labelSpan);
                }
            }
            this[layersType + "LayersDiv"].innerHTML = "";
            this[layersType + "Layers"] = [];
        },
        checkRedraw: function() {
            var redraw = false;
            if ( !this.layerStates.length ||
                (this.map.layers.length != this.layerStates.length) ) {
                redraw = true;
            } else {
                for (var i=0; i < this.layerStates.length; i++) {
                    var layerState = this.layerStates[i];
                    var layer = this.map.layers[i];
                    if ( (layerState.name != layer.name) ||
                        (layerState.inRange != layer.inRange) ||
                        (layerState.id != layer.id) ||
                        (layerState.visibility != layer.visibility) ) {
                        redraw = true;
                        break;
                    }
                }
            }
            return redraw;
        },
        redraw: function() {
            if (!this.checkRedraw()) {
                return this.div;
            }
            this.clearLayersArray("data");
            this.layerStates = new Array(this.map.layers.length);
            for (var i = 0; i < this.map.layers.length; i++) {
                var layer = this.map.layers[i];
                this.layerStates[i] = {
                    'name': layer.name,
                    'visibility': layer.visibility,
                    'inRange': layer.inRange,
                    'id': layer.id
                };
            }

            var layers = this.map.layers.slice();
            if (!this.ascending) { layers.reverse(); }
            for( var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var baseLayer = layer.isBaseLayer;
                if (!baseLayer && layer.displayInLayerSwitcher) {
                    if(layer.name=="PointsLayer" || layer.name=="PolygonsLayer" || layer.name=="MarkersLayer"){
                        continue;
                    }
                    var checked = (baseLayer) ? (layer == this.map.baseLayer) : layer.getVisibility();
                    // create input element
                    var $inputElem = $("<input type='"+((baseLayer) ? "radio" : "checkbox")+"' "+(checked?"checked='checked'":"")+" id='"+("input_" + layer.name)+"' name='"+((baseLayer) ? "baseLayers" : layer.name)+"' value='"+(layer.name)+"'/>");
                    var inputElem=$inputElem[0];
                    if (!baseLayer && !layer.inRange) { inputElem.disabled = true; }
                    var context = { 'inputElem': inputElem, 'layer': layer, 'layerSwitcher': this };
                    OpenLayers.Event.observe(inputElem, "mouseup", OpenLayers.Function.bindAsEventListener(this.onInputClick,context));
                    // create span
                    var labelSpan = document.createElement("span");
                    if (!baseLayer && !layer.inRange) { labelSpan.style.color = "gray"; }
                    labelSpan.innerHTML = layer.name;
                    labelSpan.style.verticalAlign = (baseLayer) ? "bottom" : "baseline";
                    OpenLayers.Event.observe(labelSpan, "click", OpenLayers.Function.bindAsEventListener(this.onInputClick,context));
                    var groupArray = (baseLayer) ? this.baseLayers : this.dataLayers;
                    groupArray.push({ 'layer': layer, 'inputElem': inputElem, 'labelSpan': labelSpan });
                    var $li = $('<li></li>');
                    $li.append(inputElem).append(labelSpan);
                    this.dataLayersDiv.appendChild($li[0]);
                }
            }
            return this.div;
        },
        onInputClick: function(e) {
            if (!this.inputElem.disabled) {
                if (this.inputElem.type == "radio") {
                    this.inputElem.checked = true;
                    this.layer.map.setBaseLayer(this.layer);
                } else {
                    this.inputElem.checked = !this.inputElem.checked;
                    this.layerSwitcher.updateMap();
                }
            }
            OpenLayers.Event.stop(e);
        },
        onLayerClick: function(e) {
            this.updateMap();
        },
        updateMap: function() {
            // set the correct visibilities for the overlays
            for(var i=0; i < this.dataLayers.length; i++) {
                var layerEntry = this.dataLayers[i];
                layerEntry.layer.setVisibility(layerEntry.inputElem.checked);
            }
        },
        loadContents: function() {
            var $div=$(this.div);
            $div.addClass("everbridge_gis_overlayer");
            //OpenLayers.Event.observe(this.div, "mouseup", OpenLayers.Function.bindAsEventListener(this.mouseUp, this));
            OpenLayers.Event.observe(this.div, "click", this.ignoreEvent);
            OpenLayers.Event.observe(this.div, "mousedown", OpenLayers.Function.bindAsEventListener(this.mouseDown, this));
            OpenLayers.Event.observe(this.div, "dblclick", this.ignoreEvent);
            // layers list div
            var $layerDiv = $('<div class="everbridge_gis_overlayer_list"></div>');
            var $overLayerUL=$('<ul class="everbridge_gis_overlayer_ul"></ul>');
            $layerDiv.append($overLayerUL);
            this.layersDiv = $layerDiv[0];
            this.dataLayersDiv=$overLayerUL[0];
            this.div.appendChild(this.layersDiv);
        },
        CLASS_NAME: "OpenLayers.Control.OverLayerSwitcher"
    };
    view.universe.openlayers.controls.SearchContact = {
        searchReset:false,//if click Reset;
        lastSearchParams:{},
        filterRules:null,
        activate: function() {
            this.openControl();
        },
        deactivate: function() {
            this.closeControl();
        },
        initialize: function(options) {
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.modelData = this.universeApp.model.toJSON();
        },
        draw: function(){
            EB_View.universe.openlayers.controls.BaseDialogControl.draw.apply(this);
            var control = this;
            var options = {
                url:EB_Common.Ajax.wrapperUrl("/universe/fetchFiltersAndRules"),
                container:this.div,
                control:this,
                submitCallBack:function(filterRules){
                    control.filterRules = filterRules
                    control.submitSearchContactsByFilters();
                },
                resetCallBack:function(){
                    control.resetSearchContactsByFilters()
                }
            }||{};
            this.view = EB_View.universe.apps.SearchContactApp.getInstance(options);
            this.createBaseDialog(this.text);
        },
        getPolygonsData:function(){
            var params={polygons:null,polygonIsIncludes:null}|| {},polygons_points = [],is_includes = [],gisPolygons=this.modelData.tempStorage.gisPolygons;
            for(var pp in gisPolygons){
                var points = [];
                var _points=gisPolygons[pp].components;
                var len = _points.length,isRight=true;
                for(var i = 0 ; i<len;i++){
                    var lonLat = new OpenLayers.LonLat( _points[i].x ,_points[i].y ).transform(this.map.getProjectionObject(),this.modelData.latlon_proj);
                    if (lonLat.lon > 180 || lonLat.lon < -180) {
                        isRight = false;
                        gisPolygons[pp].isInvalid = true;
                        EB_Common.dialog.alert(i18n["universe.control.searchcontact.invalidpolygoncoordinates"]);
                        break;
                    }else{
                        points.push({x:lonLat.lon,y:lonLat.lat});
                    }
                }
                if(!isRight) continue;
                is_includes.push(gisPolygons[pp].polygonType == "include" ? "true" : "false");
                polygons_points.push(points);
            }
            EB_Common.logger.log(EB_Common.json.stringify(polygons_points));
            if(polygons_points.length>0){
                params.polygons = EB_Common.json.stringify(polygons_points);
                params.polygonIsIncludes = EB_Common.json.stringify(is_includes);
            }
            var excludedContactIds = [],excludeContactsControl;
            if((excludeContactsControl = this.modelData.tempStorage.controls.everbridgeExcludeContacts) && excludeContactsControl.view){
                excludedContactIds = excludeContactsControl.getExcludedContactIds();
            }
            params.excludedContactIds = excludedContactIds;
            EB_Common.logger.log(params);
            return params;
        },
        getFilterRulesData:function(){
            var params = {} || {};
            params.filterRules=this.filterRules || "";
            params.thresholdSearchedContact=this.modelData.thresholdSearchedContact;
            params.contactSearchCondition = this.modelData.tempStorage.controls.everbridgeContactsLayerSwitcher.view.getJsonData();
            return params;
        },
        resetSearchContactsByFilters:function(){
            this.filterRules = "";
            EB_View.universe.openlayers.tool.setVisibilityOfPointsLayer(false,this.modelData.tempStorage.layers.filteredPointsAndNetworkPolygonsLayer);
            this.modelData.tempStorage.controls.everbridgeContactsLayerSwitcher.view.showCheckedLayers(true);
            this.submitSearchContactNumByPolygons();
        },
        //return false don't send request, true: had send request
        submitSearchContactsByFilters:function(){
            var control = this,params = this.getFilterRulesData();
            if(!params.filterRules){
                this.modelData.tempStorage.controls.everbridgeContactsLayerSwitcher.view.showCheckedLayers(true);
                EB_View.universe.openlayers.tool.displayXYZlayer(this.modelData.tempStorage.layers.filteredPointsAndNetworkPolygonsLayer,false);
                return;
            }
            if(params.contactSearchCondition.error){
                this.modelData.tempStorage.controls.everbridgeContactsLayerSwitcher.view.showCheckedLayers(true);
                EB_View.universe.openlayers.tool.displayXYZlayer([this.modelData.tempStorage.layers.filteredPointsAndNetworkPolygonsLayer],false);
                return false;
            }else{
                this.modelData.tempStorage.controls.everbridgeContactsLayerSwitcher.view.showCheckedLayers(false);
                params.contactSearchCondition = JSON.stringify(params.contactSearchCondition);
            }
            EB_Common.Ajax.post("/universe/searchContactByFilterRules",params,function(data){
                control.loadCompleteOfFilterContacts(data, params);
                control.submitSearchContactNumByPolygons();
            },"json");
            return true;
        },
        loadCompleteOfFilterContacts:function(data,params){
            this.modelData.tempStorage.controls.everbridgeExcludeContacts.view.reset();
            var self = this;
            EB_View.universe.openlayers.tool.destroyMapPopup(this.map);
            EB_View.universe.openlayers.tool.clearPointsLayerData(this.modelData.tempStorage.layers.filteredPointsAndNetworkPolygonsLayer);
            EB_View.universe.openlayers.tool.displayXYZlayer(this.modelData.tempStorage.xyzLayers,false);
            EB_View.universe.openlayers.tool.setVisibilityOfPointsLayer(true,this.modelData.tempStorage.layers.filteredPointsAndNetworkPolygonsLayer);
            var contactsAllDataPageNum = data.contactsAllDataPage.totalCount;
            if(contactsAllDataPageNum==0){
                EB_Common.dialog.alert(i18n["universe.control.searchcontact.nocontactsfound"]);
                return;
            }else if(contactsAllDataPageNum>this.modelData.thresholdSearchedContact){
                var message = i18n["universe.control.searchcontact.searchedcontactsexceedmaximum"];
                message = message.replace("{0}",this.modelData.thresholdSearchedContact);
                EB_Common.dialog.alert(message);
                return;
            }
            EB_Common.dialog.alert(contactsAllDataPageNum+" "+i18n["universe.control.searchcontact.displaypoints"]);
            var contacts=data.contactsAllDataPage.data,len = contacts.length,result=[];
            for(var i = 0 ; i<len ; i++){
                var contact = contacts[i];
                if((!contact.address) || contact.address.length==0) continue;
                var alen=contact.address.length;
                for(var a=0;a<alen;a++){
                    var address = contact.address[a];
                    var gisLocation=address.gisLocation;
                    if(!!gisLocation){
                        var lat = gisLocation.lat;
                        var lon = gisLocation.lon;
                        var lonLat = new OpenLayers.LonLat( lon ,lat ).transform(self.modelData.latlon_proj,self.map.getProjectionObject());
                        var html={
                            firstName:contact.firstName,
                            lastName:contact.lastName,
                            streetAddress:address.streetAddress,
                            city:address.city,
                            postalCode:address.postalCode,
                            country:address.country
                        };
                        html = this.view.renderPointInfo(html);
                        if((!contact.contactRecordType) || ((!contact.contactRecordType.fillColor))){
                            contact.contactRecordType=null;
                        }
                        result.push({lonlat:lonLat,html:html,contactRecordType:contact.contactRecordType})
                    }
                }
            }
            EB_View.universe.openlayers.tool.createContactPointForUniverse(self.modelData.tempStorage.layers.filteredPointsAndNetworkPolygonsLayer,result);
        },
        submitSearchContactNumByPolygons:function(){
            if(this.ajaxRequest){
                this.ajaxRequest.abort();
            }
            var params = this.getPolygonsData(),control = this;
            params.filterRules=this.filterRules||"";
            var contactSearchCondition = this.modelData.tempStorage.controls.everbridgeContactsLayerSwitcher.view.getJsonData();

            var lastSearchParams  =  $.extend(true,{},params);
            lastSearchParams.contactSearchCondition=contactSearchCondition;
            this.lastSearchParams = lastSearchParams;

            if((!params.polygons)){
                this.setContactsNum(0);
                return;
            }

            if(contactSearchCondition.error){
                delete this.lastSearchParams.contactSearchCondition;
                this.setContactsNum(0);
                return;
            }else{
                params.contactSearchCondition = JSON.stringify(contactSearchCondition);
            }
            this.ajaxRequest = EB_Common.Ajax.post("/universe/searchContactsNumByPolygons",params,function(data){
                control.loadCompleteOfReadContactsNum(data || {});
            },"json");
        },
        loadCompleteOfReadContactsNum:function(data){
            this.setContactsNum(data.contactsNum || 0);
        },
        setContactsNum:function(num){
            this.modelData.tempStorage.gisPanelControl.view.$("#selectedContactsCount").text(num);
            this.modelData.tempStorage.shapesCount = num;
            if(!this.modelData.isDialog){
                this.universeApp.syncData();
            }
        },
        CLASS_NAME:"OpenLayers.Control.SearchContacts"
    };
    view.universe.openlayers.controls.RegionLibrary={
        activate: function() {
            if(!this.load){
                this.load = true;
                this.view.reload();
            }
            this.openControl();
        },
        deactivate: function() {
            this.closeControl();
        },
        initialize: function(options) {
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.modelData = this.universeApp.model.toJSON();
        },
        draw: function() {
            EB_View.universe.openlayers.controls.BaseDialogControl.draw.apply(this);
            var control = this;
            var options = {
                url:EB_Common.Ajax.wrapperUrl("/universe/fetchRegionLib"),
                container:this.div,
                control:this,
                loadRegionCallBack:function(region){
                    control.loadRegion(region);
                }
            }
            this.view = EB_View.universe.apps.RegionLibraryApp.getInstance(options);
            this.createBaseDialog(this.text);
        },
        loadRegion:function(region) {
            this.features = [];
            var control = this,shapes = region.shapes,zoom_to_point=null,projectionObject = this.map.getProjectionObject();
            $.each(shapes||[],function(i,shape){
                var points = shape.shape.points;
                var shape_points=[];
                for (var j=0; j<points.length; j++) {
                    var point = new OpenLayers.Geometry.Point(points[j].x, points[j].y);
                    point.transform(control.modelData.latlon_proj, projectionObject);
                    shape_points.push(point);
                    if (j == 0) {
                        zoom_to_point = new OpenLayers.LonLat(points[j].x, points[j].y).transform(control.modelData.latlon_proj,projectionObject);
                    }
                }
                var linear_ring = new OpenLayers.Geometry.LinearRing(shape_points);
                var polygon = new OpenLayers.Geometry.Polygon([linear_ring]);
                var polygon_feature = new OpenLayers.Feature.Vector(polygon);
                //Set polygon's include/exclude attribute
                var is_include = shape.include;
                var polygon_style = {} || {};
                if (is_include) {
                    polygon_style.fillColor=control.modelData.polyFillColorDef;
                } else {
                    polygon_style.fillColor=control.modelData.polyFillColorExclude;
                }
                if(EB_Common.browser.versions.handleDevice){
                    polygon_style.strokeWidth=2;
                }
                var style = OpenLayers.Util.applyDefaults(polygon_style, OpenLayers.Feature.Vector.style["default"]);
                polygon_feature.style = style;
                polygon_feature.polygonType = is_include ? "include" : "exclude";
                if((shapes.length-1)!=i){
                    polygon_feature.data.submit = false;
                }
                control.features.push(polygon_feature);
            });
            this.modelData.tempStorage.layers.polygonsLayer.addFeatures(this.features);
            EB_View.universe.openlayers.tool.zoomToExtent(this.modelData.tempStorage.layers.polygonsLayer);
        },
        CLASS_NAME: "OpenLayers.Control.RegionLibrary"
    };
    view.universe.openlayers.controls.SearchLocation={
        activate: function() {
            this.openControl();
        },
        deactivate: function() {
            this.closeControl();
        },
        initialize: function(options) {
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.modelData = this.universeApp.model.toJSON();
        },
        draw: function() {
            EB_View.universe.openlayers.controls.BaseDialogControl.draw.apply(this);
            var control = this;
            var options = {
                container:this.div,
                control:this,
                showCallBack:function(obj){
                    control.displayFeature(obj);
                }
            }
            this.view = EB_View.universe.apps.SearchLocationApp.getInstance(options);
            this.createBaseDialog(this.text);
        },
        displayFeature:function(obj){
            var self = this;
            this.modelData.tempStorage.layers.markersLayer.setVisibility(true);
            this.modelData.tempStorage.layers.markersLayer.clearMarkers();
            if(this.features){
                EB_View.universe.openlayers.tool.destroyFeaturesPopup(this.features);
                this.modelData.tempStorage.layers.polygonsLayer.removeFeatures(this.features);
            }
            this.features=[];
            var marker_type = obj.markType ;
            if (marker_type == 'point') {
                var lonLat = new OpenLayers.LonLat( obj.address.gisLocation.lon ,obj.address.gisLocation.lat ).transform(this.modelData.latlon_proj,this.map.getProjectionObject());
                var popupContentHTML = obj.address.location;
                var size = new OpenLayers.Size(24,24);
                var offset = new OpenLayers.Pixel(-12, -size.h);
                var icon = new OpenLayers.Icon(EB_Common.Ajax.ctx+"/statics/stylesheets/universe/img/univ_map_marker.png", size, offset);
                var setting = {
                    icon: icon
                }
                var marker = EB_View.universe.openlayers.tool.createMarkerForUniverse(this.modelData.tempStorage.layers.markersLayer,lonLat,popupContentHTML,setting);
                this.map.setCenter(marker.lonlat);
            } else {
                var radius = obj.radius;
                var radius_units = obj.radius_units;
                //Convert input to meters (generally accepted units for working with maps)
                radius = parseFloat(radius);
                switch(radius_units) {
                    case ('m'):break;
                    case ('ft'):radius = radius / 3.28084;break;
                    case ('mi'):radius = radius / 0.000621371;break;
                    case ('km'):radius = radius / 0.001;break;
                }
                var lonlat = new OpenLayers.LonLat(obj.address.gisLocation.lon, obj.address.gisLocation.lat);
                var radial_polygon = new OpenLayers.Feature.Vector(EB_View.universe.openlayers.tool.createGeodesicPolygon(lonlat,radius+"",40,45,this.map.getProjectionObject()));
                radial_polygon.data.submit = true;
                this.features.push(radial_polygon);
                this.map.setCenter(lonlat.transform(this.modelData.latlon_proj,this.map.getProjectionObject()));
                this.modelData.tempStorage.layers.polygonsLayer.addFeatures(this.features);
                EB_View.universe.openlayers.tool.zoomToFeatureExtent(this.map,this.features || []);
            }
        },
        CLASS_NAME: "OpenLayers.Control.SearchLocation"
    };
    view.universe.openlayers.controls.PolygonTools={
        activate: function() {
            this.openControl();
        },
        deactivate: function() {
            this.closeControl();
            if(this.view){
                this.view.$("div.on").removeClass("on");
            }
            this.activateFilteredPointsAndNetworkPolygonsController(true);
            for (var key in this.featureControls) {
                this.featureControls[key].deactivate();
            }
        },
        initialize: function(options) {
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.modelData = this.universeApp.model.toJSON();
        },
        draw: function() {
            EB_View.universe.openlayers.controls.BaseDialogControl.draw.apply(this);
            var control = this;
            var options = {
                container:this.div,
                control:this,
                clickFeatureControlCallBack:function(jdom){
                    control.toggleControl(jdom);
                },
                clickPaintbrushSizeCallBack:function(size){
                    control.changePaintbrushSize(size);
                }
            }
            this.view = EB_View.universe.apps.PolygonToolApp.getInstance(options);
            this.createBaseDialog(this.text);
            this.registEventFromMap();
        },
        changePaintbrushSize:function(size){
            var control = this.featureControls['paintbrush'];
            control.handler.radius = 10*parseFloat(size);
        },
        toggleControl:function(jElement) {
            var action = jElement.attr("action");
            if(this.featureControls[action].active){
                this.activateFilteredPointsAndNetworkPolygonsController(true);
                this.featureControls[action].deactivate();
                jElement.removeClass("on");
                return;
            }
            this.activateFilteredPointsAndNetworkPolygonsController(false);
            jElement.addClass("on");
            jElement.siblings().removeClass("on");
            for (var key in this.featureControls) {
                var control = this.featureControls[key];
                if ( action == key) {
                    control.activate();
                    EB_View.universe.openlayers.tool.topLayerIndex(this.modelData.tempStorage.layers.polygonsLayer);
                } else {
                    control.deactivate();
                }
            }
        },
        registEventFromMap:function(){
            this.modelData.tempStorage.layers.polygonsLayer.events.register("featureadded",this, this.addPolygonCallBack);
            this.modelData.tempStorage.layers.polygonsLayer.events.register("featuremodified",this, this.modifyPolygonCallBack);
            this.modelData.tempStorage.layers.polygonsLayer.events.register("featureremoved",this, this.removePolygonCallBack);
            var self =this,view = this.view;
            var featureAdded=function(feature){
                view.$("div.on").removeClass("on");
                self.activateFilteredPointsAndNetworkPolygonsController(true);
                for (key in self.featureControls) {
                    if(self.featureControls[key].active) {
                        self.featureControls[key].deactivate();
                    }
                }
                EB_View.universe.openlayers.tool.topMarkerLayers(feature.layer.map);
            };
            var options = {
                handlerOptions : {
                    freehand : true
                },
                featureAdded:featureAdded
            };
            this.featureControls = {
                freeform : new OpenLayers.Control.DrawFeature(this.modelData.tempStorage.layers.polygonsLayer, OpenLayers.Handler.Polygon, options),
//                paintbrush : new OpenLayers.Control.DrawFeature(this.modelData.tempStorage.layers.polygonsLayer, OpenLayers.Handler.Paintbrush, {handlerOptions: {freehand: true},featureAdded:featureAdded}),
                regular: new OpenLayers.Control.DrawFeature(this.modelData.tempStorage.layers.polygonsLayer, OpenLayers.Handler.Polygon, {handlerOptions: {freehand: false},featureAdded:featureAdded}),//
                circle: new OpenLayers.Control.DrawFeature(this.modelData.tempStorage.layers.polygonsLayer, OpenLayers.Handler.RegularPolygon,{handlerOptions: {sides: 40},featureAdded:featureAdded}),
                rotate: new OpenLayers.Control.ModifyFeature(this.modelData.tempStorage.layers.polygonsLayer, {mode:OpenLayers.Control.ModifyFeature.ROTATE | OpenLayers.Control.ModifyFeature.RESIZE}),
                reshape:new OpenLayers.Control.ModifyFeature(this.modelData.tempStorage.layers.polygonsLayer, {mode:OpenLayers.Control.ModifyFeature.RESHAPE}),
                drag : new OpenLayers.Control.ModifyFeature(this.modelData.tempStorage.layers.polygonsLayer,{mode:OpenLayers.Control.ModifyFeature.DRAG,vertexRenderIntent:"point"}),
                remove:new OpenLayers.Control.RemoveFeature(this.modelData.tempStorage.layers.polygonsLayer)
            };
            //cache the select control of filtered contactpoints
            this.filteredPointsAndNetworkPolygonsController = this.map.getControl('control_for_searchContact_filteredPoints_and_widget_networkPolygons');
            for ( var key in this.featureControls) {
                this.map.addControl(this.featureControls[key]);
            }
        },
        activateFilteredPointsAndNetworkPolygonsController:function(isActive){
            if(!this.filteredPointsAndNetworkPolygonsController) return;
            if(isActive){
                if (!this.filteredPointsAndNetworkPolygonsController.active){
                    this.filteredPointsAndNetworkPolygonsController.handlers.feature.stopDown = false;
                    this.filteredPointsAndNetworkPolygonsController.handlers.feature.stopClick = false;
                    this.filteredPointsAndNetworkPolygonsController.activate();
                }
            }else{
                this.filteredPointsAndNetworkPolygonsController.deactivate();
            }

        },
        addPolygonCallBack:function(obj){
            EB_Common.logger.log(obj.feature);
            var components = obj.feature.geometry.components;
            if(components){
                var feature= obj.feature;
                if(!feature.geometry.getArea()>0){
                    return;
                }
                this.modelData.tempStorage.gisPolygons[feature.id]=components[0];
                this.modelData.tempStorage.gisPolygons[feature.id].polygonType= feature.polygonType ? feature.polygonType : "include";
                this.modelData.tempStorage.gisPolygons[feature.id].polygonName=i18n["universe.control.selectedcontacts.polygonNamePrefix"];
                this.modelData.tempStorage.gisPolygons[feature.id].feature=feature;
                var submit = feature.data.submit;
                if(submit == undefined){
                    submit = true;
                }
                if(submit){
                    this.modelData.tempStorage.controls.everbridgeSearchContact.submitSearchContactNumByPolygons();
                }
            }
            //var vertices = feature.geometry.clone().getVertices();
            var vertices = feature.geometry.clone().components[0].components;
            var vert_array = [];
            for (var i=0; i < vertices.length; ++i) {
                var lonLat = new OpenLayers.LonLat( vertices[i].x ,vertices[i].y ).transform(this.modelData.spherical_mercator_proj,this.modelData.latlon_proj);
                vert_array.push({x: lonLat.lon, y: lonLat.lat});
                EB_Common.logger.log(vertices[i].x +","+ vertices[i].y+"==="+ lonLat.lon +","+ lonLat.lat);
            }

            var data = {} || {};
            var num_contacts = 0;
            data.vertices = EB_Common.json.stringify(vert_array);
            data.orgId = $("#map").attr("data-orgId");
            EB_Common.logger.log(this.modelData.tempStorage.gisPolygons);
        },
        modifyPolygonCallBack:function(obj){
            EB_Common.logger.log(obj.feature);
            var components = obj.feature.geometry.components;
            if(components)
                this.modelData.tempStorage.gisPolygons[obj.feature.id]=components[0];
            EB_Common.logger.log(this.modelData.tempStorage.gisPolygons);
            this.modelData.tempStorage.controls.everbridgeSearchContact.submitSearchContactNumByPolygons();
        },
        removePolygonCallBack:function(obj){
            EB_Common.logger.log(obj.feature);
            var polygon = this.modelData.tempStorage.gisPolygons[obj.feature.id]
            if(polygon){
                var isSubmit = obj.feature.data.submit;
                delete this.modelData.tempStorage.gisPolygons[obj.feature.id];
                if(isSubmit!==true){
                    return;
                }
                EB_Common.logger.log(this.modelData.tempStorage.gisPolygons);
                this.modelData.tempStorage.controls.everbridgeSearchContact.submitSearchContactNumByPolygons();
            }
        },
        CLASS_NAME: "OpenLayers.Control.PolygonTools"
    };
    view.universe.openlayers.controls.SelectedContacts={
        activate: function() {
            if(this.ajaxRqeust){
                this.ajaxRqeust.abort();
            }
            var params = $.extend(true,{},this.modelData.tempStorage.controls.everbridgeSearchContact.lastSearchParams);
            if(!params.polygons) return;
            this.openControl();
            if(params.contactSearchCondition){
                params.contactSearchCondition = JSON.stringify(params.contactSearchCondition);
            }
            if(this.view && this.view.model.set({load:false},{silent:true})){
                this.ajaxRqeust = this.view.model.fetch({
                    data:params,
                    type:"post"
                });
            }
        },
        deactivate: function() {
            this.removeHighlights();
            this.closeControl();
        },
        initialize: function(options) {
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.modelData = this.universeApp.model.toJSON();
        },
        draw: function() {
            EB_View.universe.openlayers.controls.BaseDialogControl.draw.apply(this);
            var control = this;
            var options = {
                container:this.div,
                control:this,
                url:EB_Common.Ajax.wrapperUrl("/universe/fetchPolygonCounts"),
                polygonTypeChangeCallBack:function(featureId,isInclude){
                    control.polygonTypeChangeCallBack(featureId,isInclude);
                },
                polygonRemoveCallBack:function(featureIds){
                    control.polygonRemoveCallBack(featureIds);
                },
                saveRegionCallBack:function(){
                    control.modelData.tempStorage.controls.everbridgeRegionLibrary.load && control.modelData.tempStorage.controls.everbridgeRegionLibrary.view.reload();
                }
            }
            this.view = EB_View.universe.apps.SelectedContactsApp.getInstance(options);
            this.createBaseDialog(this.text);
        },
        polygonTypeChangeCallBack:function(featureId,isInclude){
            this.modelData.tempStorage.gisPolygons[featureId].polygonType = isInclude?"include":"exclude";
            if (!this.modelData.tempStorage.layers.polygonsLayer) {return null;}
            var feature = this.modelData.tempStorage.layers.polygonsLayer.getFeatureById(featureId);  //returned object (feature) of type "OpenLayers.Feature.Vector"
            var current_style = feature.style;
            var polygon_style = {} || {};
            if (isInclude) {
                polygon_style.fillColor=this.modelData.polyFillColorDef;
            }else{
                polygon_style.fillColor=this.modelData.polyFillColorExclude;
            }
            var style = null;
            if(EB_Common.browser.versions.handleDevice){
                polygon_style.strokeWidth=2;
            }
            if (current_style == null) {
                style = OpenLayers.Util.applyDefaults(polygon_style, OpenLayers.Feature.Vector.style["default"]);
            } else {
                style = OpenLayers.Util.applyDefaults(polygon_style, current_style);
            }
            feature.style = style;
            this.modelData.tempStorage.layers.polygonsLayer.redraw();
            this.modelData.tempStorage.controls.everbridgeSearchContact.submitSearchContactNumByPolygons();
        },
        polygonRemoveCallBack:function(featureIds){
            var control = this;
            if(featureIds===undefined){
                this.modelData.tempStorage.gisPolygons = {};
                this.modelData.tempStorage.layers.polygonsLayer.removeAllFeatures();
                this.modelData.tempStorage.controls.everbridgeSelectedContacts.deactivate();
                this.modelData.tempStorage.controls.everbridgeSearchContact.submitSearchContactNumByPolygons();
            }else{
                var features = [],len = featureIds.length;
                $.each(featureIds,function(i,id){
                    var removeFeature = control.modelData.tempStorage.layers.polygonsLayer.getFeatureById(id);
                    if(removeFeature){
                        removeFeature.data.submit=(i==0);
                        features.push(removeFeature);
                    }
                })
                this.modelData.tempStorage.layers.polygonsLayer.removeFeatures(features);
                this.modelData.tempStorage.layers.polygonsLayer.redraw();
            }
        },
        removeHighlights: function() {
            //Remove all polygon highlighting
            var features = this.modelData.tempStorage.layers.polygonsLayer.features;
            if (features) {
                for (var i = 0; i<features.length; i++) {
                    var feature = features[i];
                    var current_style = feature.style;
                    if  (current_style && current_style.strokeWidth == this.modelData.polyStrokeWidthHighlight) {
                        var style = OpenLayers.Util.applyDefaults({strokeWidth: this.modelData.polyStrokeWidthDef}, current_style);
                        feature.style = style;
                    }
                }
            }
            this.modelData.tempStorage.layers.polygonsLayer.redraw();
        },
        CLASS_NAME: "OpenLayers.Control.SelectedContacts"
    };
    view.universe.openlayers.controls.ExcludeContacts = {
        activate: function() {
            this.openControl();
        },
        deactivate: function() {
            this.closeControl();
        },
        initialize: function(options) {
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.modelData = this.universeApp.model.toJSON();
        },
        draw: function() {
            EB_View.universe.openlayers.controls.BaseDialogControl.draw.apply(this);
            var control = this;
            var options = {
                container:this.div,
                control:this,
                excludedContactIdsChangeCallBack:function(){
                    control.modelData.tempStorage.controls.everbridgeSearchContact.submitSearchContactNumByPolygons();
                }
            }
            this.view = EB_View.universe.apps.ExcludeContactApp.getInstance(options);
            this.createBaseDialog(this.title);
        },
        getExcludedContactIds:function(){
            if(!this.view) return [];
            return this.view.model.get("excludedContactIds") || [];
        },
        CLASS_NAME:"OpenLayers.Control.ExcludeContacts"
    };
    view.universe.UniverseApp={
        UniverseAppModel:{
            defaults:function(){
                return {
                    load:false,
                    scheme:"",
                    thresholdSearchedContact: 10000,
                    defaultZoomLevel:0,
                    defaultCenterLat:null,
                    defaultCenterLon:null,
                    latlon_proj:new OpenLayers.Projection("EPSG:4326"),
                    spherical_mercator_proj:new OpenLayers.Projection("EPSG:900913"),
                    regionLibraryNameDisplayLengthMax:40,
                    regionLibraryFolder:"",
                    regionLibraryRegion:"",
                    eb_zoom_level_to_real : {0: 3, 1: 5,2: 7,3: 9,4: 11, 5: 13, 6: 15, 7:17},
                    real_zoom_level_to_eb : {3: 0,5: 1,7: 2,9: 3,11: 4, 13: 5, 15: 6, 17: 7},
                    next_zoom_level : {0: 3,1: 3,2: 3,3: 5,4: 5,5: 7,6: 7,7: 9,8: 9,9: 11,10: 11,11: 13,12: 13,13: 15,14: 15,15: 17,16: 17,17: 17,18: 17,19: 17},
                    previous_zoom_level : {0: 3,1: 3,2: 3,3: 3,4: 3,5: 3,6: 5,7: 5,8: 7,9: 7,10: 9,11: 9, 12: 11,13: 11,14: 13,15: 13,16: 15,17: 15,18: 17,19: 17},
                    default_server_resolutions : [156543.03390625,78271.516953125, 39135.7584765625, 19567.87923828125,9783.939619140625, 4891.9698095703125,2445.9849047851562,1222.9924523925781, 611.4962261962891,305.74811309814453,152.87405654907226,76.43702827453613,38.218514137268066,19.109257068634033,9.554628534317017,4.777314267158508,2.388657133579254,1.194328566789627,0.5971642833948135],
                    baseLayers:null, /*get data from server*/
                    contactRecordTypeLayers:null, /*get data from server*/
                    filterLayers:null, /*get data from server*/
                    displayLayers:null, /*get data from server*/
                    regionLibrary:[],
                    polyFillColorDef : '#ee9900',
                    polyFillColorExclude : '#4b62bf',
                    polyStrokeWidthDef : 1,
                    polyStrokeWidthHighlight : 4,
                    //temporary storage
                    tempStorage:{
                        selectedData:{},
                        shapesCount:0,
                        gisPanelControl:null,
                        controls:{},
                        layers:{},
                        xyzLayers:[],
                        gisPolygons:{}
                    }
                }
            },
            initialize:function(){
                if(arguments && arguments.length>1 && arguments[1].url){
                    this.urlRoot = arguments[1].url
                }
            },
            parse:function(response){
                EB_Common.logger.log("universe data");
                EB_Common.logger.log(response);
                var universe = response || {};
                universe.load = true;
                return universe;
            }
        },
        UniverseAppView:{
            map:null,
            subApps:{},
            jDom:{},
            initialize:function () {
                $.templates({
                    universeAppTemplate: $("#universeAppTemplate").html()
                });
                this.universeAppTemplate = $.render.universeAppTemplate;
                this.model.on("change:load",this.render,this);
                if(this.model.urlRoot){
                    this.model.fetch();
                }else{
                    this.render();
                }
            },
            render:function(){
                this.model.set("isDialog",this.options.isDialog);
                if(this.options.originalGisData){
                    var tempStorage = this.model.get("tempStorage");
                    tempStorage.selectedData = this.options.originalGisData;
                    this.model.set("tempStorage",tempStorage);
                }
                this.$el.html(this.universeAppTemplate(this.getIdSuffixModelJSON()));
                if(this.options.isDialog){
                    this.height =  $(window).height();
                    this.width = $(window).width()-200;
                    this.jDom.map = this.$("#map").height(this.height-60).width(this.width-20);
                    this.dialog();
                }else{
                    if(this.options.initMapSize){
                        this.width =this.options.initMapSize.w;
                        this.height =this.options.initMapSize.h;
                        this.jDom.map = this.$("#map").height(this.height).width(this.width);
                    }
                    this.openCallBack();
                }
                this.options.loadSuccess&&this.options.loadSuccess.apply(this);
                return this;
            },
            adjustMapWidth:function(w){
                this.jDom.map.width(w);
                this.map.updateSize();
            },
            adjustMapHeight:function(h){
                this.jDom.map.height(h);
            },
            events:function(){
                var events = {
//                    "click #contactNavContainer>div":"openSelectDialog"
                }
                return this.dealEvents(events,this.cid);
            },
            openCallBack:function(){
                if(this.hadLoad) return;
                this.loadLayers();
                this.loadControls();
                this.loadContactSearchConditionData();
                this.loadFilterRulesData();
                this.loadPolygonsData();
                this.hadLoad = true;
            },
            dialog:function(){
                var universeApp = this;
                this.$el.dialog({
                    autoOpen : false,
                    title : i18n["notification.title.contact"],
                    width :universeApp.width,
                    height :universeApp.height,
                    modal : true,
                    resizable : false,
                    open:function(){
                        universeApp.openCallBack();
                    },
                    close: function(event, ui) {
                        if(event.bubbles){
                        }
                    }
                });
            },
            closeDialog:function(){
                this.$el.dialog("close");
            },
            syncData:function(){
                var tempStorage = this.model.get("tempStorage");
                //get the paramers of control "everbridgeSearchContact"
                var searchedContactParams=tempStorage.controls.everbridgeSearchContact.lastSearchParams;
                //get the data of control "everbridgeExcludeContacts"
                var excludedContactIds = tempStorage.controls.everbridgeExcludeContacts.getExcludedContactIds();
                searchedContactParams.excludedContactIds =excludedContactIds;
                tempStorage.selectedData =  $.extend(true,{},searchedContactParams);
                this.selectButtonCallBack(tempStorage.shapesCount);
            },
            selectButtonCallBack:function(num){
                this.options.selectButtonCallBack && this.options.selectButtonCallBack.call(this,num);
            },
            newNotificationButtonCallBack:function(){
                this.options.newNotificationButtonCallBack && this.options.newNotificationButtonCallBack.call(this);
            },
            loadContactSearchConditionData:function(){
                var modelData = this.model.toJSON();
                var storage = modelData.tempStorage;
                var originalData = storage.selectedData;
                if(originalData.contactSearchCondition){
                    var groupIds = originalData.contactSearchCondition.groupIds || [];
                    if(groupIds && groupIds.length){
                        storage.controls.everbridgeContactsLayerSwitcher.view.model.set("groupIds",groupIds);
                    }
                    var filterIds = originalData.contactSearchCondition.filterIds || [];
                    if(filterIds && filterIds.length){
                        storage.controls.everbridgeContactsLayerSwitcher.view.model.set("filterIds",filterIds);
                    }
                    if(!groupIds.length && !filterIds.length){
                        var filters =  originalData.contactSearchCondition.filters || [];
                        var recordTypeIds = [];
                        $.each(filters,function(i,filter){
                            var rules = filter;
                            $.each(rules,function(j,rule){
                                if(rule.columnName=="recordTypeId"){
                                    recordTypeIds.push(rule.columnValue);
                                }
                            });
                        });
                        if(recordTypeIds.length){
                            storage.controls.everbridgeContactsLayerSwitcher.view.model.set("recordTypeIds",recordTypeIds);
                        }
                    }
                }
            },
            loadFilterRulesData:function(){
                var modelData = this.model.toJSON();
                var storage = modelData.tempStorage;
                var originalData = storage.selectedData;
                if(originalData.filterRules){
                    storage.controls.everbridgeSearchContact.filterRules = originalData.filterRules;
                    var filterRules = $.parseJSON(originalData.filterRules);
                    storage.controls.everbridgeSearchContact.view.model.set({"filterRules":filterRules},{silent:true});
                }
            },
            loadPolygonsData:function(){
                var modelData = this.model.toJSON();
                var storage = modelData.tempStorage;
                var originalData = storage.selectedData;
                var searchShapes = [], polygons = originalData.polygons,polygonIsIncludes= originalData.polygonIsIncludes,excludedContactIds = originalData.excludedContactIds || [];
                storage.controls.everbridgeSearchContact.lastSearchParams=originalData;
                if(polygons){
                    polygons = $.parseJSON(polygons);
                    if(polygonIsIncludes){
                        polygonIsIncludes = $.parseJSON(polygonIsIncludes);
                    }
                    $.each(polygons,function(i,polygon){
                        searchShapes.push({"polygon":polygon,isInclude:(polygonIsIncludes[i])});
                    });
                }else{
                    return;
                }
                var polygonFeatures = EB_View.universe.openlayers.tool.analysisSearchShapes(searchShapes,modelData.latlon_proj,this.map.getProjectionObject(),modelData.polyFillColorDef,modelData.polyFillColorExclude);
                storage.layers.polygonsLayer.addFeatures(polygonFeatures);
                storage.layers.polygonsLayer.redraw();

                storage.controls.everbridgeExcludeContacts.view.model.set({"excludedContactIds":excludedContactIds,"isSubmit":false});
                storage.controls.everbridgeSearchContact.submitSearchContactNumByPolygons();
                return polygonFeatures.length;
            },
            loadLayers:function () {
                var modelData = this.model.toJSON();
                this.overWriteLayer();
                var layers=[];
                var baseLayerResult = this.loadBaseLayers();
                var baseLayers = baseLayerResult.baseLayers;
                var defaultBaseLayer = baseLayerResult.defaultBaseLayer;
                var utf_added = baseLayerResult.utf_added;
                layers = layers.concat(baseLayers);
                var mapOption={
                    maxExtent: new OpenLayers.Bounds(-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892),
                    div: "map"+this.cid,
                    allOverlays: false,
                    theme:"",
                    controls:[],
                    layers: layers,
                    center: new OpenLayers.LonLat(modelData.defaultCenterLon, modelData.defaultCenterLat).transform(modelData.latlon_proj, modelData.spherical_mercator_proj),
                    zoom: modelData.eb_zoom_level_to_real[modelData.defaultZoomLevel],
                    units: 'mi',    //important: if this is changed, then must modify calculation in SearchLocation.showData.loadComplete
                    numZoomLevels:19,
                    projection: modelData.spherical_mercator_proj
                };
                this.map = new OpenLayers.Map(mapOption);
                this.map.setBaseLayer(defaultBaseLayer);
                this.support_utf_layer();
            },
            loadBaseLayers:function(){
                var modelData = this.model.toJSON();
                var universeApp = this;
                var layers_obj = modelData.baseLayers||[];
                var xyzLayers = modelData.tempStorage.xyzLayers;
                var utf_added = false,kml_registrations = [],layers = [],vlayer = new OpenLayers.Layer.Vector("Editable", {displayInLayerSwitcher: false});
                layers.push(vlayer);
                var center = [0,0],defaultBaseLayer = null;
                for (var i=0; i<layers_obj.length; ++i) {
                    var layer_obj = layers_obj[i];
                    if (layer_obj.type == ("GMAP")) {
                        if((!window.google)|| (!window.google.maps)||(!window.google.maps.MapTypeId)) continue;
                        if (layer_obj.provider && layer_obj.provider.parameters && layer_obj.provider.parameters.type) {
                            var type = null;
                            switch (layer_obj.provider.parameters.type) {
                                case "street" : type = window.google.maps.MapTypeId.ROADMAP; break;
                                case "terrain" :type = window.google.maps.MapTypeId.TERRAIN; break;
                                case "hybrid" : type = window.google.maps.MapTypeId.HYBRID; break;
                                case "satellite" : type = window.google.maps.MapTypeId.SATELLITE;
                            };
                            if(type){
                                var glayer = new OpenLayers.Layer.Google(layer_obj.description, {
                                    'type': type, 'isBaseLayer': layer_obj.baseLayer, 'buffer': 1, 'visibility': layer_obj.visible, 'animationEnabled' : false,'displayOutsideMaxExtent': false, 'wrapDateLine': false
                                });
                                layers.push(glayer);
                            }
                        }
                    } else if (layer_obj.type == "OSM") {
                        layers.push(new OpenLayers.Layer.OSM(null, null, {'visibility': layer_obj.visible}));
                    } else if (layer_obj.type == "ESRI") {
                        center = layer_obj.bounds.center;
                        if (layer_obj.provider && layer_obj.provider.parameters && layer_obj.provider.parameters.url) {
                            EB_Common.logger.log(layer_obj.visible);
                            EB_Common.logger.log(layer_obj.provider.parameters.url);
                            layers.push(new OpenLayers.Layer.XYZ(layer_obj.description, layer_obj.provider.parameters.url,
                                {'sphericalMercator':true, 'buffer': 1, 'isBaseLayer': layer_obj.baseLayer, 'visibility': layer_obj.visible})
                            );
                        }
                    } else if (layer_obj.type == "BING") {
                        if (layer_obj.provider && layer_obj.provider.parameters && layer_obj.provider.parameters.key) {
                            layers.push(new OpenLayers.Layer.Bing({'isBaseLayer': layer_obj.baseLayer, 'key': layer_obj.provider.parameters.key, 'visibility': layer_obj.visible}));
                        }
                    }else if (layer_obj.type === 'KML') {
                        EB_Common.logger.log("KML url is " + layer_obj.url);
                        kml_registrations.push(layer_obj);
                    }
                    // Identify the default base map layer for initial load
                    if (layer_obj.visible && layer_obj.baseLayer) {
                        defaultBaseLayer = layers[layers.length-1];
                    }
                }
                EB_Common.logger.log(layers);
                return {
                    baseLayers:layers,
                    defaultBaseLayer:defaultBaseLayer,
                    utf_added:utf_added
                }
            },
            loadOverLayersCount:function(){
                this.model.set("groupLayers",[]);
                var view = this, modelData = this.model.attributes;
                var contactFilters = modelData.contactFilters;
                var contactRecordTypeLayers = modelData.contactRecordTypeLayers || [];
                var recordTypeLayers = modelData.recordTypeLayers=[];
                var groupLayers = modelData.groupLayers  || [];
                var filterLayers = modelData.filterLayers  || [];
                var displayLayers = modelData.displayLayers  || [];
                var contactsLayersCount = 0;
                $.each(contactRecordTypeLayers,function(i,layer){
                    if(layer.groupId){
                        layer.visible = !modelData.isShowAllContacts;
                        groupLayers.push(layer);
                    }else{
                        recordTypeLayers.push(layer);
                    }
                    contactsLayersCount++;
                });
                $.each(filterLayers,function(i,layer){
                    layer.visible = false;
                    $.each(contactFilters,function(j,filter){
                        if(filter.id==layer.sourceId){
                            filter.layers = filter.layers || [];
                            filter.layers.push(layer);
                            contactsLayersCount++;
                        }
                    });
                });
                $.each(displayLayers,function(i,layer){
                    layer.visible = false;
                    contactsLayersCount++;
                });
//                return contactsLayers;
                return contactsLayersCount;
            },
            support_utf_layer:function() {
                var universeApp = this,modelData = universeApp.model.toJSON();
                var click_callback = function(infoLookup, loc, pixel) {
                    var popups = this.map.popups,popupsLen = this.map.popups.length;
                    for(var i = 0;i<popupsLen;i++) {
                        popups[i].hide();
                    }
                    if (infoLookup) {
                        var layers = this.map.layers;
                        for (var idx in infoLookup) {
                            // idx can be used to retrieve layer from map.layers[idx]
                            var layer = layers[parseInt(idx)];
                            if(!layer.visibility){
                                continue;
                            }
                            var info = infoLookup[idx];
                            if (info && info.data) {
                                if(info.utf_popup){
                                    info.utf_popup.show();
                                    break;
                                }
                                EB_Common.logger.log(loc);
                                EB_Common.Ajax.get("/universe/showContact/" + info.data.id + "/" + info.data.address + "/", function(data) {
                                    EB_Common.logger.log(data);
                                    var lonlat = loc;
                                    if(data.status){
                                        var lat = data.contactAddress.gisLocation.lat;
                                        var lon = data.contactAddress.gisLocation.lon;
                                        lonlat= new OpenLayers.LonLat( lon ,lat ).transform(modelData.latlon_proj,universeApp.map.getProjectionObject());
                                    }
                                    var utf_popup=EB_View.universe.openlayers.tool.createPopupForUniverse(modelData.tempStorage.layers.markersLayer,lonlat,EB_View.universe.openlayers.tool.AutoSizeFramedCloudMaxSize,data.address);
                                    if(info){
                                        info.utf_popup = utf_popup;
                                    }
                                    if(utf_popup){
                                        universeApp.map.addPopup(utf_popup);
                                    }
                                });
                                break;
                            }
                        }
                    }
                };
                var hover_callback = function(infoLookup, loc, pixel) {
                    var layers = this.map.layers;
                    for (var idx in infoLookup) {
                        var layer = layers[parseInt(idx)];
                        if(!layer.visibility){
                            continue;
                        }
                        var info = infoLookup[idx];
                        if (info && info.data) {
                            universeApp.jDom.map.attr("class", "largemap hoverHands");
                            break;
                        } else{
                            universeApp.jDom.map.attr("class", "largemap");
                        }
                    }
                };
                this.map.addControl(
                    new OpenLayers.Control.UTFGrid({
                        callback: click_callback,
                        handlerMode: "click"
                    })
                );
                this.map.addControl(
                    new OpenLayers.Control.UTFGrid({
                        callback: hover_callback,
                        handlerMode: "move"
                    })
                );
            },
            overWriteLayer:function(){
                var modelData = this.model.toJSON();
//                modelData.scheme = "https";
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
                OpenLayers.Util.extend(OpenLayers.Layer.UTFGrid.prototype,{
                    getFeatureInfo: function(location) {
                        var info = null;
                        var tileInfo = this.getTileData(location);
                        if (tileInfo && tileInfo.tile) {
                            info = tileInfo.tile.getFeatureInfo(tileInfo.i, tileInfo.j);
                        }
                        return info;
                    },
                    getFeatureId: function(location) {
                        var id = null;
                        var info = this.getTileData(location);
                        if (info && info.tile) {
                            id = info.tile.getFeatureId(info.i, info.j);
                        }
                        return id;
                    }
                });
                OpenLayers.Util.extend(OpenLayers.Tile.UTFGrid.prototype,{
                    draw: function() {
                        var drawn = OpenLayers.Tile.prototype.draw.apply(this, arguments);
                        if (drawn) {
                            if (this.isLoading) {
                                this.abortLoading();
                                this.events.triggerEvent("reload");
                            } else {
                                this.isLoading = true;
                                this.events.triggerEvent("loadstart");
                            }
                            this.url = this.layer.getURL(this.bounds);
                            if (this.layer.useJSONP) {
                                // Use JSONP method to avoid xbrowser policy
                                var ols = new OpenLayers.Protocol.Script({
                                    url: this.url,
                                    callback: function(response) {
                                        this.isLoading = false;
                                        if(this.events){
                                            this.events.triggerEvent("loadend");
                                        }
                                        this.json = response.data;
                                    },
                                    scope: this
                                });
                                ols.read();
                                this.request = ols;
                            } else {
                                // Use standard XHR
                                this.request = OpenLayers.Request.GET({
                                    url: this.url,
                                    callback: function(response) {
                                        this.isLoading = false;
                                        if(this.events)
                                            this.events.triggerEvent("loadend");
                                        if (response && response.status === 200) {
                                            this.parseData(response.responseText);
                                        }
                                    },
                                    scope: this
                                });
                            }
                        } else {
                            this.unload();
                        }
                        return drawn;
                    }
                });
            },
            loadControls:function(){
                var universeApp = this;
                var modelData = this.model.toJSON();
                //openlayer default========{BaseLayer: 100,Control: 1000,Feature: 725,Overlay: 325,Popup: 750}
                if(modelData.isDialog){
                    universeApp.map.Z_INDEX_BASE.Control = 2400;
                }
                var overLayersCount = this.loadOverLayersCount();
                universeApp.map.Z_INDEX_BASE.Feature = overLayersCount*2*5+500;
                universeApp.map.Z_INDEX_BASE.Popup = overLayersCount*2*5+1000;

                OpenLayers.Util.onImageLoadErrorColor = "transparent";
                //universe control.
                OpenLayers.Control.GisPanel = OpenLayers.Class(OpenLayers.Control, $.extend({},EB_View.universe.openlayers.controls.GisPanel));
                OpenLayers.Control.BaseDialogControl = OpenLayers.Class(OpenLayers.Control, $.extend({},EB_View.universe.openlayers.controls.BaseDialogControl));
                OpenLayers.Control.RemoveFeature = OpenLayers.Class(OpenLayers.Control, $.extend({},EB_View.universe.openlayers.controls.RemoveFeature));
                OpenLayers.Control.BaseMapLayerSwitcher = OpenLayers.Class(OpenLayers.Control.BaseDialogControl, $.extend({},EB_View.universe.openlayers.controls.BaseMapLayerSwitcher));
                OpenLayers.Control.DisplayLayerSwitcher = OpenLayers.Class(OpenLayers.Control.BaseDialogControl, $.extend({},EB_View.universe.openlayers.controls.DisplayLayerSwitcher));
                OpenLayers.Control.ContactsLayerSwitcher = OpenLayers.Class(OpenLayers.Control.BaseDialogControl, $.extend({},EB_View.universe.openlayers.controls.ContactsLayerSwitcher));
                OpenLayers.Control.SearchContact = OpenLayers.Class(OpenLayers.Control.BaseDialogControl, $.extend({},EB_View.universe.openlayers.controls.SearchContact));
                OpenLayers.Control.RegionLibrary = OpenLayers.Class(OpenLayers.Control.BaseDialogControl, $.extend({},EB_View.universe.openlayers.controls.RegionLibrary));
                OpenLayers.Control.SearchLocation = OpenLayers.Class(OpenLayers.Control.BaseDialogControl, $.extend({},EB_View.universe.openlayers.controls.SearchLocation));
                OpenLayers.Control.PolygonTools = OpenLayers.Class(OpenLayers.Control.BaseDialogControl, $.extend({},EB_View.universe.openlayers.controls.PolygonTools));
                OpenLayers.Control.SelectedContacts = OpenLayers.Class(OpenLayers.Control.BaseDialogControl, $.extend({},EB_View.universe.openlayers.controls.SelectedContacts));
                OpenLayers.Control.ExcludeContacts = OpenLayers.Class(OpenLayers.Control.BaseDialogControl, $.extend({},EB_View.universe.openlayers.controls.ExcludeContacts));
                modelData.tempStorage.layers.markersLayer = new OpenLayers.Layer.Markers("MarkersLayer");
                modelData.tempStorage.layers.widgetMarkersLayer = new OpenLayers.Layer.Markers("WidgetMarkersLayer");
                var filteredPointsAndNetworkPolygonsLayerContext = {
                    getColor: function(feature){
                        if(feature.cluster && feature.cluster.length>0){
                            return feature.cluster[0].contactRecordType.fillColor;
                        }else{
                            return feature.contactRecordType.fillColor;
                        }
                    }
                };
                modelData.tempStorage.layers.filteredPointsAndNetworkPolygonsLayer = new OpenLayers.Layer.Vector(
                    "FilteredPointsAndNetworkPolygonsLayer",
                    {
                        styleMap: new OpenLayers.StyleMap({
                            "default": new OpenLayers.Style({
                                graphicName:"circle",
                                pointRadius: 2.5,
                                fillColor: "#ee9900",
                                fillOpacity: 0.6,
                                strokeColor: "#ee9900",
                                strokeWidth: 2,
                                strokeOpacity: 1,
                                graphicZIndex: 1
                            }, {
                                context: filteredPointsAndNetworkPolygonsLayerContext
                            }),
                            "select": {
                                cursor: "pointer",
                                strokeWidth: 1,
                                strokeOpacity: 1,
                                graphicZIndex: 1
                            }
                        }),
                        strategies: modelData.pointStrategy
                    }
                );
                var polygonLayer_style = null;
                if(EB_Common.browser.versions.handleDevice){
                    polygonLayer_style = new OpenLayers.StyleMap({
                        'point':OpenLayers.Util.applyDefaults({pointRadius: 20,strokeWidth: 2,fillColor: "#ffffff",strokeColor:"#000000",fillOpacity: 1},OpenLayers.Feature.Vector.style["default"]),
                        temporary: OpenLayers.Util.applyDefaults({pointRadius: 20}, OpenLayers.Feature.Vector.style.temporary),
                        'default': OpenLayers.Util.applyDefaults({pointRadius: 20,strokeWidth: 2}, OpenLayers.Feature.Vector.style['default']),
                        select: OpenLayers.Util.applyDefaults({fillColor:"blue",fillOpacity: 0.3,pointRadius: 20,strokeWidth: 2}, OpenLayers.Feature.Vector.style['default'])
                    })
                }else{
                    var polygonLayer_selectStyle = new OpenLayers.Style({fillColor:"blue",fillOpacity: 0.3});
                    var polygonLayer_pointStyle= OpenLayers.Util.applyDefaults({graphicName:"cross",fillColor: "#ffffff",strokeColor:"#000000",fillOpacity: 1},OpenLayers.Feature.Vector.style["default"]);
                    polygonLayer_style = new OpenLayers.StyleMap({'point':polygonLayer_pointStyle,'select': polygonLayer_selectStyle});
                }
                modelData.tempStorage.layers.polygonsLayer = new OpenLayers.Layer.Vector("PolygonsLayer",{styleMap:polygonLayer_style});
                universeApp.map.addLayers([
                    modelData.tempStorage.layers.polygonsLayer,
                    modelData.tempStorage.layers.filteredPointsAndNetworkPolygonsLayer,
                    modelData.tempStorage.layers.widgetMarkersLayer,
                    modelData.tempStorage.layers.markersLayer
                ]);

                universeApp.map.addControl(new OpenLayers.Control.TouchNavigation({
                    dragPanOptions: {
                        enableKinetic: true
                    }
                }));

                var  showFilteredPointsAndNetworkPolygonsInfo = function(e){
                    var feature = e.feature,featureType = feature.geometry.CLASS_NAME;//OpenLayers.Geometry.Point or OpenLayers.Geometry.Polygon;
                    var isPoint = featureType == 'OpenLayers.Geometry.Point';
                    var isPolygon = featureType == 'OpenLayers.Geometry.Polygon';
                    if(isPoint){
                        showFilteredPointsInfo(e,feature);
                    }else if(isPolygon){
                        showNetworkPolygonsInfo(e,feature);
                    }
                };
                var  showNetworkPolygonsInfo = function(e,feature) {
                    var layer = feature.layer,map = feature.layer.map,lonlat = feature.geometry.getBounds().getCenterLonLat(),len = map.popups.length;
                    if(e.type=="featurehighlighted"){
                        if(feature.popup){
                            if(!feature.popup.map){
                                feature.popup.map = map;
                            }
                            feature.popup.show();
                        }else{
                            feature.popup=EB_View.universe.openlayers.tool.createPopupForUniverse(layer,lonlat,EB_View.universe.openlayers.tool.AutoSizeFramedCloudMaxSize,feature.data.polygonInfo);
                            map.addPopup(feature.popup);
                            $(feature.popup.div).mouseleave(function(e){
                                feature.popup.mouseenter = false;
                                feature.popup.hide();
                            });
                            $(feature.popup.div).mouseenter(function(e){
                                feature.popup.mouseenter = true;
                                feature.popup.show();
                            });
                        }
                    }else if(e.type=="featureunhighlighted"){
                        if(feature.popup && !feature.popup.mouseenter){
                            feature.popup.hide();
                        }
                    }
                };
                var showFilteredPointsInfo=function(e,feature){
                    if(e.type=="featurehighlighted"){
                        if(feature.cluster){
                            if(feature.cluster.length>1){
                                feature.html = ["current area exist ",feature.cluster.length," contacts"].join("");
                            }else{
                                feature=feature.cluster[0];
                            }
                        }
                        if(!feature.popup){
                            var lonlat = new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y);
                            var popup = new OpenLayers.Popup.FramedCloud("chicken",lonlat,null,feature.html,null, false,false);
                            feature.popup = popup;
                            popup.positionBlocks["tl"].offset=new OpenLayers.Pixel(40, -4);
                            popup.positionBlocks["tr"].offset=new OpenLayers.Pixel(-40, -4);
                            popup.positionBlocks["bl"].offset=new OpenLayers.Pixel(40, 4);
                            popup.positionBlocks["br"].offset=new OpenLayers.Pixel(-40, 4);
                            universeApp.map.addPopup(feature.popup);
                        }else{
                            if(feature.popup)
                                feature.popup.show();
                        }
                    }else if(e.type=="featureunhighlighted"){
                        if(feature.cluster){
                            if(feature.cluster.length==1){
                                feature=feature.cluster[0];
                            }
                        }
                        if(feature.popup)
                            feature.popup.hide();
                    }
                };
                var filteredPointsAndNetworkPolygonsController = new OpenLayers.Control.SelectFeature(modelData.tempStorage.layers.filteredPointsAndNetworkPolygonsLayer, {
                    id:"control_for_searchContact_filteredPoints_and_widget_networkPolygons",
                    hover: true,
                    highlightOnly: true,
                    eventListeners: {
                        beforefeaturehighlighted: showFilteredPointsAndNetworkPolygonsInfo,
                        featurehighlighted: showFilteredPointsAndNetworkPolygonsInfo,
                        featureunhighlighted: showFilteredPointsAndNetworkPolygonsInfo
                    }
                });
                universeApp.map.addControl(filteredPointsAndNetworkPolygonsController);
                filteredPointsAndNetworkPolygonsController.activate();

                universeApp.map.addControl(new OpenLayers.Control.MousePosition({
                        formatOutput:function(lonLat){
                            lonLat =  new OpenLayers.LonLat( lonLat.lon ,lonLat.lat ).transform(modelData.spherical_mercator_proj,modelData.latlon_proj);
                            return lonLat.lon+","+lonLat.lat;
                        }
                    }
                ));
                var nav = new OpenLayers.Control.Navigation({zoomWheelEnabled: false});
                universeApp.map.addControl(nav);
                var zoom=new OpenLayers.Control.Zoom();
                zoom.onZoomClick = function(evt) {
                    EB_Common.logger.log(evt);
                    if (evt.buttonElement.hash == "#zoomIn") {
                        EB_View.universe.openlayers.tool.handleZoomIn(null,universeApp);
                    } else {
                        EB_View.universe.openlayers.tool.handleZoomOut(universeApp);
                    }
                    return false;
                };
                universeApp.map.addControl(zoom);
                //zoom - via mouse clicks
                OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control,EB_View.universe.openlayers.controls.Click);
                var zoomClick = new OpenLayers.Control.Click({universeApp:universeApp});
                universeApp.map.addControl(zoomClick);
                zoomClick.activate();
                //zoom - via mouse wheel
                OpenLayers.Control.MouseWheel = OpenLayers.Class(OpenLayers.Control, EB_View.universe.openlayers.controls.MouseWheel);
                var zoomWheel = new OpenLayers.Control.MouseWheel({universeApp:universeApp,'interval': 100, 'cumulative': false});
                universeApp.map.addControl(zoomWheel);
                zoomWheel.activate();
                var gisPanel = new OpenLayers.Control.GisPanel({universeApp:universeApp});
                modelData.tempStorage.gisPanelControl = gisPanel;
                universeApp.map.addControl(gisPanel);
                var subControls = [];
                var everbridgeSearchLocation = modelData.tempStorage.controls.everbridgeSearchLocation = new OpenLayers.Control.SearchLocation({universeApp:universeApp,title:i18n["universe.control.searchlocation"],text:i18n["universe.control.searchlocation"],placeholder:i18n["universe.findcontacts"]});
                subControls.push(everbridgeSearchLocation);
                var everbridgeSearchContact = modelData.tempStorage.controls.everbridgeSearchContact = new OpenLayers.Control.SearchContact({universeApp:universeApp,title:i18n["universe.control.searchcontact"],text:i18n["universe.control.searchcontact"]});
                subControls.push(everbridgeSearchContact);
                var everbridgePolygonTools = modelData.tempStorage.controls.everbridgePolygonTools = new OpenLayers.Control.PolygonTools({universeApp:universeApp,title:i18n["universe.control.polygontools"],text:i18n["universe.control.polygontools"],placeholder:i18n["universe.control.placeholder_highlightingcontacts"]});
                subControls.push(everbridgePolygonTools);
                var everbridgeRegionLibrary = modelData.tempStorage.controls.everbridgeRegionLibrary = new OpenLayers.Control.RegionLibrary({universeApp:universeApp,title:i18n["universe.control.regionlibrary"],text:i18n["universe.control.regionlibrary"]});
                subControls.push(everbridgeRegionLibrary);
                var everbridgeSelectedContacts = modelData.tempStorage.controls.everbridgeSelectedContacts = new OpenLayers.Control.SelectedContacts({universeApp:universeApp,title:i18n["universe.control.selectedcontacts"],text:(i18n["universe.control.selectedcontacts"]+'<span class="count"></span>'),displayInPanel:false});
                subControls.push(everbridgeSelectedContacts);
                var everbridgeExcludeContacts = modelData.tempStorage.controls.everbridgeExcludeContacts = new OpenLayers.Control.ExcludeContacts({universeApp:universeApp,title:i18n["universe.control.excludeContacts"],text:i18n["universe.control.excludeContacts"]+' (0)'});
                subControls.push(everbridgeExcludeContacts);

                var everbridgeDisplayLayerSwitcher = modelData.tempStorage.controls.everbridgeDisplayLayerSwitcher = new OpenLayers.Control.DisplayLayerSwitcher({universeApp:universeApp,title: i18n["setting.menu.gis.layer"], text:i18n["setting.menu.gis.layer"],placeholder:i18n["universe.maplayers"]});
                subControls.push(everbridgeDisplayLayerSwitcher);
                var everbridgeContactsLayerSwitcher = modelData.tempStorage.controls.everbridgeContactsLayerSwitcher = new OpenLayers.Control.ContactsLayerSwitcher({universeApp:universeApp,title:i18n["universe.contactslayers"], text: i18n["universe.contactslayers"]});
                subControls.push(everbridgeContactsLayerSwitcher);

                var everbridgeBaseMapLayerSwitcher = modelData.tempStorage.controls.everbridgeBaseMapLayerSwitcher = new OpenLayers.Control.BaseMapLayerSwitcher({universeApp:universeApp,title:i18n["universe.control.basemap"], text: i18n["universe.control.basemap"]});
                subControls.push(everbridgeBaseMapLayerSwitcher);


                gisPanel.addControls(subControls);
                EB_View.universe.openlayers.instance.everbridgeSearchContact=everbridgeSearchContact;
                EB_View.universe.openlayers.instance.everbridgeSelectedContacts=everbridgeSelectedContacts;
                EB_View.universe.openlayers.instance.everbridgeRegionLibrary=everbridgeRegionLibrary;
                EB_View.universe.openlayers.instance.everbridgeExcludeContacts=everbridgeExcludeContacts;
            },
            getData:function(){
                var data = this.model.toJSON();
                // There are dom element in the variable data,when copy it use $.extend will occured a bug in IE,
                // so use another method to resolute it .
                var data2 = {tempStorage:{}};
                for(var d in data){
                    if(d != "tempStorage"){
                        data2[d] = data[d];
                    }
                }
                data2.tempStorage.gisPanelControl = null;
                data2.tempStorage.gisPolygons = {};
                data2.tempStorage.layers = {};
                data2.tempStorage.controls = {};
                data2.tempStorage.xyzLayers = [];
                data2.tempStorage.shapesCount = data.tempStorage.shapesCount;
                data2.tempStorage.selectedData = $.extend(true,{},data.tempStorage.selectedData);
                var newData = $.extend(true,{},data2);
                return newData;
            }
        },
        getInstance:function(_options){
            var options = $.extend(true,{},_options||{});
            var Model = Backbone.Model.extend(this.UniverseAppModel);
            var universeAppModel = null;
            if(options.url){
                universeAppModel=new Model(null,{url:options.url});
            }else{
                universeAppModel=options.model;
            }
            var View = EB_Common.Backbone.View.extend(this.UniverseAppView);
            return new View({
                el:options.container,
                model:universeAppModel,
                originalGisData:options.originalGisData,
                selectButtonCallBack:options.selectButtonCallBack,
                newNotificationButtonCallBack:options.newNotificationButtonCallBack,
                isDialog:options.isDialog,
                initMapSize:options.initMapSize,
                loadSuccess:options.loadSuccess
            });
        }
    }
})(EB_View);