import { useState , useEffect } from "react";
import "./supervisor.css"
import NavBar from "./navBar";
import { fetchDataGET , form_ids_finder, fetchDataPUT} from "./utils/tools";
import ToastProvider from "./toaster";
import { useToast } from "./toaster";
import { isNumber } from "./utils/tools";
import Loader from "./utils/loader";

function SupervisorPage(){
    let userPhone = localStorage.getItem("number")
    const [formInfos , setFormInfos] = useState({})
    const [OPRoleId , setOPRoleId] = useState(0)
    const [openModal , setOpenModal] = useState(false)
    const [OPArr , setOPArr] = useState([])
    const [selectedFormId , setSelectedFormId] = useState(0)
    const [changedOPId , setChangedOPId] = useState(0)
    const [page , setPage] = useState(1)
    const [loading, setLoading] = useState(true);
    const [pagiPrev , setPagiPrev] = useState(false)
    const [pagiNext , setPagiNext] = useState(false)
    const { addToast } = useToast()
  // console.log(OPRoleId)
    // console.log(formInfos)
    useEffect(() => {
        let token = localStorage.getItem("token")
        const get_forms = async () =>{
            
            let data = await fetchDataGET(`admin/form?page=${page}&pageSize=10` , token)
            console.log("this is the data : " , data)
            setPagiNext(data.data.pagination.hasNextPage)
            setPagiPrev(data.data.pagination.hasPrevPage)
            let form_ids = form_ids_finder(data.data.data)
            console.log("this is the form_ids : " , form_ids)
            setFormInfos(form_ids) 
        }
        get_forms()
        setLoading(false)
    } , [changedOPId, page])



    useEffect(() => {
        let token = localStorage.getItem("token")
        const OPRoleIdFetch = async () => {
            let fetched = await fetchDataGET("admin/role" , token)
            fetched.data.forEach(fd => {
                if(fd.name == "اپراتور"){
                    setOPRoleId(fd.id)
                }
            });
        }
        OPRoleIdFetch()
    } , [])
    const openOpers = async (form_id) => {
        setOpenModal(true)
        let token = localStorage.getItem("token")
        let fetchedOps = await fetchDataGET(`admin/role/${OPRoleId}/owners` , token)
        setOPArr(fetchedOps.data)
        console.log("this is form_id : "  , form_id)
        setSelectedFormId(form_id)
    }
    const changeTheOper = async (OA) => {
        setOpenModal(false)
        let token = localStorage.getItem("token")
        let payload = {
            operatorId:OA.id
        }
        let Opchange = await fetchDataPUT(`admin/form/${selectedFormId}/operator` , token , payload)
        setChangedOPId(OA.id)
        if(Opchange.status == 200){
        addToast({
                title: Opchange.message,
                type: 'success',
                duration: 4000
              })
        console.log(Opchange)
        }
    }

const showMore = () => {
    if(pagiNext){
        setPage(p => p + 1)
    }
}

const showPrev = () => {
    if(pagiPrev){
        setPage(p => p - 1)
    }
}

if (loading) {
    return <Loader></Loader>;
  }

return(
    <>
    <NavBar account={userPhone}></NavBar>
    <div className="total_holder_sup_form">
    <div className="table_holder lower_width total_patients_holder mob_sup_table">
    <table border="1" cellSpacing="0" cellPadding="8" dir="rtl" borderColor="#ddd">
    <thead className="sar_jadval">
        <tr>
        <th>شناسه ی فرم</th>
        <th>شناسه ی اپراتور</th>
        <th>تغییر</th>
        <th>وضعیت</th>
        </tr>
    </thead>
    <tbody>
        {Object.keys(formInfos).map((fi , index) => {
            return(
                <tr key={fi}>
                <td>{fi}</td>
                <td>{formInfos[fi].operatorId ? formInfos[fi].operatorId : "-" }</td>
                <td><button className="btn_submit mob_btn" onClick={() => openOpers(fi)}>تغییر اپراتور</button></td>
                <td>{formInfos[fi].status}</td>
                </tr>
            )
        })}

    </tbody>
    </table>
    </div>
    {openModal && (
        <div className="role_modal">
            <div className="modal_header">
            <h3>اپراتور ها</h3>
            <div className="modal_close" onClick={() => setOpenModal(false)}>✕</div>
            </div>
            <div className="roles">
            {OPArr.map((OA, index) => (
                <div 
                key={index} 
                className="role" 
                onClick={() => changeTheOper(OA)} // pass role   directly instead of e.target.value
                >
                {OA.phone}
                </div>
            ))}
            </div>
        </div>
        )}
            <div className="btn_holder_next_prev">
            <button className="btn_submit space-UD mob_btn" onClick={showMore}>صفحه ی بعدی</button>
            <button className="btn_submit space-UD mob_btn" onClick={showPrev}>صفحه ی قبلی</button>
            </div>
    </div>
    </>
)


}

export default SupervisorPage