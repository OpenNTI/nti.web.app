Ext.define('NextThought.view.content.JumpBox',{
	extend: 'Ext.Component',
	alias: 'widget.content-jumper',
	requires: [
		'NextThought.view.menus.JumpTo'
	],
	ui: 'content-jumpbox',
	cls: 'jumpto',

	renderTpl: [
		'<div class="shrink-wrap">',
			'<div class="label">chapter</div>',
			'<div><span class="menu">section</span></div>',
		'</div>'
	],

	renderSelectors: {
		shrinkWrapEl: 'div.shrink-wrap',
		labelEl: 'div.label',
		menuEl: 'span.menu'
	},

	initComponent: function(){
		var me = this, cfg = {
			ownerButton: me,
			listeners: {
				scope: me,
				hide: function(){
					var e = me.el;
					if(e){ e.removeCls('active'); }
				}
			}
		};

		me.callParent(arguments);
		me.chapterMenu = Ext.widget('jump-menu',Ext.apply({},cfg));
		me.sectionMenu = Ext.widget('jump-menu',Ext.apply({},cfg));
		me.locationChanged();
		LocationProvider.on('change',me.locationChanged,me);
	},


	afterRender: function(){
		this.callParent();
		this.shrinkWrapEl.addClsOnOver('over')
				.addClsOnFocus('active')
				.on('click',this.clicked,this);
	},


	locationChanged: function(ntiid){
		var loc = LocationProvider.getLocation(ntiid),
			currentNode = loc.location,
			isChapter,
			node,
			sections = [],
			chapters = [],
			currentChapter,
			currentSection;
		if(!loc || !loc.NTIID){
			this.hide();
			return;
		}
		else if(this.isHidden()){
			this.show();
		}


		isChapter = /toc/i.test(currentNode.parentNode.tagName);
		node = isChapter? currentNode.firstChild : currentNode.parentNode.firstChild;
		currentChapter = isChapter? currentNode : currentNode.parentNode;
		currentSection = isChapter? null : currentNode;

		for(;node.nextSibling; node = node.nextSibling){
			if(!/topic/i.test(node.tagName)){continue;}
			sections.push({
				text	: node.getAttribute('label'),
				ntiid	: node.getAttribute('ntiid'),
				cls		: node===currentSection?'current':''
			});
		}

		Ext.each(Ext.query('toc > topic[href]',loc.toc),function(o){
			chapters.push({
				text	: o.getAttribute('label'),
				ntiid	: o.getAttribute('ntiid'),
				cls		: o===currentChapter?'current':''
			});
		});

		this.chapterMenu.removeAll();
		this.chapterMenu.add(chapters);

		this.sectionMenu.removeAll();
		this.sectionMenu.add(sections);

		this.labelEl.update(currentChapter.getAttribute('label'));
		this.menuEl.update(currentSection?currentSection.getAttribute('label'):'Chapter Index');
		this.ownerCt.updateLayout();
	},


	clicked: function(me,dom){
		var m = this.sectionMenu, e = this.menuEl;
		if(dom === this.labelEl.dom){
			m = this.chapterMenu;
			e = this.labelEl;
		}
		m.showBy(e,'tl-bl?', [-10,5]);
		this.el.addCls('active');
	}
});
