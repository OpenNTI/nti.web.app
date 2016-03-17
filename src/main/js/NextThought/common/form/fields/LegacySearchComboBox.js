Ext.define('NextThought.common.form.fields.LegacySearchComboBox', {
	extend: 'Ext.Component',
	alias: 'widget.legacysearchcombobox',

	mixins: {
		Scrolling: 'NextThought.mixins.Scrolling'
	},

	editable: true,

	listTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'ul', cn: [
			{tag: 'tpl', 'for': 'options', cn: [
				{tag: 'li', 'data-value': '{value}', 'data-index': '{index}', html: '{text}'}
			]}
		]
	})),

	renderTpl: Ext.DomHelper.markup({
		cls: 'searchcombobox', cn: [
			'<input type="text" placeholder="{placeholder}" {readonly:boolStr("readonly")} tabindex="0">',
			{cls: 'arrow down'},
			{cls: 'options hidden'}
		]
	}),


	renderSelectors: {
		inputEl: 'input',
		optionsEl: '.options',
		arrowEl: '.arrow'
	},


	constructor: function() {
		this.callParent(arguments);
		if (this.options) {
			this.addOptions(this.options);
		}

		this.__inputBuffer = '^';
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			readonly: !this.editable,
			placeholder: this.emptyText
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.options) {
			this.filterOptions();
		}

		this.mon(this.optionsEl, {
			'click': 'selectOptionClick',
			'scroll': 'onOptionsScroll'
		});

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


	onOptionsScroll: function(e) {
		e.stopPropagation();

		this.maybeStopScrollBleed(e);
	},


	toggleOptions: function(e) {
		if (e.getTarget('.disabled')) {
			return;
		}

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
		function convert(o, index) {
			o = o.hasOwnProperty('value') ? Ext.clone(o) : {value: o, text: o.toString()};
			o.toString = function() {return this.text;};
			o.index = index;
			return o;
		}

		this.options = options.map(convert);

		this.filterOptions();

		if (this.currentValue) {
			this.setValue(this.currentValue);
		}
	},


	showOptions: function() {
		if (!this.rendered) { return; }

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
		if (!this.rendered) { return; }

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
			active, current, regex;

		if (value && this.editable) {
			regex = new RegExp('^' + RegExp.escape(value), 'i');
			options = options.filter(regex.test.bind(regex));

			//No matches? unfilter?
			//if (options.length === 0) { options = this.options.slice(); }
		}

		this.optionsEl.el.dom.innerHTML = '';

		this.listTpl.append(this.optionsEl, {
			options: options
		});

		//if we only have one item make it the active one
		if (options.length === 1) {
			this.activeValue = options[0].value;

			//if the value is the whole text of the option make it the current one
			if (value && value.toLowerCase() === options[0].text.toLowerCase()) {
				this.currentValue = options[0].value;
				this.currentText = options[0].text;
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


	activateOption: function(el, silent) {
		this.optionsEl.select('.active').removeCls('active');
		el = Ext.get(el.dom || el);
		el.addCls('active');
		el.scrollIntoView(this.optionsEl);
		el.activeValue = el.getAttribute('data-value');
		this.selectOption(el.dom, silent);
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
	 * @param  {Node} el the li to select
	 * @param  {Boolean} silent don't fire an event
	 */
	selectOption: function(el, silent) {
		var index = el.getAttribute('data-index'),
			option = this.options[index],
			value = option && option.value,
			text = option && option.text;

		this.__setValue(text || el.textContent, value || el.getAttribute('data-value'), silent);
	},

	__setValue: function(text, value, silent) {
		this.currentText = text;
		this.currentValue = value;
		this.inputEl.dom.value = this.currentText;
		this.inputEl.removeCls('error');

		if (!silent) {
			this.fireEvent('select', this.currentValue);
		}

		if (!silent && this.onSelect) {
			this.onSelect(value);
		}
	},

	selectNextMatch: function(e) {
		function str(o) {return (o || '').toString();}
		var me = this,
			ch = String.fromCharCode(e.getCharCode()),
			options = this.options,
			selected = options.map(str).indexOf(this.currentText),
			matcher, o, len = options.length, start;

		function clear() { me.__inputBuffer = '^'; }

		if (/[A-Z]/i.test(ch)) {
			if (me.__inputBuffer.charAt(me.__inputBuffer.length - 1) !== ch) {
				me.__inputBuffer += ch;
			}
			clearTimeout(me.__inputBufferClear);
			me.__inputBufferClear = setTimeout(clear, 250);
		} else {
			me.__inputBuffer = '^';
			return;
		}

		matcher = new RegExp(me.__inputBuffer, 'i');
		selected = ((matcher.test(this.currentText) && selected) || -1) + 1;

		start = selected;
		for (selected; selected <= len; selected++) {
			o = options[selected];
			if (o && matcher.test(o)) {
				o = me.optionsEl.query('li[data-value="' + o.value + '"]')[0];
				if (o) {
					me.activateOption(o);
				}
				break;
			}

			if (selected + 1 >= options.length && start !== false) {
				selected = -1;//
				len = start;
				start = false;
			}
		}
	},


	deselect: function() {
		delete this.currentText;
		delete this.currentValue;
	},


	inputKeyDown: function(e) {
		var charCode = e.getCharCode(),
			open = !this.optionsEl.hasCls('hidden'),
			current = this.optionsEl.down('li.active'), next;

		if (!this.editable && charCode !== e.TAB) {
			e.stopEvent();
		}

		if (!current) {
			current = this.optionsEl.down('li');

			if (!current) { return; }

			this.activeValue = current.getAttribute('data-value');

			current.addCls('active');
			return;
		}

		if (open) {
			if (charCode === e.ESC) {
				e.stopEvent();
				this.hideOptions();
				return;
			}
		}

		//down select the next sibling if there is one
		if (charCode === e.DOWN) {
			if (open) {
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
			if (!e.shiftKey && open) {
				this.selectOption(current.dom);
			}
			this.hideOptions();
			return;
		}

		//set the next element active
		if (next) {
			this.activateOption(next, true);
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

	KEY_CODES: {
		BACKSPACE: 8
	},


	inputKeyPress: function(e) {
		var value = this.inputEl.getValue();

		if (this.editable) {
			if (!this.IGNORE_KEY_CODES[e.getCharCode()]) {
				// this.deselect();
				//filter the options and show the options menu unless we are from an enter
				this.filterOptions(value, true);
			}
		} else {
			if (this.KEY_CODES.BACKSPACE == e.getCharCode()) {
				this.clear();
			}
			this.selectNextMatch(e);
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

	clear: function() {
		this.__setValue('', null);
	},

	setValue: function(value, silent) {
		var li;

		this.currentValue = value;

		if (!Ext.isEmpty(this.options)) {
			li = this.el.down('li[data-value="' + value + '"]');

			if (li) {
				this.selectOption(li.dom, silent);
			}
		}
	},


	getValue: function() {
		return this.currentValue || this.currentText;
	},


	getOptions: function() {
		return (this.options || []).map(function(option) {
			return option.value;
		});
	}
});
