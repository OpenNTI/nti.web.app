Ext.define('NextThought.app.slidedeck.media.Toolbar', {
	extend: 'Ext.Component',
	alias: 'widget.media-toolbar',

	layout: {
		type: 'hbox',
		align: 'stretch'
	},
	border: false,
	plain: true,
	cls: 'media-toolbar',

	renderTpl: new Ext.XTemplate(Ext.DomHelper.markup([{
		cls: 'left', cn: [
			{cls: 'control back-button', 'data-qtip': 'Exit'},
			{cls: 'navigation', cn: [
				'{[this.splitNumberFromTitle(values)]}',
				{tag: 'tpl', 'if': 'sectionNumber', cn: [
					{ cls: 'section-number', html: '{sectionNumber}' }
				]},
				{
					cls: 'wrap',
					cn: [
						{ cls: 'section-name', html: '{description}'},
						{ cls: 'title', html: '{title}'}
					]
				}
			]}
		]},{
		cls: 'right', cn: [
			{cls: 'video-picker', cn: [
				{cls: 'grid-view'},
				{cls: 'selected-mv-type hasTranscript video-focus', html: 'split video'}
			]}
		]
	}]), {
		splitNumberFromTitle: function(values) {
			var s = (values.title || '').split(' '),
				number = s.shift(),
				numberVal = parseFloat(number),
				title = s.join(' ');

			if (!values.sectionNumber && !isNaN(numberVal) && isFinite(numberVal)) {
				values.sectionNumber = number;
				values.title = title;
			}
		}
	}),

	renderSelectors: {
		gridEl: '.grid-view',
		pickerEl: '.selected-mv-type',
		exitEl: '.back-button'
	},

	clsToName: function(cls) {
		var map = {
			'video-focus': 'Split Video',
			'transcript-focus': 'Split Transcript',
			'full-video': 'Full Video'
		};

		return map[cls];
	},

	initComponent: function() {
		var me = this;
		me.callParent(arguments);
		me.currentType = me.currentType || 'video-focus';
		me.enableBubble('exit-viewer');

		me.on({
			pickerEl: { click: 'showVideoPlayerPicker' },
			gridEl: { click: 'showGridPicker' },
			exitEl: { click: function() { me.fireEvent('exit-viewer'); } }
		});
	},


	beforeRender: function() {
		this.callParent(arguments);

		var t = this.currentType,
			title = this.video && this.video.get('title'),
			description = this.video && this.video.get('description'),
			sectionNumber = null;//this.video && this.video.get('section'); //this isn't what 'section' means.

		this.renderData = Ext.apply(this.renderData || {}, { type: t, title: title, description: description, sectionNumber: sectionNumber });
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.noTranscript) {
			this.pickerEl.removeCls('hasTranscript');
		}
		this.pickerEl.removeCls('video-focus').addCls(this.currentType);
		this.pickerEl.update(this.clsToName(this.currentType));
	},


	showGridPicker: function() {
		var el = this.gridEl,
			cls = 'active', me = this,
			action = el.hasCls(cls) ? 'hide' : 'show';

		this.floatParent.showGridViewer(action)
			.then(function() {
				el.toggleCls(cls);
			});
	},


	showVideoPlayerPicker: function() {
		console.log('clicked on show the video player picker..');
		this.createViewPlayerPicker();
		this.videoPicker.showBy(this.pickerEl, 'tl-tl', [0, 0]);
	},


	createViewPlayerPicker: function() {
		var me = this,
			type = this.currentType,
			items = [
				{
					text: me.clsToName('video-focus'),
					cls: 'label video-focus',
					action: 'video-focus',
					checked: type === 'video-focus',
					disabled: this.noTranscript
				},
				{
					text: me.clsToName('transcript-focus'),
					cls: 'label transcript-focus',
					action: 'transcript-focus',
					checked: type === 'transcript-focus',
					disabled: this.noTranscript
				},
				{
					text: me.clsToName('full-video'),
					cls: 'label full-video',
					action: 'full-video',
					checked: type === 'full-video'
				}
			];

		//Make selected item is at the top of the list.
		items = Ext.Array.sort(items, function(a, b) {
			return !a.checked && b.checked;
		});

		this.videoPicker = Ext.widget('menu', {
			cls: 'video-player-options-menu',
			width: 215,
			ownerCmp: me,
			defaults: {
				ui: 'nt-menuitem',
				xtype: 'menucheckitem',
				plain: true,
				listeners: {
					'beforecheckchange': function(item, checked) { return item.allowUncheck !== false; },
					'click': function(item) {
						item.up('menu').ownerCmp.handleClick(item, item.up('menu'));
					}
				}
			},
			items: items
		});
	},


	handleClick: function(item, menu) {
        var previousType = this.currentType, me = this;

        this.floatParent.switchVideoViewer(item.action)
            .then(function() {
				me.pickerEl.removeCls(previousType).addCls(item.action);
				me.pickerEl.update(item.text);
				me.currentType = item.action;

				Ext.each(menu.query('menuitem[checked]'), function(i) {
					i.setChecked(false, true);
				});

				item.setChecked(true, true);
            });

		return false;
	}
});
