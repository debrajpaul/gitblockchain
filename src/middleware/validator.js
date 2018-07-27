import Ajv from "ajv";
import { fail } from "../utils/response-helper";
export function body_validator(schema) {
  return function(req, res, next) {
    let { body } = req;
    let ajv = new Ajv();
    let valid = ajv.validate(schema, body);
    if (!valid) {
      let error = ajv.errorsText();
      res.status(401).json(fail("Request validation failed", { error }));
      return;
    }
    next();
  };
}
export function headers_validator(schema) {
  return function(req, res, next) {
    let { headers } = req;
    let ajv = new Ajv();
    let valid = ajv.validate(schema, headers);
    if (!valid) {
      let error = ajv.errorsText();
      res.status(401).json(fail("Request validation failed", { error }));
      return;
    }
    next();
  };
}

export function params_validator(schema) {
  return function(req, res, next) {
    let { params } = req;
    let ajv = new Ajv();
    let valid = ajv.validate(schema, params);
    if (!valid) {
      let error = ajv.errorsText();
      res.status(401).json(fail("Request validation failed", { error }));
      return;
    }
    next();
  };
}

export function query_validator(schema) {
  return function(req, res, next) {
    let { query } = req;
    let ajv = new Ajv();
    let valid = ajv.validate(schema, query);
    if (!valid) {
      let error = ajv.errorsText();
      res.status(401).json(fail("Request validation failed", { error }));
      return;
    }
    next();
  };
}
