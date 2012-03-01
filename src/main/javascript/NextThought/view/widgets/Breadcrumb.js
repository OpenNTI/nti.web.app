Ext.define('NextThought.view.widgets.Breadcrumb', {
	extend: 'Ext.toolbar.Toolbar',
	alias: 'widget.breadcrumbbar',
	requires: [
		'NextThought.Library',
		'NextThought.providers.Location'
	],
	
	cls: 'x-breadcrumbs-bar',
	border: false,

	
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
			navInfo;

		while(level && level.parentNode){
			
			leafs = [];
			branches = {
				cls: first? 'x-breadcrumb-end': '',
				text: selectedBranch ?
						selectedBranch.getAttribute("label"): 'Select Chapter'

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
			menu: this.getLibraryMenu(location.ContentNTIID)
		});
		
		nodes.reverse();
		container.add(nodes);

		//add prev and next buttons
		if (curNode) {
			navInfo = Library.getNavigationInfo(curNode.getAttribute('ntiid')) || {};
			container.add(
					'->',
					{iconCls: 'breadcrumb-close', ntiid: true },
					{iconCls: 'breadcrumb-prev', disabled: !navInfo.hasPrevious, ntiid: navInfo.previousRef},
					{iconCls: 'breadcrumb-next', disabled: !navInfo.hasNext, ntiid: navInfo.nextRef}
			);
		}
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
			if(v.nodeName==="#text"||!v.hasAttribute("label")){
				return;
			}
			leafs.push(this.renderLeafFromTopic(v, v===selectedNode)||{});
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
	}

});
