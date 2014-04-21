Ext.define('NextThought.view.assessment.input.WordBank', {
	extend: 'NextThought.view.assessment.input.Base',
	alias: [
		'widget.question-input-fillintheblankwithwordbankpart'
	],

	cls: 'wordbank-input',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'wordbank-ct' },
		'{super}'
	]),


	inputTpl: Ext.DomHelper.markup({ cls: 'fill-in', html: '{lineWithBlank}' }),


	blankTpl: Ext.DomHelper.createTemplate({ tag: 'span', cls: 'blank dropzone target' }),


	renderSelectors: {
		wordBankEl: '.wordbank-ct'
	},


	beforeRender: function() {
		this.callParent(arguments);
		Ext.apply(this.renderData, {
			lineWithBlank: this.part.get('input')
		});
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

		blanks = this.inputBox.query('input.nqablankfield');//TODO: input[type="blank"]
		this.blankInputs = blanks;

		blanks = blanks.map(this.setupBlank.bind(this));
		this.blankDrops = blanks;
		if (blanks.length) {
			this.setupDropZones(blanks);
		}
	},


	setupBlank: function(input) {
		return this.blankTpl.insertAfter(input, input.dataset);
	},


	setupDropZones: function(dropzones) {

		function isValid(data) {
			return data.question === me.question.getId() &&
				   (!data.part || me.ordinal.toFixed(0) === data.part);
		}

		var id = this.id,
			me = this,
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

					var source = data.sourceEl,
						el = source.cloneNode(true);

					el.removeAttribute('id');
					Ext.fly(el).select('[id]').set({id: undefined});

					target.appendChild(el);

					el = Ext.get(el);
					el.removeCls('dragging');

					el.on('click', function(e) {
						if (e.getTarget('.reset')) {
							el.remove();
							Ext.fly(source).removeCls('used');
						}
					});

					if (el.hasCls('unique')) {
						Ext.fly(source).addCls('used');
					}

					return true;
				}
			};

		this.dropZones = dropzones.map(function(zone) {
			return new Ext.dd.DropZone(zone, Ext.apply(dropOnAnswer, common));
		});
	},


	getValue: function() {},


	setValue: function(str) {},


	markCorrect: function() { this.callParent(arguments); },


	markIncorrect: function() { this.callParent(arguments); },


	reset: function() { this.callParent(arguments); }
});
