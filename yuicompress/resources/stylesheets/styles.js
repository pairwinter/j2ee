var head = document.getElementsByTagName('head')[0];
function loadLink(stylePath){
	var styleEl = document.createElement('link');
	styleEl.setAttribute('href', stylePath); 
	styleEl.setAttribute('rel', 'stylesheet'); 
	styleEl.setAttribute('type', 'text/css'); 
	head.appendChild(styleEl);
}

var stylesJs = document.getElementById('stylesJs'); 
var src = stylesJs.getAttribute('src'); 
var ctx = src.substring(0, src.indexOf('statics')) + 'statics/stylesheets/';
var version = src.substring(src.indexOf('?version='));

//var ctx = head.getAttribute('ctx') +  '/statics/stylesheets/'; 
//var version = head.getAttribute('version'); 

loadLink(ctx + "jscss/ajax.css" + version ); 
loadLink(ctx + "jscss/jquery-ui-1.8.21.custom.css" + version ); 
loadLink(ctx + "jscss/jquery-ui-1.8.21.everbridge.css" + version ); 
loadLink(ctx + "jscss/eb_validation.css" + version ); 
loadLink(ctx + "jscss/layout-default-latest.css" + version ); 
loadLink(ctx + "jscss/ui.jqgrid.css" + version ); 
loadLink(ctx + "jscss/ui.jqgrid.everbridge.css" + version ); 
loadLink(ctx + "jscss/zTreeStyle.css" + version ); 
loadLink(ctx + "jscss/openlayer-original-style.css" + version ); 
loadLink(ctx + "jscss/jquery-ui-timepicker-addon.css" + version ); 

loadLink(ctx + "dashboard/dashboard.css" + version ); 
loadLink(ctx + "universe/universe.css" + version ); 
loadLink(ctx + "notification/notification.css" + version ); 
loadLink(ctx + "contacts/contacts.css" + version ); 
loadLink(ctx + "report/report.css" + version ); 
loadLink(ctx + "settings/settings.css" + version ); 
loadLink(ctx + "myprofile/myprofile.css" + version ); 
loadLink(ctx + "usermanagement/usermanagement.css" + version ); 
loadLink(ctx + "role/role.css" + version ); 
loadLink(ctx + "incidents/incidents.css" + version );
