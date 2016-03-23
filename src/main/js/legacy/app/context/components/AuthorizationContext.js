var Ext = require('extjs');
var ContextStateStore = require('../StateStore');
var WindowsActions = require('../../windows/Actions');
var {getURL} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.context.components.AuthorizationContext', {
	extend: 'Ext.Component',
	alias: 'widget.context-authorization',
	cls: 'context-authorization',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'context-image image-context', cn: [
			{cls: 'thumbnail'},
			{cls: 'meta', cn: [
				{cls: 'title', html: '{title}'},
				{cls: 'message', html: '{msg}'},
				{cls: 'action button', html: 'Enroll Now'}
			]}
		]}
	]),

	renderSelectors: {
		iconEl: '.thumbnail',
		enrollButtonEl: '.action'
	},

	initComponent: function() {
		this.callParent(arguments);
		this.ContextStore = NextThought.app.context.StateStore.getInstance();
		this.WindowActions = NextThought.app.windows.Actions.create();

		this.renderData = Ext.applyIf(this.renderData || {}, {
			title: this.catalogEntry && this.catalogEntry.get('title'),
			msg: 'You don\'t have access to this course.'
		});
	},

	afterRender: function() {
		this.callParent(arguments);
		this.__setContent();
		this.mon(this.enrollButtonEl, 'click', this.onEnrollClick.bind(this));
	},

	__setContent: function() {
		var href = this.catalogEntry && this.catalogEntry.get('thumb'),
			url = getURL(href);

		if(this.iconEl && url) {
			this.iconEl.setStyle({'backgroundImage': 'url(' + url + ')'});
		}
	},

	onEnrollClick: function(e) {
		this.WindowActions.pushWindow(this.catalogEntry, null, e);
	}
});
