import api from "@/services/api";

export async function GetSession() {
    
    try {
        const response = await api.auth.loggedInUserDetails();

        if (response.data.user) {
            console.log("User is Logged In");
            return true;
        } else {
            console.log("User is not Logged In");
            return false;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        return false;
    }
}
