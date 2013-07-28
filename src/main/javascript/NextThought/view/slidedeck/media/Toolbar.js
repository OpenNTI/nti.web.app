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
				{cls:'full-screen'},
				{cls:'picker', html:'split transcript'}
			]}
		]
	}]),

	renderSelectors:{
		pickerEl: '.picker'
	},

	afterRender: function(){
		this.callParent(arguments);

		this.createViewPlayerPicker();
		this.mon(this.el.down('.picker'), {
			scope: this,
			click: 'showVideoPlayerPicker'
		});


	},

	showVideoPlayerPicker: function(){
		console.log('clicked on show the video player picker..');
		this.videoPicker.showBy(this.pickerEl, 'tl-bl', [70,15]);
	},

	createViewPlayerPicker: function(){
		var me = this;
		this.videoPicker = Ext.widget('menu',{
			ui: 'nt',
			cls:'video-player-options-menu',
			plain: true,
			shadow: false,
			width: 160,
			ownerCmp: me,
			multiSelect:false,
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
			items: [
				{ text:'Split Transcript', cls:'label', action: 'transcript-centric' },
				{ text:'Split Video', cls:'label', action:'video-centric', checked:true}
			]
		});
	},

	handleClick: function(item, menu){
		if(this.currentType !== item.action){
			console.log('should switch to this view: ',item);
			this.currentType = item.action;

			Ext.each(menu.query('menuitem[checked]'), function(i){
				i.setChecked(false, true);
			});
			item.setChecked(true, true);
			this.fireEvent('switch-video-viewer', item.action);
		}
		return false;
	}
});