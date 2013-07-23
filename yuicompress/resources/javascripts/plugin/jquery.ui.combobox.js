(function($) {
	$.widget("ui.combobox", {
		_create : function() {
			var valid,input,
                self = this,
                select = this.element.hide(),
                selected = select.children(":selected"),
                value = selected.val() ? selected.text() : "",
                wrapper = this.wrapper = $("<span>").addClass("ui-combobox").insertAfter(select);
		    var inputname=select.attr("id"),maxlength=select.attr('maxlength');
            var valueDom = $("input[name^='"+inputname+"']"), isDuleSwcript = this.options.isDuleSwcript===undefined?true:this.options.isDuleSwcript
            if(select.attr("target_id")){
                valueDom = $("#"+select.attr("target_id")).val(this.element.val());
            }
            
			input = $("<input>").appendTo(wrapper).val(value)
					.addClass("ui-state-default ui-combobox-input").attr('maxlength',maxlength)
					.keyup(function(){
                        valueDom.val($(this).val());
                        if(valueDom.attr("class") && valueDom.attr("class").indexOf("{")>-1){
                            valueDom.valid && valueDom.valid();
                        }
                    }).blur(function(){
                        valueDom.val($(this).val());
                        if(valueDom.attr("class") && valueDom.attr("class").indexOf("{")>-1){
                            valueDom.valid && valueDom.valid();
                        }
                    }).autocomplete({
						delay : 0,
						minLength : 0,
						height:this.options.height,
						comboboxWidth:this.options.comboboxWidth,
						width:this.options.width,
						customClass:null,
						source : function(request, response) {
							var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
							response(select.children("option").map(function() {
								var text = $(this).text();
								var html = $(this).html();
								if (this.value && (!request.term || matcher.test(text))){
                                    return {
                                        label : isDuleSwcript? html:text.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)("+ $.ui.autocomplete.escapeRegex(request.term)+ ")(?![^<>]*>)(?![^&;]+;)","gi"),"<strong>$1</strong>"),
                                        value : text,
                                        option : this
                                    };
                                }
							}));
						},
						select : function(event, ui) {
							ui.item.option.selected = true;
                            valueDom.val(ui.item.value);
                            if(valueDom.attr("class") && valueDom.attr("class").indexOf("{")>-1){
                                valueDom.valid && valueDom.valid();
                            }
							self._trigger("selected", event, {item : ui.item.option});
							
						},
						change : function(event, ui) {
							if (!ui.item) {
								var matcher = new RegExp("^"+ $.ui.autocomplete.escapeRegex($(this).val()) + "$","i"), valid = false,options = select.children("option");
                                options.each(function(i) {
                                    if ($(this).text().match(matcher)) {
                                        this.selected = valid = true;
                                        return false;
                                    }
                                });
							}
						}
					}).addClass("ui-widget ui-widget-content ui-corner-left");
					
			if(this.options.customClass){
			    input.addClass(this.options.customClass);
		    }
			input.data("autocomplete")._renderItem = function(ul, item) {
				return $("<li></li>").data("item.autocomplete", item).append("<a>" + item.label + "</a>").appendTo(ul);
			};
			$("<a>").attr("tabIndex", -1).attr("title", "Show All Items")
					.appendTo(wrapper).button({
								icons : {
									primary : "ui-icon-triangle-1-s"
								},
								text : false
							}).removeClass("ui-corner-all")
					.addClass("ui-corner-right ui-combobox-toggle").click(
							function() {
								// close if already visible
								if (input.autocomplete("widget").is(":visible")) {
									input.autocomplete("close");
									return;
								}

								// work around a bug (likely same cause as
								// #5265)
								$(this).blur();

								// pass empty string as value to search for,
								// displaying all results
								input.autocomplete("search", "");
								input.focus();
							});
		},
		destroy : function() {
			this.wrapper.remove();
			this.element.show();
			$.Widget.prototype.destroy.call(this);
		}
	});
})(jQuery);