import { ValidationError } from 'class-validator';

export function flattenValidationErrors(errors: ValidationError[]): string[] {
    let result = ['Validation failed'];

    for (const error of errors) {
        const { constraints, property } = error;

        if (constraints != null) {
            const values = Object.values(constraints);

            if (property.length > 0) {
                for (const index in values) {
                    values[index] = values[index].replaceAll(
                        /\$property/g,
                        property,
                    );
                }
            }

            result.push(...values);
        }
    }

    if (result.length > 1) result = result.slice(1);

    return result;
}
