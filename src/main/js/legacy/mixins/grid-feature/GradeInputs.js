const Ext = require('extjs');

const {getString} = require('legacy/util/Localization');


module.exports = exports = Ext.define('NextThought.mixins.grid-feature.GradeInputs', {

	__inputSelector: '.score input',


	__getGridView: function () {
		return this.view;
	},


	monitorSubTree: function () {
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
			observer, view = this.__getGridView();

		if (!MutationObserver) {
			alert(getString('NextThought.view.courseware.assessment.admin.Grid.oldbrowser'));
			return false;
		}

		// this.editGrade = Ext.Function.createThrottled(this.editGrade.bind(this), 100);

		observer = new MutationObserver(this.bindInputs.bind(this));

		observer.observe(Ext.getDom(this.__getGridView().getEl()), { childList: true, subtree: true });
		this.on('destroy', 'disconnect', observer);

		this.mon(view.el, 'scroll', 'onViewScroll');

		return true;
	},


	bindInputs: function () {
		function stop (e) { e.stopPropagation(); }
		var mons = {
				destroyable: true,
				blur: 'onInputBlur',
				focus: 'onInputFocus',
				keypress: 'onInputKeyPress',
				keydown: 'onInputKeyPress'
			},
			inputs = this.__getGridView().getEl().select(this.__inputSelector);

		Ext.destroy(this.gridInputListeners);


		//IE11p Ext.isIE will not be true for IE11p
		if (Ext.isIE11p || Ext.isIE) {
			Ext.apply(mons, {
				focusout: 'onInputBlur',
				blur: Ext.emptyFn,
				focusin: 'onInputFocusIE',
				click: stop,
				mousedown: stop,
				mouseup: stop
			});
		}

		this.gridInputListeners = this.mon(inputs, mons);
	},


	getRecordFromEvent: function (e) {
		var v = this.__getGridView(),
			n = e.getTarget(v.itemSelector);
		return v.getRecord(n);
	},


	onViewScroll: function () {
		if (!this.currentFocused) { return; }

		var input = this.currentFocused,
			v = this.__getGridView(),
			row = input.up(v.itemSelector),
			rec = v && v.getRecord(row),
			targetRecordId = row && row.dom.getAttribute('data-recordid');

		if (rec && rec.getId() === targetRecordId) {
			this.editGrade(rec, input.dom.value);
		}
	},


	getEditRecordFor (record) {
		if (!this.editFunctions) {
			this.editFunctions = {};
		}

		const historyItem = this.getHistoryItemFromRecord(record);
		const id = historyItem.getId() || historyItem.id;

		if (!this.editFunctions[id]) {
			this.editFunctions[id] = Ext.Function.createBuffered(this.editGrade.bind(this), 100);
		}

		return this.editFunctions[id];
	},


	onInputBlur: function (e, dom) {
		var record = this.getRecordFromEvent(e),
			value = Ext.fly(dom).getValue(),
			editGradeFn = record && this.getEditRecordFor(record);

		if (editGradeFn) {
			editGradeFn(record, value);
		}

		// Clear the focused flag
		delete this.currentFocused;
	},


	onInputFocusIE: function (e) {
		e.stopPropagation();
		this.onInputFocus.apply(this, arguments);
	},


	onInputFocus: function (e, el) {
		var v = el.value,
			len = (v && v.length) || 0;

		if (len && el.setSelectionRange) {
			el.setSelectionRange(0, len);
		}

		this.currentFocused = Ext.get(el);
	},


	onInputKeyPress: function (e) {
		var newInput, key = e.getKey(), direction = 'next';
		if (key === e.ENTER || key === e.DOWN || key === e.UP) {
			e.stopEvent();

			if (key === e.UP) {direction = 'previous';}
			newInput = this.getSiblingInput(e, direction);
			if (newInput) {
				newInput.focus();
			}
		}
	},


	getSiblingInput: function (e, direction) {
		var current = e.getTarget(this.__getGridView().itemSelector);
		if (current) {
			current = Ext.fly(current[direction + 'Sibling']);
			return current && current.down('input', true);
		}
	},


	getHistoryItemFromRecord: function (record) {
		return record;
	},


	editGrade: function (record, value) {
		var me = this,
			view = me.__getGridView(),
			historyItem = me.getHistoryItemFromRecord(record),
			node = view.getNode(record);

		//mask the input
		if (node) {
			Ext.fly(node).setStyle({opacity: '0.3'});
		}

		if (historyItem.shouldSaveGrade(value, '-')) {
			this.save = historyItem.saveGrade(value, '-');
		} else {
			this.save = Promise.resolve();
		}

		if (me.beforeEdit) {
			me.beforeEdit();
		}

		this.save.always(function () {
			var n = view.getNode(record);//get the node fresh since it may have changed

			console.log(node);
			if (n) {
				Ext.fly(n).setStyle({opacity: 1});
			}

			if (me.afterEdit) {
				me.afterEdit();
			}

			me.fireEvent('grade-updated', record);

			delete me.save;
		});



	}
});
