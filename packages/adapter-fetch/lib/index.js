'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (next) {
  return function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref) {
      var endpoint = _ref.endpoint,
          others = (0, _objectWithoutProperties3.default)(_ref, ['endpoint']);
      var resp, error;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return fetch(endpoint, others);

            case 2:
              resp = _context.sent;

              if (resp.ok) {
                _context.next = 11;
                break;
              }

              error = new Error('Bad Response');

              error.statusCode = resp.statusCode;
              _context.next = 8;
              return resp.text();

            case 8:
              error.data = _context.sent;

              error.headers = resp.headers;
              throw error;

            case 11:
              _context.t0 = next;
              _context.next = 14;
              return resp.text();

            case 14:
              _context.t1 = _context.sent;
              _context.t2 = resp.headers;
              _context.t3 = {
                data: _context.t1,
                headers: _context.t2
              };
              return _context.abrupt('return', (0, _context.t0)(_context.t3));

            case 18:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }();
};