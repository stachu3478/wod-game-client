/*  This is small framework for loading all images and emitting resolve then
*   This could be made as Promise.all bundle
*/

let loading = 0;
let maxLoading = 0;
let fetching = false;
let resolveFunc = () => {
    console.log('Invalid function')
}
function incl () {
    if(++loading === maxLoading && fetching) {
        resolveFunc()
        console.log('Done loading')
    }
}

class LoadableImage {
    constructor(src) {
        let img = new Image();
        img.onload = incl;
        img.src = src;
        maxLoading++;
        return img;
    }

    incl () {
        if(++loading === maxLoading) {
            init();
            let interVal = setInterval(function() {
                if (preinit) {
                    preinit();
                    clearInterval(interVal);
                }
            }, 100);
        }
    }

    resolve () {}

    static fetch () {
        fetching = true;
        return new Promise((resolve) => {
            if (loading === maxLoading) {
                resolve();
            } else resolveFunc = resolve;
        })
    }
}

export default LoadableImage