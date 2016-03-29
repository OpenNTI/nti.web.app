var Ext = require('extjs');
var InputBase = require('./Base');
var DdScrollingDragZone = require('../../../common/dd/ScrollingDragZone');


function asInt (e, i) {
	return e && parseInt(e.getAttribute(i), 10);
}

function toMap (ar, attr) {
	var m = {};
	Ext.each(ar, function (e) { m[e.getAttribute(attr)] = e; });
	return m;
}

module.exports = exports = Ext.define('NextThought.app.assessment.input.Matching', {
	extend: 'NextThought.app.assessment.input.Base',
	alias: 'widget.question-input-matchingpart',

	//<editor-fold desc="Setup & Config">
	inputTpl: Ext.DomHelper.markup([
		{ cls: 'terms', cn: { 'tag': 'tpl', 'for': 'terms', cn: [
			{ cls: 'target term drag', 'data-match': '{[xindex-1]}', cn: [
				{ cls: 'match', 'data-term': '{.:htmlEncode}', cn: [{cls: 'reset'}, '{.}'] }
			]}
		]}},

		{'tag': 'tpl', 'for': 'targets', cn: [
			{ cls: 'target choice', 'data-target': '{[xindex-1]}', cn: [
				{ cls: 'match blank dropzone', 'data-term': '{parent.term:htmlEncode}', html: '{parent.term}' },
				{ cls: 'text', html: '{.}' }
			]}
		]}
	]),

	solTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{'tag': 'tpl', 'for': '.', cn: [
			{ cn: [
				{ cls: 'target term drag', html: '{term}' },
				{ cls: 'text', html: '{label}' }
			]}
		]}
	])),

	renderSelectors: {
		shelfEl: '.terms'
	},

	initComponent: function () {
		this.callParent(arguments);

		var values = Ext.clone(this.part.get('values')),
			labels = Ext.clone(this.part.get('labels')),
			i = values.length - 1,
			m = [],
			n = [];

		for (i; i >= 0; i--) {
			n.push(this.filterHTML(labels[i]));
			m.push(this.filterHTML(values[i]));
		}

		this.bufferedUpdateLayout = Ext.Function.createBuffered(this.updateLayout, 500);

		this.renderData = Ext.apply(this.renderData || {}, {
			term: '',//shold the question part define this string?
			terms: n.reverse(),
			targets: m.reverse()
		});

		this.on({
			afterRender: {scope: this, fn: 'injectMatchTerms', buffer: 1},
			el: {
				scope: this,
				click: function (e) {
					if (e.getTarget('.reset')) {
						this.resetTerm(e);
					}
				}
			}
		});
	},

	getAnsweredCount: function () {
		var value = this.getValue(),
			total, answered;

		if (Ext.isEmpty(value)) { return 0; }

		answered = (Object.keys(value) || []).length;
		total = (this.part.get('values') || []).length;

		if (total === 0) {
			return 1;
		}

		return answered / total;
	},

	injectMatchTerms: function () {
		var s = this.shelfEl,
			el, ownerMain;


		ownerMain = this.up('assessment-question');
		el = ownerMain.getInsertionEl();
		this.shelfEl.appendTo(el);
		//ownerMain.updateLayout();

		this.setupDragging();
		this.setupDropZone();
	},

	//</editor-fold>


	//<editor-fold desc="Drag & Drop">
	getDragProxy: function () {
		var proxy = this.dragProxy;

		if (!proxy) {
			proxy = this.dragProxy = new Ext.dd.StatusProxy({
				cls: 'dd-assessment-proxy-ghost',
				id: this.id + '-drag-status-proxy',
				repairDuration: 1000
				//repair : Ext.emptyFn <--to help debug
			});
		}
		return proxy;
	},

	moveTerm: function moveTerm (el, to) {
		var p = el.parentNode,
			tP = to.parentNode,
			tS = to.nextSibling,
			doc = (p && (p.ownerDocument || p.documentElement)) || document,
			term = p && p.dataset.term;

		if (p === Ext.getDom(to)) {
			return;
		}

		if (p.childNodes.length === 1 && !Ext.isEmpty(term)) {
			p.appendChild(doc.createTextNode(term));
		}

		if (Ext.isIE11p) {
			tP.removeChild(to);
			p.removeChild(el);
			el = el.cloneNode(true);
			to.appendChild(el);
			tP.insertBefore(to, tS);
		} else {
			to.appendChild(el);
		}

		this.bufferedUpdateLayout();
	},

	resetTerm: function resetTerm (e) {
		var toReset = e.getTarget('.target.drag');
		if (toReset) {
			this.moveTerm(toReset, this.shelfEl.dom);
		}
		this.maybeChangeSubmitButtonState();
	},

	dropTerm: function (dropOn, term) {
		var t = Ext.fly(dropOn).down('.dropzone', true),
			c = t && t.childNodes,
			n = c && c[0];

		if (!c || c.length > 1) { //problems
			return false;
		}

		if (Ext.isTextNode(n)) {
			t.removeChild(n);
		}

		if (n === term) {
			return true;
		}

		if (n && !Ext.isTextNode(n)) {
			this.shelfEl.appendChild(n);
		}

		this.moveTerm(term, t);

		return true;
	},

	setupDragging: function () {
		var cfg, me = this,
			el = this.up().getEl(), z;

		cfg = {
			scrollEl: me.reader.getScroll().scrollingEl,
			containerScroll: true,
			animRepair: true,
			proxy: this.getDragProxy(),

			afterRepair: function () { this.dragging = false; }, //override to stop the flash

			getDragData: function (e) {
				var sourceEl = e.getTarget('.drag'), d;
				if (sourceEl) {
					d = sourceEl.cloneNode(true);
					d.id = Ext.id();
					return {
						instanceId: me.id,
						sourceEl: sourceEl,
						repairXY: Ext.fly(sourceEl).getXY(),
						ddel: d,
						matchOrdinal: sourceEl.getAttribute('data-match')
					};
				}
			},

			getRepairXY: function () {
				return this.dragData.repairXY;
			},

			onBeforeDrag: function () {
				return !me.submitted;
			},

			onStartDrag: function () {
				var data = this.dragData,
					co = Ext.fly(data.sourceEl).up('.component-overlay'),
					so = data.sourceEl,
					el = this.getProxy().getDragEl(),
					dx = Math.floor(el.getWidth() / 2),
					dy = -Math.floor(el.getHeight() / 2);

				// Center drag and drop proxy on cursor pointer
				if (!Ext.isIE10m) {
					this.setDelta(dx, dy);
				}


				data.shield = Ext.DomHelper.insertFirst(co, {cls: 'shield'}, true);
				Ext.getBody().addCls('dragging');
				Ext.fly(so).addCls('dragging');
			},

			onEndDrag: function (data) {
				if (data.shield) {
					data.shield.remove();
					delete data.shield;
				}
				Ext.getBody().removeCls('dragging');
				Ext.fly(data.sourceEl).removeCls('dragging');
			}
		};

		this.dd = new Ext.dd.DragZone(this.shelfEl, cfg);
		this.reDD = new Ext.dd.DragZone(this.inputBox, cfg);
		this.on('destroy', 'destroy', this.dd);
		this.on('destroy', 'destroy', this.reDD);
	},

	setupDropZone: function () {

		var id = this.id,
			me = this,
			common = {
				//<editor-fold desc="Boilerplate">
				// If the mouse is over a target node, return that node. This is provided as the "target" parameter in all "onNodeXXXX" node event
				// handling functions
				getTargetFromEvent: function (e) {
					return e.getTarget('.target.choice') || e.getTarget('.terms'); },

				// On entry into a target node, highlight that node.
				onNodeEnter: function (target, dd, e, data) {
					if (data.instanceId !== id) {return false;}
					Ext.fly(target).addCls('drop-hover'); },

				// On exit from a target node, unhighlight that node.
				onNodeOut: function (target, dd, e, data) {
					if (data.instanceId !== id) {return false;}
					Ext.fly(target).removeCls('drop-hover'); },

				// While over a target node, return the default drop allowed
				onNodeOver: function (target, dd, e, data) {
					var p = Ext.dd.DropZone.prototype;
					return (data.instanceId === id) ?
							p.dropAllowed :
							p.dropNotAllowed;
				}
				//</editor-fzold>
			},
			dropOnAnswer = {
				onNodeDrop: function (target, dd, e, data) {
					if (data.instanceId !== id) {return false;}
					var r = me.dropTerm(target, data.sourceEl);
					me.maybeChangeSubmitButtonState();
					return r;
				}
			},
			dropOnShelf = {
				onNodeDrop: function (target, dd, e, data) {
					if (data.instanceId !== id) {return false;}
					me.moveTerm(data.sourceEl, Ext.get(target));
					me.maybeChangeSubmitButtonState();
					return true;
				}
			};


		this.dropZones = [
			new Ext.dd.DropZone(this.inputBox, Ext.apply(dropOnAnswer, common)),
			new Ext.dd.DropZone(this.shelfEl, Ext.apply(dropOnShelf, common))
		];
	},

	//</editor-fold>


	//<editor-fold desc="Grading">
	getValue: function () {
		var val = {};

		this.el.select('.choice').each(function (blank) {
			//this iterates the drop zones (blanks) and looks for the drag element (the "answer")
			var answer = blank.down('.term'),
			//Get the index off the answer...
				answerKey = asInt(answer, 'data-match');

			if (answer) {
				//sigh... this is backasswards. The drop zones are the constants, but...whatever...
				val[answerKey] = asInt(blank, 'data-target');
			}
		});

		return Object.keys(val).length ? val : null;
	},

	setValue: function (value) {
		var q = '.drag.term', termId, binId, bin,
			bins = toMap(this.inputBox.query('.choice'), 'data-target'),
			terms = Ext.Array.unique(
					this.shelfEl.query(q)
						.concat(this.inputBox.query(q)));


		//console.log('set:', value);
		this.shelfEl.appendChild(terms);

		terms = toMap(terms, 'data-match');

		if (value) {
			for (termId in value) {
				if (value.hasOwnProperty(termId)) {
					binId = value[termId];
					bin = bins[binId];
					if (bin) {
						this.dropTerm(bin, terms[termId]);
					}
				}
			}
		}
	},

	mark: function () {
		var s = (this.part.get('solutions') || [])[0],
			c = (s && s.get('value')) || {}, me = this,
			values = Ext.clone(this.part.get('values')),
			labels = Ext.clone(this.part.get('labels'));

		if (!s || !this.getValue()) {
			return;
		}

		function m (e) {
			var key = asInt(Ext.fly(e).down('.term'), 'data-match'),
				value = asInt(e, 'data-target'),
				cls = (!Ext.isEmpty(key) && value === c[key]) ? 'correct' : 'incorrect';

			e.down('.dropzone').addCls('graded');
			e.addCls(cls);
			console.log('marking key:', key, 'val:', value, '=?=', c[key] || 'blank', cls);
		}

		this.getEl().select('.choice').removeCls('correct incorrect').each(m);

		Ext.defer(function () {
			me.updateLayout();
			me.syncElementHeight();
		}, 1);
	},

	markSubmitted: function (state) {
		this.callParent(arguments);
		this.mark();
	},

	//</editor-fold>


	//<editor-fold desc="UI State">
	maybeChangeSubmitButtonState: function () {
		var allInPlay = !this.shelfEl.down('.term');
		this[(allInPlay ? 'en' : 'dis') + 'ableSubmission']();
	},

	reset: function () {
		var el = this.getEl(),
			q = '.drag.term';

		function r (e) {
			var p = Ext.getDom(e).parentNode,
				doc = (p && (p.ownerDocument || p.documentElement)) || document,
				term = p && p.getAttribute('data-term');
			if (p && !Ext.isEmpty(term)) {
				p.appendChild(doc.createTextNode(term));
			}
		}

		el.select('.choice').removeCls('correct incorrect');
		el.select('.choice .dropzone').removeCls('graded').each(r);

		this.shelfEl.appendChild(this.shelfEl.query(q).concat(this.inputBox.query(q)));
		this.callParent();
	},

	//</editor-fold>
	getSolutionContent: function (part) {
		var f = this.filterHTML.bind(this),
			labels = this.part.get('values').slice().map(f),
			terms = this.part.get('labels').slice().map(f),
			solution = (this.part.get('solutions') || [])[0],
			data = [], termId, labelId;

		solution = solution && solution.get('value');

		if (!solution) {return '';}

		for (termId in solution) {
			if (solution.hasOwnProperty(termId)) {
				labelId = solution[termId];
				data.push({
					sort: labelId,
					term: terms[termId],
					label: labels[labelId]
				});
			}
		}

		data.sort(function (a, b) {
			var x = a.sort, y = b.sort;
			return x === y ? 0 : x < y ? -1 : 1;
		});

		console.debug(data);

		return this.solTpl.apply(data);
	}
});
