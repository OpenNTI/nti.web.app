var Ext = require('extjs');
require('./Part');
const {default: FileSet} = require('nti-commons/lib/FileSetDescriptor');

const FilePicker = require('legacy/common/form/fields/FilePicker');

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
			const allowedList = this.getExtensionDisplayList();
			const accepts = allowedList !== '' ? 'You can only upload ' + allowedList + '. ' : '';
			const message = 'The file selected is not acceptable. ' + accepts;
			r.push({message, code: 'FileTypeError'});
		}

		if (!size) {
			const currentSize = FilePicker.getHumanReadableFileSize(file.size);
			const maxSize = FilePicker.getHumanReadableFileSize(this.get('MaxFileSize'));
			const message = 'Your file exceeds the maximum file size. Max File Size: ' + maxSize + '. Uploaded File Size: ' + currentSize;
			r.push({message, code: 'MaxFileSizeUploadLimitError'});
		}

		return size && type;
	},


	__checkSize: function (size) {
		var max = this.get('MaxFileSize') || Infinity;
		return size < max && size > 0;
	},


	getExtensionDisplayList () {
		let extensions = (this.get('AllowedExtentions') || []).slice();
		if (extensions.length > 1) {
			let p2 = extensions.splice(-1);
			extensions = extensions.join(', ') + ' or ' + p2[0];
		}
		else if (extensions.length === 1) {
			extensions = extensions[0];
			if (extensions[0] === '*' || extensions[0] === '*.*') {
				extensions = '';
			}
		}
		else {
			extensions = '';
		}

		return extensions;
	}
});
