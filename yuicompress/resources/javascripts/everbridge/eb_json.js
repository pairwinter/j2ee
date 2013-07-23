(function(common){
	common.json={};
	// implement JSON.stringify serialization
    common.json.stringify = window.JSON.stringify;
})(EB_Common);