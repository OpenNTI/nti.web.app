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

	renderTpl: new Ext.XTemplate(Ext.DomHelper.markup([{
		cls:'left', cn:[
			{cls:'control back-button', 'data-qtip':'Exit'},
			{cls:'navigation', cn:[
				'{[this.splitNumberFromTitle(values)]}',
				{tag:'tpl', 'if':'sectionNumber', cn:[
					{ cls: 'section-number', html:'{sectionNumber}' }
				]},
				{
					cls: 'wrap',
					cn:[
						{ cls: 'section-name', html:'{description}'},
						{ cls: 'title', html: '{title}'}
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
	}]),{
		splitNumberFromTitle: function(values){
			var s = (values.title||'').split(' '),
				number = s.shift(),
				numberVal = parseFloat(number),
				title = s.join(' ');

			if(!values.sectionNumber && !isNaN(numberVal) && isFinite(numberVal)){
				values.sectionNumber = number;
				values.title = title;
			}
		}
	}),

	renderSelectors:{
		gridEl: '.grid-view',
		pickerEl: '.selected-mv-type',
		exitEl: '.back-button'
	},

	initComponent: function(){
		var me = this;
		me.callParent(arguments);
		me.currentType = 'video-focus';
		me.enableBubble('exit-viewer');

		me.on({
			pickerEl: { click: 'showVideoPlayerPicker' },
			gridEl: { click: 'showGridPicker' },
			exitEl: { click: function(){ me.fireEvent('exit-viewer'); } }
		});
	},


	beforeRender: function(){
		this.callParent(arguments);

		var t = this.currentType,
			title  = this.video && this.video.get('title'),
			description = this.video && this.video.get('description'),
			sectionNumber = this.video && this.video.get('section');

		this.renderData = Ext.apply(this.renderData || {}, { type:t, title:title, description:description, sectionNumber:sectionNumber });
	},


	showGridPicker: function(){
		var el = this.gridEl,
			cls = 'active',
			action = el.hasCls(cls)? 'hide' : 'show';//because we haven't toggled yet, we flip the actions.

		el.toggleCls(cls);
		this.fireEvent(action + '-grid-viewer');
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
				{ text:'Split Transcript', cls:'label transcript-focus', action: 'transcript-focus', checked: type === 'transcript-focus'},
				{ text:'Full Video', cls: 'label full-video', action:'full-video', checked: type === 'full-video'}
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
			menu.destroy();//why is this always destroying?
		}
		return false;
	}
});
