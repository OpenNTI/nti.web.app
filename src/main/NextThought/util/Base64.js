Ext.define('NextThought.util.Base64',
{
	alternateClassName: 'Base64',
	statics: {
		prefix: "Basic ",
		basicAuthString: function(username, password) {
			return this.prefix + Ext.create('NextThought.util.Base64').encode( encodeURIComponent(username) + ":" + password );
		},
		getAuthInfo: function(s) {
			if (!s || s.indexOf(this.prefix) !== 0) {
				//not an auth string
				return null;
			}

			var c = s.substring(this.prefix.length),
				d = Ext.create('NextThought.util.Base64').decode(c),
				a = d.split(':');

			return {'username': decodeURIComponent(a[0]), 'password': a[1]};
		}
	},
	
	keyStr : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

	encode: function(stringToEncode) {
		var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0, input;

		input = this.utf8_encode(stringToEncode);

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

			output = output +
			this.keyStr.charAt(enc1) + this.keyStr.charAt(enc2) +
			this.keyStr.charAt(enc3) + this.keyStr.charAt(enc4);

		}

		return output;
	},

	decode : function (input) {
		var output = "",
			chr1, chr2, chr3,
			enc1, enc2, enc3, enc4,
			i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/=]/g, "");

		while (i < input.length) {

			enc1 = this.keyStr.indexOf(input.charAt(i++));
			enc2 = this.keyStr.indexOf(input.charAt(i++));
			enc3 = this.keyStr.indexOf(input.charAt(i++));
			enc4 = this.keyStr.indexOf(input.charAt(i++));

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

		output = this.utf8_decode(output);

		return output;

	},

	
	// private method for UTF-8 encoding
	utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "", n, c;

		for (n = 0; n < string.length; n++) {

			c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	utf8_decode : function (utftext) {
		var string = "", i = 0, c = 0, c2 = 0, c3=0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}


},
		function(){
			window.Base64 = this;
		}
);
