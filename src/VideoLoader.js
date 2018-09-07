class VideoLoader extends Stage {


    static get TYPE() {
        return "jpeg";
    }

    static get QUALITY() {
        return 0.5;
    }

    constructor(ctrl) {
        super(ctrl);
        this.canvas = null;
    }

    getHtml() {
        if (this.section == null) {
            this.section = document.createElement("section");
            this.section.innerHTML = "<input type=\"file\" accept=\"video/*\"/><br /><video controls=\"controls\" width='400'></video>\n"
        }
        return this.section;
    }

    start() {
        if (this.section !=  null) {
            this.inputNode = this.section.querySelector('input');
            this.inputNode.disabled  = false; // in case of restart
            this.listener = (inputEvent) => this.load(inputEvent)
            this.inputNode.addEventListener('change', this.listener );
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
        let type = file.type;
        let videoNode = this.section.querySelector('video');
        let canPlay = videoNode.canPlayType(type);

        if (canPlay === '') {
            Logger.err("Can't play type " + type);
            return ;
        }

        let fileURL = URL.createObjectURL(file)
        videoNode.src = fileURL

        this.ctrl.finishingStage(this);
    }



    getImage(time, call) {
        if (this.section) {
            let video = this.section.querySelector("video");
            let func =  () => {   video.removeEventListener("seeked", func) ;  call(video); } ;

            video.addEventListener("seeked", func);
            video.currentTime = time;
        }
        else {
            this.start() ; // throw error
        }

    }


    extractImage(v) {
        if (this.canvas == null) {
            this.canvas = document.createElement('canvas');

        }
        this.canvas.height = v.videoHeight;
        this.canvas.width = v.videoWidth;
        let ctx = this.canvas.getContext('2d');
        ctx.drawImage(v, 0, 0, this.canvas.width, this.canvas.height);

        let result = [];
        result.push(this.canvas.toDataURL("image/"+VideoLoader.TYPE, VideoLoader.QUALITY));
        result.push(ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));

        return result;
    }


}