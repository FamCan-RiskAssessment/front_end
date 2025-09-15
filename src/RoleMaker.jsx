import { useState , useEffect } from 'react'
import NavBar from './navBar'
import CheckBox from './checkbox';

function RoleMaker(){
    const [clicked , setClicked] = useState(false)
    const [permArray , setPermArray] = useState([])
    const [permData, setPermData] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(async () => {
        await fetch("http://192.168.1.151:8080/admin/permissions")
          .then((res) => res.json())
          .then((json) => {
            setPermData(json);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error fetching data:", err);
            setLoading(false);
          });
      }, []); // [] = run once on mount

      if (loading) return <p>Loading...</p>;

    let person = {
        name:"امیر",
        number:"09338666836"
    }
    const permissions = []
    console.log(permData.data)
    permData.data.map((p , index) => {
        permissions[index] = p.name
        // console.log(p)
    })
    const check_box_data = {
        options:permissions,
        ask:"لیست دسترسی ها"
    }


    // let permissions = ["changing" , "removing" , "adding"]
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
                <CheckBox data={check_box_data} classChange1={"checkBox_column"} classChange2={"width_and_centerer"}></CheckBox>
            </div>
            <button type='submit' className='btn_question'>ساخت نقش</button>
            </form>
        </div>
        </>
    )
}
export default RoleMaker