import { useState } from 'react'
import NavBar from './navBar'

function RoleMaker(){
    const [clicked , setClicked] = useState(false)
    const [permArray , setPermArray] = useState([])
    let person = {
        name:"امیر",
        number:"09338666836"
    }
    let permissions = ["changing" , "removing" , "adding"]
    const permChooser = (p) =>{
        setPermArray( p => [...permArray , p])
        setClicked(true)
    }

    const collectAndSend = () =>{
        alert("sending the results")
    }
    return(
        <>
            <NavBar account={person}></NavBar>
            <div className="all_holder">
            <div className="title-holder">
                <h1>ساخت نقش</h1>
            </div>
            <form action="" className='form_column_perm' onSubmit={collectAndSend}>
                    <label htmlFor="roleName"></label>
                    <input name="roleName" type="text" placeholder="نام نقش" className="search_bar_input"/>

            <div className="perm_holder">
                {permissions.map((p , index) =>
                    <div className='permCard' onClick={(p) => permChooser(p)} style={clicked ? {backgroundColor:"green"}: null}>
                        {p}
                    </div>        
                )}
            </div>
            <button type='submit' className='btn_question'>ساخت نقش</button>
            </form>
        </div>
        </>
    )
}
export default RoleMaker