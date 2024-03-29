const cx = require('classnames');

const { default: Logger } = require('@nti/util-logger');
const Ext = require('@nti/extjs');
const Anchors = require('internal/legacy/util/Anchors');
const AnnotationUtils = require('internal/legacy/util/Annotations');
// const FilterManager = require('internal/legacy/filter/FilterManager');
const Globals = require('internal/legacy/util/Globals');
const ModelBase = require('internal/legacy/model/Base');
const Redaction = require('internal/legacy/model/Redaction');
const rangy = require('internal/legacy/util/rangy');
const RectUtils = require('internal/legacy/util/Rects');
const SearchUtils = require('internal/legacy/util/Search');
const TextRangeFinderUtils = require('internal/legacy/util/TextRangeFinder');
const { getString } = require('internal/legacy/util/Localization');

const RendererManager = require('../../annotations/renderer/Manager');
const UserdataActions = require('../../userdata/Actions');

require('internal/legacy/model/Highlight');
require('internal/legacy/model/Note');
require('internal/legacy/model/QuizResult');
require('internal/legacy/model/TranscriptSummary');

require('../../annotations/Highlight');
require('../../annotations/Note');
require('../../annotations/QuizResults');
require('../../annotations/Redaction');
require('../../annotations/Transcript');
require('../../assessment/Scoreboard');

const logger = Logger.get('legacy:app:content-viewer:reader:Annotations');

module.exports = exports = Ext.define(
	'NextThought.app.contentviewer.reader.Annotations',
	{
		alias: 'reader.annotations',

		mixins: {
			observable: 'Ext.util.Observable',
		},

		getBubbleTarget: function () {
			return this.reader;
		},

		constructor: function (config) {
			Ext.apply(this, config);
			var me = this,
				reader = me.reader;

			me.up = reader.up.bind(reader);
			me.mixins.observable.constructor.apply(me);
			me.UserDataActions = UserdataActions.create();

			this.deleteNote = this.deleteNote.bind(this);

			reader.on(
				'destroy',
				'destroy',
				reader.relayEvents(me, [
					'filter-by-line',
					'removed-from-line',
					'annotations-load',
					'filter-annotations',
					'define',
					'save-phantom',
					'create-note',
					'share-with',
					'resize',
				])
			);

			reader.on('destroy', 'onDestroy', this);

			Ext.apply(me, {
				annotations: {},
				filter: null,
				searchAnnotations: null,
				annotationManager: new RendererManager(reader),
			});

			reader.on(
				'afterRender',
				function () {
					me.UserDataActions.listenToPageStores(this, {
						scope: me,
						add: 'storeEventsAdd',
						'paged-in': 'storeEventsAdd',
						remove: 'storeEventsRemove',
						bulkremove: 'storeEventsBulkRemove',
					});
				},
				this
			);

			me.mon(reader, {
				scope: this,
				//added: function(){ FilterManager.registerFilterListener(me, me.applyFilter,me); },
				afterRender: 'insertAnnotationGutter',
				'load-annotations': 'loadAnnotations',
				'clear-annotations': 'clearAnnotations',
				'location-cleared': 'clearAnnotations',
			});

			me.mon(
				me.annotationManager.events,
				'finish',
				function (c) {
					me.fireEvent('rendered', c);
				},
				me,
				{ buffer: 500 }
			);

			ModelBase.addListener('deleted', this.deleteNote);
		},

		onDestroy: function () {
			this.clearAnnotations();
			ModelBase.removeListener('deleted', this.deleteNote);
		},

		deleteNote: function (id) {
			this.remove(id);
		},

		getDocumentElement: function () {
			return this.reader.getDocumentElement();
		},

		onGutterClicked: function (e) {
			var t = e.getTarget('[data-line]', null, true),
				toggle = t && t.hasCls('active'),
				line =
					!toggle && t && parseInt(t.getAttribute('data-line'), 10);

			this.UserDataActions.onAnnotationsLineFilter(this.reader, line);

			this.gutterEl.select('[data-line]').removeCls('active');
			if (t && !toggle) {
				t.addCls('active');
			}
		},

		storeEventsAdd: function (store, records) {
			logger.debug(
				'New records in store, adding to page...',
				store.cacheMapId || store.containerId,
				records
			);
			Ext.each(
				records,
				function (r) {
					var cls = r.get('Class');
					this.createAnnotationWidget(cls, r);
				},
				this
			);
		},

		storeEventsBulkRemove: function (store, records) {
			Ext.each(
				records,
				function (record) {
					this.remove(record.getId());
				},
				this
			);
		},

		storeEventsRemove: function (store, record) {
			this.remove(record.getId());
		},

		insertAnnotationGutter: function () {
			var me = this,
				container = Ext.DomHelper.insertAfter(
					me.reader.getInsertionPoint().first(),
					{
						cls: 'annotation-gutter',
						onclick: 'void(0)',
						cn: { cls: 'column controls' },
					},
					true
				);

			me.gutterEl = container;
			me.reader.on('destroy', 'remove', container);
			me.mon(container, 'click', 'onGutterClicked', me);
			me.annotationManager.registerGutter(container, me.reader);
		},

		getManager: function () {
			return this.annotationManager;
		},

		convertRectToScreen: function (r) {
			var readerOffsets = this.reader.getAnnotationOffsets().rect;

			return {
				top: r.top + readerOffsets.top,
				left: r.left + readerOffsets.left,
				right: r.right + readerOffsets.left,
				bottom: r.bottom + readerOffsets.top,
				height: r.height,
				width: r.width,
			};
		},

		loadAnnotations: function (containerId, subContainers) {
			var location = this.reader.getLocation();

			this.clearAnnotations();
			this.UserDataActions.loadAnnotations(
				this.reader,
				containerId,
				location.pageInfo,
				subContainers
			);
		},

		objectsLoaded: function (items, bins /*, containerId*/) {
			var me = this;

			me.setAssessedQuestions((bins || {}).AssessedQuestionSet);
			me.buildAnnotations(items);
		},

		applyFilter: function (newFilter) {
			this.filter = newFilter;
			this.clearAnnotations();
			this.fireEvent('filter-annotations', this.reader);
		},

		showSearchHit: function (hit) {
			this.clearSearchHit();
			if (hit.isContent()) {
				this.searchAnnotations = Ext.widget('search-hits', {
					hit: hit,
					ps: hit.get('PhraseSearch'),
					owner: this.reader,
				});
			}
		},

		//generalize this
		//Returns an array of objects with two propertes.  ranges is a list
		//of dom ranges that should be used to position the highlights.
		//key is a string that used to help distinguish the type of content when we calculate the adjustments( top and left ) needed.
		rangesForSearchHits: function (hit) {
			var phrase = hit.get('PhraseSearch'),
				//fragments = hit.get('Fragments'),
				regex,
				ranges,
				o = this.reader.getComponentOverlay(),
				contentDoc = this.getDocumentElement(),
				indexedOverlayData,
				result = [];

			logger.debug('Getting ranges for search hits');

			//We get ranges from two places, the iframe content
			//and the overlays
			regex = SearchUtils.contentRegexForSearchHit(hit, phrase);
			ranges = TextRangeFinderUtils.findTextRanges(
				contentDoc,
				contentDoc,
				regex
			);
			result.push({
				ranges: ranges.slice(),
				key: 'content',
			});

			//Now look in assessment overlays
			indexedOverlayData = TextRangeFinderUtils.indexText(
				o.componentOverlayEl.dom,
				function (node) {
					return Ext.fly(node).parent('.indexed-content');
				}
			);

			ranges = TextRangeFinderUtils.findTextRanges(
				o.componentOverlayEl.dom,
				o.componentOverlayEl.dom.ownerDocument,
				regex,
				undefined,
				indexedOverlayData
			);
			result.push({
				ranges: ranges.slice(),
				key: 'assessment',
			});

			return result;
		},

		//	@returns an object with top and left properties used to adjust the
		//	coordinate space of the ranges bounding client rects.
		//	It decides based on the type of container( main content or overlays).
		getRangePositionAdjustments: function (key) {
			var annotationOffsets, overlayXAdjustment, overlayYAdjustment;
			if (key === 'content') {
				return { top: 0, left: 0 };
			}

			//For other overlays( i.e assessments )
			annotationOffsets = this.reader.getAnnotationOffsets();
			overlayYAdjustment = -annotationOffsets.top;
			overlayXAdjustment = -annotationOffsets.left;
			return { top: overlayYAdjustment, left: overlayXAdjustment };
		},

		clearSearchHit: function () {
			if (!this.searchAnnotations) {
				return;
			}

			this.searchAnnotations.cleanup();
			this.searchAnnotations = null;
		},

		remove: function (oid) {
			var v = this.annotations[oid];
			if (v) {
				this.annotations[oid] = undefined;
				delete this.annotations[oid];
				v.cleanup();
				this.fireEvent('removed-from-line', this.reader);
			}
		},

		clearAnnotations: function () {
			var v, oid, leftovers;
			for (oid in this.annotations) {
				if (this.annotations.hasOwnProperty(oid)) {
					v = this.annotations[oid];
					if (!v) {
						continue;
					}
					v.cleanup(true);
				}
			}

			this.annotations = {};
			this.clearSearchHit();

			//Catchall for existing annotations that did not get removed properly or are left
			//hanging like placeholder notes.
			leftovers = Ext.query('[id*=note-container]');
			if (leftovers && leftovers.length > 0) {
				Ext.each(leftovers, function (l) {
					Ext.fly(l).destroy();
				});
			}
		},

		exists: function (record) {
			var oid = record.getId();
			if (!oid) {
				return false;
			}

			return !!this.annotations[oid];
		},

		getDefinitionMenuItem: function (range) {
			try {
				range = range || this.getSelection();
				if (!range) {
					return null;
				}
				var me = this,
					boundingBox = me.convertRectToScreen(
						range.getBoundingClientRect()
					),
					text = range.toString().trim(),
					result = null;

				//Rangy likes to grab trailing punctuation so strip
				//it here
				text = text.replace(/^[^\w]+|[^\w]+$/g, '');

				if (/^\w+$|^\w+[^\w]+\w+$/i.test(text)) {
					//it is one or two words
					result = {
						text: 'Define...',
						cls: 'define',
						handler: function () {
							me.UserDataActions.define(
								text,
								boundingBox,
								me.reader
							);
							me.clearSelection();
						},
					};
				}

				return result;
			} catch (e) {
				logger.error(e.message, e.stack);
				return null;
			}
		},

		addAnnotation: function (range, xy, type) {
			const pageInfo = this.reader.getLocation().pageInfo;
			const isFake = pageInfo && pageInfo.get('isFakePageInfo');

			if (!range) {
				return;
			}

			if (!xy || !xy[0] || !xy[1]) {
				// logger.warn('xy are null or undefined: ', xy);
				return;
			}

			if (isFake) {
				this.selectRange(range);
				// logger.warn('Trying highlight on fake page info');
				return;
			}

			var me = this,
				rect2 = RectUtils.getFirstNonBoundingRect(range),
				record = AnnotationUtils.selectionToHighlight(
					range,
					null,
					me.getDocumentElement()
				),
				highlightColors = Service.getHighlightColors(), // array of objects: {name:'blue',color:'0000ff'}
				menu,
				define,
				redactionRegex =
					/USSC-HTML|Howes_converted|USvJones2012_converted/i,
				frame = me.reader.getIframe().get(),
				win = frame && frame.win;

			if (!record) {
				return;
			}

			//Default container, this should be replaced with the local container.
			if (!record.get('ContainerId')) {
				record.set('ContainerId', this.reader.getLocation().NTIID);
			}

			//set a flag to prevent NoteOverlay from resolving the line
			this.reader.creatingAnnotation = true;

			menu = Ext.widget('menu', {
				closeAction: 'destroy',
				minWidth: 4,
				top: 0,
				ui: 'nt-annotation',
				cls: cx('nt-annotation-menu', { flip: type === 'touchend' }),
				layout: 'hbox',
				focusOnToFront: false,
				defaults: { ui: 'nt-annotation', plain: true },
			});

			if (win && $AppConfig.allowPrintingContent) {
				menu.add({
					text: getString(
						'NextThought.view.content.reader.Annotations.print'
					),
					handler: function () {
						win.print();
					},
				});
			}

			menu.add({
				xtype: 'colorpicker',
				colors: Ext.Array.pluck(highlightColors, 'color'), // hex codes are case sensitive. won't work if 'FF' is 'ff'.
				cls: 'nt-highlight-picker',
				plain: false,
				listeners: {
					select: function (picker, selColor) {
						var hColor = Ext.Array.findBy(
							highlightColors,
							function (item) {
								return item.color === selColor;
							}
						);

						record.set('presentationProperties', {
							highlightColorName: hColor.name,
						});
						me.UserDataActions.savePhantomAnnotation(record, false);
						me.clearSelection();
						menu.hide();
					},
				},
			});

			define = me.getDefinitionMenuItem(range);
			if (define) {
				menu.add(define);
			}

			if (!this.reader.getNoteOverlay().disabled) {
				menu.add({
					text: getString(
						'NextThought.view.content.reader.Annotations.add-note'
					),
					cls: 'add-note',
					handler: function () {
						me.clearSelection();
						me.fireEvent('create-note', range, rect2, 'plain');
					},
				});
			}

			function redaction(block) {
				return function () {
					me.clearSelection();
					var r = Redaction.createFromHighlight(record, block);
					try {
						me.UserDataActions.savePhantomAnnotation(r, true);
					} catch (e) {
						alert(
							getString(
								'NextThought.view.content.reader.Annotations.error'
							)
						);
					}
				};
			}

			//FIXME - official way of redaction feature enablement:
			//if(Service.canRedact()){
			//hack to allow redactions only in legal texts for now...
			if (redactionRegex.test(this.reader.getLocation().NTIID)) {
				//inject other menu items:
				menu.add({
					text: getString(
						'NextThought.view.content.reader.Annotations.redact-inline'
					),
					handler: redaction(false),
				});

				menu.add({
					text: getString(
						'NextThought.view.content.reader.Annotations.redact-block'
					),
					handler: redaction(true),
				});
			}

			//on close make sure it gets destroyed.
			menu.on(
				'hide',
				function () {
					menu.close();
					delete this.reader.creatingAnnotation;
				},
				this
			);

			//Figure out where to position the menu, at the top right of the
			//highest client rect in the range
			function menuPosition(range2 /*, xy*/) {
				var readerRect = me.reader.el.dom.getBoundingClientRect(),
					scrollOffSet = Ext.getBody().getScroll().top,
					menuHeight = menu.getHeight() || 0,
					menuWidth = menu.getWidth() || 0,
					rects = range2.getClientRects(),
					i,
					dy,
					dx,
					y = readerRect.bottom,
					x = readerRect.right;

				for (i = 0; i < rects.length; i++) {
					dy = rects[i].top + readerRect.top;
					dx = rects[i].right + readerRect.left;

					if (dy < y) {
						y = dy;
						x = dx;
					}
				}

				//account for the current top which is the scroll top for some reason...
				y += scrollOffSet;

				//center the menu at that x, y
				x -= menuWidth / 2;
				if (type !== 'touchend') {
					y -= menuHeight + 20;
				} else {
					y += menuHeight + 20;
				}

				return [x, y];
			}

			if (this.reader.getLocation().NTIID.indexOf('mathcounts') < 0) {
				menu.showAt(xy[0], xy[1]); // opacity still at 0 via css so we can center it. (we can't get the dimensions until it renders)
				menu.setXY(menuPosition(range, xy), false); // center it
				menu.addClass('visible'); // show it.
			} else {
				logger.debug(
					'hack alert; annotation context menu deliberately hidden in mathcounts content'
				);
				return;
			}
			me.selectRange(range);
		},

		/**
		 *
		 * @param {string} type - the type
		 * @param {Ext.data.Model} record - annotation record (highlight, note, redaction, etc)
		 * @param {Range} [browserRange] - optional, if we already have a range from the browser, that can be used instead of resolving it
		 *						   from the record
		 * @param {Function} [onCreated] - Function
		 * @returns {boolean} success/failure
		 */
		createAnnotationWidget: function (
			type,
			record,
			browserRange,
			onCreated
		) {
			var oid = record.getId(),
				w;

			if (record.get('inReplyTo') || record.parent) {
				return false;
			}

			if (this.exists(record)) {
				logger.debug('Updating existing annotation?');
				this.annotations[record.getId()]
					.getRecord()
					.fireEvent('updated', record);
				return true;
			}

			try {
				w = Ext.widget(type.toLowerCase(), {
					browserRange: browserRange,
					record: record,
					reader: this.reader,
				});

				if (!oid) {
					oid =
						type.toUpperCase() +
						'-TEMP-OID-' +
						Globals.guidGenerator();
					if (this.annotations[oid]) {
						this.annotations[oid].cleanup();
						delete this.annotations[oid];
					}
					record.on(
						'updated',
						function (r) {
							this.annotations[r.get('NTIID')] =
								this.annotations[oid];

							delete this.annotations[oid];
						},
						this
					);

					w.tempId = oid;
				}

				this.annotations[oid] = w;
				Ext.callback(onCreated, w, [w]);
			} catch (e) {
				logger.error(Globals.getError(e));
			}

			if (w && type === 'redaction') {
				this.fireEvent('resize');
			}
			return Boolean(w);
		},

		setAssessedQuestions: function (sets) {
			if (!sets || sets.length === 0) {
				//do nothing if we have no prior sets
				return;
			}

			var scoreboard = Ext.ComponentQuery.query(
				'assessment-scoreboard'
			)[0];

			if (!scoreboard) {
				logger.error(
					'Got prior assessments back but there is no scoreboard to associate with',
					sets
				);
				return;
			}

			scoreboard.setPriorResults(sets);
		},

		buildAnnotations: function (list) {
			var me = this;
			Ext.each(
				list || [],
				function (r) {
					if (!r) {
						return;
					}
					try {
						me.createAnnotationWidget(r.getModelName(), r);
					} catch (e) {
						logger.error(
							'Could not build ' +
								r.getModelName() +
								' from record:',
							r,
							'because: ',
							e,
							e.stack
						);
					}
				},
				this
			);
		},

		onContextMenuHandler: function (e) {
			try {
				var origSelection = rangy
						.getSelection(this.getDocumentElement())
						.toString(),
					range = this.getSelection(e.type !== 'touchend');

				if (range && !range.collapsed) {
					e.stopPropagation();
					e.preventDefault();
					if (origSelection.length > 0) {
						this.addAnnotation(range, e.getXY(), e.type);
					}
				}
			} catch (er) {
				logger.error('onContextMenuHandler: ' + er.message);
			}
		},

		getAnnotations: function () {
			var key,
				items = [];

			for (key in this.annotations) {
				if (this.annotations.hasOwnProperty(key)) {
					items.push(this.annotations[key]);
				}
			}

			return items;
		},

		realignAnnotations: function () {
			var items = this.getAnnotations();

			items = items.map(function (x) {
				return x.record;
			});

			this.clearAnnotations();
			this.buildAnnotations(items);
		},

		getSelection: function (snap = true) {
			var doc = this.getDocumentElement(),
				range,
				selection,
				txt;
			try {
				if (snap) {
					Anchors.snapSelectionToWord(doc);
				}

				selection = doc.parentWindow.getSelection();
				txt = selection.toString();

				if (selection.rangeCount > 0 && !/^\s*$/.test(txt)) {
					range = selection.getRangeAt(0);

					return range;
				}
			} catch (e) {
				logger.error(e.stack || e.message || e);
			}
			logger.warn(
				'skipping getSelection() no viable selection',
				selection
			);

			return null;
		},

		selectRange: function (range) {
			try {
				var s = this.getDocumentElement().parentWindow.getSelection();
				s.removeAllRanges();
				s.addRange(range);
			} catch (e) {
				logger.error(e.stack || e.message || e);
			}
		},

		clearSelection: function () {
			var doc = this.getDocumentElement(),
				win = doc.parentWindow;
			try {
				win.getSelection().removeAllRanges();
			} catch (e) {
				logger.warn(e.stack || e.toString());
			}
		},
	}
);
