Ext.define('NextThought.view.form.fields.SearchComboBox', {
	extend: 'Ext.Component',
	alias: 'widget.searchcombobox',

	listTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'ul', cn: [
			{tag: 'tpl', 'for': 'options', cn: [
				{tag: 'li', 'data-value': '{[values.value || values]}', html: '{[values.text || values]}'}
			]}
		]
	})),

	renderTpl: Ext.DomHelper.markup({
		cls: 'searchcombobox', cn: [
			{tag: 'input', type: 'text', placeholder: '{placeholder}'},
			{cls: 'arrow down'},
			{cls: 'options hidden'}
		]
	}),


	renderSelectors: {
		inputEl: 'input',
		optionsEl: '.options',
		arrowEl: '.arrow'
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			placeholder: this.emptyText
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.filterOptions();

		this.mon(this.optionsEl, 'click', 'selectOptionClick');

		this.mon(this.arrowEl, 'click', 'toggleOptions');

		this.mon(this.inputEl, {
			'keydown': 'inputKeyDown',
			'keyup': 'inputKeyPress',
			'blur': 'inputBlur',
			'focus': 'inputFocus'
		});

		this.mon(Ext.getBody(), 'click', 'bodyClick');
	},


	bodyClick: function(e) {
		if (!e.getTarget('.searchcombobox')) {
			this.hideOptions();
		}
	},


	toggleOptions: function(e) {
		if (e.getTarget('.down')) {
			e.stopEvent();
			this.inputEl.focus();
			this.filterOptions();
			this.showOptions();
			return;
		}
		this.hideOptions();
	},


	addOptions: function(options) {
		this.options = options;

		this.filterOptions();
	},


	showOptions: function() {
		if (!this.optionsEl.hasCls('hidden')) { return; }

		this.arrowEl.removeCls('down');
		this.arrowEl.addCls('up');

		this.optionsEl.removeCls('hidden');

		var top = this.el.dom.getBoundingClientRect().bottom - 2;

		this.optionsEl.setWidth(this.getWidth());
		this.optionsEl.setTop(top);
		this.optionsEl.el.dom.style.maxHeight = (Ext.Element.getViewportHeight() - top - 10) + 'px';
	},


	hideOptions: function() {
		var active = this.optionsEl.down('li.active');

		this.arrowEl.removeCls('up');
		this.arrowEl.addCls('down');

		if (active) {
			active.removeCls('active');
		}
		this.optionsEl.addCls('hidden');
	},


	filterOptions: function(value, show) {
		var options = this.options,
			active, current;

		if (value) {
			options = options.filter(function(option) {
				var text = (option.text || option).toLowerCase();

				return text.indexOf(value.toLowerCase()) === 0;
			});
		}

		this.optionsEl.el.dom.innerHTML = '';

		this.listTpl.append(this.optionsEl, {
			options: options
		});

		//if we only have one item make it the active one
		if (options.length === 1) {
			this.activeValue = options[0].value || options[0];

			//if the value is the whole text of the option make it the current one
			if (value.toLowerCase() === (options[0].text || options[0]).toLowerCase()) {
				this.currentValue = options[0].value || options[0];
				this.currentText = options[0].text || options[0];
			}
		}

		if (show) {
			this.showOptions();
		}

		//if we have an active value to highlight use it, otherwise get the first option in the list
		if (this.activeValue) {
			active = this.optionsEl.down('li[data-value="' + this.activeValue + '"]');
		} else {
			active = this.optionsEl.down('li');
		}

		if (active) {
			current = this.optionsEl.down('li.active');
			//if we already have an active remove the active class before setting on the new one
			if (current) {
				current.removeCls('active');
			}


			active.addCls('active');
		}
	},


	selectOptionClick: function(e) {
		var option = e.getTarget('li');

		if (!option) {
			console.error('No option selected');
			return;
		}

		this.selectOption(option);
		this.hideOptions();
	},

	/**
	 * Set the current option and update the input
	 * @param  {Node} option the li to select
	 */
	selectOption: function(option) {
		this.currentText = option.textContent;
		this.currentValue = option.getAttribute('data-value');

		this.inputEl.dom.value = this.currentText;
		this.fireEvent('select', this.currentValue);
	},


	inputKeyDown: function(e) {
		var charCode = e.getCharCode(),
			current = this.optionsEl.down('li.active'), next;

		if (!current) {
			current = this.optionsEl.down('li');

			if (!current) { return; }

			this.activeValue = current.getAttribute('data-value');

			current.addCls('active');
			return;
		}

		//down select the next sibling if there is one
		if (charCode === e.DOWN) {
			next = current.dom.nextSibling;
		}

		//up select the previous sibling if there is one
		if (charCode === e.UP) {
			next = current.dom.previousSibling;
		}

		if (charCode === e.TAB && this.optionsEl.query('li').length === 1) {
			charCode = e.ENTER;
		}

		//if enter select the current active li
		if (charCode === e.ENTER) {
			this.selectOption(current.dom);
			this.hideOptions();
			return;
		}

		//set the next element active
		if (next) {
			next = Ext.get(next);
			next.addCls('active');
			next.scrollIntoView(this.optionsEl);
			this.activeValue = next.getAttribute('data-value');
			current.removeCls('active');
		}
	},


	inputKeyPress: function(e) {
		var value = this.inputEl.getValue();

		//filter the options and show the options menu unless we are from an enter
		this.filterOptions(value, e.getCharCode() !== e.ENTER);
	},


	inputBlur: function() {
		var me = this;

		wait()
			.then(function() {
				var value = me.inputEl.getValue() || '',
					currentText = me.currentText || '',
					isEmpty = Ext.isEmpty(value),
					isValid = value.toLowerCase() === currentText.toLowerCase();

				//if its not empty and the value is not a valid option
				if (!isEmpty && !isValid) {
					me.inputEl.addCls('error');
				}
			});
	},


	inputFocus: function() {
		this.inputEl.removeCls('error');

		var value = this.inputEl.getValue();

		this.filterOptions(value, true);
	},


	getValue: function() {
		return this.currentValue || this.currentText;
	}
});
