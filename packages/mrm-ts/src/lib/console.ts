import kleur from "kleur";

/**
 * Pretty Error messages
 */
export function printError(message: string) {
	console.log();
	console.error(kleur.bold().red(message));
	console.log();
}
