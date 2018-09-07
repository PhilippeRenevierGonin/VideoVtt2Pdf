
class ImageGrabber extends Stage {



    /**
     *
     * @param ctrl instanceof Controler
     * @param sourceVideo must have getImage(time, call)
     * @param vttL must have getSubTitles()
     */
    constructor(ctrl, videolL, vttL) {
        super(ctrl);
        this.videoSource = videolL;
        this.subSource = vttL;
    }

    getHtml() {
        if (this.section == null) {
            this.section = document.createElement("section");
            this.section.innerHTML = "Collecting images\n";
        }
        return this.section;
    }

    start() {
        this.subTitles = this.subSource.getSubTitles();
        if (this.section == null) {
            super.start();
        }

        this.currentSub = 0;
        this.grabbingStart = true;
        this.grab();
    }

    finish() {
    }


    grab() {
        if (this.currentSub < this.subTitles.length) {
            let pageMsg = "first image";
            if (! this.grabbingStart) pageMsg = "second image";
            this.section.innerHTML = "grabbing image for "+this.currentSub+" ("+pageMsg+")";
            Logger.log(this.section.innerHTML);
            let time = 0;

            if (this.grabbingStart) time = this.subTitles[this.currentSub].begining;
            else time = this.subTitles[this.currentSub].end;

            this.videoSource.getImage(time, (v) => {

                this.width = v.videoWidth;
                this.height = v.videoHeight;

                let imgs = this.videoSource.extractImage(v);
                // imgs is a array for the same image: base64 and then raw
                this.subTitles[this.currentSub].addImage(imgs[0]);
                this.subTitles[this.currentSub].addRawImage(imgs[1]);
                this.grabbingStart = ! this.grabbingStart;
                if (this.grabbingStart) {
                    this.currentSub++;
                }
                this.grab();
            } );
        }
        else {
            this.section.innerHTML = "grabbing is finished, now merging";
            Logger.log(this.section.innerHTML);
            this.merge();
        }

    }

    merge() {
        let length = this.subTitles.length;
        Logger.log(this.width + " / "+this.height);
        const threshold = {threshold: 20, margin: 0.001}; // @todo savoir le bruit moyen de deux images identiques ?

        for(let i = length-1; i >= 0; i--) {

            this.section.innerHTML = "looking for merging images of subtitle "+i+"";
            Logger.log(this.section.innerHTML);


            let s = this.subTitles[i];
            // if (s.getFirstImage() == s.getLastImage()) {
            let equal = pixelmatch(s.getFirstRawImage(), s.getLastRawImage(), this.width, this.height, threshold);
            Logger.log("equal = "+equal);
            if (equal) {
                s.removeLastImage();
            }

            if (i < length-1) {

                this.section.innerHTML = "looking for merging subtitles "+i+" and "+(i+1);
                Logger.log(this.section.innerHTML);


                // if (s.getFirstImage() == this.subTitles[i+1].getFirstImage()) {
                equal = pixelmatch(s.getFirstRawImage(), this.subTitles[i+1].getFirstRawImage(), this.width, this.height, threshold);
                if (equal) {
                    s.addText(this.subTitles[i+1].text);
                    this.subTitles.splice(i+1, 1);
                }
            }
        }

        this.ctrl.finishingStage(this);
    }


    getSubTitles() {
        return this.subTitles;
    }


}