const Ext = require('@nti/extjs');

const Globals = require('legacy/util/Globals');
const { getString } = require('legacy/util/Localization');

require('legacy/common/ux/ComponentReferencing');
require('./Container');
require('./Editor');
require('./Item');

module.exports = exports = Ext.define(
	'NextThought.app.contentviewer.notepad.View',
	{
		extend: 'Ext.Component',
		alias: 'widget.content-notepad',

		plugins: ['component-referencing'],

		ui: 'reader-notepad',

		renderTpl: new Ext.XTemplate(
			Ext.DomHelper.markup([
				{
					cls: 'scroller',
					cn: [
						{
							cls: 'note-here',
							html:
								'{{{NextThought.view.content.notepad.View.addnote}}}',
						},
					],
				},
			])
		),

		renderSelectors: {
			scroller: '.scroller',
			boxEl: '.note-here',
		},

		//reference functions will not exist until after the constructor returns. #initComponent() is called in the middle
		// of the constructor, so we cannot us that. AfterRender maybe the best place to setup, or subclass constructor.
		refs: [
			{ ref: 'readerRef', selector: '' }, //set this in config.
		],

		//</editor-fold>

		//<editor-fold desc="Setup & Init">
		constructor: function () {
			this.callParent(arguments);
			this.notepadItems = {};
			this.groupedLines = {};
			this.on({
				'editor-open': 'lock',
				'editor-closed': 'unlock',
				'detect-overflow': { fn: 'detectOverflow', buffer: 100 },
				afterRender: 'setupBindsToReaderRef',
				activate: 'syncScroll',
				el: {
					scroll: 'onSyncScroll',
					contextmenu: 'eat',
					mousemove: 'onMouseTrack',
					mouseover: 'onMouseTrack',
					mouseout: 'onMouseOut',
					mousewheel: 'onPushScroll',
					DOMMouseScroll: 'onPushScroll',
				},
				boxEl: {
					click: 'onClick',
					mouseover: 'eat',
					mousemove: 'eat',
					contextmenu: 'noteHereMenu',
				},
			});
		},

		afterRender: function () {
			this.callParent(arguments);
			this.boxEl.setVisibilityMode(Ext.Element.ASCLASS).visibilityCls =
				'hidden';
		},

		setupBindsToReaderRef: function () {
			var ref = this.getReaderRef();

			try {
				this.syncHeight();

				if (ref) {
					ref.notepadRef = this;

					this.mon(ref, {
						scroll: 'syncScroll',
						'sync-height': 'syncHeight',
						'set-content': 'clearItems',
					});
				}
			} catch (e) {
				console.error(e.stack || e.message || e);

				Ext.defer(this.setupBindsToReaderRef, 1, this);
			}
		},

		//</editor-fold>

		//<editor-fold desc="Editor">
		editorCleanup: function () {
			if (this.editor) {
				this.editor.destroy();
			}
			delete this.suspendMoveEvents;
			delete this.editor;
		},

		openEditor: function (lineInfo) {
			if (this.editor && !this.editor.isDestroyed) {
				return false;
			}

			this.lock();

			this.editor = Ext.widget({
				xtype: 'notepad-editor',
				lineInfo: lineInfo || {},
				ownerCmp: this,
				renderTo: this.scroller,
			});

			this.editor.setLocalY(this.boxEl.getLocalY());
			this.boxEl.hide();
			this.editor.focus();

			this.mon(this.editor, {
				blur: 'commitEditor',
				destroy: 'unlock',
			});

			return true;
		},

		commitEditor: function (editor) {
			this.savingNewNote = true;
			this.saveNewNote(editor);
		},

		saveNewNote: function (editor) {
			var me = this,
				note = editor.getValue(),
				reader = me.getReaderRef(),
				style = editor.lineInfo.style || 'suppressed',
				rangeInfo;

			function afterSave(success) {
				delete me.savingNewNote;
				editor.unmask();
				if (success) {
					editor.destroy();
				}
			}

			//Avoid saving empty notes or just returns.
			if (editor.isEmpty()) {
				editor.destroy();
				return false;
			}

			editor.mask(
				getString('NextThought.view.content.notepad.View.saving')
			);
			try {
				if (reader) {
					rangeInfo = reader
						.getNoteOverlay()
						.rangeForLineInfo(editor.lineInfo, style);
					reader.fireEvent(
						'save-new-note',
						null,
						note,
						rangeInfo.range,
						rangeInfo.container || reader.getLocation().NTIID,
						null,
						style,
						afterSave
					);
				}
			} catch (error) {
				console.error('Error saving note - ' + Globals.getError(error));
				alert(getString('NextThought.view.content.notepad.View.error'));
				editor.unmask();
			}
			return false;
		},

		//</editor-fold>

		//<editor-fold desc="Mouse Event Handlers">
		cleanupLine: function () {
			this.boxEl.hide();
			delete this.lastLine;
		},

		lock: function () {
			this.suspendMoveEvents = true;
			Ext.defer(this.boxEl.hide, 1, this.boxEl);
		},

		unlock: function () {
			delete this.suspendMoveEvents;
		},

		eat: function (e) {
			clearTimeout(this.hideTimer);
			e.stopEvent();
			return false;
		},

		onClick: function () {
			if (this.suspendMoveEvents) {
				return;
			}
			this.openEditor(this.lastLine);
		},

		onMouseOut: function () {
			if (this.suspendMoveEvents) {
				return;
			}
			clearTimeout(this.hideTimer);
			this.hideTimer = Ext.defer(this.cleanupLine, 500, this);
		},

		onMouseTrack: function (e) {
			if (this.suspendMoveEvents) {
				return;
			}

			var lineY = this.getContentY(e),
				lineInfo = this.getLineInfo(lineY);

			if (lineInfo) {
				clearTimeout(this.hideTimer);
				this.boxEl.show().setLocalY(lineInfo.rect.top);
				this.lastLine = lineInfo;
			}
		},

		//</editor-fold>

		//<editor-fold desc="Synchronizing Handlers">
		syncHeight: function () {
			var reader = this.getReaderRef(),
				iFrame = reader && reader.getIframe().get();

			if (reader) {
				this.scroller.setHeight(iFrame && iFrame.getHeight());
			}
		},

		syncScroll: function () {
			if (!this.rendered) {
				return;
			}

			var reader = this.getReaderRef();

			if (reader) {
				this.getEl().setScrollTop(reader.getScroll().top());
			}
		},

		onSyncScroll: function () {},

		onPushScroll: function pushScroll(e) {
			var d = e.getWheelDelta(),
				h = this.scroller.getHeight() / this.getHeight() / 2, //make sure the scale kinda matches
				reader = this.getReaderRef();

			if (reader) {
				reader.getScroll().by(d * h);
			}
		},

		//</editor-fold>

		//<editor-fold desc="Line Resolving">
		getContentY: function (e) {
			var ref = this.getReaderRef(),
				t = ref && ref.getAnnotationOffsets().top;
			return e.getY() - (t || 0);
		},

		getLineInfo: function (y) {
			var reader = this.getReaderRef();

			return reader.getNoteOverlay().lineInfoForY(y);
		},

		//</editor-fold>

		clearItems: function () {
			var k,
				m = this.notepadItems || {},
				g = this.groupedLines || {},
				el;

			for (k in m) {
				if (m.hasOwnProperty(k)) {
					el = m[k].getEl();
					Ext.destroy(m[k]);
					Ext.destroy(el);
					delete m[k];
				}
			}

			for (k in g) {
				if (g.hasOwnProperty(k)) {
					el = g[k].getEl && g[k].getEl();
					Ext.destroy(g[k]);
					Ext.destroy(el);
					delete g[k];
				}
			}

			this.scroller.select('div:not(.note-here)').remove();
		},

		noteHereMenu: function (e) {
			return this.eat(e); //maybe show a context menu?
		},

		detectOverflow: function () {
			console.log('overflow detection');

			// let collided = {};
			let els,
				resort = false;

			function doesCollide(el, set) {
				var top = el.getLocalY(),
					height = el.getHeight(),
					bottom = height + top,
					id = el.getAttribute('id'),
					cut = 0;

				//console.log(id, top, height, bottom);

				set.each(function (e) {
					var t = e.getLocalY(),
						h = e.getHeight(),
						i = e.getAttribute('id'),
						b = h + t;

					if (i !== id) {
						//overlay
						if (top === t && bottom === b) {
							//shouldn't be possible with this UI
							console.warn(
								id,
								'is on top of, or below ',
								i,
								[top, t],
								[bottom, b]
							);
							cut = -2;
						}
						//contained
						else if (top >= t && bottom <= b) {
							//shouldn't be possible with this UI
							console.warn(
								id,
								'is contained within ',
								i,
								[top, t],
								[bottom, b]
							);
							cut = -1;
						}
						//collided into
						else if (top <= t && bottom >= t) {
							console.log(
								id,
								'collided into',
								i,
								[top, t],
								[bottom, b]
							);
							cut = t;
						}
						//collided by
						// else if(top > t && top < b && bottom <= b){
						// 	shouldn't be possible with the current sort order
						// 	console.log(id,'collided by',i, [top, t], [bottom, b]);
						// 	cut = -3;
						// }
					}
					return !cut;
				});

				return cut > 0 ? cut - top : cut;
			}

			els = this.el.select('.scroller > *:not(.note-here)').slice();
			els.sort(function (a, b) {
				var c = Ext.fly(a).getLocalY() - Ext.fly(b).getLocalY();
				if (c > 0) {
					resort = true;
				}
				return c;
			});

			resort =
				!this.editor &&
				resort &&
				new Ext.dom.CompositeElement(els).filter('.edit').getCount() ===
					0;

			new Ext.dom.CompositeElement(els)
				.removeCls('collide')
				.setHeight('auto')
				.setStyle({ minHeight: null })
				.each(function (el, c) {
					var d = Ext.getDom(el),
						i = doesCollide(el, c);

					//make sure nodes are in sorted order by reinserting them into the dom.(moving them)
					if (resort) {
						d.parentNode.appendChild(d);
					}

					if (i > 0) {
						el.addCls('collide');
						el.setHeight(i);
						el.setStyle({ minHeight: i + 'px' });
					}
				});
		},

		addOrUpdate: function (annotation, yPlacement) {
			yPlacement = Math.round(yPlacement);
			if (yPlacement < 5) {
				yPlacement = 5;
			}

			var map = this.notepadItems,
				groups = this.groupedLines,
				round = 10,
				y = yPlacement < round ? round : yPlacement,
				o = map[annotation.id],
				groupId =
					'item-grouping-' +
					Math.floor(
						(yPlacement < round ? round : yPlacement) / round
					) *
						round,
				group = groups[groupId];

			if (!o) {
				o = map[annotation.id] = Ext.widget({
					xtype: 'notepad-item',
					floatParent: this,
					renderTo: this.scroller,
				});

				if (!group) {
					group = [annotation.id];
				} else if (!this.groupContains(group, annotation.id)) {
					if (!group.isNotepadItemContainer) {
						group = Ext.widget({
							xtype: 'notepad-item-container',
							floatParent: this,
							renderTo: this.scroller,
						});
						group.add(this.getItemsReferenced(groups[groupId]));
						group.on('destroy', function () {
							delete groups[groupId];
						});
					}
					group.add(o);
				}

				groups[groupId] = group;
				if (group.isNotepadItemContainer) {
					group.setLocalY(y);
				}
			}

			o.updateWith({
				annotation: annotation,
				record: annotation.getRecord(),
				placement: y,
			});
		},

		getItemsReferenced: function (itemRefs) {
			var m = this.notepadItems;

			return Ext.Array.map(itemRefs, function (v) {
				return m[v];
			});
		},

		groupContains: function (group, value) {
			if (Ext.isArray(group)) {
				return Ext.Array.contains(group, value);
			}

			return group.contains(this.notepadItems[value]);
		},
	}
);
