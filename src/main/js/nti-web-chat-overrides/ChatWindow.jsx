import PropTypes from 'prop-types';
import React from 'react';
import { Layouts } from '@nti/web-commons';

import ChatActions from '../legacy/app/chat/Actions';

const styles = stylesheet`
	.expanded-mode {
		right: 240px !important;
	}
`;

WebappChatWindow.propTypes = {
	visible: PropTypes.bool.isRequired,
	entity: PropTypes.string.isRequired,
	expanded: PropTypes.bool,

	onClose: PropTypes.func,
};

export default function WebappChatWindow({ onClose, entity, expanded }) {
	const windowRef = React.useRef(null);

	const onUnmount = () => {
		windowRef.current?.close();
	};

	const onMount = async () => {
		const actions = ChatActions.create();

		const roomInfo = await actions.createChatRoom(entity);

		const win = actions.openChatWindow(roomInfo);

		expanded
			? win.addCls(styles.expandedMode)
			: win.removeCls(styles.expandedMode);

		win.on({
			single: true,
			close: onClose,
		});

		windowRef.current = win;
	};

	return <Layouts.Uncontrolled onMount={onMount} onUnmount={onUnmount} />;
}
