Ext.define('NextThought.model.assessment.FilePart', {
	extend: 'NextThought.model.assessment.Part',
	fields: [
		{ name: 'AllowedExtentions', mapping: 'allowed_extensions', type: 'auto'},
		{ name: 'AllowedMimeTypes', mapping: 'allowed_mime_types', type: 'auto'},
		{ name: 'MaxFileSize', mapping: 'max_file_size', type: 'int'}
	],


	isFileAcceptable: function(file) {
		var name = this.__checkExt(file.name),
			type = this.__checkMime(file.type),
			size = this.__checkSize(file.size),
			r = this.reasons = [];

		if (!name) {
			r.push('Name does not have an acceptible extention: ' + this.get('AllowedExtentions').join(', '));
		}

		if (!type) {
			r.push('The file is of a type we do not allow.');
		}

		if (!size) {
			r.push('The file is too large.');
		}

		return name && type && size;
	},


	__getRegExp: function(pattern, regExpFormat) {
		var o = RegExp.escape(pattern)
				.replace(/\\\*/g, '[^/]+');
		return new RegExp(Ext.String.format(regExpFormat || '^{0}$', o));
	},


	__checkMime: function(mime) {
		var me = this,
			allowedMimes = this.get('AllowedMimeTypes') || ['*/*'];
		return allowedMimes.some(function(o) {
			return me.__getRegExp(o).test(mime);
		});
	},


	__checkExt: function(name) {
		var me = this,
			allowedNames = this.get('AllowedExtentions') || ['*.*'];
		return allowedNames.some(function(o) {
			return me.__getRegExp(o, '{0}$').test(name);
		});
	},


	__checkSize: function(size) {
		var max = this.get('MaxFileSize') || Infinity;
		return size < max;
	}
});
