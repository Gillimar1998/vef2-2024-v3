import { NextFunction, Request, Response } from 'express';
import { ValidationChain, body, validationResult } from 'express-validator';
import slugify from 'slugify';
import xss from 'xss';
import { checkTeamExists, getTeamsBySlug } from './db.js';

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


  return next();
}

export function atLeastOneBodyValueValidator(fields: Array<string>) {
  return body().custom(async (value, { req }) => {
    const { body: reqBody } = req;

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
  minLenght = 0,
  maxLength = 0,
  optional = false,
} = {}) => {
  const val = body(field)
    .trim()
    .isString()
    .isLength({
      min: minLenght ? minLenght : undefined,
      max: maxLength ? maxLength : undefined,
    })
    .withMessage(
      [
        field,
        valueRequired ? 'required' : '',
        minLenght ? `min ${minLenght}` : '',
        maxLength ? `max ${maxLength} characters` : '',
      ]
        .filter((i) => Boolean(i))
        .join(' '),
    );

  if (optional) {
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
  optional = false,
}= {}) => {
  const val = body(field)
  .isISO8601().withMessage('Ógild dagsetning')
  .custom((value) => {
      const input = new Date(value);
      const now = new Date;
      
      if(input > now){
          throw new Error('Ekki hægt að skrá leiki fram í tíman')
      }else{
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
        return true;
      }

    }
  )
  if (optional) {
    return val.optional();
  }
  return val;
}

export const scoreValidator = ({
  field = '',
  optional = false,
}= {}) => {
  const val = body(field)
  .notEmpty()
  .withMessage('Lið mega ekki vanta stig!' + field)
  .bail()
  .isInt({min: 0, max: 99})
  .withMessage('Stig liðs verða að vera heiltala frá 0 til 99 ' + field)

  if (optional) {
    return val.optional();
  }
  return val;
}

export const idValidator = ({
  field = '',
  optional = false,
}= {}) => {
  const val = body(field)
  .notEmpty()
  .withMessage('Lið má ekki vanta ' + field )
  .bail()
  .isInt()
  .withMessage('ID þarf að vera tala ' + field)
  .bail()
  .custom(async (value) => {
    const id = parseInt(value, 10);
    if (isNaN(id)) {
      throw new Error('ID þarf að vera tala ' + field);
    }

    const teamExists = await checkTeamExists(value);
      if (!teamExists) {
        throw new Error(field + ' er ekki skráð ID fyrir lið');
      }
      return true;
  })
  if (optional) {
    return val.optional();
  }
  return val;
}

export function notSameTeamValidator(field1: string, field2: string, message: string): ValidationChain {
  return body(field1).custom((value, { req }) => {
      if (value === req.body[field2]) {
          throw new Error(message);
      }
      return true;
  });
}
