Ext.define('NextThought.view.content.JumpBox',{
	extend: 'Ext.Component',
	alias: 'widget.content-jumper',
	requires: [
		'NextThought.view.menus.JumpTo'
	],
	ui: 'content-jumpbox',
	cls: 'jumpto',

	renderTpl: [
		'<div class="label">chapter</div>',
		'<div class="menu">section</div>'
	],

	renderSelectors: {
		labelEl: 'div.label',
		menuEl: 'div.menu'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.chapterMenu = Ext.widget('jump-menu',{
			ownerButton: this
		});

		this.sectionMenu = Ext.widget('jump-menu',{
			ownerButton: this
		});

		this.locationChanged();
		LocationProvider.on('change',this.locationChanged,this);
	},


	afterRender: function(){
		this.callParent();
		this.el.addClsOnOver('over')
				.addClsOnFocus('active')
				.on('click',this.clicked,this);
	},


	locationChanged: function(ntiid){
		var loc = LocationProvider.getLocation(ntiid);
		if(!loc || !loc.NTIID){
			this.hide();
			return;
		}
		else if(this.isHidden()){
			this.show();
		}

		this.menuEl.update(loc.label);
	},


	clicked: function(me,dom){
		var m = this.sectionMenu, e = this.menuEl;
		if(dom === this.labelEl.dom){
			m = this.chapterMenu;
			e = this.labelEl;
		}
		m.showBy(e,'t-b?');
	}
});
