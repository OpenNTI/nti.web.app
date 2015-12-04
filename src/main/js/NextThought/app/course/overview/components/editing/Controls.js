Ext.define('NextThought.app.course.overview.components.editing.Controls', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls',

	cls: 'overview-editing-controls',

	controlTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'control {cls}',
		'data-qtip': '{title}',
		'data-action': '{handler}',
		html: '{title}'
	})),

	renderTpl: Ext.DomHelper.markup({
		cls: 'controls'
	}),


	renderSelectors: {
		controlsEl: '.controls'
	},


	afterRender: function() {
		this.callParent(arguments);

		var controls = this.controls || {};

		this.mon(this.controlsEl, 'click', this.onControlClick.bind(this));

		if (controls.history) {
			this.addHistoryControl(controls.history);
		}

		if (controls.remove) {
			this.addHistoryControl(controls.remove);
		}

		if (controls.publish) {
			this.addPublishControl(controls.publish.visible, controls.publish.fn);
		}

		if (controls.add) {
			this.addAddControl(controls.add);
		}

		if (controls.edit) {
			this.addEditControl(controls.edit);
		}
	},


	onControlClick: function(e) {
		var control = e.getTarget('.control'),
			handler = control && control.getAttribute('data-action');

		if (handler && this[handler]) {
			this[handler](e);
		}
	},


	addControl: function(config) {
		this.controlTpl.append(this.controlsEl, config);
	},


	addEditControl: function(fn) {
		this.editHandler = fn;

		this.addControl({
			cls: 'edit',
			title: 'Edit',
			handler: 'editHandler'
		});
	},


	addAddControl: function(fn) {
		this.addHandler = fn;

		this.addControl({
			cls: 'add',
			title: 'Add',
			handler: 'addHandler'
		});
	},


	addPublishControl: function(published, fn) {
		this.publishHandler = fn;

		this.addControl({
			cls: 'publish ' + (published ? 'published' : 'unpublished'),
			title: 'Publish',
			handler: 'publishHandler'
		});
	},


	addHistoryControl: function(fn) {

	},


	addRemoveControl: function(fn) {

	}

});
