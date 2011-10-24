
Ext.define('NextThought.view.widgets.Breadcrumb', {
	extend: 'Ext.toolbar.Toolbar',
	alias: 'widget.breadcrumbbar',
	
	cls: 'x-breadcrumbs-bar',
    border: false,
    

    constructor: function(){
    	this.addEvents({'change': true, 'navigate': true});
    	this.callParent(arguments);
        this._current = {};
    	return this;
    },
    
    initComponent: function(){
   		this.callParent(arguments);
        this.add({ text: 'Loading...' });
        Library.on('loaded',function(){ if(!this._current.location) this.reset(); }, this);
    },

	reset: function(book){
		this._current = {};
		this.removeAll(true);

		if(!book){
			this.add({
				text: 'Select item...',
				menu: this._getLibraryMenu()
			});
		}

		this.fireEvent('change',this._current);
	},
	
	
	
	getLocation : function(){
		var b = this._current.book;
		if(!b){
			return {};
		}
		
		var xml = Library.getToc(b.get('index')),
			q = "topic[href^="+this._current.location.replace('.','\\.')+"]",
			l = Ext.DomQuery.selectNode(q,xml);
		return {
			book: b,
			toc: xml,
			location: l 
		};
	},

	
	setActive: function(book, location){
		this.reset(!!book);
		
		this._current.book = book;
		this._current.location = location;
		
		var loc = this.getLocation();
        try{
		    this.renderBredcrumb(book, loc.toc, loc.location, this);
        }
        catch(e){
            console.error('Could not render the breadcrumb', e, e.message, e.stack);
            this.reset();
        }
		this.fireEvent('change',loc);
	},


    _selectNodeParent: function(query, dom){
        var node = Ext.DomQuery.selectNode(query,dom);
        return node? node.parentNode : null;
    },
	
	renderBredcrumb: function(book, xml, currentLocation, container) {
	    if(!xml){
	        return;
	    }
	    var me = this,
            toc = me._selectNodeParent('topic',xml),
            location = (currentLocation ? currentLocation:toc);
	        nodes = [],
            first = true;
	        selectedBranch = currentLocation,
	        level = selectedBranch ? selectedBranch.parentNode : me._selectNodeParent("topic[href]",xml);

	    while(level && level.parentNode){
	        
	        var leafs = [],
	        	branches = {
                    cls: first? 'x-breadcrumb-end': '',
		        	text: selectedBranch 
		                ? selectedBranch.getAttribute("label"): 'Select Chapter'
		                
		        };
	        
	        
	        this._renderBranch(book, leafs, level, selectedBranch);
	        
	        if(leafs.length>0){
	        	branches.menu = leafs;
	        }
	        
	        
	        nodes.push(branches);
	        
	        //back up the tree...all the way to the root.
	        selectedBranch = level;
	        level = level.parentNode;
            first = false;
	    }
	    
	    container.add({
	    	text: toc.getAttribute('label'),
	    	menu: this._getLibraryMenu(book)
	    });
	    
	    nodes.reverse();
	    container.add(nodes);

        //add prev and next buttons
        if (location) {
            var navInfo = Library.getNavigationInfo(location.getAttribute('ntiid')) || {};
            container.add(
                '->',
                {iconCls: 'breadcrumb-prev', disabled: !navInfo.hasPrevious, location: navInfo.previousHref, book: navInfo.book},
                {iconCls: 'breadcrumb-next', disabled: !navInfo.hasNext, location: navInfo.nextHref, book: navInfo.book}
            );
        }
	},
	
	
	
	
	_getLibraryMenu: function(book){
		var list = [];
		
		Library.each(function(o){
			var xml = Library.getToc(o.get('index')),
				b	= [],
                h   = o.get('href'),
				m	= {
                    text: o.get('title'),
                    checked: book && o.get('index')==book.get('index'),
                    group: 'library',
                    book: o,
                    location: h
				};
				
			if(xml){
				var root = this._selectNodeParent("topic[href]",xml);
				this._renderBranch(o, b, root);
				if(b.length){
					m.menu = b;
				}
			}

			list.push(m);
		}, this);
				
		return list;
	},
	
	
	
	_renderBranch: function(book, leafs, node, selectedNode) {
        if(!node)return;
        Ext.each(node.childNodes,function(v){
            if(v.nodeName=="#text"||!v.hasAttribute("label")){
            	return;
            }
            leafs.push(this._renderLeafFromTopic(book, v, v==selectedNode)||{});
        }, this);
   },
   
   
   
   _renderLeafFromTopic: function(book, topicNode, selected) {
        
        var label = topicNode.getAttribute("label"),
            href = topicNode.getAttribute("href"),
            leaf = this._renderLeaf(book, label, href, selected);
    
        if(leaf && topicNode.childNodes.length > 0){
            var list = [];
            leaf.menu = list;
            this._renderBranch(book,list,topicNode);
            if(!leaf.menu.length){
            	leaf.menu = undefined;
            }
        }
        
        return leaf;
   },
    
    
    
    _renderLeaf: function(book, labelText, href, selected) {
        if(!href || !labelText || !book){
            return null;
        }

        var leaf = {
        	text: labelText,
            book: book,
            location: book.get('root')+href
        };
            
        if(selected){
            leaf.checked = true;
        }
        
        
        
        return leaf;
    }
    
});
