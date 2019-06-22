const UpdateLog = (function() {
    let index = 0;
    const logs = [
        `<dl>
            <h3>We are back</h3>
            There was a lot of time where nothing has changed in the game.
            This is due to a hardly client code rewrite and split.
            We are coming with lots of features in this update.
            The source code of the client is now available on GitHub and everybody can now collaborate with us in order to
            make bug fixes and improve the gaming experience by creating issues or editing the code.
            Well here is the list of changes that we made.
            <ul>
                <li>Restored standard textures for meteors</li>
                <li>Meteors now fall in specific interval</li>
                <li>Replaced old audio engine with new Web Audio APi with left-right channel splitting for better sound effects</li>
                <li>The game is now using secure Web Socket for connecting to the server</li>
                <li>Added tutorial to the game, hopefully it will help you to know the basics</li>
                <li>Added texturepacks, the previously used pack is named "Retro", it is replaced by "Smooth"</li>
                <li>Added WOD'o'pedia, all the knowlegde about the game</li>
                <li>Huge changes in interface</li>
            </ul>
        </dl>`,
        `<dl>
            <h3>The easter update</h3>
            <ul>
                <li>Added falling meteors that make some explosion when fallen</li>
                <li>Meteors look like easter eggs</li>
                <li>Meteors will spawn an armored super-droid with great health and damage when destroyed</li>
                <li>Units can be deleted using 'x' on selected droids</li>
                <li>Added full controls list at the place of update log</li>
                <li>Fixed bug with fake radiation alert</li>
                <li>Chat layout optimization</li>
            </ul>
        </dl>`,
        `<dl>
            <h3>The radiation update</h3>
            <ul>
                <li>Restored experimental mining</li>
                <li>Larger map</li>
                <li>Getting out of safe area will cause radiation damage and alerts</li>
                <li>Some interface optimizations</li>
                <li>Better texture mapping</li>
                <li>Better chat navigation (Enter to chat, switch previous messages with arrows)</li>
                <li>Play button works (Use while not using an account)</li>
                <li>Chat auto-scroll</li>
                <li>Building buttons moved to the top of the screen</li>
                <li>Droid panel doesn't show while none of them selected</li>
                <li>Error fix</li>
            </ul>
        </dl>`,
        `<dl>
            <h3>Bug fix 0.8.6</h3>
            <ul>
                <li>Lots of code rewritten into OOP</li>
                <li>Data optimizations</li>
                <li>Filled up security holes</li>
                <li>The license has changed. The last version licensed with MIT is available <a href="https://github.com/stachu3478/world-of-droids-game">here</a><br />
                    <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode">Read more about the new license</a>
                </li>
                <li>High score tables can be displayed instantly after logging in</li>
                <li>Better menu layout (at least that first)</li>
                <li>Chat can be disabled</li>
                <li>Fixed strange bug when moving large amounts of droids</li>
                <li>Experimental rock mining is temporarily disabled</li>
            </ul>
        </dl>`,
        `<dl>
            <h3>The Re-factory Update 0.8</h3>
            <ul>
                <li>Added buildings that can be built using droids you have</li>
                <li>Droids can see only the specified range of the map</li>
                <li>High score tables</li>
                <li>Even more bugs</li>
            </ul>
        </dl>`,
        `<dl>
            <h3>Update 0.7</h3>
            <ul>
                <li>Some effects</li>
                <li>Bug fixes</li>
                <li>Some optimizations</li>
            </ul>
        </dl>`,
        `<dl>
            <h3>Update 0.6</h3>
            <ul>
                <li>Added register option</li>
                <li>Added /msg command</li>
                <li>Added update log (you just read this)</li>
            </ul>
        </dl>`,
    ];
    const setState = (idx, el) => {
        index = idx;
        UpdateLog(el);
    };
    const rootElement = document.getElementById('#updateLog');
    return el => {
        const element = el || document.createElement('div');
        element.innerHTML = `
            ${logs[index]}
            <section class="log-navigation">
                <button
                    ${index === 0 && 'disabled'}
                >
                    Previous
                </button>
                <button
                    ${index === logs.length - 1 && 'disabled'}
                >
                    Next
                </button>
            </section>
        `;
        element.children[1].children[0].onclick = () => setState(index - 1, element);
        element.children[1].children[1].onclick = () => setState(index + 1, element);
        return element;
    }
})();

const SecondaryWindow = (function() {
    const controls = `
        Select droids - Hold Mouse Left and drag an area
        Select single droid - click on
        Select/Deselect multiply - + control
        Select/Deselect all - Space bar
        Auto scroll to droid - click droid on left panel
        Scroll - W A S D or arrow keys
        Scroll by map - Hold mouse on point of the map
        Move units - click on place
        Attack - click on target
        Mine - click on rock
        Place building - select building from the top icons and click on the place
        Enable/Disable Map - M
        Enable/Disable Chat - C
        Remove selected units - X`;
    let index = 0;
    const setState = (idx, el) => {
        index = idx;
        SecondaryWindow(el);
    };
    return element => {
        element.innerHTML = `
            <nav>
                <button 
                    class = ${index === 0 ? 'active' : ''}
                >
                    Controls
                </button>
                <button 
                    class = ${index === 1 ? 'active' : ''}
                >
                    Update log
                </button>
            </nav>
            <section>
            
            </section>
        `;
        element.children[0].children[0].onclick = () => setState(0, element);
        element.children[0].children[1].onclick = () => setState(1, element);
        if (index === 1) element.children[1].appendChild(UpdateLog());
        else element.children[1].innerText = controls;
    }
})();

SecondaryWindow(document.getElementsByClassName("secondary-window")[0]);