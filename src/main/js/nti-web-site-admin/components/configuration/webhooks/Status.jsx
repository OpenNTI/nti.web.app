const Container = styled('div')`
	flex: 1;
	display: flex;
	align-items: center;
	gap: var(--padding-xs, 0.375em);

	&::before {
		content: '';
		flex: 0 0 6px;
		height: 6px;
		border-radius: 50%;
	}

	&.status-success::before,
	&.status-active::before {
		background-color: var(--color-success);
	}

	&.status-failed::before {
		background-color: var(--color-error);
	}
`;

export const Status = ({item: { Status, status = Status} = {}}) => <Container status={status}>{status}</Container>;
