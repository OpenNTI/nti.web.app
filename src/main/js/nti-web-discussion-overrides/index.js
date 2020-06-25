import {Attachments} from '@nti/web-modeled-content';

import WhiteboardEditor from './WhiteboardEditor';

export function setupOverrides () {
	Attachments.WhiteboardButton.setWhiteboardEditor(WhiteboardEditor);
}