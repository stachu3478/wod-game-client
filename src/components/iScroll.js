// Adds light scrollbar (mouse wheel only) to chat

let scrollable = document.getElementsByClassName("scrollable");
let scrollbars = document.getElementsByClassName("scrollbar");
const updateScrollBar = (scrollable, scrollBar) => {
    const elementHeight = scrollable.offsetHeight;
    const barHeight = elementHeight / scrollable.scrollHeight;
    console.log(barHeight);
    scrollBar.children[0].style.height = barHeight * elementHeight + 'px';
    scrollBar.children[0].style.marginTop = (elementHeight * (1 - barHeight)) * (scrollable.scrollTop / (scrollable.scrollHeight - elementHeight)) + 'px';
};
const handleScroll = function(evt) {
    let target;
    for (let k of scrollable)
        if (evt.path.indexOf(k) > -1) {
            target = k;
            break;
        }
    if (target.classList.contains('chat-outer')) return
    let smooth = () => {
        target.scrollTop += evt.deltaY / 10;
    };
    this.children[0].classList.remove('scrollbar-handle')
    for (let i = 0; i < 10; i++) setTimeout(smooth, i * 20)
    setTimeout(() => this.children[0].classList.add('scrollbar-handle'), 200)
};
let n = 0;
function handleScrollBarUpdate(evt) {
    updateScrollBar(this.scrollable, this.scrollBar);
}

const iScroll = () => {
    for (let k of scrollable) {
        k.onmousewheel = handleScroll.bind(scrollbars[n]);
        k.onscroll = handleScrollBarUpdate.bind({scrollable: k, scrollBar: scrollbars[n++]});
    }
}

export default iScroll