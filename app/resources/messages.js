class Messages {
	invalidZulipServerError(domain) {
		return `${domain} does not appear to be a valid Zulip server. Make sure that
			\n • You can connect to that URL in a web browser.\
			\n • If you need a proxy to connect to the Internet, that you've configured your proxy in the Network settings.\
			\n • It's a Zulip server. (The oldest supported version is 1.6).\
			\n • The server has a valid certificate. (You can add custom certificates in Settings > Organizations).`;
	}

	noOrgsError(domain) {
		return `${domain} does not have any organizations added.\
		\nPlease contact your server administrator.`;
	}

	certErrorMessage(domain, error) {
		return `Do you trust certificate from ${domain}? \n ${error}`;
	}

	certErrorDetail() {
		return `The organization you're connecting to is either someone impersonating the Zulip server you entered, or the server you're trying to connect to is configured in an insecure way.
		\nIf you have a valid certificate please add it from Settings>Organizations and try to add the organization again.
		\nUnless you have a good reason to believe otherwise, you should not proceed.
		\nYou can click here if you'd like to proceed with the connection.`;
	}

	enterpriseOrgError(length) {
		return {
			title: `Could not add ${length} ${length === 1 ? `organization` : `organizations`}`,
			content: `Please contact your system administrator.`
		};
	}

	orgRemovalError(url) {
		return {
			title: `Removing ${url} is a restricted operation.`,
			content: `Please contact your system administrator.`
		};
	}
}

module.exports = new Messages();
