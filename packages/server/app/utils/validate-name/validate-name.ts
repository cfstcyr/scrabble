const VALIDATION_RULE = "^([0-9A-Za-zÀ-ÖØ-öø-ÿ]+[ '\\-_]{0,1})*$";

export const validateName = (name: string) => RegExp(VALIDATION_RULE).test(name);
