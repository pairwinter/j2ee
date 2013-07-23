//provide a graceful firebug console wrapper to avoid error
(function(common,ctx,currentPageOrgId) {
    if(ctx.lastIndexOf("/")!=ctx.length-1)
        ctx = ctx+"/";
    //setting global ajax cache
    jQuery.ajaxSettings.cache = false;
    function wrapperUrl(url) {
        if (url.substring(0, ctx.length) === ctx) {
            return url;
        }else{
            if(url.indexOf("/")==0&& url.length>1){
                url = url.substring(1);
            }
        }
        if(url=="/") url="";
        return ctx + url;
    }
    common.Ajax = {
    	wrapperUrl:wrapperUrl,
    	ctx  : ctx,
        ajax : function(settings) {
            settings.cache = settings.cache || false;
            return $.ajax(wrapperUrl(settings.url),settings);
        },
        post : function(url, data, success, dataType) {
            return $.post(wrapperUrl(url), data, success, dataType);
        },
        get : function(url, data, success, dataType) {
            return $.get(wrapperUrl(url), data, success, dataType);
        },
        put : function(url,data,success,type,dataType){
            return $.ajax({
                url : wrapperUrl(url),
                data:$.extend({"_method":"PUT"},data||{}),
                type : type||"post",
                dataType : dataType||"json",
                success : success
            });
        },
        remove : function(url,data,success,type,dataType){
            return $.ajax({
                url : wrapperUrl(url),
                data:$.extend({"_method":"DELETE"},data||{}),
                type : type||"post",
                dataType : dataType||"json",
                success : success
            });
        },
        load : function(jdom,url,data,success){
            return jdom.load(wrapperUrl(url),data,success);
        },
        ajaxStart : function() {
            if (!common.Ajax.$ajaxDom) {
                var ajaxDoms = [];
                $("body").append(ajaxDoms.join(""));
                common.Ajax.$ajaxDom = {
                    ajax_bg : $("#ajax_bg"),
                    ajax_loading : $("#ajax_loading")
                };
                var element = common.Element,
	            	veiwWidth = element.getViewportWidth(),
	            	veiwHeight = element.getViewportHeight(),
	           		l = (veiwWidth - common.Ajax.$ajaxDom.ajax_loading.width()) / 2,
	            	t = (veiwHeight - common.Ajax.$ajaxDom.ajax_loading.height()) / 2;
	            	
	            common.Ajax.$ajaxDom.ajax_loading.css({
	                "left" : l + "px",
	                "top" : t + "px"
	            });
            }
            
            common.Ajax.$ajaxDom.ajax_loading.css({
                "visibility" : "visible"
            });
        },
        ajaxStop : function() {
            if (!!common.Ajax.$ajaxDom) {
                common.Ajax.$ajaxDom.ajax_loading.css({
                    "visibility" : "hidden"
                });
            }
        },
        ajaxError : function(event, request, ajaxOptions, thrownError) {
            var check = EB_Common.Ajax.checkOrg(request);
            if(!check){return;}
            switch (request.status + "") {
            case "0":
                //steven - comment out this line, cause sometime when ajax is interupted, this one will be triggered.
                //common.dialog.alert(common.message.common.error0);
                break;
            case "200":
                if (thrownError) {
                    var error = false;
                    if ((thrownError.type && thrownError.type.toLowerCase() == "unexpected_token")
                            || (thrownError.message && thrownError.message.toLowerCase() == "json.parse")
                            || ((thrownError + "").toLowerCase().indexOf("syntaxerror") > -1))
                        common.dialog.alert(i18n['global.json.format.error']);
                }
                ;
                break;
            case "404":
                common.dialog.alert(i18n['common.error404']);
                break;
            case "408":
                common.dialog.alert(i18n['common.error408']);
                break;
            case "500":
                try{
                    var result = $.parseJSON(request.responseText);
                    common.dialog.alert(result.message);
                }catch(e){
                    common.dialog.alert(i18n['common.error500']);
                }
                break;
            case "480":
                window.location=wrapperUrl('/logout');
                break;
            case "10000":
                window.location=wrapperUrl('/logout');
                break;
            case "10001":
                common.dialog.alert(i18n['common.error10001']);
                break;
            case "10002":  //baseexception
                common.dialog.alert(request.responseText);
                break;
            case "10003":  //
                window.location=wrapperUrl('/dashboard');
                break;
            default:
                break;
            }
            common.logger.log(request);
        },
        ajaxComplete:function(event, request, ajaxOptions){
            EB_Common.Ajax.checkOrg(request);
        },
        checkOrg:function(request){
            var nowOrgId =request.getResponseHeader("orgId");
            if(nowOrgId && currentPageOrgId){
                if(currentPageOrgId != nowOrgId){
                    window.location.href=ctx+"/dashboard";
                    return false;
                }else{
                    return true;
                }
            }
            return true;

        },
        ajaxResize : function() {
            if (!!common.Ajax.$ajaxDom) {
                var element = common.Element,
	            	veiwWidth = element.getViewportWidth(),
	            	veiwHeight = element.getViewportHeight(),
	            	l = (veiwWidth - common.Ajax.$ajaxDom.ajax_loading.width()) / 2,
	            	t = (veiwHeight - common.Ajax.$ajaxDom.ajax_loading.height()) / 2;
	            	
                common.Ajax.$ajaxDom.ajax_loading.css({
                    "left" : l + "px",
                    "top" : t + "px"
                });
            }
        }
    };
    $(window).resize(function() {
        if (!!common.Ajax.$ajaxDom) {
            common.Ajax.ajaxResize();
        }
    });
    $(function() {
        $("body").ajaxStart(common.Ajax.ajaxStart).ajaxStop(common.Ajax.ajaxStop).ajaxError(common.Ajax.ajaxError).ajaxComplete(common.Ajax.ajaxComplete);
        // filter script ,it is set the cache value true
        $.ajaxPrefilter( "script", function( options, originalOptions, jqXHR ) {
            options.cache = true;
        });
    });
})(EB_Common,everbridgeCtx,everbridgeCurrentOrgId);