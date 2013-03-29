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

		console.log('location changed to:',ntiid);
		var me = this,
			lp = LocationProvider,
			c,
			loc = lp.getLocation(ntiid),
			lineage = lp.getLineage(ntiid),
			parent = lineage.last(),
			book = lineage[0] ? lp.getLocation(lineage[0]) : null,
			path = me.getBreadcrumbPath(),
			iconPath;

		function buildPathPart(i){
			var e,
				l = lp.getLocation(i),
				label = l.label,
				level = parseInt(l.location.getAttribute('levelnum'), 10);
			if (i === ntiid) {
				label = me.levelLabels[level] || label;
			}
			e = me.breadcrumbTpl.insertFirst(me.breadcrumb, [label], true);
			path.add(me.breadcrumbSepTpl.insertFirst(me.breadcrumb));

			me.buildMenu(e,c,parent);
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

		//TODO: clean them out
	},


	buildMenu: function(pathPartEl,locationInfo,parent){
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
			this.enumerateTopicSiblings(currentNode,cfg.items,parent);
		}

		m = menus[key] = Ext.widget(Ext.apply({},cfg));

		//evt handlers to hide menu on mouseout (w/o click) so they don't stick around forever...
		m.mon(pathPartEl, {
			scope: m,
			'mouseleave':m.startHide,
			'mouseenter':function(){
				m.stopHide();
				m.showBy(pathPartEl,'tl-bl?', [-10,0]);
			},
			'click': function(){
				if (!m.isVisible()){
					m.stopHide();
					m.showBy(pathPartEl,'tl-bl?', [-10,0]);
				}
			}
		});

		this.menuMap = menus;

		return pathPartEl;
	},


	enumerateBookSiblings: function(locInfo,items){
		Library.each(function(o){
			var id = o.get('NTIID');
			items.push({
				rememberLastLocation: true,
				text	: o.get('title'),
				ntiid	: id,
				cls		: id===locInfo.ntiid?'current':''
			});
		});
	},



	enumerateTopicSiblings: function(node,items,parent){
		var pres,current = node, num = 1,
			type = '1', separate = '. ', suppress = false;

		if(parent){
			pres = Library.getTitle(parent).get('PresentationProperties');

			if(pres.numbering){
				if(pres.numbering.start){
					num = pres.numbering.start;
				}

				if(pres.numbering.type){
					type = pres.numbering.type;
				}

				if(pres.numbering.separator){
					separate = pres.numbering.separator;
				}

				if(pres.numbering.suppressed){
					suppress = pres.numbering.suppressed;
				}
			}
		}

		if(!current.parentNode){
			console.warn('null parentNode in toc');
			return;
		}

		while(Ext.fly(node).prev()){
			node = Ext.fly(node).prev(null,true);
		}

		for(node;node.nextSibling; node = node.nextSibling){
			if(!/topic/i.test(node.tagName)){ continue; }
			if(suppress){
				items.push({
					text	: node.getAttribute('label'),
					ntiid	: node.getAttribute('ntiid'),
					cls		: node===current?'current':''
				});
			}else{
				items.push({
					text	: this.styleList(num,type) + separate +node.getAttribute('label'),
					ntiid	: node.getAttribute('ntiid'),
					cls		: node===current?'current':''
				});
			}
			num++;
		}
	},
	
	//num - the number in the list; style - type of numbering '1','a','A','i','I'
	styleList: function(num,style){
		if(style === 'a'){
			return this.toBase26SansNumbers(num);
		}

		if(style === 'A'){
			return this.toBase26SansNumbers(num).toUpperCase();
		}

		if(style === 'i'){
			return this.toRomanNumeral(num).toLowerCase();
		}

		if(style === 'I'){
			return this.toRomanNumeral(num).toUpperCase();
		}

		return num;
	},

	//from: http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
	toRomanNumeral: function(num){
		var digits, key, roman, i;

		digits = String(+num).split("");
		key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
		       "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
		       "","I","II","III","IV","V","VI","VII","VIII","IX"];
		roman = "";
		i = 3;
		while (i--){
			roman = (key[+digits.pop() + (i * 10)] || "") + roman;
		}
		return new Array(+digits.join("") + 1).join("M") + roman;
	},

	toBase26SansNumbers: function(num){		
		var val = (num -1) % 26,
			letter = String.fromCharCode(97 + val),
			num2 = Math.floor((num-1)/26);
		if(num2 > 0){
			return this.toBase26SansNumbers(num2) + letter;
		}else{
			return letter;
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

