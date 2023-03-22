import { validator } from '@app/middlewares/validator';
import { body } from 'express-validator';

export const wordPlacementValidator = (field: string | string[]) =>
    validator(
        body(field).exists().bail(),
        body(`${field}.tilesToPlace`).isArray(),
        body(`${field}.orientation`).isIn([0, 1]),
        body(`${field}.position`).exists().bail(),
        body(`${field}.position.row`).isNumeric(),
        body(`${field}.position.column`).isNumeric(),
    );
