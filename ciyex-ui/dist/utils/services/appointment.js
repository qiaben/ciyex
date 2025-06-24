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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointmentById = getAppointmentById;
exports.getPatientAppointments = getPatientAppointments;
exports.getAppointmentWithMedicalRecordsById = getAppointmentWithMedicalRecordsById;
exports.autoCancelPastAppointments = autoCancelPastAppointments;
var db_1 = require("@/lib/db");
function getAppointmentById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!id) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Appointment id does not exist.",
                                status: 404,
                            }];
                    }
                    return [4 /*yield*/, db_1.default.appointment.findUnique({
                            where: { id: id },
                            select: {
                                id: true,
                                appointment_date: true,
                                time: true,
                                status: true,
                                type: true,
                                note: true,
                                reason: true,
                                mode: true,
                                created_at: true,
                                updated_at: true,
                                doctor: {
                                    select: { id: true, name: true, specialization: true, img: true },
                                },
                                patient: {
                                    select: {
                                        id: true,
                                        first_name: true,
                                        last_name: true,
                                        date_of_birth: true,
                                        gender: true,
                                        img: true,
                                        address: true,
                                        phone: true,
                                    },
                                },
                            },
                        })];
                case 1:
                    data = _a.sent();
                    if (!data) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Appointment data not found",
                                status: 200,
                                data: null,
                            }];
                    }
                    return [2 /*return*/, { success: true, data: data, status: 200 }];
                case 2:
                    error_1 = _a.sent();
                    console.log(error_1);
                    return [2 /*return*/, { success: false, message: "Internal Server Error", status: 500 }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var buildQuery = function (id, search) {
    // Base conditions for search if it exists
    var searchConditions = search
        ? {
            OR: [
                {
                    patient: {
                        first_name: { contains: search, mode: "insensitive" },
                    },
                },
                {
                    patient: {
                        last_name: { contains: search, mode: "insensitive" },
                    },
                },
                {
                    doctor: {
                        name: { contains: search, mode: "insensitive" },
                    },
                },
            ],
        }
        : {};
    // ID filtering conditions if ID exists
    var idConditions = id
        ? {
            OR: [{ patient_id: id }, { doctor_id: id }],
        }
        : {};
    // Combine both conditions with AND if both exist
    var combinedQuery = id || search
        ? {
            AND: __spreadArray(__spreadArray([], (Object.keys(searchConditions).length > 0
                ? [searchConditions]
                : []), true), (Object.keys(idConditions).length > 0 ? [idConditions] : []), true),
        }
        : {};
    return combinedQuery;
};
function getPatientAppointments(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var PAGE_NUMBER, LIMIT, SKIP, _c, data, totalRecord, totalPages, error_2;
        var page = _b.page, limit = _b.limit, search = _b.search, id = _b.id;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
                    LIMIT = Number(limit) || 10;
                    SKIP = (PAGE_NUMBER - 1) * LIMIT;
                    return [4 /*yield*/, Promise.all([
                            db_1.default.appointment.findMany({
                                where: buildQuery(id, search),
                                skip: SKIP,
                                take: LIMIT,
                                select: {
                                    id: true,
                                    patient_id: true,
                                    doctor_id: true,
                                    type: true,
                                    appointment_date: true,
                                    time: true,
                                    status: true,
                                    mode: true,
                                    patient: {
                                        select: {
                                            id: true,
                                            first_name: true,
                                            last_name: true,
                                            phone: true,
                                            gender: true,
                                            img: true,
                                            date_of_birth: true,
                                            colorCode: true,
                                        },
                                    },
                                    doctor: {
                                        select: {
                                            id: true,
                                            name: true,
                                            specialization: true,
                                            colorCode: true,
                                            img: true,
                                        },
                                    },
                                },
                                orderBy: { appointment_date: "desc" },
                            }),
                            db_1.default.appointment.count({
                                where: buildQuery(id, search),
                            }),
                        ])];
                case 1:
                    _c = _d.sent(), data = _c[0], totalRecord = _c[1];
                    if (!data) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Appointment data not found",
                                status: 200,
                                data: null,
                            }];
                    }
                    totalPages = Math.ceil(totalRecord / LIMIT);
                    return [2 /*return*/, {
                            success: true,
                            data: data,
                            totalPages: totalPages,
                            currentPage: PAGE_NUMBER,
                            totalRecord: totalRecord,
                            status: 200,
                        }];
                case 2:
                    error_2 = _d.sent();
                    console.log(error_2);
                    return [2 /*return*/, { success: false, message: "Internal Server Error", status: 500 }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getAppointmentWithMedicalRecordsById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!id) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Appointment id does not exist.",
                                status: 404,
                            }];
                    }
                    return [4 /*yield*/, db_1.default.appointment.findUnique({
                            where: { id: id },
                            include: {
                                patient: true,
                                doctor: true,
                                bills: {
                                    include: {
                                        bills: {
                                            include: {
                                                service: {
                                                    select: {
                                                        service_name: true,
                                                        id: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                medical: {
                                    include: {
                                        diagnosis: true,
                                        lab_test: true,
                                        vital_signs: true,
                                    },
                                },
                            },
                        })];
                case 1:
                    data = _a.sent();
                    if (!data) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Appointment data not found",
                                status: 200,
                            }];
                    }
                    return [2 /*return*/, { success: true, data: data, status: 200 }];
                case 2:
                    error_3 = _a.sent();
                    console.log(error_3);
                    return [2 /*return*/, { success: false, message: "Internal Server Error", status: 500 }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Automatically cancel past appointments that are not completed or cancelled
function autoCancelPastAppointments() {
    return __awaiter(this, void 0, void 0, function () {
        var now, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = new Date();
                    return [4 /*yield*/, db_1.default.appointment.updateMany({
                            where: {
                                appointment_date: { lt: now },
                                status: { in: ["PENDING", "SCHEDULED"] },
                            },
                            data: {
                                status: "CANCELLED",
                                reason: "Appointment not done (auto-cancelled after scheduled time)",
                            },
                        })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.count];
            }
        });
    });
}
