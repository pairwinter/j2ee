var EB_Common = function() {};
var EB_View = function(){};
EB_Common.protocol = window.location.protocol;
EB_Common.message={};
EB_Common.DEV_MODE = location.href.indexOf('localhost') != -1;
EB_Common.includePath="";
EB_Common.getPath=function(){
	if(!EB_Common.includePath)
	{
		$("head script").each(function(){
			var src=$(this).attr("src");
			if(src.indexOf("EB_Common.js")>-1)
			{
				EB_Common.includePath=src.substring(0,src.indexOf("EB_Common.js"));
				return;
			}
			
		});
	}
	return EB_Common.includePath;
};
EB_Common.include = function(file)
{
	EB_Common.includePath=EB_Common.getPath();
    var files = typeof file == "string" ? [file] : file;
    var head=$("head:first");
    for (var i = 0; i < files.length; i++)
    {
        var name = files[i].replace(/^\s|\s$/g, "");
        var att = name.split('.');
        var ext = att[att.length - 1].toLowerCase();
        var isCSS = ext == "css";
        var tag = isCSS ? "link" : "script";
        var attr = isCSS ? " type='text/css' rel='stylesheet' " : " language='javascript' type='text/javascript' ";
        var link = (isCSS ? "href" : "src") + "='" + EB_Common.includePath + name + "'";
        if ($(tag + "[" + link + "]").length == 0) head.append("<" + tag + attr + link + "></" + tag + ">");
    }
};
EB_Common.loadJs=function(file,success){
	$.ajax({
		url:file,
		dataType:"script",
		async:false
	});
};
EB_Common.noData=function(element){
	var container;
	if( typeof element =='string'){
		container = $('#' + element);
	}else if(element.nodeType == 1 && element.tagName){
		container = element;
	}
	$('<div class="div_nodata">'+i18n['dashboard.noData']+'</div>').appendTo(container);
	
};

EB_Common.escapeHTML=function(b) {
    var a = $("<div />");
    a.text(b);
    return a.html();
};

/**
 * We can call it to achieve that a dialog open before leaving the page.
 * The dialog will prompt that you are sure to want to leave this page.
 * 
 * @param formEl 
 * @author Linder Wang
 * @date 2012-8-16
**/
/*
 * example
   EB_Common.LeavePage.addListener(options);
	$('#cancelId').click(function(){
		//if the form inputs' value is changed
    	if(EB_Common.LeavePage.changeState()){
    		EB_Common.dialog.leavePage(function(){
    			EB_Common.LeavePage.removeListener();
    			window.location=context+"/contacts/manage#ui-tabs-4";
    		});
    	}
		
	});

*/
EB_Common.LeavePage = function(){
    var inputs,
        container,
        changeFlag = false,
        changeFn = function(e){
        	changeFlag = true;
            var one = e.data ? e.data.one : undefined;
        	//console.info(changeFlag);
            if(one !== false){//The default listener once.
                if(container){
                    $('#'+container).off('change', inputs, changeFn);
                }else{
                    $('body').off('change', inputs, changeFn);
                }
            }
        };
	
	
	var pub = {
		addListener : function(options){
		    //We should remove explicit listener if no call removeListener,
		    inputs = null;
            container = options.caontainer;
            var formEl = options.formEl;
            var one = options.one;
            var ignore = options.ignore;
			if(formEl){
				if(typeof formEl == 'string'){
					inputs = '#' + formEl + ':input';
				}else if(formEl.nodeType == 1 && formEl.tagName){
					inputs = '#' + formEl.id + ':input';
				}else if(formEl instanceof jQuery){
					inputs = '#' + formEl.attr(id) + ':input';
				}
			}
			if(!inputs){
				inputs = ':input';
			}
			inputs += ':not(":button,:reset,:submit' + (ignore ? ',' + ignore : '') + '")';
			//console.info($(inputs));
			if(container){
				$('#'+container).on('change', inputs, {one : one}, changeFn);
			}else{
				$('body').on('change', inputs, {one : one}, changeFn);
			}
		},
		
		removeListener : function(){
		    if(inputs){
		    	if(container){
					$('#'+container).off('change', inputs, changeFn);
				}else{
					$('body').off('change', inputs, changeFn);
				}
				inputs = null;
		    }
			changeFlag = false;
		},
		
		changeState : function(){
			return changeFlag;
		},
		
		resetState : function(){
			changeFlag = false;
			if(container){
				$('#'+container).on('change', inputs, changeFn);
			}else{
				$('body').on('change', inputs, changeFn);
			}
		},
                
        setState : function(state){
            if(typeof state == 'boolean'){
                changeFlag = state;
            }
        }
	};
	
	return pub;
}();

EB_Common.Element = (function() {

    var check = function(r) {
        	return r.test(navigator.userAgent.toLowerCase());
    	}, 
    	doc = document, 
    	isOpera = check(/opera/), 
    	isIE = !isOpera && check(/msie/), 
    	isStrict = doc.compatMode == 'CSS1Compat';

    var element = {
        //return the page viewport width
        getViewportWidth : function() {
            return !isStrict && !isOpera ? doc.body.clientWidth : isIE
                    ? doc.documentElement.clientWidth
                    : self.innerWidth;
        },
        //return the page viewport height
        getViewportHeight : function() {
            return isIE ? (isStrict
                    ? doc.documentElement.clientHeight
                    : doc.body.clientHeight) : self.innerHeight;
        }
    };
    return element;
})();
EB_Common.htmlDecode = function(value){
    if(value && (value=='&nbsp;' || value=='&#160;' || (value.length===1 && value.charCodeAt(0)===160))) { return "";}
    return !value ? value : String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
};
EB_Common.htmlEncode = function (value){
    return !value ? value : String(value).replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
EB_Common.scriptEncode = function (value){
    return !value ? value : String(value).replace(/<script>/g, "&lt;script&gt;").replace(/<\/script>/g, "&lt;/script&gt;");
};
EB_Common.format = function(format){ //jqgformat
    var args = $.makeArray(arguments).slice(1);
    if(format===undefined) { format = ""; }
    return format.replace(/\{(\d+)\}/g, function(m, i){
        return args[i];
    });
};

/**
 * mask
 * @author Linder Wang
*/
EB_Common.mask = (function() {
    var maskElement;
    var pub = {
        /**
		 * mask show
		 * @param {} container 
		 * @param {} msg  
		 */
        show : function(msg, container){
            var ct,
            	force;
            if(container){
            	ct = typeof container == 'string' ? document.getElementById(container) : container;
            	force = true;
            }else{
            	ct = document.body;
            }
		    
		    if (force === true || !maskElement) {
		        if(maskElement){
		        	maskElement.maskBg.remove();
			        maskElement.maskMsg.remove();
		        }
		        var maskBg = $('<div class="ajax-bg"></div>').appendTo(ct);
		        	maskMsg = $('<div class="ajax-loading" style="height: auto"></div>').appendTo(ct);
		        maskElement = {
		        	maskBg : maskBg,
		        	maskMsg : maskMsg
		        };
		    }
	        
	        var element = EB_Common.Element,
            	veiwWidth = element.getViewportWidth(),
            	veiwHeight = element.getViewportHeight(),
           		l = (veiwWidth - maskElement.maskMsg.width()) / 2,
            	t = (veiwHeight - maskElement.maskMsg.height()) / 2;
	            	   
			maskElement.maskBg.show();
			maskElement.maskMsg.show().css({
				left : l + 'px',
	            top : t + 'px',
	            'visibility' : 'visible'
			}).html('<p>' + msg + '</p>').removeClass('ajax-no-loading');
        },
        
        html : function(content){
        	if(maskElement){
        	   maskElement.maskMsg.html('').addClass('ajax-no-loading');
        	   if(content){
        	   	  content.clone(true,true).appendTo(maskElement.maskMsg).show();
        	   }
        	}
        },
        
        hide : function(){
        	maskElement.maskBg.hide();
			maskElement.maskMsg.hide().empty();
        }
    };
    
    return pub;
    
})(),
Array.prototype.toString = function(){  // added by daniel
	return this.join(", ");
};
Array.prototype.remove = Array.prototype.remove ||  function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
Array.prototype.removeItemByKey = function(val){
	var item = null;
	for(var i in this) {
		if (this[i]&&this[i] == val) {
			item = i;
		}
	}
	this.splice(i,1);
};
Date.prototype.date2str = function(formatter) {
    var x = this, y = formatter;
    var z = {M: x.getMonth() + 1, d: x.getDate(), h: x.getHours(), m: x.getMinutes(), s: x.getSeconds()};
    y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
        return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2);
    });
    return y.replace(/(y+)/g, function(v) {
        return x.getFullYear().toString().slice(-v.length);
    });
};
String.prototype.countLength=function(){
    return this.replace(/[^\x00-\xff]/g,"**").length;
};
String.prototype.replaceAll = function(s1,s2) {
	return this.replace(new RegExp(s1,"gm"),s2);
};

String.prototype.replceIgnoreRegex = function(s1, s2){
	var reg = /[`~!@#$%^*()_+?:{}|.\/[\]]/ig;
	
	if (reg.test(s1)) {
		var specialChars = s1.match(reg), isExist = [];
		$.each(specialChars, function(i,e){
			if (!isExist[e]) {
				isExist[e] = true;
				s1 = s1.replaceAll("\\" + e, '\\' + e);
			}
		});
	}
	return this.replaceAll(s1, s2);
}

String.prototype.escapeHTMLToString = function() {
	return EB_Common.htmlEncode(this);
};

String.prototype.substring2=function(start,end){
    if(!this.length) return "";
    var str = this.substring(start,end);
    var newLength = 0;
    var newStr = "";
    var chineseRegex = /[^\x00-\xff]/g;
    var singleChar = "";
    var strLength = str.countLength();
    for(var i = 0;i < strLength;i++)
    {
        singleChar = str.charAt(i).toString();
        if(singleChar.match(chineseRegex) != null){
            newLength += 2;
        }else{
            newLength++;
        }
        if(newLength > end){
            break;
        }
        newStr += singleChar;
    }
    return newStr;
};


EB_Common.Highcharts = {
    piecolors : [ '#DCBFB6', '#DF7E67', '#D02029', '#901A1D', '#46232F', '#F4DCCE', '#ESA385', '#D87148',
                '#A0573A', '#664839', '#BF96A8', '#c198aa', '#C5559F', '#83205B', '#605560' ],
    columncolors : ['#c28e78', '#ed5840', '#882445', '#c3a3c1', '#78738b', '#cacfe9', '#458bba', '#8a98cd', '#eae2b2', '#d0c347', '#8d8648','#7eb261','#50574d']
            
};

//ie7 ie8 compatibility
if(!Array.prototype.indexOf){
    Array.prototype.indexOf = function(item){
        var me = this;
        if(me.length == 0){
            return -1;
        }
        for (var i = 0, len = me.length; i < len; i++) {
            if(item == me[i]){
                return i;
            }
        }
        return -1;
    };
}
if($.views && $.views.tags){
    $.views.tags({
        escapeHtml:function(val){
            if(!this.escapeXMLContainer)
                this.escapeXMLContainer=$("<span>").empty();
            var tt = this.escapeXMLContainer.text(val).html();
            var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            tt = tt.replace(exp,"<a href='$1' target='_blank'>$1</a>");
            return tt;
        }
    });
}
if($.views && $.views.helpers){
    $.views.helpers({
        logData:function(data){
            console.log(data);
            return data;
        },
        formatIconSrc:function(icon){
            return EB_Common.Ajax.ctx+"/statics/stylesheets/settings/img/"+icon;
        },
        formatTwitterTime: function(val){
            if(val && val.indexOf("-")>-1){
                var vals = val.split("-");
                return vals[0]+" "+i18n["global.month."+vals[1]]+" "+vals[2];
            }
            val =  val.replace("*SA*","s");
            val =  val.replace("*MA*","m");
            val =  val.replace("*HA*","h");
            return val;
        },
        formatWeatherCondition:function(val){
            if(val){
                return (!!i18n["weatherthreshold.condition."+val])?i18n["weatherthreshold.condition."+val]:"";
            }
            return "";
        },
        cut:function(val,len){
            len  = len || 140;
            if(val.length>len){
                return val.substring(0,len)+"...";
            }
            return val;
        },
        randomName:function(val){
            return Math.random()+"";
        },
        i18n:function(message){
            return i18n[message];
        },
        randomDomId:function(val){
            return val;
        }
    });
}

/**
 * When document had been ready, load these events.
 * 
 */
$(function(){
    /**
    * robohelp 
    */
    $(document.body).on('click','[roboHelpIndex]',function(){
        var index = $(this).attr('roboHelpIndex');
        RH_ShowHelp(0, EB_Common.Ajax.wrapperUrl('/statics/WebHelp/index.htm'), HH_HELP_CONTEXT, index);
    });
    
    //set default for the plugins
    //1. set default for the datetimepicker
    if($.ui.timepicker){
        $.timepicker.setDefaults({
            controlType: 'select',
            timeFormat: 'HH:mm:ss'
        });
    }
    
    //tooltip
    if($.fn.tooltip){
        $('.b-tooltip').tooltip();
    }
    
    //rewrite $.datepicker._attachHandlers
    var _attachHandlers = $.datepicker._attachHandlers;
    $.datepicker._attachHandlers = function(inst) {
        _attachHandlers.call($.datepicker, inst);
        //add listeners event: click
        inst.dpDiv.find("button.ui-datepicker-close").click(function() {
            var onClickClose = $.datepicker._get(inst, "onClickClose");
            if (onClickClose) {
                onClickClose.apply((inst.input ? inst.input[0] : null), [(inst.input ? inst.input.val() : ""), inst]);
            }
        });
    };

    //init direction : "rtl"
    EB_Common.direction = '';
    if ($('html').attr('dir') == 'rtl') {
        EB_Common.direction = 'rtl';
    }

});
EB_Common.browser={
    versions:function(){
        var u = navigator.userAgent, app = navigator.appVersion;
        var o = {//mobile
            trident: u.indexOf('Trident') > -1, //IE
            presto: u.indexOf('Presto') > -1, //opere
            webKit: u.indexOf('AppleWebKit') > -1, //safera or chorme
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //firefox
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //mobile
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android or uc broswer
            iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //iPhone or QQ
            iPad: u.indexOf('iPad') > -1, //iPad
            webApp: u.indexOf('Safari') == -1 //weather is web app
        };
        o.handleDevice = o.ios || o.android || o.iPhone || o.iPad;
        return o;
    }(),
    language:(navigator.browserLanguage || navigator.language).toLowerCase()
}
EB_Common.isIpad =(new RegExp(/iPad/)).exec(navigator.userAgent)?true:false;
EB_Common.checkFlash = function(isShowDialog){
    if(EB_Common.isIpad) return;
    function hasPlugin(name) {
        name = name.toLowerCase();
        for (var i = 0; i < navigator.plugins.length; i++) {
            if (navigator.plugins[i].name.toLowerCase().indexOf(name) > -1) {
                return true;
            }
        }
        return false;
    }
    function hasIEPlugin(name) {
        try {
            new ActiveXObject(name);
            return true;
        } catch (ex) {
            return false;
        }
    }

    function hasFlash() {
        var result = hasPlugin("Flash");
        if (!result) {
            result = hasIEPlugin("ShockwaveFlash.ShockwaveFlash");
        }
        return result;
    }
    function getFlashVersion() {
        if (window.ActiveXObject) {
            var control = null;
            try {
                control = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            }
            catch (e) {
            }
            if (control) {
                version = control.GetVariable('$version').substring(4);
                version = version.split(',');
                version = parseFloat(version[0] + '.' + version[1]);
                delete control;
                return version;
            }
        }
        else if(typeof navigator.plugins['Shockwave Flash']!=='undefined') {
            var words = navigator.plugins['Shockwave Flash'].description.split(' ');
            var aword;
            for (var i = 0; i < words.length; ++i) {
                if (isNaN(parseInt(words[i])))
                    continue;
                aword = words[i];
            }
            return aword;
        }
        return 0;
    };
    var check = hasFlash();
    if(!check && isShowDialog){
        EB_Common.dialog.alert("Please install Flash Player");
    }
    if(check){
        var version = getFlashVersion();
        check = version>=10.3;
    }
    return check;
};

EB_Common.position = function(el,value){
 	try {
     	var elem = el.get(0)||el;
     	if (elem && (elem.tagName == "TEXTAREA" || elem.type.toLowerCase() == "text")) {
            	if ($.browser.msie) {
                	if (value === undefined) {
                		if (elem.tagName == "TEXTAREA"){
                			var range = document.selection.createRange();
                    		var rng = document.body.createTextRange(),start = 0;
                        	rng.moveToElementText(elem);
                        	
                        	for (start=0; rng.compareEndPoints("StartToStart", range) < 0; start++) {
                        		rng.moveStart('character', 1);
                        	}
                        	
                        	for (var i = 0; i <= start; i ++){
                                if (elem.value.charAt(i) == '/n')
                                    start++;
                            }
                        	
                        	return start;
                		} else {
                			var slct = document.selection; 
            			    var rng = slct.createRange(); 
            			    elem.select(); 
            			    rng.setEndPoint("StartToStart", slct.createRange()); 
            			    var psn = rng.text.length; 
            			    rng.collapse(false); 
            			    rng.select(); 
            			    return psn; 
                		}
                	} else if (typeof value === "number") {
                    	var index = this.position();
                    	index > value ? (rng.moveEnd("character", value - index)) : (rng.moveStart("character", value - index))
                    	rng.select();
                	}
            		
            		
//                	var rng;
//                	if (elem.tagName == "TEXTAREA") {
//                    	rng = event.srcElement.createTextRange();
//                    	rng.moveToElementText(elem);
//                	} else {
//                		rng = document.selection.createRange();
//                	}
//                	if (value === undefined) {
//                    	rng.moveStart("character", -elem.value.length);
//                    	return rng.text.length;
//                	} else if (typeof value === "number") {
//                    	var index = this.position();
//                    	index > value ? (rng.moveEnd("character", value - index)) : (rng.moveStart("character", value - index))
//                    	rng.select();
//                	}
            	} else {
                	if (value === undefined) {
                		return elem.selectionStart;
                	} else if (typeof value === "number") {
                    	elem.selectionEnd = value;
                    	elem.selectionStart = value;
                	}
            	}
     	} else {
            	if (value === undefined)
            	return undefined;
     	}
 	} catch (e) {
 		return undefined;
 	}
}