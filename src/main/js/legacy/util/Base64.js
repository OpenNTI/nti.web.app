const Ext = require('@nti/extjs');

/**
 * original source: http://www.webtoolkit.info/javascript-base64.html
 *
 * TODO: de-lint
 */
global.B64 =
	module.exports =
	exports =
		Ext.define('NextThought.util.Base64', {
			_isBase64Re:
				/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/,

			// private property
			_keyStr:
				'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

			_equalsRe: new RegExp('=+$'),
			_slashRe: /\//g,
			_plusRe: /\+/g,

			encodeURLFriendly: function (input) {
				return this.encode('!@' + input) //to allow us to quickly determine if the value as raw or encoded.
					.replace(this._plusRe, '-')
					.replace(this._slashRe, '_')
					.replace(this._equalsRe, '');
			},

			decodeURLFriendly: function (str) {
				// reverse to original encoding
				if (str.length % 4 !== 0) {
					str += '==='.slice(0, 4 - (str.length % 4));
				}
				str = str.replace(/-/g, '+').replace(/_/g, '/');
				str = this.decode(str);
				if (!/^!@/.test(str)) {
					//wasn't encoded by us... abort
					str = null;
				} else {
					str = str.substr(2);
				}
				return str;
			},

			// public method for encoding
			encode: function (input) {
				var output = '',
					chr1,
					chr2,
					chr3,
					enc1,
					enc2,
					enc3,
					enc4,
					i = 0;

				input = this.utf8Encode(input);

				while (i < input.length) {
					chr1 = input.charCodeAt(i++);
					chr2 = input.charCodeAt(i++);
					chr3 = input.charCodeAt(i++);

					enc1 = chr1 >> 2;
					enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
					enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
					enc4 = chr3 & 63;

					if (isNaN(chr2)) {
						enc3 = enc4 = 64;
					} else if (isNaN(chr3)) {
						enc4 = 64;
					}

					output =
						output +
						this._keyStr.charAt(enc1) +
						this._keyStr.charAt(enc2) +
						this._keyStr.charAt(enc3) +
						this._keyStr.charAt(enc4);
				}

				return output;
			},

			// public method for decoding
			decode: function (input) {
				var output = '',
					chr1,
					chr2,
					chr3,
					enc1,
					enc2,
					enc3,
					enc4,
					i = 0;

				input = input.replace(/[^A-Za-z0-9+/=]/g, '');

				while (i < input.length) {
					enc1 = this._keyStr.indexOf(input.charAt(i++));
					enc2 = this._keyStr.indexOf(input.charAt(i++));
					enc3 = this._keyStr.indexOf(input.charAt(i++));
					enc4 = this._keyStr.indexOf(input.charAt(i++));

					chr1 = (enc1 << 2) | (enc2 >> 4);
					chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
					chr3 = ((enc3 & 3) << 6) | enc4;

					output = output + String.fromCharCode(chr1);

					if (enc3 !== 64) {
						output = output + String.fromCharCode(chr2);
					}
					if (enc4 !== 64) {
						output = output + String.fromCharCode(chr3);
					}
				}

				output = this.utf8Decode(output);

				return output;
			},

			// private method for UTF-8 encoding
			utf8Encode: function (string) {
				string = string.replace(/\r\n/g, '\n');
				var utftext = '',
					n,
					c;

				for (n = 0; n < string.length; n++) {
					c = string.charCodeAt(n);

					if (c < 128) {
						utftext += String.fromCharCode(c);
					} else if (c > 127 && c < 2048) {
						utftext += String.fromCharCode((c >> 6) | 192);
						utftext += String.fromCharCode((c & 63) | 128);
					} else {
						utftext += String.fromCharCode((c >> 12) | 224);
						utftext += String.fromCharCode(((c >> 6) & 63) | 128);
						utftext += String.fromCharCode((c & 63) | 128);
					}
				}

				return utftext;
			},

			// private method for UTF-8 decoding
			utf8Decode: function (utftext) {
				var string = '',
					i = 0,
					c3 = 0,
					c2 = 0,
					c = 0;

				while (i < utftext.length) {
					c = utftext.charCodeAt(i);

					if (c < 128) {
						string += String.fromCharCode(c);
						i++;
					} else if (c > 191 && c < 224) {
						c2 = utftext.charCodeAt(i + 1);
						string += String.fromCharCode(
							((c & 31) << 6) | (c2 & 63)
						);
						i += 2;
					} else {
						c2 = utftext.charCodeAt(i + 1);
						c3 = utftext.charCodeAt(i + 2);
						string += String.fromCharCode(
							((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
						);
						i += 3;
					}
				}

				return string;
			},
		}).create();
