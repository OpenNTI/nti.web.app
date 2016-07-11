var Ext = require('extjs');
require('./Part');
const {default: FileSet} = require('nti-commons/lib/FileSetDescriptor');

module.exports = exports = Ext.define('NextThought.model.assessment.FilePart', {
	extend: 'NextThought.model.assessment.Part',
	fields: [
		{ name: 'AllowedExtentions', mapping: 'allowed_extensions', type: 'auto'},
		{ name: 'AllowedMimeTypes', mapping: 'allowed_mime_types', type: 'auto'},
		{ name: 'MaxFileSize', mapping: 'max_file_size', type: 'int'}
	],


	isFileAcceptable: function (file) {
		var size = this.__checkSize(file.size),
			fileSet = new FileSet(
				this.get('AllowedExtentions') || ['*'],
				this.get('AllowedMimeTypes') || ['*/*']
			),
			type = fileSet.matches(file),
			r = this.reasons = [];

		if (!type) {
			r.push('The file type is not allowed.');
		}

		if (!size) {
			r.push('The file is too large.');
		}

		return size && type;
	},


	__checkSize: function (size) {
		var max = this.get('MaxFileSize') || Infinity;
		return size < max && size > 0;
	}
});
