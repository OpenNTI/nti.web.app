const Ext = require('@nti/extjs');
const { wait } = require('@nti/lib-commons');
const UserRepository = require('internal/legacy/cache/UserRepository');

require('internal/legacy/common/ux/Pointer');
require('./Preview');

module.exports = exports = Ext.define(
	'NextThought.app.account.activity.Popout',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.activity-popout',
		width: 400,
		floating: true,
		constrain: true,
		constrainTo: Ext.getBody(),
		maxHeight: Ext.Element.getViewportHeight(),
		shadow: false,
		layout: 'auto',
		cls: 'activity-popout',
		hideMode: 'visibility',
		previewPrefix: 'widget.activity-preview-',

		initComponent: function () {
			var me = this;

			this.callParent(arguments);

			this.pointer = Ext.widget('pointer', {
				baseCmp: this,
				pointToEl: this.refEl,
				getPointerStyle: Ext.bind(this.getPointerStyle, this),
			});

			this.on({
				destroy: 'destroy',
				show: 'show',
				hide: 'hide',
				scope: this.pointer,
				resize: function () {
					me.fireEvent('realign');
				},
			});

			if (this.viewRef && this.viewRef.on) {
				this.mon(this.viewRef, {
					refresh: 'itemRefreshed',
					itemupdate: 'itemUpdated',
				});
			}

			this.setupItems();
		},

		setupItems: function () {
			var wName = this.getPreviewPanel();

			if (Ext.isArray(wName)) {
				wName = wName.first();
			}

			if (Ext.isEmpty(wName)) {
				console.error(
					'Developer Error: a view is not defined for: ' +
						this.record.$className
				);
				wait().then(this.destroy.bind(this));
				return;
			}
			this.preview = this.add({
				xtype: wName,
				record: this.record,
				user: this.user,
			});
		},

		getPreviewPanel: function () {
			var c = this.record.getClassForModel(this.previewPrefix, false);
			return (c && c.xtype) || '';
		},

		getPointerStyle: function (x, y) {
			var p = this.preview;
			return p.getPointerStyle ? p.getPointerStyle(x, y) : '';
		},

		itemRefreshed: function (view) {
			var el = view.getNodeByRecord(this.record);

			if (el) {
				this.updateRefEl(el);
			} else {
				console.error('RefEl no longer exists');
				// Why do we destroy the popout here?
				// it was destroying the popout on every added reply. So it's commented for now.
				// The refEl might have changed but that doesn't mean the parent (note) rec doesn't exist anymore.
				// this.destroy();
			}
		},

		itemUpdated: function (rec, index, node) {
			if (this.record === rec) {
				this.updateRefEl(node);
			}
		},

		updateRefEl: function (el) {
			this.refEl = el;
			this.pointer.pointToEl = el;
			this.pointer.point();
		},

		afterRender: function () {
			var me = this;
			me.callParent(arguments);
			me.mon(
				me.el,
				'click',
				function (e) {
					e.stopPropagation();
				},
				me
			);
			me.relayEvents(me.el, ['mousemove']);

			me.on('blur', me.maybeHidePopout, me);

			Ext.defer(function () {
				if (me.el) {
					me.mon(me.el.up('body'), {
						scope: me,
						click: 'detectBlurClick',
						mouseover: 'detectBlur',
					});
				}
			}, 1);
		},

		detectBlurClick: function (e) {
			if (
				!e.getTarget('.' + this.cls) &&
				(!this.preview || !this.preview.openEditor)
			) {
				clearTimeout(this.hideTimer);
				//this.hideTimer = Ext.defer(function(){this.fireEvent('blur');},1, this);
				this.maybeHidePopout();
			} else {
				clearTimeout(this.hideTimer);
			}
		},

		detectBlur: function (e) {
			var isMe =
				e.getTarget('.' + this.cls) ||
				e.getTarget('#' + this.refEl && this.refEl.id) ||
				e.getTarget('.x-menu') ||
				e.getTarget('.contact-popout');

			if (!isMe && (!this.preview || !this.preview.openEditor)) {
				clearTimeout(this.hideTimer);
				this.hideTimer = Ext.defer(
					function () {
						this.fireEvent('blur');
					},
					500,
					this
				);
			} else {
				clearTimeout(this.hideTimer);
			}
		},

		maybeHidePopout: function () {
			// NOTE: This allows for children, especially the preview to cancel hiding the Popout
			// i.e when the editor is active.
			if (this.fireEvent('beforedeactivate')) {
				if (
					this.preview &&
					!this.preview.fireEvent('beforedeactivate')
				) {
					return false;
				}
				this.destroy();
				return true;
			}
			return false;
		},

		inheritableStatics: {
			beforeShowPopup: function (record, el) {
				var id = record.getId(),
					canShow = true;
				//TODO: rework this to not use the query
				Ext.each(
					Ext.ComponentQuery.query('activity-popout,contact-popout'),
					function (o) {
						if (
							o.record.getId() !== id ||
							record.modelName !== o.record.modelName
						) {
							if (!o.maybeHidePopout()) {
								canShow = false; //leave it open
							}
						} else {
							o.updateRefEl(el);
							canShow = false;
						}
					}
				);

				return canShow && !el.hasCls('deleted');
			},

			popup: function (record, el, viewRef, anchor, cb) {
				if (!this.beforeShowPopup(record, el)) {
					return;
				}

				var me = this,
					creator = record.get('Creator');

				function finish(user) {
					var pop, sidebar;

					function align() {
						if (!pop) {
							return;
						}

						pop.maxHeight = Ext.dom.Element.getViewportHeight();
						if (Ext.getBody().contains(pop.refEl)) {
							pop.alignTo(
								pop.refEl,
								'tr-tl?',
								anchor || [-10, 0]
							);
						}
						pop.show();
						pop.pointer.point();

						if (this.preview && this.preview.setupReplyScrollZone) {
							this.preview.setupReplyScrollZone();
						}
					}

					pop = Ext.create(me.$className, {
						renderTo: Ext.getBody(),
						record: record,
						user: user,
						refEl: Ext.get(el),
						hidden: true,
						viewRef: viewRef,
						getBubbleTarget: function () {
							return viewRef;
						},
						listeners: {
							realign: align,
						},
					});

					if (Ext.is.iOS) {
						//Make the comments in popouts scrollable
						if (pop.el.down('.replies')) {
							pop.el.down('.replies').addCls('scrollable');
						}

						//If popout decides to change position when typing, put it back
						if (pop.el.down('.content')) {
							pop.el
								.down('.respond')
								.down('.content')
								.on('focus', function () {
									Ext.defer(function () {
										pop.firstY = pop.getY();
									}, 100);
								});
							pop.el
								.down('.respond')
								.down('.content')
								.on('keydown', function () {
									window.clearTimeout(me.popYTimeout);
									me.timeElapsed = 0;
									me.popYTimeout = window.setInterval(
										function () {
											if (
												pop.getY() !== pop.firstY ||
												me.timeElapsed >= 900
											) {
												pop.setY(pop.firstY);
												window.clearInterval(
													me.popYTimeout
												);
											}
											me.timeElapsed += 100;
										},
										100
									);
								});
						}
					}

					if (viewRef) {
						if (viewRef.cancelPopupTimeout) {
							pop.mon(
								pop,
								'mouseover',
								viewRef.cancelPopupTimeout,
								viewRef
							);
						}

						sidebar =
							(viewRef.up && viewRef.up('main-sidebar')) ||
							Ext.ComponentQuery.query('main-sidebar').first();
						if (sidebar) {
							pop.mon(sidebar, 'move', align);
						}
						pop.on('adjust-height', align);
					}
					align();

					Ext.callback(cb, null, [pop]);
				}

				if (Ext.isEmpty(creator)) {
					finish(creator);
				} else {
					UserRepository.getUser(record.get('Creator'), finish);
				}
			},
		},
	}
);
