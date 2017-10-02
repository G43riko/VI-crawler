export class MessageHandler {

    public static sendMessage(res, data) {
        res.send(JSON.stringify({
            data,
            error: "",
        }));
    }
    public static sendError(res, error) {
        res.send(JSON.stringify({
            error,
        }));
    }
}
