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
				{tag: 'input', type: 'text', 'data-required': true, 'data-validator': 'validateCardNumber', 'data-formatter': 'formatCardNumber', 'data-getter': 'getCardNumberVal', placeholder: '1234 - 1234 - 1234 - 1234', name: 'number'},
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


	fillFromToken: function(){

	},


	enableSubmission: function(enabled){
		var win = this.up('window');
		if(win){
			win.setConfirmState(enabled);
		}
	},


	getCardNumberVal: function(input){
		var val = input.value;

		return val.replace(/[^0-9]/g, '');
	},


	valueForInput: function(input){
		var val = input.value,
			getter = input.getAttribute('data-getter');

		if(getter){
			if(this[getter]){
				val = this[getter](input);
			}
			else{
				val = jQuery(input).payment(getter);
			}
		}

		return val;
	},

	validateForRequired: function(input, val){
		var required = input.getAttribute('data-required');
		if(required && !val){
			Ext.fly(input).addCls('invalid');
			return false;
		}
		return true;
	},

	validateWithValidator: function(input, val){
		var validator = input.getAttribute('data-validator');
		if(validator && !jQuery.payment[validator](val)){
			Ext.fly(input).addCls('invalid');
			return false;
		}
		return true;
	},


	validateInput: function(input){
		var val;
		input = Ext.getDom(input);

		val = this.valueForInput(input);

		if(!this.validateForRequired(input, val)){
			return null;
		}

		if(!this.validateWithValidator(input, val)){
			return null;
		}

		Ext.fly(input).removeCls('invalid');
		return val;
	},

	collectVal: function(data, input, val){
		if(Ext.isObject(val)){
			Ext.Object.each(val, function(k, v){
				data[input.getAttribute('name')+k] = v;
			});
		}
		else if(!Ext.isEmpty(val)){
			data[input.getAttribute('name')] = val;
		}
	},


	generateTokenData: function(){
		var inputs = this.getEl().select('input'),
			data = {}, failed = false;
		inputs.each(function(input){
			//First we validate
			var val = this.validateInput(input);
			if(val === null){
				failed = true;
				return true; //continue
			}

			//If that passed we collect
			this.collectVal(data, input, val);

		}, this);

		this.enableSubmission(!failed);

		return failed ? undefined : data;
	},


	onConfirm: function(){
		var data = this.generateTokenData();
		if(data){
			this.fireEvent('create-payment-token', this, this.record, data);
		}
	}
});