{
    'use strict'
    // creates html box structure. As input, takes an object with properties:
    // text - required. Type = String. It is a message to display, default empty string;
    // callback - optional. Type = Function. It is a callback function that will be run after click event on                                             buttons. It takes one argument with decision data
    // style - optional. Type = Array. Contains arrays with style property name and value,
    // parent - optional. Type = HTML Element, Dom Node,  gdpr box will be placed in this element. Default: body
    // title - optiona. type = String. It is a title of the Gdpr Box. Default: 'GDPR consent'
    const createGDPRBox = ({ text, callback, style, parent, title, keyName }) => {

        const defaultWrapStyles = [['width', '600px'], ['height', '300px'], ['z-index', '9999'], ['position', 'fixed'], ['top', '50%'], ['left', '50%'], ['transform', 'translate(-50%,-50%)']]

        const mapStyles = (stylesArr) => {
            if (stylesArr.length > 0) {
                return "style=" + stylesArr.reduce((prev, current, i) => {
                    let text
                    if (i === 1) {
                        text = `${prev[0]}:${prev[1]};${current[0]}:${current[1]}`
                    } else {
                        text = `${prev};${current[0]}:${current[1]}`
                    }
                    return text
                })
            }
            return ""

        }

        const stylesString = (mapStyles(style ? style : defaultWrapStyles));
        const HTMLBox = `
            <div ${stylesString} id = "gdpr__box" class="gdpr__box" >
            <div class="gdpr__text--wrap">
                <h1 class="gdpr__title">${title ? title : 'GDPR consent'}</h1>
                <p  class="gdpr__text" >${text}</p>
            </div>
            <div class="gdpr__buttons">
                <button id="gdpr__btn--accept" class="gdpr__btn">Accept</button>
                <button id="gdpr__btn--cancel" class="gdpr__btn">Cancel</button>
            </div>
            </div >`

        parent ? parent.insertAdjacentHTML("afterbegin", HTMLBox) : document.body.insertAdjacentHTML("afterbegin", HTMLBox)

        const handleUserDecision = e => {
            e.stopPropagation()
            const key = keyName ? keyName : "userGdpr";
            if (e.target.classList.contains("gdpr__btn")) {
                switch (e.target.id) {
                    case 'gdpr__btn--accept':
                        const decisionAccept = setUserDecision('accept', key)
                        callback ? callback(decisionAccept) : null
                        break;
                    case "gdpr__btn--cancel":
                        const decisionCancel = setUserDecision('cancel', key)
                        callback ? callback(decisionCancel) : null
                        break;
                }

                e.currentTarget.remove()
            }

        }

        document.getElementById('gdpr__box').addEventListener('click', handleUserDecision)
    }

    // Save user decision in local storage. Creates a JSON string with decision and date property.
    const setUserDecision = (decision, keyName = "userGdpr") => {
        const data = { decision, date: new Date().getTime() }
        localStorage.setItem(keyName, JSON.stringify(data))
        return data
    }

    // get user decision from local storage and parse it to valid JavaScript Object.
    // Takes one argument, keyName
    const getUserDecision = (keyName = "userGdpr") => {
        const data = localStorage.getItem(keyName)
        if (data) {
            return JSON.parse(data)
        }
        return null
    }

    // Checks if the designated time has passed. Takes two arguments:
    // decisionTime - required. Type = "Number" it is last user decision date.
    // timeToPass- optional. Type = "Number" Time in ms, until the next user decision check. Defalt 24h.
    const isTimePassed = (decisionTime, timeToPass = 86400000) => {
        const actualTime = new Date().getTime()
        return actualTime - decisionTime >= timeToPass ? true : false
    }

    const gdprPlugin = ({ text, callback, style, parent, title, timeToPass, keyName }) => {
        const decision = getUserDecision(keyName);
        if (!decision || isTimePassed(decision.date, timeToPass)) {
            createGDPRBox({ text, callback, style, parent, title, keyName })
        }
    }
    const text = ' Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut id reiciendis reprehenderit nostrum dicta itaque cupiditate, voluptatem placeat suscipit maxime mollitia ducimus quia vel quis, porro quas dolorem voluptas at.Odit, deleniti optio aut et nisi quibusdam, quod omnis repudiandae culpa aliquid tempora saepe reiciendis obcaecati itaque, quaerat impedit. Soluta pariatur ex excepturi expedita reprehenderit vitae quibusdam assumenda nemo laboriosam!Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut id reiciendis reprehenderit nostrum dicta itaque cupiditate, voluptatem placeat suscipit maxime '
    const callback = (data) => {
        console.log(data);
    }
    gdprPlugin({ text, callback })
}