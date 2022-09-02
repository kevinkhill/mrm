import updateNotifier from "update-notifier";

import packageJson from "../../package.json" assert { type: "json" };
import { cliDebug } from "../cli";

/**
 * Check for newer versions of the tool
 */
export function runUpdater() {
	const notifier = updateNotifier({ pkg: packageJson });

	cliDebug("current pkg version: %s", notifier.update?.current);
	cliDebug("latest pkg version: %s", notifier.update?.latest);

	return notifier.notify();
}
