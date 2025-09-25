import { Children } from "react";
import Navbar from "../components/navbar/Navbar";

export default function layout({children}: Readonly<{children: React.ReactNode}>){
    return (
        <main>
            <Navbar/>
            {children}
        </main>
    )
}