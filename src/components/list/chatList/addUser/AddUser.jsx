import "./addUser.css"
const AddUser = () => {
    return (
        <div className="adduser">
            <form action="">
                <input type="text" placeholder="Username" name="username" />
                <button>Search</button>
            </form>
            <div className="user">
                <div className="detail">
                    <img src="./avatar.png" alt="" />
                    <span>Ali Randhawa</span>
                </div>
                <button>Add</button>
            </div>
        </div>
    )
}

export default AddUser