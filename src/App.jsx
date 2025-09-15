import { useState } from 'react'
import './App.css'
import RoleChanger from './role_giver'
import Login_page from './login_page'
import LoginMessage from './login_message'
import Questions from './questionare'
import DashBoard from './Dashboard'
import RoleMaker from './RoleMaker'
import FormsPage from './formPage'
import FilterableTable from './patient_table'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {

  return (
    <>
    <Router>
      <Routes> 
        <Route path="/" element={<Login_page></Login_page>}></Route>
        <Route path="/otp" element={<LoginMessage></LoginMessage>}></Route>
        <Route path="/forms" element={<FormsPage></FormsPage>}></Route>  
        <Route path='/forms/new' element={<Questions></Questions>}></Route>
        <Route path='/DashBoard/RandP' element={<RoleChanger></RoleChanger>}></Route>
        <Route path='/DashBoard/RoleMaker' element={<RoleMaker></RoleMaker>}></Route>
        <Route path='/DashBoard' element={<DashBoard></DashBoard>}></Route>
        <Route path='/DashBoard/patients' element={<FilterableTable></FilterableTable>}></Route>
      </Routes>
    </Router>
        {/* <RoleChanger></RoleChanger> */}
        {/* <Questions></Questions> */}
    </>
  )
}

export default App
