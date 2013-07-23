/**
 * audio player
 * @param {type} common
 */
(function(common) {
    
    //If the browser isn't IE,load audiojs plugin.
    if(!jQuery.browser['msie']){
        var scriptPath = EB_Common.Ajax.wrapperUrl('/statics/javascripts/plugin/jplayer/jquery.jplayer.js');
        var scriptEl = document.createElement('script');
        scriptEl.setAttribute('src', scriptPath); 
        scriptEl.setAttribute('type', 'text/javascript'); 
        $('head')[0].appendChild(scriptEl);
        
        var stylePath = EB_Common.Ajax.wrapperUrl('/statics/javascripts/plugin/jplayer/skin/blue.monday/jplayer.blue.monday.css');
        var styleEl = document.createElement('link');
        styleEl.setAttribute('href', stylePath); 
        styleEl.setAttribute('rel', 'stylesheet'); 
        styleEl.setAttribute('type', 'text/css'); 
        $('head')[0].appendChild(styleEl);
        
        EB_Common.Ajax.ajax({
            url : '/statics/tmpl/jplayer/template.html',
            success: function(data){
                $.template('jPlayerTmpl', data);
            }
        });
        
    }
    
    $.extend(common, {
        // constructor for audio
        audio: function(config) {
            config = config || {};
            this.settings = $.extend(true, {}, common.audio.defaults, config);
        }
    });

    $.extend(common.audio, {
        defaults: {
            loop: false,
            autoplay: false,
            audioId:""
        },
        prototype: {
            play: function(config) {
                var path = config.path,
                    container = config.container,
                    html,settings = this.settings,
                    audioId = config.audioId||settings.audioId;

                if (jQuery.browser['msie']) {//IE
                    html = '<embed class="margin10-T" id="audioElement_'+audioId+'" height="40px" width="420px" type="audio/x-wav" autostart="' + (!!settings.autoplay) + '" src="' + path + '" loop="' + (!!settings.loop) + '"/>';
                    $(html).appendTo(container || document.body);
                } else if (window.Audio) {
                    //To solve the $.template['jPlayerTmpl'] value is undefined in "Incident Templates" function when loaded the page.
                    //FIXME this is a bug.
                    if($.template['jPlayerTmpl'] == undefined){
                        EB_Common.Ajax.ajax({
                            url : '/statics/tmpl/jplayer/template.html',
                            async : false,
                            success: function(data){
                                $.template('jPlayerTmpl', data);
                            }
                        });
                    }
                    $.tmpl('jPlayerTmpl',{audioId : audioId}).appendTo(container || document.body);
                    var jpContainerSelector = '#jp_container_' + audioId + ' .jp-seek-bar';
                    var myPlayer = $('#jquery_jplayer_' + audioId);
                    myPlayer.jPlayer({
                        ready: function (event) {
                            $(this).jPlayer("setMedia", {
                                wav : path
                            });
                        },
                        play: function(){
                            $(jpContainerSelector).addClass('jp-seeking-bg');
                        },
                        pause: function(){
                            $(jpContainerSelector).removeClass('jp-seeking-bg');
                        },
                        ended: function() { // The $.jPlayer.event.ended event
                            $(jpContainerSelector).removeClass('jp-seeking-bg');
                            myPlayer.data("jPlayer").status.waitForLoad = true;//set the value to true to reload the audio
                        },
                        swfPath: "flash",
                        cssSelectorAncestor : '#jp_container_' + audioId,
                        supplied: "wav",
                        //wmode: "window",
                        smoothPlayBar: true,
                        keyEnabled: true,
                        loop : settings.loop
                    });
                }
            },
            stop: function() {

            },
            destroy: function() {
                //$('#audioElement_'+this.settings.audioId).remove();
            }
        }

    });

    common.audio.play = function(config) {
        var audio = new common.audio();
        audio.play(config);
    };

})(EB_Common);
