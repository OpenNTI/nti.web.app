Ext.define('NextThought.common.form.fields.SearchComboBox', {
	extend: 'Ext.Component',
	alias: 'searchcombobox',

	cls: 'searchcombobox',


	listTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'ul', cn: [
			{tag: 'tpl', 'for': 'options', cn: [
				{tag: 'li', 'data-value': '{value}', 'data-index': '{index}', html: '{text}'}
			]}
		]
	})),


	renderTpl: Ext.DomHelper.markup([
		{tag: 'input', type: 'text', placeholder: '{placeholder}', tabindex: '0'},
		{cls: 'arrow down'},
		{cls: 'options hidden'}
	]),


	renderSelectors: {
		inputEl: 'input',
		optionsEl: '.options',
		arrowEl: '.arrow'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.__align = this.__align.bind(this);
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			placeholder: this.placeholder
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.options) {
			this.setOptions(this.options);
		}

		this.mon(this.optionsEl, 'click', this.selectItem.bind(this));
		this.mon(this.arrowEl, 'click', this.toggleOptions.bind(this));

		this.mon(this.inputEl, {
			keydown: this.onInputKeyDown.bind(this),
			keyup: this.onInputKeyUp.bind(this),
			focus: this.onInputFocus.bind(this),
			blur: {fn: this.onInputBlur.bind(this), buffer: 10},
			click: this.showOptions.bind(this)
		});

		if (this.hasBeenDisabled) {
			this.disable();
		}
	},


	setOptions: function(options) {
		if (!this.rendered) {
			this.on('afterrender', this.setOptions.bind(this, options));
			return;
		}

		this.options = options.map(function(option, index) {
			if (option.hasOwnProperty('value')) {
				option = Ext.clone(option);
			} else {
				option = {value: option, text: option.toString()};
			}

			option.toString = function() { return this.text; };
			option.index = index;

			return option;
		});

		this.optionsEl.dom.innerHTML = '';

		this.listTpl.append(this.optionsEl, {
			options: this.options
		});
	},


	getOptions: function() {
		return (this.options || []).map(function(option) {
			return option.value;
		});
	},


	enable: function() {
		this.hasBeenDisabled = null;

		if (!this.rendered) {
			return;
		}

		this.removeCls('disabled');
		this.inputEl.dom.removeAttribute('disabled');
	},


	disable: function() {
		this.hasBeenDisabled = true;

		if (!this.rendered) {
			return;
		}

		this.addCls('disabled');
		this.inputEl.dom.setAttribute('disabled', true);
	},


	__align: function() {
		if (!this.rendered) {
			return;
		}

		var alignTo = this.el.dom,
			options = this.optionsEl.dom,
			rect = alignTo.getBoundingClientRect(),
			top = rect.bottom - 2;

		options.style.width = alignTo.clientWidth + 'px';
		options.style.top = top + 'px';
		options.style.maxHeight = (Ext.Element.getViewportHeight() - top - 10) + 'px';
	},


	alignOptions: function() {
		Ext.EventManager.onWindowResize(this.__align);
		this.scrollListener = this.mon(this.scrollParent || Ext.getBody(), 'scroll', this.__align);
		this.__align();
	},


	unalignOptions: function() {
		Ext.EventManager.removeResizeListener(this.__align);
		Ext.destroy(this.scrollListener);
	},


	showOptions: function() {
		this.arrowEl.removeCls('down');
		this.arrowEl.addCls('up');

		this.optionsEl.removeCls('hidden');

		this.alignOptions();
	},


	hideOptions: function() {
		var active = this.optionsEl.down('li.active');

		this.arrowEl.removeCls('up');
		this.arrowEl.addCls('down');

		if (active) {
			active.removeCls('active');
		}

		this.optionsEl.addCls('hidden');
		this.unalignOptions();
	},


	toggleOptions: function(e) {
		if (e.getTarget('.disabled')) { return; }

		if (e.getTarget('.down')) {
			e.stopEvent();
			this.inputEl.focus();
			this.filterOptions(this.inputEl.dom.value);
			this.showOptions();
		} else {
			this.hideOptions();
		}
	},


	filterOptions: function(value) {
		var options = this.options,
			listItems = this.optionsEl.dom.querySelectorAll('li'),
			regex = value && new RegExp('^' + RegExp.escape(value), 'i'),
			unfilteredOptions;

		listItems = Array.prototype.slice.call(listItems);

		unfilteredOptions = listItems.reduce(function(acc, listItem) {
			var index = listItem.getAttribute('data-index'),
				option = options[index],
				filter = regex && !regex.test(option.text);

			if (filter) {
				listItem.classList.add('filtered');
				listItem.classList.remove('active');
			} else {
				acc.push(listItem);
				listItem.classList.remove('filtered');
			}

			return acc;
		}, []);

		return unfilteredOptions;
	},


	selectItem: function(e) {
		var item = e.getTarget('li'),
			index = item && item.getAttribute('data-index'),
			option = index && this.options[index];

		if (option) {
			this.__selectOption(option);
		}
	},


	__selectOption: function(option, silent) {
		var changed = option !== this.selectedOption;

		this.selectedOption = option;
		this.inputEl.dom.value = option ? option.text : '';

		if (!silent && this.onSelect && changed) {
			this.onSelect(option && option.value);
		}
	},


	__selectSibling: function(options, direction) {
		var currentIndex, item;

		currentIndex = options.reduce(function(acc, item, index) {
			if (item.classList.contains('active')) {
				acc = index;
			}

			return acc;
		}, -1);

		item = options[currentIndex];

		if (item) {
			item.classList.remove('active');
		}

		currentIndex = currentIndex + direction;

		if (currentIndex === -2) {
			currentIndex = 0;
		} else if (currentIndex < 0) {
			currentIndex = options.length - 1;
		} else if (currentIndex >= options.length) {
			currentIndex = 0;
		}

		item = options[currentIndex];

		if (item) {
			item.classList.add('active');
		}
	},


	__autoCompleteSelectedItem: function(unfilteredOptions) {
		var active,
			options = this.options;

		active = unfilteredOptions.reduce(function(acc, option) {
			if (option.classList.contains('active')) {
				acc = options[option.getAttribute('data-index')];
			}

			return acc;
		}, null);

		if (active) {
			this.inputEl.dom.value = active.text;
		}

		return !!active;
	},


	__getExactMatch: function(value) {
		if (!value) { return null; }

		value = value.toLowerCase();

		return (this.options || []).reduce(function(acc, option) {
			if (value === option.text.toLowerCase()) {
				acc = option;
			}

			return acc;
		}, null);
	},


	onInputKeyDown: function(e) {
		var charCode = e.getCharCode(),
			value = this.inputEl.getValue(),
			open = !this.optionsEl.hasCls('hidden'),
			exactMatch = this.__getExactMatch(value),
			unfilteredOptions = this.filterOptions(value),
			autoComplete;

		if (open && charCode === e.ESC) {
			e.stopEvent();
			this.hideOptions();
			return;
		}

		autoComplete = (!e.shiftKey && charCode === e.TAB) || charCode === e.RIGHT || charCode === e.ENTER;

		if (charCode === e.DOWN) {
			if (open) {
				this.__selectSibling(unfilteredOptions, 1);
				e.stopEvent();
			} else {
				this.showOptions();
			}
		} else if (charCode === e.UP) {
			this.__selectSibling(unfilteredOptions, -1);
			e.stopEvent();
		//If the value isn't a match and there are still unfiltered options, try to auto complete it
		} else if (exactMatch && autoComplete) {
			this.__selectOption(exactMatch);
		} else if (charCode === e.ENTER && unfilteredOptions.length > 0 && open) {
			this.__autoCompleteSelectedItem(unfilteredOptions);
			e.stopEvent();
		} else if (value !== '' && autoComplete && unfilteredOptions.length > 0 && open) {
			//Auto complete the selected item
			if (this.__autoCompleteSelectedItem(unfilteredOptions)) {
				e.stopEvent();
			}
		}
	},


	onInputKeyUp: function() {
		var value = this.inputEl.getValue(),
			unfilteredOptions = this.filterOptions(value),
			hasSelected;

		hasSelected = unfilteredOptions.reduce(function(acc, option) {
			return option.classList.contains('active') || acc;
		}, false);


		if (!hasSelected && unfilteredOptions[0]) {
			unfilteredOptions[0].classList.add('active');
		}
	},


	onInputBlur: function() {
		var value = this.inputEl.getValue(),
			selectedOption = this.selectedOption,
			exactMatch = this.__getExactMatch(value);

		if (value === '') {
			this.__selectOption(null);
		} else if (exactMatch) {
			this.__selectOption(exactMatch);
		} else if (value && selectedOption) {
			this.__selectOption(selectedOption);
		} else {
			this.__selectOption(null);
		}

		wait(100)
			.then(this.hideOptions.bind(this));
	},


	onInputFocus: function() {
		// this.inputEl.dom.value = '';
		this.filterOptions('');
		this.showOptions();
	},


	setValue: function(value) {
		var option;

		option = (this.options || []).reduce(function(acc, o) {
			if (o.value === value) {
				acc = o;
			}

			return acc;
		}, null);

		this.__selectOption(option);
	},


	getValue: function() {
		var option = this.selectedOption;

		return option && option.value;
	}
});
