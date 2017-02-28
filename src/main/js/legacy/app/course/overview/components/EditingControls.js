const Ext = require('extjs');
const {wait} = require('legacy/util/Promise');

const ControlBar = require('nti-web-course-overview-controls').default;
const ReactHarness = require('legacy/overrides/ReactHarness');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.EditingControls', {
	extend: 'Ext.Component',
	alias: 'widget.course-overview-editing-controls',

	cls: 'editing-controls',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'controls'}
	]),


	renderSelectors: {
		controlsEl: '.controls'
	},


	afterRender: function () {
		this.callParent(arguments);

		this.controlBar = new ReactHarness({
			component: ControlBar,
			renderTo: this.controlsEl,
			gotoResources: () => this.gotoResources(),
			switchToEdit: () => this.switchToEdit(),
			switchToPreview: () => this.switchToPreview(),
			showAuditLog: () => this.showAuditLog(),
			canDoAdvancedEditing: Service.canDoAdvancedEditing(),
			mode: this.mode,
			hide: this.doHide,
			disabled: false
		});
	},


	isHidden () {
		return this.doHide;
	},


	hide () {
		this.doHide = true;

		if (this.controlBar) {
			wait()
				.then(() => {
					if (this.doHide) {
						this.controlBar.setProps({
							hide: true
						});
					}
				});

		}
	},


	show () {
		this.doHide = false;

		if (this.controlBar) {
			this.controlBar.setProps({
				hide: false
			});
		}
	},


	showNotEditing: function () {
		this.mode = ControlBar.PREVIEW;

		if (this.controlBar) {
			this.controlBar.setProps({
				mode: ControlBar.PREVIEW,
				disabled: false
			});
		}
	},


	showEditing: function () {
		this.mode = ControlBar.EDITING;

		if (this.controlBar) {
			this.controlBar.setProps({
				mode: ControlBar.EDITING,
				disabled: false
			});
		}
	},


	switchToEdit: function () {
		if (this.controlBar) {
			this.controlBar.setProps({
				disabled: true
			});
		}

		if (this.openEditing) {
			this.openEditing();
		}
	},


	switchToPreview: function () {
		if (this.controlBar) {
			this.controlBar.setProps({
				disabled: true
			});
		}

		if (this.closeEditing) {
			this.closeEditing();
		}
	},


	gotoResources () {
		if (this.gotoResources) {
			this.gotoResources();
		}
	},


	showAuditLog: function () {
		if (this.openAuditLog) {
			this.openAuditLog();
		}
	}
});
