class Logger {


    static get CONSOLE() {
        return true;
    }

    static log(msg) {
        if (Logger.CONSOLE) console.log(msg);
    }

    static err(msg) {
        if (Logger.CONSOLE) console.error(msg);
    }

    static dir(obj) {
        if (Logger.CONSOLE) console.dir(obj);
    }
}