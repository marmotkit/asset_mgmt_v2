"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiServiceInstance = exports.ApiService = exports.AuthService = void 0;
var auth_service_1 = require("./auth.service");
Object.defineProperty(exports, "AuthService", { enumerable: true, get: function () { return auth_service_1.AuthService; } });
var api_service_1 = require("./api.service");
Object.defineProperty(exports, "ApiService", { enumerable: true, get: function () { return api_service_1.ApiService; } });
Object.defineProperty(exports, "ApiServiceInstance", { enumerable: true, get: function () { return api_service_1.ApiServiceInstance; } });
