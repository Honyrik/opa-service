import * as fs from 'fs';
import * as path from 'path';

export function isEmpty(value: any, allowEmptyString = false) {
    return (
        value == null ||
        (allowEmptyString ? false : value === '') ||
        (Array.isArray(value) && value.length === 0)
    );
}

export const deleteFolderRecursive = (pathDir: string) => {
    if (fs.existsSync(pathDir)) {
        if (fs.lstatSync(pathDir).isDirectory()) {
            fs.readdirSync(pathDir).forEach((file) => {
                const curPath = path.join(pathDir, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    // recurse
                    deleteFolderRecursive(curPath);
                } else {
                    // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(pathDir);
            return;
        }
        fs.unlinkSync(pathDir);
    }
};

export function deepParam(
    path: string | string[],
    params: Record<string, any>,
) {
    if (isEmpty(params) || isEmpty(path)) {
        return null;
    }
    const paths: any[] = Array.isArray(path) ? path : path.split('.');
    let current: any = params;

    for (const [idx, val] of paths.entries()) {
        if (
            typeof current === 'string' &&
            (current.trim().charAt(0) === '[' ||
                current.trim().charAt(0) === '{')
        ) {
            current = JSON.parse(current);
        }
        if (!Array.isArray(current) && typeof current !== 'object') {
            return null;
        }
        if (
            val === '*' &&
            (current[val] === undefined || current[val] === null)
        ) {
            return Array.isArray(current)
                ? current.map((obj) => deepParam(paths.slice(idx + 1), obj))
                : Object.entries(current).map(([key, obj]) =>
                    deepParam(paths.slice(idx + 1), obj),
                );
        }

        if (current[val] === undefined || current[val] === null) {
            return current[val];
        }

        current = current[val];
    }

    return current;
}

export const deepChange = (
    obj: Record<string, any>,
    path: string,
    value: any,
): boolean => {
    if (isEmpty(path) || isEmpty(obj)) {
        return false;
    }
    const paths: any[] = path.split('.');
    const last = paths.pop();
    let current: any = obj;

    if (
        !Array.isArray(current[paths[0]]) &&
        typeof current[paths[0]] !== 'object'
    ) {
        current[paths[0]] = /[0-9]+/.test(paths[0]) ? [] : {};
    }
    for (const val of paths) {
        current = current[val];
        if (!Array.isArray(current) && typeof current !== 'object') {
            current[val] = /[0-9]+/.test(val) ? [] : {};
            current = current[val];
        }
    }
    current[last] = value;

    return true;
};

export function findFile(filePath?: string) {
    if (!filePath) {
        return filePath;
    }
    if (filePath.startsWith('.')) {
        return path.resolve(__dirname, '..', filePath);
    }
    return path.resolve(filePath);
}