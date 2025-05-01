
import './App.css'
import {createBrowserRouter,RouterProvider} from "react-router-dom"
import HomePage from './components/HomePage'
import VideoPage from './components/VideoPage'
import CourseQA from './components/CourseQA'
import RAGQA  from './components/Ragqa'
import QuizApp from './components/QuizApp'

function App() {
const router = createBrowserRouter([
  {
    path:"/",
    element:<HomePage/>
  },
  {
    path:"/room/:id",
    element:<VideoPage/>
  },
  {
    path: "/course-qa",         // ⬅️ NEW route
    element: <CourseQA />
  },
  {
    path: "/ragqa",         // ⬅️ NEW route
    element: <RAGQA />
  },
  {
    path: "/quiz",         // ⬅️ NEW route
    element: <QuizApp />
  }
])

  return (
    <div className='App'>
<RouterProvider router={router}/>
    </div>
  )
}

export default App