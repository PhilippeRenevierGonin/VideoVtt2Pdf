class SubTitle {

    static STRING2SECONDS(s) {
            // s : 00:00:00.000
        let hms = s.split(":");
        let sec = 0;
        sec = parseInt(hms[0])*3600+parseInt(hms[1])*60+parseFloat(hms[2]);
        return sec;
    }

    constructor(start, end) {
        this.begining = SubTitle.STRING2SECONDS(start);
        this.end = SubTitle.STRING2SECONDS(end);
        this.text ="";
        this.img = [];
        this.rawImg = [];
    }

    addText(txt) {
        if (this.text == "") this.text = txt;
        else this.text = this.text+" "+txt;
    }

    addImage(base64) {
        if (this.img.length < 2) {
            this.img.push(base64);
        }
        else {
            Logger.err("Only two images by subtitles (begining, end)");
        }
    }

    addRawImage(raw) {
        if ((this.img.length > this.rawImg.length) && (this.img.length <= 2)){
            this.rawImg.push(raw);
        }
        else {
            Logger.err("Only two images by subtitles (begining, end)");
        }
    }


    getNbImage() {
        return this.img.length;
    }

    getFirstImage() {
        if (this.img.length >0) return this.img[0];
        else return null;
    }

    getLastImage() {
        if (this.img.length >1) return this.img[1];
        else return null;
    }


    getFirstRawImage() {
        if (this.rawImg.length >0) return this.rawImg[0];
        else return null;
    }

    getLastRawImage() {
        if (this.rawImg.length >1) return this.rawImg[1];
        else return null;
    }


    removeFirstImage() {
        this.removeImage(0);
    }

    removeLastImage() {
        this.removeImage(1);
    }

    removeImage(i) {
        if (i < this.img.length) {
            this.img.splice(i, 1);
            if (i < this.rawImg.length) {
                this.rawImg.splice(i, 1);
            }
        }
    }
}