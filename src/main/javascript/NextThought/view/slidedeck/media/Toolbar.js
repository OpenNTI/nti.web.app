Ext.define('NextThought.view.slidedeck.media.Toolbar',{
	extend:'Ext.Component',
	alias:'widget.media-toolbar',

	layout:{
		type:'hbox',
		align:'stretch'
	},
	border: false,
	plain: true,
	cls: 'media-toolbar',

	renderTpl: Ext.DomHelper.markup([{
		cls:'left', cn:[
			{cls:'control back-button'},
			{cls:'navigation', cn:[
				{ cls: 'section-number', html:'01' },
				{
					cls: 'wrap',
					cn:[
						{ cls: 'section-name', html:'Introduction to Geology'},
						{ cls: 'title', html: 'origin of the earth'}
					]
				}
			]}
		]},{
		cls:'right', cn:[
			{cls:'video-picker', cn:[
				{cls:'grid-view'},
				{cls:'selected-mv-type video-focus', html:'split video'}
			]}
		]
	}]),

	renderSelectors:{
		pickerEl: '.selected-mv-type',
		exitEl: '.back-button'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.currentType = 'video-focus';
	},


	beforeRender: function(){
		this.callParent(arguments);

		var t = this.currentType;
		this.renderData = Ext.apply(this.renderData || {}, {type:t});
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.pickerEl, {
			scope: this,
			click: 'showVideoPlayerPicker'
		});

		this.mon(this.exitEl, {
			scope: this,
			click: function(){ this.fireEvent('exit-viewer'); }
		});
	},


	showVideoPlayerPicker: function(){
		console.log('clicked on show the video player picker..');
		this.createViewPlayerPicker();
		this.videoPicker.showBy(this.pickerEl, 'tl-tl', [0, 0]);
	},


	createViewPlayerPicker: function(){
		var me = this,
			type = this.currentType,
			items = [
				{ text:'Split Video', cls:'label video-focus', action:'video-focus', checked: type === 'video-focus'},
				{ text:'Split Transcript', cls:'label transcript-focus', action: 'transcript-focus', checked: type === 'transcript-focus'}
			];

		//Make selected item is at the top of the list.
		items = Ext.Array.sort(items, function(a, b){
			return !a.checked && b.checked;
		});

		this.videoPicker = Ext.widget('menu',{
			ui: 'nt',
			cls:'video-player-options-menu',
			plain: true,
			shadow: false,
			width: 215,
			frame:false,
			border: false,
			ownerCmp: me,
			defaults: {
				ui: 'nt-menuitem',
				xtype: 'menucheckitem',
				plain: true,
				listeners: {
					'beforecheckchange':function(item, checked){ return item.allowUncheck!==false; },
					'click': function(item){
						item.up('menu').ownerCmp.handleClick(item, item.up('menu'));
					}
				}
			},
			items: items
		});
	},


	handleClick: function(item, menu){
		if(this.currentType !== item.action){
			var previousType = this.currentType;

			this.pickerEl.removeCls(previousType).addCls(item.action);
			this.pickerEl.update(item.text);
			this.currentType = item.action;

			Ext.each(menu.query('menuitem[checked]'), function(i){
				i.setChecked(false, true);
			});
			item.setChecked(true, true);
			this.fireEvent('switch-video-viewer', item.action);
			menu.destroy();
		}
		return false;
	}
});