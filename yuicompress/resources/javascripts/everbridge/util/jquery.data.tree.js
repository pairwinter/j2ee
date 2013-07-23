/**
 * @param {jQuery} $
 * @param {type} undefined
 * @returns {}
 */
(function($, undefined) {
    
    function removeInArray(array, item) {
        var index = array.indexOf(item);
        if (index != -1) {
            array.splice(index, 1);
        }
        return array;
    }
    
    $.util = $.util || {};

    $.util.support = $.util.support || {};

    var uuid = 0;
    $.extend($.util.support, {
        id: function(prefix) {
            prefix = prefix || 'util-gen-';
            return prefix + (++uuid);
        }
    });

    $.util.Tree = function(root) {
        this.nodeHash = {};
        /**
         * The root node for this tree
         * @type Node
         */
        this.root = null;
        if (root) {
            this.setRootNode(root);
        }
    };

    $.extend($.util.Tree.prototype, {
        /**
         * Returns the root node for this tree.
         * @return {Node}
         */
        getRootNode: function() {
            return this.root;
        },
        /**
         * Sets the root node for this tree.
         * @param {Node} node
         * @return {Node}
         */
        setRootNode: function(node) {
            this.root = node;
            node.ownerTree = this;
            node.isRoot = true;
            this.registerNode(node);
            return node;
        },
        /**
         * Gets a node in this tree by its id.
         * @param {String} id
         * @return {Node}
         */
        getNodeById: function(id) {
            return this.nodeHash[id];
        },
        // private
        registerNode: function(node) {
            this.nodeHash[node.id] = node;
        },
        // private
        unregisterNode: function(node) {
            delete this.nodeHash[node.id];
        },
                
        ergodicNode: function(fn) {
            var root = this.root;
            var childNodes = root.childNodes;
            (function(nodes){
                if (nodes && nodes.length > 0) {
                    for (var i = 0, len = nodes.length; i < len; i++) {
                        fn.call(null,nodes[i]);
                        arguments.callee(nodes[i].childNodes);
                    }
                }
            })(childNodes);
        }
    });


    $.util.Node = function(attributes) {
        this.attributes = attributes || {};
        this.leaf = this.attributes.leaf;
        if(!this.attributes.children || this.attributes.children.length == 0){
            this.leaf = true;
        }
        this.id = this.attributes.id;
        if (!this.id) {
            this.id = $.util.support.id('jquery-node-');
            this.attributes.id = this.id;
        }
        this.childNodes = [];
        this.parentNode = null;
        this.firstChild = null;
        this.lastChild = null;
        this.previousSibling = null;
        this.nextSibling = null;
    };

    $.extend($.util.Node.prototype, {
        isLeaf: function() {
            return this.leaf === true;
        },
        // private
        setFirstChild: function(node) {
            this.firstChild = node;
        },
        //private
        setLastChild: function(node) {
            this.lastChild = node;
        },
        /**
         * Returns true if this node is the last child of its parent
         * @return {Boolean}
         */
        isLast: function() {
            return (!this.parentNode ? true : this.parentNode.lastChild == this);
        },
        /**
         * Returns true if this node is the first child of its parent
         * @return {Boolean}
         */
        isFirst: function() {
            return (!this.parentNode ? true : this.parentNode.firstChild == this);
        },
        /**
         * Returns true if this node has one or more child nodes, else false.
         * @return {Boolean}
         */
        hasChildNodes: function() {
            return !this.isLeaf() && this.childNodes.length > 0;
        },
        /**
         * Returns true if this node has one or more child nodes, or if the <tt>expandable</tt>
         * node attribute is explicitly specified as true (see {@link #attributes}), otherwise returns false.
         * @return {Boolean}
         */
        isExpandable: function() {
            return this.attributes.expandable || this.hasChildNodes();
        },
        /**
         * Insert node(s) as the last child node of this node.
         * @param {Node/Array} node The node or Array of nodes to append
         * @return {Node} The appended node if single append, or null if an array was passed
         */
        appendChild: function(node) {
            var multi = false;
            if ($.isArray(node)) {
                multi = node;
            } else if (arguments.length > 1) {
                multi = arguments;
            }
            // if passed an array or multiple args do them one by one
            if (multi) {
                for (var i = 0, len = multi.length; i < len; i++) {
                    this.appendChild(multi[i]);
                }
            } else {
                var index = this.childNodes.length;
                var oldParent = node.parentNode;
                // it's a move, make sure we move it cleanly
                if (oldParent) {
                    oldParent.removeChild(node);
                }
                index = this.childNodes.length;
                if (index === 0) {
                    this.setFirstChild(node);
                }
                this.childNodes.push(node);
                node.parentNode = this;
                var ps = this.childNodes[index - 1];
                if (ps) {
                    node.previousSibling = ps;
                    ps.nextSibling = node;
                } else {
                    node.previousSibling = null;
                }
                node.nextSibling = null;
                this.setLastChild(node);
                node.setOwnerTree(this.getOwnerTree());
                return node;
            }
        },
        /**
         * Removes a child node from this node.
         * @param {Node} node The node to remove
         * @param {Boolean} destroy <tt>true</tt> to destroy the node upon removal. Defaults to <tt>false</tt>.
         * @return {Node} The removed node
         */
        removeChild: function(node, destroy) {
            var index = this.childNodes.indexOf(node);
            if (index == -1) {
                return false;
            }
            // remove it from childNodes collection
            this.childNodes.splice(index, 1);

            // update siblings
            if (node.previousSibling) {
                node.previousSibling.nextSibling = node.nextSibling;
            }
            if (node.nextSibling) {
                node.nextSibling.previousSibling = node.previousSibling;
            }

            // update child refs
            if (this.firstChild == node) {
                this.setFirstChild(node.nextSibling);
            }
            if (this.lastChild == node) {
                this.setLastChild(node.previousSibling);
            }

            if (destroy) {
                node.destroy(true);
            } else {
                node.clear();
            }
            return node;
        },
        // private
        clear: function(destroy) {
            // clear any references from the node
            this.setOwnerTree(null, destroy);
            this.parentNode = this.previousSibling = this.nextSibling = null;
            if (destroy) {
                this.firstChild = this.lastChild = null;
            }
        },
        /**
         * Destroys the node.
         */
        destroy: function(/* private */silent) {
            /*
             * Silent is to be used in a number of cases
             * 1) When setRootNode is called.
             * 2) When destroy on the tree is called
             * 3) For destroying child nodes on a node
             */
            if (silent === true) {
                this.purgeListeners();
                this.clear(true);
                $.each(this.childNodes, function(i, n) {
                    n.destroy(true);
                });
                this.childNodes = null;
            } else {
                this.remove(true);
            }
        },
        /**
         * Inserts the first node before the second node in this nodes childNodes collection.
         * @param {Node} node The node to insert
         * @param {Node} refNode The node to insert before (if null the node is appended)
         * @return {Node} The inserted node
         */
        insertBefore: function(node, refNode) {
            if (!refNode) { // like standard Dom, refNode can be null for append
                return this.appendChild(node);
            }
            // nothing to do
            if (node == refNode) {
                return false;
            }

            var index = this.childNodes.indexOf(refNode);
            var oldParent = node.parentNode;
            var refIndex = index;

            // when moving internally, indexes will change after remove
            if (oldParent == this && this.childNodes.indexOf(node) < index) {
                refIndex--;
            }

            // it's a move, make sure we move it cleanly
            if (oldParent) {
                oldParent.removeChild(node);
            }
            if (refIndex === 0) {
                this.setFirstChild(node);
            }
            this.childNodes.splice(refIndex, 0, node);
            node.parentNode = this;
            var ps = this.childNodes[refIndex - 1];
            if (ps) {
                node.previousSibling = ps;
                ps.nextSibling = node;
            } else {
                node.previousSibling = null;
            }
            node.nextSibling = refNode;
            refNode.previousSibling = node;
            node.setOwnerTree(this.getOwnerTree());
            return node;
        },
        /**
         * Removes this node from its parent
         * @param {Boolean} destroy <tt>true</tt> to destroy the node upon removal. Defaults to <tt>false</tt>.
         * @return {Node} this
         */
        remove: function(destroy) {
            if (this.parentNode) {
                this.parentNode.removeChild(this, destroy);
            }
            return this;
        },
        /**
         * Removes all child nodes from this node.
         * @param {Boolean} destroy <tt>true</tt> to destroy the node upon removal. Defaults to <tt>false</tt>.
         * @return {Node} this
         */
        removeAll: function(destroy) {
            var cn = this.childNodes,
                    n;
            while ((n = cn[0])) {
                this.removeChild(n, destroy);
            }
            return this;
        },
        /**
         * Returns the child node at the specified index.
         * @param {Number} index
         * @return {Node}
         */
        item: function(index) {
            return this.childNodes[index];
        },
        /**
         * Replaces one child node in this node with another.
         * @param {Node} newChild The replacement node
         * @param {Node} oldChild The node to replace
         * @return {Node} The replaced node
         */
        replaceChild: function(newChild, oldChild) {
            var s = oldChild ? oldChild.nextSibling : null;
            this.removeChild(oldChild);
            this.insertBefore(newChild, s);
            return oldChild;
        },
        /**
         * Returns the index of a child node
         * @param {Node} node
         * @return {Number} The index of the node or -1 if it was not found
         */
        indexOf: function(child) {
            return this.childNodes.indexOf(child);
        },
        /**
         * Returns the tree this node is in.
         * @return {Tree}
         */
        getOwnerTree: function() {
            // if it doesn't have one, look for one
            if (!this.ownerTree) {
                var p = this;
                while (p) {
                    if (p.ownerTree) {
                        this.ownerTree = p.ownerTree;
                        break;
                    }
                    p = p.parentNode;
                }
            }
            return this.ownerTree;
        },
        /**
         * Returns depth of this node (the root node has a depth of 0)
         * @return {Number}
         */
        getDepth: function() {
            var depth = 0;
            var p = this;
            while (p.parentNode) {
                ++depth;
                p = p.parentNode;
            }
            return depth;
        },
        // private
        setOwnerTree: function(tree, destroy) {
            // if it is a move, we need to update everyone
            if (tree != this.ownerTree) {
                if (this.ownerTree) {
                    this.ownerTree.unregisterNode(this);
                }
                this.ownerTree = tree;
                // If we're destroying, we don't need to recurse since it will be called on each child node
                if (destroy !== true) {
                    $.each(this.childNodes, function(i, n) {
                        n.setOwnerTree(tree);
                    });
                }
                if (tree) {
                    tree.registerNode(this);
                }
            }
        },
        /**
         * Finds the first child that has the attribute with the specified value.
         * @param {String} attribute The attribute name
         * @param {Mixed} value The value to search for
         * @param {Boolean} deep (Optional) True to search through nodes deeper than the immediate children
         * @return {Node} The found child or null if none was found
         */
        findChild: function(attribute, value, deep) {
            return this.findChildBy(function() {
                return this.attributes[attribute] == value;
            }, null, deep);
        },
        /**
         * Finds the first child by a custom function. The child matches if the function passed returns <code>true</code>.
         * @param {Function} fn A function which must return <code>true</code> if the passed Node is the required Node.
         * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the Node being tested.
         * @param {Boolean} deep (Optional) True to search through nodes deeper than the immediate children
         * @return {Node} The found child or null if none was found
         */
        findChildBy: function(fn, scope, deep) {
            var cs = this.childNodes,
                    len = cs.length,
                    i = 0,
                    n,
                    res;
            for (; i < len; i++) {
                n = cs[i];
                if (fn.call(scope || n, n) === true) {
                    return n;
                } else if (deep) {
                    res = n.findChildBy(fn, scope, deep);
                    if (res != null) {
                        return res;
                    }
                }

            }
            return null;
        },
        /**
         * Returns true if this node is an ancestor (at any point) of the passed node.
         * @param {Node} node
         * @return {Boolean}
         */
        contains: function(node) {
            return node.isAncestor(this);
        },
        /**
         * Returns true if the passed node is an ancestor (at any point) of this node.
         * @param {Node} node
         * @return {Boolean}
         */
        isAncestor: function(node) {
            var p = this.parentNode;
            while (p) {
                if (p == node) {
                    return true;
                }
                p = p.parentNode;
            }
            return false;
        },
        
        getSiblings: function(){
            var p = this.parentNode;
            if(p){
                var childNodes = $.extend([],p.childNodes);
                return removeInArray(childNodes, this);
            }
            return null;
        }
    });

})(jQuery);
