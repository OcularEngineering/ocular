import api from "@/services/api";

export async function GetSession() {
    
    try {
        const response = await api.auth.loggedInUserDetails();

        if (response.data.user) {

            return response.data.user;

        } else {

            return false;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        return false;
    }
}
