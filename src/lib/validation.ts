import { NextFunction, Request, Response } from 'express';
import { CustomValidator, ValidationChain, body, validationResult } from 'express-validator';
import slugify from 'slugify';
import xss from 'xss';

import { checkTeamExists, getTeams, getTeamsBySlug } from './db.js';
import { NotSameTeamOptions } from './teams.js';

/**
 * Checks to see if there are validation errors or returns next middlware if not.
 * @param {object} req HTTP request
 * @param {object} res HTTP response
 * @param {function} next Next middleware
 * @returns Next middleware or validation errors.
 */
export function validationCheck(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    const errors = validation.array();
    const notFoundError = errors.find((error) => error.msg === 'not found');
    const serverError = errors.find((error) => error.msg === 'server error');

    let status = 400;

    if (serverError) {
      status = 500;
    } else if (notFoundError) {
      status = 404;
    }

    return res.status(status).json({ errors });
  }

  console.log('ValidationCheck completed')

  return next();
}

export function atLeastOneBodyValueValidator(fields: Array<string>) {
    console.log('running atleastonebody');
  return body().custom(async (value, { req }) => {
    const { body: reqBody } = req;
    console.log('body', reqBody);

    let valid = false;

    for (let i = 0; i < fields.length; i += 1) {
      const field = fields[i];

      if (field in reqBody && reqBody[field] != null) {
        valid = true;
        break;
      }
    }

    if (!valid) {
      return Promise.reject(
        new Error(`require at least one value of: ${fields.join(', ')}`),
      );
    }
    return Promise.resolve();
  });
}

export const xssSanitizer = (param: string) =>
  body(param).customSanitizer((v) => xss(v));

export const xssSanitizerMany = (params: string[]) =>
  params.map((param) => xssSanitizer(param));

export const genericSanitizer = (param: string) => body(param).trim().escape();

export const genericSanitizerMany = (params: string[]) =>
  params.map((param) => genericSanitizer(param));

export const stringValidator = ({
  field = '',
  valueRequired = true,
  maxLength = 0,
  optional = false,
} = {}) => {
  console.log('running stringval for field', field);

  console.log(`Config for ${field}:`, { valueRequired, maxLength, optional });
  const val = body(field)
    .trim()
    .isString()
    .isLength({
      min: valueRequired ? 1 : undefined,
      max: maxLength ? maxLength : undefined,
    })
    .withMessage(
      [
        field,
        valueRequired ? 'required' : '',
        maxLength ? `max ${maxLength} characters` : '',
      ]
        .filter((i) => Boolean(i))
        .join(' '),
    );

  if (optional) {
    console.log(`Field ${field} is optional.`);
    return val.optional();
  }
  return val;
};


export const teamDoesNotExistValidator = body('name').custom(
  async (name) => {
    if (await getTeamsBySlug(slugify(name, {lower: true}))) {
      return Promise.reject(new Error('team with name already exists'));
    }
    return Promise.resolve();
  },
);

export const dateValidator = ({
  field = '',
  valueRequired = true,
  maxLength = 0,
  optional = false,
}= {}) => {
  const val = body(field)
  .isISO8601().withMessage('Ógild dagsetning')
  .custom((value) => {
      console.log('date checking')
      const input = new Date(value);
      const now = new Date;
      
      if(input > now){
          throw new Error('Ekki hægt að skrá leiki fram í tíman')
      }else{
          console.log('date checked')
          return true;
      }
  })
  .custom((value) =>{
    const input = new Date(value);
      const now = new Date;
      const twoMonths = new Date(now);
      twoMonths.setMonth(now.getMonth()-2);
      
      if(input< twoMonths){
        throw new Error('Ekki hægt að skrá leiki eldri en tveggja mánaða')
      }else{
        console.log('date checked2')
        return true;
      }

    }
  )
  if (optional) {
    console.log(`Field ${field} is optional.`);
    return val.optional();
  }
  console.log('date for i gegn')
  return val;
}

export const scoreValidator = ({
  field = '',
  valueRequired = true,
  maxLength = 0,
  optional = false,
}= {}) => {
  const val = body(field)
  .notEmpty()
  .withMessage('Lið mega ekki vanta stig!')
  .bail()
  .isInt({min: 0, max: 99})
  .withMessage('Stig liðs verða að vera heiltala frá 0 til 99 ' + field)

  if (optional) {
    console.log(`Field ${field} is optional.`);
    return val.optional();
  }
  return val;
}

export const idValidator = ({
  field = '',
  valueRequired = true,
  maxLength = 0,
  optional = false,
}= {}) => {
  console.log('lid check ' + field)
  const val = body(field)
  .notEmpty()
  .withMessage('Lið má ekki vanta ' + field )
  .bail()
  .custom(async (value) => {
    console.log('lid checking' + value)
    const id = parseInt(value, 10);
    console.log('id log fyrir value ' + id)
    if (isNaN(id)) {
      throw new Error('ID þarf að vera tala liðs');
    }
    const teamExists = await checkTeamExists(value);
      if (!teamExists) {
        throw new Error(field + ' er ekki skráð ID fyrir lið');
      }
      return true;
  })
  if (optional) {
    console.log(`Field ${field} is optional.`);
    return val.optional();
  }
  console.log('lid checked ' + field)
  return val;
}

export function notSameTeamValidator(field1: string, field2: string, message: string): ValidationChain {
  return body(field1).custom((value, { req }) => {
      if (value === req.body[field2]) {
          throw new Error(message);
      }
      return true; // Validation passed
  });
}
