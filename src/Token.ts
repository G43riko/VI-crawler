export class Token {
    key: string;
    count: number = 1;
    url: string;
    constructor(key, url = "") {
        this.key = key;
        this.url = url;
    }
}