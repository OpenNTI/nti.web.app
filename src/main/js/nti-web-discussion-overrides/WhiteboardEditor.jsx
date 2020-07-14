import React from 'react';
import PropTypes from 'prop-types';
import {Layouts} from '@nti/web-commons';

import WhiteboardWindow from 'legacy/app/whiteboard/Window';

WebappWhiteboardEditor.propTypes = {
	data: PropTypes.any,
	setData: PropTypes.func,

	onClose: PropTypes.func,
};
export default function WebappWhiteboardEditor ({data, setData, onClose}) {
	const windowRef = React.useRef(null);

	const onUnmount = () => {
		windowRef.current?.destroy?.();
		windowRef.current = null;
	};

	const onMount = () => {
		if (windowRef.current) { return; }

		const wbWin = WhiteboardWindow.create({
			width: 802,
			value: data,
			closeAction: 'hide',
			cancelOnce: false
		});

		wbWin.on({
			save: (win, wb) => setData?.(wb.getValue()),
			cancel: () => onClose?.()
		});

		wbWin.show();
		windowRef.current = wbWin;
	};

	return (
		<Layouts.Uncontrolled onMount={onMount} onUnmount={onUnmount} />		
	);
}