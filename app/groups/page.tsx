import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Groups() {
    return (
        <ProtectedRoute>   
            <div>
                <h1>Welcome to the Groups Page</h1>
                <p>This is the main content of the groups page.</p>
                <Footer/>
            </div>
        </ProtectedRoute>
    );
}