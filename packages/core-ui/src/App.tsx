import { lazy } from "react"
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom"

const NotFound = lazy(() => import("./pages/404"))
const Dashboard = lazy(() => import("./pages/a"))
const IndexPage = lazy(() => import("./pages/index"))

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<IndexPage />} />
      <Route path="a/*" element={ <Dashboard />}/>
      <Route path="*" element={<NotFound />} />
    </>
  ),
  {
    basename: process.env.ADMIN_PATH,
  }
)

const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App

