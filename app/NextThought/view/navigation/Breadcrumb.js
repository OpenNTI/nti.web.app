
Ext.define('NextThought.view.navigation.Breadcrumb', {
	extend: 'Ext.toolbar.Toolbar',
	
	cls: 'x-breadcrumbs-bar',
    items: [],
    border: false,
    
    _library: null,
    _books: [],
    _current: {},
    
    constructor: function(){
    	this.addEvents({"change" : true});

    	this.callParent(arguments);
		NextThought.librarySource.on('loaded', this._libraryLoaded, this);
    	return this;
    },
    
    // initComponent: function(){
   		// this.callParent(arguments);
    // },
    
    
	_libraryLoaded: function(library){
		this._library = library;
		
		var me = this;
		Ext.each(this._library.titles, function(o,i){
			if(o.index)
				me.loadToc(o.index);
		});
		
		this.reset();
		
		var b = this._library.titles[0];
		Ext.getCmp('myReader').setActive(b, b.root+'sect0001.html');		
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
		
		if(!this._books[b.index]){
			this.loadToc(b.index);
		}
		
		var xml = this._books[b.index] 
			q = "topic[href^="+this._current.location.replace('.','\\.')+"]",
			l = Ext.DomQuery.selectNode(q,xml);
		return {
			book: b,
			toc: b? this._books[b.index] : undefined,
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
	
	
	loadToc: function(index){
		var url = _AppConfig.server.host+index;
		Ext.Ajax.request({
			url: url,
			async: false,
			scope: this,
			failure: function(r,o) { console.log('failed to load index: '+url); },
			success: function(r,o) { this._books[index] = r.responseXML; }
		});
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
		
		Ext.each(this._library.titles, function(o){
			var xml = this._books[o.index],
				b	= [],
				m	= {
					text: o.title,
					checked: book && o.index==book.index,
					group: 'library',
					listeners: {
						click: function(){
							Ext.getCmp('myReader').setActive(o, o.href);
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
            if(v.nodeName=="#text")return;
            leafs.push(this._renderLeafFromTopic(book, v, v==selectedNode));
        }, this);
   },
   
   
   
   _renderLeafFromTopic: function(book, topicNode, selected) {
        
        var label = topicNode.hasAttribute("label")
                    ? topicNode.getAttribute("label")
                    : "no label",
            href = topicNode.getAttribute("href"),
            leaf = this._renderLeaf(book, label, href, selected);
    
        if(topicNode.childNodes.length > 0){
            var list = [];
            leaf.menu = list;
            this._renderBranch(book,list,topicNode);
        }
        
        return leaf;
   },
    
    
    
    _renderLeaf: function(book, labelText, href, selected) {
        
        var leaf = {
        	text: labelText,
        	listeners: {
        		click: function(){
        			Ext.getCmp('myReader').setActive(book, book.root+href);
        		}
        	}
        };
            
        if(selected){
            leaf.checked = true;
        }
        
        
        
        return leaf;
    }
    
});