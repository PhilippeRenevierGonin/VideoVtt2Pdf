class VttLoader extends Stage {

    /**
     *
     * @param ctrl instanceof Controler
     */
    constructor(ctrl) {
        super(ctrl);
        this.subTitles = [];
    }

    getHtml() {
        if (this.section == null) {
            this.section = document.createElement("section");
            this.section.innerHTML = "<input type=\"file\" accept=\".vtt\"/><br /><textarea style='width:400px;height:225px;overflow:auto' readonly='readonly'></textarea>\n"
        }
        return this.section;
    }

    start() {
        this.subTitles = [];
        if (this.section != null) {
            this.inputNode = this.section.querySelector('input');
            this.inputNode.disabled  = false; // in case of restart
            this.listener = (inputEvent) => this.load(inputEvent)
            this.inputNode.addEventListener('change', this.listener);
        }
        else {
            super.start();
        }
    }

    finish() {
        if (this.inputNode) {
            this.inputNode.removeEventListener('change', this.listener);
            this.inputNode.disabled  = true;

        }
    }


    load(inputEvent) {
        let file = inputEvent.target.files[0];

        if (!file) {
            Logger.err("trouble with charging the vtt file");
            return;
        }

        let reader = new FileReader();
        reader.onload = (e) => {
            let contents = e.target.result;
            // contents contient le contenu du fichier, format String, avec des \n...
            this.parseVtt(contents);
        };

        reader.readAsText(file);
    }

    parseVtt(contents) {
        if (this.subTitles.length == 0) {
            this.section.querySelector("textarea").innerHTML = contents;
            let lines = contents.split("\n");

            let currentSubTitle = null;

            let regexTime = new RegExp(/^[0-9][0-9]:[0-5][0-9]:[0-5][0-9]\.[0-9][0-9][0-9]\s-->\s[0-9][0-9]:[0-5][0-9]:[0-5][0-9]\.[0-9][0-9][0-9]$/);
            let regexNumber = new RegExp(/^[0-9]*$/);
            lines.forEach((s) => {
                let line = s.trim();
                if (regexTime.test(line)) {
                    let de = line.split("-->");
                    currentSubTitle = new SubTitle(de[0], de[1]);
                    this.subTitles.push(currentSubTitle);
                }
                else if (line.startsWith("NOTE") || (line == "") || regexNumber.test(line)){
                    // do nothing
                }
                else {
                    // adding text to currentSubTitle
                    if (currentSubTitle) currentSubTitle.addText(line);
                }
            });
        }
        else {
            Logger.err("vtt already parsed");
        }

        Logger.dir(this.subTitles);
        this.ctrl.finishingStage(this);

    }

    getSubTitles() {
        return this.subTitles;
    }
}