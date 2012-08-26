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

	levelLabels: {
		1: 'Select a section'
	},

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
		var iconPath;

		function buildPathPart(i){
			var l = lp.getLocation(i),
				label = l.label,
				level = parseInt(l.location.getAttribute('levelnum'), 10);
			if (i === ntiid) {
				label = me.levelLabels[level] || label;
			}
			var e = me.breadcrumbTpl.insertFirst(me.breadcrumb, [label], true);
			path.add(me.breadcrumbSepTpl.insertFirst(me.breadcrumb));

			me.buildMenu(e,c);
			c = l;
			path.add(e);
		}

		me.cleanupMenus();

		if(!loc || !loc.NTIID || !book){ me.hide(); return; }
		else if(me.isHidden()){ me.show(); }

		iconPath = book.icon;
		if(iconPath.substr(0,book.root.length) !== book.root ){
			iconPath = book.root+book.icon;
		}

		this.bookcover.setStyle({
			backgroundImage: Ext.String.format('url({0})',iconPath)
		});

		c = lp.getLocation(lineage.shift());
		if(this.hasChildren(c.location)) {
			lineage.unshift(c.NTIID);
			c = lp.getLocation(Ext.fly(c.location).first('topic', true).getAttribute('ntiid'));
		}
		Ext.each(lineage,buildPathPart, this);

		path.add(me.buildMenu(
				me.breadcrumbTpl.insertFirst(me.breadcrumb, ['All Books'], true),
				c
		));

		path.add(me.breadcrumbSepTpl.insertFirst(me.breadcrumb));
		path.add(me.breadcrumbTpl.insertFirst(me.breadcrumb, ['Library']));

		me.breadcrumb.first().addCls('no-hover');

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

		//evt handlers to hide menu on mouseout (w/o click) so they don't stick around forever...
		this.mon(m, {
			scope: this,
			'mouseleave': function(){
				m.leaveTimer = setTimeout(function(){m.hide()}, 500);
			},
			'mouseenter': function(){
				clearTimeout(m.leaveTimer);
			}
		});

		pathPartEl.on('mouseenter', function(){
			m.showBy(pathPartEl,'tl-bl?', [-10,0]);
			m.leaveTimer = setTimeout(function(){m.hide()}, 2000);
		});

		this.menuMap = menus;

		return pathPartEl;
	},


	enumerateBookSiblings: function(locInfo,items){
		Library.each(function(o){
			var id = o.get('NTIID');
			items.push({
				rememberLastLocation: true,
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

	hasChildren: function(n){
		var num = 0,
			node = n;

		node = Ext.fly(node).first('topic', true);

		if (!node) { return false; }

		for(;node.nextSibling; node = node.nextSibling){
			if(!/topic/i.test(node.tagName) || parseInt(node.getAttribute('levelnum'), 10) > 2){ continue; }
			num++;
		}
		return (num > 0);
	},

	clicked: function(me,dom){}
});

