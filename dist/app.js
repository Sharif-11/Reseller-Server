"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//src/app.ts
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const globalErrorHandler_1 = __importDefault(require("./middlewares/globalErrorHandler"));
const global_routes_1 = __importDefault(require("./routes/global.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)());
const corsOptions = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    origin: function (origin, callback) {
        callback(null, true);
    },
    credentials: true, // Allow credentials
};
// Use CORS middleware
app.use((0, cors_1.default)(corsOptions));
app.use('/api/v1', global_routes_1.default);
//health check
app.get('/health', (req, res) => {
    res.status(200).json({
        statusCode: 200,
        success: true,
        message: 'Server is running',
    });
});
//handling unhandled routes
app.all('*', (req, res, next) => {
    res.status(404).json({
        statusCode: 404,
        success: false,
        message: `Can't find ${req.originalUrl} on this server!`,
    });
});
app.use(globalErrorHandler_1.default);
exports.default = app;
