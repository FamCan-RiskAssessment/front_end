import './App.css'
import RoleChanger from './features/dashboard/RoleGiver'
import Login_pageV3 from './features/auth/LoginPage'
import LoginMessage from './features/auth/LoginMessage'
import Questions from './questionare'
import DashBoard from './features/dashboard/Dashboard'
import RoleMaker from './features/dashboard/RoleMaker'
import FormsListPage from './features/questionnaire/FormsListPage'
import FilterableTable from './features/patient/PatientTable'
import PatientDetail from './features/patient/PatientDetail'
import RoleHierarchyTree from './features/dashboard/UsersTree'
import AdminLogin_page from './features/auth/AdminLogin'
import ChangePass from './features/auth/PasswordChange'
import ErrorShower from './Error_page'
import SupervisorPage from './features/dashboard/SupervisorPage'
import SystemLogs from './features/dashboard/SysLogs'
import UserVerify from './features/auth/UserVerification'
import ModelResults from './features/dashboard/ModelResults'
import OperatorUserMobile from './features/auth/UserMobile'
import AttentionPage from './attentionPage'
import ChooseApp from './program_choice'
import QuestionsNavid from './NavidDesign/questionareNavid'
import LandingPage from './LandingPage/totalLand'
import ResidentRegister from './features/auth/ResidentLogin'
import FormEnd from './formEndPage'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RequireAccess from './routes/RequireAccess'
import {
  canAccessDashboard,
  canAccessDashboardRoute,
  canSetPassword,
  DASHBOARD_ROUTES,
} from './utils/permissions'

/** Wraps a dashboard page in the shared permission guard. */
const guarded = (route, element) => (
  <RequireAccess check={() => canAccessDashboardRoute(route)}>{element}</RequireAccess>
)

function App() {

  return (
    <>
      <Router>
        <Routes>

          <Route path="/" element={<LandingPage></LandingPage>}></Route>

          <Route path="/login" element={<Login_pageV3></Login_pageV3>}></Route>

          <Route path="/adminLogin" element={<AdminLogin_page></AdminLogin_page>}></Route>
          <Route path="/error" element={<ErrorShower></ErrorShower>}></Route>

          <Route path="/otp" element={<LoginMessage></LoginMessage>}></Route>
          <Route path="/forms" element={<FormsListPage variant="bahar" />}></Route>
          <Route path='/forms/new' element={<Questions></Questions>}></Route>
          <Route path='/DashBoard/RandP' element={guarded(DASHBOARD_ROUTES.RAND_P, <RoleChanger></RoleChanger>)}></Route>
          <Route path='/DashBoard/RoleMaker' element={guarded(DASHBOARD_ROUTES.ROLE_MAKER, <RoleMaker></RoleMaker>)}></Route>
          <Route path='/DashBoard' element={
            <RequireAccess check={canAccessDashboard} errorType={401}><DashBoard></DashBoard></RequireAccess>
          }></Route>
          <Route path='/DashBoard/patients' element={guarded(DASHBOARD_ROUTES.PATIENTS, <FilterableTable></FilterableTable>)}></Route>
          <Route path='/DashBoard/patients/:formId' element={guarded(DASHBOARD_ROUTES.PATIENTS, <PatientDetail></PatientDetail>)}></Route>
          <Route path="/DashBoard/passChange" element={
            <RequireAccess check={canSetPassword}><ChangePass></ChangePass></RequireAccess>
          }></Route>
          <Route path='/DashBoard/usersTree' element={<RoleHierarchyTree></RoleHierarchyTree>}></Route>
          <Route path='/DashBoard/supervisorForms' element={guarded(DASHBOARD_ROUTES.SUPERVISOR_FORMS, <SupervisorPage></SupervisorPage>)}></Route>
          <Route path='/DashBoard/systemLog' element={guarded(DASHBOARD_ROUTES.SYSTEM_LOG, <SystemLogs></SystemLogs>)}></Route>
          <Route path='/residentEnter' element={<ResidentRegister></ResidentRegister>}></Route>
          <Route path='/operator/userMobile' element={<OperatorUserMobile></OperatorUserMobile>}></Route>
          <Route path='/AppChoose' element={<ChooseApp></ChooseApp>}></Route>
          <Route path='/formsNavid' element={<FormsListPage variant="navid" />}></Route>
          <Route path='/formsNavid/new' element={<QuestionsNavid></QuestionsNavid>}></Route>
          <Route path='/formEnd' element={<FormEnd></FormEnd>}></Route>



          <Route path='/operator/userVerification' element={<UserVerify></UserVerify>}></Route>
          <Route path='/DashBoard/modelsResults' element={guarded(DASHBOARD_ROUTES.MODELS_RESULTS, <ModelResults></ModelResults>)}></Route>
          <Route path='/attention' element={<AttentionPage></AttentionPage>}></Route>



          <Route path='*' element={<ErrorShower errorType={404}></ErrorShower>}></Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
