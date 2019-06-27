import App from './App'
import { SecondaryWindow } from './components/SecondaryWindow'
import iScroll from './components/iScroll'

App();
SecondaryWindow(document.getElementsByClassName("secondary-window")[0]);
iScroll();

if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}