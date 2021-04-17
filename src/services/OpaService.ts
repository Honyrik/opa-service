import * as fs from 'fs';
import * as os from 'os';
import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import { ExecuteDto } from '../dto/ExecuteDto';
import {
    deleteFolderRecursive,
    isEmpty,
    deepParam,
    findFile,
} from '../utils/Base';
import { v4 as uuidV4 } from 'uuid';

const opaPath =
  findFile(process.env.OPA_PATH) ||
  path.resolve(__dirname, '..', 'assets', 'opa');

@Injectable()
export class OpaService {
    async execute(executeDto: ExecuteDto): Promise<Record<string, any>[]> {
        return Promise.all(
            (Array.isArray(executeDto.input)
                ? executeDto.input
                : [executeDto.input]
            ).map(
                (input) =>
                    new Promise(async (resolve, reject) => {
                        const temp = path.resolve(os.tmpdir(), `opa_temp_${uuidV4()}`);
                        fs.mkdirSync(temp, { recursive: true });
                        const param = [];
                        await Promise.all(
                            (Array.isArray(executeDto.policy || [])
                                ? executeDto.policy || []
                                : [executeDto.policy]
                            ).map(async (val, ind: number) => {
                                const namePath = path.join(temp, `query_${ind}.rego`);
                                await new Promise((resolveFile, rejectFile) => {
                                    if (val.stream) {
                                        val.stream.pipe(fs.createWriteStream(namePath));
                                        val.stream.on('error', (err) => rejectFile(err));
                                        val.stream.on('end', () => resolveFile(true));
                                    } else {
                                        fs.writeFile(namePath, val.buffer, (err) => {
                                            if (err) {
                                                return rejectFile(err);
                                            }
                                            resolveFile(true);
                                        });
                                    }
                                });
                                param.push('-d');
                                param.push(namePath);
                            })
                        );
                        await Promise.all(
                            (Array.isArray(executeDto.data || [])
                                ? executeDto.data || []
                                : [executeDto.data]
                            ).map(async (val, ind) => {
                                const namePath = path.join(temp, `data_${ind}.json`);
                                await new Promise((resolveFile, rejectFile) => {
                                    if (val.stream) {
                                        val.stream.on('error', (err) => rejectFile(err));
                                        val.stream.on('end', () => resolveFile(true));
                                        val.stream.pipe(fs.createWriteStream(namePath));
                                    } else {
                                        fs.writeFile(namePath, val.buffer, (err) => {
                                            if (err) {
                                                return rejectFile(err);
                                            }
                                            resolveFile(true);
                                        });
                                    }
                                });
                                param.push('-d');
                                param.push(namePath);
                            })
                        );
                        const inputName = path.join(temp, 'input.json');
                        await new Promise(async (resolveFile, rejectFile) => {
                            if (input.stream) {
                                input.stream.on('error', (err) => rejectFile(err));
                                input.stream.on('end', () => resolveFile(true));
                                input.stream.pipe(fs.createWriteStream(inputName));
                            } else {
                                fs.writeFile(inputName, input.buffer, (err) => {
                                    if (err) {
                                        return rejectFile(err);
                                    }
                                    resolveFile(true);
                                });
                            }
                        });
                        const opa = spawn(opaPath, [
                            'eval',
                            '-i',
                            inputName,
                            ...param,
                            '--stdin',
                        ]);
                        let rawData = '';
                        let rawError = '';
                        opa.stdout.on('data', (chunk) => {
                            rawData += chunk;
                        });
                        opa.stderr.on('data', (data) => {
                            rawError += data;
                        });
                        opa.on('exit', () => {
                            if (!isEmpty(rawError)) {
                                deleteFolderRecursive(temp);
                                return reject(new Error(`OPA Error: \n${rawError}`));
                            }
                            try {
                                deleteFolderRecursive(temp);
                                let res = JSON.parse(rawData);
                                res = executeDto.resultPath
                                    ? deepParam(executeDto.resultPath, res)
                                    : res;
                                res = Array.isArray(res) ? res : [res];
                                return resolve(
                                    res.map((obj) => ({
                                        ...obj,
                                        fileName: input.originalname,
                                    }))
                                );
                            } catch (e) {
                                return reject(e);
                            }
                        });
                        opa.stdin.end(executeDto.query);
                    })
            )
        ).then(
            (arr: any[]) => arr.reduce((res, val) => res.concat(val), []) as any
        );
    }
}
