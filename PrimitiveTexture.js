/**
 * 
 * @param {number} width 
 * @param {number} height 
 * @param {Uint8Array} data 
 * @returns {Promise<HTMLImageElement>}
 */
export function createImage(width, height, data) {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    let imageData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imageData.data.length; i++) {
        imageData.data[i] = data[i];
    }

    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve, reject) => {
        let image = new Image();
        image.loading = "eager";
        image.src = canvas.toDataURL();
        image.onload = () => resolve(image);
        image.onerror = event => reject(event);
    });
}
