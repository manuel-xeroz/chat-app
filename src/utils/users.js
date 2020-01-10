const users = [];

const addUser = ({ id, username, room }) => {
    if(id, username, room) {
        //clean the data
        if (username, room) {
            username = username.trim().toLowerCase();
            room = room.trim().toLowerCase();
        }
        
        const existingUser = users.find((user) => {
            return user.username === username && user.room === room
        })

        if (existingUser) {
            return {
                error: 'Username is already in use'
            }
        }

        const user = { id, username, room }
        users.push(user);
        return { user }
    }

    return {
        error: 'please provide the required fields ie. ID, Username, Room'
    }
}

const removeUser = (id) => {
    if(id) {
        const existingId = users.findIndex((user) => user.id === id)
        if (existingId !== -1) {
            return users.splice(existingId, 1)[0]
        }
    }
    
    return {
        error: 'please provide an ID'
    }
}

const getUser = (id) => {
    if(id) {
        const existingUser = users.find((user) => user.id === id)
        if (!existingUser) {
            return {
                error: 'there is no user with that ID'
            }
        }

        return existingUser;
    }
    
    return {
        error: 'please provide an ID'
    }
}

const getUsersInRoom = (room) => {
    if (room) {
        room = room.trim().toLowerCase();
        const existingRoom = users.filter((user) => user.room === room)
        if (!existingRoom) {
            return [];
        } 
        return existingRoom;
    }
    return {
        error: 'please provide a room'
    }
        
}

module.exports = {
    addUser,
    getUser,
    removeUser,
    getUsersInRoom
}