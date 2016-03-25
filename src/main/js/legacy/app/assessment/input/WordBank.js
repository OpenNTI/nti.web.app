var Ext = require('extjs');
var InputBase = require('./Base');
var MixinsQuestionContent = require('../../../mixins/QuestionContent');


module.exports = exports = Ext.define('NextThought.app.assessment.input.WordBank', {
	extend: 'NextThought.app.assessment.input.Base',
	alias: [
		'widget.question-input-fillintheblankwithwordbankpart'
	],


	mixins: {
		questionContent: 'NextThought.mixins.QuestionContent'
	},

	cls: 'wordbank-input',


	renderTpl: Ext.DomHelper.markup([
		{ cls: 'wordbank-ct' },
		'{super}'
	]),


	solTpl: Ext.DomHelper.createTemplate({
		cls: 'multiple-choice-solution',
		cn: ['{0} ', {tag: 'span', cls: 'solution-choice-text', html: '{1}'}]
	}),

	wordTpl: Ext.DomHelper.createTemplate(
		{tag: 'span', cls: 'target wordentry drag graded', html: '{0}'}
	),


	inputTpl: Ext.DomHelper.markup({ cls: 'fill-in', html: '{lineWithBlank}' }),


	blankTpl: Ext.DomHelper.createTemplate({ tag: 'span', cls: 'blank dropzone target', 'data-input': '{inputName}' }),


	renderSelectors: {
		wordBankEl: '.wordbank-ct'
	},


	beforeRender: function () {
		this.callParent(arguments);
		Ext.apply(this.renderData, {
			lineWithBlank: this.buildContent(this.filterHTML(this.part.get('input')))
		});

		this.maybeRelayout = Ext.Function.createBuffered(this.updateLayout, 10, this, []);
	},


	getContentElement: function () {
		var ct = this.callParent(arguments);
		if (!ct.classList.contains('naqfillintheblankwithwordbankpart')) {
			Ext.Error.raise('Part Ordinal Mismatch');
		}

		return ct;
	},


	afterRender: function () {
		this.callParent(arguments);
		var blanks,
			wordbank = this.part.get('wordbank');

		if (wordbank) {
			this.wordbank = Ext.widget({
				xtype: 'assessment-components-wordbank',
				record: this.part, renderTo: this.wordBankEl,
				ownerCt: this,
				partNumber: this.ordinal,
				questionId: this.question.getId()
			});
		}

		blanks = this.inputBox.query('input[type="blankfield"]');
		this.blankInputs = blanks;

		this.contentElement = this.getContentElement();

		blanks = blanks.map(this.setupBlank.bind(this));
		this.blankDrops = blanks;
		if (blanks.length) {
			this.setupDropZones(blanks);
		}

		if (blanks.length > 1) {
			this.setupDragZone();
		}
	},


	setupBlank: function (input) {
		var ctEl = this.contentElement,
			tpl = this.blankTpl,
			data = Ext.apply({ inputName: input.getAttribute('name') }, input.dataset);

		if (ctEl) {
			ctEl = ctEl.querySelector('input[name="' + data.inputName + '"]') || ctEl;
			tpl.insertAfter(ctEl, data);
		}


		return tpl.insertAfter(input, data);
	},


	getDragProxy: function () {
		var proxy = this.dragProxy;

		if (!proxy) {
			proxy = this.dragProxy = new Ext.dd.StatusProxy({
				cls: 'dd-assessment-proxy-ghost',
				id: this.id + '-drag-status-proxy',
				repairDuration: 500
			});
			this.on('destroy', 'destroy', proxy);
		}
		return proxy;
	},


	setupDragZone: function () {
		var cfg, me = this;

		cfg = {
			animRepair: true,
			proxy: this.getDragProxy(),


			getRepairXY: function () { return this.dragData.repairXY; },


			afterRepair: function (e) {
				var d = this.dragData;
				d.repairToEl.appendChild(d.repairEl);
				this.dragging = false;
			}, //override to stop the flash


			getDragData: function (e) {
				var sourceEl, redrag = e.getTarget('.drag', 10), d;
				if (redrag && !e.getTarget('.reset') && !e.getTarget('.graded')) {
					sourceEl = me.getWordBankItem(redrag.dataset.wid);

					d = document.createElement('div');
					d.className = sourceEl.className;
					Ext.DomHelper.append(d, {cls: 'reset'});
					Ext.DomHelper.append(d, sourceEl.dataset.word);

					d = Ext.apply({
						sourceEl: sourceEl,
						repairXY: Ext.fly(sourceEl).getXY(),
						ddel: d,
						repairEl: redrag,
						repairToEl: redrag.parentNode
					}, sourceEl.dataset);

					return d;
				}
			},


			onBeforeDrag: function (dragConfig, e) {
				var inputBox = !!e.getTarget('.inputbox');

				return inputBox && !me.submitted;
			},


			onStartDrag: function () {
				var data = this.dragData,
					co = Ext.fly(data.sourceEl).up('.component-overlay'),
					so = data.sourceEl,
					el = this.getProxy().getDragEl(),
					dx = Math.floor(el.getWidth() / 2),
					dy = -Math.floor(el.getHeight() / 2),
					redrag = data.repairEl;

				redrag.parentNode.removeChild(redrag);

				if (!Ext.isIE10m) {
					// Center drag and drop proxy on cursor pointer
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

		this.dd = new Ext.dd.DragZone(this.inputBox, cfg);
		this.on('destroy', 'destroy', this.dd);
	},


	setupDropZones: function (dropzones) {

		function isValid (data) {
			return data.question === me.question.getId() &&
				   (!data.part || me.ordinal.toFixed(0) === data.part);
		}

		var me = this,
			common = {
				//<editor-fold desc="Boilerplate">
				// If the mouse is over a target node, return that node. This is provided as the "target" parameter in all "onNodeXXXX" node event
				// handling functions
				getTargetFromEvent: function (e) {
					return e.getTarget('.blank.target');
					//return (n && n.childNodes.length > 0) ? null : n;
				},

				// On entry into a target node, highlight that node.
				onNodeEnter: function (target, dd, e, data) { Ext.fly(target).addCls('drop-hover'); },

				// On exit from a target node, unhighlight that node.
				onNodeOut: function (target, dd, e, data) { Ext.fly(target).removeCls('drop-hover'); },

				// While over a target node, return the default drop allowed
				onNodeOver: function (target, dd, e, data) {
					var p = Ext.dd.DropZone.prototype;
					if (!isValid(data)) {
						return p.dropNotAllowed;
					}

					return p.dropAllowed;
				}
				//</editor-fzold>
			},
			dropOnAnswer = {
				onNodeDrop: function (target, dd, e, data) {
					if (!isValid(data)) {return false;}

					try {
						me.setFieldValue(me.getWordBankItem(data.wid), target);
						me.checkSubmissionState();
					} catch (er) {
						return false;
					}

					return true;
				}
			};

		this.dropZones = dropzones.map(function (zone) {
			return new Ext.dd.DropZone(zone, Ext.apply({}, dropOnAnswer, common));
		});

		this.mon(this.reader, {
			buffer: 300,
			scroll: 'onScroll'
		});
	},


	onScroll: function () {
		var zones = this.dropZones || [];
		this.el.select('.drop-hover').removeCls('drop-hover');
		zones.forEach(function (z) {z.triggerCacheRefresh();});
	},


	setFieldValue: function (dragSource, dropTarget) {
		var el = dragSource && dragSource.cloneNode(true),
			dom = el, me = this,
			input = dropTarget && dropTarget.previousSibling,
			replace;

		function reset () {
			input.value = '';
			dropTarget.removeChild(dom);
			Ext.fly(dragSource).removeCls('used');
			me.checkSubmissionState();
		}

		if (!input || input.getAttribute('name') !== dropTarget.dataset.input) {
			Ext.Error.raise('Bad DOM');
		}

		replace = dropTarget.querySelector('.drag');
		if (replace && replace.resetDD) {
			replace.resetDD();
		}

		dropTarget.innerHTML = '';

		if (!dragSource) {
			input.value = '';
			return;
		}

		el = Ext.get(dom);
		Array.prototype.slice.call(dom.childNodes).forEach(function (d) {
			if (!Ext.fly(d).is('.reset')) {
				dom.removeChild(d);
			}
		});
		Ext.DomHelper.append(el, dragSource.dataset.word);

		dom.resetDD = reset;

		dom.removeAttribute('id');
		Ext.fly(dom).removeCls('used');
		Ext.fly(dom).select('[id]').set({id: undefined});

		dropTarget.appendChild(dom);

		input.value = dragSource.dataset.wid;

		el.removeCls('dragging');
		el.select('.reset').on('click', reset, dom);

		if (el.hasCls('unique')) {
			Ext.fly(dragSource).addCls('used');
		}

		me.maybeRelayout();
	},


	checkSubmissionState: function () {
		if (this.submitted) {return;}

		var k, v = this.getValue(),
			allFilledIn = true;

		console.log('Test', v);

		for (k in v) {
			if (v.hasOwnProperty(k)) {
				allFilledIn = !!v[k];
				if (!allFilledIn) {
					break;
				}
			}
		}

		this[allFilledIn ?
			 'enableSubmission' :
			 'disableSubmission']();
	},


	hasValue: function () {
		var k, v = this.getValue();

		for (k in v) {
			if (v.hasOwnProperty(k)) { if (v[k]) {
				return true;
			}}
		}

		return false;
	},


	getValue: function () {
		var value = {};

		(this.blankInputs || []).forEach(function (input) {
			var name = input.getAttribute('name');
			value[name] = input.value || null;
		});

		return value;
	},


	setValue: function (value) {
		var inputName, wordId, dropTarget, dragSource;

		if (value) {
			for (inputName in value) {
				if (value.hasOwnProperty(inputName)) {
					wordId = value[inputName];
					dropTarget = Ext.getDom(this.el.select('.dropzone[data-input="' + inputName + '"]').first());
					dragSource = wordId && this.getWordBankItem(wordId);

					this.setFieldValue(dragSource, dropTarget);
				}
			}
		}
	},


	getWordBankItem: function (wid) {
		var shared = this.up('assessment-question').contentComponents,
			wordBank = this.wordbank,
			sharedWordBank = shared.filter(function (i) {return i.is('assessment-components-wordbank');})[0],
			item;

		if (wordBank) {
			item = wordBank.getItem(wid);
		}

		if (!item && sharedWordBank) {
			item = sharedWordBank.getItem(wid);
		}

		return item;
	},


	markCorrect: function () { this.markGraded(); this.callParent(arguments); },


	markIncorrect: function () { this.markGraded(); this.callParent(arguments); },


	markGraded: function (yes) {
		var action = yes !== false ? 'addCls' : 'removeCls';
		this.el[action]('graded');
		this.el.select('span.blank')[action]('graded');
	},


	reset: function () {
		this.callParent(arguments);
		this.markGraded(false);
		this.el.query('.dropzone .wordentry').forEach(function (pill) {
			pill = Ext.getDom(pill);
			pill.resetDD();
		});
	},


	getSolutionContent: function (part) {
		function re (original, attrs) {
			attrs = (attrs || '').trim().split(/\s/);

			if (/type=(\"|\')?blankfield/i.test(attrs)) {
				attrs = ((/name=\W?(\w+)\W?/).exec(attrs) || [])[1];
				if (attrs) {
					return '{' + attrs + '} ';//the inputs don't have a space between them and the following words. :/
				}
			}

			return original;
		}

		var me = this,
			out = [], tpl = me.solTpl,
			pillTpl = me.wordTpl,
			line = Ext.DomHelper.createTemplate(
					me.filterHTML(
							me.part.get('input')
									.replace(/<input([^>]+?)\/?>/igm, re)));

		Ext.each(part.get('solutions'), function (s) {
			var x = s.get('value');
			// x may or may not be an Array.  Ext.each handles that for us.
			Ext.each(x, function (s) {
				var k, w, v = {};
				for (k in s) {
					if (s.hasOwnProperty(k)) {
						w = me.getWordBankItem(s[k]);
						v[k] = (w && w.dataset.word) || '';
						if (!w || !w.dataset.word) {
							console.error('Solution for ' + k + 'references a bad word bank entry: ' + s[k]);
						}

						v[k] = pillTpl.apply([v[k]]);
					}
				}

				out.push(tpl.apply([
					line.apply(v)
				]));
			});
		});

		return out.join('');
	}
});
