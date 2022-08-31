/**
 * Parse a spec string for using degit
 */
export function parseSpec(src) {
	const supported = new Set(["github", "gitlab", "bitbucket", "git.sr.ht"]);

	const match =
		/^(?:(?:https:\/\/)?([^:/]+\.[^:/]+)\/|git@([^:/]+)[:/]|([^/]+):)?([^/\s]+)\/([^/\s#]+)(?:((?:\/[^/\s#]+)+))?(?:\/)?(?:#(.+))?/.exec(
			src
		);

	if (!match) {
		throw new Error(`could not parse ${src}`);
	}

	const site = (match[1] || match[2] || match[3] || "github").replace(
		/\.(com|org)$/,
		""
	);
	if (!supported.has(site)) {
		throw new Error(`degit supports GitHub, GitLab, Sourcehut and BitBucket`);
	}

	const user = match[4];
	const name = match[5].replace(/\.git$/, "");
	const subdir = match[6];
	const ref = match[7] || "HEAD";

	const domain = `${site}.${
		site === "bitbucket" ? "org" : site === "git.sr.ht" ? "" : "com"
	}`;
	const url = `https://${domain}/${user}/${name}`;
	const ssh = `git@${domain}:${user}/${name}`;

	return { site, user, name, ref, url, ssh, subdir };
}
