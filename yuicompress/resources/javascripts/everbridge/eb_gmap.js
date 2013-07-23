/**
 * google map
 * 
 * @author Linder Wang
 * @date : 2012-11-19
 */
(function(common) {
    //To prevent the cache
    google = null;
    
	$.extend(common, {
		// constructor for google map
		gmaps : function(config) {
			config = config || {};
	        this.settings = $.extend(true, {}, common.gmaps.defaults, config);
	        this.init();
		}
	});
	
    $.extend(common.gmaps, {
        defaults : {
            latitude : 37.09024,
            longitude : -95.712891,
            zoom : 15,//street level
            disableDefaultUI : true,
            panControl : true,
            zoomControl : true,
            latLngByCountry : {
            	'US' : {
            		latitude : 37.09024,
            		longitude : -95.712891
            	}
            },
            locale : {
            	country : i18n['contact.field.address.country'],
            	city : i18n['contact.field.address.city'],
            	state : i18n['contact.field.address.stateProvince'],
            	address : i18n['contact.field.address'],
            	postalCode : i18n['contact.field.address.postalCode'],
            	latitude : i18n['contact.field.address.gisLocation.lat'],
            	longitude : i18n['contact.field.address.gisLocation.lon'],
            	currentLocation : i18n['gmap.lable.currentLocation'],
            	limitedArea : i18n['gmap.info.limitedArea'],
            	loadMarkerFail : i18n['gmap.info.loadMarkerFail'],
            	loadMarkerError : i18n['gmap.info.loadMarkerError'],
            	confirmContent : i18n['gmap.info.confirmContent'],
            	selectedAddress : i18n['gmap.info.selectedAddress'],
            	confirmTitle : i18n['global.dialog.title.confirm'],
            	hints : i18n['gmap.info.hints']
            }
        },

        prototype : {
        
        	init : function(){
        		this.infoWindow = new google.maps.InfoWindow({
                    pixelOffset: new google.maps.Size(15,10)
                }); // info window object
				this.geocoder = new google.maps.Geocoder();
		        // Add an overlay that looks like a bubble for a marker
		        var locale = this.settings.locale;
        		//init template
        		var htmlTmpl = '<div>'
						+ '<fieldset class="infowindow-inner">'
						+	'<legend>' + locale.currentLocation + '</legend>'
						+   '<table>'
						+   '	<tr><td>' + locale.country + '</td><td>${country_name}</td></tr>'
						+   '	<tr><td>' + locale.city + '</td><td>${city}</td></tr>'
						+   '	<tr><td>' + locale.state + '</td><td>${state}</td></tr>'
						+   '	<tr><td>' + locale.address + '</td><td>${address}</td></tr>'
						+   '	<tr><td>' + locale.postalCode + '</td><td>${postalCode}</td></tr>'
						+   '	<tr><td>' + locale.latitude + '</td><td>${latitude}</td></tr>'
						+   '	<tr><td>' + locale.longitude + '</td><td>${longitude}</td></tr>'
						+   '</table>'
						+	'<input type="hidden" id="close">'
						+'</fieldset>'
						+'<div class="infowindow-hints">' + locale.hints + '</div>'
					    +'</div>';
				
				$.template('bubbleMarker', htmlTmpl);
				
				
				htmlTmpl = '<div>'
						+'<div class="location-confirm-title">' + locale.selectedAddress + '</div>'
						+'<table class="location-confirm-content"> <tbody>'
						+'	<tr><td>' + locale.country + '</td><td>${country_name}</td></tr>'
						+'	<tr><td>' + locale.city + '</td><td>${city}</td></tr>'
						+'	<tr><td>' + locale.state + '</td><td>${state}</td></tr>'
						+'	<tr><td>' + locale.address + '</td><td>${address}</td></tr>'
						+'	<tr><td>' + locale.postalCode + '</td><td>${postalCode}</td></tr>'
						+'	<tr><td>' + locale.latitude + '</td><td>${latitude}</td></tr>'
						+'	<tr><td>' + locale.longitude + '</td><td>${longitude}</td></tr>'
						+'</tbody></table>'
						+'<div class="location-confirm-title">' + locale.confirmContent + '</div>'
						+'</div>';
        	
        		$.template('confirmInfo', htmlTmpl);
                this.createMap();
        	},
        	
            // create map
            createMap : function(settings) {
            	if(settings){
            		this.setDefaults(settings);
            	}
        		var me = this;
        		$('#map_canvas').remove();
                $('body')
                        .append('<div id="map_canvas" style="width:1000px; height:600px"></div>');

                var settings = this.settings;
                var mapOptions = {
                    zoom : settings.zoom,
                    center : new google.maps.LatLng(settings.latitude, settings.longitude),
                    disableDefaultUI : settings.disableDefaultUI,
                    panControl : settings.panControl,
                    zoomControl : settings.zoomControl,
                    mapTypeId : settings.mapTypeId || google.maps.MapTypeId.ROADMAP
                };
				
				this.forceClose = false;
                $('#map_canvas').dialog({
                    width : 1000,
                    title : i18n['gmap.button.location'],
                    height : 700,
                    resizable : false,
                    modal : true,
                    draggable : true,
                    zIndex : 2300,
                    beforeClose: function(event, ui) {
                    	if(!me.forceClose){
                    		me.closeGoogleMap();
                    		return false;
                    	}
                    }
                });
                
                this.customMap = new google.maps.Map(document
                                .getElementById('map_canvas'), mapOptions);
                $('#map_canvas').dialog('open');
                if(this.settings.regions){
                    this.addMarker(this.settings.regions);
                }
            },
			
			setDefaults : function(settings){
				if(!settings){
					return;
				}
				$.extend(this.settings, settings);
			},
			
            // add market
            /*
             * @param: region json
             * @param : region.isAddress When the value is true, we create marker for address, otherwise for latlng.The default is false.
             */
            addMarker : function(region) {
            	var limits = this.settings.limits,
                	me = this,
                	latLog = this.settings.latLngByCountry[limits],
                	limitedArea = this.settings.locale.limitedArea,
                	loadMarkerFail = this.settings.locale.loadMarkerFail,
                	loadMarkerError = this.settings.locale.loadMarkerError,
	                loadMarker = function(results, status) {
	                    if (status == google.maps.GeocoderStatus.ERROR){
	                    	alert(loadMarkerError);
	                    	me.removeMarker(me.currentMarker);
                    		me.infoWindow.close();
                    		me.forceClose = true;
                    		me.moveMarker = false;
                    		$('#map_canvas').dialog('close');
	                    	return;
	                    }else if (status == google.maps.GeocoderStatus.OK) {
	                        var markerData = me.getMarkerInfo(results[0]);
	                        if(limits){
						        if(limits != markerData.country){
						            alert(limitedArea);
						            me.geocoder.geocode({
		                                'latLng' : new google.maps.LatLng(latLog.latitude,latLog.longitude)
		                            }, loadMarker);
						        	return;
						        }
	                        }
	                        
	                        var latlng = results[0].geometry.location,
	                            marker = new google.maps.Marker({
	                                position : latlng
	                            });
		                    marker.setMap(me.customMap);
		                    marker.setTitle(region.locationName || '');
		                    marker.setDraggable(true);
		                    google.maps.event.addListener(marker, 'dragstart', function() {    
						        me.infoWindow.close();
						        me.moveMarker = true;
						    });
		                	google.maps.event.addListener(marker,
		                            'dragend', function() {
		                                me.adjustLatLng(this);
		                            });
		                    me.currentMarker = marker;
		                    //Record latitude and longitude
		                    me.currentLat = latlng.lat();
		                    me.currentLng = latlng.lng();
		                    me.markerData = $.extend({},markerData);
                            
                            me.customMap.setCenter(new google.maps.LatLng(me.currentLat, me.currentLng));
		                    me.setMarkerEvent();
				            me.setBubble(marker);
	                    } else {
	                        alert(loadMarkerFail);
	                        me.removeMarker(me.currentMarker);
                    		me.infoWindow.close();
                    		me.forceClose = true;
                    		me.moveMarker = false;
                    		$('#map_canvas').dialog('close');
	                    	return;
	                    	
	                    }
	                };
                
                if (region.isAddress === true) {
                    this.geocoder.geocode({
                                'address' : region.contryAddress
                            }, loadMarker);
                } else {
                    this.geocoder.geocode({
                            'latLng' : new google.maps.LatLng(region.latitude,region.longitude)
                        }, loadMarker);
	            }
            },
            
            removeMarker : function(marker){
            	if (marker) {
					marker.setMap(null);
				}
            },
            
		    setMarkerEvent : function(){
		        var me = this,
		            marker = this.currentMarker,
                	clickFn = function(event){
                		var currentMarker = this;
                		me.setBubble.call(me, currentMarker);
                	};
		    	google.maps.event.addListener(marker, 'click', clickFn);
		    },
		    
            setBubble : function(marker) {
            	var tempData = $.tmpl('bubbleMarker', $.extend({},this.markerData));
                this.infoWindow.setContent($(tempData)[0]);
                this.infoWindow.open(this.customMap, marker);
            },
            
		    adjustLatLng : function(marker) {
                var me = this,
                    limits = this.settings.limits, 
                    limitedArea = this.settings.locale.limitedArea, 
                    loadMarkerFail = this.settings.locale.loadMarkerFail,
                    latlng = new google.maps.LatLng(marker.getPosition().lat(),
                        marker.getPosition().lng());
                this.geocoder.geocode({
                            'latLng' : latlng
                        }, function(results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                if (results[0]) {
                                    var markerData = me.getMarkerInfo(results[0]);
                                    if(limits){
								        if(limits != markerData.country){
								            alert(limitedArea);
                    						me.currentMarker.setPosition(new google.maps.LatLng(me.currentLat,me.currentLng));
								        	return;
								        }
                                    }
                                    me.markerData = markerData;
                                    //record current latitude and longitude
                                    me.currentLat = markerData.latitude;
                                    me.currentLng = markerData.longitude;
                                    me.setBubble(marker);
                                }
                            } else {
                                alert(loadMarkerFail + status);
                                me.currentMarker.setPosition(new google.maps.LatLng(me.currentLat,me.currentLng));
                            }
                        });
            },
		    
    
            getMarkerInfo : function(result){
            	var country = '',
            		country_name = '',
		        	city = '',
		        	state = '',
                    stateCode ='',
		        	postalCode = '',
		        	address,
		        	latitude,
		        	longitude,
                    formatted_address = result.formatted_address,
		        	address_components = result.address_components,
		        	len = address_components.length,
		        	map = {};
		        
		        //address = result.formatted_address;
		        latitude = result.geometry.location.lat();
		        longitude = result.geometry.location.lng();
		        
		        /*if(/./.test(latitude) && (latitude + '').split('.')[1].length > 6){
		        	latitude = latitude.toFixed(6);
		        }
		        
		        if(/./.test(longitude) && (longitude + '').split('.')[1].length > 6){
		        	longitude = longitude.toFixed(6);
		        }*/
		        
		        for (var i = 0; i < len; i++) {
		        	map[address_components[i].types[0]] = {
		        		long_name : address_components[i].long_name,
		        		short_name : address_components[i].short_name
		        	};
		        }
		        
		        country = map['country'] ? map['country'].short_name : '';
		        country_name = map['country'] ? map['country'].long_name : '';
		        state = map['administrative_area_level_1'] ? map['administrative_area_level_1'].long_name : '';
                stateCode = map['administrative_area_level_1'] ? map['administrative_area_level_1'].short_name : '';
		        if(map['locality']){
		        	city = map['locality'].long_name;
		        } else if(map['administrative_area_level_3']){
		        	city = map['administrative_area_level_3'].long_name;
		        }else if(map['administrative_area_level_2']){
		        	city = map['administrative_area_level_2'].long_name;
		        }
		        postalCode = map['postal_code'] ? map['postal_code'].long_name : '';
		        address = map['street_number'] ? (map['street_number'].long_name + ' ') : '';
		        address += map['route'] ? map['route'].long_name : '';
		        
		        var markerData = {
		        	country : country,
		        	country_name : country_name,
		        	city : city,
		        	state : state,
                    stateCode : stateCode,
		        	address : address,
		        	postalCode : postalCode,
		        	latitude : latitude,
					longitude : longitude,
                    formatted_address : formatted_address
		        };
		        return markerData;
            },
            
            closeGoogleMap : function() {
                var fn = function(isWrite) {
                    if(isWrite){
                    	if (this.currentMarker && this.settings.callbackFn) {
	                        if (this.markerData) {
	                            var data = $.extend({}, this.markerData);
	                            this.settings.callbackFn.call(this,
	                                    this.settings.locatedCt, data);
	                        }
	                        this.removeMarker(this.currentMarker);
	                    }
                    }
                    this.infoWindow.close();
                    this.forceClose = true;
                    this.moveMarker = false;
                    delete this.customMap;
                    $('#map_canvas').dialog('destroy');
                }, me = this;
                if(this.moveMarker){
                	var content = this.settings.locale.confirmContent,
	            		title = this.settings.locale.confirmTitle;
	            	//address = this.markerData.address;
	            		
	            	/*content = content.replace(/\{([\w-]+)\}/g, function(m, name) {
						return address || '';
					})*/
					content = $.tmpl('confirmInfo', $.extend({},this.markerData))[0].innerHTML;
	                common.dialog.confirm(content, title, function() {
	                	fn.call(me, true);
	                }, function() {
	                	fn.call(me);
	                });
                }else{
                	fn.call(this);
                }
            }
        }
    });
    
    common.gmaps.initialize = function(config) {
        return new common.gmaps(config);
    };
    
    // state map: code - Common name
    common.gmaps.stateMap = {
        'AL': 'Alabama',
        'AK': 'Alaska',
        'AZ': 'Arizona',
        'AR': 'Arkansas',
        'CA': 'California',
        'CO': 'Colorado',
        'CT': 'Connecticut',
        'DE': 'Delaware',
        'FL': 'Florida',
        'GA': 'Georgia',
        'HI': 'Hawaii',
        'ID': 'Idaho',
        'IL': 'Illinois',
        'IN': 'Indiana',
        'IA': 'Iowa',
        'KS': 'Kansas',
        'KY': 'Kentucky',
        'LA': 'Louisiana',
        'ME': 'Maine',
        'MD': 'Maryland',
        'MA': 'Massachusetts',
        'MI': 'Michigan',
        'MN': 'Minnesota',
        'MS': 'Mississippi',
        'MO': 'Missouri',
        'MT': 'Montana',
        'NE': 'Nebraska',
        'NV': 'Nevada',
        'NH': 'New Hampshire',
        'NJ': 'New Jersey',
        'NM': 'New Mexico',
        'NY': 'New York',
        'NC': 'North Carolina',
        'ND': 'North Dakota',
        'OH': 'Ohio',
        'OK': 'Oklahoma',
        'OR': 'Oregon',
        'PA': 'Pennsylvania',
        'RI': 'Rhode Island',
        'SC': 'South Carolina',
        'SD': 'South Dakota',
        'TN': 'Tennessee',
        'TX': 'Texas',
        'UT': 'Utah',
        'VT': 'Vermont',
        'VA': 'Virginia',
        'WA': 'Washington',
        'WV': 'West Virginia',
        'WI': 'Wisconsin',
        'WY': 'Wyoming',
        'DC': 'District of Columbia',
        'St Thomas': 'Virgin Islands',
        'St John': 'Virgin Islands',
        'St Croix': 'Virgin Islands'
    };
    
    //google map callback
    common.gmaps.callback = function(){
        $('.b-gmap-location').show();
    };
})(EB_Common);
