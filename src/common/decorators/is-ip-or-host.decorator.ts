import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';
import { isIP, isFQDN } from 'validator';

@ValidatorConstraint({ async: false })
class IsIpOrHostConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    return (
      typeof value === 'string' &&
      (isIP(value, '4') ||
        isIP(value, '6') ||
        isFQDN(value) ||
        value === 'localhost' ||
        value === 'trementum-postgres')
    );
  }

  defaultMessage(validationArguments: ValidationArguments) {
    return `${validationArguments.property} must be a valid IP address or a hostname`;
  }
}

export function IsIpOrHost(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsIpOrHostConstraint,
    });
  };
}
