export class Token {
    public key: string;
    public count: number = 1;
    public url: string;
    constructor(key, url = "") {
        this.key = key;
        this.url = url;
    }
}
