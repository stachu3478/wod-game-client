class ElementSwitcher { // quick switch between elements show one, hide others
    constructor (elements) {
        this.current = 0;
        this.elements = new Array(...elements);

        this.switchTo(0);
    }

    switchTo (n) {
        if (this.current !== n) {
            this.elements.forEach((v, k) => {
                if (k === n) v.classList.remove('hidden') // the style class defines the hidden element
                else v.classList.add('hidden')
            });
            this.current = n;
        }
    }
}

export default ElementSwitcher