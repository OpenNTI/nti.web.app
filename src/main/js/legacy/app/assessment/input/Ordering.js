const Ext = require('extjs');
const {wait} = require('nti-commons');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.assessment.input.Ordering', {
	extend: 'NextThought.app.assessment.input.Base',
	alias: 'widget.question-input-orderingpart',

	inputTpl: Ext.DomHelper.markup({ cls: 'ordering-dd-zone', cn: [
		{'tag': 'tpl', 'for': 'ordinals', cn: [{
			cls: 'ordinal', cn: [
				{ cls: 'label', 'data-part': '{[xindex-1]}', html: '{label}' },
				{ cls: 'draggable-area', 'data-ordinal': '{[xindex-1]}', cn: [
					{cls: 'controls', cn: [
						{ tag: 'span', cls: 'control'},
						{ tag: 'span', cls: 'drag-control'}
					]},
					{ cls: 'text', html: '{value}' }
				]}
			]}
		]}
	]}),

	solTpl: Ext.DomHelper.createTemplate({
		cls: 'ordering-solution',
		cn: [{ tag: 'span', html: '{0}'},{tag: 'span', cls: 'solution-ordering-text', html: '{1}'}]
	}).compile(),

	renderSelectors: {
		draggableEl: '.ordinal .draggable-area',
		dragzoneEl: '.ordering-dd-zone'
	},

	initComponent: function () {
		this.callParent(arguments);

		var values = Ext.clone(this.part.get('values')),
			labels = Ext.clone(this.part.get('labels')),
			i = 0, m = [];

		for (i; i < values.length; i++) {
			m.push({
				label: this.filterHTML(labels[i]),
				value: this.filterHTML(values[i])
			});
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			ordinals: m
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		var me = this,
			dragzoneEl = this.getDragzoneEl();

		wait()
			.then(function () {
				if (me.rendered) {
					dragzoneEl.setStyle({'width': '100%'});
				}
			});

		me.initializeDragZone();
		me.initializeDropZone();
		dragzoneEl.dom.id = Ext.id();
	},

	getDragzoneEl: function () {
		return this.el && this.el.down('.ordering-dd-zone');
	},


	getDraggableEl: function () {
		return this.el && this.el.down('.ordinal .draggable-area');
	},

	getAnsweredCount: function () {
		return 1;
	},

	setValue: function (val) {
		if (!this.rendered) {
			this.on({
				single: true,
				afterrender: this.setValue.bind(this, val)
			});
			return;
		}
		var ordinal, text, label;
		if (!val) {return;}
		for (ordinal in val) {
			if (val.hasOwnProperty(ordinal)) {
				text = this.el.down('.draggable-area[data-ordinal="' + val[ordinal] + '"]');
				label = this.el.down('.ordinal .label[data-part="' + ordinal + '"]');
				if (text && label && label.parent()) {
					text.appendTo(label.parent());
				} else {
					console.error('Bad Response from server', val);
				}
			}
		}
	},

	getValue: function () {
		var val = {};

		this.el.select('.ordinal').each(function (e) {
			var p1 = e.down('.label'),
				labelIndex, valueIndex,
				p2 = e.down('.draggable-area');

			labelIndex = p1 && parseInt(p1.getAttribute('data-part'), 10);
			valueIndex = p2 && parseInt(p2.getAttribute('data-ordinal'), 10);
			val[labelIndex] = valueIndex;
		});
		return val;
	},

	getSolutionContent: function (part) {
		var values = Ext.clone(this.part.get('values')),
			labels = Ext.clone(this.part.get('labels')),
			out = [], tpl = this.solTpl;

		Ext.each(part.get('solutions'), function (s) {
			var x = s.get('value'), i, valueIndex;

			for (i in x) {
				if (x.hasOwnProperty(i)) {
					i = parseInt(i, 10);
					valueIndex = x[i];
					out.push(tpl.apply([labels[i], values[valueIndex]]));
				}
			}
		});

		return this.filterHTML(out.join(''));
	},

	editAnswer: function () {
		if (this.submitted && !this.isAssignment) {
			if (this.questionSet) {
				this.questionSet.fireEvent('reset');
			} else {
				this.up('assessment-question').reset();
			}

			this.disableSubmission();
		}
	},

	mark: function () {
		var s = (this.part.get('solutions') || [])[0],
			c = (s && s.get('value')) || {}, i = 0,
			me = this;


		this.getEl().select('.ordinal').removeCls(['correct', 'incorrect']);

		if (!s) {
			//no solution, get it from the assessed
			return;
		}

		Ext.each(this.getEl().query('.ordinal'), function (e) {
			var l = Ext.fly(e).down('.label'),
				labelIndex = parseInt(l.getAttribute('data-part'), 10),
				d = Ext.fly(e).down('.draggable-area'),
				valueIndex = parseInt(d.getAttribute('data-ordinal'), 10),
				cls = (labelIndex === i && valueIndex === c[i]) ? 'correct' : 'incorrect';

			d.addCls(cls);
			i++;
		});

		Ext.defer(function () {
			me.updateLayout();
			me.syncElementHeight();
		}, 1);
	},

	markCorrect: function () {
		//NOTE: The dragZoneEl has a display property of 'table' which allows its child elements to flex the box.
		// Since marking a question alters the dom, we want to only set the width to 100% only after we've updated the layout.
		// Otherwise, it will force its child elements to be each have a width of 50%, which alters the flex layout. --Pacifique M.
		var dragzoneEl = this.getDragzoneEl();

		dragzoneEl.setStyle({'width': undefined});
		this.callParent();
		dragzoneEl.setStyle({'width': '100%'});
		this.mark();
	},

	markIncorrect: function () {
		var dragzoneEl = this.getDragzoneEl();

		dragzoneEl.setStyle({'width': undefined});
		this.callParent();
		dragzoneEl.setStyle({'width': '100%'});
		this.mark();
	},

	lockDnD: function () {
		if (this.dropZone && this.dropZone.lock) {
			this.dropZone.lock();
		}

		if (this.dragZone && this.dragZone.lock) {
			this.dragZone.lock();
		}
	},

	unlockDnD: function () {
		if (this.dropZone && this.dropZone.unlock) {
			this.dropZone.unlock();
		}

		if (this.dragZone && this.dragZone.unlock) {
			this.dragZone.unlock();
		}
	},

	reset: function (keepAnswers) {
		this.el.select('.ordinal .draggable-area').removeCls(['correct', 'incorrect']);

		if (!keepAnswers) {
			this.resetOrder();
		}

		this.unlockDnD();
		this.callParent();
	},

	/*
	 * Set the ordering question to submitted state.
	 * Once an ordering question has been submitted, we disable drag and drop.
	 */
	setSubmitted: function () {
		this.callParent(arguments);

		this.lockDnD();
	},

	resetOrder: function () {
		if (!this.rendered) {
			return;
		}

		var values = Ext.clone(this.part.get('values')),
			labels = Ext.clone(this.part.get('labels')),
			i = 0, m = [], dragzoneEl,
			tpl = new Ext.XTemplate(this.inputTpl);

		for (i; i < values.length; i++) {
			m.push({
				label: this.filterHTML(labels[i]),
				value: this.filterHTML(values[i])
			});
		}

		this.inputBox.dom.innerHTML = '';

		tpl.append(this.inputBox, {ordinals: m});

		dragzoneEl = this.getDragzoneEl();

		dragzoneEl.setStyle({'width': '100%'});
		dragzoneEl.dom.id = Ext.id();
	},

	hideSolution: function () {
		var dragzoneEl = this.getDragzoneEl();

		dragzoneEl.setStyle({'width': undefined});
		this.callParent();
		dragzoneEl.setStyle({'width': '100%'});
	},


	swap: function (a, b) {
		if (a === b) { return; }
		var ad = this.el.down('.draggable-area[data-ordinal=' + a + ']'),
			bd = this.el.down('.draggable-area[data-ordinal=' + b + ']'),
			ap = ad.up('.ordinal'),
			bp = bd.up('.ordinal');

		//		console.log('Will swap draggable parts of index: ', a, ' ', b);
		ap.select('.draggable-area').remove();
		bp.select('.draggable-area').remove();
		ap.dom.appendChild(bd.dom);
		bp.dom.appendChild(ad.dom);
	},

	swapNodes: function (target, dd) {
		var sourceDom = dd.dragData.ddel,
			targetParent = target.up('.ordinal', null, true),
			a = sourceDom.getAttribute('data-ordinal'),
			b = target.getAttribute('data-ordinal');

		dd.dragData.sourceEl.removeCls('selected');
		Ext.fly(sourceDom).removeCls('selected');
		Ext.fly(targetParent).removeCls('target-hover');

		this.swap(a, b);
		return true;
	},

	onNodeDropEnd: function (target, dd) {
		if (this.submissionDisabled) {
			this.enableSubmission();
			return;
		}

		this.saveProgress();
	},

	initializeDragZone: function () {
		var me = this,
			proxy = new Ext.dd.StatusProxy({
				id: me.el.id + '-drag-status-proxy',
				constrain: true
			});

		me.dragZone = new Ext.dd.DragZone(me.getEl(), {
			getDragData: function (e) {
				var sourceEl = e.getTarget('.draggable-area', undefined, true), d;

				//We want to make it un-draggable when it's in a grade mode.
				if (e.getTarget('.correct') || e.getTarget('.incorrect')) {
					sourceEl = null;
				}

				if (sourceEl) {
					d = sourceEl.dom.cloneNode(true);
					d.id = Ext.id();

					me.dragData = {
						ddel: d,
						sourceEl: sourceEl,
						repairXY: Ext.fly(sourceEl.getXY())
					};
					return me.dragData;
				}
			},
			getRepairXY: function () {
				return this.dragData.repairXY;
			},

			animRepair: true,

			proxy: proxy,

			onStartDrag: function () {
				var el = this.getProxy().el.down('.draggable-area'),
					e = this.dragData.sourceEl,
					w = e.getWidth() + 'px',
					h = e.getHeight() + 'px',
					leftMargin = e.getX() + 6;

				this.initPageX = this.lastPageX = this.startPageX =
				this.minX = this.maxX = leftMargin;

				if (el) {
					el.setStyle({
						'width': w,
						'height': h//, 'marginLeft': leftMargin + 'px'
					});
				}

				//NOTE: We only want to drag vertically
				this.setXConstraint(0, 0);
				// Center drag and drop proxy on cursor pointer
				this.setDelta(0, 40);

				this.dragData.sourceEl.addCls('selected');
			}
		});
	},

	initializeDropZone: function () {
		var me = this;
		this.dropZone = new Ext.dd.DropZone(this.getEl(), {
			getTargetFromEvent: function (e) {
				if (Ext.is.iOS) {
					var toReturn = Ext.get(document.elementFromPoint(e.browserEvent.clientX, e.browserEvent.clientY));
					if (toReturn.dom.className.indexOf('draggable-area') < 0) {
						toReturn = toReturn.up('.draggable-area');
					}
					return toReturn;
				}
				return e.getTarget('.draggable-area', null, true);
			},

			onNodeEnter: function (target, dd, e, data) {
				var p = target.up('.ordinal'),
					scroll = me.reader.getScroll();

				if (p) {
					Ext.fly(p).addCls('target-hover');

					if (Ext.fly(p).needsScrollIntoView(me.reader.el)) {
						Ext.fly(p).scrollCompletelyIntoView(scroll.scrollingEl, false, true);
					}
				}
			},

			onNodeOut: function (target, dd, e, data) {
				var p = target.up('.ordinal');
				if (p) { Ext.fly(p).removeCls('target-hover'); }
			},

			onNodeOver: function (target, dd, e, data) { me.swapNodes(target, dd); },

			onNodeDrop: me.onNodeDropEnd.bind(me)
		});
	}
});
