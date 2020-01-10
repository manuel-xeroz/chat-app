const socket = io();

// document.querySelector('#increment').addEventListener('click', () => {
//     socket.emit('increment');
// })

const $messages = document.querySelector('#messages');
const messageTemplate = document.querySelector('#message-template').innerHTML;
const message2Template = document.querySelector('#message2-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML;
const location2Template = document.querySelector('#location2-template').innerHTML;
const userTemplate = document.querySelector('#users-template').innerHTML;
const usernameTemplate = document.querySelector('#username-template').innerHTML;

const x = Qs.parse(location.search, { ignoreQueryPrefix: true})
const username = x.username.toLowerCase();
const room = x.room;

const autoScroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild;

    //height of the  new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //get the visible height
    const visibleHeight = $messages.offsetHeight

    //height of message container
    const contentHeight = $messages.scrollHeight

    //how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(contentHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = contentHeight
    }
}

socket.on('message', (word) => {
    console.log(word.username)
    console.log(username)
        if (word.username !== username || word.username === 'Admin') {
            const html = Mustache.render(messageTemplate, {
                word: word.text,
                createdAt: moment(word.createdAt).format('h:mm a'),
                username: word.username
            });
            $messages.insertAdjacentHTML('beforeend', html);
            autoScroll();
        } else if (word.username === username) {
            const html = Mustache.render(message2Template, {
                word: word.text,
                createdAt: moment(word.createdAt).format('h:mm a'),
                username: word.username
            });
            $messages.insertAdjacentHTML('beforeend', html);
            autoScroll();
        }
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(userTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('username', (user) => {
    const html = Mustache.render(usernameTemplate, {
        username: user
    })
    document.querySelector('#heading-user').insertAdjacentHTML('beforeend', html)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault();

    document.querySelector('button').setAttribute('disabled', 'disabled')
    const word = document.querySelector('#word').value;
    socket.emit('sendMessage', word, (error) => {
        document.querySelector('button').removeAttribute('disabled');
        document.querySelector('#word').value = '';
        document.querySelector('#word').focus();
        if (error) {
            return console.log(error)
        }
        console.log('Message delivered')
    })  
})


document.getElementById('share-location').addEventListener('click', () => {
    if(!navigator.geolocation) {
        return
    }

    document.getElementById('share-location').setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, () => {
            document.getElementById('share-location').removeAttribute('disabled')
            console.log('location shared')
        })
    })
    document.querySelector('#word').focus();
})

socket.on('locate', (pos) => {
    console.log(pos)
    if(pos.username !== username) {
        const html = Mustache.render(locationTemplate, {
            pos: pos.url,
            createdAt: moment(pos.createdAt).format('h:mm a'),
            username: pos.username
        })
        $messages.insertAdjacentHTML('beforeend', html);
        autoScroll();
    } else if(pos.username === username) {
        const html = Mustache.render(location2Template, {
            pos: pos.url,
            createdAt: moment(pos.createdAt).format('h:mm a'),
            username: pos.username
        })
        $messages.insertAdjacentHTML('beforeend', html);
        autoScroll();
    }
    
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/';
    }
})


