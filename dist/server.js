"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const app_1 = __importDefault(require("./app"));
const index_1 = __importDefault(require("./config/index"));
const prisma_1 = __importDefault(require("./utils/prisma"));
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        let server;
        try {
            // Start the server
            server = app_1.default.listen(index_1.default.port, () => {
                console.log('App listening on port', index_1.default.port);
            });
            // Graceful shutdown on signals
            const shutdown = (signal) => __awaiter(this, void 0, void 0, function* () {
                console.log(`Received ${signal}, shutting down gracefully...`);
                // Close the server
                if (server) {
                    yield new Promise((resolve, reject) => {
                        server.close((err) => {
                            if (err) {
                                console.error('Error while closing server:', err);
                                reject(err);
                            }
                            else {
                                console.log('HTTP server closed.');
                                resolve();
                            }
                        });
                    });
                }
                // Disconnect Prisma client
                try {
                    yield prisma_1.default.$disconnect();
                    console.log('Disconnected from the database.');
                }
                catch (error) {
                    console.error('Error disconnecting from the database:', error);
                }
                process.exit(0);
            });
            process.on('SIGINT', () => shutdown('SIGINT'));
            process.on('SIGTERM', () => shutdown('SIGTERM'));
        }
        catch (error) {
            console.error('Failed to start the server:', error);
            yield prisma_1.default.$disconnect();
            process.exit(1);
        }
    });
}
bootstrap();
