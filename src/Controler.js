class Controler {



    constructor() {
        this.stages = [];
        this.currentStage = -1;
    }

    addStage(stage) {
        Logger.log("stage instanceof  Stage ? "+(stage instanceof  Stage));
        if (stage instanceof  Stage) {
            this.stages.push(stage);
        }
        else {
            Logger.err("the parameter of addStage is not a Stage");
        }
    }


    finishingStage(stage) {
        stage.finish();
        this.nextStage();
    }

    addSection() {
        let stage = this.stages[this.currentStage];
        let section = stage.getHtml();
        if (this.currentStage > 0) {
            document.body.insertBefore(section, this.stages[this.currentStage-1].getHtml());
        }
        else {
            document.body.appendChild(section);
        }

        // +2 because of first stage is stage 1 not stage 0 and value is minus one on each section
        document.body.style.counterReset = "numsec "+(this.currentStage+2);
        return stage;
    }

    nextStage() {
        // on avance
        Logger.log("going to the next step "+this.currentStage+"/"+this.stages.length);
        if (this.currentStage < this.stages.length) {
            this.currentStage += 1;
        }
        // si on est trop loin, on ne fait plus rien tant qu'il n'y a pas de nouvelle étape
        if (this.currentStage < this.stages.length) {
            Logger.log("starting the current step");


            let stage = this.addSection();



            stage.start();
        }
    }
}



document.addEventListener("DOMContentLoaded", () => {
   let ctrl= new Controler();
   let videoL = new VideoLoader(ctrl);
   let vttL = new VttLoader(ctrl);
   let imageGrabber = new ImageGrabber(ctrl, videoL, vttL);
   let pdf = new PDFGenerator(ctrl, imageGrabber, videoL);
   ctrl.addStage(videoL);
   ctrl.addStage(vttL);
   ctrl.addStage(imageGrabber);
   ctrl.addStage(pdf);
   ctrl.nextStage();
});