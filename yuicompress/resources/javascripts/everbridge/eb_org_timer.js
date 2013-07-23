//provide a graceful firebug console wrapper to avoid error
(function(common){
    common.orgTimer=setInterval(function(){
        var cookieOrgId = common.cookie.get("token");
        if(cookieOrgId){
            if(cookieOrgId != everbridgeCurrentOrgId){
                clearInterval(common.orgTimer);
                window.location.href=common.Ajax?common.Ajax.wrapperUrl("/"):"/"  ;
            }
        }
    },1500);

})(EB_Common);