Ext.define('NextThought.view.assessment.input.WordBank', {
	extend: 'NextThought.view.assessment.input.Base',
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
		cn: ['{0}. ', {tag: 'span', cls: 'solution-choice-text', html: '{1}'}]
	}),


	inputTpl: Ext.DomHelper.markup({ cls: 'fill-in', html: '{lineWithBlank}' }),


	blankTpl: Ext.DomHelper.createTemplate({ tag: 'span', cls: 'blank dropzone target', 'data-input': '{inputName}' }),


	renderSelectors: {
		wordBankEl: '.wordbank-ct'
	},


	beforeRender: function() {
		this.callParent(arguments);
		Ext.apply(this.renderData, {
			lineWithBlank: this.buildContent(this.filterHTML(this.part.get('input')))
		});

		this.maybeRelayout = Ext.Function.createBuffered(this.updateLayout, 10, this, []);
	},


	afterRender: function() {
		this.callParent(arguments);
		var blanks,
			wordbank = this.part.get('wordbank');

		if (wordbank) {
			this.wordbank = Ext.widget({
				xtype: 'assessment-components-wordbank',
				record: this.part, renderTo: this.wordBankEl,
				partNumber: this.ordinal,
				questionId: this.question.getId()
			});
		}

		blanks = this.inputBox.query('input[type="blankfield"]');
		this.blankInputs = blanks;

		blanks = blanks.map(this.setupBlank.bind(this));
		this.blankDrops = blanks;
		if (blanks.length) {
			this.setupDropZones(blanks);
		}

		//If there are more than one (drops), enable reordering.
		// Create a DragZone and make it clone dropped pill, while removing
		// the pill so the blank style restores while dragging. If the drag
		// is canceled, we will restore the pill to the bank. On drop, we
		// will "reset" any existing pills before dropping.
	},


	setupBlank: function(input) {
		return this.blankTpl.insertAfter(input, Ext.apply({
			inputName: input.getAttribute('name')
		}, input.dataset));
	},


	setupDropZones: function(dropzones) {

		function isValid(data) {
			return data.question === me.question.getId() &&
				   (!data.part || me.ordinal.toFixed(0) === data.part);
		}

		var me = this,
			common = {
				//<editor-fold desc="Boilerplate">
				// If the mouse is over a target node, return that node. This is provided as the "target" parameter in all "onNodeXXXX" node event
				// handling functions
				getTargetFromEvent: function(e) {
					var n = e.getTarget('.blank.target');
					return (n && n.childNodes.length > 0) ? null : n;
				},

				// On entry into a target node, highlight that node.
				onNodeEnter: function(target, dd, e, data) { Ext.fly(target).addCls('drop-hover'); },

				// On exit from a target node, unhighlight that node.
				onNodeOut: function(target, dd, e, data) { Ext.fly(target).removeCls('drop-hover'); },

				// While over a target node, return the default drop allowed
				onNodeOver: function(target, dd, e, data) {
					var p = Ext.dd.DropZone.prototype;
					if (!isValid(data)) {
						return p.dropNotAllowed;
					}

					return p.dropAllowed;
				}
				//</editor-fzold>
			},
			dropOnAnswer = {
				onNodeDrop: function(target, dd, e, data) {
					if (!isValid(data)) {return false;}

					try {
						me.setFieldValue(data.sourceEl, target);
					} catch (er) {
						return false;
					}

					return true;
				}
			};

		this.dropZones = dropzones.map(function(zone) {
			return new Ext.dd.DropZone(zone, Ext.apply(dropOnAnswer, common));
		});
	},


	setFieldValue: function(dragSource, dropTarget) {
		var el = dragSource && dragSource.cloneNode(true),
			dom = el, me = this,
			input = dropTarget && dropTarget.previousSibling;

		if (!input || input.getAttribute('name') !== dropTarget.dataset.input) {
			Ext.Error.raise('Bad DOM');
		}

		dropTarget.innerHTML = '';

		if (!dragSource) {
			input.value = '';
			return;
		}

		el = Ext.get(dom);
		Array.prototype.forEach.call(dom.childNodes, function(d) {
			if (!Ext.fly(d).is('.reset')) {
				dom.removeChild(d);
			}
		});
		Ext.DomHelper.append(el, dragSource.dataset.word);

		dom.resetDD = function() {
			input.value = '';
			dropTarget.removeChild(dom);
			Ext.fly(dragSource).removeCls('used');
			me.checkSubmissionState();
		};

		dom.removeAttribute('id');
		Ext.fly(dom).removeCls('used');
		Ext.fly(dom).select('[id]').set({id: undefined});

		dropTarget.appendChild(dom);

		input.value = dragSource.dataset.wid;

		el.removeCls('dragging');
		el.select('.reset').on('click', dom.resetDD);

		if (el.hasCls('unique')) {
			Ext.fly(dragSource).addCls('used');
		}

		me.checkSubmissionState();
		me.maybeRelayout();
	},


	checkSubmissionState: function() {
		var k, v = this.getValue(),
			allFilledIn = true;

		//console.log('Test', v);

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


	getValue: function() {
		var value = {};

		(this.blankInputs || []).forEach(function(input) {
			var name = input.getAttribute('name');
			value[name] = input.value || false;
		});

		return value;
	},


	setValue: function(value) {
		console.log(value);

		var inputName, wordId, dropTarget, dragSource;

		for (inputName in value) {
			if (value.hasOwnProperty(inputName)) {
				wordId = value[inputName];
				dropTarget = Ext.getDom(this.el.select('.dropzone[data-input="' + inputName + '"]').first());
				dragSource = this.getWordBankItem(wordId);

				this.setFieldValue(dragSource, dropTarget);
			}
		}
	},


	getWordBankItem: function(wid) {
		var shared = this.up('assessment-question').contentComponents,
			wordBank = this.wordbank,
			sharedWordBank = shared.filter(function(i) {return i.is('assessment-components-wordbank');})[0],
			item;

		if (wordBank) {
			item = wordBank.getItem(wid);
		}

		if (!item && sharedWordBank) {
			item = sharedWordBank.getItem(wid);
		}

		return item;
	},


	//markCorrect: function() { this.callParent(arguments); },


	//markIncorrect: function() { this.callParent(arguments); },


	reset: function() {
		this.callParent(arguments);

		this.el.query('.dropzone .wordentry').forEach(function(pill) {
			pill = Ext.getDom(pill);
			pill.resetDD();
		});
	},


	getSolutionContent: function(part) {
		function re(original, attrs) {
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
			line = Ext.DomHelper.createTemplate(
					me.filterHTML(
							me.part.get('input')
									.replace(/<input([^>]+?)\/?>/igm, re)));

		Ext.each(part.get('solutions'), function(s) {
			var x = s.get('value');
			// x may or may not be an Array.  Ext.each handles that for us.
			Ext.each(x, function(s) {
				var k, w, v = {};
				for (k in s) {
					if (s.hasOwnProperty(k)) {
						w = me.getWordBankItem(s[k]);
						v[k] = w && w.dataset.word;
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
