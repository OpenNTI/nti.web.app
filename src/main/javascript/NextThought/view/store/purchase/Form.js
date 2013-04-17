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

	//To use some of stipes test cards we cant send address or cvc but those are required on our form.
	//Use this flag only for testing locally to make those fields not required.  I miss preprocessor statements...
	//ignoreClientSideValidation: true,

	renderTpl: Ext.DomHelper.markup([
		{tag: 'fieldset', cn:[
			{tag: 'legend', html: 'Payment Information'},
			{cn: [{tag: 'input', type: 'text', 'data-required': true, placeholder: 'Name on card', name: 'name'}]},
			{cn: [
				{tag: 'input', type: 'text', placeholder: '1234 - 1234 - 1234 - 1234', name: 'number',
					'data-required': true, 'data-width':'1/2',
					'data-validator': 'validateCardNumber', 'data-formatter': 'formatCardNumber', 'data-getter': 'getCardNumberVal' },
				{tag: 'input', type: 'text', placeholder: 'MM / YY', name: 'exp_',
					'data-required': true, 'data-width':'1/4',
					'data-validator': 'validateCardExpiry', 'data-getter': 'cardExpiryVal', 'data-formatter': 'formatCardExpiry'},
				{tag: 'input', type: 'text', placeholder: 'Code', name: 'cvc',
					'data-required': true, 'data-width':'1/4',
					'data-validator': 'validateCardCVC', 'data-formatter': 'formatCardCVC'}
			]}
		]},
		{tag: 'fieldset', cn:[
			{tag: 'legend', html: 'Billing Address'},
			{cn: [{tag: 'input', type: 'text', 'data-required': true, placeholder: 'Address', name: 'address_line1'}]},
			{cn: [{tag: 'input', type: 'text', placeholder: 'Address', name: 'address_line2'}]},
			{cn: [{tag: 'input', type: 'text', placeholder: 'City / Town', name: 'address_city', 'data-width':'2/3'}]},
			{cn: [{tag: 'input', type: 'text', placeholder: 'State / Province / Territory / Region', name: 'address_state'}]},
			{cn: [
				{tag: 'input', type: 'text', 'data-required': true, 'data-width':'2/3',
					placeholder: 'Country', name: 'address_country'},
				{tag: 'input', type: 'text', placeholder: 'ZIP / Postal Code', name: 'address_zip', 'data-width':'1/3'}
			]}
		]}
	]),


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
			jqd.focus(function(){
				jqd.attr('data-visited','true');
			});
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
		var required = input.getAttribute('data-required'),
			visited = input.getAttribute('data-visited');

		if(this.ignoreClientSideValidation){
			console.warn('Ignoring client side validation this should only be used in specific test cases');
			return true;
		}

		if(required && !val){
			if( visited ){
				Ext.fly(input).addCls('invalid');
			}
			return false;
		}
		return true;
	},

	validateWithValidator: function(input, val){
		var validator = input.getAttribute('data-validator'),
			visited = input.getAttribute('data-visited');

		if(this.ignoreClientSideValidation){
			console.warn('Ignoring client side validation this should only be used in specific test cases');
			return true;
		}

		if(validator && !jQuery.payment[validator](val)){
			if( visited ){
				Ext.fly(input).addCls('invalid');
			}
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
	},

	handleError: function(error){
		console.log('Form needs to handle error', arguments);
	}
});
