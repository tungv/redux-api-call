"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require("babel-runtime/helpers/objectWithoutProperties");

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tryJSON = function tryJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch (ex) {
    return raw;
  }
};

exports.default = function (next) {
  return function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req) {
      var _ref2, data, others;

      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return next(req);

            case 3:
              _ref2 = _context.sent;
              data = _ref2.data;
              others = (0, _objectWithoutProperties3.default)(_ref2, ["data"]);
              return _context.abrupt("return", (0, _extends3.default)({
                data: tryJSON(data)
              }, others));

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](0);
              data = _context.t0.data;
              others = (0, _objectWithoutProperties3.default)(_context.t0, ["data"]);
              throw (0, _extends3.default)({
                data: tryJSON(data)
              }, others);

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, undefined, [[0, 9]]);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }();
};