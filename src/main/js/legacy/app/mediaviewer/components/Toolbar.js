var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.mediaviewer.components.Toolbar', {
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
					{ cls: 'section-number'}
				]},
				{
					cls: 'wrap',
					cn: [
						{ cls: 'section-name'},
						{ cls: 'title'}
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
			splitNumberFromTitle: function (values) {
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
		exitEl: '.back-button',
		titleEl: '.navigation .wrap .title',
		sectionNameEl: '.navigation .wrap .section-name'
	},

	clsToName: function (cls) {
		var map = {
			'video-focus': 'Split Video',
			'transcript-focus': 'Split Transcript',
			'full-video': 'Full Video'
		};

		return map[cls];
	},

	initComponent: function () {
		var me = this;
		me.callParent(arguments);
		me.currentType = me.currentType || 'video-focus';
		me.enableBubble('exit-viewer');

		me.on({
			pickerEl: { click: 'showVideoPlayerPicker' },
			gridEl: { click: 'showGridPicker' },
			exitEl: { click: function () { me.fireEvent('exit-viewer'); } }
		});
	},


	setContent: function (video, transcript) {
		var me = this, title, description;

		me.video = video;
		me.transcript = transcript;
		me.noTranscript = !transcript;
		title = me.video && me.video.get('title'),
		description = me.video && me.video.get('description');

		me.onceRendered.then(function () {
			me.titleEl.update(title);
			me.sectionNameEl.update(description);

			if (me.noTranscript) {
				me.pickerEl.removeCls('hasTranscript');
			}
			else {
				me.pickerEl.addCls('hasTranscript');
			}
		});

	},


	afterRender: function () {
		this.callParent(arguments);
		this.pickerEl.removeCls('video-focus').addCls(this.currentType);
		this.pickerEl.update(this.clsToName(this.currentType));
	},


	showGridPicker: function () {
		var el = this.gridEl,
			cls = 'active', me = this,
			action = el.hasCls(cls) ? 'hide' : 'show';

		this.floatParent.showGridViewer(action)
			.then(function () {
				el.toggleCls(cls);
			});
	},


	toggleGridPicker: function () {
		var el = this.gridEl,
			cls = 'active';

		el.toggleCls(cls);
	},


	showVideoPlayerPicker: function () {
		console.log('clicked on show the video player picker..');

		// No menu, if we don't have a transcript.
		if (this.noTranscript) { return; }

		if (!this.videoPicker) {
			this.createViewPlayerPicker();
		}
		this.videoPicker.showBy(this.pickerEl, 'tl-tl', [0, 0]);
	},


	createViewPlayerPicker: function () {
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
		items = Ext.Array.sort(items, function (a, b) {
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
					'beforecheckchange': function (item, checked) { return item.allowUncheck !== false; },
					'click': function (item) {
						item.up('menu').ownerCmp.handleClick(item, item.up('menu'));
					}
				}
			},
			items: items
		});
	},


	updateType (type) {
		this.updateCurrentType(type, this.clsToName(type));
	},


	transcriptFailedToLoad () {
		this.pickerEl.removeCls('hasTranscript');
		this.noTranscript = true;
		this.videoPicker && this.videoPicker.hide();
	},


	handleClick: function (item, menu) {
		var previousType = this.currentType, me = this;

		this.floatParent.switchVideoViewer(item.action)
			.then(function () {
				me.updateCurrentType(item.action,item.text);

				Ext.each(menu.query('menuitem[checked]'), function (i) {
					i.setChecked(false, true);
				});

				item.setChecked(true, true);
			});

		return false;
	},

	updateCurrentType: function (newType, newText) {
		var previousType = this.currentType, me = this;

		newText = newText || this.clsToName(newType);

		me.pickerEl.removeCls(previousType).addCls(newType);
		me.currentType = newType;
		me.pickerEl.update(newText);
	}
});
