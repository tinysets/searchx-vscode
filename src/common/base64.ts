
export class Base64 {
    // 1. 将JSON转换为Base64
    public static jsonToBase64(jsonObj: object) {
        if (!jsonObj)
            return '';
        // 将JSON对象转换为字符串
        const jsonString = JSON.stringify(jsonObj);
        // 将字符串转换为Base64
        return Buffer.from(jsonString).toString('base64');
    }

    // 2. 将Base64转换回JSON
    public static base64ToJson(base64String: string) {
        if (!base64String)
            return null;
        // 将Base64字符串转换回普通字符串
        const jsonString = Buffer.from(base64String, 'base64').toString('utf-8');
        // 将字符串解析为JSON对象
        return JSON.parse(jsonString);
    }
}