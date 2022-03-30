import assert from 'assert';
import Joi from 'joi-strict';

export const genSchema = ({ maxPrecision }) => {
  assert(Number.isInteger(maxPrecision));
  return Joi.array().ordered(
    Joi.number().min(-180).max(180).precision(maxPrecision),
    Joi.number().min(-90).max(90).precision(maxPrecision)
  );
};
