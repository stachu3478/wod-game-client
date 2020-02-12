/**
 * Creates fast mixin in the current prototype so this can be extended by another classes to bind all arguments to this
 * @param {Object} props - arguments of the object that need to be mixed in 
 */
function Mixer (props) {
    for (let i in props) {
        this[i] = props[i]
    }
}

export default Mixer