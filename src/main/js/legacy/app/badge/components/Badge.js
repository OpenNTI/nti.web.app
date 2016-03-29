var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.badge.components.Badge', {
	extend: 'Ext.Component',
	alias: 'widget.badge-info',

	cls: 'badge-preview',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'img', cls: 'img', src: '{img}'},
		{cls: 'wrap', cn: [
			{cls: 'name', html: '{name}'},
			{cls: 'description', html: '{description}'},
			{tag: 'tpl', 'if': 'issuer', cn: [
				{cls: 'issuer', cn: [
					{cls: 'label', html: 'Issuer'},
					{tag: 'a', cls: 'link', href: '{issuer.href}', target: '_blank', html: '{issuer.name}'}
				]}
			]},
			{tag: 'tpl', 'if': 'criteria', cn: [
				{cls: 'criteria', cn: [
					{cls: 'label', html: 'Criteria'},
					{tag: 'a', cls: 'link', href: '{criteria.href}', target: '_blank', html: '{criteria.name}'}
				]}
			]}
		]}
	]),

	renderSelectors: {
		imgEl: '.img',
		nameEl: '.name',
		descriptionEl: '.description',
		criteriaLink: '.criteria .link',
		issuerLink: '.issuer .link'
	},


	beforeRender: function () {
		this.callParent(arguments);

		var issuer = this.badge.get('issuer'),
			criteria = this.badge.get('criteria');

		this.renderData = Ext.apply(this.renderData || {}, {
			img: this.badge.get('image'),
			name: this.badge.get('name'),
			description: this.badge.get('description'),
			issuer: issuer && {name: issuer.name, href: issuer.url},
			criteria: criteria && {name: 'Badge Completion Criteria', href: criteria}
		});
	}
});
