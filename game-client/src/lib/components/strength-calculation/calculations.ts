export function calculateStrength({
	groupModifier,
	numberOfUsersAtPoint,
	userBaseDamage,
	userMaxDamage
}: {
	userMaxDamage: number;
	userBaseDamage: number;
	numberOfUsersAtPoint: number;
	groupModifier: number;
}): number {
	return Math.min(
		userMaxDamage,
		(userBaseDamage + (numberOfUsersAtPoint - 1) * groupModifier) * numberOfUsersAtPoint
	);
}
