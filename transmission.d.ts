declare module "transmission" {
    export default class Transmission {
        constructor(options: any);
        active(callback: any);
        addUrl(magnetUri: any, options: any, callback: any);
        get(callback: any);
    }
}