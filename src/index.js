import './App'
import './components/SecondaryWindow'
import './components/iScroll'

/*function component() {
    const element = document.createElement('div');
    const span = document.createElement('span')
    const button = document.createElement('button')
    button.innerText = 'Click me to connect'
    button.onclick = evt => {
        span.innerText += '\nUpdating interface...';
        import('./client').then(mod => {
            const Client = mod.default;
            const client = new Client('http://wodgame.herokuapp.com', span)
        })
    }

    element.appendChild(span)
    element.appendChild(button)
  
    span.innerText = ['Hello', 'webpack','!'].join(' ');
    return element;
}*/
  
// document.body.appendChild(component());

if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}