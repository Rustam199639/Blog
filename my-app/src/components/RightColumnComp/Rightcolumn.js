import LatestBlogs from './LatestBlogs'
import PopularBlogs from './PopularBlogs'

function Rightcolumn(){
    return (
    <div className="column rightcolumn">
        <LatestBlogs />
        <PopularBlogs />
    </div>
    );
}
export default Rightcolumn;