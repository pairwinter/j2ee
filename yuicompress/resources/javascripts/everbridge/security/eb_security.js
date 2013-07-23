(function(common){
    common.Security={
        features:null,
        protect:function(featureIdentities){
            if(!this.features) return false;
            var mark =false,fis = [];
            if(featureIdentities.push){
                fis = featureIdentities;
            }else{
                fis.push(featureIdentities);
            }
            for(var i=0;i<fis.length;i++){
                var len = this.features.length;
                for(var j=0;j<len;j++){
                    if(this.features[j]== fis[i]){
                        mark = true;
                        break;
                    }
                }
                if(mark){
                    break;
                }
            }
            return mark;
        }
    };
    
    common.Ajax.ajax({
        url : '/information/features',
        async : false,
        dataType : 'json',
        success : function(data){
            common.Security.features=data;
        }
    });
    
//    common.Ajax.get("/information/features",null,function(data){
//        common.Security.features=data;
//    },"json");

})(EB_Common);