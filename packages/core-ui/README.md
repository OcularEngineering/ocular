pages/* - Specific Pages Within The App
const NotFound = lazy(() => import("./pages/404"))
const Dashboard = lazy(() => import("./pages/a"))
const IndexPage = lazy(() => import("./pages/index"))
const InvitePage = lazy(() => import("./pages/invite"))
const LoginPage = lazy(() => import("./pages/login"))