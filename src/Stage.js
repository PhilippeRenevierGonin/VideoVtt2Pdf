class Stage {

    constructor(ctrl) {
        this.ctrl = ctrl;
        this.section = null;
    }

    getHtml() {}

    start() {
        Logger.err("First, let place the html, calling getHtml()");
        throw new Error("First, let place the html, calling getHtml()");
    }

    finish() {}
}
