/**
 * Created with IntelliJ IDEA.
 * User: carl
 * Date: 7/5/12
 * Time: 11:13 AM
 * To change this template use File | Settings | File Templates.
 */
(function(view){
    view.contactManage = function(){};
    view.contact = function() {};
    view.contactManage.currentTab="ui-tabs-1";
    view.contactManage.initPage=function(local,context, searchParam){
        $('#mytab0 a').click(function(e){
//            $.ajaxStop();
            e.preventDefault();
            var href = $(this).attr('href');
            var tabs = $('#mytab0 a');
            var length = tabs.length;
            for(var i=0;i<length;i++){
                tabs.eq(i).removeClass('mouse_out');
            }
            $(this).addClass('mouse_out');
//            location.hash="#"+$(this).attr("id");
            //remote
            EB_Common.dialog.destroyAll();
            var id= $(this).attr("id");
            if(view.contactManage.currentTab!="ui-tabs-1" && id=="ui-tabs-1"){
                href = context+"/contacts/list";
                $(this).attr('href', href);
            }
            view.contactManage.currentTab = id;
            EB_Common.Ajax.ajax({
                url : href,
//                data:searchParam,
				type : 'get',
				success : function(r, s) {
					$('#mytab0_Cont0').html(r);
				}
			});
            //robo help
            var id = $(this).attr('id'),
                roboHelpIndex = 25;
            switch(id){
                case 'ui-tabs-1':
                    roboHelpIndex = 25;
                    break;
                case 'ui-tabs-2':
                    roboHelpIndex = 75;
                    break;
                case 'ui-tabs-3':
                    roboHelpIndex = 27;
                    break;
                case 'ui-tabs-4':
                    roboHelpIndex = 28;
                    break;
            }
            $('#contactHelp').attr('roboHelpIndex',roboHelpIndex);
        });
        var hash = "#"+ $('#mytab0 a:first-child').attr("id");
        hash = location.hash||hash;
        $(hash).click();
    };
})(EB_View);
