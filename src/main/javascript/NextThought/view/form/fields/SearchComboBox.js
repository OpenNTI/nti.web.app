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
			'blur': {fn: 'inputBlur', scope: this, buffer: 10},
			'focus': 'inputFocus',
			'click': 'showOptions'
		});

		//this.mon(Ext.getBody(), 'click', function(e) {if (!e.getTarget('.searchcombobox')) { this.hideOptions(); }}, this);
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
		function convert(o) {
			return o.hasOwnProperty('value') ? o : {value: o, text: o};
		}

		this.options = options.map(convert);

		this.filterOptions();

		if (this.currentValue) {
			this.setValue(this.currentValue);
		}
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
				var text = option.text.toLowerCase();
				return text.indexOf(value.toLowerCase()) === 0;
			});

			//No matches? unfilter?
			//if (options.length === 0) { options = this.options.slice(); }
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
	 * @param  {Boolean} silent don't fire an event
	 */
	selectOption: function(option, silent) {
		this.currentText = option.textContent;
		this.currentValue = option.getAttribute('data-value');

		this.inputEl.dom.value = this.currentText;
		this.inputEl.removeCls('error');

		if (!silent) {
			this.fireEvent('select', this.currentValue);
		}
	},


	deselect: function() {
		delete this.currentText;
		delete this.currentValue;
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

		if (!this.optionsEl.hasCls('hidden')) {
			if (charCode === e.ESC) {
				e.stopEvent();
				this.hideOptions();
				return;
			}
		}

		//down select the next sibling if there is one
		if (charCode === e.DOWN) {
			if (!this.optionsEl.hasCls('hidden')) {
				next = current.dom.nextSibling || current.dom.parentNode.firstChild;
			} else {
				this.showOptions();
			}
		}

		//up select the previous sibling if there is one
		if (charCode === e.UP) {
			next = current.dom.previousSibling || current.dom.parentNode.lastChild;
		}

		if (charCode === e.TAB || charCode === e.RIGHT) {
			charCode = e.ENTER;
		}

		//if enter select the current active li
		if (charCode === e.ENTER) {
			if (!e.shiftKey && !this.optionsEl.hasCls('hidden')) {
				this.selectOption(current.dom);
			}
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
			this.selectOption(next.dom, true);
		}
	},


	IGNORE_KEY_CODES: {
		'9': true, //TAB
		'13': true, //ENTER/RETURN
		'27': true, //ESC
		'37': true, //LEFT
		'38': true, //UP
		'39': true, //RIGHT
		'40': true  //DOWN
	},


	inputKeyPress: function(e) {
		var value = this.inputEl.getValue();

		if (!this.IGNORE_KEY_CODES[e.getCharCode()]) {
			this.deselect();
			//filter the options and show the options menu unless we are from an enter
			this.filterOptions(value, true);
		}
	},


	inputBlur: function() {
		function search(o) {
			return o.text.toLowerCase() === value;
		}

		var value = (this.inputEl.getValue() || '').toLowerCase(),
			isEmpty = Ext.isEmpty(value),
			isValid = this.options.filter(search).length === 1;

		//if its not empty and the value is not a valid option
		this.inputEl.removeCls('error');
		if (!isEmpty && !isValid) {
			if (this.currentValue) {
				this.inputEl.dom.value = this.currentText;
			} else {
				this.inputEl.addCls('error');
			}
		}

		this.__hideOptionsTimer = setTimeout(this.hideOptions.bind(this), 300);
	},


	inputFocus: function() {
		this.inputEl.removeCls('error');
		this.filterOptions('');
		clearTimeout(this.__hideOptionsTimer);
	},


	setValue: function(value) {
		var li;

		this.currentValue = value;

		if (!Ext.isEmpty(this.options)) {
			li = this.el.down('li[data-value="' + value + '"]');

			if (li) {
				this.selectOption(li.dom);
			}
		}
	},


	getValue: function() {
		return this.currentValue || this.currentText;
	}
});
