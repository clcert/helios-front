import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import ElectionResume from "./pages/Admin/ElectionResume/ElectionResume";
import VotersList from "./pages/Admin/VotersList/VotersList";
import CustodioClaves from "./pages/Admin/CustodioClaves/CustodioClaves";
import Resultados from "./pages/Admin/Results/ResultsView";
import Home from "./pages/Home/Home";
import HomeAdmin from "./pages/Admin/Home/HomeAdmin";
import AdministrationPanel from "./pages/Admin/AdministrationPanel/AdministrationPanel";
import Login from "./pages/Admin/Login/Login";
import CreateElection from "./pages/Admin/CreateElection/CreateElection";
import ViewQuestions from "./pages/Admin/CreateQuestion.js/ViewQuestions";
import Consult from "./pages/Booth/Consult/Consult";
import CustodioHome from "./pages/Admin/CustodioClaves/CustodioHome";
import Keygenerator from "./pages/Admin/CustodioClaves/Keygenerator";
import { Navigate } from "react-router-dom";
import RequireAuth from "./pages/Auth/RequireAuth";
import CreateCustodio from "./pages/Admin/CustodioClaves/CreateCustodio";
import Booth from "./pages/Booth/Booth";
import CheckSk from "./pages/Admin/CustodioClaves/CheckSk";
import DecryptProve from "./pages/Admin/CustodioClaves/DecryptProve";
import CustodioPanel from "./pages/Admin/CustodioClaves/CustodioPanel";
import Statistics from "./pages/Admin/Statistics/Statistics";
import InfoBoothView from "./pages/Booth/Panel/InfoBoothView";
import News from "./pages/News/News";
import Elections from "./pages/Elections/Elections";
import { useEffect } from "react";

function App() {
  /**
   * Inactivity function
   *
   */
  function idleTimer() {
    var t;
    window.onmousemove = resetTimer;
    window.onmousedown = resetTimer;
    window.onclick = resetTimer;
    window.onscroll = resetTimer;
    window.onkeypress = resetTimer;
    window.onload = resetTimer;

    function logout() {
      const pathName = window.location.pathname;
      if (pathName.includes("admin")) {
        localStorage.removeItem("token");
        window.location.href = "/psifos";
      }
    }

    function resetTimer() {
      clearTimeout(t);
      t = setTimeout(logout, 600000);
    }
  }
  /**
   * get token from localStorage
   * @returns {string} token
   */
  function getToken() {
    const tokenString = localStorage.getItem("token");
    return tokenString;
  }

  const token = getToken();
  const navigate = useNavigate();

  useEffect(() => {
    const pathName = window.location.pathname;
    if (pathName.includes("admin") || pathName.includes("psifos")) {
      idleTimer();
    }
    if (pathName === "/") {
      navigate("/psifos");
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/noticias" element={<News />} />
      <Route path="/elecciones" element={<Elections />} />
      <Route path="/psifos">
        {/** Route for home page */}

        {/** init route for login */}
        {token ? (
          <Route path="" element={<Navigate replace to="admin/home" />} />
        ) : (
          <Route path="" element={<Login />} />
        )}

        {/** Routes for admin page */}
        <Route path="admin">
          {token ? (
            <Route
              path="login"
              element={<Navigate replace to="/psifos/admin/home" />}
            />
          ) : (
            <Route path="login" element={<Login />} />
          )}
          <Route
            path="home"
            element={
              <RequireAuth>
                <HomeAdmin />
              </RequireAuth>
            }
          />
          <Route
            path="create-election"
            element={
              <RequireAuth>
                <CreateElection />
              </RequireAuth>
            }
          />
          <Route
            path=":shortName/create-question/"
            element={
              <RequireAuth>
                <ViewQuestions />
              </RequireAuth>
            }
          />
          <Route
            path=":shortName/panel"
            element={
              <RequireAuth>
                <AdministrationPanel />
              </RequireAuth>
            }
          />
          <Route
            path=":shortName/resumen"
            element={
              <RequireAuth>
                <ElectionResume />
              </RequireAuth>
            }
          />
          <Route
            path=":shortName/voters-list"
            element={
              <RequireAuth>
                <VotersList />
              </RequireAuth>
            }
          />
          <Route
            path=":shortName/trustee"
            element={
              <RequireAuth>
                <CustodioClaves />
              </RequireAuth>
            }
          />
          <Route
            path=":shortName/create-trustee"
            element={
              <RequireAuth>
                <CreateCustodio />
              </RequireAuth>
            }
          />
          <Route
            path=":shortName/resultado"
            element={
              <RequireAuth>
                <Resultados />
              </RequireAuth>
            }
          />
          <Route
            path=":shortName/statistics"
            element={
              <RequireAuth>
                <Statistics />
              </RequireAuth>
            }
          />
          <Route
            path=":shortName/edit-election/"
            element={
              <RequireAuth>
                <CreateElection edit={true} />
              </RequireAuth>
            }
          />
          <Route
            path=":shortName/booth"
            element={
              <RequireAuth>
                <Booth preview={true} />
              </RequireAuth>
            }
          />
        </Route>

        {/** Routes for cabina (voters) */}
        <Route path="booth">
          <Route path=":shortName" element={<Booth />} />
          <Route path="consult" element={<Consult />} />
          <Route path=":shortName/public-info" element={<InfoBoothView />} />
        </Route>

        {/** Routes for trustee */}
        <Route
          path=":shortName/trustee/:uuidTrustee/home"
          element={<CustodioHome />}
        />

        <Route
          path="trustee/panel"
          element={<CustodioPanel />}
        />

        <Route path=":shortName/trustee/home" element={<CustodioHome />} />
        <Route
          path=":shortName/trustee/:uuidTrustee/keygenerator"
          element={<Keygenerator />}
        />
        <Route
          path=":shortName/trustee/:uuidTrustee/check-sk"
          element={<CheckSk />}
        />
        <Route
          path=":shortName/trustee/:uuidTrustee/decrypt-and-prove"
          element={<DecryptProve />}
        />
      </Route>
    </Routes>
  );
}

export default App;
