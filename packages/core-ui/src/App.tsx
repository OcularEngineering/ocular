import { lazy, Suspense } from "react"
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom"

const Dashboard = lazy(() => import("./pages/a"))

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="a/*" element={ <Dashboard />}
      />
    </>
  ),
  {
    basename: process.env.ADMIN_PATH,
  }
)

const App = () => (
    <RouterProvider router={router} />
)

export default App

