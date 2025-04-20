import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function People() {
    return (
        <ProtectedRoute>
            <div>
                <h1>Welcome to the People Page</h1>
                <p>This is the main content of the people page.</p>
                <Footer/>
            </div>
        </ProtectedRoute>
    );
}