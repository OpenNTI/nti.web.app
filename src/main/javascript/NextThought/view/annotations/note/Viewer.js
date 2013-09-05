Ext.define('NextThought.view.annotations.note.Viewer', {
	extend: 'Ext.container.Container',
	alias: 'widget.note-window',

	requires: [
		'Ext.util.KeyMap',
		'NextThought.view.annotations.note.Main'
	],

	mixins: {
		instanceTracking: 'NextThought.mixins.InstanceTracking'
	},
	
	cls: 'note-window',
	ui: 'note-window',
	width: 780,
	floating: true,
	shadow: false,
	//preventBringToFront:true,
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	items: [
		{
			xtype: 'box',
			autoEl: {
				cls: 'title-bar nti-window-header',
				cn: [
					{
						cls: 'close-note-viewer'
					}
				]
			},
			listeners: {
				'click': {
					element: 'el',
					fn: 'closeViewer'
				}
			},
			closeViewer: function (e) {
				if (!e.getTarget('.close-note-viewer')) {
					return;
				}

				this.getRefOwner().close();
			}
		},
		{
			noteWindowBody: true,
			xtype: 'container',
			cls: 'note-content-container scrollbody',
			flex: 1,
			autoScroll: true,
			items: [
				{xtype: 'note-main-view' },
				{xtype: 'box', cls: 'note-footer'}
			]
		}
	],

	constructor: function (config) {
		this.fireEvent('before-new-note-viewer', this, config && (config.reader || config.ownerCmp || config.floatParent));
		Ext.each(this.getInstances(), function(w){ w.closeOrDie(); });
		this.callParent(arguments);
		this.trackThis();
	},


	initComponent: function () {
		var m, annotationView = this.up && this.up('annotation-view');
		this.callParent(arguments);

		m = this.down('note-main-view');
		m.reader = this.reader || this.ownerCmp || this.floatParent;

		if (this.isEdit) {
			m.editMode = this.isEdit;
		}

		if (this.replyToId) {
			m.replyToId = this.replyToId;
		}
		if (this.scrollToId) {
			m.scrollToId = this.scrollToId;
		}

		if (annotationView) {
			this.mon(annotationView, 'itemclick', function (view, rec) {
				if (this.record === rec) {
					this.close();
				}
			}, this);
		}

		m.setRecord(this.record);
		m.on('destroy', 'destroy', this);
	},

	afterRender: function () {
		this.callParent();

		function closeOnCardChange(cmp, me) {
			var c = cmp.up('{isOwnerLayout("card")}');
			me = me || cmp;
			if (c) {
				me.mon(c, {
					'beforedeactivate': 'close',//attempt to let this veto the deactivate
					'deactivate': 'destroy'//if deactivated, die
				});
				closeOnCardChange(c, me);
			}
		}

		closeOnCardChange(this.reader, this);

		this.resizeView();
		var keyMap = this.keyMap = new Ext.util.KeyMap({
			target: this.el,
			binding: [
				{
					key: Ext.EventObject.ESC,
					fn: this.onEsc,
					scope: this
				}
			]
		});

		this.on('destroy', 'destroy', keyMap);
	},


	onEsc: function (k, e) {
		e.stopEvent();
		this.close();
	},


	resizeView: function () {
		var position, height, width,
			viewportHeight = Ext.Element.getViewportHeight(),
			reader = this.reader;

		if (reader) {
			position = reader.getPosition();
			position[0] -= 10;
			position[1] += 10;
			width = reader.getWidth() + 20;
			height = viewportHeight - position[1];

			this.setPosition(position);
			this.setWidth(width);
			this.setHeight(height);
		}
	},


	canClose: function () {
		var noteMain = this.down('note-main-view');
		return !noteMain || !noteMain.editorActive();
	},


	closeOrDie: function () {
		if (!this.close()) {
			Ext.Error.raise('Editor open, refusing to close.');
		}
	},


	close: function () {
		//Only close if the editor is not active.
		if (this.canClose()) {
			this.destroy();
			return true;
		}

		this.warnBeforeDismissingEditor();
		return false;
	},


	warnBeforeDismissingEditor: function () {
		Ext.defer(alert, 1, null, [
			{
				msg: "You are currently creating a reply, please save or cancel it first."
			}
		]);
	}
});
