import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useHotkeys } from "react-hotkeys-hook"
import { Route, Routes, useNavigate } from "react-router-dom"
// import PrivateRoute from "../components/private-route"
import SEO from "../components/seo"
import Layout from "../components/templates/layout"
import Home from "../domain/home"

const IndexPage = () => {
  const navigate = useNavigate()
  useHotkeys("g + o", () => navigate("/a/orders"))
  useHotkeys("g + p", () => navigate("/a/products"))

  return (
    // <PrivateRoute>
      <DashboardRoutes />
    // </PrivateRoute>
  )
}

const DashboardRoutes = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Layout>
        <SEO title="Autoflow" />
        <Routes>
          <Route path="home/*" element={<Home/>} />
        </Routes>
      </Layout>
    </DndProvider>
  )
}

export default IndexPage