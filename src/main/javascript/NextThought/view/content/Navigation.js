Ext.define('NextThought.view.content.Navigation',{
	extend: 'Ext.Component',
	alias: 'widget.content-navigation',
	requires: [
		'NextThought.view.menus.JumpTo'
	],
	ui: 'content-navigation',
	cls: 'jumpto',

	breadcrumbSepTpl: Ext.DomHelper.createTemplate({tag:'span',html:' / '}).compile(),
	breadcrumbTpl: Ext.DomHelper.createTemplate({tag:'span',cls:'part',html:'{0}'}).compile(),

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'img', src: Ext.BLANK_IMAGE_URL, cls: 'bookcover' },
		{
			cls: 'wrapper',
			cn: [{
				cls: 'breadcrumb'
			},{
				cls: 'title'
			}]
		}
	]),

	renderSelectors: {
		bookcover: 'img.bookcover',
		breadcrumb: '.breadcrumb',
		title: '.title'
	},

	initComponent: function(){
		this.callParent(arguments);
	},


	afterRender: function(){
		var me = this;
		this.callParent(arguments);
		me.locationChanged();
		LocationProvider.on('change',me.locationChanged,me);
	},


	locationChanged: function(ntiid){
		var me = this;
		var lp = LocationProvider;
		var c;
		var loc = lp.getLocation(ntiid);
		var lineage = lp.getLineage(ntiid);
		var book = lineage[0] ? lp.getLocation(lineage[0]) : null;
		var	path = me.getBreadcrumbPath();

		me.cleanupMenus();

		if(!loc || !loc.NTIID || !book){ me.hide(); return; }
		else if(me.isHidden()){ me.show(); }

		this.bookcover.setStyle({backgroundImage: Ext.String.format('url({0}{1})',book.root,book.icon)});

		c = lp.getLocation(lineage.shift());
		Ext.each(lineage,function(i){
			var l = lp.getLocation(i);
			var e = me.breadcrumbTpl.insertFirst(me.breadcrumb, [l.label], true);
			path.add(me.breadcrumbSepTpl.insertFirst(me.breadcrumb));

			me.buildMenu(e,c);
			c = l;
			path.add(e);
		});

		path.add(me.buildMenu(
				me.breadcrumbTpl.insertFirst(me.breadcrumb, ['All Books'], true),
				c
		));

		path.add(me.breadcrumbSepTpl.insertFirst(me.breadcrumb));
		path.add(me.breadcrumbTpl.insertFirst(me.breadcrumb, ['Library']));

		me.title.clearListeners();
		me.title.update(me.getContentNumericalAddress(lineage,loc)+loc.label);
	},


	getContentNumericalAddress: function(lineage,loc){
		return '';
	},


	getBreadcrumbPath: function(){
		var p = new Ext.CompositeElement();

		if(this.pathPartEls){
			this.pathPartEls.clearListeners();
			this.pathPartEls.remove();
			this.pathPartEls.clear();
			delete this.pathPartEls;
		}
		this.pathPartEls = p;

		return p;
	},



	cleanupMenus: function(){
		var m = this.menuMap;
		delete this.menuMap;

		//
	},


	buildMenu: function(pathPartEl,locationInfo){
		var me = this, m,
			menus = me.menuMap || {},
			cfg = { xtype:'jump-menu', ownerButton: me, items: [] },
			key = locationInfo? locationInfo.ntiid : null,
			currentNode = locationInfo ? locationInfo.location: null;

		if(!currentNode){ return pathPartEl; }

		if(currentNode.tagName === 'toc'){
			this.enumerateBookSiblings(locationInfo,cfg.items);
		}
		else {
			this.enumerateTopicSiblings(currentNode,cfg.items);
		}

		m = menus[key] = Ext.widget(Ext.apply({},cfg));

		pathPartEl.on('mouseenter', function(){
			m.showBy(pathPartEl,'tl-bl?', [-10,0]);
		});

		this.menuMap = menus;

		return pathPartEl;
	},


	enumerateBookSiblings: function(locInfo,items){
		Library.each(function(o){
			var id = o.get('NTIID');
			items.push({
				text	: Ext.String.ellipsis(o.get('title'),30,false),
				ntiid	: id,
				cls		: id===locInfo.ntiid?'current':''
			});
		});
	},



	enumerateTopicSiblings: function(node,items){
		var current = node, num = 0;

		if(!current.parentNode){
			console.warn('null parentNode in toc');
			return;
		}

		while(Ext.fly(node).prev()){
			node = Ext.fly(node).prev(null,true);
		}

		for(;node.nextSibling; node = node.nextSibling){
			if(!/topic/i.test(node.tagName)){ continue; }
			num++;
			items.push({
				text	: num+'. '+Ext.String.ellipsis(node.getAttribute('label'),30,false),
				ntiid	: node.getAttribute('ntiid'),
				cls		: node===current?'current':''
			});
		}
	},


	clicked: function(me,dom){}
});

