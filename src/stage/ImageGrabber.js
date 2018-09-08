
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
            this.ctrl.finishingStage(this);
        }

    }



    getSubTitles() {
        return this.subTitles;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }


}