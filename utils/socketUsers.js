const users = [];

const addUser = ({ id, username }) => {
    //Clean the date 
    username = username.trim().toLowerCase();
    // room = room.trim().toLowerCase()

    //Validate the data
    if(!username) {
        return {
           error: 'Username required!' 
        }
    }

    //Checking for existing user
    const existingUser = users.find((user) => {
        return user.username === username;
    })

    //Validate username
    if(existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    //Store the user
    const user = { id, username }
    users.push(user)
    console.log(users);
    return { user }
}

const getUser = (email) => {
    console.log("From getUser ",users);
    return users.find((user) => user.username === email )
}

const getAllUsers = () => {
    return users;
}

const removeUser = (email) => {
    return users.filter( user  => user.username !== email )
    // const index = users.findIndex((user) => user.email === email)
    // console.log("from scoket remove" ,index);
    // if(index !== -1) {
    //     return users.splice(index, 1)[0]
    // }
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getAllUsers
}