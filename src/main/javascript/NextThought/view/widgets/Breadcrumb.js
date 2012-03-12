Ext.define('NextThought.view.widgets.Breadcrumb', {
	extend: 'Ext.toolbar.Toolbar',
	alias: 'widget.breadcrumbbar',
	requires: [
		'NextThought.Library',
		'NextThought.providers.Location'
	],
	
	cls: 'x-breadcrumbs-bar',
	border: false,

	listeners: {
		resize: function(){this.onResize();}
	},

	
	initComponent: function(){
		this.callParent(arguments);
		this.add({ text: 'Loading...' });
		LocationProvider.on('change',this.updateLocation,this);
		Library.on('loaded',this.loaded,this,{single:true});
	},


	/** @private */
	loaded: function(){
		if(this.items.getAt(0).text === 'Loading...'){
			this.reset();
		}
	},


	/** @private */
	reset: function(hasLocation){
		this.current = {};
		this.removeAll(true);

		if(!hasLocation){
			this.add({
				text: 'Select item...',
				menu: this.getLibraryMenu()
			});
		}
	},


	/** @private */
	updateLocation: function(ntiid){
		if(!Library.loaded){
			Ext.Error.raise("Should not happen");
		}
		this.reset(!!ntiid);

		try{
			this.renderBreadcrumb(LocationProvider.getLocation(ntiid), this);
		}
		catch(e){
			console.error('Could not render the breadcrumb', e, e.message, e.stack);
			this.reset();
		}
	},


	/** @private */
	selectNodeParent: function(query, dom){
		var node = Ext.DomQuery.selectNode(query,dom);
		return node? node.parentNode : null;
	},
	

	/** @private */
	renderBreadcrumb: function(location, container) {
		if(!location || !location.toc){
			return;
		}
		var me = this,
			xml = location.toc,
			toc = me.selectNodeParent('topic',xml),
			curNode = (location.location ? location.location:toc),
			selectedBranch = location.location,
			level = selectedBranch ? selectedBranch.parentNode : me.selectNodeParent("topic[href]",xml),
			nodes = [],
			first = true,
			leafs,
			branches,
			navInfo,
			t;

		while(level && level.parentNode){
			t = selectedBranch ? selectedBranch.getAttribute("label"): 'Select Chapter';
			leafs = [];
			branches = {
				cls: first? 'x-breadcrumb-end': '',
				text: t,
				originalText: t
			};

			
			this.renderBranch(leafs, level, selectedBranch);
			
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
			text: toc.getAttribute('title'),
			originalText: toc.getAttribute('title'),
			menu: this.getLibraryMenu(location.ContentNTIID)
		});
		
		nodes.reverse();
		container.add(nodes);

		//add prev and next buttons
		if (curNode) {
			navInfo = Library.getNavigationInfo(location.NTIID) || {};
			container.add(
					'->',
					{iconCls: 'breadcrumb-close', ntiid: true, tooltip:'Close Content' },
					{iconCls: 'breadcrumb-prev', disabled: !navInfo.hasPrevious, ntiid: navInfo.previousRef, tooltip:'Previous Content'},
					{iconCls: 'breadcrumb-next', disabled: !navInfo.hasNext, ntiid: navInfo.nextRef, tooltip:'Next Content'}
			);
		}

		this.onResize();
	},
	

	/** @private */
	getLibraryMenu: function(id){
		var list = [];
		
		Library.each(function(o){
			var root,
				xml = Library.getToc(o),
				b	= [],
				m	= {
					text: o.get('title'),
					originalText: o.get('title'),
					checked: o.get('NTIID')===id,
					group: 'library',
					ntiid: o.get('ntiid')
				};

			if(xml){
				root = this.selectNodeParent("topic[href]",xml);
				this.renderBranch(b, root);
				if(b.length){
					m.menu = b;
				}
			}

			list.push(m);
		}, this);
				
		return list;
	},
	
	
	/** @private */
	renderBranch: function(leafs, node, selectedNode) {
		if(!node) {
			return;
		}
		Ext.each(node.childNodes,function(v){
			try {
				if(v.nodeName==="#text"||! v.nodeName ==='xml' ){
					return;
				}
				leafs.push(this.renderLeafFromTopic(v, v===selectedNode)||{});
			}
			catch(e){
				console.warn('Breadcrumb: ',v, e.message);
			}
		}, this);
	},
   
   
	/** @private */
	renderLeafFromTopic: function(topicNode, selected) {
		
		var label = topicNode.getAttribute("label"),
				href = topicNode.getAttribute("href"),
				ntiid = topicNode.getAttribute('ntiid'),
				leaf = this.renderLeaf(label, href, ntiid, selected),
				list;
	
		if(leaf && topicNode.childNodes.length > 0){
			list = [];
			leaf.menu = list;
			this.renderBranch(list,topicNode);
			if(!leaf.menu.length){
				leaf.menu = undefined;
			}
		}
		
		return leaf;
	},
	
	
	/** @private */
	renderLeaf: function(labelText, href, ntiid, selected) {
		if(!href || !labelText){
			return null;
		}

		var leaf = {
			text: labelText,
			ntiid: ntiid
		};
			
		if(selected){
			leaf.checked = true;
		}

		return leaf;
	},

	onResize: function(){
		var toolbarWidth = this.getSize().width,
			btns = this.query('button[text]'),
			noResizeBtns = this.query('button:not([text])'),
			maxButtonLength,
			nonResizableButtonsWidth = 0,
			charWidth = 6;

		Ext.each(noResizeBtns, function(b){
			nonResizableButtonsWidth += b.getSize().width;
		}, this);

		maxButtonLength = (toolbarWidth - nonResizableButtonsWidth) / btns.length;

		Ext.each(btns, function(b){
				if (b.originalText) {
					b.setText(Ext.String.ellipsis(b.originalText, maxButtonLength/charWidth, false));
				}
			}
			, this);
	}
});
