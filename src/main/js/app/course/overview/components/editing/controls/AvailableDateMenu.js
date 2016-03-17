Ext.define('NextThought.app.course.overview.components.editing.controls.AvailableDateMenu', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-available-date-menu',

	requires: [
		'NextThought.common.form.fields.DatePicker'
	],

	cls: 'editing-available-date-menu',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'arrow'},
		{cls: 'container', cn: [
			{cls: 'toggle', cn: [
				{cls: 'part selected beginning', 'data-action': 'AvailableBeginning', html: 'Begin Date'},
				{cls: 'part ending', 'data-action': 'AvailableEnding', html: 'Finish Date'}
			]},
			{cls: 'error'},
			{cls: 'date-picker-container'},
			{cls: 'save disabled', html: 'Save Changes'}
		]}
	]),


	renderSelectors: {
		pickerEl: '.date-picker-container',
		saveEl: '.save',
		toggleEl: '.toggle',
		beginEl: '.beginning',
		endEl: '.ending',
		containerEl: '.container',
		errorEl: '.error'
	},

	initComponent: function() {
		this.callParent(arguments);
		this.EditingActions = new NextThought.app.course.overview.components.editing.Actions();

		this.realign = this.realign.bind(this);
		this.onWindowResizeBuffer = Ext.Function.createBuffered(this.realign, 10, this);
   		this.on('destroy', this.close.bind(this));
	},

	afterRender: function(){
		this.callParent(arguments);
		this.picker = this.createDatePicker(this.pickerEl);
		this.mon(this.toggleEl, 'click', this.handleSelectionClick.bind(this));
		this.mon(this.saveEl, 'click', this.doSave.bind(this));
		this.errorEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.errorEl.hide();

		this.setInitialState();
	},

	open: function(){
		Ext.EventManager.onWindowResize(this.onWindowResizeBuffer, this);
		window.addEventListener('scroll', this.realign);
		this.realign(true);
	},


	close: function() {
		Ext.EventManager.removeResizeListener(this.onWindowResizeBuffer, this);
		window.removeEventListener('scroll', this.realign);
	},


	alignTo: function(domNode) {
		this.alignedTo = domNode;
		this.realign();
	},


	realign: function(unlockSide) {
		if (!this.alignedTo || !this.rendered) { return; }

		var menu = this.el,
			container = this.containerEl,
			menuHeight = this.el.dom.clientHeight,
			maxMenuHeight = this.MAX_HEIGHT,
			body = Ext.getBody(),
			bodyRect = body && body.el && body.el.dom && body.el.dom.getBoundingClientRect(),
			bodyHeight = body.getHeight(),
			button = this.alignedTo,
			buttonRect = button && button.getBoundingClientRect(),
			buttonRelativeTop = buttonRect.top - bodyRect.top,
			buttonRelativeBottom = buttonRelativeTop + buttonRect.height,
			viewHeight = Ext.Element.getViewportHeight(),
			viewWidth = Ext.Element.getViewportWidth(),
			positions = {
				below: {
					cls: 'below',
					top: buttonRect.bottom + 12,
					maxHeight: bodyHeight - buttonRelativeBottom - 12,
					left: viewWidth - buttonRect.right - 10
				},
				above: {
					cls: 'above',
					top: buttonRect.top - menuHeight - 12,
					maxHeight: buttonRelativeTop - 12,
					left: viewWidth - buttonRect.right - 10
				}
			};

		function applyPositioning(position) {
			if (menu) {
				menu.removeCls(['below', 'above']);
				menu.addCls(position.cls);
				menu.setStyle({
					top: position.top + 'px',
					right: position.right + 'px',
					maxHeight: position.maxHeight + 'px'
				});
			}

			if (container) {
				container.setStyle('maxHeight', position.maxHeight + 'px');
			}
		}

		if (menuHeight === 0) { return; }

		if (this.lockedToSide && unlockSide !== true) {
			applyPositioning(positions[this.lockedToSide]);
		} else if (positions.below.maxHeight >= maxMenuHeight || positions.below.maxHeight >= positions.above.maxHeight) {
			this.lockedToSide = 'below';
			applyPositioning(positions.below);
		} else {
			this.lockedToSide = 'above';
			applyPositioning(positions.above);
		}
	},


	setInitialState: function(){
		var startDate = this.record && this.record.get('AvailableBeginning'),
			endDate = this.record && this.record.get('AvailableEnding');

		// the available beginning and ending are in seconds.
		this.defaultValues = {
			AvailableBeginning: startDate ? startDate.getTime && (startDate.getTime()/1000) : this.getDefaultTimeForField('AvailableBeginning'),
			AvailableEnding: endDate ? endDate.getTime && (endDate.getTime()/1000) : this.getDefaultTimeForField('AvailableEnding')
		};

		this.values = {};

		this.saveEl.addCls('disabled');
		this.updateDates();
	},


	updateDates: function(){
		var selectedEl = this.toggleEl.down('.selected'),
			field = selectedEl && selectedEl.dom && selectedEl.dom.getAttribute('data-action'),
			value = this.values && this.values[field], date;

		if (this.picker && field) {
			if (this.values[field]) {
				value = this.values[field];
				date = new Date(value * 1000);
				this.picker.setValue(date, true);
			}
			else if (this.defaultValues[field]){
				value = this.defaultValues[field];
				date = new Date(value * 1000);
				this.picker.setValue(date);
			}
		}
	},


	getDefaultTimeForField: function(field){
		var defaultValue = new Date();
		if (field === 'AvailableBeginning') {
			defaultValue.setDate(defaultValue.getDate() + 1);
			defaultValue.setHours(0);
			defaultValue.setMinutes(0);
			defaultValue.setSeconds(0);
		}
		else {
			defaultValue.setDate(defaultValue.getDate() + 1);
			defaultValue.setHours(23);
			defaultValue.setMinutes(59);
			defaultValue.setSeconds(0);
		}

		return defaultValue.getTime() / 1000; 
	},


	createDatePicker: function(dateContainer){
		var defaultValue = new Date(),
			datepicker = Ext.widget({
				xtype: 'date-picker-field',
		        defaultValue: defaultValue,
		        renderTo: dateContainer,
		        TimePicker: true
			});

		datepicker.dateChanged = this.dateChanged.bind(this, datepicker);
		this.on('destroy', datepicker.destroy.bind(datepicker));
		return datepicker;
	},


	dateChanged: function(datepicker){
		var seconds  = datepicker && datepicker.getValue(),
			selected = this.toggleEl.down('.selected'),
			key = selected && selected.dom && selected.dom.getAttribute('data-action');

		if (key) {
			this.values[key] = seconds; 
		}
		if (this.saveEl.hasCls('disabled')) {
			this.saveEl.removeCls('disabled');
		}

		this.clearError();
	},


	handleSelectionClick: function(e) {
		var el = Ext.get(e.target),
			me = this;

		e.stopEvent();

		this.select(el);
		this.updateDates();
		this.picker.clearAllErrors();
	},


	select: function(el){
		var t = el && el.hasCls('part') ? el : el && el.up('.part'),
			selectedEl = this.el.down('.selected');

		if (t && selectedEl && t !== selectedEl) { 
			selectedEl.removeCls('selected');
			t.addCls('selected');
		}
	},


	getValue: function(){
		return {
			AvailableBeginning: this.values && this.values.AvailableBeginning,
			AvailableEnding: this.values && this.values.AvailableEnding
		};
	},


	showError: function(error){
		var errorMessage = (error || {}).msg;
		this.errorEl.update(errorMessage);
		this.saveEl.addCls('disabled');
		this.errorEl.show();
	},


	clearError: function(){
		this.errorEl.update("");
		this.errorEl.hide();
	},


	isValid: function(){
		var values = this.getValue() || {},
			start = values.AvailableBeginning,
			end = values.AvailableEnding,
			error;

		if (this.picker && this.picker.isValid && this.picker.isValid() === false) {
			return false;
		} 

		if (!start && end) {
			error = {
				msg: 'The begin date is required when the finish date is set.',
				field: 'AvailableBeginning'
			};

			this.showError(error);
			return false;
		}

		if (start && end && start > end) {
			error = {
				msg: 'The begin date cannot be set after the finish date.',
				field: 'AvailableBeginning'
			};

			this.showError(error);
			return false;
		}

		return true;
	},


	doSave: function(e){
		var target = Ext.get(e.target);

		if (target && target.hasCls('disabled')) { return; }
		if (!this.isValid()) { return; }

		if (this.onSave) {
			this.onSave();
		}
	},

	toggleTab: function(){
		if(this.beginEl.hasCls('selected')){
			this.select(this.endEl);
		}else {
			this.select(this.beginEl);
		}
	},

	setMaxDate: function(date){
		this.picker.setMaxDate(date);
	},

	setMinDate: function(date){
		this.picker.setMinDate(date);
	}

});
