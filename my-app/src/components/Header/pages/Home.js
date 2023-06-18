import Leftcolumn from "../../LeftColumnComp/Leftcolumn";
import Rightcolumn from "../../RightColumnComp/Rightcolumn";
import Header2 from "../Header2";

function Home(){
        return(
        <div id="homePage">
            <Header2 />
            <Leftcolumn />
            <Rightcolumn />     
        </div>);
    
}
export default Home;