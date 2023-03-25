import { body } from "express-validator";
import { validator } from "../validator";

export const workPlacementValidator = (field: string | string[]) =>
    validator(
        body(field).exists().bail(),
        body(field).isArray()
    );