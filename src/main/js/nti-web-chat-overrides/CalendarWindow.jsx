import PropTypes from 'prop-types';
import React from 'react';
import { Layouts } from '@nti/web-commons';
import Ext from '@nti/extjs';

WebappCalendarWindow.propTypes = {
	onClose: PropTypes.func.isRequired,
	target: PropTypes.object.isRequired,
};

export default function WebappCalendarWindow({ onClose, target }) {
	const windowRef = React.useRef(null);
	const rebuildRef = React.useRef(null);

	const onUnmount = React.useCallback(() => {
		windowRef.current.destroy();
	}, [windowRef]);

	const onMount = React.useCallback(() => {
		const win = Ext.widget('gutter-list-calendar-window', {
			renderTo: Ext.get(target),
			onClose: onClose,

			onItemClick: obj => {
				// temp solution to prevent having stale webinars in the calendar
				if (obj.hasLink && obj.hasLink('WebinarRegister')) {
					// clearTimeout(this.calendarDirty);
					rebuildRef.current = true;
				}
			},
			navigateToObject: obj => this.navigateToObject(obj),
		});

		windowRef.current = win;
	}, [windowRef, rebuildRef]);

	return <Layouts.Uncontrolled onMount={onMount} onUnmount={onUnmount} />;
}
