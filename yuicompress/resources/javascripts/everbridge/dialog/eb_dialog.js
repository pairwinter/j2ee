//provide a graceful firebug console wrapper to avoid error
(function(common) {
    //set default z-index value for dialog over layer.
    $.ui.dialog.prototype.options.zIndex=2300;
    /**
     * Linder Wang add on 2013-3-27
     * 
     * fixed google chrome bug 
     * When bind the mousedown event to the document.documentElement.
     * If handler return false, the chrome will prevent the user to scroll the scroll bar.
     * The correct writing is "event.preventDefault();".
     * example
       $(document.documentElement).mousedown(function(event){
            event.preventDefault();//The chrome will allow the user to scroll the scroll bar.
        });
    
        $(document.documentElement).mousedown(function(event){
            return false;// The chrome will prevent the user to scroll the scroll bar.
        });
     */
    if (jQuery.browser && jQuery.browser.webkit) {
        $.extend($.ui.dialog.overlay, {
            events: $.map(
                    "focus,mouseup,keydown,keypress,click".split(","),
                    function(event) {
                        return event + ".dialog-overlay";
                    }
            ).join(" ")});
    }
    
    var Dialog = {},
            dialogCache = [];
    Dialog.alert = function(content, title, callback,setting) {
        var alert = $('<div title="' + (title ? title : i18n['global.dialog.title.alert']) + '">' + content + '</div>');
        var options = {
            modal: true,
            zIndex: 2300,
            resizable: false
        };
        alert.dialog($.extend(setting||{}, options));
        alert.dialog("option", "buttons", {
            Ok: {
                click: function() {
                    $(this).dialog("close");
                    if (callback && typeof callback == "function") {
                        callback.call($(this));
                    }
                    $(this).dialog("destroy");
                    $(this).remove();
                },
                'class': 'orange',
                text: i18n['global.dialog.button.ok']
            }
        });
        dialogCache.push(alert);
    };

    Dialog.confirm = function(content, title, callback1, callback2,okBtnText, cancelBtnText,setting) {
        if (jQuery.isFunction(arguments[0])) {
            callback1 = arguments[0];
            callback2 = arguments[1];
        }
        var confirm = $('<div title="'
                + (title && typeof title == 'string' ? title : i18n['global.dialog.title.confirm']) + '">'
                + (content && typeof content == 'string' ? content : i18n['global.dialog.content.confirm'])
                + '</div>').dialog({
            modal: true,
            zIndex: 2300,
            resizable: false,
            width:(setting && setting.width)?setting.width:'300',
            buttons: {
                Ok: {
                    click: function() {
                        confirm.dialog('close');
                        if (callback1 && typeof callback1 == "function") {
                            callback1.call(this);
                        }
                    },
                    'class': 'orange',
                    text: okBtnText||i18n['global.dialog.button.yes']
                },
                Cancel: {
                    click: function() {
                        confirm.dialog('close');
                        if (callback2 && typeof callback2 == "function") {
                            callback2.call(this);
                        }
                        ;
                    },
                    'class': 'gray',
                    text:cancelBtnText || i18n['global.dialog.button.no']
                }
            }
        });

        dialogCache.push(confirm);
    };

    // When leaving the page call it.
    Dialog.leavePage = function(title, content, callback1, callback2) {
        if (jQuery.isFunction(arguments[0])) {
            callback1 = arguments[0];
            callback2 = arguments[1];
        }
        var confirm = $('<div title="'
                + (title && typeof title == 'string' ? title : i18n['global.dialog.title.leavePage']) + '">'
                + (content && typeof content == 'string' ? content : i18n['global.dialog.content.leavePage'])
                + '</div>').dialog({
            modal: true,
            zIndex: 2300,
            resizable: false,
            buttons: {
                Ok: {
                    click: function() {
                        $(this).dialog("close");
                        if (callback1 && typeof callback1 == "function") {
                            callback1.call(this);
                        }
                    },
                    'class': 'orange',
                    text: i18n['global.dialog.button.yes']
                },
                Cancel: {
                    click: function() {
                        $(this).dialog("close");
                        if (callback2 && typeof callback2 == "function") {
                            callback2.call(this);
                        }
                    },
                    'class': 'gray',
                    text: i18n['global.dialog.button.no']
                }
            }
        });

        dialogCache.push(confirm);
    };

    Dialog.dialog = function(domId, settings, callback) {
        var $dom;
        if (typeof domId == 'string') {
            $dom = $('#' + domId);
        } else {
            $dom = $(domId);
        }
        if ($dom.length == 0) {
            return;
        }
        Dialog.content = $dom.html();
        if (typeof arguments[1] == 'function') {
            callback = settings;
            settings = null;
        }
        settings = settings || {};
        var dialogConf = {
            zIndex: 2300,
            modal: true,
            width: 500,
            height: 400,
            resizable: false,
            buttons: {
                Ok: {
                    click: function() {
                        if (callback && typeof callback == "function") {
                            if (callback.call(this) !== false) {
                                $(this).dialog("close");
                            }
                        } else {
                            $(this).dialog("close");
                        }
                    },
                    'class': 'orange',
                    text: settings.okBtnText || i18n['global.dialog.button.ok']
                },
                Cancel: {
                    click: function() {
                        $(this).dialog("close");
                    },
                    'class': 'gray',
                    text: settings.cancelBtnText || i18n['global.dialog.button.cancel']
                }
            }
//			,
//			close : function() {
//				$(this).dialog('destroy');
//				$("#" + domId).html(Dialog.content);
//			}
        };
        $.extend(dialogConf, settings);

        $dom.dialog(dialogConf);
        dialogCache.push($dom);
    };

    Dialog.destroyAll = function() {
        try {
            jQuery.each(dialogCache, function(i, v) {
                v.dialog('destroy');
                v.remove();
            });
        } catch (e) {
        }
        dialogCache = [];
    };

    common.dialog = Dialog;
})(EB_Common);