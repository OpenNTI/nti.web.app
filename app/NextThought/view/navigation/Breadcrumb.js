
Ext.define('NextThought.view.navigation.Breadcrumb', {
	extend: 'Ext.toolbar.Toolbar',
	alias: 'widget.breadcrumbbar',
	
	cls: 'x-breadcrumbs-bar',
    items: [],
    border: false,
    
    _current: {},
    
    constructor: function(){
    	this.addEvents({'change': true, 'navigate': true});
    	this.callParent(arguments);
    	return this;
    },
    
    initComponent: function(){
   		this.callParent(arguments);
   		this._librarySource = NextThought.librarySource;
    },
    
	reset: function(book){
		this._current = {};
		this.removeAll(true);
		this.add({
			text: 'You',
			listeners: {
				scope: this,
				click: function(){
					// Ext.getCmp('myLibrary').activate();
					this.reset();
				}
			}
		});
		
		
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
		
		var xml = this._librarySource.getToc(b.index), 
			q = "topic[href^="+this._current.location.replace('.','\\.')+"]",
			l = Ext.DomQuery.selectNode(q,xml);
		return {
			book: b,
			toc: xml,
			location: l 
		};
	},

	
	setActive: function(book, location){
		this.reset(book);
		
		this._current.book = book;
		this._current.location = location;
		
		var loc = this.getLocation();
		this.renderBredcrumb(book, loc.toc, loc.location, this);
		this.fireEvent('change',loc);
	},
	
	
	renderBredcrumb: function(book, xml, currentLocation, container) {
	    if(!xml){
	        return;
	    }
	    var dq = Ext.DomQuery,
	    	toc = dq.selectNode('topic',xml).parentNode,
	        nodes = [],
	        selectedBranch = currentLocation,
	        level = selectedBranch ? selectedBranch.parentNode : dq.selectNode("topic[href]",xml).parentNode;


	    
	    while(level && level.parentNode){
	        
	        var leafs = [],
	        	branches = {
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
	    }
	    
	    container.add({
	    	text: toc.getAttribute('label'),
	    	menu: this._getLibraryMenu(book)
	    });
	    
	    nodes.reverse();
	    container.add(nodes);
	    
	},
	
	
	
	
	_getLibraryMenu: function(book){
		var list = [];
		
		Ext.each(this._librarySource.getTitles(), function(o){
			var xml = this._librarySource.getToc(o.index),
				b	= [],
				m	= {
					text: o.title,
					checked: book && o.index==book.index,
					group: 'library',
					listeners: {
						scope: this,
						click: function(){
							if(NextThought.isDebug) {
								console.log(this.$className);
							}
							this.fireEvent('navigate',o, o.href);
						}
					}
				};
				
			if(xml){
				var dq = Ext.DomQuery,
					toc = dq.selectNode('topic',xml).parentNode,
					root = dq.selectNode("topic[href]",xml).parentNode;
				
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
        Ext.each(node.childNodes,function(v){
            if(v.nodeName=="#text"||!v.hasAttribute("label")){
            	console.log(v);
            	return;
            }
            leafs.push(this._renderLeafFromTopic(book, v, v==selectedNode));
        }, this);
   },
   
   
   
   _renderLeafFromTopic: function(book, topicNode, selected) {
        
        var label = topicNode.getAttribute("label"),
            href = topicNode.getAttribute("href"),
            leaf = this._renderLeaf(book, label, href, selected);
    
        if(topicNode.childNodes.length > 0){
            var list = [];
            this._renderBranch(book,list,topicNode);
            if(list.lenght) {
	            leaf.menu = list;
            }
        }
        
        return leaf;
   },
    
    
    
    _renderLeaf: function(book, labelText, href, selected) {
        
        var leaf = {
        	text: labelText,
        	listeners: {
        		scope: this,
        		click: function(){
        			if(NextThought.isDebug) {
        				console.log(this.$className);
        			}
        			this.fireEvent('navigate',book, book.root+href);
        		}
        	}
        };
            
        if(selected){
            leaf.checked = true;
        }
        
        
        
        return leaf;
    }
    
});