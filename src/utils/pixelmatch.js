/**
 * grosse simplification de :
 * https://github.com/mapbox/pixelmatch/blob/master/index.js
 * https://raw.githubusercontent.com/mapbox/pixelmatch/master/index.js
 */

function pixelmatch(img1, img2, width, height, options) {


    if (!options) options = {};

    let threshold = options.threshold === undefined ? 10 : options.threshold;
    let margin = options.margin === undefined ? 0.00001 : options.margin;

    margin = height*width*margin;


    let diff = 0;

    // compare each pixel of one image against the other one
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            let pos = (y * width + x) * 4;

            let delta = colorDelta(img1, img2, pos);

            // the color difference is above the threshold
            if (delta > threshold) {

                    diff++;
                }

            }

    }

    // return true is equal...
    return (diff < margin);
}


function colorDelta(img1, img2, k) {
    let r1 = img1.data[k + 0],
        g1 = img1.data[k + 1],
        b1 = img1.data[k + 2],

        r2 = img2.data[k + 0],
        g2 = img2.data[k + 1],
        b2 = img2.data[k + 2];


    return Math.abs(r1-r2)+Math.abs(g1-g2)+Math.abs(b1-b2);
}



