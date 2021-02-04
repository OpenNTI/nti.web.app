import {ChatWindowView} from '@nti/web-profiles';

import ChatWindow from './ChatWindow';

export function setupOverrides () {
	ChatWindowView.setChatWindow(ChatWindow);
}
