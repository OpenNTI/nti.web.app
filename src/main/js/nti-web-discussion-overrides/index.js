import { Attachments } from '@nti/web-modeled-content';
import { Viewer } from '@nti/web-discussions';

import WhiteboardEditor from './WhiteboardEditor';
import Context from './Context';

export function setupOverrides() {
	Attachments.WhiteboardButton.setWhiteboardEditor(WhiteboardEditor);
	Viewer.setContextOverride(Context);
}
