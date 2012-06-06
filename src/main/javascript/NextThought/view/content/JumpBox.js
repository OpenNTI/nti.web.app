Ext.define('NextThought.view.content.JumpBox',{
	extend: 'Ext.Component',
	alias: 'widget.content-jumper',
	requires: [
		'NextThought.view.menus.JumpTo'
	],
	ui: 'content-jumpbox',
	cls: 'jumpto',
	minWidth: 40,


	renderTpl: [
		'<div class="shrink-wrap">',
			'<div class="label"><span>{chapter}</span></div>',
			'<div class="menu"><span>{section}</span></div>',
		'</div>'
	],

	renderSelectors: {
		shrinkWrapEl: '.shrink-wrap',
		labelEl: '.label span',
		menuEl: '.menu span'
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

		Ext.applyIf(me.renderData,{
			chapter: 'chapter',
			section: 'section'
		});

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


	show: function(){
		if(this.canShow){
			this.callParent();
		}
		return this;
	},


	locationChanged: function(ntiid){
		var loc = LocationProvider.getLocation(ntiid),
			currentNode = loc ? loc.location: null,
			toc = /toc/i,
			isChapter,
			node,
			sections = [],
			chapters = [],
			currentChapter,
			currentSection;

		if(!loc || !loc.NTIID){
			this.canShow = false;
			this.hide();
			return;
		}
		else if(this.isHidden()){
			this.canShow = true;
			this.show();
		}


		isChapter = toc.test(currentNode.parentNode.tagName);
		node = isChapter? currentNode.firstChild : currentNode.parentNode.firstChild;
		currentChapter = isChapter? currentNode : currentNode.parentNode;
		currentSection = isChapter? null : currentNode;

		if (node){
			for(;node.nextSibling; node = node.nextSibling){
				if(!/topic/i.test(node.tagName)){continue;}
				sections.push({
					text	: node.getAttribute('label'),
					ntiid	: node.getAttribute('ntiid'),
					cls		: node===currentSection?'current':''
				});
			}
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

		if(toc.test(currentNode.tagName)){
			currentChapter = 'Book Cover';
			currentSection = '---------------';
		}
		else {
			currentChapter = currentChapter.getAttribute('label');
			currentSection = currentSection?currentSection.getAttribute('label'):'Chapter Index';
		}

		if(this.rendered) {
			this.labelEl.update(currentChapter);
			this.menuEl.update(currentSection);
			this.ownerCt.updateLayout();
		} else {
			Ext.apply(this.renderData,{
				chapter: currentChapter,
				section: currentSection
			});
		}
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
