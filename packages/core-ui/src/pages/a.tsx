import { Route, Routes} from "react-router-dom"
// import PrivateRoute from "../components/private-route"
import SEO from "../components/seo"
import Layout from "../components/templates/layout"
import Home from "../domain/home"

const IndexPage = () => {
  return (
    // <PrivateRoute>
      <DashboardRoutes />
    // </PrivateRoute>
  )
}

const DashboardRoutes = () => {
  return (
      <Layout>
        <SEO title="Autoflow" />
        <Routes>
          <Route path="home" element={<Home/>} />
        </Routes>
      </Layout>
  )
}

export default IndexPage