export class FileManager {
    private _input;
    private _link;
    private _doc;

    constructor(doc = document) {
        this._doc = doc;
        this._input = this._doc.createElement("input");
        this._input.setAttribute("type", "file");
        this._input.setAttribute("value", "files");
        this._input.setAttribute("class", "hide");

        this._link = this._doc.createElement("a");
        this._link.setAttribute("class", "hide");
        this._link.setAttribute("href", "");
    }

    public saveFile(name, text, type = "text/plain") {
        this._link.href = URL.createObjectURL(new Blob([text], {type}));
        this._link.download = name;
        this._link.click();
    }

    public saveImage(name, image) {
        this._link.href = typeof image === "string" ? image : image.src;
        this._link.download = name;
        this._link.click();
    }

    public loadImage(func) {
        this._input.onchange = (e) => {
            const reader = new FileReader();
            reader.onload = () => {
                const image = new Image();
                image.src = reader.result;
                func(image);
            };
            reader.readAsDataURL(e.target.files[0]);
        };
        this._input.click();
    }

    public loadImage2(func) {
        this._input.onchange = (event) => {
        const reader = new FileReader();
        const files = event.target.files;
        if (files.length > 0) {
            reader.onload = (file) => {
            const image = new Image();
            image.src = reader.result;
            func(image, files[0].name);
            };
            reader.readAsDataURL(files[0]);
        }
        };
        this._input.click();
    }

    public loadFile(func) {
        this._input.onchange = (e) => {
            const reader = new FileReader();
            reader.onload = () => func(reader.result);
            reader.readAsText(e.target.files[0]);
        };
        this._input.click();
    }
}
