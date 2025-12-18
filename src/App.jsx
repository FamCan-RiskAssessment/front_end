import { useState } from 'react'
import './App.css'
import RoleChanger from './role_giver'
import Login_page from './login_page'
import Login_page2 from './login_page2'
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
import UserVerify from './UserVerification'
import ModelResults from './model_res'
import OperatorUserMobile from './userMobile'
import AttentionPage from './attentionPage'
import ChooseApp from './program_choice'
import FormsPageNavid from './NavidDesign/formPageNavid'
import QuestionsNavid from './NavidDesign/questionareNavid'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login_page2></Login_page2>}></Route>
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
          <Route path='/operator/userMobile' element={<OperatorUserMobile></OperatorUserMobile>}></Route>
          <Route path='/AppChoose' element={<ChooseApp></ChooseApp>}></Route>
          <Route path='/formsNavid' element={<FormsPageNavid></FormsPageNavid>}></Route>
          <Route path='/formsNavid/new' element={<QuestionsNavid></QuestionsNavid>}></Route>


          <Route path='/operator/userVerification' element={<UserVerify></UserVerify>}></Route>
          <Route path='/DashBoard/modelsResults' element={<ModelResults></ModelResults>}></Route>
          <Route path='/' element={<AttentionPage></AttentionPage>}></Route>



          <Route path='*' element={<ErrorShower errorType={404}></ErrorShower>}></Route>
        </Routes>
      </Router>
      {/* <RoleChanger></RoleChanger> */}
      {/* <Questions></Questions> */}
    </>
  )
}

export default App
