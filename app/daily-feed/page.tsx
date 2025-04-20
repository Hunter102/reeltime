import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function DailyFeed() {
    return (
        <ProtectedRoute>
            <div>
                <h1>Welcome to the DailyFeed Page</h1>
                <p>This is the main content of the daily-feed page.</p>
                <Footer/>
            </div>
        </ProtectedRoute>
    );
}