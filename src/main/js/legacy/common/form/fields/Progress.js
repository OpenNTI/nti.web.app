const Ext = require('extjs');
const {wait} = require('@nti/lib-commons');

const FilePicker = require('./FilePicker');


module.exports = exports = Ext.define('NextThought.common.form.fields.Progress', {
	extend: 'Ext.Component',
	alias: 'widget.form-progress',
	cls: 'save-progress',
	UPDATE_RATE: 300,

	renderTpl: Ext.DomHelper.markup([
		{cls: 'progress-bar', cn: [
			{cls: 'bar'}
		]},
		{cls: 'out-of', cn: [
			{tag: 'span', cls: 'current'},
			{tag: 'span', html: 'of'},
			{tag: 'span', cls: 'total'}
		]}
	]),

	renderSelectors: {
		barEl: '.progress-bar .bar',
		currentEl: '.out-of .current',
		totalEl: '.out-of .total'
	},

	initComponent: function () {
		this.callParent(arguments);
	},

	onceDone: function () {
		return Promise.resolve();
	},

	showError: function () {
		//TODO: fill this out
	},

	setProgress: function (loaded, total) {
		this.progress = {
			percent: Math.round((loaded / total) * 100),
			loaded: loaded,
			total: total
		};

		if (!this.running) {
			this.start();
		}


		console.log(this.progress);
	},

	start: function () {
		if (!this.rendered) {
			this.on('afterrender', this.update.bind(this));
			return;
		}

		this.running = true;

		this.update();
	},

	stop: function () {
		delete this.running;

		this.update();
		return wait(this.UPDATE_RATE);
	},

	update: function () {
		var progress = this.progress || {},
			total = progress.total || 0,
			loaded = progress.loaded || 0,
			percent = progress.percent || 0,
			unit = FilePicker.getUnit(total);

		total = FilePicker.getHumanReadableFileSize(total, 2, unit);
		loaded = FilePicker.getHumanReadableFileSize(loaded, 2, unit);

		loaded = loaded.replace(unit, '').trim();

		this.barEl.dom.style.width = percent + '%';
		this.currentEl.update(loaded);
		this.totalEl.update(total);

		if (this.running) {
			setTimeout(this.update.bind(this), this.UPDATE_RATE);
		}
	}
});
