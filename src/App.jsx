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
import RoleHierarchyTree from './users_tree'
import AdminLogin_page from './admins_login'
import ChangePass from './password_change'
import ErrorShower from './Error_page'
import SupervisorPage from './supervisor_page'
import SystemLogs from './SysLogs'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {

  return (
    <>
    <Router>
      <Routes> 
        <Route path="/" element={<Login_page></Login_page>}></Route>
        <Route path="/adminLogin" element={<AdminLogin_page></AdminLogin_page>}></Route>
        <Route path="/error" element={<ErrorShower></ErrorShower>}></Route>

        <Route path="/otp" element={<LoginMessage></LoginMessage>}></Route>
        <Route path="/forms" element={<FormsPage></FormsPage>}></Route>  
        <Route path='/forms/new' element={<Questions></Questions>}></Route>
        <Route path='/DashBoard/RandP' element={<RoleChanger></RoleChanger>}></Route>
        <Route path='/DashBoard/RoleMaker' element={<RoleMaker></RoleMaker>}></Route>
        <Route path='/DashBoard' element={<DashBoard></DashBoard>}></Route>
        <Route path='/DashBoard/patients' element={<FilterableTable></FilterableTable>}></Route>
        <Route path="/DashBoard/passChange" element={<ChangePass></ChangePass>}></Route>
        <Route path='/DashBoard/usersTree' element={<RoleHierarchyTree></RoleHierarchyTree>}></Route>
        <Route path='/DashBoard/supervisorForms' element={<SupervisorPage></SupervisorPage>}></Route>
        <Route path='/DashBoard/systemLog' element={<SystemLogs></SystemLogs>}></Route>
        <Route path='*' element={<ErrorShower errorType={404}></ErrorShower>}></Route>
      </Routes>
    </Router>
        {/* <RoleChanger></RoleChanger> */}
        {/* <Questions></Questions> */}
    </>
  )
}

export default App
