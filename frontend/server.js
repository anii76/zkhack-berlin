"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var path_1 = require("path");
var request_1 = require("request");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
var viewsDir = path_1.default.join(__dirname, 'views');
app.use(express_1.default.static(viewsDir));
app.use(express_1.default.static(path_1.default.join(__dirname, './public')));
app.get('/', function (req, res) { return res.sendFile(path_1.default.join(viewsDir, 'index.html')); });
app.get('/scan', function (req, res) { return res.sendFile(path_1.default.join(viewsDir, 'scan.html')); });
app.get('/generating', function (req, res) { return res.sendFile(path_1.default.join(viewsDir, 'generating.html')); });
app.get('/receive', function (req, res) { return res.sendFile(path_1.default.join(viewsDir, 'receive.html')); });
app.get('/face-scan', function (req, res) { return res.sendFile(path_1.default.join(viewsDir, 'face-scan.html')); });
app.get('/success', function (req, res) { return res.sendFile(path_1.default.join(viewsDir, 'success.html')); });
var PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, function () { return console.log("Listening on port ".concat(PORT, "!")); });
function request(url, returnBuffer, timeout) {
    if (returnBuffer === void 0) { returnBuffer = true; }
    if (timeout === void 0) { timeout = 10000; }
    return new Promise(function (resolve, reject) {
        var options = Object.assign({}, {
            url: url,
            isBuffer: true,
            timeout: timeout,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
            }
        }, returnBuffer ? { encoding: null } : {});
        (0, request_1.get)(options, function (err, res) {
            if (err)
                return reject(err);
            return resolve(res);
        });
    });
}
