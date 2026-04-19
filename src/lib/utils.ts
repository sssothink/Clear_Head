const toHHMM = (value?: string) => {
	if (!value) return "";
	const parts = value.split(":");
	if (parts.length < 2) return value;
	return `${parts[0]}:${parts[1]}`;
};

export { toHHMM };
