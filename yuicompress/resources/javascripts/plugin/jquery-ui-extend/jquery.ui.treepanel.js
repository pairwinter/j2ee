/*!
 * EverBridge UI TreePanel 1.0.0
 * http://www.everbridge.com/
 
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.data.tree.js
 */
(function($, undefined) {

    var re = /\{([\w-]+)\}/g;
    function applyTemplate(template, values) {
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            $(args).each(function(index, element) {
                $.extend(values, element);
            });
        }
        return template.replace(re, function(m, name) {
            return values[name] !== undefined ? values[name] : "";
        });
    }

    $.widget("ui.treepanel", {
        version: "1.0.0",
        options: {
            baseCls: 'b-ui-treepanel',
            cls: '', 
            style: '',
            width: 200,
            height: 'auto',
            nodesData: null,
            url: null,
            expand : 1,//Default: the tree of the first level expand.
            drawer : true,
            activeNode: null,
            paddingLeft : 13,
            
            //checkbox 
            multiple : false,
            //event
            clicknode : null
        },
        _create: function() {
            this._setTreeRoot();
            this._createElements();
            this._render();
            var me = this;
            var events = {};
            events['mouseenter .' + this.treeCls.hearderCls + ',.' + this.treeCls.contentCls] = function(event) {
                 var target = $(event.currentTarget);
                 target.addClass('ui-state-focus');
            };
            events['mouseleave .' + this.treeCls.hearderCls + ',.' + this.treeCls.contentCls] = function(event) {
                 var target = $(event.currentTarget);
                 target.removeClass('ui-state-focus');
            };
            
            events['click .' + this.treeCls.hearderCls] = function(event) {
                 event.stopPropagation();
                 var target = $(event.currentTarget),
                        level = target.parent().attr('level'),
                        next = target.next();
                    if(this.options.drawer && level == 1){
                        var lastLevel1 = this.treePanel.data('lastLevel1');
                        if(lastLevel1 && lastLevel1.next().attr('id') != next.attr('id')){
                            lastLevel1.next().hide();
                            lastLevel1.removeClass('ui-state-active');
                        }
                        this.treePanel.data('lastLevel1',target);
                    }
                    target.toggleClass('ui-state-active');
                    next.toggle();
                    
                    var nodeId = target.parent().attr('id');
                    var node = me.tree.getNodeById(nodeId);
                    node.attributes.expanded = next.is(':visible');
                    this._trigger('clicknode', null, [this, node]);
                    if(node.attributes.clicknode){
                        node.attributes.clicknode.call(null,event,this,node);
                    }
            };
            
            if(this.options.multiple === true){
                events['click input[type="checkbox"]'] = function(event) {
                    var target = $(event.currentTarget);
                    var nodeId = target.attr('nodeId');
                    var node = this.tree.getNodeById(nodeId);
                    if(node.attributes.expanded){
                        event.stopPropagation();
                    }
                };
                
                events['change input[type="checkbox"]'] = function(event) {
                    var target = $(event.currentTarget);
                    var nodeId = target.attr('nodeId');
                    var checked = target.attr('checked');
                    var node = this.tree.getNodeById(nodeId);
                    node.attributes.checked = !!checked;
                    
                    // To iterate over all parent nodes
                    var parentNode = node.parentNode;
                    var currentNode = node;
                    var parentChecked = checked;
                    while(!parentNode.isRoot){
                        if(parentChecked){
                            $('input[nodeId="' + parentNode.id + '"]').attr('checked',!!parentChecked);
                        }else{
                            var siblings = currentNode.getSiblings();
                            if(siblings && siblings.length >0){
                                for (var i = 0, len = siblings.length; i < len; i++) {
                                    if($('input[nodeId="' + siblings[i].id + '"]').attr('checked')){
                                        parentChecked = true;
                                        break;
                                    }
                                }
                            }
                            $('input[nodeId="' + parentNode.id + '"]').attr('checked',!!parentChecked);
                        }
                        currentNode = currentNode.parentNode;
                        parentNode.attributes.checked = !!parentChecked;
                        parentNode = parentNode.parentNode;
                    }
                    
                    // When node is not leaf
                    if(!node.isLeaf()){
                        (function(nodes){
                            if(nodes && nodes.length > 0){
                                for (var i = 0, len = nodes.length; i < len; i++) {
                                    $('input[nodeId="' + nodes[i].id + '"]').attr('checked',!!checked);
                                    nodes[i].attributes.checked = !!checked;
                                    arguments.callee(nodes[i].childNodes);
                                }
                            }
                        })(node.childNodes);
                    }
               };
            }
                    
            $.extend(events,{
                'click li.node-leaf': function(event){//leaf
                    event.stopPropagation();
                    var target = $(event.currentTarget),
                        targetC = target.children();
                    
                    var lastLeafNode = this.treePanel.data('lastLeafNode');
                    if(lastLeafNode){
                        lastLeafNode.removeClass('ui-state-active');
                    }
                    this.treePanel.data('lastLeafNode',targetC);
                    targetC.addClass('ui-state-active');
                    
                    var nodeId = target.attr('id');
                    var node = me.tree.getNodeById(nodeId);
                    this._trigger('clicknode', null, [this, node]);
                }
            });
            this._on(this.treePanel, events);
            
            // set current tree node
            var activeNode = this.options.activeNode || (this.root.item(0) && this.root.item(0).item(0) ? this.root.item(0).item(0).id : undefined);
            if(activeNode){
                this._setActiveTreeNode(activeNode);
            }
        },
        /**
         * wrap the root and set
         * @returns {}
         */
        _setTreeRoot: function() {
            var url = this.options.url,
                nodesData = this.options.nodesData;
            if(url){//remote
                $.ajax({
                    url: url,
                    async : false,
                    success: function(r, s) {
                        nodesData = r;
                    }
                });
            }
            if (!nodesData) {//Create a tree that is empty.
                nodesData = {};
            }
            if (!$.isArray(nodesData)) {
                nodesData = [nodesData];
            } 
            this.root = new $.util.Node({
                children: nodesData
            });
            this.tree = new $.util.Tree(this.root);
            // Node: Preload the root after instancing the tree.
            this._preload(this.root);
        },
                
        _preload: function(node) {
            if (node.attributes.children) {
                if (node.childNodes.length < 1) { 
                    var cs = node.attributes.children;
                    for (var i = 0, len = cs.length; i < len; i++) {
                        var cn = node.appendChild(new $.util.Node(cs[i]));
                        this._preload(cn);
                    }
                }
            }
        },
        /**
         * 
         * @returns {}
         */
        _createElements: function() {
            var options = this.options;
            var cls = {
                treeCls: options.baseCls,
                ulCls: options.baseCls + '-ul',
                liCls: options.baseCls + '-li',
                hearderCls: options.baseCls + '-hearder',
                contentCls: options.baseCls + '-content',
                branchIconCls: options.baseCls + '-branch-icon',
                levelCls: options.baseCls + '-level',
                checkboxCls: options.baseCls + '-checkbox'
            };

            this.treeCls = cls;
            this.treeTmpl = '<div class="' + cls.treeCls + '" />';
            this.ulTmpl = '<ul class="' + cls.ulCls + '" />';
            this.liTmpl = '<li class="' + cls.liCls + '" />';
            this.headerTmpl = '<header class="' + cls.hearderCls + '" ><i class="' + cls.branchIconCls + '"/><span /></header>';
            this.contentTmpl = '<div class="' + cls.contentCls + '" ><label></label></div>';
            
            if(this.options.multiple === true){
                this.checkboxTmpl = '<input type="checkbox" class="' + cls.checkboxCls + '" /> ';
            }
        },
        /**
         * render the tree panel
         * @returns {}
         */
        _render: function() {
            this.treePanel = $(this.treeTmpl).width(this.options.width).height(this.options.height).addClass('ui-widget ui-widget-content');
            var ul = $(this.ulTmpl).appendTo(this.treePanel);
            this.element.append(this.treePanel);
            this._renderItem(this.root.childNodes, ul);
        },
                
        _renderItem: function(nodes, ct) {
            var node, leaf, liEl, ulEl, depth;
            for (var i = 0, len = nodes.length; i < len; i++) {
                ulEl = null;
                node =  nodes[i];
                leaf = node.isLeaf();
                depth = node.getDepth();
                liEl = $(this.liTmpl).appendTo(ct).attr('id', node.id).attr('level', depth);
                
                var paddingLeft = this.options.paddingLeft * depth;
                if (leaf) {
                    liEl.addClass('node-leaf');
                    var contentEl = $(this.contentTmpl).appendTo(liEl).css('padding-left',paddingLeft);
                    var lableEl = contentEl.children('label').text(node.attributes.text);
                    if(this.options.multiple === true){
                        $(this.checkboxTmpl).prependTo(lableEl).attr('nodeId', node.id).attr('checked',node.attributes.checked);
                    }
                } else {
                    var headerEl = $(this.headerTmpl).appendTo(liEl).addClass(this.treeCls.levelCls + depth).css('padding-left',paddingLeft);
                    headerEl.children('span').text(node.attributes.text);
                    if(this.options.multiple === true){
                        $(this.checkboxTmpl).prependTo(headerEl).attr('nodeId', node.id).attr('checked',node.attributes.checked);
                    }
                    ulEl = $(this.ulTmpl).appendTo(liEl).uniqueId();
                    if(this.options.expand <= depth){
                        ulEl.hide();
                    }
                }
                if (leaf === false && ulEl) {
                    this._renderItem(node.childNodes, ulEl);
                }
            }
        },
                
        _setActiveTreeNode : function(nodeId){
            var node = this.tree.getNodeById(nodeId),
                depth = node.getDepth(),
                nodeEl = $('#' + nodeId),
                cloneNodeEl = nodeEl;
            while(depth != 0){
                cloneNodeEl = cloneNodeEl.parent().parent();
                var header = cloneNodeEl.children('.' + this.treeCls.hearderCls);
                if(!header.hasClass('ui-state-active')){
                    header.click();
                }
                depth --;
            }
            nodeEl.click();
        },
        
        _setOption: function(key, value) {
            if (key === 'cls') {
                this.treePanel.addClass(value);
            }
            if (key === 'style') {
                this.treePanel.css(value);
            }
            if (key === 'width' || key === 'height') {
                this.treePanel[key](value);
            }
            if (key === 'activeNode') {
                this._setActiveTreeNode(value);
            }
            
            this._super(key, value);
        },
            
        _destroy: function() {
            this.treePanel.stop( true, true ).remove();
        },
        
        getNodesData: function(fn){
            this.tree.ergodicNode(fn);
        }
    });
    
}(jQuery));
