import Joi from 'joi-strict';
import { Module } from './logic/module.js';
import { Router } from './logic/router.js';
import { Wrapper } from './logic/wrapper.js';
import swagger from './logic/swagger.js';
import mergeSchemas from './util/merge-schemas.js';

import {
  ApiErrorFn,
  ApiError as ApiErrorClass_
} from './response/api-error.js';
import {
  ApiResponseFn,
  ApiResponse as ApiResponseClass_
} from './response/api-response.js';
import {
  JsonResponseFn,
  JsonResponse as JsonResponseClass_
} from './response/json-response.js';
import {
  BinaryResponseFn,
  BinaryResponse as BinaryResponseClass_
} from './response/binary-response.js';

import StrClass from './param/str.js';
import RegExClass from './param/regex.js';
import SchemaClass from './param/schema.js';
import EmailClass from './param/email.js';
import UUIDClass from './param/uuid.js';
import IsoTimestampClass from './param/iso-timestamp.js';
import IsoDateClass from './param/iso-date.js';
import BoolClass from './param/bool.js';
import EnumClass from './param/enum.js';
import TimezoneClass from './param/timezone.js';
import IntClass from './param/int.js';
import IntShortClass from './param/int-short.js';
import ListClass from './param/list.js';
import FieldsParamClass from './param/fields-param.js';
import StrListClass from './param/str-list.js';
import NumberListClass from './param/number-list.js';
import IntListClass from './param/int-list.js';
import JsonClass from './param/json.js';
import JsonListClass from './param/json-list.js';
import GeoPointClass from './param/geo-point.js';
import GeoPolyClass from './param/geo-poly.js';
import GeoPolyListClass from './param/geo-poly-list.js';
import GeoRectClass from './param/geo-rect.js';
import GeoShapeClass from './param/geo-shape.js';
import GeoShapeListClass from './param/geo-shape-list.js';
import NumberParamClass from './param/number-param.js';

export const ApiError = ApiErrorFn;
export const ApiErrorClass = ApiErrorClass_;
export const ApiResponse = ApiResponseFn;
export const ApiResponseClass = ApiResponseClass_;
export const JsonResponse = JsonResponseFn;
export const JsonResponseClass = JsonResponseClass_;
export const BinaryResponse = BinaryResponseFn;
export const BinaryResponseClass = BinaryResponseClass_;

export const Str = (...args) => new StrClass(...args);
export const RegEx = (...args) => new RegExClass(...args);
export const Schema = (...args) => new SchemaClass(...args);
export const Email = (...args) => new EmailClass(...args);
export const UUID = (...args) => new UUIDClass(...args);
export const IsoTimestamp = (...args) => new IsoTimestampClass(...args);
export const IsoDate = (...args) => new IsoDateClass(...args);
export const Bool = (...args) => new BoolClass(...args);
export const Enum = (...args) => new EnumClass(...args);
export const Timezone = (...args) => new TimezoneClass(...args);
export const Int = (...args) => new IntClass(...args);
export const IntShort = (...args) => new IntShortClass(...args);
export const List = (...args) => new ListClass(...args);
export const FieldsParam = (...args) => new FieldsParamClass(...args);
export const StrList = (...args) => new StrListClass(...args);
export const NumberList = (...args) => new NumberListClass(...args);
export const IntList = (...args) => new IntListClass(...args);
export const Json = (...args) => new JsonClass(...args);
export const JsonList = (...args) => new JsonListClass(...args);
export const GeoPoint = (...args) => new GeoPointClass(...args);
export const GeoPoly = (...args) => new GeoPolyClass(...args);
export const GeoPolyList = (...args) => new GeoPolyListClass(...args);
export const GeoRect = (...args) => new GeoRectClass(...args);
export const GeoShape = (...args) => new GeoShapeClass(...args);
export const GeoShapeList = (...args) => new GeoShapeListClass(...args);
export const Number = (...args) => new NumberParamClass(...args);

export const Api = (options = {}) => {
  const module = new Module(options);
  Joi.assert(options, mergeSchemas(module.getSchemas()));

  const router = Router({ module });
  const wrapper = Wrapper({ router, module });

  return {
    wrap: wrapper.wrap,
    router: router.handler,
    generateSwagger: () => swagger({ wrapper, options }),
    ApiError,
    ApiErrorClass,
    ApiResponse,
    ApiResponseClass,
    JsonResponse,
    JsonResponseClass,
    BinaryResponse,
    BinaryResponseClass,
    Str,
    RegEx,
    Schema,
    Email,
    UUID,
    IsoTimestamp,
    IsoDate,
    Bool,
    Enum,
    Timezone,
    Int,
    IntShort,
    List,
    FieldsParam,
    StrList,
    NumberList,
    IntList,
    Json,
    JsonList,
    GeoPoint,
    GeoPoly,
    GeoPolyList,
    GeoRect,
    GeoShape,
    GeoShapeList,
    Number
  };
};
