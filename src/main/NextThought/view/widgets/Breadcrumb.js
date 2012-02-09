Ext.define('NextThought.view.widgets.Breadcrumb', {
	extend: 'Ext.toolbar.Toolbar',
	alias: 'widget.breadcrumbbar',
	
	cls: 'x-breadcrumbs-bar',
	border: false,
	

	constructor: function(){
		this.addEvents({'change': true, 'navigate': true});
		this.callParent(arguments);
		this.current = {};
		return this;
	},
	
	initComponent: function(){
		this.callParent(arguments);
		if (!Library.loaded) {
			this.add({ text: 'Loading...' });
			Library.on('loaded',function(){ if(!this.current.location) {this.reset(); } }, this);
		}
		else {
			this.reset();
		}
	},

	reset: function(book){
		this.current = {};
		this.removeAll(true);

		if(!book){
			this.add({
				text: 'Select item...',
				menu: this.getLibraryMenu()
			});
		}

		this.fireEvent('change',this.current);
	},
	
	
	
	getLocation : function(){
		var b = this.current.book, q, l, xml;
		if(!b){
			return {};
		}
		
		xml = Library.getToc(b.get('index'));
		q = "topic[href^="+this.current.location.replace('.','\\.')+"]";
		l = Ext.DomQuery.selectNode(q,xml);

		return {
			book: b,
			toc: xml,
			location: l 
		};
	},

	
	setActive: function(book, location){
		this.reset(!!book);
		
		this.current.book = book;
		this.current.location = location;
		
		var loc = this.getLocation();
		try{
			this.renderBreadcrumb(book, loc.toc, loc.location, this);
		}
		catch(e){
			console.error('Could not render the breadcrumb', e, e.message, e.stack);
			this.reset();
		}
		this.fireEvent('change',loc);
	},


	selectNodeParent: function(query, dom){
		var node = Ext.DomQuery.selectNode(query,dom);
		return node? node.parentNode : null;
	},
	
	renderBreadcrumb: function(book, xml, currentLocation, container) {
		if(!xml){
			return;
		}
		var me = this,
			toc = me.selectNodeParent('topic',xml),
			location = (currentLocation ? currentLocation:toc),
			nodes = [],
			first = true,
			selectedBranch = currentLocation,
			level = selectedBranch ? selectedBranch.parentNode : me.selectNodeParent("topic[href]",xml),
			leafs,
			branches,
			navInfo;

		while(level && level.parentNode){
			
			leafs = [];
			branches = {
				cls: first? 'x-breadcrumb-end': '',
				text: selectedBranch ?
						selectedBranch.getAttribute("label"): 'Select Chapter'

			};

			
			this.renderBranch(book, leafs, level, selectedBranch);
			
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
			menu: this.getLibraryMenu(book)
		});
		
		nodes.reverse();
		container.add(nodes);

		//add prev and next buttons
		if (location) {
			navInfo = Library.getNavigationInfo(location.getAttribute('ntiid')) || {};
			container.add(
					'->',
					{iconCls: 'breadcrumb-prev', disabled: !navInfo.hasPrevious, location: navInfo.previousHref, book: navInfo.book},
					{iconCls: 'breadcrumb-next', disabled: !navInfo.hasNext, location: navInfo.nextHref, book: navInfo.book}
			);
		}
	},
	
	
	
	
	getLibraryMenu: function(book){
		var list = [];
		
		Library.each(function(o){
			var root,
				xml = Library.getToc(o.get('index')),
				b	= [],
				h   = o.get('href'),
				m	= {
					text: o.get('title'),
					checked: book && o.get('index')===book.get('index'),
					group: 'library',
					book: o,
					location: h
				};

			if(xml){
				root = this.selectNodeParent("topic[href]",xml);
				this.renderBranch(o, b, root);
				if(b.length){
					m.menu = b;
				}
			}

			list.push(m);
		}, this);
				
		return list;
	},
	
	
	
	renderBranch: function(book, leafs, node, selectedNode) {
		if(!node) {
			return;
		}
		Ext.each(node.childNodes,function(v){
			if(v.nodeName==="#text"||!v.hasAttribute("label")){
				return;
			}
			leafs.push(this.renderLeafFromTopic(book, v, v===selectedNode)||{});
		}, this);
	},
   
   
   
	renderLeafFromTopic: function(book, topicNode, selected) {
		
		var label = topicNode.getAttribute("label"),
				href = topicNode.getAttribute("href"),
				ntiid = topicNode.getAttribute('ntiid'),
				leaf = this.renderLeaf(book, label, href, ntiid, selected),
				list;
	
		if(leaf && topicNode.childNodes.length > 0){
			list = [];
			leaf.menu = list;
			this.renderBranch(book,list,topicNode);
			if(!leaf.menu.length){
				leaf.menu = undefined;
			}
		}
		
		return leaf;
	},
	
	
	
	renderLeaf: function(book, labelText, href, ntiid, selected) {
		if(!href || !labelText || !book){
			return null;
		}

		var leaf = {
			text: labelText,
			book: book,
			location: book.get('root')+href,
			ntiid: ntiid,
			skipHistory: this.skipHistory
		};
			
		if(selected){
			leaf.checked = true;
		}
		
		
		
		return leaf;
	}

});
