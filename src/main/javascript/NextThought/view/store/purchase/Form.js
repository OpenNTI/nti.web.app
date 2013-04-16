/**
 * Created with JetBrains WebStorm.
 * User: cutz
 * Date: 4/16/13
 * Time: 4:11 PM
 * To change this template use File | Settings | File Templates.
 */
Ext.define('NextThought.view.store.purchase.Form', {
	extend: 'Ext.Component',
	alias: 'widget.purchase-form',

	ui: 'purchase-form',

	ordinal: 1,
	confirmLabel: 'Continue',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'fieldset', cn:[
			{tag: 'legend', html: 'Payment Information'},
			{cn: [{tag: 'input', type: 'text', 'data-required': true, placeholder: 'Name on card', name: 'name'}]},
			{cn: [
				{tag: 'input', type: 'text', 'data-required': true, 'data-validator': 'validateCardNumber', 'data-formatter': 'formatCardNumber', placeholder: '1234 - 1234 - 1234 - 1234', name: 'number'},
				{tag: 'input', type: 'text', 'data-required': true, 'data-validator': 'validateCardExpiry', 'data-getter': 'cardExpiryVal', 'data-formatter': 'formatCardExpiry', placeholder: 'MM / YY', name: 'exp_'},
				{tag: 'input', type: 'text', 'data-required': true, 'data-validator': 'validateCardCVC', 'data-formatter': 'formatCardCVC', placeholder: 'Code', name: 'cvc'}
			]}
		]},
		{tag: 'fieldset', cn:[
			{tag: 'legend', html: 'Billing Address'},
			{cn: [{tag: 'input', type: 'text', 'data-required': true, placeholder: 'Address', name: 'address_line1'}]},
			{cn: [{tag: 'input', type: 'text', placeholder: 'Address', name: 'address_line2'}]},
			{cn: [{tag: 'input', type: 'text', placeholder: 'City / Town', name: 'address_city'}]},
			{cn: [{tag: 'input', type: 'text', placeholder: 'State / Province / Territory / Region', name: 'address_state'}]},
			{cn: [
				{tag: 'input', type: 'text', 'data-required': true, placeholder: 'Country', name: 'address_country'},
				{tag: 'input', type: 'text', placeholder: 'ZIP / Postal Code', name: 'address_zip'}
			]},
		]}
	]),


	validators: {

	},


	renderSelectors: {
		nameEl: 'input[name=name]',
		numberEl: 'input[name=number]',
		cvcEl: 'input[name=cvc]',

	},


	afterRender: function(){
		this.callParent(arguments);

		var inputs = this.getEl().select('input'),
			validator = Ext.bind(this.generateTokenData, this),
			bufferedValidator = Ext.Function.createBuffered(validator, 250);

		inputs.each(function(input){
			var formatter = input.getAttribute('data-formatter'),
				jqd = jQuery(input.dom);
			if(formatter){
				jqd.payment(formatter);
			}
			jqd.blur(validator).keypress(bufferedValidator);
		});

		this.enableSubmission(false);
		this.fillFromToken();
	},


	enableSubmission: function(enabled){
		var win = this.up('window');
		if(win){
			win.setConfirmState(enabled);
		}
	},


	generateTokenData: function(){
		var inputs = this.getEl().select('input'),
			data = {}, failed;
		inputs.each(function(input){
			var val, getter, required, validator;
			input = Ext.getDom(input);

			val = input.value;
			getter = input.getAttribute('data-getter');
			if(getter){
				val = jQuery(input).payment(getter);
			}

			required = input.getAttribute('data-required');
			if(required && !val){
				Ext.fly(input).addCls('invalid');
				failed = true;
				return true;
			}

			validator = input.getAttribute('data-validator');
			if(validator && !jQuery.payment[validator](val)){
				Ext.fly(input).addCls('invalid');
				failed = true;
				return true;
			}

			Ext.fly(input).removeCls('invalid');
			if(Ext.isObject(val)){
				Ext.Object.each(val, function(k, v){
					data[input.getAttribute('name')+k] = v;
				});
			}
			else{
				data[input.getAttribute('name')] = val;
			}
		});

		this.enableSubmission(!failed);

		return failed ? undefined : data;
	},


	fillFromToken: function(){

	},


	onConfirm: function(){
		var data = this.generateTokenData();
		if(data){
			this.fireEvent('create-payment-token', this, this.record, data);
		}
	}
});