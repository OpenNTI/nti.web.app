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
		var inputs = this.__getGridView().getEl().select(this.__inputSelector);
		Ext.destroy(this.gridInputListeners);

		this.gridInputListeners = this.mon(inputs, {
			destroyable: true,
			blur: 'onInputBlur',
			//focusout: 'onInputBlur',
			focus: 'onInputFocus',
			//focusin: 'onInputFocus',
			keypress: 'onInputKeyPress',
			keydown: 'onInputKeyPress',
			mousedown: function(e) {e.stopPropagation();}
		});
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
		var view = this.__getGridView(),
			grade = record.get('Grade'),
			v = grade && grade.get('value');

		v = v && v.split(' ')[0];

		if (v !== value && !Ext.isEmpty(value)) {
			Ext.fly(view.getNode(record)).setStyle({opacity: '0.3'});

			if (!grade) {
				//this might throw an exception...what should we do?
				record.buildGrade();
				grade = record.get('Grade');
			}

			console.debug('saving: ' + value, 'to', grade.get('href'));

			grade.set('value', value + ' -');
			grade.save({
				failure: function() {
					grade.reject();
				},
				callback: function() {
					var n = view.getNode(record);
					if (n) {
						Ext.fly(n).setStyle({opacity: 1});
					}
				}
			});
		}
	}
});
