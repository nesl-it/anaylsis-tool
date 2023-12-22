export const generateRandomDigits = (n: number) => {
    return Math.floor(Math.random() * (9 * (Math.pow(10, n - 1)))) + (Math.pow(10, n - 1));
};

export const epochToDate = (epochs: number) => {
    const d = new Date(0);
    d.setUTCSeconds(epochs);
    return d;
};

export const addHours = (hours: number, refDate?: Date) => {
    const now = refDate ? refDate : new Date();
    let time = now.getTime();
    time += (hours * 60 * 60 * 1000);
    const dt = new Date(time);
    return dt;
};

export const extractDate = (dt: Date) => {
    const date = dt.getDate();
    const month = dt.getMonth() + 1;
    const year = dt.getFullYear();

    const dateS = date < 10 ? `0${date}` : `${date}`;
    const monthS = month < 10 ? `0${month}` : `${month}`;

    const dateString = `${year}-${monthS}-${dateS}`;
    return dateString;
};

export const getDayStart = (dt?: Date) => {
    dt = dt || new Date();
    const today = new Date(dt.setUTCHours(0, 0, 0, 0));
    return today;
};

export const getDayEnd = (dt?: Date) => {
    dt = dt || new Date();
    const dayEnd = new Date(dt.setUTCHours(23, 59, 59, 999));
    return dayEnd;
};

export const isPrimitive = (test: any) => {
    return test !== Object(test);
};

export const isPlainObj = (o: any) => {
    let result = o && Object.prototype.hasOwnProperty.call(o, 'isPrototypeOf');
    result = Boolean(result);
    return result;
  };

export const flattenObj = (obj: any, keys: string[] = []): any => {
    return Object.keys(obj).reduce((acc, key) => {
        const val = obj[key];
        const check = isPlainObj(val) || (!isPrimitive(val)) && !Array.isArray(val);
        return Object.assign(acc, check
            ? flattenObj(obj[key], keys.concat(key))
            : { [keys.concat(key).join(".")]: obj[key] }
        );
    }, {});
};


export const inject = (str: string, obj: any) => str.replace(/\${(.*?)}/g, (x, g) => obj[g]);

export const genRandomHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

export const extractFields = <T>(o: T, data: any): T => {
    if (!data) {
        return o;
    }
    const obj = o as any;
    for (const k of Object.keys(obj)) {
        if (data[k] === null && data[k] === undefined) {
            continue;
        }
        const val = data[k];
        const myval = obj[k];
        if (isPlainObj(myval)) {
            const res = extractFields(myval, val);
            obj[k] = res;
            continue;
        }
        obj[k] = data[k];
    }
    obj.id = obj._id || obj.id;
    o = obj;
    return o;
};

export const isString = (o: any) => {
    const result = typeof o === "string" || o instanceof String;
    return result;
};

export const checkParams = (param: any, item: any): boolean => {
    const condKeys = Object.keys(param);
    for (const k of condKeys) {
        const itemVal = item[k];
        const condVal = param[k];
        if (itemVal === undefined || itemVal === null) {
            continue;
        }
        if (!(itemVal === condVal)) {
            return false;
        }
    }
    return true;
};

export const checkParamDeep = (param: any, item: any): boolean => {
    const condKeys = Object.keys(param);
    let res = true;
    for (const k of condKeys) {
        let itemVal = item[k];
        let condVal = param[k];

        if (itemVal === undefined || itemVal === null) {
            continue;
        }
        if (isString(condVal)) {
            if (condVal === "") {
                continue;
            }
            itemVal = String(itemVal);
            itemVal = itemVal.toLowerCase();
            condVal = condVal.toLowerCase();
            res = res && itemVal.includes(condVal);
            continue;
        }
        if (condVal instanceof Array) {
            if (condVal.length === 0) {
                continue;
            }
            condVal = condVal.map((item) => String(item).toLowerCase());
            if (!(itemVal instanceof Array)) {
                itemVal = String(itemVal);
                itemVal = itemVal.toLowerCase();
                res = res && condVal.includes(itemVal);
                continue;
            }
            let any = false;
            for (let v of itemVal) {
                v = String(v);
                v = v.toLowerCase();
                any = any || condVal.includes(v);
            }

            res = res && any;
            continue;
        }
        if (!(itemVal === condVal)) {
            res = res && false;
            continue;
        }
    }
    return res;
};

export const genRandomFourDigitCode = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

export const genRandomDigitCode = (n: number): string => {
    const add = 1;
    let max: number = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   

    if (n > max) {
        return genRandomDigitCode(max) + genRandomDigitCode(n - max);
    }

    max = Math.pow(10, n + add);
    const min = max / 10; // Math.pow(10, n) basically
    const number = Math.floor(Math.random() * (max - min + 1)) + min;

    return ("" + number).substring(add);
};

export const generateHash = (targetLength: number): string => {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < targetLength; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

export function stringToEnum<T>(name: string, e: T): T[keyof T] {
    const values = Object.values(e).map(item => String(item));
    const keys = Object.keys(e);
    if (!keys.includes(name)) {
        throw new Error(`Name '${name}' not found in enum keys, possible values: ${keys}`);
    }
    const p = e[name as keyof typeof e];
    return p;
}

/**
 * It will extract specific keys from object. If no specific found it will return null value for that key
 * @param dataObject Object from which the data wil be extracted
 * @param keyArray Array of keys that need to be extracted
 * @returns New object which contain values. If no specific found it will return null value for that key
 */
export const extractDataFromObject = (dataObject: Record<string, any>, keyArray: string[]): Record<string, any> => {
    const newData: Record<string, any> = {};
    keyArray.map((key: string) => (newData[key] = dataObject[key] ? dataObject[key] : null));
    return newData;
};

export const generateOTP = () => {
    // Declare a string variable which stores all string
    const string = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let OTP = "";

    // Find the length of string
    const len = string.length;
    for (let i = 0; i < 6; i++) {
        OTP += string[Math.floor(Math.random() * len)];
    }
    return OTP;
};

export const emailValidation = (email: string) => {
    // eslint-disable-next-line no-useless-escape
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

export function getEnumKeyByEnumValue<T extends { [index: string]: string }>(enumValue: string, myEnum: T): keyof T | null {
    const keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
    return keys.length > 0 ? keys[0] : null;
}