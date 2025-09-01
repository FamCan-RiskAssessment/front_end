import { useState } from 'react'
import './App.css'
import RoleChanger from './role_giver'
import Login_page from './login_page'
import LoginMessage from './login_message'
import Questions from './questionare'
import DashBoard from './Dashboard'
import RoleMaker from './RoleMaker'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {

  return (
    <>
    <Router>
      <Routes> 
        <Route path="/" element={<Login_page></Login_page>}></Route>
        <Route path="/otp" element={<LoginMessage></LoginMessage>}></Route>  
        <Route path='/questions' element={<Questions></Questions>}></Route>
        <Route path='/DashBoard/RandP' element={<RoleChanger></RoleChanger>}></Route>
        <Route path='/DashBoard/RoleMaker' element={<RoleMaker></RoleMaker>}></Route>
        <Route path='/DashBoard' element={<DashBoard></DashBoard>}></Route>
      </Routes>
    </Router>
        {/* <RoleChanger></RoleChanger> */}
        {/* <Questions></Questions> */}
    </>
  )
}

export default App
