"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var https = require("https");
var checkPort = function (port) {
    return !isNaN(parseFloat(port)) && Math.sign(port) === 1;
};
var getDaysBetween = function (validFrom, validTo) {
    return Math.round(Math.abs(+validFrom - +validTo) / 8.64e7);
};
var getDaysRemaining = function (validFrom, validTo) {
    var daysRemaining = getDaysBetween(validFrom, validTo);
    if (new Date(validTo).getTime() < new Date().getTime()) {
        return -daysRemaining;
    }
    return daysRemaining;
};
var sslChecker = function (host, options) {
    if (options === void 0) { options = {
        agent: false,
        method: "HEAD",
        port: 443,
        rejectUnauthorized: false
    }; }
    return new Promise(function (resolve, reject) {
        var isValidHostName = host &&
            /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(host);
        if (!isValidHostName) {
            reject(new Error("Invalid host"));
        }
        if (!checkPort(options.port)) {
            reject(Error("Invalid port"));
        }
        try {
            var req = https.request(__assign({ host: host }, options), function (res) {
                var _a = res.connection.getPeerCertificate(), valid_from = _a.valid_from, valid_to = _a.valid_to, subject = _a.subject;
                //console.log(_a);
                var validTo = new Date(valid_to);
                //console.log(`valid_from = ${valid_from}`)
                resolve({
                    daysRemaining: getDaysRemaining(new Date(), validTo),
                    valid: res.socket
                        .authorized || false,
                    validFrom: typeof valid_from !== 'undefined' ? new Date(valid_from).toISOString(): 'unknown',
                    validTo: typeof valid_from !== 'undefined' ? validTo.toISOString() : 'unknown',
                    subject_cn: typeof subject !== 'undefined' ? subject.CN : 'unknown'
                });
            });
            req.on("error", reject);
            req.end();
        }
        catch (e) {
            reject(e);
        }
    });
};
exports["default"] = sslChecker;
