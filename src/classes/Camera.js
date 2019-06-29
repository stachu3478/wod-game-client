/**
 * The viewport to the game main tile map
 */
class Camera {
    /**
     * Creates new viewport
     * @param {HTMLCanvasElement} canvas - A canvas element to use.
     * Its width and height is used to clip the scrolling area.
     * If not given creates new canvas by default.
     * @param {Number} x - Initial scrolling {@link Camera@x} position. Default: 0.
     * @param {Number} y - Initial scrilling {@link Camera@y} position. Default: 0.
     * @param {Number} minX - Initial {@link Camera#minX}. Defaults to -100.
     * @param {Number} maxX - Initial {@link Camera#minX}. Defaults to 100.
     * @param {Number} minY - Initial {@link Camera#minX}. Defaults to -100.
     * @param {Number} maxY - Initial {@link Camera#minX}. Defaults to 100.
     */
    constructor (canvas = document.createElement('canvas'), x = 0, y = 0, minX = -100, maxX = 100, minY = -100, maxY = 100) {
        /** Minimum X reachable at the viewport. */
        this.clipMinX = minX
        /** Maximum X reachable at the viewport. */
        this.clipMaxX = maxX
        /** Minimum Y reachable at the viewport. */
        this.clipMinY = minY
        /** Maximum Y reachable at the viewport. */
        this.clipMaxY = maxY
        /** Current camera left edge position */
        this.x = x
        /** Current camera top edge position */
        this.y = y

        /** Canvas element to use for scrolling */
        this.canvas = canvas
    }

    /**
     * Function to apply scrolling for specified keys pressed
     * @param {Object} pressed - An object containing list of pressed keys by a name of the pressed key => bool (eg. .ArrowUp = true)
     * @returns {Object} - {x, y} - Amount by dimensions, how many pixels were scrolled
     */
    processScroll (pressed) {
        let x = 0, y = 0;
		if (pressed.w || pressed.ArrowUp) {
			y = -8;
		} else if (pressed.s || pressed.ArrowDown) {
			y = 8;
		}
		if (pressed.d || pressed.ArrowRight) {
			x = 8;
		} else if (pressed.a || pressed.ArrowLeft) {
			x = -8;
		}
		return this.scrollBy(x, y);
    }

    /**
     * Moves camera by dimensions.
     * @param {Number} x - Amount of x to scroll.
     * @param {Number} y - Amount of y to scroll.
     * @returns {Object} - {x, y} - Amount of pixels scrolled by dimension (due to limited scrolling values may vary of arguments).
     */
    scrollBy (x, y) {
        const v1 = this.x, v2 = this.y
        this.x += x
        this.y += y
        this.valiScroll()
        return {x: this.x - v1, y: this.y - v2}
    }

    /**
     * Moves camera (top-left corner by default) to specific position.
     * @param {Number} x - X to set.
     * @param {Number} y - Y to set.
     * @param {Boolean} center - A switch to tell set position of center of camera instead of top-left corner.
     */
    scrollTo (x, y, center = false) {
        this.x = x - (center && this.canvas.width >> 1)
        this.y = y - (center && this.canvas.height >> 1)
        this.valiScroll()
    }

    /**
     * Checks, if the camera position is right in clipping limits.
     */
    valiScroll () {
        if (this.x < this.clipMinX)
            this.x = this.clipMinX;
        else if (this.x > this.clipMaxX - this.canvas.width)
            this.x = this.clipMaxX - this.canvas.width;
        
        if (this.y < this.clipMinY)
            this.y = this.clipMinY;
        else if (this.y > this.clipMaxY - this.canvas.height)
            this.y = this.clipMaxY - this.canvas.height;
    }

    /**
     * Extends the camera clip if needed for a given point to be seen.
     * @param {Number} x - Point x.
     * @param {Number} y - Point y.
     */
    clip (x, y) {
        if (this.clipMinX > x) this.clipMinX = x;
		if (this.clipMinY > y) this.clipMinY = y;
		if (this.clipMaxX < x) this.clipMaxX = x;
		if (this.clipMaxY < y) this.clipMaxY = y;
    }

    /**
     * Resets the camera clip.
     * There are needed at least two new clips {@link Camera@clip} applied after calling this function
     * to make any resolution in clipping area.
     */
    clearClip () {
        this.clipMinX = this.clipMinY = Infinity;
	    this.clipMaxX = this.clipMaxY = -Infinity;
    }
}

export default Camera