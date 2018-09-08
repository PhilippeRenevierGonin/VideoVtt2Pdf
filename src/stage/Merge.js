
class Merge extends Stage {



    /**
     *
     * @param ctrl instanceof Controler
     * @param vttS must have getSubTitles() + getWidth() + getHeight()
     */
    constructor(ctrl, vttS) {
        super(ctrl);
        this.subSource = vttS;
    }

    getHtml() {
        if (this.section == null) {
            this.section = document.createElement("section");
            this.section.innerHTML = "<select><option value='none'>no merging</option><option value='auto'>automatic merging</option><option value='manual'>manual merging</option></select><button>validate</button>";
        }
        return this.section;
    }

    start() {
        this.subTitles = this.subSource.getSubTitles();
        this.width = this.subSource.getWidth();
        this.height = this.subSource.getHeight();
        if (this.section == null) {
            super.start();
        }
        else {
            let button = this.section.querySelector('button');
            button.addEventListener('click', () => {
                let s = this.section.querySelector("select");
                switch (s.value) {
                    case "auto" :
                        this.section.innerHTML = "auto merging...";
                        this.mergeDiff();
                        break;
                    case "manual" :
                        this.section.innerHTML = "manual merging";
                        this.mergeManually();
                        break;
                    default:
                    case "none":
                        this.section.innerHTML = "No merge";
                        this.noMerge();
                        break;
                }

            });
        }

    }

    finish() {
        if (this.mergeIntraBtn) {
            this.mergeIntraBtn.disabled = true;
            this.keepLastBtn.disabled = true;
            this.mergeInterBtn.disabled = true;
            this.nextStage.disabled = true;
        }
    }




    noMerge() {
        this.ctrl.finishingStage(this);
    }


    mergeManually() {
        this.section.innerHTML = "<nav><button>next stage</button><br />" +
            "<span>current subtitle : 0</span><br />"+
            "<button>previous subtitle</button><button>next subtitle</button></nav>"+
            "<nav><button>keep first image</button><button>keep last image</button><button>merge with the following sub</button></nav>"+
            "<article></article>";
        this.currentSubtitle = 0;

        this.nextStage = this.section.querySelector("nav > button");
        this.nextStage.addEventListener("click", () => this.ctrl.finishingStage(this));

        this.span = this.section.querySelector("nav > span");


        this.previousSub = this.section.querySelector("nav > button ~ button");
        this.previousSub.addEventListener("click", () => this.previous());
        this.previousSub.disabled = true;

        this.nextSub = this.section.querySelector("nav > button ~ button ~ button");
        this.nextSub.addEventListener("click", () => this.next());

        this.mergeIntraBtn = this.section.querySelector("nav + nav > button");
        this.mergeIntraBtn.addEventListener("click", () => {
            this.intraMerge(this.currentSubtitle);
            this.showPreview();
        });


        this.keepLastBtn = this.section.querySelector("nav + nav > button + button");
        this.keepLastBtn.addEventListener("click", () => {
            this.keepLast(this.currentSubtitle);
            this.showPreview();
        });

        this.mergeInterBtn = this.section.querySelector("nav + nav > button + button + button");
        this.mergeInterBtn.addEventListener("click", () => {
            this.interMerge(this.currentSubtitle);
            this.showPreview();
        });

        this.preview = this.section.querySelector("article");

        this.showPreview();
    }

    showPreview() {
        this.span.innerHTML = "current subtitle : "+this.currentSubtitle;
        this.preview.innerHTML = this.subToHtml(this.currentSubtitle);
        if (this.currentSubtitle < this.subTitles.length-1) {
            this.preview.innerHTML += this.subToHtml(this.currentSubtitle+1);
        }
    }

    previous() {
        if (this.currentSubtitle > 0) {
            this.currentSubtitle -= 1;
            this.showPreview();
            if (this.currentSubtitle == 0) this.previousSub.disabled = true;
            if (this.currentSubtitle < this.subTitles.length-1) this.nextSub.disabled = false;

        }
    }

    next() {
        if (this.currentSubtitle < this.subTitles.length-1) {
            this.currentSubtitle += 1;
            this.showPreview();
            if (this.currentSubtitle > 0) this.previousSub.disabled = false;
            if (this.currentSubtitle == this.subTitles.length-1) this.nextSub.disabled = true;

        }
    }



    mergeDiff() {

        let length = this.subTitles.length;
        const threshold = {threshold: 0.05, margin: 0.00001}; // @todo savoir le bruit moyen de deux images identiques ?
        Logger.log(this.width + " / "+this.height+" "+JSON.stringify(threshold));

        const diffMax = 100;

        for(let i = length-1; i >= 0; i--) {

            this.section.innerHTML = "looking for merging images of subtitle "+i+"";
            Logger.log(this.section.innerHTML);


            let s = this.subTitles[i];
            // if (s.getFirstImage() == s.getLastImage()) {
            let equal = pixelmatch(s.getFirstRawImage().data, s.getLastRawImage().data, this.width, this.height, threshold);
            Logger.log("equal = "+equal);
            if (equal < diffMax) {
                this.intraMerge(i);
            }

            if (i < length-1) {

                this.section.innerHTML = "looking for merging subtitles "+i+" and "+(i+1);
                Logger.log(this.section.innerHTML);

                // if (s.getFirstImage() == this.subTitles[i+1].getFirstImage()) {
                equal = pixelmatch(s.getFirstRawImage().data, this.subTitles[i+1].getFirstRawImage().data, this.width, this.height, threshold);
                Logger.log("equal 2 = "+equal);
                if (equal < diffMax) {
                    this.interMerge(i);
                }
                else if ((this.subTitles[i+1].getNbImage() == 1) && (s.getNbImage() == 2)) {
                    equal = pixelmatch(s.getLastRawImage().data, this.subTitles[i+1].getFirstRawImage().data, this.width, this.height, threshold);
                    Logger.log("equal 3 = "+equal);

                    // code duplication to not make image comparison if not required
                    if (equal < diffMax) {
                        this.interMerge(i);
                    }
                }
                else {
                    Logger.log("equal 4 = "+equal);
                }


            }
        }

        this.ctrl.finishingStage(this);
    }


    intraMerge(i) {
        this.subTitles[i].removeLastImage();
    }

    keepLast(i) {
        this.subTitles[i].keepLastImage();
    }

    interMerge(i) {
        this.subTitles[i].addText(this.subTitles[i+1].text);
        this.subTitles[i].end = this.subTitles[i+1].end;
        this.subTitles.splice(i+1, 1);
    }


    subToHtml(i) {
        let s = this.subTitles[i];
        let html = "<section>";
        html += "<p>"+s.text+"</p>";
        html += "<img width='200' src='"+s.getFirstImage()+"' />";
        if (s.getNbImage() == 2) {
            html += "<img width='200' src='"+s.getLastImage()+"' />";
        }
        html += "</section>";
        return html;
    }


    getSubTitles() {
        return this.subTitles;
    }


}