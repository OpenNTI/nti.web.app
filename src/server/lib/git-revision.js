/*eslint strict:0*/
'use strict';

try {
	let git = require('git-rev-sync');
	module.exports = 'branch: ' + git.branch() + ' [' + git.short() + ']';
} catch (e) {
	module.exports = 'unknown, not in git';
}
