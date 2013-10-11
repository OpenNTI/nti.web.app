Ext.define('NextThought.view.assessment.input.Ordering', {
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-orderingpart',

	requires: [
		'Ext.dd.DragZone',
		'Ext.dd.DropZone',
		'Ext.dd.StatusProxy'
	],

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


	initComponent: function() {
		this.callParent(arguments);

		var values = Ext.clone(this.part.get('values')),
			labels = Ext.clone(this.part.get('labels')),
			i = 0, m = [];

		for (i; i < values.length; i++) {
			m.push({
				label: labels[i],
				value: values[i]
			});
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			ordinals: m
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;
		Ext.defer(function() { me.dragzoneEl.setStyle({'width': '100%'}); }, 1, this);

		this.initializeDragZone();
		this.initializeDropZone();
		this.dragzoneEl.dom.id = Ext.id();
	},


	getValue: function() {
		var val = {};

		this.el.select('.ordinal').each(function(e) {
			var p1 = e.down('.label'),
				labelIndex, valueIndex,
				p2 = e.down('.draggable-area');

			labelIndex = p1 && parseInt(p1.getAttribute('data-part'), 10);
			valueIndex = p2 && parseInt(p2.getAttribute('data-ordinal'), 10);
			val[labelIndex] = valueIndex;
		});
		return val;
	},


	getSolutionContent: function(part) {
		var values = Ext.clone(this.part.get('values')),
			labels = Ext.clone(this.part.get('labels')),
			out = [], tpl = this.solTpl;

		Ext.each(part.get('solutions'), function(s) {
			var x = s.get('value'), i, valueIndex;

			for (i in x) {
				if (x.hasOwnProperty(i)) {
					i = parseInt(i, 10);
					valueIndex = x[i];
					out.push(tpl.apply([labels[i], values[valueIndex]]));
				}
			}
		});

		return out.join('');
	},


	editAnswer: function() {
		if (this.submitted) {
			this.up('assessment-question').reset();
			this.disableSubmission();
		}
	},


	mark: function() {
		var s = this.part.get('solutions')[0],
			c = s.get('value'), i = 0, me = this,
			values = Ext.clone(this.part.get('values')),
			labels = Ext.clone(this.part.get('labels'));

		this.getEl().select('.ordinal').removeCls(['correct', 'incorrect']);

		Ext.each(this.getEl().query('.ordinal'), function(e) {
			var l = Ext.fly(e).down('.label'),
				labelIndex = parseInt(l.getAttribute('data-part'), 10),
				d = Ext.fly(e).down('.draggable-area'),
				valueIndex = parseInt(d.getAttribute('data-ordinal'), 10),
				cls = (labelIndex === i && valueIndex === c[i]) ? 'correct' : 'incorrect';

			d.addCls(cls);
			i++;
		});

		Ext.defer(function() {
			me.updateLayout();
			me.syncElementHeight();
		}, 1);
	},


	markCorrect: function() {
		var me = this;

		//NOTE: The dragZoneEl has a display property of 'table' which allows its child elements to flex the box.
		// Since marking a question alters the dom, we want to only set the width to 100% only after we've updated the layout.
		// Otherwise, it will force its child elements to be each have a width of 50%, which alters the flex layout. --Pacifique M.
		this.dragzoneEl.setStyle({'width': undefined});
		this.callParent();
		me.dragzoneEl.setStyle({'width': '100%'});
		this.mark();
	},


	markIncorrect: function() {
		var me = this;
		this.dragzoneEl.setStyle({'width': undefined});
		this.callParent();
		me.dragzoneEl.setStyle({'width': '100%'});
		this.mark();
	},


	reset: function() {
		this.el.select('.ordinal .draggable-area').removeCls(['correct', 'incorrect']);
    //		this.resetOrder();
		this.callParent();
	},


	resetOrder: function() {
		var draggableParts = this.el.select('.ordinal .draggable-area');
		this.quickSort(draggableParts.elements);
	},


	hideSolution: function() {
		var me = this;
		this.dragzoneEl.setStyle({'width': undefined});
		this.callParent();
		me.dragzoneEl.setStyle({'width': '100%'});
	},


	quickSort: function(a) {
		/**
		 * @adaptation of the quick sort algorithm found at http://en.literateprograms.org/Quicksort_(JavaScript)
		 * While  we could easily do the swapping with a basic sort algorithm or remove all the items and add them again in order, and the performance would still be great,
		 * since the size of the set is small,
		 * it's good to use this algorithm and hopefully reduce the number of comparison and swaps we need to do.
		 */
		function qsort(a, begin, end) {
			var pivot;
			if (begin < end) {
				pivot = begin + Math.floor(Math.random() * (end - begin));

				pivot = partition(a, begin, end, pivot);
				qsort(a, begin, pivot);
				qsort(a, pivot + 1, end);
			}
		}

		function partition(a, begin, end, pivot) {
			var p = parseInt(a[pivot].getAttribute('data-ordinal'), 10),
				s, i, t;

			me.swap(p, end - 1);
			s = begin;
			for (i = begin; i < end - 1; i++) {
				t = parseInt(a[i].getAttribute('data-ordinal'), 10);
				if (t <= p) {
					me.swap(p, end - 1);
					s++;
				}
			}

			me.swap(end - 1, s);
			return s;
		}

		var me = this;
		qsort(a, 0, a.length);
	},


	swap: function(a, b) {
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


	swapNodes: function(target, dd) {
		var sourceDom = dd.dragData.ddel,
			targetParent = target.up('.ordinal', null, true),
			a = sourceDom.getAttribute('data-ordinal'),
			b = target.getAttribute('data-ordinal');

		dd.dragData.sourceEl.removeCls('selected');
		Ext.fly(sourceDom).removeCls('selected');
		Ext.fly(targetParent).removeCls('target-hover');

		this.swap(a, b);

		//Make sure we enable the submit button, since the user has started dragging.
		if (this.submissionDisabled) {
			this.enableSubmission();
		}

		return true;
	},


	initializeDragZone: function() {
		var me = this,
			proxy = new Ext.dd.StatusProxy({
			id: me.el.id + '-drag-status-proxy',
			constrain: true
		});

		me.dragZone = new Ext.dd.DragZone(me.getEl(), {
			getDragData: function(e) {
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
			getRepairXY: function() {
				return this.dragData.repairXY;
			},

			animRepair: true,

			proxy: proxy,

			onStartDrag: function() {
				var el = this.getProxy().el.down('.draggable-area'),
					w = this.dragData.sourceEl.getWidth() + 'px',
					h = this.dragData.sourceEl.getHeight() + 'px',
					m = this.dragData.sourceEl.up('.ordinal'),
					leftMargin = m && m.down('.label').getWidth() + 6;

				//NOTE: We only want to drag vertically
				this.setXConstraint(0, 0);
				// Center drag and drop proxy on cursor pointer
				this.setDelta(0, 40);

				if (el) {
					el.setStyle({
						'width': w,
						'height': h,
						'marginLeft': leftMargin + 'px'
					});
				}
				this.dragData.sourceEl.addCls('selected');
			}
		});
	},

	initializeDropZone: function() {
		var me = this;
		this.dropZone = new Ext.dd.DropZone(this.getEl(), {
			getTargetFromEvent: function(e) {
				return e.getTarget('.draggable-area', null, true);
			},
			onNodeEnter: function(target, dd, e, data) {
				var p = target.up('.ordinal');

				if (p) {
					Ext.fly(p).addCls('target-hover');
				}
			},
			onNodeOut: function(target, dd, e, data) {
				var p = target.up('.ordinal');
				if (p) { Ext.fly(p).removeCls('target-hover'); }
			},
			onNodeOver: function(target, dd, e, data) {
				if (target.dom === dd.dragData.sourceEl.dom) {
					return false;
				}

				// NOTE: We could also swap onNodeOver however it doesn't feel right.
        //				Ext.defer(me.swapNodes, 250, me, [target, dd]);
				return Ext.dd.DropZone.prototype.dropAllowed;
			},

			onNodeDrop: function(target, dd, e, data) { me.swapNodes(target, dd); }
		});
	}
}, function(){
	if (!isFeature('v3matching')) {
		this.addXtype('question-input-matchingpart');
	}
});
