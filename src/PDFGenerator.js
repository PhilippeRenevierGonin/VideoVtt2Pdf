class PDFGenerator extends Stage {

    /**
     *
     * @param ctrl instanceof Controler
     * @param subSource instanceof ImageGrabber
     * @param videoSource instanceof VideoLoader
     */
    constructor(ctrl, subSource, videoSource) {
        super(ctrl);
        this.subSource = subSource;
        this.videoSource = videoSource;
        this.cover = "";
    }

    getHtml() {
        if (this.section == null) {
            this.section = document.createElement("section");
            this.section.innerHTML = "<input type='text' placeholder='pdf file name' /><button>validate</button>\n";


        }
        return this.section;
    }

    start() {
        if (this.section !=  null) {
            let button = this.section.querySelector('button');
            button.addEventListener('click', () => {
                let input = this.section.querySelector('input');
                this.filename = input.value.trim();
                if (this.filename != "") {
                    this.section.innerHTML = "";
                    this.exportPdf();
                }
            });
        }
        else {
            super.start();
        }
    }

    exportPdf() {
        this.subTitles = this.subSource.getSubTitles();
        if (this.section == null) {
            super.start();
        }

        // the first 5 seconds are a cover (credits). No risk, grabbin at 0.1sec
        this.videoSource.getImage(0.1, (v) => {
            this.cover = this.videoSource.extractImage(v)[0];
            this.generating();
        });


    }

    finish() {
    }


    generating() {
        const h = 29.7;
        const w = 21;

        const marge = 0.5;
        const wi = 10;
        const hi = 5.625;
        const offset = 13.85;

        const fontSize = 12;


        let doc = new jsPDF({
            orientation: 'portrait',
            unit: "cm",
            format: [w, h]
        })

        doc.setFont('Helvetica', '');
        doc.setFontSize(fontSize);

        // cover
        doc.addImage(this.subTitles[0].getFirstImage(), VideoLoader.TYPE, 0, 0, w, h/2);
        doc.addImage(this.cover, VideoLoader.TYPE, 0, h/2, w, h/2);

        // if odd, ceil make +1 and if even, ceil is equal. + 2 covers, so +1 if odd  and +2 if even
        let nbPages = Math.ceil(this.subTitles.length/2)+2-(this.subTitles.length%2);

        // pour les pages
        for(let i = 0 ; i < this.subTitles.length; i++) {
        // for(let i = 0 ; i < 3; i++) {

            this.section.innerHTML = "generating pdf... page : "+(i/2+1)+"\n";
            Logger.log(this.section.innerHTML);
w

            let top = offset;
            if (i %2 == 0) {
                doc.addPage();
                // ajout des pieds de page

                doc.setFontSize(fontSize/1.5);
                doc.setTextColor(150);

                doc.text(marge, h-marge, this.filename);
                let n = Math.ceil(i/2)+2; // +1 for the cover and +1 because i starts from 0
                doc.text(w-marge*3, h-marge, ""+n+" / "+nbPages );


                doc.setTextColor(0);
                doc.setFontSize(fontSize);

                // coord
                top = 0;
            }

            doc.addImage(this.subTitles[i].getFirstImage(), VideoLoader.TYPE, marge, top+marge, wi, hi);
            if (this.subTitles[i].getNbImage() == 2) {
                doc.addImage(this.subTitles[i].getLastImage(), VideoLoader.TYPE, marge, top+marge+hi+marge, wi, hi);
            }

            let lines = doc.splitTextToSize(this.subTitles[i].text, 9.5);
            doc.text(marge+wi+marge, top+marge*2, lines); // marge*2, pour hauteur de ligne... en attendant mieux
        }

        // cover
        doc.addImage(this.subTitles[0].getFirstImage(), VideoLoader.TYPE, 0, 0, w, h/2);
        doc.addImage(this.cover, VideoLoader.TYPE, 0, h/2, w, h/2);

        doc.save(this.filename+'.pdf');

        this.ctrl.finishingStage(this);
    }



}