import { useEffect, useState } from "react";
import InputBox from "./input_box";
import Radio from "./radio";
import CheckBox from "./checkbox";
import RadioV2 from "./RadioV2";
import OptionsV2 from "./optionV2";
import InputBoxV2 from "./input_boxV2";

function PersonalInfo({ data_req, data_inp1, data_inp2, data_inp3, data_inp4, data_inp5, data_inp6, data_inp7, data_opt, data_check, typeErr, typeErr2, typeErr3 }) {
    const [postalCodeRes, setPostalCodeRes] = useState({})
    const [postalCode, setPostalCode] = useState('')
    const [province, setProvince] = useState('')
    const [city, setCity] = useState('')
    const [address, setAddress] = useState('')

    useEffect(() => {
        if (Object.keys(postalCodeRes).length > 0) {
            setProvince(postalCodeRes["province"] || '')
            setCity(postalCodeRes["city"] || '')
            setAddress((postalCodeRes["street1"] || '') + (postalCodeRes["street2"] || ''))
        }
    }, [postalCodeRes])

    return (
        <>
            <h2>لطفا اطلاعات خود را وارد کنید</h2>
            <div className="personal_element">
                <InputBoxV2 data_req={data_req} data={data_inp1} class_change1={"grider"} class_change2={"grider_inner"}></InputBoxV2>
                <InputBoxV2 data_req={data_req} data={data_inp6} class_change1={"grider"} class_change2={"grider_inner"} value={postalCode} valueSetter={setPostalCode} postalSetter={setPostalCodeRes} typeErr={typeErr} limit={10}></InputBoxV2>
                <InputBoxV2 data_req={data_req} data={data_inp2} class_change1={"grider"} class_change2={"grider_inner"} typeErr={typeErr} limit={11}></InputBoxV2>
                <InputBoxV2 data_req={data_req} data={data_inp3} class_change1={"grider"} class_change2={"grider_inner"} typeErr={typeErr2} limit={11}></InputBoxV2>
                <InputBoxV2 data_req={data_req} value={province} data={data_inp4} class_change1={"grider"} class_change2={"grider_inner"}></InputBoxV2>
                <RadioV2 data_req={data_req} data={data_opt} class_change1={"grider"} class_change2={"grider_inner"}></RadioV2>
                <InputBoxV2 value={city} data_req={data_req} data={data_inp5} class_change1={"grider"} class_change2={"grider_inner"}></InputBoxV2>
                <InputBoxV2 value={address} data_req={data_req} data={data_inp7} class_change1={"grider"} class_change2={"grider_inner_spec"}></InputBoxV2>
                <CheckBox data_req={data_req} data={data_check}></CheckBox>

            </div>
        </>
    )
}
export default PersonalInfo