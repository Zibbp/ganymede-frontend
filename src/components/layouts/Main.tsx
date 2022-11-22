import { HeaderMenu } from "./Navbar";



export default function MainLayout({children}) {

  return (
    <>
    <HeaderMenu />
    <main>
      {children}
    </main>
    </>
  )
}