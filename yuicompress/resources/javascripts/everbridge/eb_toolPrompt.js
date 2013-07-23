/**
 * This is a base prompt.
 * we can use the class liking the following.
 * After saving saving – message fades in then fades back out (appears for total of 2 seconds or so)
 * The class is singleton. The prompt object instance only one. 

   @author Linder Wang 
   @date   2012-8-6
 */
 
 /*
  * example
  <button id="btnSave">Save</button>
  <script type="text/javascript">
	$(function() {
		EB_Common.ToolPrompt.show('btnSave','Save Successful!');
	})
	</script>
 */
(function(common) {

   common.ToolPrompt = function() {
		var shared;
		return {
			/**
			 * show prompt info
			 * @param el The el is a DOMElement id , a DOMElement or a jQuery Object
             * @param text The text is prompting the info
			 * @param config Custom config
			 */
			show  : function(el, text, config) {
				if (!shared) {
					shared = common.ToolPrompt.Instance();
				}
				shared.initConfig(config);
				shared.bind(el,text);
				shared.disappear();
			}
		};
	}();
   
   /**
	* Instance ToolPrompt
   **/
   common.ToolPrompt.Instance = function() {
		var instance = {
			defaults : {
				promptClass : 'b-toolprompt',
				autoRender : true,
				disappearTime : 500,
				adjustWidth : 20
			},
			init : function() {
				this.createElement();
			},
			createElement : function() {
				var prompt = $('<div />').appendTo(document.body);
				this.toolPrompt = prompt;
			},
			initConfig : function(config){
			    this.settings = $.extend(true, {}, this.defaults, config);
			    
			    if(typeof this.settings.autoRender !== 'boolean'){
			    	this.toolPrompt.appendTo(this.settings.autoRender);
			    }
						
				this.toolPrompt.addClass(this.settings.promptClass);
			},
			
			bind : function(el, text) {
			    if(typeof el == 'string'){
			    	el = $('#' + el);
			    }
                this.toolPrompt.html(text).show().css({
                    left: 0,
                    top: 0
                });
                
                if(EB_Common.direction == 'rtl'){
                   this.toolPrompt.position({
                        of : el,
                        at : 'left-10 center',
                        my : 'right center'
                    }); 
                }else{
                    this.toolPrompt.position({
                    of : el,
                    at : 'right+10 center',
                    my : 'left center'
                });
                }
			},
			disappear : function() {
				var disappearTime = this.settings.disappearTime, prompt = this.toolPrompt;
				setTimeout(function() {
                    prompt.fadeOut(2000);
                }, disappearTime);
			}
		};

		instance.init();

		return instance;
	};

})(EB_Common);
