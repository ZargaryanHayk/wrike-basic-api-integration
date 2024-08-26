"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
dotenv.config();
// // id => 'id'
// // name => 'title'
// // assignee => 'accountId'
// // status => 'importance'
// // collections => 'parentIds'
// // created_at => 'createdDate'
// // updated_at => 'updatedDate'
// // ticket_url => 'permalink'
const API_TOKEN = process.env.API_TOKEN;
const API = process.env.API;
class Task {
}
class MyData {
}
const headers = {
    'Authorization': `bearer ${API_TOKEN}`
};
const config = {
    headers: headers
};
function getWrikeTask() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get(API, { headers });
        const data = response.data;
        const tasks = data.data.map((d) => ({
            id: d.id,
            name: d.title,
            assignee: d.accountId,
            status: d.importance,
            collections: d.parentIds,
            created_at: d.createdDate,
            updated_at: d.updatedDate,
            ticket_url: d.permalink
        }));
        return tasks;
    });
}
function writeJson(data) {
    const fileSaveData = JSON.stringify(Object.assign({}, data));
    fs.writeFile('tasks.json', fileSaveData, (err) => {
        if (err)
            throw err;
        console.log('File has been saved!');
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = yield getWrikeTask();
    console.log(tasks);
    writeJson(tasks);
}))();
