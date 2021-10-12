import { useCallback } from 'react';

import { DialogButtons, Panels, Loading } from '@nti/web-commons';
import { useReducerState } from '@nti/web-core';

import t from './strings';
import { sendAdminInvites, sendLearnerInvites } from './Store';
import { ErrorMessage } from './ErrorMessage';
import { RoleField } from './RoleField';
import { ToField } from './ToField';
import { Body } from './common-parts';
import { MessageField } from './MessageField';

const NoOp = () => {};

const Frame = styled.div`
	background-color: white;
	width: 760px;
`;

export function InvitePeopleForm({ loading, onDone }) {
	const {
		canSend,
		emails,
		error,
		file,
		maybeSubmit,
		message,
		onCancel,
		onSave,
		role,
		setEmails,
		setFile,
		setMessage,
		setRole,
	} = useInviteFormLogic({ loading, onDone });

	return (
		<Frame>
			<Panels.TitleBar
				title={t('title')}
				iconAction={loading ? NoOp : onCancel}
			/>

			{error && <ErrorMessage error={error} />}

			<Body>
				{loading ? (
					<Loading.Mask />
				) : (
					<>
						<ToField
							to={emails}
							file={file}
							onToChange={setEmails}
							onFileChange={setFile}
						/>

						<RoleField
							onChange={e => setRole(e.target.value)}
							value={role}
						/>

						<MessageField
							value={message}
							onChange={setMessage}
							onSubmit={maybeSubmit}
						/>
					</>
				)}
			</Body>
			<DialogButtons
				buttons={[
					{
						label: 'Cancel',
						onClick: loading ? NoOp : onCancel,
						'data-testid': 'cancel',
					},
					{
						label: 'Send',
						disabled: !canSend,
						onClick: loading ? NoOp : onSave,
						'data-testid': 'save',
					},
				]}
			/>
		</Frame>
	);
}

function useInviteFormLogic({ loading, onDone }) {
	const [{ error, role, file, emails, message }, setState] = useReducerState({
		role: 'learner',
		file: null,
		emails: [],
		message: '',
		error: null,
	});

	const canSend = (!loading && file) || emails?.length > 0;

	//#region methods
	const clearError = useCallback(() => setState({ error: null }), []);

	const send = useCallback(
		async (method, ...args) => {
			try {
				await method(...args);
				onDone?.();
			} catch (e) {
				setState({ error: e });
			}
		},
		[onDone]
	);

	const onCancel = useCallback(() => {
		onDone?.();
	}, [onDone]);

	const onSave = useCallback(async () => {
		const method =
			role === 'learner' ? sendLearnerInvites : sendAdminInvites;
		send(method, emails, message, file);
	}, [role, emails, message, file]);

	const maybeSubmit = useCallback(
		() => void canSend && onSave(),
		[onSave, canSend]
	);

	const setEmails = useCallback(x => setState({ emails: x }), []);
	const setFile = useCallback(x => (clearError(), setState({ file: x })), []);
	const setMessage = useCallback(x => setState({ message: x }), []);
	const setRole = useCallback(x => setState({ role: x }), []);

	//#endregion

	return {
		canSend,
		clearError,
		emails,
		error,
		file,
		maybeSubmit,
		message,
		onCancel,
		onSave,
		role,
		setEmails,
		setFile,
		setMessage,
		setRole,
	};
}
