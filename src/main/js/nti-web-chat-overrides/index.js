import { ChatWindowView, CalendarWindowView } from '@nti/web-profiles';

import CalendarWindow from './CalendarWindow';
import ChatWindow from './ChatWindow';

export function setupOverrides() {
	ChatWindowView.setChatWindow(ChatWindow);
	CalendarWindowView.setCalendarWindow(CalendarWindow);
}
