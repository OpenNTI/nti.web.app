Ext.define('NextThought.mixins.grid-feature.GradeInputs', {

	__inputSelector: '.score input',


	__getGridView: function() {
		return this.view;
	},


	monitorSubTree: function() {
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
			observer;

		if (!MutationObserver) {
			alert(getString('NextThought.view.courseware.assessment.admin.Grid.oldbrowser'));
			return false;
		}

		observer = new MutationObserver(this.bindInputs.bind(this));

		observer.observe(Ext.getDom(this.__getGridView().getEl()), { childList: true, subtree: true });
		this.on('destroy', 'disconnect', observer);

		return true;
	},


	bindInputs: function() {
		function stop(e) { e.stopPropagation(); }
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


	getRecordFromEvent: function(e) {
		var v = this.__getGridView(),
			n = e.getTarget(v.itemSelector);
		return v.getRecord(n);
	},


	onInputBlur: function(e, dom) {
		var record = this.getRecordFromEvent(e),
			value = Ext.fly(dom).getValue();

		if (record) {
			this.editGrade(record, value);
		}
	},


	onInputFocusIE: function(e) {
		e.stopPropagation();
		this.onInputFocus.apply(this, arguments);
	},


	onInputFocus: function(e, el) {
		var v = el.value,
			len = (v && v.length) || 0;

		if (len && el.setSelectionRange) {
			el.setSelectionRange(0, len);
		}
	},


	onInputKeyPress: function(e) {
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


	getSiblingInput: function(e, direction) {
		var current = e.getTarget(this.__getGridView().itemSelector);
		if (current) {
			current = Ext.fly(current[direction + 'Sibling']);
			return current && current.down('input', true);
		}
	},


	editGrade: function(record, value) {
		var view = this.__getGridView(), store = this.store,
			grade = record.get('Grade'),
			v = grade && grade.getValues();

		//'' !== null so double check that at least on of the values is truthy before trying to save it
		if (v.value !== value && (v || value)) {
			//if there's no grade and no value don't bother creating one
			if (!grade && !value) {
				return;
			}

			store.suspendEvents();
			Ext.fly(view.getNode(record)).setStyle({opacity: '0.3'});

			if (!grade) {
				//this might throw an exception...what should we do?
				record.buildGrade();
				grade = record.get('Grade');
			}

			console.debug('saving: ' + value, 'to', grade.get('href'));

			grade.saveValue(value, '-')
				.fail(function() {
					grade.reject();
				})
				.always(function() {
					store.resumeEvents();

					var n = view.getNode(record);

					if (n) {
						Ext.fly(n).setStyle({opacity: 1});
					}
				});
		}
	}
});
